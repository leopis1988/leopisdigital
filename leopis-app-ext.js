```javascript
// leopis-app-ext.js — Auto-Sync, App Gmail Orders, Share & Chatbot for leopisdigital.com
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// 1. Replace with your Firebase Web App Config (from Firebase Console)
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const ADMIN_EMAIL = "director.leopis@gmail.com";
const WA_NUMBER = "94783366466";

// Detect if opened inside Mobile App (WebView / PWA / ?mode=app)
const isAppMode =
  new URLSearchParams(window.location.search).get("mode") === "app" ||
  /; wv\)/i.test(navigator.userAgent) ||
  window.matchMedia("(display-mode: standalone)").matches;

// --- A. APP-ONLY GMAIL ORDER ROUTING (Website stays WhatsApp) ---
(function setupOrderRouting() {
  const orderBtn = document.getElementById("order");
  if (!orderBtn) return;

  if (isAppMode) {
    orderBtn.textContent = "Place Order (Email Confirmation)";
    orderBtn.style.background = "#1558ca";
  }

  orderBtn.addEventListener("click", async function (e) {
    if (!isAppMode) return; // Website continues to WhatsApp normally

    e.preventDefault();
    e.stopImmediatePropagation();

    const name = (document.getElementById("cName")?.value || "").trim();
    const phone = (document.getElementById("cPhone")?.value || "").trim();
    const addr = (document.getElementById("cAddr")?.value || "").trim();
    const pay = document.getElementById("paymentMethod")?.value || "cod";
    const items = document.getElementById("cartItems")?.innerText || "";
    const total = document.getElementById("cartTotal")?.innerText || "";

    if (!name || !phone || !addr) {
      alert("Please enter your Name, Mobile Number, and Delivery Address.");
      return;
    }

    orderBtn.disabled = true;
    orderBtn.textContent = "Sending Order...";

    try {
      const res = await fetch(`https://formsubmit.co/ajax/${ADMIN_EMAIL}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          _subject: `New App Order from ${name} (${total})`,
          Customer_Name: name,
          Phone: phone,
          Address: addr,
          Payment_Method: pay.toUpperCase(),
          Order_Items: items,
          Total: total,
          Source: "Leopis Mobile App"
        })
      });
      if (res.ok) {
        alert("Order placed! Confirmation sent to Leopis Digital.");
        document.getElementById("cartDlg")?.close();
      } else {
        throw new Error("Send failed");
      }
    } catch {
      alert("Could not send email right now. Please try again.");
    } finally {
      orderBtn.disabled = false;
      orderBtn.textContent = "Place Order (Email Confirmation)";
    }
  }, true);
})();

// --- B. PRODUCT SHARE BUTTON IN DETAIL MODAL ---
(function setupShareButton() {
  const dlg = document.getElementById("detailDlg");
  const dHead = dlg?.querySelector(".dhead");
  if (!dHead || document.getElementById("leoShareProdBtn")) return;

  const shareBtn = document.createElement("button");
  shareBtn.id = "leoShareProdBtn";
  shareBtn.type = "button";
  shareBtn.textContent = "Share";
  shareBtn.style.cssText = "margin-left:auto;margin-right:10px;background:#1558ca;color:#fff;border:none;border-radius:8px;padding:6px 12px;font-weight:600;cursor:pointer;font-size:13px;";
  dHead.insertBefore(shareBtn, document.getElementById("dClose"));

  shareBtn.onclick = async () => {
    const title = document.getElementById("dTitle")?.textContent || "Leopis Digital Product";
    const url = window.location.href;
    if (navigator.share) {
      try { await navigator.share({ title, text: `Check out ${title} on Leopis Digital!`, url }); } catch {}
    } else {
      await navigator.clipboard?.writeText(`${title} - ${url}`);
      alert("Product link copied!");
    }
  };
})();

