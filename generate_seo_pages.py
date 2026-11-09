#!/usr/bin/env python3
"""Generate crawlable product/category pages and a sitemap from products_final.json."""
from __future__ import annotations

import html
import json
import math
import re
import unicodedata
import xml.etree.ElementTree as ET
from decimal import Decimal, InvalidOperation
from pathlib import Path
from urllib.parse import quote, urljoin, urlencode

ROOT = "https://leopisdigital.com"
ROOT_DIR = Path(__file__).resolve().parent
CATALOG_PATH = ROOT_DIR / "products_final.json"
INDEX_PATH = ROOT_DIR / "index.html"
PRODUCTS_DIR = ROOT_DIR / "products"
CATEGORIES_DIR = ROOT_DIR / "categories"
SITEMAP_PATH = ROOT_DIR / "sitemap.xml"
CATEGORY_LINKS_BEGIN = "<!-- SEO_CATEGORY_LINKS_BEGIN -->"
CATEGORY_LINKS_END = "<!-- SEO_CATEGORY_LINKS_END -->"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
PLACEHOLDERS = {
    "", "no description", "no description available", "n/a", "na", "none",
    "null", "not available", "description not available", "details not available",
}
REVIEW_REQUIRED_CATEGORY_TERMS = ("health", "sexual")

PAGE_CSS = """
:root{color-scheme:light;--ink:#151b2c;--muted:#5d6575;--brand:#111827;--accent:#f6c928;--line:#e4e8ef;--soft:#f6f8fb}
*{box-sizing:border-box}body{margin:0;background:#fff;color:var(--ink);font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:#174ea6}a:hover{text-decoration-thickness:2px}.wrap{max-width:1080px;margin:auto;padding:1rem 1.2rem 3rem}
.site-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;border-bottom:1px solid var(--line);padding:.7rem 1.2rem;max-width:1080px;margin:auto}
.site-head img{width:auto;height:48px;max-width:190px;object-fit:contain}.site-head a{font-weight:700}.crumbs{font-size:.9rem;color:var(--muted);margin:1.1rem 0}.crumbs a{color:inherit}
.product{display:grid;grid-template-columns:minmax(240px,440px) 1fr;gap:2rem;align-items:start}.product-image{width:100%;aspect-ratio:1;object-fit:contain;background:var(--soft);border:1px solid var(--line);border-radius:14px}
.product h1{font-size:clamp(1.7rem,4vw,2.6rem);line-height:1.15;margin:.2rem 0 .8rem}.category{color:var(--muted);font-weight:650}.price{font-size:1.8rem;font-weight:800;margin:.7rem 0}.old-price{font-size:1rem;color:#727987;font-weight:500;margin-left:.4rem}.code,.warranty{font-size:.9rem;color:var(--muted)}.description{white-space:pre-line}.notice{background:#fff8dc;border-left:4px solid var(--accent);padding:.75rem 1rem;border-radius:5px}
.actions{display:flex;flex-wrap:wrap;gap:.7rem;margin:1.2rem 0}.button{display:inline-block;text-decoration:none;padding:.7rem 1rem;border-radius:9px;background:var(--brand);color:#fff;font-weight:750}.button.secondary{background:#e8f7ee;color:#155b34}.store-info,.category-intro{border-top:1px solid var(--line);margin-top:2rem;padding-top:1rem;color:#384052}
.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:1rem;margin-top:1.3rem}.product-card{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:white;color:inherit;text-decoration:none}.product-card img{width:100%;aspect-ratio:1;object-fit:contain;background:var(--soft);display:block}.product-card-body{padding:.7rem}.product-card h2{font-size:1rem;line-height:1.35;margin:.1rem 0 .35rem}.product-card .small{color:var(--muted);font-size:.86rem}.footer{border-top:1px solid var(--line);margin-top:2rem;padding-top:1rem;color:var(--muted);font-size:.9rem}
@media(max-width:680px){.product{grid-template-columns:1fr;gap:1rem}.site-head{align-items:flex-start}.site-head img{height:40px}}
"""


def clean_text(value: object) -> str:
    text = html.unescape(str(value or ""))
    text = re.sub(r"<\s*br\s*/?\s*>", "\n", text, flags=re.I)
    text = re.sub(r"<[^>]*>", " ", text)
    return text.strip()


