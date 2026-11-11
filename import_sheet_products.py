#!/usr/bin/env python3
"""Import Ready products from the public Google Sheet CSV export."""
from __future__ import annotations

import csv
import io
import json
import re
import sys
import zipfile
from datetime import datetime, timezone
from pathlib import Path
from urllib.request import Request, urlopen
from urllib.parse import parse_qs, urlparse

SHEET_CSV_URL = (
    "https://docs.google.com/spreadsheets/d/"
    "1WEaZ1eCtRI3FzvDWwYMhFHRczco8r62nXycqm4gv9Zg/export?format=csv&gid=0"
)
CATALOG = Path("products_final.json")
IMAGE_DIR = Path("images/sheet")
REMOVED_PRODUCT_IDS = Path("removed_product_ids.json")
# Product IDs intentionally withheld from the public catalog, even if the Sheet row remains Ready.
EXCLUDED_PRODUCT_IDS = {
    "45-LACE-COTTON-SAREES",
    "45-DTF-BEADED-SAREES",
    "45-SUPER-VOILE-SAREE",
    "45-DTF-SAREES",
    "45-RENDA-SAREE",
}


def norm(value: str) -> str:
    return re.sub(r"[^a-z0-9]", "", (value or "").strip().lower())


CANONICAL_CATEGORIES = [
    "Kitchen & Dining", "Health & Beauty", "Home & Storage", "Kids & Toys",
    "Tools & Hardware", "Eyewear", "Cleaning", "Car & Bike", "Bags & Accessories",
    "Lighting & Solar", "Bathroom & Laundry", "Chargers & Cables", "Audio & Smartwatches",
    "Home Appliances", "Electronics & Gadgets", "Party & Stationery", "Clothing & Footwear",
    "Fashion & Travel", "Groceries & Herbal", "Fitness & Sports", "Phone Accessories",
    "Jewellery", "Pet Supplies",
]
CATEGORY_ALIASES = {norm(category): category for category in CANONICAL_CATEGORIES}
for alias, category in [
    ("Commercial Tools & Hardware", "Tools & Hardware"),
    ("Electrical supplies", "Lighting & Solar"),
    ("Kitchen / home appliance", "Cleaning"),
    ("Kitchen Gadgets / Home Appliances", "Home Appliances"),
    ("vehicle Accessories / motorbike accessories", "Car & Bike"),
    ("BAby need /", "Kids & Toys"),
    ("Hardware /", "Tools & Hardware"),
    ("Home & Living / Home Appliances Accessories", "Home Appliances"),
    ("Personal Care / Beauty Gadgets", "Health & Beauty"),
    ("Audio / smart watch", "Audio & Smartwatches"),
    ("Beauty / fashion", "Health & Beauty"),
    ("fashion / beauty", "Health & Beauty"),
    ("kids / baby", "Kids & Toys"),
    ("ladies / fashion", "Clothing & Footwear"),
    ("outdoor / home appliance", "Lighting & Solar"),
    ("Power bank", "Phone Accessories"),
    ("Power banks", "Phone Accessories"),
    ("Rack", "Home & Storage"),
    ("Racks", "Home & Storage"),
]:
    CATEGORY_ALIASES[norm(alias)] = category


def normalize_category(value: str) -> str:
    label = (value or "").strip()
    return CATEGORY_ALIASES.get(norm(label), label or "General")


def first_index(headers: list[str], names: set[str]) -> int | None:
    for i, header in enumerate(headers):
        if norm(header) in names:
            return i
    return None


def cell(row: list[str], index: int | None) -> str:
    return row[index].strip() if index is not None and index < len(row) else ""


def normalize_availability(value: str) -> str:
    key = norm(value)
    return {
        "instock": "in_stock",
        "available": "in_stock",
        "outofstock": "out_of_stock",
        "soldout": "out_of_stock",
        "unavailable": "out_of_stock",
        "preorder": "pre_order",
        "backorder": "back_order",
        "limitedavailability": "limited_availability",
    }.get(key, "")


def parse_price(value: str) -> int | None:
    digits = re.sub(r"[^0-9]", "", value or "")
    return int(digits) if digits else None


