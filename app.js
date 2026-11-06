/* ═══════════════ CONFIG ═══════════════ */
const CONFIG = {
  whatsapp: "94783366466",
  currency: "Rs.",
  perPage: 24,
};

/* ═══════════════ TRANSLATIONS ═══════════════ */
const T = {
  en: { cart:"Cart", add:"Add to cart", total:"Total", remove:"Remove", prev:"Prev", next:"Next",
        items:"products", s0:"Recommended", s1:"Price: low → high", s2:"Price: high → low",
        fill:"Please fill name, phone, address.", empty:"Your cart is empty", none:"No products found",
        cod:"Cash on delivery", order:"Order via WhatsApp", wa:"Ask on WhatsApp",
        warranty:"Warranty", all:"All" },
  si: { cart:"කරත්තය", add:"කරත්තයට", total:"මුළු මුදල", remove:"ඉවත්", prev:"පෙර", next:"ඊළඟ",
        items:"නිෂ්පාදන", s0:"නිර්දේශිත", s1:"මිල ↑", s2:"මිල ↓",
        fill:"නම, දුරකථනය, ලිපිනය පුරවන්න.", empty:"කරත්තය හිස්", none:"නිෂ්පාදන නැත",
        cod:"බඩු ලැබුණු පසු මුදල්", order:"WhatsApp ඇණවුම", wa:"WhatsApp විස්තර",
        warranty:"වගකීම", all:"සියල්ල" },
  ta: { cart:"வண்டி", add:"வண்டியில்", total:"மொத்தம்", remove:"நீக்கு", prev:"முந்தையது", next:"அடுத்தது",
        items:"பொருட்கள்", s0:"பரிந்துரை", s1:"விலை ↑", s2:"விலை ↓",
        fill:"பெயர், தொலைபேசி, முகவரி நிரப்பவும்.", empty:"வண்டி காலி", none:"பொருட்கள் இல்லை",
        cod:"பொருள் வந்தபின் பணம்", order:"WhatsApp ஆர்டர்", wa:"WhatsApp விவரம்",
        warranty:"உத்தரவாதம்", all:"அனைத்தும்" }
};

const $  = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];
const store = {
  get(k,d){ try{ return JSON.parse(localStorage.getItem(k)) ?? d; }catch{ return d; } },
  set(k,v){ try{ localStorage.setItem(k, JSON.stringify(v)); }catch{} }
};

let lang  = store.get("lang","en");
let cart  = store.get("cart",{});
let all   = [], byId = {}, view = [], page = 1, specialFilter = null;

const t     = k => T[lang][k];
const money = n => CONFIG.currency + " " + Number(n).toLocaleString("en-US");
const pname = p => p["name_"+lang] || p.name;
const waUrl = m => "https://wa.me/"+CONFIG.whatsapp+"?text="+encodeURIComponent(m);
const askMsg = p => `Hi Leopis, I want details for: ${p.name} (Code ${p.id}). Price: ${money(p.price)}`;

function el(tag, cls, text){
  const e = document.createElement(tag);
  if(cls) e.className = cls;
  if(text != null) e.textContent = text;
  return e;
}