def one_line(value: object) -> str:
    return re.sub(r"\s+", " ", clean_text(value)).strip()


def slugify(value: object) -> str:
    text = unicodedata.normalize("NFKD", str(value or ""))
    text = "".join(ch for ch in text if not unicodedata.combining(ch))
    text = text.replace("&", " and ").lower()
    slug = re.sub(r"[^a-z0-9]+", "-", text).strip("-")
    return slug or "item"


def product_slug(product: dict) -> str:
    name_part = slugify(product.get("name"))[:72].rstrip("-") or "product"
    return f"{name_part}--{slugify(product.get('id'))}"


def category_slug(category: str) -> str:
    return slugify(category)


def usable_description(product: dict) -> str:
    description = one_line(product.get("description", ""))
    if description.casefold() in PLACEHOLDERS:
        return ""
    return description


def price_value(product: dict) -> Decimal:
    try:
        value = Decimal(str(product.get("price", "")))
    except (InvalidOperation, ValueError):
        raise ValueError(f"Product {product.get('id')} has an invalid price")
    if not value.is_finite() or value <= 0:
        raise ValueError(f"Product {product.get('id')} has an invalid price")
    return value


def price_text(value: Decimal) -> str:
    return f"{value:,.2f}".rstrip("0").rstrip(".") if value % 1 else f"{value:,.0f}"


def price_schema(value: Decimal) -> str:
    return format(value.normalize(), "f")


def truncate(text: str, limit: int) -> str:
    text = one_line(text)
    if len(text) <= limit:
        return text
    cut = text.rfind(" ", 0, limit - 1)
    if cut < max(24, limit // 2):
        cut = limit - 1
    return text[:cut].rstrip(" ,;:-") + "…"


def image_url(product: dict) -> str:
    value = str(product.get("image") or "").strip()
    if not value:
        return ""
    if value.startswith("//"):
        value = "https:" + value
    elif not re.match(r"^https?://", value, re.I):
        value = urljoin(ROOT + "/", value.lstrip("/"))
    return quote(value, safe=":/?&=#%+-_.~")


def is_indexable(product: dict) -> bool:
    category = one_line(product.get("category", "")).casefold()
    review_required = any(term in category for term in REVIEW_REQUIRED_CATEGORY_TERMS)
    return bool(usable_description(product)) and not review_required


def product_title(product: dict) -> str:
    suffix = " | Leopis Digital Sri Lanka"
    return truncate(one_line(product.get("name")) + suffix, 60)


def product_description(product: dict, price: Decimal) -> str:
    name = one_line(product.get("name"))
    detail = usable_description(product)
    if detail:
        candidate = f"Shop {name} in Sri Lanka for LKR {price_text(price)}. {truncate(detail, 82)} Island-wide delivery and cash on delivery. Confirm availability on WhatsApp."
    else:
        candidate = f"Shop {name} in Sri Lanka for LKR {price_text(price)}. Confirm product details and availability on WhatsApp. Island-wide delivery and cash on delivery."
    return truncate(candidate, 158)


def page_head(title: str, description: str, canonical: str, image: str, page_type: str, robots: str = "index,follow,max-image-preview:large") -> str:
    title_e = html.escape(title, quote=True)
    desc_e = html.escape(description, quote=True)
    canonical_e = html.escape(canonical, quote=True)
    image_e = html.escape(image, quote=True)
    site_image = image_e or f"{ROOT}/logo.png"
    return f'''<!doctype html>
<html lang="en-LK">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title_e}</title>
<meta name="description" content="{desc_e}">
<meta name="robots" content="{html.escape(robots, quote=True)}">
<link rel="canonical" href="{canonical_e}">
<meta name="theme-color" content="#111827">
<meta property="og:type" content="{html.escape(page_type, quote=True)}">
<meta property="og:site_name" content="Leopis Digital">
<meta property="og:title" content="{title_e}">
<meta property="og:description" content="{desc_e}">
<meta property="og:url" content="{canonical_e}">
<meta property="og:locale" content="en_LK">
<meta property="og:image" content="{site_image}">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="{title_e}">
<meta name="twitter:description" content="{desc_e}">
<meta name="twitter:image" content="{site_image}">
<link rel="icon" href="/logo.png">
<link rel="stylesheet" href="/style.css">
<style>{PAGE_CSS}</style>
</head>'''


def json_ld(data: dict) -> str:
    payload = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    payload = payload.replace("</", "<\\/")
    return '<script type="application/ld+json">' + payload + "</script>"


def product_jsonld(product: dict, canonical: str, description: str, image: str, price: Decimal) -> dict:
    node = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": canonical + "#product",
        "name": one_line(product.get("name")),
        "sku": str(product.get("id", "")),
        "category": one_line(product.get("category", "")),
        "offers": {
            "@type": "Offer",
            "url": canonical,
            "priceCurrency": "LKR",
            "price": price_schema(price),
            "seller": {
                "@type": "Organization",
                "name": "Leopis (Pvt) Ltd",
                "url": ROOT + "/",
            },
        },
    }
    if description:
        node["description"] = description
    if image:
        node["image"] = [image]
    return node


