/* ============================================================
   LeoPis Digital — Storefront Script (Part 1 of 2)
   Config · Defaults · DOM cache · Utilities · Init · Rendering
   ============================================================ */

'use strict';

/* ─── CONFIG ─── */
const CONFIG = {
  whatsappNumber: '94783366466',
  ipCheckUrl: 'https://ipapi.co/json/',
  ipCheckTimeout: 3000,
  searchDebounce: 200,
};

const STORAGE_KEYS = {
  products: 'leopis_products_v3',
  cart:     'leopis_cart',
  visits:   'leopis_visits',
  orders:   'leopis_orders',
};

/* ─── DEFAULT PRODUCTS (5 restored from index(9)) ─── */
const DEFAULT_PRODUCTS = [
  {
    id: 1,
    name: 'Smart Air Fryer',
    price: 35000,
    category: 'Home appliance and kitchen',
    image: 'https://images.unsplash.com/photo-1626074353765-517a681e40be?w=400',
    description: 'Digital air fryer for healthy cooking with preset temperature and timer.',
    gallery: []
  },
  {
    id: 2,
    name: 'Electric Kettle',
    price: 8500,
    category: 'Electrical items',
    image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246?w=400',
    description: 'Stainless steel fast-boiling kettle with auto shutoff.',
    gallery: []
  },
  {
    id: 3,
    name: 'Wireless Earbuds',
    price: 15000,
    category: 'Audio & smart gadgets',
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400',
    description: 'Bluetooth 5.3 with active noise cancellation and 24h battery.',
    gallery: []
  },
  {
    id: 4,
    name: 'Baby Stroller',
    price: 25000,
    category: 'Baby care and kids',
    image: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?w=400',
    description: 'Comfortable, safe, lightweight stroller with adjustable recline.',
    gallery: []
  },
  {
    id: 5,
    name: 'Yoga Mat',
    price: 4500,
    category: 'Fashion & Fitness',
    image: 'https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=400',
    description: 'Non-slip fitness mat with carrying strap.',
    gallery: []
  },
];

/* ─── FAQ CONTENT (full version restored) ─── */
const FAQS = [
  {
    q: "What is Leopis Digital's return policy?",
    a: 'We operate on a strict Same-Day Inspection & Return Policy to ensure absolute product satisfaction.'
  },
  {
    q: 'Can I return an item if it is damaged, incorrect, or non-working?',
    a: 'Yes, instantly at your doorstep!<br><br><b>On-the-Spot Courier Return:</b> Inspect your package when the delivery agent arrives. If the item is damaged, incorrect, or does not work, hand it straight back to the courier for an immediate return/exchange.<br><br><b>Same-Day Notice:</b> If you test the product later the same day and find a defect, notify us immediately via WhatsApp or email. We will arrange a priority courier swap at zero extra cost.'
  },
  {
    q: 'Are there any items excluded from returns?',
    a: 'Yes. Because of hygiene and digital licensing, opened software, digital goods, and custom-ordered items cannot be returned unless proven defective upon arrival.'
  },
  {
    q: 'How fast is delivery?',
    a: 'Orders are processed and dispatched promptly. Standard island-wide delivery takes 1 to 3 business days depending on your location.'
  },
  {
    q: 'Can I track my order?',
    a: 'Yes. Once your order ships, tracking details and updates are sent via SMS or WhatsApp.'
  },
  {
    q: 'How can I contact Leopis Digital customer support?',
    a: 'Our support team is available to assist you with any questions or same-day return requests:<br><br>📞 <b>Hotline / WhatsApp / Telegram:</b> +94 78 336 6466<br>✉️ <b>Email:</b> director.leopis@gmail.com'
  },
];

/* ─── DOM CACHE ─── */
const $ = (id) => document.getElementById(id);

