/* ====== EDIT THESE ====== */
const CONFIG = {
  whatsapp: "94783366466",   // WhatsApp எண்: நாட்டுக்குறியீடு + எண், + அல்லது இடைவெளி இல்லாமல்
  currency: "Rs.",
  perPage: 24,
  realPhotos: true           // true = p.image (URL அல்லது local path); false = எப்போதும் SVG placeholder
};
/* ======================== */

const T = {
  en: {hero:"Everything for your home, family and fitness", sub:"Home appliances, kitchen, baby, headphones, fashion and fitness. Delivered across Sri Lanka.",
    search:"Search products", all:"All categories", cart:"Cart", add:"Add to cart", total:"Total", name:"Your name", phone:"Phone number",
    address:"Delivery address", cod:"Cash on delivery", order:"Order via WhatsApp", empty:"Your cart is empty", none:"No products found",
    remove:"Remove", prev:"Prev", next:"Next", items:"products", s0:"Recommended", s1:"Price: low to high", s2:"Price: high to low", fill:"Please fill in name, phone and address.",
    shopnow:"Shop now", allp:"All products", f1:"Island-wide delivery", f2:"Cash on delivery across Sri Lanka", f3:"Order on WhatsApp", f4:"Quality products",
    wa:"Confirm photo & details on WhatsApp", code:"Code", gl:"See photos on Google", sample:"Product images may be supplier samples and may differ in colour or model. Confirm the exact item, specifications and availability on WhatsApp before ordering."},
  si: {hero:"ඔබේ නිවසට, පවුලට සහ ශරීර යෝග්‍යතාවයට අවශ්‍ය සියල්ල", sub:"ගෘහ උපකරණ, මුළුතැන්ගෙය, ළමා අවශ්‍යතා, හෙඩ්ෆෝන්, ඇඳුම් සහ ෆිට්නස්. ශ්‍රී ලංකාව පුරා බෙදාහරිනු ලැබේ.",
    search:"නිෂ්පාදන සොයන්න", all:"සියලුම ප්‍රවර්ග", cart:"කරත්තය", add:"කරත්තයට එක් කරන්න", total:"මුළු මුදල", name:"ඔබේ නම", phone:"දුරකථන අංකය",
    address:"බෙදාහැරීමේ ලිපිනය", cod:"බඩු ලැබුණු පසු මුදල් ගෙවීම", order:"WhatsApp හරහා ඇණවුම් කරන්න", empty:"කරත්තය හිස්ය", none:"නිෂ්පාදන හමු නොවීය",
    remove:"ඉවත් කරන්න", prev:"පෙර", next:"ඊළඟ", items:"නිෂ්පාදන", s0:"නිර්දේශිත", s1:"මිල: අඩු සිට වැඩි", s2:"මිල: වැඩි සිට අඩු", fill:"කරුණාකර නම, දුරකථන අංකය සහ ලිපිනය ඇතුළත් කරන්න.",
    shopnow:"දැන්ම මිලදී ගන්න", allp:"සියලුම නිෂ්පාදන", f1:"රට පුරා බෙදාහැරීම", f2:"ශ්‍රී ලංකාව පුරා බඩු ලැබුණු පසු මුදල් ගෙවීම", f3:"WhatsApp හරහා ඇණවුම්", f4:"ගුණාත්මක නිෂ්පාදන",
    wa:"WhatsApp හරහා සැබෑ ඡායාරූප සහ විස්තර", code:"කේතය", gl:"Google හි ඡායාරූප බලන්න", sample:"පෙන්වන රූපය නිදර්ශනයකි. සැබෑ ඡායාරූප සහ වැඩි විස්තර සඳහා WhatsApp හරහා අපෙන් අසන්න."},
  ta: {hero:"உங்கள் வீடு, குடும்பம் மற்றும் உடற்பயிற்சிக்கு தேவையான அனைத்தும்", sub:"வீட்டு உபகரணங்கள், சமையலறை, குழந்தைப் பொருட்கள், ஹெட்போன்கள், ஆடைகள் மற்றும் உடற்பயிற்சி. இலங்கை முழுவதும் விநியோகம்.",
    search:"பொருட்களைத் தேடுங்கள்", all:"அனைத்து வகைகள்", cart:"வண்டி", add:"வண்டியில் சேர்", total:"மொத்தம்", name:"உங்கள் பெயர்", phone:"தொலைபேசி எண்",
    address:"விநியோக முகவரி", cod:"பொருள் கிடைத்ததும் பணம் செலுத்துதல்", order:"WhatsApp மூலம் ஆர்டர் செய்யுங்கள்", empty:"வண்டி காலியாக உள்ளது", none:"பொருட்கள் எதுவும் இல்லை",
    remove:"நீக்கு", prev:"முந்தையது", next:"அடுத்தது", items:"பொருட்கள்", s0:"பரிந்துரைக்கப்பட்டவை", s1:"விலை: குறைவு முதல் அதிகம்", s2:"விலை: அதிகம் முதல் குறைவு", fill:"பெயர், தொலைபேசி எண் மற்றும் முகவரியை நிரப்பவும்.",
    shopnow:"இப்போதே வாங்குங்கள்", allp:"அனைத்து பொருட்கள்", f1:"நாடு முழுவதும் விநியோகம்", f2:"இலங்கை முழுவதும் பொருள் கிடைத்ததும் பணம்", f3:"WhatsApp மூலம் ஆர்டர்", f4:"தரமான பொருட்கள்",
    wa:"WhatsApp மூலம் உண்மையான படங்கள் மற்றும் விவரங்கள்", code:"குறியீடு", gl:"Google இல் படங்களைப் பார்க்க", sample:"காட்டப்படும் படம் மாதிரி மட்டுமே. உண்மையான படங்கள் மற்றும் மேலும் விவரங்களுக்கு WhatsApp இல் கேளுங்கள்."}
};

