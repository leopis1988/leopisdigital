import json
import pandas as pd

# Load the JSON file
with open('products.json', 'r', encoding='utf-8') as f:
    data = json.load(f)

processed_products = []
base_url = "https://store.dropy.lk/"

for item in data:
    # 1. Fix the Image URL
    image_path = item.get('image', '')
    if image_path and not image_path.startswith('http'):
        full_image_url = base_url + image_path
    else:
        full_image_url = image_path

    # 2. Add +300 to the Price
    original_price = item.get('price', 0)
    selling_price = original_price + 300

    # 3. Save the updated data
    processed_products.append({
        "Product ID": item.get('id'),
        "Product Name": item.get('name'),
        "Category": item.get('category'),
        "Dropship Price": original_price,
        "Selling Price (+300)": selling_price,
        "Image URL": full_image_url,
        "Description": item.get('description')
    })

# Export to Excel
df = pd.DataFrame(processed_products)
df.to_excel("Products_with_Profit.xlsx", index=False)

print(f"Success! {len(processed_products)} products processed.")
