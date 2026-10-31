const PRODUCT_STORAGE_KEY = "leopisdigital_products";
const SETTINGS_STORAGE_KEY = "leopisdigital_settings";

async function loadProducts() {
  const stored = localStorage.getItem(PRODUCT_STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch (e) { /* ignore */ }
  }
  try {
    const res = await fetch("products.json");
    if (res.ok) {
      const data = await res.json();
      localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(data));
      return data;
    }
  } catch (e) {
    console.warn("products.json not found – using empty dataset.");
  }
  return [];
}

function saveProducts(products) {
  localStorage.setItem(PRODUCT_STORAGE_KEY, JSON.stringify(products));
}

function resetProducts() {
  localStorage.removeItem(PRODUCT_STORAGE_KEY);
  return loadProducts();
}

function exportProductsJSON() {
  const data = localStorage.getItem(PRODUCT_STORAGE_KEY) || "[]";
  const blob = new Blob([data], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "products.json";
  a.click();
  URL.revokeObjectURL(url);
}

// ---- NEW: Load & Save Site Settings (Promos & Stats) ----
function loadSiteSettings() {
  const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
  if (stored) {
    try { return JSON.parse(stored); } catch (e) {}
  }
  // Default settings
  return {
    promoText: "🔥 Mega Sale! Up to 30% off on all Electronics. Free delivery over LKR 10,000!",
    visitCount: "15,240",
    orderCount: "1,850"
  };
}

function saveSiteSettings(settings) {
  localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}