const $ = s => document.querySelector(s);
const store = {
  get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch (e) { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} }
};
let lang = store.get("lang", "en"), products = [], byId = {}, view = [], page = 1, cart = store.get("cart", {});
const t = k => T[lang][k];
const money = n => CONFIG.currency + " " + Number(n).toLocaleString("en-US");
const pname = p => p["name_" + lang] || p.name;
const waUrl = msg => "https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg);
const askMsg = p => "Hi Leopis, I would like real photos and more details for: " + p.name + " (Code " + p.id + "). Price: " + money(pr(p)) + (p.warranty ? " | " + p.warranty : "");
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

/* ===== 11.11 Flash Deals (Fochant products: reduced commission until sale ends) ===== */
const FLASH = { end: new Date("2026-11-11T23:59:59+05:30"), factor: 0.5 }; /* factor = share of normal commission kept during sale */
const tier = b => b < 1000 ? 220 : b <= 2000 ? 290 : b <= 3000 ? 340 : b <= 4400 ? 390 : 500;
const flashOn = () => Date.now() < FLASH.end.getTime();
const isFlash = p => flashOn() && p.base != null;
const pr = p => isFlash(p) ? p.base + Math.round(tier(p.base) * FLASH.factor) : p.price;
let flashOnly = false, clearOnly = false;
function priceEl(p, cls) {
  const d = el("div", cls, money(pr(p)));
  if (p.oldPrice && !isFlash(p)) {
    d.append(" ", el("s", "was", money(p.oldPrice)), " ", el("span", "off", "🏷️ -" + (p.discount || Math.round((1 - p.price / p.oldPrice) * 100)) + "%"));
  }
  if (isFlash(p)) {
    const old = el("s", "was", money(p.price)), off = Math.round((1 - pr(p) / p.price) * 100);
    d.append(" ", old, " ", el("span", "off", "⚡ " + ({en: "Save", si: "ඉතිරිය", ta: "சேமிப்பு"}[lang] || "Save") + " " + money(p.price - pr(p))));
  }
  return d;
}

