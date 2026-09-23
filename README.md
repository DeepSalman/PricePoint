# PricePoint

Predict the market price of a used laptop from its specs (brand, processor, RAM, storage, GPU, screen size, age, condition).

## Architecture

Three parts:

```
web/     React frontend — user enters specs, sees estimated price (you build this)
server/  Node.js (Express) backend — API gateway/proxy, serves the React app (you build this)
ml/      Python — data prep, 4 models (Linear Regression, Decision Tree,
                                    Random Forest, SVR), evaluation (MAE/RMSE/R²),
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

## Status

- [ ] Scaffold (done)
- [ ] Data prep
- [ ] Train & compare 4 models (MAE / RMSE / R²)
- [ ] Pick best model, tune, save artifact
- [ ] FastAPI prediction endpoint
- [ ] Node server proxy
- [ ] React UI