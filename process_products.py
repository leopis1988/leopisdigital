import json
import pandas as pd
import os
import requests

# 1. Load the raw JSON file
json_file = 'products.json'
if not os.path.exists(json_file):
    print(f"Error: {json_file} not found!")
    exit(1)

with open(json_file, 'r', encoding='utf-8') as f:
    data = json.load(f)

# 2. Create an images folder if it doesn't exist
os.makedirs('images', exist_ok=True)

processed_products = []
base_url = "https://store.dropy.lk/"

print("Processing products and downloading images...")

for item in data:
    # Fix the image path
    image_path = item.get('image', '')
    
    # If the image path is relative, download it
    if image_path and not image_path.startswith('http'):
        full_image_url = base_url + image_path
        local_image_path = image_path # e.g., images/102363.jpg
        
        # Download image if it doesn't already exist in the repo
        if not os.path.exists(local_image_path):
            try:
                headers = {'User-Agent': 'Mozilla/5.0'}
                response = requests.get(full_image_url, headers=headers, timeout=10)
                if response.status_code == 200:
                    with open(local_image_path, 'wb') as img_file:
                        img_file.write(response.content)
            except Exception as e:
                print(f"Failed to download {local_image_path}: {e}")
        
        # The website will now use the local image path
        final_image_url = local_image_path
    else:
        final_image_url = image_path

    # Add +300 profit
    original_price = item.get('price', 0)
    selling_price = original_price + 300

    # Prepare the data for the website
    processed_products.append({
        "id": item.get('id'),
        "name": item.get('name'),
        "category": item.get('category'),
        "price": selling_price, # Website uses the new price
        "image": final_image_url, # Website uses local image
        "description": item.get('description')
    })

# 3. Save the final JSON for the website (app.js will read this)
with open('products_final.json', 'w', encoding='utf-8') as f:
    json.dump(processed_products, f, indent=2)

# 4. Save the Excel file for your profit tracking
df = pd.DataFrame(processed_products)
df.to_excel("Products_with_Profit.xlsx", index=False)

print(f"Success! {len(processed_products)} products processed, images downloaded, and website JSON updated.")
