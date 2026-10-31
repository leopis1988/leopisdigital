// CONFIGURATION (உங்கள் வாட்ஸ்அப் எண் இங்கே)
const CONFIG = { whatsappNumber: "94783366466" }; 

let storeSettings = JSON.parse(localStorage.getItem('leopis_settings')) || { promo: "🔥 Island-wide delivery available", visits: "12,450", orders: "1,850" };
let PRODUCTS = JSON.parse(localStorage.getItem('leopis_products')) || [
  { id: 1, name: "MacBook Pro 14-inch M3", price: 550000, category: "Laptops", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400", description: "Apple M3 chip, 16GB RAM.", gallery: [] },
  { id: 2, name: "Dell XPS 13 Plus", price: 420000, category: "Laptops", image: "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=400", description: "Intel Core i7, 16GB RAM.", gallery: [] }
];

let cart = [];
let activeProduct = null;

// INIT
document.getElementById('promoText').innerText = storeSettings.promo;
document.getElementById('visitsCount').innerText = storeSettings.visits;
document.getElementById('ordersCount').innerText = storeSettings.orders;
document.getElementById('socialLinks').innerHTML = `
  <a href="https://facebook.com/leopisdigital" target="_blank"><i class="fab fa-facebook-f"></i></a>
  <a href="https://wa.me/${CONFIG.whatsappNumber}" target="_blank"><i class="fab fa-whatsapp"></i></a>
`;

// RENDER PRODUCTS
function renderProducts() {
  document.getElementById('productGrid').innerHTML = PRODUCTS.map(p => `
    <article class="product-card">
      <div class="product-img" onclick="openModal(${p.id})"><img src="${p.image}"></div>
      <div class="product-body">
        <h3 class="product-name" onclick="openModal(${p.id})">${p.name}</h3>
        <div class="product-price">LKR ${p.price.toLocaleString()}</div>
        <div class="product-actions">
          <button class="add-cart-btn" onclick="addToCart(${p.id})">Add</button>
          <button class="wa-quick-btn" onclick="waOrder(${p.id})"><i class="fab fa-whatsapp"></i></button>
        </div>
      </div>
    </article>
  `).join('');
}

// MODAL LOGIC
function openModal(id) {
  activeProduct = PRODUCTS.find(p => p.id === id);
  document.getElementById('mImg').src = activeProduct.image;
  document.getElementById('mTitle').innerText = activeProduct.name;
  document.getElementById('mPrice').innerText = `LKR ${activeProduct.price.toLocaleString()}`;
  document.getElementById('mDesc').innerText = activeProduct.description || "No description.";
  
  const gallery = activeProduct.gallery || [];
  const thumbs = document.getElementById('mThumbnails');
  if (gallery.length > 0) {
    thumbs.innerHTML = [activeProduct.image, ...gallery].map((img, i) => 
      `<img src="${img}" class="${i===0?'active':''}" onclick="document.getElementById('mImg').src='${img}'; document.querySelectorAll('.thumbnails img').forEach(t=>t.classList.remove('active')); this.classList.add('active')">`
    ).join('');
  } else { thumbs.innerHTML = ''; }

  document.getElementById('productModal').style.display = 'flex';
}
function closeModal() { document.getElementById('productModal').style.display = 'none'; }
function addToCartFromModal() { addToCart(activeProduct.id); closeModal(); }
function waOrderFromModal() { waOrder(activeProduct.id); closeModal(); }

// FAQ LOGIC
const faqs = [
  { q: "How to order?", a: "Add to cart, then click Checkout on WhatsApp." },
  { q: "Delivery time?", a: "2-5 working days island-wide." },
  { q: "Payment methods?", a: "Cash on delivery or bank transfer." }
];
document.getElementById('faqList').innerHTML = faqs.map((f, i) => `
  <div class="faq-item">
    <div class="faq-q" onclick="toggleFaq(${i})">${f.q} <i class="fas fa-plus"></i></div>
    <div class="faq-a" id="faq-a-${i}">${f.a}</div>
  </div>
`).join('');
function toggleFaq(i) {
  const el = document.getElementById(`faq-a-${i}`);
  el.style.display = el.style.display === 'block' ? 'none' : 'block';
}

// AI LOGIC
function askAI() {
  const input = document.getElementById('aiInput');
  const msg = input.value.trim();
  if(!msg) return;
  const box = document.getElementById('aiMessages');
  box.innerHTML += `<div><b>You:</b> ${msg}</div>`;
  input.value = '';
  let reply = "Please contact us on WhatsApp for more details.";
  if(msg.toLowerCase().includes('delivery')) reply = "We deliver island-wide in 2-5 days.";
  if(msg.toLowerCase().includes('price')) reply = "Prices are in LKR on each product.";
  setTimeout(() => {
    box.innerHTML += `<div style="margin-top:10px; color:var(--primary);"><b>AI:</b> ${reply}</div>`;
    box.scrollTop = box.scrollHeight;
  }, 500);
}

// CART & WHATSAPP
function addToCart(id) {
  const p = PRODUCTS.find(x => x.id === id);
  const existing = cart.find(x => x.id === id);
  if (existing) existing.qty++;
  else cart.push({ ...p, qty: 1 });
  updateCart();
  document.getElementById('cartDrawer').classList.add('open');
}
function updateCart() {
  document.getElementById('cartCount').innerText = cart.reduce((s, i) => s + i.qty, 0);
  document.getElementById('cartItems').innerHTML = cart.length ? cart.map(c => `
    <div style="display:flex; gap:10px; margin-bottom:10px; border-bottom:1px solid #eee; padding-bottom:10px;">
      <img src="${c.image}" style="width:50px; height:50px; object-fit:contain;">
      <div style="flex:1;">
        <b style="font-size:0.8rem;">${c.name}</b><br><span style="color:var(--primary); font-weight:bold;">LKR ${c.price.toLocaleString()}</span>
        <div style="margin-top:5px;"><button onclick="changeQty(${c.id}, -1)" style="border:1px solid #ccc;">-</button> ${c.qty} <button onclick="changeQty(${c.id}, 1)" style="border:1px solid #ccc;">+</button></div>
      </div>
    </div>
  `).join('') : "<p>Cart is empty.</p>";
  document.getElementById('cartTotal').innerText = `LKR ${cart.reduce((s, i) => s + (i.price * i.qty), 0).toLocaleString()}`;
}
function changeQty(id, ch) {
  const item = cart.find(x => x.id === id);
  if (item) { item.qty += ch; if (item.qty <= 0) cart = cart.filter(x => x.id !== id); updateCart(); }
}
function waOrder(id) {
  const p = PRODUCTS.find(x => x.id === id);
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(`Hi! I want to order *${p.name}* (LKR ${p.price.toLocaleString()}).`)}`);
}
function checkout() {
  if (cart.length === 0) return alert("Cart empty!");
  let msg = "🛒 *New Order*\n\n";
  cart.forEach((c, i) => msg += `${i+1}. ${c.name} x${c.qty} = LKR ${(c.price*c.qty).toLocaleString()}\n`);
  msg += `\n*Total: LKR ${cart.reduce((s, i) => s + (i.price * i.qty), 0).toLocaleString()}*`;
  window.open(`https://wa.me/${CONFIG.whatsappNumber}?text=${encodeURIComponent(msg)}`);
}

document.getElementById('cartToggle').onclick = () => document.getElementById('cartDrawer').classList.add('open');
renderProducts();
