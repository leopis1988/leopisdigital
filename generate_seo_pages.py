#!/usr/bin/env python3
"""Generate crawlable product/category pages and a sitemap from products_final.json."""
from __future__ import annotations

import csv
import html
import json
import math
import re
import unicodedata
import xml.etree.ElementTree as ET
from decimal import Decimal, InvalidOperation
from pathlib import Path
from urllib.parse import quote, urljoin, urlencode
from product_taxonomy import classify_product

ROOT = "https://leopisdigital.com"
ROOT_DIR = Path(__file__).resolve().parent
CATALOG_PATH = ROOT_DIR / "products_final.json"
INDEX_PATH = ROOT_DIR / "index.html"
PRODUCTS_DIR = ROOT_DIR / "products"
CATEGORIES_DIR = ROOT_DIR / "categories"
SITEMAP_PATH = ROOT_DIR / "sitemap.xml"
CATEGORY_SEO_PATH = ROOT_DIR / "category_seo.json"
FEED_PATH = ROOT_DIR / "google-merchant-feed.tsv"
CAMPAIGN_IDS_PATH = ROOT_DIR / "meta_campaign_ids.json"
FEATURED_PAGE_PATH = ROOT_DIR / "featured-products.html"
FEATURED_PAGE_URL = f"{ROOT}/featured-products.html"
POLICY_PAGE_URLS = [
    f"{ROOT}/about.html",
    f"{ROOT}/delivery.html",
    f"{ROOT}/returns-warranty.html",
    f"{ROOT}/contact.html",
]
CATEGORY_LINKS_BEGIN = "<!-- SEO_CATEGORY_LINKS_BEGIN -->"
CATEGORY_LINKS_END = "<!-- SEO_CATEGORY_LINKS_END -->"
SITEMAP_NS = "http://www.sitemaps.org/schemas/sitemap/0.9"
PLACEHOLDERS = {
    "", "no description", "no description available", "n/a", "na", "none",
    "null", "not available", "description not available", "details not available",
}
REVIEW_REQUIRED_CATEGORY_TERMS = ("health", "sexual")
REVIEW_REQUIRED_PRODUCT_TERMS = (
    "sexual", "erectile", "penis", "libido", "testosterone", "supplement",
    "weight loss", "blood pressure", "blood sugar", "diabetes", "hypertension",
    "medicine", "medication", "cure", "treats", "treatment", "pain relief",
)