const CAT_STYLE = {
  "Pet Supplies": ["#F093FB", "#F5576C", "M4.5 9.5a2 2 0 100-4 2 2 0 000 4zm4-3a2 2 0 100-4 2 2 0 000 4zm7 0a2 2 0 100-4 2 2 0 000 4zm4 3a2 2 0 100-4 2 2 0 000 4zM12 10c-3 0-6 3.5-6 6 0 1.7 1.3 3 3 3 1.2 0 2-.5 3-.5s1.8.5 3 .5c1.7 0 3-1.3 3-3 0-2.5-3-6-6-6z"],
  "Jewellery": ["#FBD786", "#C6426E", "M12 2l3 5-3 15-3-15 3-5zM6 3l-4 5 10 14L6 3zm12 0l4 5-10 14L18 3z"],
  "Groceries & Herbal": ["#56AB2F", "#A8E063", "M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 008 20c11 0 14-8 14-18-2.5 3-5.5 4-5 6z"],
  "Phone Accessories": ["#8E2DE2", "#4A00E0", "M17 1H7c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-2-2-2zm-5 21a1 1 0 110-2 1 1 0 010 2zm5-4H7V4h10v14z"],
  "Clothing & Footwear": ["#EE9CA7", "#FFDDE1", "M16 4l-2 2h-4L8 4 2 7l2 4 2-1v10h12V10l2 1 2-4-6-3z"],
  "Health & Beauty": ["#FF9A9E", "#F6416C", "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"],
  "Home & Storage": ["#667EEA", "#4A3F9A", "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"],
  "Cleaning": ["#4FACFE", "#00C6FB", "M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v2h2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9h2V7c0-1.1-.9-2-2-2zm-6 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"],
  "Electronics & Gadgets": ["#43E97B", "#38F9D7", "M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"],
  "Home Appliances": ["#FA709A", "#FEE140", "M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"],
  "Kitchen & Dining": ["#F6D365", "#FDA085", "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"],
  "Eyewear": ["#A18CD1", "#FBC2EB", "M3 14c0 2.21 1.79 4 4 4s4-1.79 4-4c0-1.13-.47-2.15-1.22-2.88L10.7 9h2.6l.92 2.12C13.47 11.85 13 12.87 13 14c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4H8c-2.21 0-4 1.79-4 4zm4 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm10 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"],
  "Kids & Toys": ["#FAD961", "#F76B1C", "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"],
  "Bags & Accessories": ["#30CFD0", "#330867", "M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2z"],
  "Audio & Smartwatches": ["#5B86E5", "#36D1DC", "M12 1c-4.97 0-9 4.03-9 9v7c0 1.66 1.34 3 3 3h3v-8H5v-2c0-3.87 3.13-7 7-7s7 3.13 7 7v2h-4v8h3c1.66 0 3-1.34 3-3v-7c0-4.97-4.03-9-9-9z"],
  "Chargers & Cables": ["#F7971E", "#FFD200", "M16 9v4.66l-3.5 3.51V19h-1v-1.83L8 13.65V9h8m0-6h-1v4h-2V3h-2v4H9V3H8v4h-.01C6.9 6.99 6 7.89 6 8.98v5.52L9.5 18v3h5v-3l3.5-3.49V9c0-1.1-.9-2-2-2V3z"],
  "Lighting & Solar": ["#FDC830", "#F37335", "M9 21c0 .55.45 1 1 1h4c.55 0 1-.45 1-1v-1H9v1zm3-19C8.14 2 5 5.14 5 9c0 2.38 1.19 4.47 3 5.74V17c0 .55.45 1 1 1h6c.55 0 1-.45 1-1v-2.26c1.81-1.27 3-3.36 3-5.74 0-3.86-3.14-7-7-7z"],
  "Tools & Hardware": ["#485563", "#29323C", "M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z"],
  "Car & Bike": ["#CB356B", "#BD3F32", "M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"],
  "Party & Stationery": ["#FF758C", "#FF7EB3", "M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"],
  "Fashion & Travel": ["#00B4DB", "#0083B0", "M21 16v-2l-8-5V3.5c0-.83-.67-1.5-1.5-1.5S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"],
  "Fitness & Sports": ["#11998E", "#38EF7D", "M20.57 14.86L22 13.43 20.57 12 17 15.57 8.43 7 12 3.43 10.57 2 9.14 3.43 7.71 2 5.57 4.14 4.14 2.71 2.71 4.14l1.43 1.43L2 7.71l1.43 1.43L2 10.57 3.43 12 7 8.43 15.57 17 12 20.57 13.43 22l1.43-1.43L16.29 22l2.14-2.14 1.43 1.43 1.43-1.43-1.43-1.43L22 16.29z"],
  "Bathroom & Laundry": ["#2193B0", "#6DD5ED", "M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z"]
};

