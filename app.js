/* Leopis three-file storefront starter.
   Browser-only demo: data lives in this browser. Configure a real backend before production.
*/
(() => {
  'use strict';

  // DEMO ONLY: this PIN is public in the source and is NOT secure authentication.
  // Never use a client-side PIN to protect a production store or customer data.
  const ADMIN_PIN = 'LEOPIS1234';
  const WHATSAPP_NUMBER = '94783366466';
  // Optional HTTPS endpoints you own. Never put secret API keys in this public JavaScript file.
  const SEARCH_ANALYTICS_ENDPOINT = ''; // e.g. https://your-domain/api/search-events
  const AI_ENDPOINT = ''; // secure server proxy only; accepts {question, products, storeKnowledge}
  const DEFAULT_KNOWLEDGE = 'Leopis (Pvt) Ltd sells gadgets and mobile accessories in Sri Lanka. Contact WhatsApp +94 78 336 6466 to confirm current product availability, delivery cost and timing. Cash-on-delivery details are confirmed with the store.';
  const STORAGE = { products: 'leopis_v2_products', searches: 'leopis_v2_searches', cart: 'leopis_v2_cart', knowledge: 'leopis_v2_knowledge' };
  const seedProducts = [
    { id: 'seed-earbuds', name: 'Pro Wireless ANC Earbuds', category: 'Audio', price: 6800, cost: 4500, description: 'Active noise cancellation with a long-lasting everyday battery.', image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=700&q=80', featured: true },
    { id: 'seed-watch', name: 'AMOLED Smart Watch', category: 'Smart Watches', price: 9400, cost: 6500, description: 'Bright display and Bluetooth calling for your daily routine.', image: 'https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?w=700&q=80', featured: true },
    { id: 'seed-charger', name: '65W Fast Charger', category: 'Mobile Accessories', price: 4200, cost: 2800, description: 'Compact fast charging for compatible USB-C devices.', image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=700&q=80', featured: true },
    { id: 'seed-speaker', name: 'Portable Bluetooth Speaker', category: 'Audio', price: 5900, cost: 3900, description: 'A compact speaker for music at home or on the move.', image: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=700&q=80', featured: false }
  ];
  const readJSON = (key, fallback) => { try { const value = JSON.parse(localStorage.getItem(key)); return value ?? fallback; } catch { return fallback; } };
  let products = readJSON(STORAGE.products, null);
  if (!Array.isArray(products) || !products.length) products = structuredClone(seedProducts);
  let searches = readJSON(STORAGE.searches, []);
  if (!Array.isArray(searches)) searches = [];
  let cart = readJSON(STORAGE.cart, []);
  if (!Array.isArray(cart)) cart = [];
  let storeKnowledge = localStorage.getItem(STORAGE.knowledge) || DEFAULT_KNOWLEDGE;
  let activeCategory = 'All';
  let query = '';
  let toastTimer;
  const $ = (selector) => document.querySelector(selector);
  const el = (tag, className, text) => { const node = document.createElement(tag); if (className) node.className = className; if (text !== undefined) node.textContent = text; return node; };
  const money = (value) => `LKR ${Number(value || 0).toLocaleString('en-LK')}`;
  const save = (key, value) => { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch { showToast('Browser storage is full. Please reduce the amount of data.'); return false; } };
  const cleanText = (value, limit = 400) => String(value ?? '').trim().slice(0, limit);
  const normalize = (value) => String(value ?? '').toLocaleLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const safeImageUrl = (value) => { try { const u = new URL(String(value)); return ['https:', 'http:'].includes(u.protocol) ? u.href : ''; } catch { return ''; } };

  function showToast(message) {
    const node = $('#toast'); node.textContent = message; node.classList.add('visible');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => node.classList.remove('visible'), 2600);
  }
  function openOverlay(id) { const node = document.getElementById(id); node.hidden = false; document.body.style.overflow = 'hidden'; }
  function closeOverlay(id) { const node = document.getElementById(id); node.hidden = true; document.body.style.overflow = ''; }
  function recordSearch(value, resultCount) {
    const text = cleanText(value, 100);
    if (!text) return;
    // Aggregate repeated searches so the local insight list stays compact.
    const key = normalize(text);
    const prior = searches.find((item) => normalize(item.term) === key);
    if (prior) { prior.count += 1; prior.results = resultCount; prior.at = new Date().toISOString(); }
    else searches.unshift({ term: text, count: 1, results: resultCount, at: new Date().toISOString() });
    searches = searches.slice(0, 100);
    save(STORAGE.searches, searches);
    if (SEARCH_ANALYTICS_ENDPOINT) {
      fetch(SEARCH_ANALYTICS_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ term: text, results: resultCount, at: new Date().toISOString() }), keepalive: true }).catch(() => {});
    }
  }
  function filteredProducts() {
    return products.filter((p) => (activeCategory === 'All' || p.category === activeCategory) && (!query || [p.name, p.category, p.description].some((part) => normalize(part).includes(normalize(query)))));
  }
  function makeProductCard(product) {
    const card = el('article', 'product-card');
    const photo = el('div', 'product-image');
    if (product.image && safeImageUrl(product.image)) {
      const img = el('img'); img.src = safeImageUrl(product.image); img.alt = product.name; img.loading = 'lazy'; img.decoding = 'async';
      img.onerror = () => { img.remove(); photo.append(el('span', 'image-fallback', 'LEOPIS PICK')); };
      photo.append(img);
    } else photo.append(el('span', 'image-fallback', 'LEOPIS PICK'));
    photo.append(el('span', 'product-tag', product.category || 'Gadgets'));
    const info = el('div', 'product-info'); info.append(el('h3', '', product.name), el('p', 'product-description', product.description || 'Ask Leopis for product details.'));
    const bottom = el('div', 'product-bottom'); bottom.append(el('strong', 'product-price', money(product.price)));
    const add = el('button', 'add-button', '+'); add.type = 'button'; add.setAttribute('aria-label', `Add ${product.name} to bag`); add.addEventListener('click', () => addToCart(product.id)); bottom.append(add);
    info.append(bottom); card.append(photo, info); return card;
  }
  function renderProducts() {
    const list = filteredProducts();
    const grid = $('#productGrid'); grid.replaceChildren(...list.map(makeProductCard));
    $('#emptyState').hidden = list.length > 0;
    $('#resultCount').textContent = `${list.length} ${list.length === 1 ? 'item' : 'items'}`;
    renderFeatured();
    return list;
  }
  function renderFeatured() {
    const featured = products.filter((p) => p.featured);
    const section = $('#featuredSection'); section.hidden = featured.length === 0 || Boolean(query) || activeCategory !== 'All';
    $('#featuredTrack').replaceChildren(...featured.map(makeProductCard));
  }
  function renderCategories() {
    const names = ['All', ...new Set(products.map((p) => cleanText(p.category, 60)).filter(Boolean))];
    const list = $('#categoryList'); list.replaceChildren();
    names.forEach((name) => { const button = el('button', `category-chip${name === activeCategory ? ' active' : ''}`, name); button.type = 'button'; button.addEventListener('click', () => { activeCategory = name; renderCategories(); renderProducts(); }); list.append(button); });
  }
  function renderAdminProducts() {
    const tbody = $('#adminProductRows'); tbody.replaceChildren();
    products.forEach((product) => {
      const row = el('tr'); row.append(el('td', '', product.name), el('td', '', product.category), el('td', '', money(product.price)));
      const actions = el('td'); const group = el('div', 'row-actions');
      const edit = el('button', '', 'Edit'); edit.type = 'button'; edit.addEventListener('click', () => editProduct(product.id));
      const remove = el('button', 'delete-action', 'Delete'); remove.type = 'button'; remove.addEventListener('click', () => deleteProduct(product.id));
      group.append(edit, remove); actions.append(group); row.append(actions); tbody.append(row);
    });
  }
  function renderSearchInsights() {
    const list = $('#searchInsights'); list.replaceChildren();
    if (!searches.length) { list.append(el('p', 'muted', 'No searches recorded on this browser yet.')); return; }
    [...searches].sort((a, b) => b.count - a.count).forEach((item) => {
      const row = el('div', 'insight-row'); row.append(el('strong', '', item.term), el('span', '', `${item.count} search${item.count === 1 ? '' : 'es'} · ${item.results} results`)); list.append(row);
    });
  }
  function renderCart() {
    const list = $('#cartItems'); list.replaceChildren();
    if (!cart.length) list.append(el('div', 'cart-empty', 'Your bag is empty. Add a product to get started.'));
    let subtotal = 0; let count = 0;
    cart.forEach((item) => {
      const product = products.find((p) => p.id === item.id) || item;
      subtotal += Number(product.price) * item.qty; count += item.qty;
      const line = el('div', 'cart-line'); const copy = el('div'); copy.append(el('h3', '', product.name), el('p', '', `${money(product.price)} each · ${money(product.price * item.qty)}`));
      const actions = el('div', 'cart-line-actions');
      const minus = el('button', '', '−'); minus.type = 'button'; minus.setAttribute('aria-label', 'Decrease quantity'); minus.addEventListener('click', () => changeQuantity(item.id, -1));
      const qty = el('span', '', String(item.qty));
      const plus = el('button', '', '+'); plus.type = 'button'; plus.setAttribute('aria-label', 'Increase quantity'); plus.addEventListener('click', () => changeQuantity(item.id, 1));
      const remove = el('button', 'remove-item', '×'); remove.type = 'button'; remove.setAttribute('aria-label', `Remove ${product.name}`); remove.addEventListener('click', () => { cart = cart.filter((i) => i.id !== item.id); save(STORAGE.cart, cart); renderCart(); });
      actions.append(minus, qty, plus, remove); line.append(copy, actions); list.append(line);
    });
    $('#cartCount').textContent = String(count); $('#cartSubtotal').textContent = money(subtotal);
  }
  function addToCart(id) {
    const item = cart.find((p) => p.id === id);
    if (item) item.qty += 1; else { const product = products.find((p) => p.id === id); if (!product) return; cart.push({ id, qty: 1 }); }
    save(STORAGE.cart, cart); renderCart(); showToast('Added to your bag');
  }
  function changeQuantity(id, change) {
    const item = cart.find((p) => p.id === id); if (!item) return;
    item.qty += change; if (item.qty < 1) cart = cart.filter((p) => p.id !== id);
    save(STORAGE.cart, cart); renderCart();
  }
  function resetProductForm() {
    $('#productForm').reset(); $('#productId').value = ''; $('#productFormTitle').textContent = 'Add product'; $('#saveProductBtn').textContent = 'Publish product'; $('#cancelEditBtn').hidden = true;
  }
  function editProduct(id) {
    const product = products.find((p) => p.id === id); if (!product) return;
    $('#productId').value = product.id; $('#productName').value = product.name; $('#productCategory').value = product.category;
    $('#productPrice').value = product.price; $('#productCost').value = product.cost ?? ''; $('#productImage').value = product.image || '';
    $('#productDescription').value = product.description || ''; $('#productFeatured').checked = Boolean(product.featured);
    $('#productFormTitle').textContent = 'Edit product'; $('#saveProductBtn').textContent = 'Save changes'; $('#cancelEditBtn').hidden = false;
    $('#productName').focus(); $('#productsTab').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function deleteProduct(id) {
    products = products.filter((p) => p.id !== id); cart = cart.filter((p) => p.id !== id);
    save(STORAGE.products, products); save(STORAGE.cart, cart); renderAll(); showToast('Product removed');
  }
  function saveProduct(event) {
    event.preventDefault();
    const id = $('#productId').value || `p-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const price = Number($('#productPrice').value); const costValue = $('#productCost').value;
    const product = { id, name: cleanText($('#productName').value, 120), category: cleanText($('#productCategory').value, 60), price, cost: costValue === '' ? null : Number(costValue), image: safeImageUrl($('#productImage').value), description: cleanText($('#productDescription').value, 400), featured: $('#productFeatured').checked };
    if (!product.name || !product.category || !Number.isFinite(price) || price < 0) return showToast('Enter a product name, category, and valid price.');
    const at = products.findIndex((p) => p.id === id);
    if (at >= 0) products[at] = product; else products.unshift(product);
    save(STORAGE.products, products); resetProductForm(); renderAll(); showToast('Product published on the main page');
  }
  function canonicalHeader(value) {
    const key = normalize(value).replace(/ /g, '');
    const aliases = { name: ['name','product','productname','title','item','itemname'], category: ['category','type','productcategory'], price: ['price','sellingprice','saleprice','retailprice','lkr'], cost: ['cost','costprice','purchaseprice'], description: ['description','details','desc','productdescription'], image: ['image','imageurl','photo','photourl','picture'], featured: ['featured','special','homepage','highlight'] };
    for (const [field, list] of Object.entries(aliases)) if (list.includes(key)) return field;
    return key;
  }
  function parseBoolean(value) { return ['true','yes','1','y','on','featured'].includes(String(value ?? '').trim().toLowerCase()); }
  async function importSpreadsheet(file) {
    const status = $('#importStatus');
    if (!file) return;
    if (!window.XLSX) { status.textContent = 'Spreadsheet reader is still loading. Check your connection and reload the page.'; return; }
    status.textContent = `Reading ${file.name}…`;
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array', cellDates: false });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
      if (!rows.length) throw new Error('No product rows were found in the first sheet.');
      const imported = []; let skipped = 0;
      rows.forEach((row, index) => {
        const mapped = {};
        Object.entries(row).forEach(([header, value]) => { mapped[canonicalHeader(header)] = value; });
        const name = cleanText(mapped.name, 120); const category = cleanText(mapped.category || 'General', 60);
        const price = Number(String(mapped.price ?? '').replace(/[\s,]/g, ''));
        if (!name || !Number.isFinite(price) || price < 0) { skipped++; return; }
        imported.push({ id: `imp-${Date.now()}-${index}-${Math.random().toString(36).slice(2,5)}`, name, category, price, cost: Number.isFinite(Number(mapped.cost)) && mapped.cost !== '' ? Number(mapped.cost) : null, description: cleanText(mapped.description || 'Imported product.', 400), image: safeImageUrl(mapped.image), featured: parseBoolean(mapped.featured) });
      });
      if (!imported.length) throw new Error('No valid rows. Check that the sheet has name and price columns, with a header row.');
      products = [...imported, ...products]; save(STORAGE.products, products); renderAll();
      status.textContent = `Imported ${imported.length} product(s)${skipped ? `; skipped ${skipped} invalid row(s)` : ''}. They are now on the main page.`;
      showToast(`${imported.length} products added to the catalogue`);
    } catch (error) { status.textContent = `Import failed: ${error.message || 'Unable to read this file.'}`; }
    finally { $('#spreadsheetInput').value = ''; }
  }
  function checkout() {
    if (!cart.length) return showToast('Your bag is empty.');
    const name = cleanText($('#customerName').value, 100); const phone = cleanText($('#customerPhone').value, 30); const district = cleanText($('#customerDistrict').value, 100);
    if (!name || !phone || !district) return showToast('Please enter your name, phone number, and delivery area.');
    const rows = cart.map((item) => { const product = products.find((p) => p.id === item.id) || item; return `- ${product.name} x ${item.qty}: ${money(product.price * item.qty)}`; });
    const subtotal = cart.reduce((sum, item) => sum + Number((products.find((p) => p.id === item.id) || item).price) * item.qty, 0);
    const message = `Leopis order enquiry\nName: ${name}\nPhone: ${phone}\nCity/District: ${district}\n\nItems:\n${rows.join('\n')}\n\nSubtotal: ${money(subtotal)}\nPlease confirm availability, delivery fee and COD details.`;
    // Navigate in the same tab; mobile browsers often block scripted pop-up tabs.
    window.location.href = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  }
  function productHelperAnswer(question) {
    const q = normalize(question);
    const candidates = products.map((p) => ({ p, score: [p.name, p.category].reduce((score, value) => score + (q.includes(normalize(value)) ? normalize(value).split(' ').length + 1 : 0), 0) })).filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
    if (candidates.length) {
      const p = candidates[0].p;
      if (/price|cost|how much|விலை/.test(q)) return `${p.name} is listed at ${money(p.price)}. Please contact Leopis to confirm the current price and availability.`;
      return `${p.name} (${p.category}) is listed at ${money(p.price)}. ${p.description || ''} Please contact Leopis to confirm stock and details.`;
    }
    if (/delivery|shipping|deliver|time|days|district|நாள|டெலிவரி/.test(q)) return storeKnowledge;
    if (/contact|whatsapp|phone|call|number|தொடர்பு/.test(q)) return 'You can contact Leopis on WhatsApp at +94 78 336 6466: https://wa.me/94783366466';
    if (/warranty|return|refund|exchange|policy/.test(q)) return 'Please contact Leopis directly to confirm the current warranty, return or exchange terms for your item.';
    if (/payment|cash|cod|pay/.test(q)) return 'Cash-on-delivery and payment details are confirmed by Leopis on WhatsApp. Contact +94 78 336 6466.';
    return 'I could not find a reliable answer in the current catalogue or store notes. Try a product name or contact Leopis on WhatsApp: https://wa.me/94783366466';
  }
  function addChatBubble(text, who) { const bubble = el('div', `chat-bubble ${who}`, text); $('#chatMessages').append(bubble); $('#chatMessages').scrollTop = $('#chatMessages').scrollHeight; }
  async function askHelper(question) {
    addChatBubble(question, 'user');
    if (AI_ENDPOINT) {
      try {
        const response = await fetch(AI_ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ question, products: products.map(({ name, category, price, description }) => ({ name, category, price, description })), storeKnowledge }) });
        if (!response.ok) throw new Error('AI service unavailable');
        const data = await response.json();
        addChatBubble(cleanText(data.answer || data.reply || 'Please contact Leopis for help.', 1200), 'bot');
        return;
      } catch { addChatBubble('The online assistant is temporarily unavailable. Please message Leopis on WhatsApp: https://wa.me/94783366466', 'bot'); return; }
    }
    addChatBubble(productHelperAnswer(question), 'bot');
  }
  function renderAll() { renderCategories(); renderProducts(); renderAdminProducts(); renderCart(); renderSearchInsights(); }
  function initialize() {
    $('#year').textContent = String(new Date().getFullYear());
    $('#storeKnowledge').value = storeKnowledge;
    const localViews = Number(localStorage.g