PAGE_CSS = """
:root{color-scheme:light;--ink:#151b2c;--muted:#5d6575;--brand:#111827;--accent:#f6c928;--line:#e4e8ef;--soft:#f6f8fb}
*{box-sizing:border-box}body{margin:0;background:#fff;color:var(--ink);font:16px/1.6 system-ui,-apple-system,"Segoe UI",sans-serif}
a{color:#174ea6}a:hover{text-decoration-thickness:2px}.wrap{max-width:1080px;margin:auto;padding:1rem 1.2rem 3rem}
.site-head{display:flex;align-items:center;justify-content:space-between;gap:1rem;border-bottom:1px solid var(--line);padding:.7rem 1.2rem;max-width:1080px;margin:auto}
.site-head img{width:auto;height:48px;max-width:190px;object-fit:contain}.site-head a{font-weight:700}.crumbs{font-size:.9rem;color:var(--muted);margin:1.1rem 0}.crumbs a{color:inherit}
.product{display:grid;grid-template-columns:minmax(240px,440px) 1fr;gap:2rem;align-items:start}.product-image{width:100%;aspect-ratio:1;object-fit:contain;background:var(--soft);border:1px solid var(--line);border-radius:14px}
.product h1{font-size:clamp(1.7rem,4vw,2.6rem);line-height:1.15;margin:.2rem 0 .8rem}.category{color:var(--muted);font-weight:650}.price{font-size:1.8rem;font-weight:800;margin:.7rem 0}.old-price{font-size:1rem;color:#727987;font-weight:500;margin-left:.4rem}.code,.warranty{font-size:.9rem;color:var(--muted)}.description{white-space:pre-line}.notice{background:#fff8dc;border-left:4px solid var(--accent);padding:.75rem 1rem;border-radius:5px}
.actions{display:flex;flex-wrap:wrap;gap:.7rem;margin:1.2rem 0}.button{display:inline-block;text-decoration:none;padding:.7rem 1rem;border-radius:9px;background:var(--brand);color:#fff;font-weight:750}.button.secondary{background:#e8f7ee;color:#155b34}.store-info,.category-intro{border-top:1px solid var(--line);margin-top:2rem;padding-top:1rem;color:#384052}
.product-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(185px,1fr));gap:1rem;margin-top:1rem}.product-card{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:12px;overflow:hidden;background:white;color:inherit;text-decoration:none;transition:transform .15s,box-shadow .15s}.product-card:hover{transform:translateY(-2px);box-shadow:0 8px 24px #151b2c18}.product-card img{width:100%;aspect-ratio:1;object-fit:contain;background:var(--soft);display:block}.product-card-body{display:grid;gap:.25rem;padding:.7rem}.product-card h3{font-size:1rem;line-height:1.35;margin:.1rem 0 .2rem}.product-card .small{color:var(--muted);font-size:.78rem}.product-card .warranty{color:#126035;font-weight:700}.subcategory-nav{display:flex;flex-wrap:wrap;gap:.5rem;margin:1rem 0 1.5rem}.subcategory-nav a{padding:.45rem .7rem;border:1px solid var(--line);border-radius:999px;background:var(--soft);text-decoration:none;font-size:.88rem}.subcategory-block{margin:2rem 0;scroll-margin-top:1rem}.subcategory-block>h2{font-size:1.35rem;border-bottom:1px solid var(--line);padding-bottom:.45rem}.subcategory-block h2 small{font-size:.82rem;color:var(--muted)}.category-faq{border-top:1px solid var(--line);margin-top:2rem;padding-top:1rem}.category-faq details{margin:.5rem 0;padding:.75rem 1rem;border:1px solid var(--line);border-radius:10px;background:var(--soft)}.category-faq summary{font-weight:700;cursor:pointer}.category-faq p{margin:.55rem 0 0}.footer{border-top:1px solid var(--line);margin-top:2rem;padding-top:1rem;color:var(--muted);font-size:.9rem}
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


def unique_category_slugs(categories: list[str]) -> dict[str, str]:
    """Return stable unique slugs so similar Sheet labels cannot break publishing."""
    result: dict[str, str] = {}
    used: set[str] = set()
    for category in sorted(categories):
        base = category_slug(category)
        candidate = base
        suffix = 2
        while candidate in used:
            candidate = f"{base}-{suffix}"
            suffix += 1
        result[category] = candidate
        used.add(candidate)
    return result


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
    searchable = " ".join(
        [one_line(product.get("name", "")), one_line(product.get("description", ""))]
    ).casefold()
    sensitive_category = any(term in category for term in REVIEW_REQUIRED_CATEGORY_TERMS)
    review_required = sensitive_category and any(
        term in searchable for term in REVIEW_REQUIRED_PRODUCT_TERMS
    )
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


def store_policy_jsonld() -> dict:
    return {
        "@context": "https://schema.org",
        "@type": "OnlineStore",
        "@id": ROOT + "/#store",
        "name": "Leopis Digital",
        "legalName": "Leopis (Pvt) Ltd",
        "url": ROOT + "/",
        "logo": ROOT + "/logo.png",
        "telephone": "+94783366466",
        "currenciesAccepted": "LKR",
        "paymentAccepted": "Cash on delivery",
        "areaServed": {"@type": "Country", "name": "Sri Lanka"},
        "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+94783366466",
            "contactType": "customer service",
            "areaServed": "LK",
            "availableLanguage": ["English", "Sinhala", "Tamil"],
        },
        "hasShippingService": {
            "@type": "ShippingService",
            "@id": ROOT + "/#shipping",
            "name": "Sri Lanka island-wide delivery",
            "description": (
                "Delivery for a one-store order is Rs. 450. Multi-store orders use the discounted tiers "
                "shown at checkout. Delivery timing and address serviceability are confirmed on WhatsApp. "
                "See " + ROOT + "/delivery.html."
            ),
            "fulfillmentType": "https://schema.org/FulfillmentTypeDelivery",
            "shippingConditions": [{
                "@type": "ShippingConditions",
                "shippingDestination": {"@type": "DefinedRegion", "addressCountry": "LK"},
                "shippingRate": {"@type": "MonetaryAmount", "value": 450, "currency": "LKR"},
            }],
        },
        "hasMerchantReturnPolicy": {
            "@type": "MerchantReturnPolicy",
            "@id": ROOT + "/#return-policy",
            "applicableCountry": "LK",
            "merchantReturnLink": ROOT + "/returns-warranty.html",
        },
    }


def schema_availability(value: object) -> str | None:
    normalized = re.sub(r"[^a-z]", "", str(value or "").casefold())
    values = {
        "instock": "InStock",
        "outofstock": "OutOfStock",
        "preorder": "PreOrder",
        "backorder": "BackOrder",
        "limitedavailability": "LimitedAvailability",
    }
    return "https://schema.org/" + values[normalized] if normalized in values else None


def load_feed_availability() -> dict[str, str]:
    if not FEED_PATH.exists():
        return {}
    with FEED_PATH.open("r", encoding="utf-8-sig", newline="") as stream:
        reader = csv.DictReader(stream, delimiter="\t")
        if not reader.fieldnames or not {"id", "availability"}.issubset(reader.fieldnames):
            return {}
        return {
            str(row.get("id", "")).strip(): status
            for row in reader
            if (status := schema_availability(row.get("availability")))
            and str(row.get("id", "")).strip()
        }


def product_jsonld(product: dict, canonical: str, description: str, image: str, price: Decimal,
                   availability: str | None = None) -> dict:
    offer = {
        "@type": "Offer",
        "url": canonical,
        "priceCurrency": "LKR",
        "price": price_schema(price),
        "seller": {"@id": ROOT + "/#store"},
        "shippingDetails": {
            "@type": "OfferShippingDetails",
            "hasShippingService": {"@id": ROOT + "/#shipping"},
        },
        "hasMerchantReturnPolicy": {"@id": ROOT + "/#return-policy"},
    }
    if availability:
        offer["availability"] = availability
    node = {
        "@context": "https://schema.org",
        "@type": "Product",
        "@id": canonical + "#product",
        "name": one_line(product.get("name")),
        "sku": str(product.get("id", "")),
        "category": one_line(product.get("category", "")),
        "offers": offer,
    }
    brand = one_line(product.get("brand", ""))
    if brand:
        node["brand"] = {"@type": "Brand", "name": brand}
    gtin = re.sub(r"\s+", "", str(product.get("gtin", "")))
    if re.fullmatch(r"\d{8,14}", gtin):
        node["gtin"] = gtin
    mpn = one_line(product.get("mpn", ""))
    if mpn:
        node["mpn"] = mpn
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


def product_page(product: dict, category_urls: dict[str, str],
                 feed_availability_by_id: dict[str, str]) -> tuple[str, bool, str]:
    name = one_line(product.get("name"))
    heading_name = truncate(name, 80)
    product_id = str(product.get("id", ""))
    category = one_line(product.get("category"))
    subcategory = one_line(product.get("subcategory")) or f"Other {category}"
    description = clean_text(product.get("description", ""))
    description_plain = usable_description(product)
    price = price_value(product)
    slug = product_slug(product)
    canonical = f"{ROOT}/products/{slug}.html"
    meta_desc = product_description(product, price)
    img = image_url(product)
    availability = (
        schema_availability(product.get("availability"))
        or feed_availability_by_id.get(product_id)
        or schema_availability("in_stock")
    )
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
    brand = one_line(product.get("brand", ""))
    brand_block = f'<p class="code"><strong>Brand:</strong> {html.escape(brand)}</p>' if brand else ""
    gtin = re.sub(r"\s+", "", str(product.get("gtin", "")))
    mpn = one_line(product.get("mpn", ""))
    identifiers = []
    if re.fullmatch(r"\d{8,14}", gtin):
        identifiers.append(f'<strong>GTIN:</strong> {html.escape(gtin)}')
    if mpn:
        identifiers.append(f'<strong>MPN:</strong> {html.escape(mpn)}')
    identifiers_block = f'<p class="code">{" &nbsp; ".join(identifiers)}</p>' if identifiers else ""
    availability_label = {
        "https://schema.org/InStock": "In stock; please confirm before ordering.",
        "https://schema.org/OutOfStock": "Currently out of stock; contact us about availability.",
        "https://schema.org/PreOrder": "Available for pre-order; confirm timing on WhatsApp.",
        "https://schema.org/BackOrder": "Available on back-order; confirm timing on WhatsApp.",
        "https://schema.org/LimitedAvailability": "Limited availability; confirm before ordering.",
    }.get(availability, "Confirm current availability on WhatsApp.")
    availability_block = f'<p class="code"><strong>Availability:</strong> {html.escape(availability_label)}</p>'
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
        store_policy_jsonld(),
        product_jsonld(product, canonical, description_plain, img, price, availability),
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
<p class="category">{html.escape(category)} · {html.escape(subcategory)} · Sri Lanka</p>
<h1>{html.escape(heading_name)}</h1>
<p class="price">Rs. {html.escape(price_text(price))}{old_price_block}</p>
<p class="code"><strong>Product code:</strong> {html.escape(product_id)} · <strong>Shop:</strong> {html.escape(str(product.get("merchant") or "5"))}</p>
{brand_block}
{identifiers_block}
{warranty_block}
{availability_block}
{description_block}
<div class="actions"><a class="button" href="{html.escape(interactive_url, quote=True)}">View and order this product</a><a class="button secondary" href="{html.escape(wa_url, quote=True)}" target="_blank" rel="noopener">Confirm on WhatsApp</a></div>
</div>
</article>
<section class="store-info"><h2>Ordering from Sri Lanka</h2><p>Leopis Digital offers island-wide delivery and cash on delivery. You may also request bank-transfer instructions through WhatsApp; this website does not take payment. Delivery for an order from one store is Rs. 450; multi-store carts use the discounted tiers shown on the <a href="/delivery.html">delivery page</a>. Returns and warranty terms are product-specific; see the <a href="/returns-warranty.html">returns and warranty policy</a>.</p><p>Confirm product availability, specifications and timing on WhatsApp. <a href="https://wa.me/94783366466">Chat with Leopis: +94 78 336 6466</a></p><p>Browse more: <a href="{html.escape(cat_url, quote=True)}">{html.escape(category)} in Sri Lanka</a> · <a href="/">All products</a></p></section>
</main>
<footer class="footer wrap">Leopis (Pvt) Ltd · Sri Lanka · <a href="/">Leopis Digital</a></footer>
{schema_html}
</body>
</html>
'''
    return page, indexable, canonical


def category_page(category: str, products: list[dict], product_urls: dict[str, str], category_urls: dict[str, str]) -> tuple[str, str]:
    canonical = category_urls[category]
    seo_map = json.loads(CATEGORY_SEO_PATH.read_text(encoding="utf-8")) if CATEGORY_SEO_PATH.exists() else {}
    seo = seo_map.get(category, {})
    title = truncate(seo.get("title") or f"{category} in Sri Lanka | Leopis Digital", 60)
    desc = truncate(seo.get("description") or f"Browse {category} products in Sri Lanka. Compare product names, current prices and listed details.", 158)
    cards_by_subcategory: dict[str, list[str]] = {}
    for product in products:
        name = one_line(product.get("name"))
        price = price_text(price_value(product))
        url = product_urls[str(product["id"])]
        img = image_url(product)
        img_block = f'<img src="{html.escape(img, quote=True)}" alt="{html.escape(name, quote=True)}" loading="lazy">' if img else ""
        subcategory = one_line(product.get("subcategory")) or f"Other {category}"
        warranty = one_line(product.get("warranty"))
        details = f'<span class="small">Rs. {html.escape(price)} · Shop {html.escape(str(product.get("merchant") or "5"))} · Code {html.escape(str(product["id"]))}</span>'
        if warranty:
            details += f'<span class="small warranty">{html.escape(warranty)}</span>'
        card = f'<a class="product-card" href="{html.escape(url, quote=True)}">{img_block}<div class="product-card-body"><h3>{html.escape(truncate(name, 80))}</h3><span class="small subcategory-label">{html.escape(subcategory)}</span>{details}</div></a>'
        cards_by_subcategory.setdefault(subcategory, []).append(card)
    nav, sections = [], []
    for subcategory in sorted(cards_by_subcategory, key=str.casefold):
        anchor = "subcategory-" + category_slug(subcategory)
        count = len(cards_by_subcategory[subcategory])
        nav.append(f'<a href="#{html.escape(anchor, quote=True)}">{html.escape(subcategory)} <span>({count:,})</span></a>')
        sections.append(f'<section class="subcategory-block" id="{html.escape(anchor, quote=True)}"><h2>{html.escape(subcategory)} <small>({count:,})</small></h2><div class="product-grid">{"".join(cards_by_subcategory[subcategory])}</div></section>')
    crumbs = f'<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <span>{html.escape(category)}</span></nav>'
    indexable = len(products) >= 5 and "sexual" not in category.casefold()
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
    intro = seo.get("intro") or f"Browse {category} products in Sri Lanka. Review each listing for current product details and pricing."
    h1 = seo.get("h1") or f"{category} in Sri Lanka"
    questions = seo.get("questions", [])
    q1 = questions[0] if questions else f"What can I find in {category}?"
    q2 = questions[1] if len(questions) > 1 else "How can I check a product’s details and warranty?"
    faq = f'''<section class="category-faq"><h2>Questions about {html.escape(category)}</h2><details><summary>{html.escape(q1)}</summary><p>{html.escape(intro)} Browse the product groups below to see the current listings.</p></details><details><summary>{html.escape(q2)}</summary><p>Each product card shows its current listed price and shop number. Open a product page to review its description and any warranty information currently provided, then contact Leopis to confirm details before ordering.</p></details></section>'''
    body = f'''{head}
<body>
{header_html()}
<main class="wrap">
{crumbs}
<h1>{html.escape(h1)}</h1>
<p class="category-intro">{html.escape(intro)}</p>
<p>{len(products):,} products · Browse by subcategory, shop number and listed warranty.</p>
<nav class="subcategory-nav" aria-label="Browse {html.escape(category, quote=True)} subcategories">{''.join(nav)}</nav>
{''.join(sections)}
{faq}
</main>
<footer class="footer wrap">Leopis (Pvt) Ltd · Sri Lanka · <a href="/">All products</a></footer>
{schema}
</body>
</html>
'''
    return body, canonical if indexable else ""


def featured_products_page(products: list[dict], product_urls: dict[str, str]) -> str:
    canonical = FEATURED_PAGE_URL
    title = "Featured Products in Sri Lanka | Leopis Digital"
    description = (
        "Browse 50 featured products from Leopis Digital in Sri Lanka. View current LKR prices, "
        "product details, ordering information and island-wide delivery options."
    )
    share_image = image_url(products[0]) if products else ROOT + "/logo.png"
    head = page_head(title, description, canonical, share_image, "website")
    cards = []
    item_list = []
    for position, product in enumerate(products, 1):
        product_id = str(product["id"])
        name = one_line(product.get("name"))
        category = one_line(product.get("category"))
        price = price_text(price_value(product))
        url = product_urls[product_id]
        img = image_url(product)
        image_block = (
            f'<img src="{html.escape(img, quote=True)}" alt="{html.escape(name, quote=True)}" loading="lazy">'
            if img else ""
        )
        cards.append(
            f'<a class="product-card" href="{html.escape(url, quote=True)}">{image_block}'
            f'<div class="product-card-body"><h2>{html.escape(truncate(name, 80))}</h2>'
            f'<span class="small">{html.escape(category)} · Code {html.escape(product_id)}</span>'
            f'<p class="price">Rs. {html.escape(price)}</p>'
            f'<span class="small">View details and ordering options</span></div></a>'
        )
        item_list.append({
            "@type": "ListItem",
            "position": position,
            "name": name,
            "url": url,
        })

    schema = json_ld({
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": "Featured Products in Sri Lanka",
        "url": canonical,
        "inLanguage": "en-LK",
        "isPartOf": {"@type": "WebSite", "name": "Leopis Digital", "url": ROOT + "/"},
        "mainEntity": {
            "@type": "ItemList",
            "numberOfItems": len(products),
            "itemListElement": item_list,
        },
    })
    crumbs = f'<nav class="crumbs" aria-label="Breadcrumb"><a href="/">Home</a> &rsaquo; <span>Featured products</span></nav>'
    body = f'''{head}
<body>
{header_html()}
<main class="wrap">
{crumbs}
<h1>Featured Products in Sri Lanka</h1>
<p class="category-intro">Explore 50 selected products across home, kitchen, gadgets, lighting, car and family categories. Prices shown are the current prices listed on the Leopis Digital website. Product availability is confirmed when ordering; delivery charges are separate and shown on the <a href="/delivery.html">delivery page</a>.</p>
<section class="product-grid" aria-label="50 featured products">{''.join(cards)}</section>
<section class="store-info"><h2>Ordering from Leopis Digital</h2><p>Open any product to check its details and order options. Cash on delivery is available in Sri Lanka. <a href="/delivery.html">See delivery charges</a> · <a href="/returns-warranty.html">Returns and warranty</a> · <a href="/">Browse all products</a>.</p></section>
</main>
<footer class="footer wrap">Leopis (Pvt) Ltd · Sri Lanka · <a href="/">Leopis Digital</a></footer>
{schema}
</body>
</html>
'''
    return body


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

    catalog_changed = False
    for product in products:
        category, subcategory = classify_product(
            product.get("category", ""), product.get("name", ""), product.get("description", "")
        )
        if product.get("category") != category or product.get("subcategory") != subcategory:
            product["category"] = category
            product["subcategory"] = subcategory
            catalog_changed = True
    if catalog_changed:
        CATALOG_PATH.write_text(json.dumps(products, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
        print("Updated product category and subcategory taxonomy in products_final.json.")

    product_urls = {str(p["id"]): f"{ROOT}/products/{product_slug(p)}.html" for p in products}
    if len(set(product_urls.values())) != len(products):
        raise RuntimeError("Product page slug collision; fix the catalog names or IDs before publishing")
    campaign_ids = json.loads(CAMPAIGN_IDS_PATH.read_text(encoding="utf-8"))
    if not isinstance(campaign_ids, list) or len(campaign_ids) != 50 or len(set(map(str, campaign_ids))) != 50:
        raise RuntimeError("meta_campaign_ids.json must contain exactly 50 unique product IDs")
    products_by_id = {str(product["id"]): product for product in products}
    missing_campaign_ids = [str(item) for item in campaign_ids if str(item) not in products_by_id]
    if missing_campaign_ids:
        raise RuntimeError("Featured campaign product IDs are missing from the catalog: " + ", ".join(missing_campaign_ids))
    campaign_products = [products_by_id[str(item)] for item in campaign_ids]
    nonindexable_campaign_ids = [str(item) for item in campaign_ids if not is_indexable(products_by_id[str(item)])]
    if nonindexable_campaign_ids:
        raise RuntimeError("Featured campaign products must have indexable product pages: " + ", ".join(nonindexable_campaign_ids))
    categories = sorted({one_line(p.get("category")) for p in products if one_line(p.get("category"))})
    category_slugs = unique_category_slugs(categories)
    category_urls = {category: f"{ROOT}/categories/{category_slugs[category]}.html" for category in categories}

    PRODUCTS_DIR.mkdir(exist_ok=True)
    CATEGORIES_DIR.mkdir(exist_ok=True)
    missing_policy_pages = [
        url.rsplit("/", 1)[-1] for url in POLICY_PAGE_URLS
        if not (ROOT_DIR / url.rsplit("/", 1)[-1]).is_file()
    ]
    if missing_policy_pages:
        raise RuntimeError("Missing policy pages required for sitemap: " + ", ".join(missing_policy_pages))
    feed_availability_by_id = load_feed_availability()
    expected_product_names: set[str] = set()
    indexable_urls: list[str] = []
    indexable_count = 0
    for product in products:
        html_page, indexable, canonical = product_page(product, category_urls, feed_availability_by_id)
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
        filename = category_urls[category].rsplit("/", 1)[-1]
        expected_category_names.add(filename)
        (CATEGORIES_DIR / filename).write_text(page, encoding="utf-8")
        category_entries.append((category, f"/categories/{filename}", len(by_category[category])))
        if canonical:
            category_urls_in_sitemap.append(canonical)
    remove_stale_html(CATEGORIES_DIR, expected_category_names)

    update_home_category_links(category_entries)
    FEATURED_PAGE_PATH.write_text(featured_products_page(campaign_products, product_urls), encoding="utf-8")
    write_sitemap([ROOT + "/", *POLICY_PAGE_URLS, FEATURED_PAGE_URL, *category_urls_in_sitemap, *indexable_urls])
    not_indexed = len(products) - indexable_count
    print(
        f"Generated {len(products)} product pages ({indexable_count} indexable, "
        f"{not_indexed} noindex until descriptions/claims are reviewed), "
        f"{len(categories)} category pages, a 50-product featured page, and sitemap.xml."
    )


if __name__ == "__main__":
    main()