function placeholder(p) {
  const [c1, c2, icon] = CAT_STYLE[p.category] || ["#6366F1", "#8B5CF6", "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"];
  const esc = s => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const lines = [""];
  p.name.split(" ").forEach(w => {
    const cur = lines[lines.length - 1], next = (cur + " " + w).trim();
    if (next.length > 22 && lines.length < 2 && cur) lines.push(w); else lines[lines.length - 1] = next;
  });
  if (lines[lines.length - 1].length > 24) lines[lines.length - 1] = lines[lines.length - 1].slice(0, 23) + "…";
  const y0 = lines.length === 1 ? 508 : 490;
  const text = lines.map((l, i) => '<text x="300" y="' + (y0 + i * 36) + '" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-size="28" font-weight="700" fill="#fff" text-anchor="middle">' + esc(l) + "</text>").join("");
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + c1 + '"/><stop offset="1" stop-color="' + c2 + '"/></linearGradient><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset=".55" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient></defs>' +
    '<rect width="600" height="600" fill="url(#g)"/><circle cx="90" cy="90" r="170" fill="#fff" fill-opacity=".08"/><circle cx="540" cy="470" r="200" fill="#fff" fill-opacity=".06"/>' +
    '<g transform="translate(300 230)"><circle r="105" fill="#fff" fill-opacity=".18"/><circle r="105" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="2"/><g transform="translate(-54 -54) scale(4.5)"><path d="' + icon + '" fill="#fff" fill-opacity=".96"/></g></g>' +
    '<rect width="600" height="600" fill="url(#s)"/>' + text +
    '<text x="300" y="568" font-family="Segoe UI,Helvetica,Arial,sans-serif" font-size="14" font-weight="700" fill="#fff" fill-opacity=".8" text-anchor="middle" letter-spacing="4">LEOPIS</text></svg>';
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

const css = document.createElement("style");
css.textContent = ".card .img,.card h3{cursor:pointer}.card h3{min-height:2.7em}.card .add{width:100%}" +
  ".wa-link{display:block;text-align:center;font-size:.76rem;font-weight:600;color:#128c4a;text-decoration:none;padding:.45rem 0 0;line-height:1.3}" +
  "#detailDlg .dhead h2{font-size:1.05rem}#detailDlg .pd{flex:1;overflow:auto;padding:0 1rem 1rem;display:grid;gap:.7rem;align-content:start}" +
  ".pd-img{aspect-ratio:1;border-radius:14px;overflow:hidden;background:#eef1f6}.pd-img img{width:100%;height:100%;object-fit:cover}" +
  ".card small.code{font-size:.7rem;word-break:break-all;color:#333;user-select:all}.was{color:#888;font-weight:500;font-size:.8em}.off{white-space:nowrap;display:inline-block;margin-top:.2rem;background:#ef3b2d;color:#fff;border-radius:5px;padding:.05rem .35rem;font-size:.72rem;font-weight:800}" +
  "#flash{max-width:1200px;margin:1rem auto;padding:1rem 1.2rem;border-radius:16px;color:#fff;background:linear-gradient(110deg,#ef3b2d,#ffc928);display:flex;flex-wrap:wrap;gap:.8rem;align-items:center;justify-content:space-between}#flash h2{margin:0;font-size:1.4rem}#flash p{margin:.2rem 0 0;font-size:.9rem}" +
  "#flash .cd{font-weight:800;font-size:1.3rem;letter-spacing:.03em;background:rgba(0,0,0,.25);padding:.3rem .7rem;border-radius:10px}#flash button{border:0;border-radius:10px;padding:.7rem 1.1rem;font-weight:800;cursor:pointer;background:#fff;color:#c1281d}" +
  ".wty{font-size:.78rem;font-weight:700;color:#0b6b3a;background:#e8f7ee;border-radius:6px;padding:.25rem .5rem;margin:.2rem 0;display:inline-block}.pd-desc{white-space:pre-line}" +
  ".pd-price{font-size:1.5rem;font-weight:800;color:var(--red)}.pd-desc{margin:0;line-height:1.6}" +
  ".wa-big{display:block;text-align:center;text-decoration:none;padding:.85rem;border-radius:10px;background:var(--wa);color:#06220f;font-weight:800}";
document.head.append(css);

/* ===== புதுப்பிக்கப்பட்டது: image element ===== */
const packs = {};
const loadPack = n => packs[n] || (packs[n] = fetch("imgpack_" + String(n).padStart(2, "0") + ".json").then(r => r.json()).catch(() => ({})));
function imgEl(p) {
  const i = new Image();
  i.loading = "lazy";
  i.alt = p.name;
  i.referrerPolicy = "no-referrer";           // hotlink protection-க்கு உதவும்
  i.onerror = () => { i.onerror = null; i.src = placeholder(p); };
  const src = (p.image || "").trim();
  if (p.pack) {
    i.src = placeholder(p);                   // pack load ஆகும் வரை placeholder
    loadPack(p.pack).then(m => { if (m[p.id]) { i.onerror = () => { i.onerror = null; i.src = placeholder(p); }; i.src = m[p.id]; } });
  } else if (src.startsWith("http")) {
    i.src = src;                              // fetch_images.py-யிலிருந்து web URL
  } else if (CONFIG.realPhotos && src) {
    i.src = src;                              // local /images/CODE.jpg
  } else {
    i.src = placeholder(p);                   // SVG fallback
  }
  return i;
}

function openDetail(p) {
  let d = $("#detailDlg");
  if (!d) { d = document.createElement("dialog"); d.id = "detailDlg"; document.body.append(d); d.addEventListener("click", e => { if (e.target === d) d.close(); }); }
  d.replaceChildren();
  const head = el("div", "dhead"), close = el("button", "", "✕");
  close.setAttribute("aria-label", "Close"); close.onclick = () => d.close();
  head.append(el("h2", "", pname(p)), close);
  const body = el("div", "pd"), im = el("div", "pd-img"); im.append(imgEl(p));
  const add = el("button", "add", t("add")); add.onclick = () => { addToCart(p.id); d.close(); };
  const wa = el("a", "wa-big", "💬 " + t("wa")); wa.href = waUrl(askMsg(p)); wa.target = "_blank"; wa.rel = "noopener";
  const gl = el("a", "wa-link", "🔍 " + t("gl")); gl.href = "https://www.google.com/search?tbm=isch&q=" + encodeURIComponent(p.name); gl.target = "_blank"; gl.rel = "noopener";
  body.append(im, el("small", "", t("code") + ": " + p.id + " · " + p.category), priceEl(p, "pd-price"),
    ...(p.warranty ? [el("div", "wty", "🛡️ " + p.warranty)] : []),
    el("p", "pd-desc", p.description || ""), add, wa, gl, el("p", "note", t("sample")), el("p", "note", t("cod")));
  d.append(head, body); d.showModal();
}

function applyLang() {
  document.documentElement.lang = lang;
  document.querySelectorAll("[data-t]").forEach(n => n.textContent = t(n.dataset.t));
  document.querySelectorAll("[data-ph]").forEach(n => n.placeholder = t(n.dataset.ph));
  document.querySelectorAll(".langs button").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
  const cat = $("#cat"), cur = cat.value;
  cat.replaceChildren(new Option(t("all"), ""));
  [...new Set(products.map(p => p.category))].sort().forEach(c => cat.add(new Option(c, c)));
  cat.value = cur;
  const s = $("#sort"), sv = s.value || "0";
  s.replaceChildren(new Option(t("s0"), "0"), new Option(t("s1"), "1"), new Option(t("s2"), "2"));
  s.value = sv;
  buildCatNav(); render(); renderCart(); buildRows();
}

function buildCatNav() {
  const nav = $("#catNav"); if (!nav) return;
  nav.replaceChildren();
  const mk = (label, val) => { const b = el("button", $("#cat").value === val ? "on" : "", label); b.onclick = () => goCat(val); nav.append(b); };
  mk(t("all"), "");
  [...new Set(products.map(p => p.category))].sort().forEach(c => mk(c, c));
}
function goCat(val) { clearOnly = false; $("#cat").value = val; filter(); buildCatNav(); $("#shop").scrollIntoView({behavior: "smooth"}); }

function filter() {
  const q = $("#q").value.trim().toLowerCase(), c = $("#cat").value, s = $("#sort").value;
  const qn = q.replace(/[\s_-]+/g, "");
  view = products.filter(p => (!c || p.category === c) && (!flashOnly || isFlash(p)) && (!clearOnly || p.oldPrice) &&
    (!q || (h => h.includes(q) || h.replace(/[\s_-]+/g, "").includes(qn))([p.name, p.name_si, p.name_ta, p.category, p.id, p.description].join(" ").toLowerCase())));
  if (s === "1") view.sort((a, b) => pr(a) - pr(b));
  if (s === "2") view.sort((a, b) => pr(b) - pr(a));
  page = 1; render();
}

function render() {
  const grid = $("#grid"), start = (page - 1) * CONFIG.perPage;
  grid.replaceChildren();
  $("#count").textContent = view.length.toLocaleString("en-US") + " " + t("items");
  if (!view.length) { grid.append(el("p", "empty", t("none"))); $("#pager").replaceChildren(); return; }
  view.slice(start, start + CONFIG.perPage).forEach(p => {
    const card = el("article", "card"), img = el("div", "img");
    img.append(imgEl(p)); img.onclick = () => openDetail(p);
    const info = el("div", "info"), title = el("h3", "", pname(p)); title.onclick = () => openDetail(p);
    const add = el("button", "add", t("add")); add.onclick = () => addToCart(p.id);
    const wa = el("a", "wa-link", "💬 " + t("wa")); wa.href = waUrl(askMsg(p)); wa.target = "_blank"; wa.rel = "noopener";
    info.append(title, el("small", "code", t("code") + ": " + p.id), el("small", "", p.category), priceEl(p, "price"));
    if (p.warranty) info.append(el("div", "wty", "🛡️ " + p.warranty));
    info.append(add, wa);
    card.append(img, info); grid.append(card);
  });
  renderPager();
}

function renderPager() {
  const pages = Math.ceil(view.length / CONFIG.perPage), nav = $("#pager");
  nav.replaceChildren();
  if (pages < 2) return;
  const btn = (label, p, on, dis) => { const b = el("button", on ? "on" : "", label); b.disabled = !!dis; b.onclick = () => { page = p; render(); scrollTo({top: 0}); }; nav.append(b); };
  btn(t("prev"), page - 1, false, page === 1);
  const set = new Set([1, pages, page - 1, page, page + 1]);
  let last = 0;
  [...set].filter(n => n >= 1 && n <= pages).sort((a, b) => a - b).forEach(n => {
    if (n - last > 1) nav.append(el("span", "", "…"));
    btn(n, n, n === page); last = n;
  });
  btn(t("next"), page + 1, false, page === pages);
}

function saveCart() { store.set("cart", cart); }
function addToCart(id) { cart[id] = (cart[id] || 0) + 1; saveCart(); renderCart(); }
function renderCart() {
  const box = $("#cartItems"); box.replaceChildren();
  let total = 0, count = 0;
  Object.entries(cart).forEach(([id, qty]) => {
    const p = byId[id]; if (!p) { delete cart[id]; return; }
    total += pr(p) * qty; count += qty;
    const row = el("div", "row"), q = el("div", "qty");
    const minus = el("button", "", "−"), plus = el("button", "", "+");
    minus.onclick = () => { cart[id]--; if (cart[id] < 1) delete cart[id]; saveCart(); renderCart(); };
    plus.onclick = () => addToCart(id);
    q.append(minus, el("span", "", qty), plus);
    const rm = el("button", "rm", t("remove")); rm.onclick = () => { delete cart[id]; saveCart(); renderCart(); };
    row.append(el("div", "", pname(p)), el("b", "", money(pr(p) * qty)), q, rm);
    box.append(row);
  });
  if (!count) box.append(el("p", "empty", t("empty")));
  $("#cartTotal").textContent = money(total);
  $("#cartCount").textContent = count;
  $("#order").disabled = !count;
}

function sendOrder() {
  const name = $("#cName").value.trim(), phone = $("#cPhone").value.trim(), addr = $("#cAddr").value.trim();
  if (!name || !phone || !addr) { alert(t("fill")); return; }
  let total = 0;
  const lines = Object.entries(cart).map(([id, qty], i) => {
    const p = byId[id]; total += pr(p) * qty;
    return (i + 1) + ") " + p.name + " [" + p.id + "] x" + qty + " = " + money(pr(p) * qty);
  });
  const msg = ["New order - Leopis", "", "Name: " + name, "Phone: " + phone, "Address: " + addr, "", ...lines, "", "Total: " + money(total), "Payment: Cash on delivery"].join("\n");
  window.open(waUrl(msg), "_blank");
}

fetch("products_final.json").then(r => r.json()).then(data => {
  products = data; data.forEach(p => byId[p.id] = p);
  view = products.slice();
  
applyLang(); buildFlash(true); buildExtras();
  const pid = new URLSearchParams(location.search).get("p"); if (pid && byId[pid]) openDetail(byId[pid]);
}).catch(() => { $("#grid").append(el("p", "empty", "Could not load products.json")); });

document.querySelectorAll(".langs button").forEach(b => b.onclick = () => { lang = b.dataset.lang; store.set("lang", lang); applyLang(); });
let timer; $("#q").addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(filter, 200); });
$("#cat").onchange = () => { clearOnly = false; filter(); buildCatNav(); }; $("#sort").onchange = filter;
$("#cartBtn").onclick = () => $("#cartDlg").showModal();
$("#closeCart").onclick = () => $("#cartDlg").close();
$("#cartDlg").addEventListener("click", e => { if (e.target.id === "cartDlg") e.target.close(); });
$("#order").onclick = sendOrder;
document.addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (b) goCat(b.dataset.cat); const dl = e.target.closest("[data-deals]"); if (dl) { $("#cat").value = ""; clearOnly = true; filter(); buildCatNav(); $("#shop").scrollIntoView({behavior: "smooth"}); } });
$("#waLink").href = waUrl("Hi Leopis");


