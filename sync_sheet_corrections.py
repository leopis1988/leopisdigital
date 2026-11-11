#!/usr/bin/env python3
"""Apply product edits and stock actions from web-product-replacements.xlsx.

The workbook is an input file, not a disposable export. It is bootstrapped from
its public Google Sheet only if missing, then preserved so committed Excel edits
can be applied by GitHub Actions.
"""
from __future__ import annotations

import csv
import io
import json
import re
import sys
from decimal import Decimal, InvalidOperation
from pathlib import Path
from urllib.request import Request, urlopen

from openpyxl import Workbook, load_workbook
from openpyxl.comments import Comment
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.worksheet.datavalidation import DataValidation
from openpyxl.utils import get_column_letter

from import_sheet_products import download_sheet_image, normalize_category, normalize_image_url

SHEET_CSV_URL = (
    "https://docs.google.com/spreadsheets/d/"
    "1nynAxa9BY-9l8c1-yQHKvpldpPfa1mAw1MRMyj1yxPs/export?format=csv&gid=0"
)
CATALOG = Path("products_final.json")
WORKBOOK = Path("web-product-replacements.xlsx")
REMOVED_IDS = Path("removed_product_ids.json")
IMAGE_OVERRIDES = Path("product_image_overrides.json")
USER_AGENT = "Leopis-Product-Workbook-Sync/2.0"

HEADER_ALIASES = {
    "product_name": {"productname", "name"},
    "product_code": {"productcode", "productnumber", "productid", "sku", "code"},
    "published_rate": {"publishedrate", "publishedprice", "oldrate"},
    "new_rate": {"newrate", "newprice", "updatedrate"},
    "new_image": {"ifnewimage", "newimage", "newimageurl", "updatedimage", "updatedimageurl"},
    "remark": {"remark", "remarks", "notes"},
    "action": {"action", "productaction", "stockaction", "availability", "stockstatus"},
    "new_name": {"newproductname", "updatedproductname"},
    "new_category": {"newcategory", "updatedcategory"},
    "new_description": {"newdescription", "updateddescription", "newproductdescription"},
    "new_warranty": {"newwarranty", "updatedwarranty"},
}
REQUIRED_HEADERS = {"product_name", "product_code"}
OPTIONAL_WORKBOOK_COLUMNS = [
    ("Action", "action"),
    ("New Product Name", "new_name"),
    ("New Category", "new_category"),
    ("New Description", "new_description"),
    ("New Warranty", "new_warranty"),
]


def normalize(value: object) -> str:
    return re.sub(r"[^a-z0-9]", "", str(value or "").strip().lower())


def fetch_rows() -> list[list[str]]:
    request = Request(SHEET_CSV_URL, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=30) as response:
        return list(csv.reader(io.TextIOWrapper(response, encoding="utf-8-sig", newline="")))


def locate_headers(rows: list[list[object]]) -> tuple[int, dict[str, int]]:
    for row_number, row in enumerate(rows):
        indexes: dict[str, int] = {}
        for key, aliases in HEADER_ALIASES.items():
            for index, value in enumerate(row):
                if normalize(value) in aliases:
                    indexes[key] = index
                    break
        if REQUIRED_HEADERS.issubset(indexes):
            return row_number, indexes
    raise ValueError("Could not find Product name and Product code headers in the Excel workbook.")


def parse_rate(value: object) -> int | None:
    text = str(value or "").strip()
    if not text:
        return None
    cleaned = re.sub(r"[^0-9.\-]", "", text)
    try:
        number = Decimal(cleaned)
    except InvalidOperation:
        return None
    if not number.is_finite() or number < 0 or number != number.to_integral_value():
        return None
    return int(number)


def product_code(value: object) -> str:
    code = re.sub(r"^\s*code\s*:?\s*", "", str(value or ""), flags=re.IGNORECASE).strip()
    return code.upper()


def tokens(value: object) -> set[str]:
    return set(re.findall(r"[a-z0-9]+", str(value or "").casefold())) - {"code"}


def removed_id_for_code(code: str, removed: set[str]) -> str | None:
    exact = code.strip().upper()
    if exact in removed:
        return exact
    code_tokens = tokens(code)
    if len(code_tokens) < 2:
        return None
    matches = [product_id for product_id in removed if code_tokens <= tokens(product_id)]
    return matches[0] if len(matches) == 1 else None


