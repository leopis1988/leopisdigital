# Leopis Digital – Online Store

Static e-commerce site for **Leopis Pvt. Ltd.** (Sri Lanka), hosted on GitHub Pages.
Customers browse products, add to cart, and send the order through **WhatsApp** (cash on delivery, prices in LKR). The site is available in English, Sinhala and Tamil.

## Files

| File | What it does |
|---|---|
| `index.html` | Page structure |
| `style.css` | Design and colours |
| `app.js` | All site logic: products, cart, WhatsApp order, languages, 11.11 Flash Deals, rating line, FAQ |
| `products_final.json` | **The product list the site loads** (name, category, price, image, warranty) |
| `CNAME` | Custom domain (leopisdigital.com) |

> The site loads `products_final.json`. A file named `products.json` is **not** used.

## Updating products

1. Edit or replace `products_final.json` on GitHub (Add file → Upload files → Replace).
2. Commit and wait about a minute for GitHub Pages to update.
3. Open the site in a private tab (or hard refresh) to see the change.

### Product format

```json
{
  "id": "144-EXAMPLE-PRODUCT",
  "name": "Example Product",
  "category": "Kitchen & Dining",
  "price": 1990,
  "base": 1700,
  "image": "https://example.com/photo.webp",
  "description": "Short description",
  "warranty": "Checking Warranty – 3 Days"
}
```

- `id` – product code, shown on the card and in the WhatsApp order. Search finds products by code or name.
- `price` – normal selling price (supplier rate + commission).
- `base` – supplier rate. Only products with `base` take part in the 11.11 Flash Deals. Leave it out to exclude a product.
- `image` – full image link. If it is empty, a placeholder with the product name is shown.
- `warranty` – shown as a green line on the card, in the product popup and in the WhatsApp message. Leave empty to hide it.
- New categories work automatically: just use a new `category` name.

## Commission rule (supplier rate → selling price)

| Supplier rate (LKR) | Commission added (LKR) |
|---|---|
| Under 1,000 | 220 |
| 1,000 – 2,000 | 290 |
| 2,001 – 3,000 | 340 |
| 3,001 – 4,400 | 390 |
| Over 4,400 | 500 |

## 11.11 Flash Deals

Settings are near the top of the flash section in `app.js`:

```js
const FLASH = { end: new Date("2026-11-11T23:59:59+05:30"), factor: 0.5 };
```

- `end` – when the sale stops. After this time prices return to normal automatically, with no upload needed.
- `factor` – share of the normal commission kept during the sale (`0.5` = half, `1` = normal price, `0` = no commission).
- A banner with a countdown and a right-to-left scrolling strip of random flash products appears above the product list.
- Flash cards show the crossed-out normal price and a "Save Rs. X" badge.

## Other settings in `app.js`

- `CONFIG` (top of the file): WhatsApp number, currency, products per page.
- `const SITE_RATING = 4.8;` – the rating line above the products. Use your real customer feedback score, or set it to `null` to hide it.
- `const FAQ = { ... }` – FAQ questions and answers in English, Sinhala and Tamil.
- Scrolling speed of the flash strip: change `55s` in the `.ftrack` style (bigger = slower).

## Uploading tips (GitHub on mobile)

- If GitHub shows **HTTP 400**, open github.com in a private tab and sign in again, or clear GitHub cookies, then retry.
- Upload files to the **main folder** of the repository, not into a subfolder.
- Replace files using the exact same file name.
- Upload in small groups if many files fail at once.
- The old `imgpack_*.json` files (if present) are no longer used and can be deleted.

## Notes

- Products with wrong or missing supplier rates are kept off the site until the correct rate is confirmed.
- Product photos load directly from the image links in `products_final.json`.
- 
