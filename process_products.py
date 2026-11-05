import json
import pandas as pd
import os

with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

processed_products = []

for item in data:
    image_path = item.get('image', '')
    
    # Force it to use the local images/ folder ONLY. 
    # Example: "images/102363.jpg"
    if "dropy.lk" in image_path:
        filename = image_path.split('/')[-1]
        local_image = f"images/{filename}"
    else:
        local_image = image_path

    original_price = item.get('price', 0)
    selling_price = original_price + 300

    processed_products.append({
        "id": item.get('id'),
        "name": item.get('name'),
        "category": item.get('category'),
        "price": selling_price,
        "image": local_image, # ONLY LOCAL PATH
        "description": item.get('description')
    })

with open('products_final.json', 'w', encoding='utf-8') as f:
    json.dump(processed_products, f, indent=2)

df = pd.DataFrame(processed_products)
df.to_excel("Products_with_Profit.xlsx", index=False)
print("Success! Local images linked.")