const els = {
  searchInput:     $('searchInput'),
  productGrid:     $('productGrid'),
  categoryFilters: $('categoryFilters'),
  cartDrawer:      $('cartDrawer'),
  cartItems:       $('cartItems'),
  cartCount:       $('cartCount'),
  cartTotal:       $('cartTotal'),
  cartToggle:      $('cartToggle'),
  cartClose:       $('cartClose'),
  checkoutBtn:     $('checkoutBtn'),
  productModal:    $('productModal'),
  modalClose:      $('modalClose'),
  mImg:            $('mImg'),
  mTitle:          $('mTitle'),
  mPrice:          $('mPrice'),
  mDesc:           $('mDesc'),
  mThumbnails:     $('mThumbnails'),
  mAddBtn:         $('mAddBtn'),
  mWaBtn:          $('mWaBtn'),
  faqList:         $('faqList'),
  aiInput:         $('aiInput'),
  aiSend:          $('aiSend'),
  aiMessages:      $('aiMessages'),
  chatWindow:      $('chatWindow'),
  chatToggle:      $('chatToggle'),
  chatClose:       $('chatClose'),
  chatInput:       $('chatInput'),
  chatSend:        $('chatSend'),
  chatBody:        $('chatBody'),
  visitsCount:     $('visitsCount'),
  ordersCount:     $('ordersCount'),
};

/* ─── STATE ─── */
let PRODUCTS        = [];
let cart            = [];
let activeProduct   = null;
let currentCategory = 'All';
let searchQuery     = '';
let isSriLanka      = true;
let searchTimer     = null;

/* ─── UTILITIES ─── */
function safeParseJSON(str, fallback) {
  try {
    const v = JSON.parse(str);
    return v ?? fallback;
  } catch (e) {
    console.warn('JSON parse failed:', e);
    return fallback;
  }
}

function formatLKR(n) {
  return 'LKR ' + Number(n || 0).toLocaleString('en-LK');
}

