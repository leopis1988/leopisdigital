#!/usr/bin/env python3
"""
Leopis Digital-க்கான தயாரிப்பு படங்களை தானாக இணைக்கும் ஸ்கிரிப்ட்.
products.json-ஐ படித்து, ஒவ்வொரு தயாரிப்புக்கும் image URL தேடி மீண்டும் எழுதும்.

நிறுவல்:  pip install -U ddgs
இயக்க:   python fetch_images.py
சோதனை:   LIMIT = 10 என மாற்றி முதல் 10 தயாரிப்புகளை மட்டும் சோதிக்கலாம்.
"""
import json
import sys
import time
from pathlib import Path

try:
    from ddgs import DDGS
except ImportError:
    print("தேவையான package இல்லை. இயக்கவும்:  pip install -U ddgs")
    sys.exit(1)

INPUT      = Path("products.json")
BACKUP     = Path("products_backup.json")
FAILED     = Path("failed_ids.txt")
DELAY      = 0.6          # ஒவ்வொரு தேடலுக்கும் இடையே உள்ள நேரம் (வினாடிகள்)
LIMIT      = None         # சோதனைக்கு உதாரணமாக 10 என அமைக்கலாம்
SAVE_EVERY = 25

IMG_EXTS = (".jpg", ".jpeg", ".png", ".webp", ".gif", ".bmp", ".avif")


def search_image(query: str):
    """query-க்கு நேரடி image URL திருப்பித் தரும், இல்லையெனில் None."""
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(query, max_results=5))
    except Exception as e:
        print(f"         [தேடல் பிழை] {e}")
        return None

    # அறியப்பட்ட image extension-உடன் முடியும் URL-களுக்கு முன்னுரிமை
    for r in results:
        url = (r.get("image") or "").strip()
        if not url.startswith("http"):
            continue
        path = url.split("?")[0].split("#")[0].lower()
        if path.endswith(IMG_EXTS):
            return url

    # fallback: ஏதேனும் http image URL
    for r in results:
        url = (r.get("image") or "").strip()
        if url.startswith("http"):
            return url

    return None


def main():
    if not INPUT.exists():
        print(f"பிழை: {INPUT} கிடைக்கவில்லை {Path.cwd()}-ல்")
        sys.exit(1)

    with INPUT.open("r", encoding="utf-8") as f:
        products = json.load(f)

    # ஒருமுறை மட்டும் backup (ஏற்கனவே இருந்தால் மேலெழுதாது)
    if not BACKUP.exists():
        with BACKUP.open("w", encoding="utf-8") as f:
            json.dump(products, f, ensure_ascii=False, indent=2)
        print(f"Backup சேமிக்கப்பட்டது  -> {BACKUP}")

    todo = products if LIMIT is None else products[:LIMIT]
    total = len(todo)
    linked = skipped = failed = 0
    failed_ids = []

    print(f"\n{total} தயாரிப்புகள் செயலாக்கப்படுகின்றன (delay={DELAY}s)...\n")

    for i, p in enumerate(todo, 1):
        name    = (p.get("name")  or "").strip()
        current = (p.get("image") or "").strip()

        if not name:
            skipped += 1
            continue

        # ஏற்கனவே web URL-ஆக இணைக்கப்பட்டிருந்தால் தவிர்
        if current.startswith("http"):
            print(f"[{i}/{total}] ஏற்கனவே இணைக்கப்பட்டது  {name[:55]}")
            linked += 1
            continue

        print(f"[{i}/{total}] தேடுகிறது  {name[:55]}")
        url = search_image(f"{name} product") or search_image(name)

        if url:
            p["image"] = url
            linked += 1
            print(f"         -> {url[:90]}")
        else:
            failed += 1
            failed_ids.append(p.get("id", "?"))
            print(f"         XX படம் கிடைக்கவில்லை")

        if i % SAVE_EVERY == 0:
            with INPUT.open("w", encoding="utf-8") as f:
                json.dump(products, f, ensure_ascii=False, indent=2)
            print(f"         [முன்னேற்றம் {i}-இல் சேமிக்கப்பட்டது]")

        time.sleep(DELAY)

    # இறுதி சேமிப்பு
    with INPUT.open("w", encoding="utf-8") as f:
        json.dump(products, f, ensure_ascii=False, indent=2)

    if failed_ids:
        FAILED.write_text("\n".join(failed_ids), encoding="utf-8")
        print(f"\nதோல்வியடைந்த ID-கள் -> {FAILED}")

    print("\n=== முடிந்தது ===")
    print(f"  இணைக்கப்பட்டது : {linked}")
    print(f"  தவிர்க்கப்பட்டது : {skipped}")
    print(f"  தோல்வி           : {failed}")
    print(f"  கோப்பு           : {INPUT.resolve()}")


if __name__ == "__main__":
    main()
