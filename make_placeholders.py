#!/usr/bin/env python3
"""Replace image paths with working placeholder URLs. No internet needed."""
import json
from pathlib import Path

INPUT  = Path("products.json")
BACKUP = Path("products_backup.json")
URL    = "https://picsum.photos/seed/{id}/600/600"

if not INPUT.exists():
    print("ERROR: products.json not found"); raise SystemExit

with INPUT.open("r", encoding="utf-8") as f:
    products = json.load(f)

if not BACKUP.exists():
    with BACKUP.open("w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)
    print("Backup ->", BACKUP)

for p in products:
    p["image"] = URL.format(id=p.get("id", "0"))

with INPUT.open("w", encoding="utf-8") as f:
    json.dump(products, f, ensure_ascii=False, indent=2)

print(f"✅ {len(products)} products updated")
print("Sample:", products[0]["image"])
