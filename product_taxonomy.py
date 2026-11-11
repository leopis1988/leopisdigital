"""Conservative, title-based product category and subcategory rules for Leopis Digital.

Only a small set of unmistakable cross-category errors are corrected automatically.
Everything else retains its supplied category and receives a best-effort subcategory.
"""
from __future__ import annotations
import re

CATEGORY_OVERRIDES = [
    (re.compile(r"\b(?:shoe|shoes)\s+(?:rack|organizer|organiser|storage)\b", re.I), "Home & Storage"),
    (re.compile(r"\b(?:wardrobe|closet organizer|closet organiser)\b", re.I), "Home & Storage"),
]

CATEGORY_ALIASES = {
    "audiospeakers": "Audio & Smartwatches",
    "audiosmartwatch": "Audio & Smartwatches",
    "babyneed": "Kids & Toys",
    "beautyfashion": "Health & Beauty",
    "commercialtoolshardware": "Tools & Hardware",
    "computeraccessories": "Electronics & Gadgets",
    "electricalitems": "Lighting & Solar",
    "electricalsupplies": "Lighting & Solar",
    "electronics": "Electronics & Gadgets",
    "healthandbeauty": "Health & Beauty",
    "healthpersonalcare": "Health & Beauty",
    "hardware": "Tools & Hardware",
    "homelivinghomeappliancesaccessories": "Home Appliances",
    "kidsbaby": "Kids & Toys",
    "kitchenhomeappliance": "Cleaning",
    "kitchengadgetshomeappliances": "Home Appliances",
    "ladiesfashion": "Clothing & Footwear",
    "outdoorhomeappliance": "Lighting & Solar",
    "personalcarebeautygadgets": "Health & Beauty",
    "securitycamera": "Electronics & Gadgets",
    "vehicleaccessoriesmotorbikeaccessories": "Car & Bike",
}

