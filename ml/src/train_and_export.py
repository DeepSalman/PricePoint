"""
Train and score all six regression models on the cleaned laptop dataset
(Linear Regression, Decision Tree, Random Forest, SVR, KNN, Gradient Boosting),
"""

import json
from pathlib import Path
import numpy as np
import pandas as pd
from sklearn.model_selection import KFold, cross_val_score, train_test_split
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.compose import ColumnTransformer, TransformedTargetRegressor
from sklearn.pipeline import Pipeline
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
from sklearn.linear_model import LinearRegression
from sklearn.tree import DecisionTreeRegressor
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.neighbors import KNeighborsRegressor
from sklearn.svm import SVR
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent
DATA_PATH = BASE_DIR / "data" / "laptop_price_clean.csv"
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

WEB_MODEL_DIR = BASE_DIR.parent / "web" / "src" / "model"
WEB_MODEL_DIR.mkdir(parents=True, exist_ok=True)

print(f"Loading data from {DATA_PATH}...")
df = pd.read_csv(DATA_PATH)

df["touchscreen"] = df["touchscreen"].astype(int)
df["ips"] = df["ips"].astype(int)

categorical_cols = ["brand", "type", "cpu_brand", "storage_type", "gpu_brand", "os"]
numeric_cols = [
    "inches",
    "touchscreen",
    "ips",
    "resolution_pixels",
    "cpu_speed_ghz",
    "ram_gb",
    "storage_gb",
    "weight_kg",
]

X = df[categorical_cols + numeric_cols]
y = df["price_bdt"]

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.15, random_state=42)

preprocessor = ColumnTransformer(
    transformers=[
        ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols),
        ("num", "passthrough", numeric_cols),
    ]
)

preprocessor.fit(X_train)

GB_SETTINGS = dict(
    n_estimators=120,
    max_depth=4,
    learning_rate=0.08,
    subsample=0.85,
    random_state=42,
)

cv = KFold(n_splits=5, shuffle=True, random_state=42)

def make_knn(k):
    return Pipeline([
        ("prep", preprocessor),
        ("scaler", StandardScaler()),
        ("model", KNeighborsRegressor(n_neighbors=k)),
    ])

knn_mae_by_k = {
    k: -cross_val_score(make_knn(k), X_train, y_train, cv=cv, scoring="neg_mean_absolute_error").mean()
    for k in range(1, 21)
}
best_k = min(knn_mae_by_k, key=knn_mae_by_k.get)
print(f"KNN: best k = {best_k} (CV MAE = {knn_mae_by_k[best_k]:.1f})")

models = {
    "Linear Regression": Pipeline([("prep", preprocessor), ("model", LinearRegression())]),
    "Decision Tree": Pipeline([("prep", preprocessor), ("model", DecisionTreeRegressor(random_state=42))]),
    "Random Forest": Pipeline([("prep", preprocessor), ("model", RandomForestRegressor(n_estimators=100, random_state=42))]),
    
    "SVR": TransformedTargetRegressor(
        regressor=Pipeline([("prep", preprocessor), ("scaler", StandardScaler()), ("model", SVR(C=3))]),
        func=np.log1p,
        inverse_func=np.expm1,
    ),
    "KNN": make_knn(best_k),
    "Gradient Boosting": Pipeline([("prep", preprocessor), ("model", GradientBoostingRegressor(**GB_SETTINGS))]),
}

for name, pipe in models.items():
    pipe.fit(X_train, y_train)
    preds = pipe.predict(X_test)
    test_mae = float(mean_absolute_error(y_test, preds))
    test_rmse = float(np.sqrt(mean_squared_error(y_test, preds)))
    test_r2 = float(r2_score(y_test, preds))

    # Cross-validation
    cv_mae = -cross_val_score(pipe, X, y, cv=cv, scoring="neg_mean_absolute_error")
    cv_rmse = np.sqrt(-cross_val_score(pipe, X, y, cv=cv, scoring="neg_mean_squared_error"))
    cv_r2 = cross_val_score(pipe, X, y, cv=cv, scoring="r2")

    slug = name.lower().replace(" ", "_")
    metrics = {
        "model": name,
        "test_mae": round(test_mae, 2),
        "test_rmse": round(test_rmse, 2),
        "test_r2": round(test_r2, 4),
        "cv_mae": round(float(cv_mae.mean()), 2),
        "cv_rmse": round(float(cv_rmse.mean()), 2),
        "cv_r2": round(float(cv_r2.mean()), 4),
    }
    with open(MODELS_DIR / f"metrics_{slug}.json", "w") as f:
        json.dump(metrics, f, indent=2)

    # Save full pipeline for standalone CLI / API prediction
    joblib.dump(pipe, MODELS_DIR / f"{slug}.joblib")
    print(f"Saved metrics & joblib for {name}: Test MAE = {test_mae:.1f}, R2 = {test_r2:.4f}, CV MAE = {cv_mae.mean():.1f}")

print("\nTraining final production GradientBoostingRegressor model...")
X_train_trans = preprocessor.transform(X_train)
X_test_trans = preprocessor.transform(X_test)

gbr = GradientBoostingRegressor(**GB_SETTINGS)
gbr.fit(X_train_trans, y_train)

gbr_preds = gbr.predict(X_test_trans)
gbr_mae = mean_absolute_error(y_test, gbr_preds)
gbr_rmse = np.sqrt(mean_squared_error(y_test, gbr_preds))
gbr_r2 = r2_score(y_test, gbr_preds)
print(f"GBR Performance: Test MAE = {gbr_mae:.2f} BDT, RMSE = {gbr_rmse:.2f}, R2 = {gbr_r2:.4f}")


final_pipeline = Pipeline([
    ("prep", preprocessor),
    ("model", gbr),
])
final_pipeline.fit(X, y)
joblib.dump(final_pipeline, MODELS_DIR / "best_model.joblib")
print(f"Saved full joblib pipeline to {MODELS_DIR / 'best_model.joblib'}")

trees = []
for estimator in gbr.estimators_:
    t = estimator[0].tree_
    tree_dict = {
        "f": t.feature.tolist(),
        "th": [round(float(x), 4) for x in t.threshold.tolist()],
        "l": t.children_left.tolist(),
        "r": t.children_right.tolist(),
        "v": [round(float(x[0][0]), 3) for x in t.value.tolist()],
    }
    trees.append(tree_dict)

cat_categories = {}
cat_encoder = preprocessor.named_transformers_["cat"]
for i, col in enumerate(categorical_cols):
    cat_categories[col] = cat_encoder.categories_[i].tolist()

export_payload = {
    "version": "1.0",
    "model_type": "GradientBoostingRegressor",
    "target": "price_bdt",
    "metrics": {
        "mae_bdt": round(float(gbr_mae), 2),
        "r2_score": round(float(gbr_r2), 4),
        "samples": len(df),
    },
    "init_value": round(float(gbr.init_.constant_[0][0]), 4),
    "learning_rate": round(float(gbr.learning_rate), 4),
    "categorical_features": categorical_cols,
    "numeric_features": numeric_cols,
    "categories": cat_categories,
    "trees": trees,
}

json_path = WEB_MODEL_DIR / "model_data.json"
with open(json_path, "w") as f:
    json.dump(export_payload, f, separators=(",", ":"))

print(f"Exported browser model to {json_path} (Size: {json_path.stat().st_size / 1024:.1f} KB)")
print("Done!")