/* ═══════════════ PLACEHOLDER SVG ═══════════════ */
const CAT_COLOR = {
  "Home Appliances":       ["#FA709A","#FEE140"],
  "Electronics & Gadgets": ["#43E97B","#38F9D7"],
  "Kitchen & Dining":      ["#F6D365","#FDA085"],
  "Health & Beauty":       ["#FF9A9E","#F6416C"],
  "Kids & Toys":           ["#FAD961","#F76B1C"],
  "Audio & Smartwatches":  ["#5B86E5","#36D1DC"],
  "Lighting & Solar":      ["#FDC830","#F37335"],
  "Car & Bike":            ["#CB356B","#BD3F32"],
};
function placeholder(p){
  const [c1,c2] = CAT_COLOR[p.category] || ["#667EEA","#764BA2"];
  const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 600">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/>
    </linearGradient></defs>
    <rect width="600" height="600" fill="url(#g)"/>
    <circle cx="300" cy="240" r="100" fill="#fff" fill-opacity=".18"/>
    <text x="300" y="480" font-family="Arial" font-size="26" font-weight="700"
          fill="#fff" text-anchor="middle">${esc(p.name.slice(0,24))}</text>
    <text x="300" y="560" font-family="Arial" font-size="14" font-weight="700"
          fill="#fff" fill-opacity=".7" text-anchor="middle" letter-spacing="4">LEOPIS</text>
  </svg>`;
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
}

function imgEl(p, eager=false){
  const i = new Image();
  i.alt = p.name;
  if(!eager) i.loading = "lazy";
  i.referrerPolicy = "no-referrer";
  i.decoding = "async";
  i.onerror = () => { i.onerror = null; i.src = placeholder(p); };
  i.src = p.image && p.image.startsWith("http") ? p.image : placeholder(p);
  return i;
}

/* ═══════════════ CARD ═══════════════ */
function makeCard(p, compact=false){
  const card = el("article", "card" + (compact ? " compact" : ""));
  const img  = el("div", "img");
  img.append(imgEl(p));
  img.onclick = () => openDetail(p);

  const info   = el("div", "info");
  const badges = el("div", "badges");
  if(p.flag === "new")      badges.append(el("span","flag new","NEW"));
  if(p.flag === "trending") badges.append(el("span","flag trend","🔥 TREND"));
  if(p.warranty){
    const wb = el("span","wbadge " + p.warranty.type.toLowerCase().replace(/\s+/g,"-"));
    wb.textContent = "🛡 " + p.warranty.period;
    wb.title = p.warranty.text;
    badges.append(wb);
  }

  const title = el("h3","", pname(p));
  title.onclick = () => openDetail(p);

  const price = el("div","price", money(p.price));
  const add   = el("button","add", t("add"));
  add.onclick = () => addToCart(p.id);

  const wa = el("a","wa-link","💬 " + t("wa"));
  wa.href = waUrl(askMsg(p)); wa.target = "_blank"; wa.rel = "noopener";

  info.append(badges, title, el("small","", p.category), price, add, wa);
  card.append(img, info);
  return card;
}

/* ═══════════════ SECTIONS ═══════════════ */
function renderRow(target, items){
  target.replaceChildren();
  if(!items.length) return;
  const frag = document.createDocumentFragment();
  items.forEach(p => frag.append(makeCard(p, true)));
  target.append(frag);
}

function renderNewAndTrending(){
  const newItems   = all.filter(p => p.flag === "new").slice(0, 12);
  const trendItems = all.filter(p => p.flag === "trending").slice(0, 12);
  renderRow($("#newArrivals"), newItems);
  renderRow($("#trending"),    trendItems);
  if(!newItems.length)   $("#new-section").style.display   = "none";
  if(!trendItems.length) $("#trend-section").style.display = "none";
}

function renderCatGrid(){
  const grid = $("#catGrid");
  grid.replaceChildren();
  const counts = {};
  all.forEach(p => counts[p.category] = (counts[p.category] || 0) + 1);
  const frag = document.createDocumentFragment();
  Object.keys(counts).sort().forEach(c => {
    const tile = el("button","cat-tile");
    tile.innerHTML = `<b>${c}</b><small>${counts[c]} items</small>`;
    tile.onclick = () => {
      specialFilter = null;
      $("#cat").value = c;
      filter();
      $("#shop").scrollIntoView({behavior:"smooth"});
    };
    frag.append(tile);
  });
  grid.append(frag);
}

/* ═══════════════ CATEGORY NAV ═══════════════ */
function buildCatNav(){
  const nav = $("#catNav");
  nav.replaceChildren();

  const mk = (label, value, key) => {
    const on = specialFilter ? specialFilter === key
                             : ($("#cat").value === value && !specialFilter);
    const b = el("button", on ? "on" : "", label);
    b.onclick = () => {
      if(key === "new" || key === "trending"){
        specialFilter = key;
        $("#cat").value = "";
      } else {
        specialFilter = null;
        $("#cat").value = value;
      }
      filter();
      buildCatNav();
      $("#shop").scrollIntoView({behavior:"smooth"});
    };
    nav.append(b);
  };

  mk("🆕 New Arrivals", "", "new");
  mk("🔥 Trending",   "", "trending");
  mk(t("all"),        "", null);
  [...new Set(all.map(p=>p.category))].sort().forEach(c => mk(c, c, null));
}

/* ═══════════════ FILTER / RENDER ═══════════════ */
function filter(){
  const q = $("#q").value.trim().toLowerCase();
  const c = $("#cat").value;
  const s = $("#sort").value;

  view = all.filter(p => {
    if(specialFilter && p.flag !== specialFilter) return false;
    if(c && p.category !== c) return false;
    if(q && !(p.name + " " + p.category + " " + p.id + " " + p.description).toLowerCase().includes(q)) return false;
    return true;
  });

  if(s === "1") view.sort((a,b) => a.price - b.price);
  if(s === "2") view.sort((a,b) => b.price - a.price);

  page = 1;
  render();
}

function render(){
  const grid = $("#grid");
  grid.replaceChildren();
  $("#count").textContent = `${view.length.toLocaleString()} ${t("items")}`;

  if(!view.length){
    grid.append(el("p","empty", t("none")));
    $("#pager").replaceChildren();
    return;
  }

  const start = (page - 1) * CONFIG.perPage;
  const slice = view.slice(start, start + CONFIG.perPage);
  const frag  = document.createDocumentFragment();
  slice.forEach(p => frag.append(makeCard(p)));
  grid.append(frag);
  renderPager();
}

function renderPager(){
  const pages = Math.ceil(view.length / CONFIG.perPage);
  const nav = $("#pager");
  nav.replaceChildren();
  if(pages < 2) return;

  const mk = (label, p, on, dis) => {
    const b = el("button", on ? "on" : "", label);
    b.disabled = !!dis;
    b.onclick = () => { page = p; render(); window.scrollTo({top:0, behavior:"smooth"}); };
    nav.append(b);
  };

  mk(t("prev"), page-1, false, page === 1);
  const set = new Set([1, pages, page-1, page, page+1]);
  let last = 0;
  [...set].filter(n => n>=1 && n<=pages).sort((a,b)=>a-b).forEach(n => {
    if(n - last > 1) nav.append(el("span","","…"));
    mk(n, n, n === page);
    last = n;
  });
  mk(t("next"), page+1, false, page === pages);
}

/* ═══════════════ DETAIL DIALOG ═══════════════ */
function openDetail(p){
  const d = $("#detailDlg");
  $("#dTitle").textContent = pname(p);
  const body = $("#dBody");
  body.replaceChildren();

  const imgWrap = el("div","pd-img");
  imgWrap.append(imgEl(p, true));

  const priceRow = el("div","price-row");
  priceRow.append(el("div","pd-price", money(p.price)));
  if(p.flag === "new")      priceRow.append(el("span","flag new","NEW"));
  if(p.flag === "trending") priceRow.append(el("span","flag trend","🔥 TREND"));

  const w = p.warranty || {};
  const wCard = el("div","wcard");
  wCard.innerHTML = `
    <div class="wcard-head">🛡 ${t("warranty")} — ${w.period || "—"}</div>
    <div class="wcard-type">${w.type || ""}</div>
    <p>${w.text || ""}</p>`;

  const add = el("button","add", t("add"));
  add.onclick = () => { addToCart(p.id); d.close(); };

  const wa = el("a","wa-big","💬 " + t("wa"));
  wa.href = waUrl(askMsg(p)); wa.target = "_blank"; wa.rel = "noopener";

  body.append(
    imgWrap,
    el("small","", `${p.id} · ${p.category}`),
    priceRow,
    el("p","pd-desc", p.description || ""),
    wCard, add, wa,
    el("p","note", t("cod"))
  );
  d.showModal();
}

/* ═══════════════ CART ═══════════════ */
function saveCart(){ store.set("cart", cart); }
function addToCart(id){ cart[id] = (cart[id]||0)+1; saveCart(); renderCart(); }

function renderCart(){
  const box = $("#cartItems");
  box.replaceChildren();
  let total = 0, count = 0;

  Object.entries(cart).forEach(([id, qty]) => {
    const p = byId[id];
    if(!p){ delete cart[id]; return; }
    total += p.price * qty;
    count += qty;

    const row   = el("div","row");
    const q     = el("div","qty");
    const minus = el("button","","−");
    const plus  = el("button","","+");
    minus.onclick = () => { cart[id]--; if(cart[id]<1) delete cart[id]; saveCart(); renderCart(); };
    plus.onclick  = () => addToCart(id);
    q.append(minus, el("span","",qty), plus);

    const rm = el("button","rm", t("remove"));
    rm.onclick = () => { delete cart[id]; saveCart(); renderCart(); };

    row.append(el("div","", pname(p)), el("b","", money(p.price*qty)), q, rm);
    box.append(row);
  });

  if(!count) box.append(el("p","empty", t("empty")));
  $("#cartTotal").textContent = money(total);
  $("#cartCount").textContent = count;
  $("#order").disabled = !count;
}

function sendOrder(){
  const name  = $("#cName").value.trim();
  const phone = $("#cPhone").value.trim();
  const addr  = $("#cAddr").value.trim();
  if(!name || !phone || !addr){ alert(t("fill")); return; }

  let total = 0;
  const lines = Object.entries(cart).map(([id,qty], i) => {
    const p = byId[id]; total += p.price * qty;
    return `${i+1}) ${p.name} [${p.id}] ×${qty} = ${money(p.price*qty)}`;
  });

  const msg = [
    "New order — Leopis",
    `Name: ${name}`, `Phone: ${phone}`, `Address: ${addr}`, "",
    ...lines, "", `Total: ${money(total)}`, "Payment: Cash on delivery"
  ].join("\n");

  window.open(waUrl(msg), "_blank");
}

/* ═══════════════ LANGUAGE ═══════════════ */
function applyLang(){
  document.documentElement.lang = lang;
  $$(".langs button").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
  $$("[data-t]").forEach(n => n.textContent = t(n.dataset.t));
  buildCatSelect();
  buildSortSelect();
  buildCatNav();
  render();
  renderCart();
}

function buildCatSelect(){
  const sel = $("#cat"), cur = sel.value;
  sel.replaceChildren(new Option(t("all"), ""));
  [...new Set(all.map(p=>p.category))].sort().forEach(c => sel.add(new Option(c, c)));
  sel.value = cur;
}

function buildSortSelect(){
  const sel = $("#sort"), cur = sel.value || "0";
  sel.replaceChildren(
    new Option(t("s0"),"0"),
    new Option(t("s1"),"1"),
    new Option(t("s2"),"2")
  );
  sel.value = cur;
}

/* ═══════════════ LOAD CATALOG (version-based cache) ═══════════════ */
async function loadCatalog(){
  let version = "0";
  try {
    const vres = await fetch("catalog_version.txt", { cache: "no-cache" });
    if(vres.ok) version = (await vres.text()).trim();
  } catch {}

  const key = "catalog_v_" + version;
  const cached = store.get(key);
  if(cached && Array.isArray(cached) && cached.length){
    all = cached;
    return;
  }

  const res = await fetch("catalog.json", { cache: "no-cache" });
  all = await res.json();
  store.set(key, all);

  try {
    Object.keys(localStorage)
      .filter(k => k.startsWith("catalog_v_") && k !== key)
      .forEach(k => localStorage.removeItem(k));
  } catch {}
}

/* ═══════════════ INIT ═══════════════ */
async function init(){
  await loadCatalog();
  all.forEach(p => byId[p.id] = p);
  view = all.slice();

  renderNewAndTrending();
  renderCatGrid();
  applyLang();

  $$(".langs button").forEach(b => b.onclick = () => {
    lang = b.dataset.lang; store.set("lang", lang); applyLang();
  });

  let tmr;
  $("#q").addEventListener("input", () => {
    clearTimeout(tmr);
    tmr = setTimeout(filter, 200);
  });

  $("#cat").onchange  = () => { specialFilter = null; filter(); buildCatNav(); };
  $("#sort").onchange = filter;

  $("#cartBtn").onclick   = () => $("#cartDlg").showModal();
  $("#closeCart").onclick = () => $("#cartDlg").close();
  $("#cartDlg").addEventListener("click", e => { if(e.target.id === "cartDlg") e.target.close(); });
  $("#order").onclick = sendOrder;

  $("#dClose").onclick = () => $("#detailDlg").close();
  $("#detailDlg").addEventListener("click", e => { if(e.target.id === "detailDlg") e.target.close(); });

  $("#waLink").href = waUrl("Hi Leopis");

  document.addEventListener("click", e => {
    const b = e.target.closest("[data-cat]");
    if(!b) return;
    const val = b.dataset.cat;
    if(val === "New Arrivals"){ specialFilter = "new"; $("#cat").value = ""; }
    else if(val === "Trending"){ specialFilter = "trending"; $("#cat").value = ""; }
    else { specialFilter = null; $("#cat").value = val; }
    filter(); buildCatNav();
    $("#shop").scrollIntoView({behavior:"smooth"});
  });
}

init().catch(err => {
  console.error(err);
  $("#grid").append(el("p","empty","Could not load catalog.json"));
});