def parse_merchant(value: str, product_id: str = "", warranty: str = "", image: str = "") -> str:
    """Map explicit merchant labels and known product-code/source patterns."""
    text = (value or "").strip().lower()
    match = re.search(r"merchant\s*([1-5])", text)
    if match:
        return match.group(1)

    code = str(product_id or "").strip().upper()
    normalized_text = re.sub(r"[^a-z0-9]", "", text)
    normalized_warranty = re.sub(r"[^a-z0-9]", "", (warranty or "").lower())
    source = f"{text} {(image or '').lower()}"
    normalized_source = re.sub(r"[^a-z0-9]", "", source)

    if re.fullmatch(r"100\d{3,}", code):
        return "1"
    if code.startswith("P0") or re.match(r"^PO\d", code) or re.search(r"\bp[0o]\s*series\b", text):
        return "2"
    if "p0series" in normalized_text or "poseries" in normalized_text:
        return "2"
    if "fochant" in normalized_source or "forchant" in normalized_source or "checkingwarranty" in normalized_warranty:
        return "3"
    return "5"


def normalize_image_url(value: str) -> str:
    """Convert common Google Drive viewing links into direct image links."""
    value = (value or "").strip()
    match = re.search(r"/file/d/([^/]+)", value)
    if match and "drive.google.com" in value:
        return f"https://drive.google.com/uc?export=view&id={match.group(1)}"
    query_id = parse_qs(urlparse(value).query).get("id", [""])[0]
    if query_id and "drive.google.com" in value and "/drive/folders/" not in value:
        return f"https://drive.google.com/uc?export=view&id={query_id}"
    return value


def removed_product_ids() -> set[str]:
    """Load exact product IDs removed through the editable Excel control workbook."""
    if not REMOVED_PRODUCT_IDS.exists():
        return set()
    values = json.loads(REMOVED_PRODUCT_IDS.read_text(encoding="utf-8"))
    if not isinstance(values, list):
        raise ValueError("removed_product_ids.json must contain a JSON array")
    return {str(value).strip().upper() for value in values if str(value).strip()}


def fetch_csv() -> list[list[str]]:
    request = Request(SHEET_CSV_URL, headers={"User-Agent": "Leopis-Sheet-Importer/1.0"})
    with urlopen(request, timeout=30) as response:
        return list(csv.reader(io.TextIOWrapper(response, encoding="utf-8-sig", newline="")))


def supported_image_type(content: bytes) -> str | None:
    """Detect the supported image formats from file signatures, not HTTP labels."""
    if content.startswith(b"\xff\xd8\xff"):
        return "image/jpeg"
    if content.startswith(b"\x89PNG\r\n\x1a\n"):
        return "image/png"
    if content.startswith((b"GIF87a", b"GIF89a")):
        return "image/gif"
    if len(content) >= 12 and content[:4] == b"RIFF" and content[8:12] == b"WEBP":
        return "image/webp"
    return None


def image_from_zip(archive_bytes: bytes) -> tuple[bytes, str] | None:
    """Select main_image.* (or the first supported image) without extracting archive paths."""
    try:
        with zipfile.ZipFile(io.BytesIO(archive_bytes)) as archive:
            members = [
                member for member in archive.infolist()
                if not member.is_dir() and 0 < member.file_size <= 20_000_000
            ]
            members.sort(key=lambda member: (
                0 if Path(member.filename).name.casefold().startswith("main_image") else 1,
                member.filename.casefold(),
            ))
            for member in members:
                content = archive.read(member)
                content_type = supported_image_type(content)
                if content_type:
                    return content, content_type
    except (zipfile.BadZipFile, OSError, RuntimeError):
        return None
    return None


def download_sheet_image(product_id: str, image_url: str) -> str:
    """Download a Sheet image into the site so browsers do not depend on hotlinks."""
    request = Request(image_url, headers={"User-Agent": "Leopis-Sheet-Importer/1.0"})
    with urlopen(request, timeout=45) as response:
        content = response.read()
        content_type = (response.headers.get_content_type() or "").lower()
    detected_type = supported_image_type(content)
    if detected_type:
        content_type = detected_type
    elif content.startswith(b"PK\x03\x04"):
        extracted = image_from_zip(content)
        if extracted:
            content, content_type = extracted
        else:
            raise ValueError("ZIP file did not contain a supported main image")
    else:
        raise ValueError(f"image URL did not return a supported image ({content_type or 'unknown type'})")
    extension = {"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif"}[content_type]
    IMAGE_DIR.mkdir(parents=True, exist_ok=True)
    output = IMAGE_DIR / f"{re.sub(r'[^A-Za-z0-9_-]', '_', product_id)}{extension}"
    output.write_bytes(content)
    return output.as_posix()


