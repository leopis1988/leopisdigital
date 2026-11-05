import json
import pandas as pd
import os

# 1. Load your JSON file
with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

processed_products = []

for item in data:
    # Get the image path (e.g., "images/102363.jpg")
    image_path = item.get('image', '')
    
    # STRIP OUT ANY DOMAIN. We only want the local path.
    if "dropy.lk" in image_path:
        # If the URL was full (https://store.dropy.lk/images/...), get just the filename
        filename = image_path.split('/')[-1]
        local_image = f"images/{filename}"
    else:
        # If it was already relative, keep it
        local_image = image_path

    # Add profit (+300)
    original_price = item.get('price', 0)
    selling_price = original_price + 300

    processed_products.append({
        "id": item.get('id'),
        "name": item.get('name'),
        "category": item.get('category'),
        "price": selling_price,
        "image": local_image, # THIS IS NOW A LOCAL PATH ONLY
        "description": item.get('description')
    })

# 2. Save the website JSON
with open('products_final.json', 'w', encoding='utf-8') as f:
    json.dump(processed_products, f, indent=2)

# 3. Save Excel
df = pd.DataFrame(processed_products)
df.to_excel("Products_with_Profit.xlsx", index=False)
print("Success! Dropy.lk completely removed. Local images linked.")
