#!/usr/bin/env python3
"""Sync rate corrections from the linked Google Sheet into the public catalog.

The correction sheet is fetched via its public CSV export. Only a matching
product whose current catalog price equals the sheet's published rate is
updated; already-applied values are no-ops and unexpected mismatches are
reported without being overwritten.
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
from openpyxl.styles import Alignment, Font, PatternFill
from openpyxl.utils import get_column_letter

SHEET_CSV_URL = (
    "https://docs.google.com/spreadsheets/d/"
    "1nynAxa9BY-9l8c1-yQHKvpldpPfa1mAw1MRMyj1yxPs/export?format=csv&gid=0"
)
CATALOG = Path("products_final.json")
WORKBOOK = Path("web-product-replacements.xlsx")
USER_AGENT = "Leopis-Rate-Correction-Sync/1.0"


def normalize(value: object) -> str:
    return re.sub(r"[^a-z0-9]", "", str(value or "").strip().lower())


def fetch_rows() -> list[list[str]]:
    request = Request(SHEET_CSV_URL, headers={"User-Agent": USER_AGENT})
    with urlopen(request, timeout=30) as response:
        return list(csv.reader(io.TextIOWrapper(response, encoding="utf-8-sig", newline="")))


def locate_headers(rows: list[list[str]]) -> tuple[int, dict[str, int]]:
    required = {"product_code": "productcode", "published_rate": "publishedrate", "new_rate": "newrate"}
    for row_number, row in enumerate(rows):
        indexes = {key: next((i for i, cell in enumerate(row) if normalize(cell) == label), None)
                   for key, label in required.items()}
        if all(index is not None for index in indexes.values()):
            return row_number, {key: int(index) for key, index in indexes.items()}
    raise ValueError("Could not find the required Product code, Published Rate, and New Rate headers.")


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
    code = re.sub(r"^\s*code\s*:\s*", "", str(value or ""), flags=re.IGNORECASE).strip()
    return code.upper()


def text_value(value: object) -> str:
    return "" if value is None else str(value)


def workbook_matches(rows: list[list[str]]) -> bool:
    if not WORKBOOK.exists():
        return False
    try:
        workbook = load_workbook(WORKBOOK, read_only=True, data_only=False)
        sheet = workbook["Sheet1"] if "Sheet1" in workbook.sheetnames else workbook.active
        actual = [
            [text_value(sheet.cell(row=r + 1, column=c + 1).value) for c in range(len(row))]
            for r, row in enumerate(rows)
        ]
        workbook.close()
        expected = [[text_value(cell) for cell in row] for row in rows]
        return actual == expected and sheet.max_row == len(rows)
    except Exception:
        return False


def write_workbook(rows: list[list[str]], header_row: int, indexes: dict[str, int]) -> bool:
    if workbook_matches(rows):
        print("Workbook already matches the sheet; leaving it unchanged.")
        return False

    workbook = Workbook()
    sheet = workbook.active
    sheet.title = "Sheet1"
    rate_columns = {indexes["published_rate"], indexes["new_rate"]}

    for r, row in enumerate(rows, start=1):
        for c, raw_value in enumerate(row, start=1):
            value = raw_value or ""
            if r - 1 > header_row and c - 1 in rate_columns:
                numeric = parse_rate(value)
                if numeric is not None:
                    sheet.cell(row=r, column=c, value=numeric)
                    continue
            cell = sheet.cell(row=r, column=c, value=value)
            # Keep arbitrary sheet text as text rather than allowing formula interpretation.
            cell.data_type = "s"

    title_font = Font(name="Arial", size=14, bold=True)
    header_font = Font(name="Arial", size=10, bold=True, color="FFFFFF")
    header_fill = PatternFill("solid", fgColor="24476B")
    for row_number, row in enumerate(rows, start=1):
        if any(normalize(value).startswith("websiteproductreplacement") for value in row if value):
            for cell in sheet[row_number]:
                cell.font = title_font
            break
    header_excel_row = header_row + 1
    for cell in sheet[header_excel_row]:
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = Alignment(vertical="center", wrap_text=True)
    if len(rows) > header_excel_row:
        sheet.freeze_panes = f"A{header_excel_row + 1}"
        sheet.auto_filter.ref = f"A{header_excel_row}:{get_column_letter(max(len(r) for r in rows))}{len(rows)}"
    for column in range(1, max(len(row) for row in rows) + 1):
        sheet.column_dimensions[get_column_letter(column)].width = 24 if column < 7 else 32
    WORKBOOK.parent.mkdir(parents=True, exist_ok=True)
    workbook.save(WORKBOOK)
    print(f"Updated {WORKBOOK} from the current corrections sheet.")
    return True


def update_catalog(rows: list[list[str]], header_row: int, indexes: dict[str, int]) -> bool:
    catalog = json.loads(CATALOG.read_text(encoding="utf-8"))
    if not isinstance(catalog, list):
        raise ValueError("products_final.json must contain a JSON array.")
    by_id = {str(product.get("id", "")).strip().upper(): product for product in catalog}
    changed = False
    seen: set[str] = set()

    for row in rows[header_row + 1 :]:
        code_index = indexes["product_code"]
        if code_index >= len(row):
            continue
        code = product_code(row[code_index])
        if not code:
            continue
        published = parse_rate(row[indexes["published_rate"]] if indexes["published_rate"] < len(row) else "")
        new_rate = parse_rate(row[indexes["new_rate"]] if indexes["new_rate"] < len(row) else "")
        if published is None or new_rate is None:
            print(f"Skipping {code}: published/new rate is blank or not a whole-number price.")
            continue
        if code in seen:
            raise ValueError(f"Duplicate correction rows found for product code {code}; no catalog write made.")
        seen.add(code)
        product = by_id.get(code)
        if product is None:
            print(f"Skipping {code}: no matching product exists in products_final.json.")
            continue
        current = parse_rate(product.get("price"))
        if current == new_rate:
            print(f"{code}: price is already {new_rate}; no change needed.")
        elif current == published:
            product["price"] = new_rate
            changed = True
            print(f"{code}: price updated from {published} to {new_rate}.")
        else:
            print(
                f"Skipping {code}: catalog price {product.get('price')!r} matches neither "
                f"published rate {published} nor new rate {new_rate}."
            )

    if changed:
        CATALOG.write_text(json.dumps(catalog, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    return changed


def main() -> int:
    try:
        rows = fetch_rows()
        header_row, indexes = locate_headers(rows)
        workbook_changed = write_workbook(rows, header_row, indexes)
        catalog_changed = update_catalog(rows, header_row, indexes)
        if not workbook_changed and not catalog_changed:
            print("No workbook or catalog changes to publish.")
        return 0
    except Exception as exc:
        print(f"ERROR: rate-correction sync failed: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