def make_product(row: list[str], indexes: dict[str, int | None]) -> tuple[dict, str | None]:
    product_id = cell(row, indexes["id"])
    if product_id.upper() in {value.upper() for value in EXCLUDED_PRODUCT_IDS | removed_product_ids()}:
        return {}, None
    name = cell(row, indexes["name"])
    price = parse_price(cell(row, indexes["price"]))
    image = normalize_image_url(cell(row, indexes["image"]))
    category = normalize_category(cell(row, indexes["category"]))
    description = cell(row, indexes["description"])
    warranty = cell(row, indexes["warranty"])
    brand = cell(row, indexes.get("brand"))
    gtin = cell(row, indexes.get("gtin"))
    mpn = cell(row, indexes.get("mpn"))
    raw_availability = cell(row, indexes.get("availability"))
    merchant = parse_merchant(cell(row, indexes["merchant"]), product_id, warranty, image)
    status = norm(cell(row, indexes["status"]))

    if status not in {"ready", "publish", "published"}:
        return {}, None
    missing = [label for label, value in (("product number", product_id), ("name", name), ("price", price), ("image URL", image), ("description", description)) if not value]
    if missing:
        return {}, f"{product_id or '[no ID]'}: missing {', '.join(missing)}"
    if not re.match(r"^https?://", image) or "/drive/folders/" in image:
        return {}, f"{product_id}: image must be an individual http(s) image URL, not a folder link"
    availability = normalize_availability(raw_availability) if raw_availability else ""
    if raw_availability and not availability:
        return {}, f"{product_id}: unsupported availability value {raw_availability!r}"

    try:
        local_image = download_sheet_image(product_id, image)
    except Exception as exc:
        return {}, f"{product_id}: could not download image ({exc})"

    product = {
        "id": product_id,
        "name": name,
        "category": category,
        "price": price,
        "image": local_image,
        "description": description,
        "warranty": warranty or "No warranty",
        "merchant": merchant,
        "badge": "New",
    }
    for key, value in (("brand", brand), ("gtin", gtin), ("mpn", mpn), ("availability", availability)):
        if value:
            product[key] = value
    return product, None


def main() -> int:
    rows = fetch_csv()
    header_row = next((i for i, row in enumerate(rows) if any(norm(x) == "productnumber" for x in row)), None)
    if header_row is None:
        print("ERROR: could not find the product number header", file=sys.stderr)
        return 1
    headers = rows[header_row]
    indexes = {
        "image": first_index(headers, {"productimage", "image", "imageurl", "productimageurl"}),
        "price": first_index(headers, {"productrate", "price", "sellingprice"}),
        "name": first_index(headers, {"productname", "name"}),
        "id": first_index(headers, {"productnumber", "productid", "id", "sku"}),
        "description": first_index(headers, {"description", "details", "productdescription"}),
        "warranty": first_index(headers, {"warranty", "replacement"}),
        "merchant": first_index(headers, {"merchant", "merchants", "seller", "supplier"}),
        "category": first_index(headers, {"category", "categary", "catogary"}),
        "brand": first_index(headers, {"brand", "brandname", "productbrand", "manufacturer", "maker"}),
        "gtin": first_index(headers, {"gtin", "barcode", "ean", "upc", "eanupc"}),
        "mpn": first_index(headers, {"mpn", "manufacturerpartnumber", "partnumber"}),
        "availability": first_index(headers, {"availability", "stockstatus", "stock"}),
        "status": first_index(headers, {"status", "publish", "ready"}),
    }
    required = ["image", "price", "name", "id", "description", "category", "status"]
    missing_headers = [key for key in required if indexes[key] is None]
    if missing_headers:
        print("ERROR: missing sheet columns: " + ", ".join(missing_headers), file=sys.stderr)
        return 1

    ready: dict[str, dict] = {}
    errors: list[str] = []
    for row in rows[header_row + 1 :]:
        product, error = make_product(row, indexes)
        if error:
            errors.append(error)
        elif product:
            ready[product["id"]] = product

    if errors:
        print("Skipped invalid Ready rows:")
        print("\n".join(f"- {error}" for error in errors))
    if not ready:
        print("No valid Ready products found; catalog unchanged.")
        return 0

    data = json.loads(CATALOG.read_text(encoding="utf-8"))
    by_id = {str(product.get("id")): i for i, product in enumerate(data)}
    added, replaced = [], []
    for product_id, product in ready.items():
        if product_id in by_id:
            previous = data[by_id[product_id]]
            if previous.get("addedAt"):
                product["addedAt"] = previous["addedAt"]
            data[by_id[product_id]] = product
            replaced.append(product_id)
        else:
            product["addedAt"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
            data.insert(0, product)
            by_id = {str(item.get("id")): i for i, item in enumerate(data)}
            added.append(product_id)

    CATALOG.write_text(json.dumps(data, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"Imported {len(ready)} Ready product(s); replaced={replaced}, added={added}; catalog_count={len(data)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