/* ===== SETTINGS you can change ===== */
const SITE_RATING = null;  /* Hide the rating until it is backed by real customer feedback. */
const FAQ = {
  en: [
    ["How do I order?", "Add items to your cart, enter your name, phone number and address, then tap the order button. Your order opens in WhatsApp and we confirm it with you."],
    ["How do I pay?", "Payment is cash on delivery."],
    ["What are the 11.11 Flash Deals?", "Selected products have reduced prices until 11 November, 11:59 PM (Sri Lanka time). Prices go back to normal after that."],
    ["What warranty do products have?", "Warranty or replacement coverage varies by product and is shown only where confirmed. Please message us on WhatsApp to confirm coverage before ordering."],
    ["Are the photos real?", "Some product images are supplier samples and may differ from the exact item. Confirm the photo, model, specifications and availability on WhatsApp before ordering."],
    ["How long does delivery take and what does it cost?", "We confirm delivery time and charges with you on WhatsApp when we confirm your order."],
    ["What if there is a problem with my order?", "Message us on WhatsApp with your order details and we will help you."]
  ],
  si: [
    ["ඇණවුම් කරන්නේ කෙසේද?", "භාණ්ඩ කරත්තයට එක් කර, ඔබේ නම, දුරකථන අංකය සහ ලිපිනය ඇතුළත් කර ඇණවුම් බොත්තම ඔබන්න. ඇණවුම WhatsApp හි විවෘත වන අතර අපි එය තහවුරු කරන්නෙමු."],
    ["ගෙවන්නේ කෙසේද?", "ගෙවීම බඩු ලැබුණු විට මුදල් ගෙවීමෙනි (Cash on delivery)."],
    ["11.11 ෆ්ලෑෂ් ඩීල්ස් යනු කුමක්ද?", "තෝරාගත් භාණ්ඩ නොවැම්බර් 11 රාත්‍රී 11:59 (ශ්‍රී ලංකා වේලාව) දක්වා අඩු මිලට ලැබේ. ඉන්පසු මිල සාමාන්‍ය තත්ත්වයට පත් වේ."],
    ["භාණ්ඩවල වගකීම (warranty) කුමක්ද?", "වගකීම හෝ ප්‍රතිස්ථාපන ආවරණය භාණ්ඩය අනුව වෙනස් වන අතර තහවුරු කළ භාණ්ඩ සඳහා පමණක් පෙන්වනු ලැබේ. ඇණවුමට පෙර WhatsApp හරහා ආවරණය තහවුරු කරන්න."],
    ["පින්තූර සැබෑද?", "සමහර නිෂ්පාදන රූප සැපයුම්කරුගේ නිදර්ශන වන අතර නිවැරදි භාණ්ඩයෙන් වෙනස් විය හැක. ඇණවුමට පෙර WhatsApp හරහා රූපය, ආකෘතිය, විස්තර සහ ලබාගත හැකි බව තහවුරු කරන්න."],
    ["බෙදාහැරීමට කොපමණ කාලයක් ගතවේද, ගාස්තුව කීයද?", "ඔබේ ඇණවුම තහවුරු කරන විට බෙදාහැරීමේ කාලය සහ ගාස්තු WhatsApp හරහා දන්වන්නෙමු."],
    ["ඇණවුමේ ගැටලුවක් ඇත්නම්?", "ඇණවුම් විස්තර සමඟ WhatsApp හරහා අපට පණිවිඩයක් එවන්න, අපි උදව් කරන්නෙමු."]
  ],
  ta: [
    ["எப்படி ஆர்டர் செய்வது?", "பொருட்களை வண்டியில் சேர்த்து, உங்கள் பெயர், தொலைபேசி எண் மற்றும் முகவரியை உள்ளிட்டு ஆர்டர் பொத்தானை அழுத்துங்கள். ஆர்டர் WhatsApp இல் திறக்கும், நாங்கள் உறுதிப்படுத்துவோம்."],
    ["எப்படி பணம் செலுத்துவது?", "பொருள் கிடைக்கும்போது பணம் செலுத்தலாம் (Cash on delivery)."],
    ["11.11 ஃபிளாஷ் டீல்ஸ் என்றால் என்ன?", "தேர்ந்தெடுக்கப்பட்ட பொருட்கள் நவம்பர் 11 இரவு 11:59 (இலங்கை நேரம்) வரை குறைந்த விலையில் கிடைக்கும். அதன் பிறகு விலை வழக்கமான நிலைக்கு திரும்பும்."],
    ["பொருட்களுக்கு என்ன warranty உள்ளது?", "உத்தரவாதம் அல்லது மாற்று பாதுகாப்பு பொருளுக்கு ஏற்ப மாறுபடும்; உறுதிப்படுத்தப்பட்ட பொருட்களுக்கு மட்டும் காட்டப்படும். ஆர்டர் செய்வதற்கு முன் WhatsApp இல் உறுதிப்படுத்துங்கள்."],
    ["படங்கள் உண்மையானவையா?", "சில தயாரிப்பு படங்கள் சப்ளையர் மாதிரிகளாக இருக்கலாம்; சரியான பொருளிலிருந்து மாறுபடலாம். ஆர்டர் செய்வதற்கு முன் WhatsApp இல் படம், மாடல், விவரங்கள் மற்றும் இருப்பை உறுதிப்படுத்துங்கள்."],
    ["டெலிவரிக்கு எவ்வளவு நேரம், கட்டணம் எவ்வளவு?", "உங்கள் ஆர்டரை உறுதிப்படுத்தும்போது டெலிவரி நேரம் மற்றும் கட்டணத்தை WhatsApp இல் தெரிவிப்போம்."],
    ["ஆர்டரில் பிரச்சினை இருந்தால்?", "ஆர்டர் விவரங்களுடன் WhatsApp இல் எங்களுக்கு செய்தி அனுப்புங்கள், நாங்கள் உதவுவோம்."]
  ]
};
const FL = {
  en: {t: "11.11 Flash Deals from Leopis", s: "Special prices on selected products – limited time only", e: "Ends in", b: "Shop flash deals", a: "Show all products", r: "Customer rating", faq: "Frequently Asked Questions"},
  si: {t: "Leopis වෙතින් 11.11 ෆ්ලෑෂ් ඩීල්ස්", s: "තෝරාගත් භාණ්ඩ සඳහා විශේෂ මිල – සීමිත කාලයක් සඳහා පමණි", e: "අවසන් වීමට", b: "ෆ්ලෑෂ් ඩීල්ස් බලන්න", a: "සියලුම නිෂ්පාදන", r: "පාරිභෝගික ශ්‍රේණිගත කිරීම", faq: "නිතර ඇසෙන ප්‍රශ්න"},
  ta: {t: "Leopis வழங்கும் 11.11 ஃபிளாஷ் டீல்ஸ்", s: "தேர்ந்தெடுக்கப்பட்ட பொருட்களுக்கு சிறப்பு விலை – குறைந்த காலம் மட்டும்", e: "முடிய", b: "டீல்ஸ் பார்க்க", a: "அனைத்து பொருட்கள்", r: "வாடிக்கையாளர் மதிப்பீடு", faq: "அடிக்கடி கேட்கப்படும் கேள்விகள்"}
};
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const fcss = document.createElement("style");
fcss.textContent = "#flash{display:block}.fhead{display:flex;flex-wrap:wrap;gap:.8rem;align-items:center;justify-content:space-between}" +
  ".fstrip{overflow:hidden;margin-top:.9rem}.ftrack{display:flex;gap:.7rem;width:max-content;animation:fscroll 55s linear infinite}.fstrip:hover .ftrack,.fstrip:active .ftrack{animation-play-state:paused}" +
  "@keyframes fscroll{from{transform:translateX(0)}to{transform:translateX(-50%)}}" +
  ".fm{width:140px;flex:none;background:#fff;color:#141c2b;border-radius:12px;overflow:hidden;cursor:pointer;display:flex;flex-direction:column}" +
  ".fmi{aspect-ratio:1;background:#eef1f6}.fmi img{width:100%;height:100%;object-fit:cover;display:block}" +
  ".fmn{font-size:.78rem;font-weight:600;padding:.4rem .5rem 0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;min-height:2.6em}" +
  ".fmp{font-size:.82rem;font-weight:800;color:#ef3b2d;padding:.2rem .5rem .5rem}" +
  "@media (prefers-reduced-motion:reduce){.fstrip{overflow-x:auto}.ftrack{animation:none}}" +
  "#rating{max-width:1200px;margin:.6rem auto;padding:0 1rem;font-weight:700;color:#141c2b}" +
  "#faq{max-width:900px;margin:2rem auto;padding:0 1rem}#faq h2{margin:0 0 .8rem}#faq details{background:#fff;border:1px solid #e3e7ef;border-radius:12px;padding:.8rem 1rem;margin-bottom:.6rem}" +
  "#faq summary{font-weight:700;cursor:pointer}#faq details p{margin:.6rem 0 0;line-height:1.6;color:#444}";
