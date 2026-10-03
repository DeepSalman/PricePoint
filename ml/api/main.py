"""
FastAPI prediction service for PricePoint.
Serves laptop price predictions from the trained GradientBoosting / Scikit-Learn pipeline.
"""

from pathlib import Path
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import joblib
import pandas as pd
import json

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "best_model.joblib"
MODELS_DIR = BASE_DIR / "models"

app = FastAPI(
    title="PricePoint API",
    description="Machine Learning service for laptop price prediction",
    version="1.0.0",
)

# Enable CORS for local web dev and GitHub Pages
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pipeline = None


def get_pipeline():
    global pipeline
    if pipeline is None:
        if not MODEL_PATH.exists():
            raise RuntimeError(f"Trained model not found at {MODEL_PATH}")
        pipeline = joblib.load(MODEL_PATH)
    return pipeline


class LaptopSpecs(BaseModel):
    brand: str = Field(default="Dell", example="Dell")
    type: str = Field(default="Notebook", example="Notebook")
    inches: float = Field(default=15.6, ge=10.0, le=21.0, example=15.6)
    touchscreen: bool = Field(default=False, example=False)
    ips: bool = Field(default=True, example=True)
    resolution_pixels: int = Field(default=1920 * 1080, example=2073600)
    cpu_brand: str = Field(default="Intel i5", example="Intel i5")
    cpu_speed_ghz: float = Field(default=2.5, ge=0.5, le=5.0, example=2.5)
    ram_gb: int = Field(default=8, ge=2, le=128, example=8)
    storage_gb: int = Field(default=256, ge=16, le=8192, example=256)
    storage_type: str = Field(default="SSD", example="SSD")
    gpu_brand: str = Field(default="Intel", example="Intel")
    os: str = Field(default="Windows", example="Windows")
    weight_kg: float = Field(default=1.8, ge=0.5, le=10.0, example=1.8)
    condition_multiplier: Optional[float] = Field(default=1.0, ge=0.5, le=1.5, example=1.0)


@app.on_event("startup")
def startup_event():
    try:
        get_pipeline()
        print("Model pipeline loaded successfully.")
    except Exception as e:
        print(f"Warning: Model could not be loaded at startup: {e}")


@app.get("/")
def read_root():
    return {
        "service": "PricePoint ML API",
        "status": "online",
        "endpoints": ["/predict", "/benchmarks", "/health"],
    }


@app.get("/health")
def health():
    return {"status": "ok", "model_loaded": MODEL_PATH.exists()}


@app.get("/benchmarks")
def get_benchmarks():
    metric_files = sorted(MODELS_DIR.glob("metrics_*.json"))
    results = []
    for f in metric_files:
        with open(f) as fp:
            results.append(json.load(fp))
    return {"benchmarks": results}


@app.post("/predict")
def predict(specs: LaptopSpecs):
    try:
        pipe = get_pipeline()
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Model unavailable: {str(e)}")

    sample = pd.DataFrame([{
        "brand": specs.brand,
        "type": specs.type,
        "inches": specs.inches,
        "touchscreen": 1 if specs.touchscreen else 0,
        "ips": 1 if specs.ips else 0,
        "resolution_pixels": specs.resolution_pixels,
        "cpu_brand": specs.cpu_brand,
        "cpu_speed_ghz": specs.cpu_speed_ghz,
        "ram_gb": specs.ram_gb,
        "storage_gb": specs.storage_gb,
        "storage_type": specs.storage_type,
        "gpu_brand": specs.gpu_brand,
        "os": specs.os,
        "weight_kg": specs.weight_kg,
    }])

    pred_raw = pipe.predict(sample)[0]
    base_bdt = max(12000, round(float(pred_raw)))
    final_bdt = round(base_bdt * (specs.condition_multiplier or 1.0))

    return {
        "price_bdt": final_bdt,
        "price_usd": round(final_bdt / 120),
        "price_eur": round(final_bdt / 128),
        "range_bdt": {
            "low": round(final_bdt * 0.92),
            "high": round(final_bdt * 1.08),
        },
        "condition_applied": specs.condition_multiplier,
    }