def breadcrumb_jsonld(items: list[tuple[str, str]]) -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": pos,
                "name": name,
                "item": url,
            }
            for pos, (name, url) in enumerate(items, 1)
        ],
    }


def header_html() -> str:
    return f'''<header class="site-head"><a href="/" aria-label="Leopis Digital home"><img src="/logo.png" alt="Leopis Digital"></a><a href="/">Browse all products in Sri Lanka</a></header>'''


def product_page(product: dict, category_urls: dict[str, str]) -> tuple[str, bool, str]:
    name = one_line(product.get("name"))
    heading_name = truncate(name, 80)
    product_id = str(product.get("id", ""))
    category = one_line(product.get("category"))
    description = clean_text(product.get("description", ""))
    description_plain = usable_description(product)
    price = price_value(product)
    slug = product_slug(product)
    canonical = f"{ROOT}/products/{slug}.html"
    meta_desc = product_description(product, price)
    img = image_url(product)
    indexable = is_indexable(product)
    robots = "index,follow,max-image-preview:large" if indexable else "noindex,follow"
    head = page_head(product_title(product), meta_desc, canonical, img, "product", robots)

    cat_url = category_urls[category]
    crumbs = f'<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <a href="{html.escape(cat_url, quote=True)}">{html.escape(category)}</a> &rsaquo; <span>{html.escape(name)}</span></nav>'
    if img:
        image_block = f'<img class="product-image" src="{html.escape(img, quote=True)}" alt="{html.escape(name, quote=True)}" fetchpriority="high">'
    else:
        image_block = '<div class="product-image" role="img" aria-label="Product image not available"></div>'
    if description_plain:
        description_block = f'<h2>Product details</h2><p class="description">{html.escape(description).replace(chr(10), "<br>")}</p>'
    else:
        description_block = '<p class="notice">Product details are being confirmed. Ask Leopis to confirm specifications and availability before ordering.</p>'
    warranty = one_line(product.get("warranty"))
    warranty_block = f'<p class="warranty"><strong>Warranty information:</strong> {html.escape(warranty)}</p>' if warranty else ""
    old_price = product.get("oldPrice")
    old_price_block = ""
    try:
        old_decimal = Decimal(str(old_price))
        if old_decimal.is_finite() and old_decimal > price:
            old_price_block = f'<del class="old-price">Rs. {html.escape(price_text(old_decimal))}</del>'
    except (InvalidOperation, ValueError):
        pass
    interactive_url = "/?p=" + quote(product_id, safe="")
    wa_text = f"Hi Leopis, I am interested in {name} (Code {product_id}). Please confirm current availability and delivery charges."
    wa_url = "https://wa.me/94783366466?" + urlencode({"text": wa_text})
    schema = [
        product_jsonld(product, canonical, description_plain, img, price),
        breadcrumb_jsonld([("Home", ROOT + "/"), (category, cat_url), (name, canonical)]),
    ]
    schema_html = "\n".join(json_ld(node) for node in schema)
    page = f'''{head}
<body>
{header_html()}
<main class="wrap">
{crumbs}
<article class="product">
<div>{image_block}</div>
<div>
<p class="category">{html.escape(category)} · Sri Lanka</p>
<h1>{html.escape(heading_name)}</h1>
<p class="price">Rs. {html.escape(price_text(price))}{old_price_block}</p>
<p class="code"><strong>Product code:</strong> {html.escape(product_id)}</p>
{warranty_block}
{description_block}
<div class="actions"><a class="button" href="{html.escape(interactive_url, quote=True)}">View and order this product</a><a class="button secondary" href="{html.escape(wa_url, quote=True)}" target="_blank" rel="noopener">Confirm on WhatsApp</a></div>
</div>
</article>
<section class="store-info"><h2>Ordering from Sri Lanka</h2><p>Leopis Digital offers island-wide delivery and cash on delivery. Product availability, exact specifications, warranty and delivery charges can vary; confirm them with the store before ordering.</p><p>WhatsApp: <a href="https://wa.me/94783366466">+94 78 336 6466</a></p><p>Browse more: <a href="{html.escape(cat_url, quote=True)}">{html.escape(category)} in Sri Lanka</a> · <a href="/">All products</a></p></section>
</main>
<footer class="footer wrap">Leopis (Pvt) Ltd · Sri Lanka · <a href="/">Leopis Digital</a></footer>
{schema_html}
</body>
</html>
'''
    return page, indexable, canonical


