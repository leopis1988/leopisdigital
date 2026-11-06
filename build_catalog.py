#!/usr/bin/env python3
"""Merge all product sources into catalog.json + warranty + new/trending flags."""

import json
from pathlib import Path
import pandas as pd

# ═══════════════════════════════════════════════════════════
#  SOURCES — list every product file (XL or JSON)
#  LAST file  = "New Arrivals"
#  SECOND-TO-LAST = "Trending" (first 12 items)
# ═══════════════════════════════════════════════════════════
SOURCES = [
    "fochant_catalog_1320_priced_commission.xlsx",
    "Products_with_Profit (2).xlsx",
    "new_products_900.xlsx",           # ← your new 900-product file
]

OUT     = Path("catalog.json")
CACHE   = Path("catalog_version.txt")
TRENDING_COUNT = 12

# ── Warranty rules per category ────────────────────────────
WARRANTY = {
    "Home Appliances":       ("3 Months", "Service Warranty", "Covers motor, heating elements and manufacturing defects."),
    "Electronics & Gadgets": ("1 Month",  "Service Warranty", "Covers manufacturing defects. Keep the invoice for claims."),
    "Audio & Smartwatches":  ("1 Month",  "Service Warranty", "Covers battery, display and internal electronics."),
    "Chargers & Cables":     ("7 Days",   "Replacement",      "Defective cables replaced free on arrival."),
    "Lighting & Solar":      ("1 Month",  "Service Warranty", "LED chips and solar panels covered."),
    "Health & Beauty":       ("1 Month",  "Service Warranty", "Motor, battery and heating elements covered."),
    "Tools & Hardware":      ("1 Month",  "Service Warranty", "Mechanical parts covered."),
    "Kitchen & Dining":      ("7 Days",   "Quality Check",    "Free replacement if damaged on arrival."),
    "Home & Storage":        ("7 Days",   "Quality Check",    "Free replacement if damaged on arrival."),
    "Bathroom & Laundry":    ("7 Days",   "Quality Check",    "Free replacement if damaged on arrival."),
    "Cleaning":              ("7 Days",   "Quality Check",    "Free replacement if damaged on arrival."),
    "Car & Bike":            ("7 Days",   "Quality Check",    "Free replacement if damaged on arrival."),
    "Fitness & Sports":      ("7 Days",   "Quality Check",    "Free replacement if damaged on arrival."),
    "Kids & Toys":           ("7 Days",   "Replacement",      "Defective toys replaced free."),
    "Fashion & Travel":      ("7 Days",   "Quality Check",    "Free replacement if damaged on arrival."),
    "Bags & Accessories":    ("7 Days",   "Quality Check",    "Free replacement if damaged on arrival."),
    "Eyewear":               ("7 Days",   "Quality Check",    "Free replacement if damaged on arrival."),
    "Party & Stationery":    ("7 Days",   "Quality Check",    "Free replacement if damaged on arrival."),
}
DEFAULT_WARRANTY = ("7 Days", "Quality Check", "Free replacement if damaged on arrival.")


def normalise_row(row):
    def get(*keys):
        for k in keys:
            if k in row and str(row[k]).strip() not in ("", "nan", "None"):
                return row[k]
        return ""

    pid  = str(get("id", "Product Code", "product_code", "SKU")).strip()
    name = str(get("name", "Product Name", "product_name")).strip()
    cat  = str(get("category", "Category", "Cat")).strip() or "Uncategorised"

    raw = str(get("price", "Final Rate (LKR)", "Final Rate", "final_price", "Rate"))
    raw = raw.replace(",", "").replace("Rs.", "").replace("LKR", "").strip()
    try:
        price = int(float(raw)) if raw else 0
    except Exception:
        price = 0

    img  = str(get("image", "Product Image", "image_url", "Image")).strip()
    desc = str(get("description", "Description", "Desc")).strip()

    if not pid or not name or price <= 0:
        return None
    if not img.startswith("http"):
        img = ""

    w = WARRANTY.get(cat, DEFAULT_WARRANTY)
    return {
        "id": pid, "name": name, "category": cat, "price": price,
        "image": img, "description": desc,
        "warranty": {"period": w[0], "type": w[1], "text": w[2]},
        "flag": "regular",
    }


def load_source(path):
    p = Path(path)
    if not p.exists():
        print(f"   ⚠️  SKIP (not found): {path}")
        return []
    if p.suffix.lower() == ".xlsx":
        return pd.read_excel(p).fillna("").to_dict("records")
    if p.suffix.lower() == ".json":
        return json.loads(p.read_text(encoding="utf-8"))
    print(f"   ⚠️  SKIP (unknown type): {path}")
    return []


# ═══ LOAD + MERGE ═══
seen, order, per_source = {}, [], {}

for src in SOURCES:
    print(f"\n📥 {src}")
    rows, added = load_source(src), 0
    for row in rows:
        prod = normalise_row(row)
        if not prod:
            continue
        if prod["id"] not in seen:
            order.append(prod["id"])
        seen[prod["id"]] = prod
        added += 1
    per_source[src] = added
    print(f"   ✓ {added:,} usable")

# ═══ FLAGS ═══
existing = [s for s in SOURCES if per_source.get(s, 0) > 0]

if existing:
    newest = existing[-1]
    for row in load_source(newest):
        pid = str(row.get("id", row.get("Product Code", ""))).strip()
        if pid in seen:
            seen[pid]["flag"] = "new"

if len(existing) >= 2:
    prev, count = existing[-2], 0
    for row in load_source(prev):
        pid = str(row.get("id", row.get("Product Code", ""))).strip()
        if pid in seen and seen[pid]["flag"] == "regular":
            seen[pid]["flag"] = "trending"
            count += 1
            if count >= TRENDING_COUNT:
                break

# ═══ WRITE ═══
products = [seen[i] for i in order]
OUT.write_text(json.dumps(products, ensure_ascii=False, indent=2), encoding="utf-8")
CACHE.write_text(str(int(pd.Timestamp.now().timestamp())))

# ═══ REPORT ═══
cats, wsplit = {}, {}
for p in products:
    cats[p["category"]]             = cats.get(p["category"], 0) + 1
    wsplit[p["warranty"]["period"]] = wsplit.get(p["warranty"]["period"], 0) + 1

n_new   = sum(1 for p in products if p["flag"] == "new")
n_trend = sum(1 for p in products if p["flag"] == "trending")

print("\n" + "═" * 60)
print(f" ✅  CATALOG BUILT — {len(products):,} TOTAL PRODUCTS")
print("═" * 60)
print(f"   🆕 New Arrivals : {n_new:,}")
print(f"   🔥 Trending     : {n_trend:,}")
print(f"   📦 Regular      : {len(products) - n_new - n_trend:,}")
print(f"\n   Categories ({len(cats)}):")
for c, n in sorted(cats.items(), key=lambda x: -x[1]):
    print(f"     {c:<30} {n:>5}")
print(f"\n   Warranty split:")
for w, n in sorted(wsplit.items()):
    print(f"     🛡 {w:<12} {n:>5}")
print(f"\n   Per source:")
for f, n in per_source.items():
    print(f"     {f:<50} {n:>5}")
print("═" * 60)