// --- C. FIREBASE FIRESTORE AUTO-SYNC (Promotions, Added/Edited & Removed Products) ---
if (firebaseConfig.apiKey !== "YOUR_API_KEY") {
  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  // Sync Promotions Banner
  onSnapshot(collection(db, "promotions"), snap => {
    const banner = document.getElementById("leopis-promo-banner");
    if (!banner) return;
    const active = [];
    snap.forEach(d => { if (d.data().active) active.push(d.data()); });
    if (!active.length) { banner.style.display = "none"; return; }
    const p = active[0];
    banner.style.display = "block";
    banner.innerHTML = `<div style="background:linear-gradient(90deg,#1558ca,#ff6f00);color:#fff;padding:10px 14px;text-align:center;font-weight:700;font-size:14px;">${p.badge ? `<span style="background:#fff;color:#1558ca;padding:2px 8px;border-radius:99px;margin-right:8px;font-size:12px;">${p.badge}</span>` : ""}${p.title}</div>`;
  });

  // Sync Custom/Edited Products & Hidden Product Codes
  onSnapshot(collection(db, "products"), snap => {
    const customBox = document.getElementById("leopis-custom-products");
    if (!customBox) return;
    const hiddenCodes = new Set();
    const cards = [];

    snap.forEach(d => {
      const p = d.data();
      if (p.removed) {
        if (p.code) hiddenCodes.add(p.code.toUpperCase());
        return;
      }
      const msg = encodeURIComponent(`Hello Leopis! I want to order: ${p.name} (${p.code || ""}) - Rs. ${p.price}`);
      const actionBtn = isAppMode
        ? `<button onclick="alert('Please add to Cart or contact ${ADMIN_EMAIL}')" style="background:#1558ca;color:#fff;border:none;padding:8px;border-radius:8px;font-weight:700;cursor:pointer;">Order via Email</button>`
        : `<a href="https://wa.me/${WA_NUMBER}?text=${msg}" target="_blank" style="text-align:center;background:#25d366;color:#fff;text-decoration:none;padding:8px;border-radius:8px;font-weight:700;font-size:13px;">Order via WhatsApp</a>`;

      cards.push(`
        <div class="card" style="background:#fff;border:1px solid #e2e8f0;border-radius:12px;padding:12px;display:flex;flex-direction:column;gap:6px;">
          <img src="${p.image || "logo.png"}" alt="${p.name}" style="width:100%;height:170px;object-fit:cover;border-radius:8px;">
          <small style="color:#64748b;">${p.category || ""} ${p.code ? "• " + p.code : ""}</small>
          <strong>${p.name}</strong>
          <small style="color:#475569;">${p.description || ""}</small>
          <b style="color:#1558ca;font-size:16px;">Rs. ${p.price}</b>
          <div style="display:flex;gap:6px;margin-top:auto;">
            ${actionBtn}
            <button type="button" onclick="navigator.share ? navigator.share({title:'${p.name}',url:location.href}) : alert('Link copied!')" style="background:#f1f5f9;border:1px solid #cbd5e1;border-radius:8px;padding:8px 10px;cursor:pointer;font-weight:600;">Share</button>
          </div>
        </div>`);
    });

    customBox.innerHTML = cards.length
      ? `<h2 class="title">✨ Featured &amp; Updated Products</h2><div class="grid" style="margin-bottom:24px;">${cards.join("")}</div>`
      : "";

    // Hide any existing products marked as removed in Admin Panel
    if (hiddenCodes.size) {
      document.querySelectorAll("#grid > *, #newArrivals > *, #trending > *").forEach(el => {
        const txt = el.innerText.toUpperCase();
        hiddenCodes.forEach(code => { if (txt.includes(code)) el.style.display = "none"; });
      });
    }
  });
}

// --- D. FLOATING CHATBOT WIDGET ---
(function setupChatbot() {
  const style = document.createElement("style");
  style.textContent = `
    #leo-chat-btn{position:fixed;bottom:18px;right:18px;background:#1558ca;color:#fff;border:none;border-radius:99px;padding:12px 18px;font-weight:700;box-shadow:0 4px 14px rgba(0,0,0,.25);cursor:pointer;z-index:9999}
    #leo-chat-box{position:fixed;bottom:74px;right:18px;width:300px;max-width:90vw;background:#fff;border-radius:14px;box-shadow:0 8px 28px rgba(0,0,0,.2);z-index:9999;display:none;flex-direction:column;overflow:hidden;border:1px solid #e2e8f0}
    #leo-chat-head{background:#1558ca;color:#fff;padding:12px 14px;font-weight:700;display:flex;justify-content:space-between;align-items:center}
    #leo-chat-body{padding:12px;max-height:240px;overflow-y:auto;font-size:13px;background:#f8fafc;display:flex;flex-direction:column;gap:8px}
    .leo-msg{padding:8px 10px;border-radius:10px;max-width:85%;line-height:1.4}
    .leo-bot{background:#e0e7ff;color:#1e293b;align-self:flex-start}
    .leo-user{background:#1558ca;color:#fff;align-self:flex-end}
    #leo-chat-opts{padding:10px;display:flex;flex-wrap:wrap;gap:6px;border-top:1px solid #e2e8f0;background:#fff}
    .leo-opt{font-size:12px;padding:6px 10px;border-radius:99px;border:1px solid #1558ca;background:#fff;color:#1558ca;cursor:pointer;font-weight:600}
  `;
  document.head.appendChild(style);

  const btn = document.createElement("button");
  btn.id = "leo-chat-btn";
  btn.textContent = "Chat with Leopis";
  document.body.appendChild(btn);

  const box = document.createElement("div");
  box.id = "leo-chat-box";
  box.innerHTML = `
    <div id="leo-chat-head"><span>Leopis Assistant</span><span id="leo-close" style="cursor:pointer;font-size:18px;">&times;</span></div>
    <div id="leo-chat-body"><div class="leo-msg leo-bot">வணக்கம்! / ආයුබෝවන්! How can we help you today?</div></div>
    <div id="leo-chat-opts">
      <button class="leo-opt" data-q="cod">Cash on Delivery?</button>
      <button class="leo-opt" data-q="warranty">Checking Warranty?</button>
      <button class="leo-opt" data-q="contact">Contact Support</button>
    </div>`;
  document.body.appendChild(box);

  const body = box.querySelector("#leo-chat-body");
  const replies = {
    cod: "Yes! Island-wide Cash on Delivery across Sri Lanka.",
    warranty: "Selected electronics & watches include Checking Warranty — inspect before paying.",
    contact: isAppMode ? `Email us anytime at ${ADMIN_EMAIL}` : "Opening WhatsApp (+94 78 336 6466)..."
  };
  btn.onclick = () => (box.style.display = box.style.display === "flex" ? "none" : "flex");
  box.querySelector("#leo-close").onclick = () => (box.style.display = "none");
  box.querySelectorAll(".leo-opt").forEach(o => {
    o.onclick = () => {
      const k = o.dataset.q;
      body.innerHTML += `<div class="leo-msg leo-user">${o.textContent}</div><div class="leo-msg leo-bot">${replies[k]}</div>`;
      body.scrollTop = body.scrollHeight;
      if (k === "contact" && !isAppMode) {
        setTimeout(() => window.open(`https://wa.me/${WA_NUMBER}`, "_blank"), 600);
      }
    };
  });
})();
```