RULES = {
    "Audio & Smartwatches": [
        ("Earbuds & Earphones", r"earbud|earphone|headphone|headset|neckband"),
        ("Microphones", r"microphone|\bmic\b|karaoke mic"),
        ("Smartwatches", r"smart\s*watch|watch\b|fitness band"),
        ("Speakers", r"speaker|soundbar"),
    ],
    "Bags & Accessories": [
        ("Watches & Watch Cases", r"watch|wristwatch|timepiece"),
        ("Backpacks & Bags", r"backpack|\bbag\b|handbag|purse|wallet|tote"),
        ("Jewellery Storage", r"jewel(?:l)?ery\s*(?:box|organizer|organiser)|jewelry"),
        ("Wallets & Card Holders", r"wallet|card holder|card case"),
        ("Hair Accessories", r"hair tie|hair clip|rubber band|hair band"),
        ("Keychains & Small Accessories", r"key.?tag|key.?chain|keyring|tipan box"),
        ("Travel Organizers", r"travel\s*(?:organizer|organiser|pouch|bag)"),
    ],
    "Bathroom & Laundry": [
        ("Bathroom Accessories", r"toilet|soap|bathroom|shower|bath\b|towel|tissue holder"),
        ("Laundry & Washing Machine", r"washing machine|laundry|clothes?\s*(?:dryer|line|hanger)|drying rack"),
        ("Bathroom & Laundry Racks", r"\brack\b|shelf|storage"),
    ],
    "Car & Bike": [
        ("Phone Holders & Mounts", r"phone holder|phone mount|mobile holder|bike holder|car charger mount|wireless car charger"),
        ("Vehicle Jacks & Lifting", r"jack|vehicle lifting|hydraulic|hydrolic|scissor lift"),
        ("Tyre Pumps & Inflation", r"air pump|inflatable|air mattress|tyre|tire|inflation"),
        ("Car Storage & Covers", r"car storage|van cover|car cover|vehicle cover|tissue holder"),
        ("Car Cleaning", r"clean|micro\s*fib|cloth|duster|wash"),
        ("Scratch & Repair Accessories", r"scratch remover|repair pen|scratch"),
        ("Car Interior Accessories", r"visor|mirror|seat|dashboard|sunshade|interior"),
        ("Bike Accessories", r"bike|bicycle|motorcycle|helmet|cycle"),
    ],
    "Chargers & Cables": [
        ("Chargers & Adapters", r"charger|adapter|adaptor|power plug"),
        ("Charging Cables", r"cable|\bcord\b|wire|usb"),
    ],
    "Cleaning": [
        ("Cleaning Tools", r"duster|broom|mop|brush|sponge|cloth|wiper|scrub|squeegee"),
        ("Spray & Washing Tools", r"spray gun|water gun|pressure washer|water spray|wash gun"),
        ("Toilet & Bathroom Cleaning", r"toilet|bathroom|bowl cleaner|cleaning powder|cleaning tablet"),
        ("Cleaning Gloves & Covers", r"glove|dust cover|shoe cover"),
        ("Cleaning Cloths & Mats", r"mat|napkin|wipe|towel|floor mat"),
        ("Cleaning Gadgets", r"cleaning pen|pore cleaning|washing pad|silicone washing"),
        ("Cleaning Products", r"cleaner|cleaning liquid|detergent|stain remover|polish"),
        ("Laundry & Appliance Care", r"washing machine|laundry|clothes|washer|appliance cover"),
    ],
    "Clothing & Footwear": [
        ("Footwear", r"shoe|slipper|sandal|clog|sneaker|boot"),
        ("Clothing", r"dress|shirt|t-shirt|top\b|pant|trouser|vest|coat|raincoat|jacket|waist trainer|shaper"),
        ("Clothing Accessories", r"glove|sock|mask|belt|scarf|cap|hat"),
    ],
    "Electronics & Gadgets": [
        ("Batteries & Power", r"battery|power bank|voltage"),
        ("Cameras & Smart Devices", r"camera|wifi|wi-fi|smart device"),
        ("Calculators & Office Gadgets", r"calculator|laser pointer|alarm clock"),
        ("Phone Holders & Stands", r"phone holder|phone stand|mobile holder"),
        ("Power & Extension", r"extension|power strip|socket|plug|voltage|electric balloon"),
        ("Electronics Tools", r"air blower|blower|air duster|solder|electric tool"),
        ("Gadgets & Accessories", r"electronic|gadget|lamp|light|pump|usb|portable"),
    ],
    "Eyewear": [
        ("Sunglasses", r"sun\s*glass|sunglass"),
        ("Blue-Light & Eyeglasses", r"blue.?light|anti.?blue|eyeglass|spectacle|reading glass|optical"),
        ("Kids' Eyewear", r"kid|child|baby"),
    ],
    "Fashion & Travel": [
        ("Travel Accessories", r"travel|luggage|suitcase|neck pillow|organizer|organiser|bottle set"),
        ("Fashion & Shaping Wear", r"vest|shaper|trainer|belt|dress|shirt|clothing"),
        ("Rainwear & Umbrellas", r"raincoat|rain coat|umbrella|poncho"),
    ],
    "Fitness & Sports": [
        ("Workout & Gym Accessories", r"gym|workout|hand grip|ab trainer|weight|fitness|exercise"),
        ("Cycling & Outdoor Sports", r"cycling|bicycle|bike|glove|sport|outdoor"),
    ],
    "Groceries & Herbal": [
        ("Herbal Tea & Drinks", r"tea|drink|beverage|kola kanda|porridge"),
        ("Herbal Powders", r"powder|mix|flour"),
        ("Groceries & Pantry", r"grocery|food|snack|oil|spice|herbal"),
    ],
    "Health & Beauty": [
        ("Scales & Measuring", r"\bscale\b|weight scale|\d+\s*kg scale"),
        ("Support & Shaping Wear", r"posture|knee support|back support|body shaper|waist trainer|support belt"),
        ("Beauty & Massage Rollers", r"roller|massage roller|metal roller"),
        ("Mirrors & Beauty Accessories", r"mirror|soap box|pedicure|foot pad|detox|knee brace"),
        ("Hair Care & Styling", r"hair|dryer|trimmer|curl|straighten|comb|scalp"),
        ("Grooming & Shaving", r"\bt9\b|shaver|shaving|beard|razor|trimmer"),
        ("Massagers", r"massag|massage|neck|shoulder|foot massager"),
        ("Beauty Tools & Personal Care", r"beauty|makeup|cosmetic|brush|nail|skin|shaver|groom"),
    ],
    "Health & Personal Care": [
        ("Massage & Comfort", r"massage|hot bag|heat bag|slipper"),
        ("Personal Care", r"care|health|personal"),
    ],
    "Home & Storage": [
        ("Wardrobes & Cabinets", r"wardrobe|cupboard|cabinet|closet"),
        ("Shoe Racks & Organizers", r"shoe rack|shoe storage|shoe organizer|shoe organiser"),
        ("Mosquito Nets & Bedding", r"mosquito|bed net|folding net|mattress|bedding|pillow"),
        ("Furniture & Home Tables", r"stool|side table|laptop desk|coffee table|folding table|chair"),
        ("Wall Decor & Surface Covers", r"wall sticker|wallpaper|liner roll|table cloth|tablecloth|wall decal"),
        ("Home Safety & Utility", r"fire extinguisher|fire stop|fire blanket|shock pad|wall hook|hook|water zoom|water mat|soap dispenser"),
        ("Home Storage & Racks", r"storage|organi[sz]|organzier|rack|shelf|drawer|box|basket|cloth holder"),
        ("Home Essentials & Covers", r"rain coat|raincoat|cover|capsule cutter|multipurpose"),
    ],
    "Home Appliances": [
        ("Kitchen Appliances", r"maker|waffle|donut|idiyappam|steam iron|iron\b|sewing machine|grinder|egg boiler|cooking pot|mosquito racket"),
        ("Kitchen Appliances", r"kitchen|milk frother|noodle|noodles|chopper|mixer|cooker|blender"),
        ("Food Preparation Appliances", r"food processor|juicer|vacuum cleaner|water dispenser|impulse sealer|mosquito swatter"),
        ("Garment & Shoe Care", r"shoe dryer|dryer|sewing machine|iron|steamer"),
        ("Laundry Appliances", r"clothes dryer|clothes drying|washing machine|ironing|garment steamer"),
        ("Home Comfort Appliances", r"fan|heater|cooler|humidifier|air purifier"),
    ],
    "Jewellery": [
        ("Necklaces", r"necklace|pendant|chain"),
        ("Bracelets & Bangles", r"bracelet|bangle|wrist"),
        ("Rings & Earrings", r"ring|earring|studs"),
    ],
    "Kids & Toys": [
        ("Toys & Games", r"toy|game|puzzle|teddy|plush|basketball hoop|doll|car\b"),
        ("Baby & Kids Products", r"baby|kids?\b|child|infant|school bag|feeding"),
        ("Child Safety Accessories", r"corner|safety guard|protector|child safety"),
        ("Books & Learning Toys", r"book|cube|blocks|learning|educational"),
        ("Arts, Crafts & Learning", r"art|draw|paint|craft|color|colour|pencil|learning|educational|stationery"),
    ],
    "Kitchen & Dining": [
        ("Food Storage & Covers", r"food cover|silicone cover|rice bucket|airtight|storage container|food container"),
        ("Kitchen Storage & Racks", r"rack|storage|organizer|organiser|dispenser|holder|shelf|drawer"),
        ("Cookware & Bakeware", r"pan\b|pot\b|cookware|frying|bake|cooker|kettle|stove"),
        ("Tableware & Dining", r"plate|bowl|cup\b|mug|glass|cutlery|spoon|fork|knife set|dinner|serving"),
        ("Food Preparation Tools", r"garlic|peeler|chopper|slicer|grater|opener|kitchen tool|cutter|sharpener|knife|manual press"),
        ("Kitchen Cleaning & Drying", r"drainage basket|dish drying|drying mat|kitchen cleaning|air fryer paper|parchment"),
        ("Kitchen Linens & Surface Protection", r"table cloth|tablecloth|cutting board|kitchen mat"),
        ("Spice & Condiment Storage", r"spice|shaker|salt|pepper|seasoning"),
        ("Kitchen Scales & Baking Tools", r"kitchen scale|sf\s*400|cake smoother|baking|air fryer"),
        ("Lunch Boxes & Drinkware", r"lunch box|water bottle|flask|thermos|tumbler|insulated mug"),
    ],
    "Lighting & Solar": [
        ("Solar Lights", r"solar|solar charging"),
        ("Emergency & Portable Lighting", r"emergency|rechargeable|usb lamp|torch|flashlight"),
        ("Indoor & Outdoor Lighting", r"lamp|light|bulb|flood|wall light|ceiling"),
    ],
    "Men’s Health & Wellness / Sexual Wellness": [
        ("Men’s Wellness", r".+"),
    ],
    "Party & Stationery": [
        ("Party Supplies & Decorations", r"party|balloon|decoration|birthday|wrapping paper"),
        ("Stickers & Craft Supplies", r"sticker|tape roll|tape\b|envelope|red envelope"),
        ("Stationery & Writing", r"stationery|pen|pencil|notebook|holder|desk|school|office"),
    ],
    "Pet Supplies": [
        ("Pet Accessories", r"pet|dog|cat|harness|leash|collar|bird|animal"),
    ],
    "Phone Accessories": [
        ("Power Banks & Battery Packs", r"power bank|battery pack|portable charger"),
        ("Charging Cables & Adapters", r"cable|charger|charging|adapter|adaptor"),
        ("Stands, Selfie Sticks & Mounts", r"selfie|stick|tripod|stand|holder|mount|remote"),
        ("Phone Audio & Microphones", r"microphone|\bmic\b|earphone|earbud|headphone|speaker"),
    ],
    "Tools & Hardware": [
        ("Locks & Safety Hardware", r"lock|door closing|door stopper|water stopper|refrigerator safety|cabinet lock"),
        ("Brackets & Mounts", r"bracket|wall mount|tv wall"),
        ("Replacement Blades & Repair Parts", r"blade|blackhead needle|replacement part"),
        ("Scales & Measuring Tools", r"scale|measuring|measure|ruler|tape measure|weigh"),
        ("Tapes & Adhesives", r"tape|adhesive|seal|sealing|glue"),
        ("Hand Tools & Hardware", r"tool|wrench|spanner|screw|hammer|drill|pliers|hardware|repair"),
    ],
}


