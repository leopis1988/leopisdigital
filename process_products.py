import json
import pandas as pd
import os
import sys

# Check if file exists first
if not os.path.exists('products.json'):
    print("ERROR: 'products.json' not found in the repository! Please upload it.")
    sys.exit(1) # Fails the workflow immediately

print("File found. Processing...")

with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

processed_products = []
base_url = "https://store.dropy.lk/"

for item in data:
    image_path = item.get('image', '')
    if image_path and not image_path.startswith('http'):
        full_image_url = base_url + image_path
    else:
        full_image_url = image_path

    original_price = item.get('price', 0)
    selling_price = original_price + 300

    processed_products.append({
        "Product ID": item.get('id'),
        "Product Name": item.get('name'),
        "Category": item.get('category'),
        "Dropship Price": original_price,
        "Selling Price (+300)": selling_price,
        "Image URL": full_image_url,
        "Description": item.get('description')
    })

df = pd.DataFrame(processed_products)
df.to_excel("Products_with_Profit.xlsx", index=False)

print(f"Success! {len(processed_products)} products processed.")