function escapeHTML(str) {
  return String(str ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast toast-${type}`;
  el.textContent = msg;
  document.body.appendChild(el);
  requestAnimationFrame(() => el.classList.add('show'));
  setTimeout(() => {
    el.classList.remove('show');
    setTimeout(() => el.remove(), 320);
  }, 2400);
}

/* ─── INIT ─── */
function init() {
  loadStats();
  loadProducts();
  loadCart();
  renderCategoryFilters();
  renderProducts();
  renderFAQ();
  bindEvents();
  checkIP(); // async — never blocks render
}

/* ─── STATS ─── */
function loadStats() {
  let visits = parseInt(localStorage.getItem(STORAGE_KEYS.visits), 10) || 12450;
  visits++;
  localStorage.setItem(STORAGE_KEYS.visits, visits);
  els.visitsCount.textContent = visits.toLocaleString();

  const orders = parseInt(localStorage.getItem(STORAGE_KEYS.orders), 10) || 1850;
  els.ordersCount.textContent = orders.toLocaleString();
}

/* ─── PRODUCTS ─── */
function loadProducts() {
  const stored = safeParseJSON(localStorage.getItem(STORAGE_KEYS.products), null);
  PRODUCTS = Array.isArray(stored) && stored.length ? stored : DEFAULT_PRODUCTS;
}

/* ─── CART ─── */
function loadCart() {
  const stored = safeParseJSON(localStorage.getItem(STORAGE_KEYS.cart), []);
  cart = Array.isArray(stored) ? stored : [];
  updateCartUI();
}

function saveCart() {
  try {
    localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(cart));
  } catch (e) {
    console.warn('Cart save failed:', e);
  }
}

/* ─── RENDER: CATEGORY CHIPS ─── */
function renderCategoryFilters() {
  const cats = ['All', ...new Set(PRODUCTS.map(p => p.category || 'Other'))];
  els.categoryFilters.innerHTML = cats.map(c =>
    `<button type="button" class="filter-chip${c === currentCategory ? ' active' : ''}" data-category="${escapeHTML(c)}">${escapeHTML(c)}</button>`
  ).join('');
}

/* ─── RENDER: PRODUCTS ─── */
function renderProducts() {
  let filtered = PRODUCTS;
  if (currentCategory !== 'All') {
    filtered = filtered.filter(p => (p.category || 'Other') === currentCategory);
  }
  if (searchQuery) {
    filtered = filtered.filter(p =>
      (p.name || '').toLowerCase().includes(searchQuery)
    );
  }

  if (!filtered.length) {
    els.productGrid.innerHTML = `<div class="empty-state">No products found.</div>`;
    return;
  }

  els.productGrid.innerHTML = filtered.map(p => `
    <article class="product-card" data-product-id="${escapeHTML(String(p.id))}">
      <div class="product-img" data-action="open">
        <img src="${escapeHTML(p.image || '')}"
             alt="${escapeHTML(p.name || 'Product')}"
             loading="lazy"
             decoding="async"
             width="300" height="300"
             onerror="this.onerror=null;this.src='data:image/svg+xml;utf8,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><rect fill=%22%23f1f5f9%22 width=%22100%22 height=%22100%22/><text x=%2250%22 y=%2255%22 text-anchor=%22middle%22 fill=%22%2364748b%22 font-size=%2212%22>No Image</text></svg>';">
      </div>
      <div class="product-body">
        <h3 class="product-name" data-action="open">${escapeHTML(p.name || '')}</h3>
        <div class="product-price">${formatLKR(p.price)}</div>
        <div class="product-actions">
          <button type="button" class="add-cart-btn" data-action="add">Add</button>
          <button type="button" class="wa-quick-btn" data-action="wa" aria-label="Order on WhatsApp">
            <i class="fab fa-whatsapp"></i>
          </button>
        </div>
      </div>
    </article>
  `).join('');
}

/* ─── RENDER: FAQ ─── */
function renderFAQ() {
  els.faqList.innerHTML = FAQS.map((f, i) => `
    <div class="faq-item">
      <div class="faq-q" data-faq-toggle="${i}">
        ${escapeHTML(f.q)}
        <i class="fas fa-plus"></i>
      </div>
      <div class="faq-a" id="faq-a-${i}">${f.a}</div>
    </div>
  `).join('');
}

function toggleFaq(i) {
  const answer = document.getElementById(`faq-a-${i}`);
  const question = document.querySelector(`[data-faq-toggle="${i}"]`);
  if (!answer || !question) return;
  const isOpen = answer.classList.toggle('open');
  question.classList.toggle('open', isOpen);
                                               }
/* ============================================================
   LeoPis Digital — Storefront Script (Part 2 of 2)
   Modal · Cart actions · WhatsApp · IP check · AI · Events · Boot
   ============================================================ */

/* ─── MODAL ─── */
function openModal(id) {
  activeProduct = PRODUCTS.find(p => String(p.id) === String(id));
  if (!activeProduct) return;

  els.mImg.src = activeProduct.image || '';
  els.mImg.alt = activeProduct.name || 'Product';
  els.mTitle.textContent = activeProduct.name || '';
  els.mPrice.textContent = formatLKR(activeProduct.price);
  els.mDesc.innerHTML = activeProduct.description || 'No description available.';

  const gallery = Array.isArray(activeProduct.gallery) ? activeProduct.gallery : [];
  if (gallery.length) {
    const all = [activeProduct.image, ...gallery];
    els.mThumbnails.innerHTML = all.map((img, i) =>
      `<img src="${escapeHTML(img)}"
            alt="View ${i + 1}"
            loading="lazy"
            decoding="async"
            class="${i === 0 ? 'active' : ''}"
            data-src="${escapeHTML(img)}">`
    ).join('');
  } else {
    els.mThumbnails.innerHTML = '';
  }

  els.productModal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  els.productModal.classList.remove('open');
  document.body.style.overflow = '';
}

/* ─── CART UI ─── */
function updateCartUI() {
  const totalQty = cart.reduce((s, i) => s + i.qty, 0);
  els.cartCount.textContent = totalQty;

  if (!cart.length) {
    els.cartItems.innerHTML = '<p style="color:var(--muted);text-align:center;padding:20px 0;">Your cart is empty.</p>';
    els.cartTotal.textContent = 'LKR 0';
    els.checkoutBtn.disabled = true;
    return;
  }

  els.cartItems.innerHTML = cart.map(c => `
    <div class="cart-item">
      <img src="${escapeHTML(c.image || '')}"
           alt="${escapeHTML(c.name || '')}"
           loading="lazy"
           decoding="async">
      <div class="cart-item-body">
        <span class="cart-item-name">${escapeHTML(c.name || '')}</span>
        <span class="cart-item-price">${formatLKR(c.price)}</span>
        <div class="qty-row">
          <button type="button" class="qty-btn" data-cart-qty="dec" data-id="${escapeHTML(String(c.id))}">−</button>
          <span class="qty-val">${c.qty}</span>
          <button type="button" class="qty-btn" data-cart-qty="inc" data-id="${escapeHTML(String(c.id))}">+</button>
        </div>
      </div>
    </div>
  `).join('');

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  els.cartTotal.textContent = formatLKR(total);
  els.checkoutBtn.disabled = false;
}

/* ─── CART ACTIONS ─── */
function addToCart(id) {
  const p = PRODUCTS.find(x => String(x.id) === String(id));
  if (!p) return;
  const existing = cart.find(x => String(x.id) === String(id));
  if (existing) existing.qty++;
  else cart.push({ id: p.id, name: p.name, price: p.price, image: p.image, qty: 1 });

  saveCart();
  updateCartUI();
  openCart();
  toast(`Added "${p.name}" to cart`, 'success');
}

function changeQty(id, delta) {
  const item = cart.find(x => String(x.id) === String(id));
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) cart = cart.filter(x => String(x.id) !== String(id));
  saveCart();
  updateCartUI();
}

function openCart()  { els.cartDrawer.classList.add('open'); }
function closeCart() { els.cartDrawer.classList.remove('open'); }

/* ─── WHATSAPP ─── */
function waOrder(id) {
  if (!isSriLanka) return toast('Ordering is available in Sri Lanka only.', 'error');
  const p = PRODUCTS.find(x => String(x.id) === String(id));
  if (!p) return;
  const text = `Hi! I want to order *${p.name}* (${formatLKR(p.price)}).`;
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(text)}`, '_blank', 'noopener');
}

