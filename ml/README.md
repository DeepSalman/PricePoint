# ml — Machine Learning Engineering & Model Services

This directory contains the complete data science pipeline, benchmarked research notebooks, model artifacts, and inference services for **PricePoint**.

---

## Directory Structure

```
ml/
├── data/                  # Cleaned and raw datasets
│   ├── laptop_price.csv          # Raw scraped laptop listings (1,303 rows)
│   └── laptop_price_clean.csv    # Preprocessed dataset with engineered features
├── models/                # Serialized model pipelines and benchmark metric JSONs
│   ├── best_model.joblib         # Production Gradient Boosting pipeline
│   ├── gradient_boosting.joblib
│   ├── random_forest.joblib
│   ├── svr.joblib
│   ├── knn.joblib
│   ├── decision_tree.joblib
│   ├── linear_regression.joblib
│   ├── metrics_*.json            # Evaluated test & CV MAE/RMSE/R² metrics
│   └── best_gb_params.json       # Hyperparameter grid search results
├── notebooks/             # Numbered, fully executed reproducible research notebooks
│   ├── 01_preprocessing.ipynb          # Data cleaning & feature extraction
│   ├── 02_linear_regression.ipynb      # Linear regression baseline
│   ├── 03_decision_tree.ipynb          # Decision tree regression
│   ├── 04_random_forest.ipynb          # Random forest bagging ensemble
│   ├── 05_svr.ipynb                    # SVR with StandardScaler & log target
│   ├── 06_knn.ipynb                    # KNN with optimal k=2 tuning
│   ├── 07_gradient_boosting.ipynb      # Gradient Boosting ensemble
│   ├── 08_compare_models.ipynb         # Comparative cross-validation benchmark
│   ├── 09_tune_gradient_boosting.ipynb # Grid search hyperparameter tuning
│   └── 10_error_analysis.ipynb         # Residuals & pricing outlier analysis
├── src/                   # Python production modules
│   ├── train_and_export.py             # Trains all 6 models & exports browser JSON
│   ├── predict.py                      # Multi-model CLI evaluation utility
│   └── generate_report_pdf.py          # Builds formal PDF project report
├── api/                   # FastAPI microservice
│   └── main.py                         # REST API endpoint (/predict, /models)
└── requirements.txt       # Python dependencies
```

---

## Quickstart

### 1. Train and Export All Models
```bash
python3 src/train_and_export.py
```
Trains all 6 regression pipelines, saves `.joblib` models and metric JSONs to `models/`, and exports `web/src/model/model_data.json` for client-side execution.

### 2. Multi-Model CLI Valuation
```bash
# Compare all 6 algorithms on a single configuration
python3 src/predict.py --all

# Single algorithm inference
python3 src/predict.py --model gradient_boosting --brand Apple --ram 16 --storage 512
```

### 3. FastAPI Service (Optional Backend Serving)
```bash
uvicorn api.main:app --reload --port 8000
```
Interactive API documentation available at `http://localhost:8000/docs`.