fcss.textContent += "#newArrivals,#trending{display:flex;gap:.7rem;overflow-x:auto;padding:.2rem 1rem .8rem}";
document.head.append(fcss);
let flashPick = [], rowPick = null;
function buildRows() {
  if (!products.length) return;
  if (!rowPick) {
    const fresh = products.filter(p => /^\d{6}$/.test(p.id)).sort((a, b) => b.id - a.id).slice(0, 12);
    rowPick = {n: fresh, t: shuffle(products.filter(p => p.oldPrice && !fresh.includes(p))).slice(0, 12)};
  }
  [["#newArrivals", rowPick.n], ["#trending", rowPick.t]].forEach(([sel, list]) => { const b = $(sel); if (b) { b.replaceChildren(); list.forEach(p => b.append(miniCard(p))); } });
}
function miniCard(p) {
  const c = el("div", "fm"), im = el("div", "fmi");
  im.append(imgEl(p)); c.onclick = () => openDetail(p);
  c.append(im, el("div", "fmn", pname(p)), priceEl(p, "fmp"));
  return c;
}
function buildFlash(full) {
  let box = $("#flash");
  if (!flashOn()) { if (box) box.remove(); return; }
  const f = FL[lang] || FL.en;
  if (!box) { box = document.createElement("section"); box.id = "flash"; $("#shop").before(box); full = true; }
  if (full) {
    if (!flashPick.length && products.length) flashPick = shuffle(products.filter(isFlash)).slice(0, 16);
    const txt = el("div"); txt.append(el("h2", "", "⚡ " + f.t), el("p", "", f.s));
    const cd = el("div", "cd"); cd.id = "fcd";
    const btn = el("button", "", flashOnly ? f.a : f.b);
    btn.onclick = () => { flashOnly = !flashOnly; filter(); buildFlash(true); $("#shop").scrollIntoView({behavior: "smooth"}); };
    const head = el("div", "fhead"); head.append(txt, cd, btn);
    box.replaceChildren(head);
    if (flashPick.length) {
      const track = el("div", "ftrack"), strip = el("div", "fstrip");
      [...flashPick, ...flashPick].forEach(p => track.append(miniCard(p)));
      strip.append(track); box.append(strip);
    }
  }
  const left = Math.max(0, FLASH.end - Date.now()), pad = n => String(n).padStart(2, "0");
  const d = Math.floor(left / 864e5), h = Math.floor(left % 864e5 / 36e5), m = Math.floor(left % 36e5 / 6e4), s = Math.floor(left % 6e4 / 1e3);
  $("#fcd").textContent = f.e + " " + d + "d " + pad(h) + ":" + pad(m) + ":" + pad(s);
}
function buildExtras() {
  const f = FL[lang] || FL.en;
  if (SITE_RATING) {
    let r = $("#rating");
    if (!r) { r = el("div"); r.id = "rating"; $("#shop").before(r); }
    r.textContent = "⭐ " + SITE_RATING.toFixed(1) + "/5.0 · " + f.r;
  }
  let q = $("#faq");
  if (!q) { q = document.createElement("section"); q.id = "faq"; $("#pager").after(q); }
  q.replaceChildren(el("h2", "", f.faq));
  (FAQ[lang] || FAQ.en).forEach(([a, b]) => {
    const d = document.createElement("details"), s = document.createElement("summary");
    s.textContent = a; d.append(s, el("p", "", b)); q.append(d);
  });
}
setInterval(() => { if (!flashOn() && $("#flash")) { flashOnly = false; filter(); renderCart(); } buildFlash(false); }, 1000);
document.querySelectorAll(".langs button").forEach(b => b.addEventListener("click", () => { buildFlash(true); buildExtras(); }));
applyLang(); buildFlash(true); buildExtras();
