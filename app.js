Object.assign(T.en, {shopnow:"Shop now", allp:"All products", f1:"Island-wide delivery", f2:"Cash on delivery across Sri Lanka", f3:"Order on WhatsApp", f4:"Quality products"});
Object.assign(T.si, {shopnow:"දැන්ම මිලදී ගන්න", allp:"සියලුම නිෂ්පාදන", f1:"රට පුරා බෙදාහැරීම", f2:"ශ්‍රී ලංකාව පුරා බඩු ලැබුණු පසු මුදල් ගෙවීම", f3:"WhatsApp හරහා ඇණවුම්", f4:"ගුණාත්මක නිෂ්පාදන"});
Object.assign(T.ta, {shopnow:"இப்போதே வாங்குங்கள்", allp:"அனைத்து பொருட்கள்", f1:"நாடு முழுவதும் விநியோகம்", f2:"இலங்கை முழுவதும் பொருள் கிடைத்ததும் பணம்", f3:"WhatsApp மூலம் ஆர்டர்", f4:"தரமான பொருட்கள்"});

function buildCatNav() {
  const nav = $("#catNav"); if (!nav) return;
  nav.replaceChildren();
  const mk = (label, val) => {
    const b = el("button", $("#cat").value === val ? "on" : "", label);
    b.onclick = () => goCat(val); nav.append(b);
  };
  mk(t("all"), "");
  [...new Set(products.map(p => p.category))].sort().forEach(c => mk(c, c));
}
function goCat(val) { $("#cat").value = val; filter(); buildCatNav(); $("#shop").scrollIntoView({behavior: "smooth"}); }
document.addEventListener("click", e => { const b = e.target.closest("[data-cat]"); if (b) goCat(b.dataset.cat); });
$("#waLink").href = "https://wa.me/" + CONFIG.whatsapp;
const _apply = applyLang;
applyLang = function () { _apply(); buildCatNav(); };
