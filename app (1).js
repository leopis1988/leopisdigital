/* ====== EDIT THESE ====== */
const CONFIG = {
  whatsapp: "94771234567",   // your WhatsApp number: country code + number, no + or spaces
  currency: "Rs.",
  perPage: 24,
  realPhotos: false          // change to true after you upload real photos to /images (named CODE.jpg)
};
/* ======================== */

const T = {
  en: {hero:"Everything for your home, family and fitness", sub:"Home appliances, kitchen, baby, headphones, fashion and fitness. Delivered across Sri Lanka.",
    search:"Search products", all:"All categories", cart:"Cart", add:"Add to cart", total:"Total", name:"Your name", phone:"Phone number",
    address:"Delivery address", cod:"Cash on delivery", order:"Order via WhatsApp", empty:"Your cart is empty", none:"No products found",
    remove:"Remove", prev:"Prev", next:"Next", items:"products", s0:"Recommended", s1:"Price: low to high", s2:"Price: high to low", fill:"Please fill in name, phone and address.",
    shopnow:"Shop now", allp:"All products", f1:"Island-wide delivery", f2:"Cash on delivery across Sri Lanka", f3:"Order on WhatsApp", f4:"Quality products",
    wa:"Real photos & details on WhatsApp", code:"Code", sample:"Image shown is a sample. Ask us on WhatsApp for real photos and more details."},
  si: {hero:"ඔබේ නිවසට, පවුලට සහ ශරීර යෝග්‍යතාවයට අවශ්‍ය සියල්ල", sub:"ගෘහ උපකරණ, මුළුතැන්ගෙය, ළමා අවශ්‍යතා, හෙඩ්ෆෝන්, ඇඳුම් සහ ෆිට්නස්. ශ්‍රී ලංකාව පුරා බෙදාහරිනු ලැබේ.",
    search:"නිෂ්පාදන සොයන්න", all:"සියලුම ප්‍රවර්ග", cart:"කරත්තය", add:"කරත්තයට එක් කරන්න", total:"මුළු මුදල", name:"ඔබේ නම", phone:"දුරකථන අංකය",
    address:"බෙදාහැරීමේ ලිපිනය", cod:"බඩු ලැබුණු පසු මුදල් ගෙවීම", order:"WhatsApp හරහා ඇණවුම් කරන්න", empty:"කරත්තය හිස්ය", none:"නිෂ්පාදන හමු නොවීය",
    remove:"ඉවත් කරන්න", prev:"පෙර", next:"ඊළඟ", items:"නිෂ්පාදන", s0:"නිර්දේශිත", s1:"මිල: අඩු සිට වැඩි", s2:"මිල: වැඩි සිට අඩු", fill:"කරුණාකර නම, දුරකථන අංකය සහ ලිපිනය ඇතුළත් කරන්න.",
    shopnow:"දැන්ම මිලදී ගන්න", allp:"සියලුම නිෂ්පාදන", f1:"රට පුරා බෙදාහැරීම", f2:"ශ්‍රී ලංකාව පුරා බඩු ලැබුණු පසු මුදල් ගෙවීම", f3:"WhatsApp හරහා ඇණවුම්", f4:"ගුණාත්මක නිෂ්පාදන",
    wa:"WhatsApp හරහා සැබෑ ඡායාරූප සහ විස්තර", code:"කේතය", sample:"පෙන්වන රූපය නිදර්ශනයකි. සැබෑ ඡායාරූප සහ වැඩි විස්තර සඳහා WhatsApp හරහා අපෙන් අසන්න."},
  ta: {hero:"உங்கள் வீடு, குடும்பம் மற்றும் உடற்பயிற்சிக்கு தேவையான அனைத்தும்", sub:"வீட்டு உபகரணங்கள், சமையலறை, குழந்தைப் பொருட்கள், ஹெட்போன்கள், ஆடைகள் மற்றும் உடற்பயிற்சி. இலங்கை முழுவதும் விநியோகம்.",
    search:"பொருட்களைத் தேடுங்கள்", all:"அனைத்து வகைகள்", cart:"வண்டி", add:"வண்டியில் சேர்", total:"மொத்தம்", name:"உங்கள் பெயர்", phone:"தொலைபேசி எண்",
    address:"விநியோக முகவரி", cod:"பொருள் கிடைத்ததும் பணம் செலுத்துதல்", order:"WhatsApp மூலம் ஆர்டர் செய்யுங்கள்", empty:"வண்டி காலியாக உள்ளது", none:"பொருட்கள் எதுவும் இல்லை",
    remove:"நீக்கு", prev:"முந்தையது", next:"அடுத்தது", items:"பொருட்கள்", s0:"பரிந்துரைக்கப்பட்டவை", s1:"விலை: குறைவு முதல் அதிகம்", s2:"விலை: அதிகம் முதல் குறைவு", fill:"பெயர், தொலைபேசி எண் மற்றும் முகவரியை நிரப்பவும்.",
    shopnow:"இப்போதே வாங்குங்கள்", allp:"அனைத்து பொருட்கள்", f1:"நாடு முழுவதும் விநியோகம்", f2:"இலங்கை முழுவதும் பொருள் கிடைத்ததும் பணம்", f3:"WhatsApp மூலம் ஆர்டர்", f4:"தரமான பொருட்கள்",
    wa:"WhatsApp மூலம் உண்மையான படங்கள் மற்றும் விவரங்கள்", code:"குறியீடு", sample:"காட்டப்படும் படம் மாதிரி மட்டுமே. உண்மையான படங்கள் மற்றும் மேலும் விவரங்களுக்கு WhatsApp இல் கேளுங்கள்."}
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
const askMsg = p => "Hi Leopis, I would like real photos and more details for: " + p.name + " (Code " + p.id + "). Price: " + money(p.price);
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

const CAT_STYLE = {
  "Health & Beauty": ["#FF9A9E", "#F6416C", "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"],
  "Home & Storage": ["#667EEA", "#4A3F9A", "M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"],
  "Cleaning": ["#4FACFE", "#00C6FB", "M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v2h2v10c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V9h2V7c0-1.1-.9-2-2-2zm-6 12c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"],
  "Electronics & Gadgets": ["#43E97B", "#38F9D7", "M17 1.01L7 1c-1.1 0-2 .9-2 2v18c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V3c0-1.1-.9-1.99-2-1.99zM17 19H7V5h10v14z"],
  "Home Appliances": ["#FA709A", "#FEE140", "M11 21h-1l1-7H7.5c-.58 0-.57-.32-.38-.66.19-.34.05-.08.07-.12C8.48 10.94 10.42 7.54 13 3h1l-1 7h3.5c.49 0 .56.33.47.51l-.07.15C12.96 17.55 11 21 11 21z"],
  "Kitchen & Dining": ["#F6D365", "#FDA085", "M11 9H9V2H7v7H5V2H3v7c0 2.12 1.66 3.84 3.75 3.97V22h2.5v-9.03C11.34 12.84 13 11.12 13 9V2h-2v7zm5-3v8h2.5v8H21V2c-2.76 0-5 2.24-5 4z"],
  "Eyewear": ["#A18CD1", "#FBC2EB", "M3 14c0 2.21 1.79 4 4 4s4-1.79 4-4c0-1.13-.47-2.15-1.22-2.88L10.7 9h2.6l.92 2.12C13.47 11.85 13 12.87 13 14c0 2.21 1.79 4 4 4s4-1.79 4-4-1.79-4-4-4H8c-2.21 0-4 1.79-4 4zm4 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm10 0c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2z"],
  "Kids & Toys": ["#FAD961", "#F76B1C", "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"],
  "Bags & Accessories": ["#30CFD0", "#330867", "M18 6h-2c0-2.21-1.79-4-4-4S8 3.79 8 6H6c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2zm-6-2c1.1 0 2 .9 2 2h-4c0-1.1.9-2 2-2z"]
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
  ".pd-price{font-size:1.5rem;font-weight:800;color:var(--red)}.pd-desc{margin:0;line-height:1.6}" +
  ".wa-big{display:block;text-align:center;text-decoration:none;padding:.85rem;border-radius:10px;background:var(--wa);color:#06220f;font-weight:800}";
document.head.append(css);

function imgEl(p) {
  const i = new Image(); i.loading = "lazy"; i.alt = p.name;
  i.onerror = () => { i.onerror = null; i.src = placeholder(p); };
  i.src = (CONFIG.realPhotos && p.image) ? p.image : placeholder(p);
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
  body.append(im, el("small", "", t("code") + ": " + p.id + " · " + p.category), el("div", "pd-price", money(p.price)),
    el("p", "pd-desc", p.description || ""), add, wa, el("p", "note", t("sample")), el("p", "note", t("cod")));
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
  buildCatNav(); render(); renderCart();
}

function buildCatNav() {
  const nav = $("#catNav"); if (!nav) return;
  nav.replaceChildren();
  const mk = (label, val) => { const b = el("button", $("#cat").value === val ? "on" : "", label); b.onclick = () => goCat(val); nav.append(b); };
  mk(t("all"), "");
  [...new Set(products.map(p => p.category))].sort().forEach(c => mk(c, c));
}
function goCat(val) { $("#cat").value = val; filter(); buildCatNav(); $("#shop").scrollIntoView({behavior: "smooth"}); }

function filter() {
  const q = $("#q").value.trim().toLowerCase(), c = $("#cat").value, s = $("#sort").value;
  view = products.filter(p => (!c || p.category === c) &&
    (!q || [p.name, p.name_si, p.name_ta, p.category, p.id, p.description].join(" ").toLowerCase().includes(q)));
  if (s === "1") view.sort((a, b) => a.price - b.price);
  if (s === "2") view.sort((a, b) => b.price - a.price);
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
    info.append(title, el("small", "", p.category), el("div", "price", money(p.price)), add, wa);
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
    total += p.price * qty; count += qty;
    const row = el("div", "row"), q = el("div", "qty");
    const minus = el("button", "", "−"), plus = el("button", "", "+");
    minus.onclick = () => { cart[id]--; if (cart[id] < 1) delete cart[id]; saveCart(); renderCart(); };
    plus.onclick = () => addToCart(id);
    q.append(minus, el("span", "", qty), plus);
    const rm = el("button", "rm", t("remove")); rm.onclick = () => { delete cart[id]; saveCart(); renderCart(); };
    row.append(el("div", "", pname(p)), el("b", "", money(p.price * qty)), q, rm);
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
    const p = byId[id]; total += p.price * qty;
    return (i + 1) + ") " + p.name + " [" + p.id + "] x" + qty + " = " + money(p.price * qty);
  });
  const msg = ["New order - Leopis", "", "Name: " + name, "Phone: " + phone, "Address: " + addr, "", ...lines, "", "Total: " + money(total), "Payment: Cash on delivery"].join("\n");
  window.open(waUrl(msg), "_blank");
}

fetch("products.json").then(r => r.json()).then(data => {
  products = data; data.forEach(p => byId[p.id] = p);
  view = products.slice();
  applyLang();
}).catch(() => { $("#grid").append(el("p", "empty", "Could not load products.json")); });

document.querySelectorAll(".langs button").forEach(b => b.onclick = () => { lang = b.dataset.lang; store.set("lang", lang); applyLang(); });
let timer; $("#q").addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(filter, 200); });
$("#cat").onchange = () => { filter(); buildCatNav(); }; $("#sort").onchange = filter;
$("#cartBtn").onclick = () => $("#cartDlg").showModal();
$("#closeCart").onclick = () => $("#cartDlg").close();
$("#cartDlg").addEventListener("click", e => { if (e.target.id === "cartDlg") e.target.close(); });
$("#order").onclick = sendOrder;
document.addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (b) goCat(b.dataset.cat); });
$("#waLink").href = waUrl("Hi Leopis");
applyLang();
