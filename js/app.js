let ALL_PRODUCTS = [];
let filteredProducts = [];
let currentPage = 1;
const PER_PAGE = STORE_CONFIG.productsPerPage;
let cart = JSON.parse(localStorage.getItem("leopisdigital_cart") || "[]");

document.addEventListener("DOMContentLoaded", async () => {
  ALL_PRODUCTS = await loadProducts();
  filteredProducts = [...ALL_PRODUCTS];
  renderCategories();
  renderProducts();
  renderPagination();
  populateFooterLinks();
  initFaqAccordion();
  initSearchSort();
  initCartUI();
  initMobileMenu();
  document.getElementById("year").textContent = new Date().getFullYear();
});

function renderCategories() {
  const cats = [...new Set(ALL_PRODUCTS.map(p => p.category).filter(Boolean))].sort();
  const container = document.getElementById("categoryChips");
  container.innerHTML = `<button class="chip active" data-cat="all">All</button>` +
    cats.map(c => `<button class="chip" data-cat="${c}">${c}</button>`).join("");
  container.querySelectorAll(".chip").forEach(btn => {
    btn.addEventListener("click", () => {
      container.querySelectorAll(".chip").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      const cat = btn.dataset.cat;
      filteredProducts = cat === "all"
        ? [...ALL_PRODUCTS]
        : ALL_PRODUCTS.filter(p => p.category === cat);
      currentPage = 1;
      renderProducts();
      renderPagination();
    });
  });
}

function renderProducts() {
  const grid = document.getElementById("productGrid");
  const start = (currentPage - 1) * PER_PAGE;
  const pageItems = filteredProducts.slice(start, start + PER_PAGE);

  if (pageItems.length === 0) {
    grid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--muted);padding:40px 0;">No products found.</p>`;
    return;
  }

  grid.innerHTML = pageItems.map(p => `
    <article class="product-card">
      <div class="product-img">
        <img src="${p.image || 'assets/placeholder.png'}" alt="${p.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/400?text=No+Image'">
        ${p.category ? `<span class="product-cat-tag">${p.category}</span>` : ""}
      </div>
      <div class="product-body">
        <h3 class="product-name">${p.name}</h3>
        <div class="product-price">$${Number(p.price).toFixed(2)}</div>
        <div class="product-actions">
          <button class="add-cart-btn" data-id="${p.id}">Add to Cart</button>
          <button class="wa-quick-btn" data-id="${p.id}" aria-label="Order on WhatsApp"><i class="fab fa-whatsapp"></i></button>
        </div>
      </div>
    </article>
  `).join("");

  grid.querySelectorAll(".add-cart-btn").forEach(btn =>
    btn.addEventListener("click", () => addToCart(btn.dataset.id))
  );
  grid.querySelectorAll(".wa-quick-btn").forEach(btn =>
    btn.addEventListener("click", () => quickWhatsApp(btn.dataset.id))
  );
}

function renderPagination() {
  const totalPages = Math.ceil(filteredProducts.length / PER_PAGE);
  const container = document.getElementById("pagination");
  if (totalPages <= 1) { container.innerHTML = ""; return; }

  let html = `<button class="page-btn" ${currentPage === 1 ? "disabled" : ""} data-page="${currentPage - 1}">‹</button>`;
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      html += `<button class="page-btn ${i === currentPage ? "active" : ""}" data-page="${i}">${i}</button>`;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      html += `<span style="align-self:center;">…</span>`;
    }
  }
  html += `<button class="page-btn" ${currentPage === totalPages ? "disabled" : ""} data-page="${currentPage + 1}">›</button>`;
  container.innerHTML = html;

  container.querySelectorAll(".page-btn[data-page]").forEach(btn => {
    btn.addEventListener("click", () => {
      const page = Number(btn.dataset.page);
      if (page < 1 || page > totalPages) return;
      currentPage = page;
      renderProducts();
      renderPagination();
      document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
    });
  });
}

function initSearchSort() {
  const search = document.getElementById("searchInput");
  const sort = document.getElementById("sortSelect");

  const apply = () => {
    const q = search.value.toLowerCase().trim();
    let list = [...ALL_PRODUCTS];
    if (q) list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      (p.category || "").toLowerCase().includes(q)
    );
    const s = sort.value;
    if (s === "price-asc") list.sort((a, b) => a.price - b.price);
    if (s === "price-desc") list.sort((a, b) => b.price - a.price);
    if (s === "name-asc") list.sort((a, b) => a.name.localeCompare(b.name));
    filteredProducts = list;
    currentPage = 1;
    renderProducts();
    renderPagination();
  };

  search.addEventListener("input", debounce(apply, 250));
  sort.addEventListener("change", apply);
}

function debounce(fn, ms) {
  let t; return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
}

function addToCart(id) {
  const product = ALL_PRODUCTS.find(p => p.id == id);
  if (!product) return;
  const existing = cart.find(c => c.id == id);
  if (existing) existing.qty++;
  else cart.push({ ...product, qty: 1 });
  persistCart();
  updateCartUI();
  openCart();
}