def find_product(
    catalog: list[dict], by_id: dict[str, dict], code: str, name: str,
    published: int | None, new_rate: int | None,
) -> tuple[dict | None, bool]:
    exact = by_id.get(code)
    if exact is not None:
        return exact, False

    code_tokens = tokens(code)
    name_tokens = tokens(name)
    if len(code_tokens) < 2 or len(name_tokens) < 2:
        return None, False

    expected_rates = {rate for rate in (published, new_rate) if rate is not None}
    candidates = []
    for item in catalog:
        item_id_tokens = tokens(item.get("id"))
        item_name_tokens = tokens(item.get("name"))
        current = parse_rate(item.get("price"))
        if (
            code_tokens <= item_id_tokens
            and name_tokens <= item_name_tokens
            and (not expected_rates or current in expected_rates)
        ):
            candidates.append(item)
    if len(candidates) == 1:
        return candidates[0], True
    return None, False


def action_kind(value: object) -> str:
    key = normalize(value)
    if key in {"", "keep", "active", "available", "in stock", "instock", "nochange"}:
        return "keep"
    if key in {"outofstock", "outofstockremove", "remove", "removefromsite", "removeproduct", "soldout", "unavailable", "delete"}:
        return "remove"
    if key in {"restock", "restore", "backinstock", "reinstate", "publishagain"}:
        return "restock"
    raise ValueError(f"Unsupported Action {value!r}; use Keep, Out of stock - remove, or Restock.")


def bootstrap_workbook() -> bool:
    """Create the Excel input only if absent; never overwrite a user's workbook."""
    if WORKBOOK.exists():
        return False
    rows = fetch_rows()
    header_row, indexes = locate_headers(rows)
    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Products"
    max_columns = max(max((len(row) for row in rows), default=0), max(indexes.values(), default=-1) + 1)
    for r, row in enumerate(rows, start=1):
        for c in range(1, max_columns + 1):
            value = row[c - 1] if c <= len(row) else ""
            if c - 1 in {indexes.get("published_rate"), indexes.get("new_rate")} and r - 1 > header_row:
                rate = parse_rate(value)
                if rate is not None:
                    sheet.cell(row=r, column=c, value=rate)
                    continue
            sheet.cell(row=r, column=c, value=str(value or ""))
    sheet.freeze_panes = f"A{header_row + 2}"
    workbook.save(WORKBOOK)
    workbook.close()
    print(f"Created {WORKBOOK} from its public Google Sheet because the workbook was missing.")
    return True


def prepare_workbook() -> bool:
    bootstrap_workbook()
    workbook = load_workbook(WORKBOOK)
    sheet = workbook["Products"] if "Products" in workbook.sheetnames else workbook.active
    values = [[sheet.cell(row=r, column=c).value for c in range(1, sheet.max_column + 1)] for r in range(1, sheet.max_row + 1)]
    header_row, indexes = locate_headers(values)
    changed = False
    if sheet.title != "Products" and "Products" not in workbook.sheetnames:
        sheet.title = "Products"
        changed = True

    for header, key in OPTIONAL_WORKBOOK_COLUMNS:
        if key not in indexes:
            column = sheet.max_column + 1
            cell = sheet.cell(row=header_row + 1, column=column, value=header)
            cell.font = Font(name="Arial", size=10, bold=True, color="FFFFFF")
            cell.fill = PatternFill("solid", fgColor="24476B")
            cell.alignment = Alignment(vertical="center", wrap_text=True)
            indexes[key] = column - 1
            changed = True

    action_column = indexes["action"] + 1
    validation = DataValidation(
        type="list", formula1='"Keep,Out of stock - remove,Restock"', allow_blank=True
    )
    validation.error = "Choose Keep, Out of stock - remove, or Restock."
    validation.errorTitle = "Choose a listed action"
    validation.prompt = "Select Out of stock - remove to hide this product from the site."
    validation.promptTitle = "Product action"
    validation.showErrorMessage = True
    validation.showInputMessage = True
    if not any(getattr(item, "sqref", None) and f"{get_column_letter(action_column)}{header_row + 2}" in str(item.sqref) for item in sheet.data_validations.dataValidation):
        validation.add(f"{get_column_letter(action_column)}{header_row + 2}:{get_column_letter(action_column)}5000")
        sheet.add_data_validation(validation)
        changed = True

    comments = {
        "action": "Choose Keep, Out of stock - remove, or Restock. A removal is remembered so the Google Sheet importer does not re-add the product.",
        "new_image": "Optional: paste an image URL (Google Drive file links are supported). The image is downloaded into the website and applied to this product.",
        "new_name": "Optional: leave blank to keep the current name.",
        "new_category": "Optional: leave blank to keep the current category.",
        "new_description": "Optional: leave blank to keep the current description.",
        "new_warranty": "Optional: leave blank to keep the current warranty.",
    }
    for key, text in comments.items():
        if key in indexes:
            cell = sheet.cell(row=header_row + 1, column=indexes[key] + 1)
            if cell.comment is None or cell.comment.text != text:
                cell.comment = Comment(text, "Leopis Digital")
                changed = True

    for column in indexes.values():
        letter = get_column_letter(column + 1)
        if sheet.column_dimensions[letter].width is None or sheet.column_dimensions[letter].width < 22:
            sheet.column_dimensions[letter].width = 26 if column != indexes.get("new_description") else 42
            changed = True
    if sheet.auto_filter.ref:
        last_column = get_column_letter(max(indexes.values()) + 1)
        first_data_row = header_row + 1
        sheet.auto_filter.ref = f"A{first_data_row}:{last_column}{sheet.max_row}"
    if "Instructions" not in workbook.sheetnames:
        instructions = workbook.create_sheet("Instructions")
        instructions.append(["Edit this workbook, then upload/replace web-product-replacements.xlsx in the GitHub repository."])
        instructions.append(["GitHub Actions checks the workbook every 15 minutes and also runs when this workbook is pushed to main."])
        instructions.append(["Product code plus name identify the item. Leave optional New fields blank to keep their current values."])
        instructions.append(["For a price change, enter the previous live price in Published Rate and the desired price in New Rate."])
        instructions.append(["For a photo change, paste the new individual image URL into if new image. Supported Google Drive file links are downloaded into the site."])
        instructions.append(["For stock removal, choose Out of stock - remove in Action. The item is removed from the site and stays hidden on future imports."])
        instructions.append(["To publish again, enter the exact product code and choose Restock. If its Google product row is Ready, it is restored on the next import."])
        instructions.column_dimensions["A"].width = 125
        for row in instructions.iter_rows():
            row[0].alignment = Alignment(wrap_text=True, vertical="top")
        changed = True

    if changed:
        workbook.save(WORKBOOK)
        print("Prepared editable Action, image, product-detail, and instruction fields in the Excel workbook.")
    workbook.close()
    return changed


