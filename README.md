# PricePoint

Predict the market price of a used laptop from its specs (brand, processor, RAM, storage, GPU, screen size, age, condition).

## Architecture

Three parts:

```
web/     React frontend — user enters specs, sees estimated price (you build this)
server/  Node.js (Express) backend — API gateway/proxy, serves the React app (you build this)
ml/      Python — data prep, 6 models (Linear Regression, Decision Tree,
                                    Random Forest, SVR,KNN,Gradient Boosting), evaluation (MAE/RMSE/R²),
                                    and a FastAPI prediction service the Node server calls
```

Request flow:

```
React (web)  ->  Node/Express (server)  ->  FastAPI (ml/api)  ->  trained model (ml/models)
```

## Getting started (ML side)

```bash
cd ml
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

python src/preprocess.py   # clean data, feature engineering, save cleaned CSV
python src/train.py        # train 4 models, evaluate, save best model
python src/predict.py --specs "..."  # CLI smoke test
uvicorn api.main:app --reload          # serve /predict endpooint for Node/React
```

1. Project scaffold — folder layout (src/, models/, notebooks/ or scripts), requirements.txt, .gitignore, delete nullPublish.
2. Data prep — parse the raw text fields into features: brand, RAM (GB), storage (GB + type), CPU gen/cores, GPU brand/existence, screen size + resolution, weight, OS. Convert euros → BDT (approx rate). ⚠️ Note: this public dataset has no age or condition — your spec lists those. That's the gap your "scrape local BD sites" fallback covers.
3. Models — train Linear Regression, Decision Tree, Random Forest, SVR with proper encoding + scaling, evaluated via cross-validated MAE / RMSE / R².
4. Select & tune the best model (probably Random Forest or SVR).
5. Prediction tool — CLI (python predict.py "Ryzen 5, 16GB, 512GB SSD, ...") and optionally a tiny web UI (Streamlit/Flask).
6. (Later / optional) scrape local BD listings (e.g. Bikroy, Facebook Marketplace) to get age/condition/BD prices.