function persistCart() {
  localStorage.setItem("leopisdigital_cart", JSON.stringify(cart));
}

function updateCartUI() {
  document.getElementById("cartCount").textContent = cart.reduce((s, c) => s + c.qty, 0);
  const itemsEl = document.getElementById("cartItems");
  if (cart.length === 0) {
    itemsEl.innerHTML = `<p style="color:var(--muted);text-align:center;padding:40px 0;">Your cart is empty.</p>`;
  } else {
    itemsEl.innerHTML = cart.map(c => `
      <div class="cart-item">
        <img src="${c.image || 'https://via.placeholder.com/60'}" alt="${c.name}">
        <div class="cart-item-info">
          <strong>${c.name}</strong>
          <span>$${(c.price * c.qty).toFixed(2)}</span>
        </div>
        <div class="cart-qty">
          <button data-id="${c.id}" data-action="dec">−</button>
          <span>${c.qty}</span>
          <button data-id="${c.id}" data-action="inc">+</button>
        </div>
      </div>
    `).join("");
    itemsEl.querySelectorAll("button[data-action]").forEach(btn => {
      btn.addEventListener("click", () => {
        const item = cart.find(c => c.id == btn.dataset.id);
        if (!item) return;
        if (btn.dataset.action === "inc") item.qty++;
        if (btn.dataset.action === "dec") { item.qty--; if (item.qty <= 0) cart = cart.filter(c => c.id != item.id); }
        persistCart(); updateCartUI();
      });
    });
  }
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  document.getElementById("cartTotal").textContent = `$${total.toFixed(2)}`;
}

function openCart() {
  document.getElementById("cartDrawer").classList.add("open");
  document.getElementById("overlay").classList.add("show");
}
function closeCart() {
  document.getElementById("cartDrawer").classList.remove("open");
  document.getElementById("overlay").classList.remove("show");
}

function initCartUI() {
  document.getElementById("cartToggle").addEventListener("click", openCart);
  document.getElementById("cartClose").addEventListener("click", closeCart);
  document.getElementById("overlay").addEventListener("click", closeCart);
  document.getElementById("whatsappOrderBtn").addEventListener("click", orderViaWhatsApp);
  updateCartUI();
}

function orderViaWhatsApp() {
  if (cart.length === 0) { alert("Your cart is empty."); return; }
  let msg = `🛒 *New Order – LeoPis Digital*\n\n`;
  cart.forEach((c, i) => {
    msg += `${i + 1}. ${c.name} × ${c.qty} = $${(c.price * c.qty).toFixed(2)}\n`;
  });
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);
  msg += `\n*Total: $${total.toFixed(2)}*\n\nPlease confirm availability & delivery.`;
  const url = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

function quickWhatsApp(id) {
  const p = ALL_PRODUCTS.find(x => x.id == id);
  if (!p) return;
  const msg = `Hi! I'm interested in *${p.name}* ($${Number(p.price).toFixed(2)}). Is it available?`;
  const url = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
  window.open(url, "_blank");
}

function populateFooterLinks() {
  document.getElementById("googleRatingLink").href = STORE_CONFIG.googleRatingUrl;
  document.getElementById("footerWhatsApp").href = `https://wa.me/${STORE_CONFIG.whatsappNumber}`;
  document.getElementById("footerEmail").href = `mailto:${STORE_CONFIG.email}`;

  const socialIcons = {
    facebook: "fa-facebook-f",
    instagram: "fa-instagram",
    tiktok: "fa-tiktok",
    youtube: "fa-youtube"
  };
  const container = document.getElementById("socialLinks");
  container.innerHTML = Object.entries(STORE_CONFIG.social)
    .filter(([, url]) => url)
    .map(([platform, url]) =>
      `<a href="${url}" target="_blank" rel="noopener" aria-label="${platform}"><i class="fab ${socialIcons[platform]}"></i></a>`
    ).join("");
}

function initFaqAccordion() {
  const faqs = [
    { q: "How do I place an order?", a: "Browse products, add to cart, then tap “Order via WhatsApp”. Your cart details are pre‑filled – just hit send." },
    { q: "Do you deliver island‑wide?", a: "Yes! We deliver to every district. Delivery time is 2–5 working days depending on location." },
    { q: "What payment methods do you accept?", a: "Cash on delivery and bank transfer. Details are confirmed on WhatsApp when you order." },
    { q: "Can I track my order?", a: "Absolutely. After confirming on WhatsApp, you’ll receive a tracking link or SMS update." },
    { q: "Is there a minimum order?", a: "No minimum – order any quantity. Free delivery on orders over $50." }
  ];
  document.getElementById("faqAccordion").innerHTML = faqs.map(f => `
    <details><summary>${f.q}</summary><p>${f.a}</p></details>
  `).join("");
}

function initMobileMenu() {
  const btn = document.getElementById("hamburger");
  const nav = document.getElementById("mainNav");
  btn.addEventListener("click", () => nav.classList.toggle("open"));
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));
}
