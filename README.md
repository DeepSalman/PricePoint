# PricePoint — Intelligent Laptop Market Valuation System

PricePoint is an end-to-end machine learning system and client-side web application designed to predict the fair market valuation of laptops based on hardware specifications, form factor, condition, and market generation cycles.

The project benchmarks 6 supervised regression algorithms on real-world market data, selects and tunes the optimal ensemble model (**Gradient Boosting Regressor**, $R^2 = 0.8534$, MAE = ৳ 21,433 BDT), and deploys a zero-latency, serverless in-browser inference engine via GitHub Pages.

- **Live Application:** [https://deepsalman.github.io/PricePoint/](https://deepsalman.github.io/PricePoint/)
- **Repository:** [https://github.com/DeepSalman/PricePoint](https://github.com/DeepSalman/PricePoint)
- **Project Report (PDF):** [`docs/PricePoint_Project_Report.pdf`](./docs/PricePoint_Project_Report.pdf)

---

## 1. Problem Description

Determining fair pricing for used and new laptops is challenging for consumers, enterprise IT departments, and re-commerce platforms due to:

1. **High Feature Dimensionality & Non-Linearity:** Pricing is non-linear and multiplicative. An extra 16 GB RAM or an OLED screen adds disproportionately higher value to an Apple MacBook or Dell XPS than to an entry-level plastic chassis notebook.
2. **Obsolete Linear Baselines:** Traditional heuristic rules and basic linear regression models fail to capture feature interactions (e.g., discrete GPUs paired with high-wattage gaming CPUs vs. low-power ultrabooks).
3. **Deployment Friction:** Standard ML deployments require always-on Python cloud servers (FastAPI/Docker), creating maintenance overhead, cold starts, and hosting costs.

**Project Objective:**
Build an accurate, thoroughly benchmarked machine learning pricing engine and deploy it as a high-performance, client-side web configurator capable of sub-millisecond valuations without backend hosting costs.

---

## 2. Methodology

### 2.1 Dataset & Feature Engineering
The dataset comprises **1,303 laptop listings** with raw hardware specifications and price targets:

- **Target Variable:** `price_bdt` (Bangladeshi Taka, converted from retail benchmarks at ~128 BDT/EUR).
- **Categorical Features (6):** `brand`, `type` (form factor), `cpu_brand`, `storage_type`, `gpu_brand`, `os`.
- **Numeric Features (8):** `inches`, `touchscreen` (0/1), `ips` (0/1), `resolution_pixels`, `cpu_speed_ghz`, `ram_gb`, `storage_gb`, `weight_kg`.

#### Preprocessing Steps:
1. **String Tokenization & Parsing:** Stripped units (`GB`, `kg`), extracted CPU clock speeds, normalized storage split strings (e.g., `128GB SSD + 1TB HDD` -> primary SSD capacity and drive type).
2. **Display Feature Extraction:** Parsed raw strings (e.g., `IPS Panel Retina Display 2560x1600`) into binary `ips`, `touchscreen`, and total pixel area (`resolution_pixels = width * height`).
3. **Encoding & Scaling Pipelines:** Categorical features encoded with `OneHotEncoder(handle_unknown='ignore')`. Distance-sensitive models (KNN and SVR) used `StandardScaler()`. SVR utilized a log-transformed target (`TransformedTargetRegressor(func=np.log1p)`).

### 2.2 Benchmarked Algorithms
Six distinct machine learning regression paradigms were trained and evaluated:
1. **Linear Regression (Baseline):** Ordinary least squares on one-hot features.
2. **Decision Tree Regressor:** Single CART regression tree.
3. **Random Forest Regressor:** Bagging ensemble of 100 parallel trees.
4. **Support Vector Regressor (SVR):** RBF kernel with feature scaling and log-transformed target.
5. **K-Nearest Neighbors (KNN):** Distance-weighted neighborhood regression (optimized at $k=2$).
6. **Gradient Boosting Regressor (Winning Model):** Sequential residual boosting ensemble (120 trees, max depth 4, learning rate 0.08).

### 2.3 Evaluation Protocol
- **Train/Test Split:** 85% training, 15% holdout test set (fixed seed `random_state=42`).
- **Cross-Validation:** 5-fold cross-validation evaluated across all folds.
- **Evaluation Metrics:**
  - **MAE (Mean Absolute Error):** Average monetary prediction error in BDT.
  - **RMSE (Root Mean Squared Error):** Penalty metric for large outlier errors.
  - **$R^2$ Score:** Proportion of price variance explained by the model ($0.0$ to $1.0$).

---

## 3. Results & Comparative Analysis

### Benchmark Summary

| Rank | Model Architecture | Test MAE (BDT) | Test RMSE (BDT) | 5-Fold CV MAE (BDT) | $R^2$ Score | Status / Role |
| :---: | :--- | :---: | :---: | :---: | :---: | :--- |
| **1** | **Gradient Boosting Regressor** | **৳ 21,433** | **৳ 36,153** | **৳ 22,738** | **0.8534** | **Active Production Model** |
| 2 | Random Forest Regressor | ৳ 23,022 | ৳ 39,431 | ৳ 22,695 | 0.8259 | Strong Ensemble Candidate |
| 3 | Support Vector Regressor (SVR) | ৳ 22,027 | ৳ 38,574 | ৳ 23,600 | 0.8334 | Scaled Kernel Model |
| 4 | K-Nearest Neighbors (KNN, $k=2$) | ৳ 28,185 | ৳ 46,268 | ৳ 28,738 | 0.7594 | Instance-Based Baseline |
| 5 | Decision Tree Regressor | ৳ 30,412 | ৳ 55,876 | ৳ 29,513 | 0.6490 | High-Variance Baseline |
| 6 | Linear Regression | ৳ 41,016 | ৳ 55,885 | ৳ 40,040 | 0.6489 | Linear Baseline |

### Analysis: Why Gradient Boosting Outperformed Other Models
1. **Sequential Error Correction:** Unlike Random Forest which builds independent trees simultaneously, Gradient Boosting grows shallow decision trees sequentially. Each subsequent tree specifically fits to the residuals (errors) of the previous stage.
2. **Multiplicative Feature Handling:** Tree boosting naturally captures complex non-linear combinations (e.g., Apple branding paired with Retina displays and unified RAM) without requiring manual interaction engineering.
3. **Residual Variance:** Gradient Boosting explains over **85.3% of the total price variance** with the lowest overall mean absolute deviation on unseen laptops.

---

## 4. Implementation Details

```
PricePoint/
├── docs/                      # Production deployment build (GitHub Pages)
│   ├── index.html             # Responsive off-white client-side UI
│   ├── PricePoint_Project_Report.pdf # Comprehensive Project Report PDF
│   └── src/
│       ├── app.js             # Application state, presets, and domain logic
│       ├── index.css          # Minimalist responsive design tokens
│       └── model/
│           ├── model_data.json # Serialized Gradient Boosting tree ensemble
│           ├── predictor.js   # Zero-dependency JavaScript tree traversal engine
│           └── laptop_knowledge.js # Real-world brand lineups, silicon & GPU metadata
├── ml/
│   ├── data/                  # Raw and preprocessed CSV datasets
│   ├── models/                # Saved metrics JSONs & serialized joblib models
│   ├── notebooks/             # Numbered, fully executed Jupyter research notebooks
│   │   ├── 01_preprocessing.ipynb
│   │   ├── 02_linear_regression.ipynb
│   │   ├── 03_decision_tree.ipynb
│   │   ├── 04_random_forest.ipynb
│   │   ├── 05_svr.ipynb
│   │   ├── 06_knn.ipynb
│   │   ├── 07_gradient_boosting.ipynb
│   │   ├── 08_compare_models.ipynb
│   │   ├── 09_tune_gradient_boosting.ipynb
│   │   └── 10_error_analysis.ipynb
│   └── src/
│       ├── train_and_export.py # Automated training, evaluation & JSON export
│       └── predict.py          # Unified CLI prediction tool (--all support)
└── web/                       # Source development frontend
```

### 4.1 Zero-Dependency Browser Inference
Rather than hosting an expensive Python server, the trained scikit-learn Gradient Boosting ensemble is exported into a lightweight JSON tree structure (`web/src/model/model_data.json`, ~79 KB).

The in-browser JavaScript engine (`predictor.js`):
- One-hot encodes user specs on the fly in the exact feature ordering expected by the model.
- Traverses 120 binary decision trees iteratively (`O(depth × trees)`).
- Produces instantaneous predictions (< 1ms) with zero network latency.

### 4.2 CLI Prediction Tool
Verify individual models or run all 6 algorithms side by side on identical hardware:

```bash
# Compare all 6 models on a sample laptop
python3 ml/src/predict.py --all

# Single model prediction
python3 ml/src/predict.py --model gradient_boosting --brand Apple --ram 16 --storage 512
```

---

## 5. Getting Started

### Local Setup (Python Environment)
```bash
cd ml
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Run full model pipeline and export JSON
python3 src/train_and_export.py
```

### Local Setup (Web Application)
No server runtime is required. Run any standard static file server:
```bash
cd web
python3 -m http.server 8000
# Open http://localhost:8000 in your browser
```

---

## 6. Authors & Contribution
- **Salman (@DeepSalman):** System Architecture, Frontend Development, Client-Side Inference Engine, Gradient Boosting Tuning, Deployment.
- **Teammates:** Notebook modules and model benchmarks (`Mehedi`: Linear Regression, `Maruf`: Decision Tree, `Jannat`: KNN & Gradient Boosting experiments).