def classify_product(category: str, name: str, description: str = "") -> tuple[str, str]:
    category = str(category or "Uncategorized").strip() or "Uncategorized"
    category_key = re.sub(r"[^a-z0-9]", "", category.casefold())
    category = CATEGORY_ALIASES.get(category_key, category)
    name = str(name or "").strip()
    description = str(description or "").strip()
    if category.casefold() in {
        "laptop / mobile accessories", "mobile phone asseceries",
        "mobile phone asseceries / gadget", "mobile & car accessories",
    }:
        category = "Car & Bike" if re.search(r"\b(?:car|vehicle|bike|motorbike)\b", f"{name} {description}", re.I) else "Phone Accessories"
    # Avoid broad guesses: fix only unmistakable household storage misfiled as apparel.
    if category == "Clothing & Footwear" and re.search(r"\bshoe\s+(?:rack|organizer|organiser)\b", name, re.I):
        category = "Home & Storage"
    elif category != "Home & Storage" and re.search(r"\b(?:portable fabric wardrobe|wardrobe cupboard|shoe rack)\b", name, re.I):
        category = "Home & Storage"
    elif category == "Kids & Toys" and re.search(r"\b(?:dog|cat|pet)\s+(?:feeder|bowl|harness|leash)\b", name, re.I):
        category = "Pet Supplies"
    text = f"{name} {description}".casefold()
    for subcategory, pattern in RULES.get(category, []):
        if re.search(pattern, text, re.I):
            return category, subcategory
    return category, f"Other {category}"