def category_page(category: str, products: list[dict], product_urls: dict[str, str], category_urls: dict[str, str]) -> tuple[str, str]:
    slug = category_slug(category)
    canonical = category_urls[category]
    title = truncate(f"{category} in Sri Lanka | Leopis Digital", 60)
    desc = truncate(
        f"Browse {category} at Leopis Digital in Sri Lanka. View current LKR prices, product details and ordering options. Island-wide delivery and cash on delivery.",
        158,
    )
    head = page_head(title, desc, canonical, ROOT + "/logo.png", "website")
    cards = []
    for product in products:
        name = one_line(product.get("name"))
        price = price_text(price_value(product))
        url = product_urls[str(product["id"])]
        img = image_url(product)
        img_block = f'<img src="{html.escape(img, quote=True)}" alt="{html.escape(name, quote=True)}" loading="lazy">' if img else ""
        cards.append(
            f'<a class="product-card" href="{html.escape(url, quote=True)}">{img_block}<div class="product-card-body"><h2>{html.escape(truncate(name, 80))}</h2><span class="small">Rs. {html.escape(price)} · Product code {html.escape(str(product["id"]))}</span></div></a>'
        )
    crumbs = f'<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <span>{html.escape(category)}</span></nav>'
    indexable = not any(term in category.casefold() for term in REVIEW_REQUIRED_CATEGORY_TERMS)
    robots = "index,follow,max-image-preview:large" if indexable else "noindex,follow"
    head = page_head(title, desc, canonical, ROOT + "/logo.png", "website", robots)
    schema = json_ld({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": category,
        "url": canonical,
        "inLanguage": "en-LK",
        "isPartOf": {"@type": "WebSite", "name": "Leopis Digital", "url": ROOT + "/"},
    })
    body = f'''{head}
<body>
{header_html()}
<main class="wrap">
{crumbs}
<h1>{html.escape(category)} in Sri Lanka</h1>
<p class="category-intro">Browse current {html.escape(category)} products from Leopis Digital. Prices are shown in Sri Lankan rupees. Confirm current availability, exact specifications and delivery charges with the store before ordering. Island-wide delivery and cash on delivery are available.</p>
<p>{len(products):,} products in this category.</p>
<section class="product-grid" aria-label="{html.escape(category, quote=True)} products">{''.join(cards)}</section>
</main>
<footer class="footer wrap">Leopis (Pvt) Ltd · Sri Lanka · <a href="/">All products</a></footer>
{schema}
</body>
</html>
'''
    return body, canonical if indexable else ""


