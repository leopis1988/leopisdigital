let products = [];

document.addEventListener("DOMContentLoaded", async () => {
  products = await loadProducts();
  renderProductTable();
  initTabs();
  initManualForm();
  initExcelImport();
  initExport();
  document.getElementById("resetBtn").addEventListener("click", async () => {
    if (confirm("Reset to products.json? All local edits will be lost.")) {
      products = await resetProducts();
      renderProductTable();
    }
  });
});

function initTabs() {
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });
}

function renderProductTable() {
  const tbody = document.getElementById("productTableBody");
  const countEl = document.getElementById("productCount");
  if (countEl) countEl.textContent = products.length;

  if (products.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:#94a3b8;">No products yet.</td></tr>`;
    return;
  }
  tbody.innerHTML = products.map(p => `
    <tr>
      <td><img src="${p.image || 'https://via.placeholder.com/40'}" style="width:40px;height:40px;object-fit:cover;border-radius:6px;" onerror="this.src='https://via.placeholder.com/40'"></td>
      <td><strong>${p.name}</strong><br><small style="color:#94a3b8;">${p.id}</small></td>
      <td>${p.category || "-"}</td>
      <td>$${Number(p.price).toFixed(2)}</td>
      <td>${p.stock ?? "∞"}</td>
      <td class="table-actions">
        <button class="btn-icon edit" data-id="${p.id}" title="Edit"><i class="fas fa-pen"></i></button>
        <button class="btn-icon delete" data-id="${p.id}" title="Delete"><i class="fas fa-trash"></i></button>
      </td>
    </tr>
  `).join("");

  tbody.querySelectorAll(".edit").forEach(btn =>
    btn.addEventListener("click", () => editProduct(btn.dataset.id))
  );
  tbody.querySelectorAll(".delete").forEach(btn =>
    btn.addEventListener("click", () => deleteProduct(btn.dataset.id))
  );
}

let editingId = null;

function initManualForm() {
  const form = document.getElementById("productForm");
  form.addEventListener("submit", e => {
    e.preventDefault();
    const name = document.getElementById("pName").value.trim();
    const price = parseFloat(document.getElementById("pPrice").value);
    const category = document.getElementById("pCategory").value.trim();
    const image = document.getElementById("pImage").value.trim();
    const stock = parseInt(document.getElementById("pStock").value) || 0;
    const desc = document.getElementById("pDesc").value.trim();

    if (!name || isNaN(price)) return alert("Name and price are required.");

    if (editingId) {
      const idx = products.findIndex(p => p.id == editingId);
      if (idx > -1) products[idx] = { ...products[idx], name, price, category, image, stock, description: desc };
      editingId = null;
    } else {
      const id = "P" + Date.now();
      products.push({ id, name, price, category, image, stock, description: desc });
    }

    saveProducts(products);
    renderProductTable();
    form.reset();
    document.getElementById("formTitle").textContent = "Add New Product";
  });

  document.getElementById("cancelEdit").addEventListener("click", () => {
    form.reset();
    editingId = null;
    document.getElementById("formTitle").textContent = "Add New Product";
  });
}

function editProduct(id) {
  const p = products.find(x => x.id == id);
  if (!p) return;
  editingId = id;
  document.getElementById("pName").value = p.name;
  document.getElementById("pPrice").value = p.price;
  document.getElementById("pCategory").value = p.category || "";
  document.getElementById("pImage").value = p.image || "";
  document.getElementById("pStock").value = p.stock || 0;
  document.getElementById("pDesc").value = p.description || "";
  document.getElementById("formTitle").textContent = "Edit Product";
  document.querySelector('[data-tab="manualPanel"]').click();
  document.getElementById("productForm").scrollIntoView({ behavior: "smooth" });
}

function deleteProduct(id) {
  if (!confirm("Delete this product?")) return;
  products = products.filter(p => p.id != id);
  saveProducts(products);
  renderProductTable();
}

function initExcelImport() {
  const fileInput = document.getElementById("excelFile");
  const importBtn = document.getElementById("importExcelBtn");

  importBtn.addEventListener("click", () => {
    const file = fileInput.files[0];
    if (!file) return alert("Choose an Excel file first.");

    const reader = new FileReader();
    reader.onload = e => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: "array" });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet);

      if (rows.length === 0) return alert("Excel sheet is empty.");

      let added = 0;
      rows.forEach(row => {
        const name = row.Name || row.name;
        const price = parseFloat(row.Price || row.price);
        if (!name || isNaN(price)) return;

        const existing = products.find(p => p.name.toLowerCase() === name.toLowerCase());
        if (existing) {
          existing.price = price;
          existing.category = row.Category || row.category || existing.category;
          existing.image = row.Image || row.image || existing.image;
          existing.stock = row.Stock ?? row.stock ?? existing.stock;
          existing.description = row.Description || row.description || existing.description;
        } else {
          products.push({
            id: "P" + Date.now() + "-" + added,
            name,
            price,
            category: row.Category || row.category || "General",
            image: row.Image || row.image || "",
            stock: row.Stock ?? row.stock ?? 0,
            description: row.Description || row.description || ""
          });
          added++;
        }
      });

      saveProducts(products);
      renderProductTable();
      alert(`✅ Import complete. ${added} new product(s) added.`);
      fileInput.value = "";
    };
    reader.readAsArrayBuffer(file);
  });
}

function initExport() {
  document.getElementById("exportBtn").addEventListener("click", () => {
    exportProductsJSON();
  });
}
