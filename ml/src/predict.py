"""
CLI tool for predicting laptop prices using the trained PricePoint model.
Example:
    python src/predict.py --brand Dell --type Notebook --inches 15.6 --ram 8 --storage 256 --storage-type SSD --cpu "Intel i5" --cpu-speed 2.5 --gpu Intel --os Windows --res 1920x1080 --weight 1.8
"""

import argparse
from pathlib import Path
import pandas as pd
import joblib

BASE_DIR = Path(__file__).resolve().parent.parent
MODEL_PATH = BASE_DIR / "models" / "best_model.joblib"


def parse_args():
    parser = argparse.ArgumentParser(description="Predict laptop market price in BDT")
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
    parser.add_argument("--ips", action="store_true", default=True, help="Include if panel is IPS")
    parser.add_argument("--weight", type=float, default=1.8, help="Weight in kg")
    return parser.parse_args()


def main():
    args = parse_args()

    if not MODEL_PATH.exists():
        print(f"Error: Trained model not found at {MODEL_PATH}. Run 'python src/train_and_export.py' first.")
        return

    pipeline = joblib.load(MODEL_PATH)

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

    pred = pipeline.predict(sample)[0]
    pred_bdt = max(12000, round(pred))
    pred_usd = round(pred_bdt / 120)
    pred_eur = round(pred_bdt / 128)

    print("\n" + "=" * 50)
    print(" PricePoint Valuation Result")
    print("=" * 50)
    print(f"  Configuration : {args.brand} {args.type} ({args.inches}\", {args.weight}kg)")
    print(f"  Specs         : {args.cpu} @ {args.cpu_speed}GHz, {args.ram}GB RAM, {args.storage}GB {args.storage_type}")
    print(f"  Graphics & OS : {args.gpu}, {args.os}")
    print("-" * 50)
    print(f"  Estimated Price : ৳ {pred_bdt:,} BDT  (${pred_usd:,} USD / €{pred_eur:,})")
    print(f"  Market Range    : ৳ {round(pred_bdt * 0.92):,} – ৳ {round(pred_bdt * 1.08):,} BDT")
    print("=" * 50 + "\n")


if __name__ == "__main__":
    main()
