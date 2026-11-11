import json
import pandas as pd
import os
import time
from pathlib import Path
try:
    from ddgs import DDGS
except ImportError:
    DDGS = None

with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

removed_ids_path = Path('removed_product_ids.json')
if removed_ids_path.exists():
    removed_ids = json.loads(removed_ids_path.read_text(encoding='utf-8'))
    if not isinstance(removed_ids, list):
        raise ValueError('removed_product_ids.json must contain a JSON array')
    removed_ids = {str(product_id).strip().upper() for product_id in removed_ids if str(product_id).strip()}
    before_count = len(data)
    data = [item for item in data if str(item.get('id', '')).strip().upper() not in removed_ids]
    if before_count != len(data):
        print(f'Excluded {before_count - len(data)} persistently removed product(s).')

processed_products = []

def get_image_url(name):
    # இணையத்தில் படம் தேடும் செயல்பாடு
    if not DDGS:
        return f"https://loremflickr.com/600/600/{name.replace(' ', '%20')}"
    try:
        with DDGS() as ddgs:
            results = list(ddgs.images(f"{name} product", max_results=1))
            if results and results[0].get("image"):
                return results[0].get("image")
    except:
        pass
    # படம் கிடைக்கவில்லை என்றால் ஒரு மாற்று படம்
    return f"https://loremflickr.com/600/600/{name.replace(' ', '%20')}"

print(f"Processing {len(data)} products. Fetching real images...")

for item in data:
    image_path = item.get('image', '')
    
    # லோக்கல் பாதை (images/...) இருந்தால், இணைய முகவரியை (http...) தேடும்
    if not image_path.startswith("http"):
        name = item.get('name', 'product')
        real_image_url = get_image_url(name)
        final_image = real_image_url
        time.sleep(0.3) # வெளிச் சேவையகங்களின் வரம்புகளைத் தவிர்க்க
    else:
        final_image = image_path

    original_price = item.get('price', 0)
    selling_price = original_price + 300

    processed_products.append({
        "id": item.get('id'),
        "name": item.get('name'),
        "category": item.get('category'),
        "price": selling_price,
        "image": final_image, # இணையதள முகவரி (URL)
        "description": item.get('description')
    })

with open('products_final.json', 'w', encoding='utf-8') as f:
    json.dump(processed_products, f, indent=2)

df = pd.DataFrame(processed_products)
df.to_excel("Products_with_Profit.xlsx", index=False)
print("Success! Real image URLs fetched and products_final.json updated.")