def update_home_category_links(categories: list[tuple[str, str, int]]) -> None:
    source = INDEX_PATH.read_text(encoding="utf-8")
    if CATEGORY_LINKS_BEGIN not in source or CATEGORY_LINKS_END not in source:
        raise RuntimeError("index.html is missing SEO category-link markers")
    links = [CATEGORY_LINKS_BEGIN]
    links.append('<nav class="seo-category-links" aria-label="Browse product categories">')
    for category, url, count in categories:
        links.append(
            f'<a href="{html.escape(url, quote=True)}">{html.escape(category)} <span>({count:,})</span></a>'
        )
    links.append("</nav>")
    links.append(CATEGORY_LINKS_END)
    start = source.index(CATEGORY_LINKS_BEGIN)
    end = source.index(CATEGORY_LINKS_END, start) + len(CATEGORY_LINKS_END)
    updated = source[:start] + "\n".join(links) + source[end:]
    if updated != source:
        INDEX_PATH.write_text(updated, encoding="utf-8")


def remove_stale_html(directory: Path, expected_names: set[str]) -> None:
    if not directory.exists():
        return
    for path in directory.glob("*.html"):
        if path.name not in expected_names:
            path.unlink()


def write_sitemap(urls: list[str]) -> None:
    ET.register_namespace("", SITEMAP_NS)
    urlset = ET.Element(f"{{{SITEMAP_NS}}}urlset")
    for url in sorted(set(urls)):
        node = ET.SubElement(urlset, f"{{{SITEMAP_NS}}}url")
        loc = ET.SubElement(node, f"{{{SITEMAP_NS}}}loc")
        loc.text = url
    try:
        ET.indent(urlset, space="  ")
    except AttributeError:
        pass
    SITEMAP_PATH.write_bytes(ET.tostring(urlset, encoding="utf-8", xml_declaration=True) + b"\n")


def main() -> None:
    products = json.loads(CATALOG_PATH.read_text(encoding="utf-8"))
    if not isinstance(products, list) or not products:
        raise RuntimeError("products_final.json must contain a non-empty list")
    ids = [str(p.get("id", "")) for p in products]
    if any(not item for item in ids) or len(ids) != len(set(ids)):
        raise RuntimeError("Catalog product IDs must be present and unique")

    product_urls = {str(p["id"]): f"{ROOT}/products/{product_slug(p)}.html" for p in products}
    if len(set(product_urls.values())) != len(products):
        raise RuntimeError("Product page slug collision; fix the catalog names or IDs before publishing")
    categories = sorted({one_line(p.get("category")) for p in products if one_line(p.get("category"))})
    category_urls = {category: f"{ROOT}/categories/{category_slug(category)}.html" for category in categories}
    if len(set(category_urls.values())) != len(categories):
        raise RuntimeError("Category page slug collision; fix category names before publishing")

    PRODUCTS_DIR.mkdir(exist_ok=True)
    CATEGORIES_DIR.mkdir(exist_ok=True)
    expected_product_names: set[str] = set()
    indexable_urls: list[str] = []
    indexable_count = 0
    for product in products:
        html_page, indexable, canonical = product_page(product, category_urls)
        filename = product_slug(product) + ".html"
        expected_product_names.add(filename)
        (PRODUCTS_DIR / filename).write_text(html_page, encoding="utf-8")
        if indexable:
            indexable_urls.append(canonical)
            indexable_count += 1
    remove_stale_html(PRODUCTS_DIR, expected_product_names)

    by_category: dict[str, list[dict]] = {category: [] for category in categories}
    for product in products:
        by_category[one_line(product.get("category"))].append(product)
    expected_category_names: set[str] = set()
    category_entries: list[tuple[str, str, int]] = []
    category_urls_in_sitemap: list[str] = []
    for category in categories:
        page, canonical = category_page(category, by_category[category], product_urls, category_urls)
        filename = category_slug(category) + ".html"
        expected_category_names.add(filename)
        (CATEGORIES_DIR / filename).write_text(page, encoding="utf-8")
        category_entries.append((category, f"/categories/{filename}", len(by_category[category])))
        if canonical:
            category_urls_in_sitemap.append(canonical)
    remove_stale_html(CATEGORIES_DIR, expected_category_names)

    update_home_category_links(category_entries)
    write_sitemap([ROOT + "/", *category_urls_in_sitemap, *indexable_urls])
    not_indexed = len(products) - indexable_count
    print(
        f"Generated {len(products)} product pages ({indexable_count} indexable, "
        f"{not_indexed} noindex until descriptions/claims are reviewed), "
        f"{len(categories)} category pages, and sitemap.xml."
    )


if __name__ == "__main__":
    main()
