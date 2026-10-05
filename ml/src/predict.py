
import argparse
from pathlib import Path
import pandas as pd
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

MODELS = {
    "linear_regression": "Linear Regression",
    "decision_tree": "Decision Tree",
    "random_forest": "Random Forest",
    "svr": "SVR",
    "knn": "KNN",
    "gradient_boosting": "Gradient Boosting",
}
DEFAULT_MODEL = "gradient_boosting"   # the model the website uses


def parse_args():
    parser = argparse.ArgumentParser(description="Predict laptop market price in BDT")
    parser.add_argument("--model", default=DEFAULT_MODEL, choices=list(MODELS),
                        help="Which algorithm to use (default: gradient_boosting)")
    parser.add_argument("--all", action="store_true", help="Show the prediction of all 6 models side by side")
    parser.add_argument("--brand", default="Dell", help="Laptop brand (e.g. Dell, Apple, HP, Lenovo)")
    parser.add_argument("--type", default="Notebook", help="Laptop type (e.g. Notebook, Ultrabook, Gaming)")
    parser.add_argument("--inches", type=float, default=15.6, help="Screen size in inches")
    parser.add_argument("--ram", type=int, default=8, help="RAM in GB (e.g. 8, 16, 32)")
    parser.add_argument("--storage", type=int, default=256, help="Storage capacity in GB (e.g. 256, 512, 1024)")
    parser.add_argument("--storage-type", default="SSD", choices=["SSD", "HDD", "Hybrid", "Other"], help="Storage technology")
    parser.add_argument("--cpu", default="Intel i5", help="CPU tier (e.g. Intel i3, Intel i5, Intel i7, AMD)")
    parser.add_argument("--cpu-speed", type=float, default=2.5, help="CPU clock speed in GHz")
    parser.add_argument("--gpu", default="Intel", help="GPU vendor (Intel, Nvidia, AMD, Other)")
    parser.add_argument("--os", default="Windows", help="Operating system (Windows, Mac, Linux, Chrome OS, No OS)")
    parser.add_argument("--res", default="1920x1080", help="Screen resolution (e.g. 1920x1080)")
    parser.add_argument("--touchscreen", action="store_true", help="Include if laptop has touchscreen")
    parser.add_argument("--ips", action=argparse.BooleanOptionalAction, default=True,
                        help="IPS panel (on by default; use --no-ips to turn it off)")
    parser.add_argument("--weight", type=float, default=1.8, help="Weight in kg")
    return parser.parse_args()


def load_model(slug):
    """Load one saved model, or return None if its file does not exist."""
    path = MODELS_DIR / f"{slug}.joblib"
    if not path.exists() and slug == DEFAULT_MODEL:
        path = MODELS_DIR / "best_model.joblib"      # older runs only saved this one
    return joblib.load(path) if path.exists() else None


def predict_bdt(model, sample):
    return max(12000, round(float(model.predict(sample)[0])))


def main():
    args = parse_args()

    # Parse resolution
    parts = args.res.lower().split("x")
    pixels = int(parts[0]) * int(parts[1]) if len(parts) == 2 else 1920 * 1080

    sample = pd.DataFrame([{
        "brand": args.brand,
        "type": args.type,
        "inches": args.inches,
        "touchscreen": 1 if args.touchscreen else 0,
        "ips": 1 if args.ips else 0,
        "resolution_pixels": pixels,
        "cpu_brand": args.cpu,
        "cpu_speed_ghz": args.cpu_speed,
        "ram_gb": args.ram,
        "storage_gb": args.storage,
        "storage_type": args.storage_type,
        "gpu_brand": args.gpu,
        "os": args.os,
        "weight_kg": args.weight,
    }])

    # the model for the main result
    model = load_model(args.model)
    if model is None:
        print(f"Error: model '{args.model}' not found in {MODELS_DIR}. Run 'python src/train_and_export.py' first.")
        return

    pred_bdt = predict_bdt(model, sample)
    pred_usd = round(pred_bdt / 120)
    pred_eur = round(pred_bdt / 128)

    print("\n" + "=" * 50)
    print(" PricePoint Valuation Result")
    print("=" * 50)
    print(f"  Configuration : {args.brand} {args.type} ({args.inches}\", {args.weight}kg)")
    print(f"  Specs         : {args.cpu} @ {args.cpu_speed}GHz, {args.ram}GB RAM, {args.storage}GB {args.storage_type}")
    print(f"  Graphics & OS : {args.gpu}, {args.os}")
    print(f"  Model         : {MODELS[args.model]}")
    print("-" * 50)
    print(f"  Estimated Price : ৳ {pred_bdt:,} BDT  (${pred_usd:,} USD / €{pred_eur:,})")
    print(f"  Market Range    : ৳ {round(pred_bdt * 0.92):,} – ৳ {round(pred_bdt * 1.08):,} BDT")
    print("=" * 50)

    # all six models side by side
    if args.all:
        print("\n  All models on the same laptop:")
        print("  " + "-" * 40)
        prices = []
        for slug, name in MODELS.items():
            other = load_model(slug)
            if other is None:
                print(f"  {name:<20} (not trained yet)")
                continue
            price = predict_bdt(other, sample)
            prices.append(price)
            marker = "  <- used above" if slug == args.model else ""
            print(f"  {name:<20} ৳ {price:>9,}{marker}")
        if len(prices) > 1:
            print("  " + "-" * 40)
            print(f"  {'Lowest / highest':<20} ৳ {min(prices):,} / ৳ {max(prices):,}")
    print()


if __name__ == "__main__":
    main()
