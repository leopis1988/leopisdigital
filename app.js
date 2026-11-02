/* ====== EDIT THESE ====== */
const CONFIG = {
  whatsapp: "94783366466",   // your WhatsApp number: country code + number, no + or spaces
  currency: "Rs.",
  perPage: 24
};
/* ======================== */

const T = {
  en: {hero:"Everything for your home, family and fitness", sub:"Home appliances, kitchen, baby, headphones, fashion and fitness. Delivered across Sri Lanka.",
    search:"Search products", all:"All categories", cart:"Cart", add:"Add to cart", total:"Total", name:"Your name", phone:"Phone number",
    address:"Delivery address", cod:"Cash on delivery", order:"Order via WhatsApp", empty:"Your cart is empty", none:"No products found",
    remove:"Remove", prev:"Prev", next:"Next", items:"products", s0:"Recommended", s1:"Price: low to high", s2:"Price: high to low", fill:"Please fill in name, phone and address."},
  si: {hero:"ඔබේ නිවසට, පවුලට සහ ශරීර යෝග්‍යතාවයට අවශ්‍ය සියල්ල", sub:"ගෘහ උපකරණ, මුළුතැන්ගෙය, ළමා අවශ්‍යතා, හෙඩ්ෆෝන්, ඇඳුම් සහ ෆිට්නස්. ශ්‍රී ලංකාව පුරා බෙදාහරිනු ලැබේ.",
    search:"නිෂ්පාදන සොයන්න", all:"සියලුම ප්‍රවර්ග", cart:"කරත්තය", add:"කරත්තයට එක් කරන්න", total:"මුළු මුදල", name:"ඔබේ නම", phone:"දුරකථන අංකය",
    address:"බෙදාහැරීමේ ලිපිනය", cod:"බඩු ලැබුණු පසු මුදල් ගෙවීම", order:"WhatsApp හරහා ඇණවුම් කරන්න", empty:"කරත්තය හිස්ය", none:"නිෂ්පාදන හමු නොවීය",
    remove:"ඉවත් කරන්න", prev:"පෙර", next:"ඊළඟ", items:"නිෂ්පාදන", s0:"නිර්දේශිත", s1:"මිල: අඩු සිට වැඩි", s2:"මිල: වැඩි සිට අඩු", fill:"කරුණාකර නම, දුරකථන අංකය සහ ලිපිනය ඇතුළත් කරන්න."},
  ta: {hero:"உங்கள் வீடு, குடும்பம் மற்றும் உடற்பயிற்சிக்கு தேவையான அனைத்தும்", sub:"வீட்டு உபகரணங்கள், சமையலறை, குழந்தைப் பொருட்கள், ஹெட்போன்கள், ஆடைகள் மற்றும் உடற்பயிற்சி. இலங்கை முழுவதும் விநியோகம்.",
    search:"பொருட்களைத் தேடுங்கள்", all:"அனைத்து வகைகள்", cart:"வண்டி", add:"வண்டியில் சேர்", total:"மொத்தம்", name:"உங்கள் பெயர்", phone:"தொலைபேசி எண்",
    address:"விநியோக முகவரி", cod:"பொருள் கிடைத்ததும் பணம் செலுத்துதல்", order:"WhatsApp மூலம் ஆர்டர் செய்யுங்கள்", empty:"வண்டி காலியாக உள்ளது", none:"பொருட்கள் எதுவும் இல்லை",
    remove:"நீக்கு", prev:"முந்தையது", next:"அடுத்தது", items:"பொருட்கள்", s0:"பரிந்துரைக்கப்பட்டவை", s1:"விலை: குறைவு முதல் அதிகம்", s2:"விலை: அதிகம் முதல் குறைவு", fill:"பெயர், தொலைபேசி எண் மற்றும் முகவரியை நிரப்பவும்."}
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
function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; }

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
  render(); renderCart();
}

function filter() {
  const q = $("#q").value.trim().toLowerCase(), c = $("#cat").value, s = $("#sort").value;
  view = products.filter(p => (!c || p.category === c) &&
    (!q || [p.name, p.name_si, p.name_ta, p.category, p.id].join(" ").toLowerCase().includes(q)));
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
    if (p.image) { const i = new Image(); i.loading = "lazy"; i.alt = pname(p); i.src = p.image; i.onerror = () => { i.remove(); img.textContent = "🦁"; }; img.append(i); }
    else img.textContent = "🦁";
    const info = el("div", "info"), price = el("div", "price", money(p.price));
    if (p.old_price) price.append(el("span", "old", money(p.old_price)));
    const add = el("button", "add", t("add")); add.onclick = () => addToCart(p.id);
    info.append(el("h3", "", pname(p)), el("small", "", p.category), price, add);
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
  window.open("https://wa.me/" + CONFIG.whatsapp + "?text=" + encodeURIComponent(msg), "_blank");
}

fetch("products.json").then(r => r.json()).then(data => {
  products = data; data.forEach(p => byId[p.id] = p);
  view = products.slice();
  applyLang();
}).catch(() => { $("#grid").append(el("p", "empty", "Could not load products.json")); });

document.querySelectorAll(".langs button").forEach(b => b.onclick = () => { lang = b.dataset.lang; store.set("lang", lang); applyLang(); });
let timer; $("#q").addEventListener("input", () => { clearTimeout(timer); timer = setTimeout(filter, 200); });
$("#cat").onchange = filter; $("#sort").onchange = filter;
$("#cartBtn").onclick = () => $("#cartDlg").showModal();
$("#closeCart").onclick = () => $("#cartDlg").close();
$("#cartDlg").addEventListener("click", e => { if (e.target.id === "cartDlg") e.target.close(); });
$("#order").onclick = sendOrder;
applyLang();