def read_workbook_rows() -> tuple[list[list[object]], int, dict[str, int]]:
    workbook = load_workbook(WORKBOOK, read_only=True, data_only=True)
    sheet = workbook["Products"] if "Products" in workbook.sheetnames else workbook["Sheet1"] if "Sheet1" in workbook.sheetnames else workbook.active
    rows = [list(row) for row in sheet.iter_rows(values_only=True)]
    workbook.close()
    header_row, indexes = locate_headers(rows)
    return rows, header_row, indexes


def load_removed_ids() -> set[str]:
    if not REMOVED_IDS.exists():
        return set()
    values = json.loads(REMOVED_IDS.read_text(encoding="utf-8"))
    if not isinstance(values, list):
        raise ValueError("removed_product_ids.json must contain a JSON array.")
    return {str(value).strip().upper() for value in values if str(value).strip()}


def save_removed_ids(values: set[str]) -> None:
    REMOVED_IDS.write_text(json.dumps(sorted(values), ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def load_image_overrides() -> dict[str, dict[str, str]]:
    if not IMAGE_OVERRIDES.exists():
        return {}
    value = json.loads(IMAGE_OVERRIDES.read_text(encoding="utf-8"))
    if not isinstance(value, dict):
        raise ValueError("product_image_overrides.json must contain a JSON object.")
    return value


def apply_rows(rows: list[list[object]], header_row: int, indexes: dict[str, int], actions_only: bool = False) -> bool:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    if not isinstance(catalog, list):
        raise ValueError("products_final.json must contain a JSON array.")
    by_id = {str(product.get("id", "")).strip().upper(): product for product in catalog}
    removed = load_removed_ids()
    image_overrides = load_image_overrides()
    changed = False
    removed_catalog_ids: set[str] = set()
    seen_codes: set[str] = set()
    seen_products: set[str] = set()

    for row in rows[header_row + 1 :]:
        raw_code = row[indexes["product_code"]] if indexes["product_code"] < len(row) else ""
        code = product_code(raw_code)
        if not code:
            continue
        raw_name = row[indexes["product_name"]] if indexes["product_name"] < len(row) else ""
        name = str(raw_name or "").strip()
        published = parse_rate(row[indexes["published_rate"]] if indexes.get("published_rate", 10**9) < len(row) else None)
        new_rate = parse_rate(row[indexes["new_rate"]] if indexes.get("new_rate", 10**9) < len(row) else None)
        raw_action = row[indexes["action"]] if indexes.get("action", 10**9) < len(row) else ""
        action = action_kind(raw_action)
        raw_image = row[indexes["new_image"]] if indexes.get("new_image", 10**9) < len(row) else ""
        image_value = str(raw_image or "").strip()
        image_url = normalize_image_url(image_value) if re.match(r"^https?://", image_value, re.I) else ""
        optional_new_values = {
            key: str(row[index] or "").strip() if index < len(row) else ""
            for key, index in indexes.items()
            if key in {"new_name", "new_category", "new_description", "new_warranty"}
        }

        if code in seen_codes:
            raise ValueError(f"Duplicate Excel rows found for product code {code}; no catalog write made.")
        seen_codes.add(code)

        exact_id = code.upper()
        if action == "restock":
            hidden_id = removed_id_for_code(code, removed)
            if hidden_id:
                removed.discard(hidden_id)
                changed = True
                print(f"{code}: removed {hidden_id} from the hidden-products list; the next Ready import can restore it.")
            elif exact_id not in by_id:
                print(f"{code}: not currently hidden; no restock action needed.")
            if actions_only:
                continue

        product, used_fallback = find_product(catalog, by_id, code, name, published, new_rate)
        if product is None:
            hidden_id = removed_id_for_code(code, removed) if action == "remove" else None
            if hidden_id:
                print(f"{code}: {hidden_id} is already removed from the website; keeping it suppressed.")
                continue
            if action == "remove" and exact_id not in by_id:
                # The workbook code is required to be the exact catalog ID for safe removal.
                raise ValueError(f"Cannot safely remove {code}: product is not in the catalog; use its exact product ID.")
            if action == "remove" and not actions_only:
                raise ValueError(f"Cannot safely remove {code}: no unique catalog match.")
            if action != "restock":
                print(f"Skipping {code!r} ({name!r}): no unique catalog match passed the product-code/name/rate checks.")
            continue

        product_id = str(product.get("id", "")).strip().upper()
        if product_id in seen_products:
            raise ValueError(f"Duplicate Excel rows resolve to product {product_id}; no changes from this workbook are safe.")
        seen_products.add(product_id)
        match_note = f" (matched {product_id} by code/name/rate)" if used_fallback else ""

        if action == "remove":
            if product_id not in removed:
                removed.add(product_id)
                changed = True
            removed_catalog_ids.add(product_id)
            print(f"{code}{match_note}: marked out of stock and removed from the website.")
            continue

        if actions_only:
            continue

        current = parse_rate(product.get("price"))
        if new_rate is not None:
            if current == new_rate:
                pass
            elif published is not None and current == published:
                product["price"] = new_rate
                changed = True
                print(f"{code}{match_note}: price updated from {published} to {new_rate}.")
            else:
                print(f"{code}{match_note}: price skipped because catalog price {product.get('price')!r} matches neither published rate {published!r} nor new rate {new_rate}.")

        updates = {
            "name": optional_new_values.get("new_name", ""),
            "category": normalize_category(optional_new_values.get("new_category", "")) if optional_new_values.get("new_category") else "",
            "description": optional_new_values.get("new_description", ""),
            "warranty": optional_new_values.get("new_warranty", ""),
        }
        for key, value in updates.items():
            if value and product.get(key) != value:
                product[key] = value
                changed = True
                print(f"{code}{match_note}: updated {key}.")

        if image_value and not image_url and normalize(image_value) not in {"alreadypublished", "none", "nochange", "na", "notapplicable"}:
            print(f"{code}{match_note}: image not changed because the cell is not an http(s) image URL.")
        elif image_url:
            previous = image_overrides.get(product_id, {})
            local_path = str(previous.get("path", ""))
            if previous.get("url") != image_url or not Path(local_path).is_file():
                try:
                    local_path = download_sheet_image(product_id, image_url)
                except Exception as exc:
                    print(f"{code}{match_note}: image not changed because it could not be downloaded ({exc}).")
                    local_path = ""
                if local_path:
                    image_overrides[product_id] = {"url": image_url, "path": local_path}
                    changed = True
            if local_path and product.get("image") != local_path:
                product["image"] = local_path
                changed = True
                print(f"{code}{match_note}: product image updated.")

    if removed_catalog_ids:
        before = len(catalog)
        catalog[:] = [p for p in catalog if str(p.get("id", "")).strip().upper() not in removed_catalog_ids]
        if len(catalog) != before:
            changed = True

    if changed:
        CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    save_removed_ids(removed)
    IMAGE_OVERRIDES.write_text(json.dumps(image_overrides, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    return changed


def main() -> int:
    try:
        prepare_workbook()
        rows, header_row, indexes = read_workbook_rows()
        actions_only = "--prepare" in sys.argv[1:]
        changed = apply_rows(rows, header_row, indexes, actions_only=actions_only)
        if not changed:
            print("No Excel product changes to apply.")
        return 0
    except Exception as exc:
        print(f"ERROR: product workbook sync failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