function checkout() {
  if (!isSriLanka) return toast('Ordering is available in Sri Lanka only.', 'error');
  if (!cart.length) return toast('Your cart is empty.', 'error');

  let msg = '🛒 *New Order*\n\n';
  cart.forEach((c, i) => {
    msg += `${i + 1}. ${c.name} x${c.qty} = ${formatLKR(c.price * c.qty)}\n`;
  });
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  msg += `\n*Total: ${formatLKR(total)}*`;

  const orders = parseInt(localStorage.getItem(STORAGE_KEYS.orders), 10) || 1850;
  localStorage.setItem(STORAGE_KEYS.orders, orders + 1);

  // Clear cart before navigating
  cart = [];
  saveCart();
  updateCartUI();

  window.location.href = `https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`;
}

/* ─── IP CHECK (restored + timeout) ─── */
async function checkIP() {
  try {
    const ctrl = new AbortController();
    const t = setTimeout(() => ctrl.abort(), CONFIG.ipCheckTimeout);
    const res = await fetch(CONFIG.ipCheckUrl, { signal: ctrl.signal });
    clearTimeout(t);
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.country_code && data.country_code !== 'LK') {
      isSriLanka = false;
      applyForeignBlock();
    }
  } catch (e) {
    console.warn('IP check skipped:', e.message);
  }
}

function applyForeignBlock() {
  els.checkoutBtn.textContent = 'Available in Sri Lanka Only';
  els.checkoutBtn.disabled = true;
  toast('Ordering is available in Sri Lanka only.', 'error');
}

/* ─── AI CHAT ─── */
function askAIFromChat() {
  const input = els.chatInput;
  const msg = input.value.trim();
  if (!msg) return;
  appendChatMessage(msg, 'user');
  input.value = '';
  setTimeout(() => appendChatMessage(aiReply(msg), 'bot'), 400);
}

function askAIFromBox() {
  const input = els.aiInput;
  const msg = input.value.trim();
  if (!msg) return;
  els.aiMessages.innerHTML += `<div style="margin-bottom:6px;"><b>You:</b> ${escapeHTML(msg)}</div>`;
  input.value = '';
  setTimeout(() => {
    els.aiMessages.innerHTML += `<div style="margin-top:6px;color:var(--primary);"><b>AI:</b> ${escapeHTML(aiReply(msg))}</div>`;
    els.aiMessages.scrollTop = els.aiMessages.scrollHeight;
  }, 400);
}

function aiReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('delivery') || m.includes('ship')) return 'We deliver island-wide in 1–3 business days via courier.';
  if (m.includes('return') || m.includes('refund')) return 'We offer a Same-Day Inspection & Return guarantee for damaged or incorrect items.';
  if (m.includes('price') || m.includes('cost'))   return 'Current prices are shown on every product card. Tap a product to see full details.';
  if (m.includes('contact') || m.includes('whatsapp')) return `You can reach us on WhatsApp at +${CONFIG.whatsappNumber.replace(/^94/, '94 ')}.`;
  if (m.includes('cod') || m.includes('cash'))     return 'Yes — Cash on Delivery (COD) is available island-wide.';
  return 'Thanks for your message! Please contact us on WhatsApp for specific details.';
}

function appendChatMessage(text, who) {
  const el = document.createElement('div');
  el.className = `chat-msg ${who}`;
  el.textContent = text;
  els.chatBody.appendChild(el);
  els.chatBody.scrollTop = els.chatBody.scrollHeight;
}

function toggleChat() {
  els.chatWindow.classList.toggle('open');
}

/* ─── EVENT BINDING ─── */
function bindEvents() {
  /* Search (debounced) */
  els.searchInput.addEventListener('input', () => {
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => {
      searchQuery = els.searchInput.value.trim().toLowerCase();
      renderProducts();
    }, CONFIG.searchDebounce);
  });

  /* Category chips */
  els.categoryFilters.addEventListener('click', (e) => {
    const chip = e.target.closest('[data-category]');
    if (!chip) return;
    currentCategory = chip.dataset.category;
    els.categoryFilters.querySelectorAll('.filter-chip').forEach(c => c.classList.toggle('active', c === chip));
    renderProducts();
  });

  /* Product grid (delegated) */
  els.productGrid.addEventListener('click', (e) => {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;
    const card = actionEl.closest('[data-product-id]');
    if (!card) return;
    const id = card.dataset.productId;
    const action = actionEl.dataset.action;
    if (action === 'open')      openModal(id);
    else if (action === 'add')  addToCart(id);
    else if (action === 'wa')   waOrder(id);
  });

  /* Modal */
  els.modalClose.addEventListener('click', closeModal);
  els.productModal.addEventListener('click', (e) => {
    if (e.target === els.productModal) closeModal();
  });
  els.mAddBtn.addEventListener('click', () => {
    if (activeProduct) { addToCart(activeProduct.id); closeModal(); }
  });
  els.mWaBtn.addEventListener('click', () => {
    if (activeProduct) { waOrder(activeProduct.id); closeModal(); }
  });

  /* Thumbnail switcher (delegated) */
  els.mThumbnails.addEventListener('click', (e) => {
    const img = e.target.closest('[data-src]');
    if (!img) return;
    els.mImg.src = img.dataset.src;
    els.mThumbnails.querySelectorAll('img').forEach(t => t.classList.remove('active'));
    img.classList.add('active');
  });

  /* Cart */
  els.cartToggle.addEventListener('click', openCart);
  els.cartClose.addEventListener('click', closeCart);
  els.cartItems.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-cart-qty]');
    if (!btn) return;
    changeQty(btn.dataset.id, btn.dataset.cartQty === 'inc' ? 1 : -1);
  });
  els.checkoutBtn.addEventListener('click', checkout);

  /* FAQ */
  els.faqList.addEventListener('click', (e) => {
    const q = e.target.closest('[data-faq-toggle]');
    if (!q) return;
    toggleFaq(parseInt(q.dataset.faqToggle, 10));
  });

  /* AI (inline box) */
  els.aiSend.addEventListener('click', askAIFromBox);
  els.aiInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') askAIFromBox();
  });

  /* AI (floating chat) */
  els.chatToggle.addEventListener('click', toggleChat);
  els.chatClose.addEventListener('click', toggleChat);
  els.chatSend.addEventListener('click', askAIFromChat);
  els.chatInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') askAIFromChat();
  });

  /* ESC closes modal & cart */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      closeCart();
    }
  });
}

/* ─── BOOT ─── */
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
                 }
