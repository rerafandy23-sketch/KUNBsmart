const defaultProducts = [
  {
    id: 1,
    name: "Beras Ramos 5 kg",
    category: "Sembako",
    price: 68500,
    oldPrice: 72000,
    stock: 24,
    promo: true,
    isNew: false,
    mark: "BR",
  },
  {
    id: 2,
    name: "Minyak Goreng 2 L",
    category: "Sembako",
    price: 34500,
    oldPrice: 0,
    stock: 13,
    promo: false,
    isNew: true,
    mark: "MG",
  },
  {
    id: 3,
    name: "Kopi Susu Botol",
    category: "Minuman",
    price: 9500,
    oldPrice: 12000,
    stock: 32,
    promo: true,
    isNew: true,
    mark: "KP",
  },
  {
    id: 4,
    name: "Teh Melati 350 ml",
    category: "Minuman",
    price: 4500,
    oldPrice: 0,
    stock: 0,
    promo: false,
    isNew: false,
    mark: "TH",
  },
  {
    id: 5,
    name: "Sabun Mandi Fresh",
    category: "Perawatan",
    price: 7000,
    oldPrice: 8500,
    stock: 8,
    promo: true,
    isNew: false,
    mark: "SB",
  },
  {
    id: 6,
    name: "Sampo Herbal 180 ml",
    category: "Perawatan",
    price: 18500,
    oldPrice: 0,
    stock: 16,
    promo: false,
    isNew: true,
    mark: "SH",
  },
  {
    id: 7,
    name: "Keripik Pedas",
    category: "Snack",
    price: 12500,
    oldPrice: 15000,
    stock: 5,
    promo: true,
    isNew: false,
    mark: "KR",
  },
  {
    id: 8,
    name: "Biskuit Cokelat",
    category: "Snack",
    price: 9800,
    oldPrice: 0,
    stock: 21,
    promo: false,
    isNew: false,
    mark: "BK",
  },
];

const storageKeys = {
  products: "kunbsmart.products",
  suggestions: "kunbsmart.suggestions",
  operator: "kunbsmart.operator",
};

const operatorAccessCode = "KUNB2026";

let products = loadStoredProducts();
let suggestions = loadStoredSuggestions();

const state = {
  activeFilter: "all",
  search: "",
  category: "all",
  cart: [],
};

const rupiah = new Intl.NumberFormat("id-ID", {
  style: "currency",
  currency: "IDR",
  maximumFractionDigits: 0,
});

const productGrid = document.querySelector("#productGrid");
const searchInput = document.querySelector("#searchInput");
const categoryFilter = document.querySelector("#categoryFilter");
const resultInfo = document.querySelector("#resultInfo");
const cartButton = document.querySelector("#cartButton");
const cartDrawer = document.querySelector("#cartDrawer");
const closeDrawer = document.querySelector("#closeDrawer");
const cartItems = document.querySelector("#cartItems");
const cartTotal = document.querySelector("#cartTotal");
const cartCount = document.querySelector("#cartCount");
const productForm = document.querySelector("#productForm");
const productStatus = document.querySelector("#productStatus");
const operatorForm = document.querySelector("#operatorForm");
const operatorCode = document.querySelector("#operatorCode");
const operatorStatus = document.querySelector("#operatorStatus");
const operatorLogout = document.querySelector("#operatorLogout");
const suggestionForm = document.querySelector("#suggestionForm");
const suggestionStatus = document.querySelector("#suggestionStatus");
const recommendedProducts = document.querySelector("#recommendedProducts");
const customerSuggestions = document.querySelector("#customerSuggestions");

function loadStoredProducts() {
  try {
    const saved = JSON.parse(localStorage.getItem(storageKeys.products) || "[]");
    return [...defaultProducts, ...saved];
  } catch {
    return [...defaultProducts];
  }
}

function loadStoredSuggestions() {
  try {
    return JSON.parse(localStorage.getItem(storageKeys.suggestions) || "[]");
  } catch {
    return [];
  }
}

function saveCustomProducts() {
  const customProducts = products.filter((product) => product.custom);
  localStorage.setItem(storageKeys.products, JSON.stringify(customProducts));
}

function saveSuggestions() {
  localStorage.setItem(storageKeys.suggestions, JSON.stringify(suggestions));
}

function isOperatorActive() {
  return sessionStorage.getItem(storageKeys.operator) === "active";
}

function setOperatorAccess(active) {
  sessionStorage.setItem(storageKeys.operator, active ? "active" : "");
  operatorForm.hidden = active;
  productForm.hidden = !active;
  if (active) {
    operatorStatus.textContent = "";
    operatorCode.value = "";
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function makeMark(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);
}

function getStockClass(stock) {
  if (stock === 0) return "empty";
  if (stock <= 8) return "low";
  return "ok";
}

function getStockLabel(stock) {
  if (stock === 0) return "Stok habis";
  if (stock <= 8) return `Sisa ${stock}`;
  return `Stok ${stock}`;
}

function filterProducts() {
  return products.filter((product) => {
    const matchesSearch = product.name.toLowerCase().includes(state.search.toLowerCase());
    const matchesCategory = state.category === "all" || product.category === state.category;
    const matchesQuickFilter =
      state.activeFilter === "all" ||
      (state.activeFilter === "promo" && product.promo) ||
      (state.activeFilter === "new" && product.isNew) ||
      (state.activeFilter === "stock" && product.stock > 0);

    return matchesSearch && matchesCategory && matchesQuickFilter;
  });
}

function renderProducts() {
  const visibleProducts = filterProducts();
  productGrid.innerHTML = "";

  if (visibleProducts.length === 0) {
    productGrid.innerHTML = '<p class="empty-state">Produk tidak ditemukan.</p>';
  } else {
    visibleProducts.forEach((product) => {
      const card = document.createElement("article");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-image" aria-hidden="true"><span class="product-mark">${escapeHtml(product.mark)}</span></div>
        <div class="product-top">
          <h3>${escapeHtml(product.name)}</h3>
        </div>
        <div class="badge-row">
          <span class="badge">${escapeHtml(product.category)}</span>
          ${product.promo ? '<span class="badge promo">Diskon</span>' : ""}
          ${product.isNew ? '<span class="badge new">Baru</span>' : ""}
        </div>
        <p class="price">
          ${rupiah.format(product.price)}
          ${product.oldPrice ? `<span class="old-price">${rupiah.format(product.oldPrice)}</span>` : ""}
        </p>
        <div class="meta">
          <span>Harga satuan</span>
          <span class="stock ${getStockClass(product.stock)}">${getStockLabel(product.stock)}</span>
        </div>
        <button class="add-button" data-id="${product.id}" ${product.stock === 0 ? "disabled" : ""}>
          ${product.stock === 0 ? "Tidak tersedia" : "Tambah"}
        </button>
      `;
      productGrid.appendChild(card);
    });
  }

  resultInfo.textContent = `Menampilkan ${visibleProducts.length} dari ${products.length} produk`;
}

function renderSummary() {
  document.querySelector("#availableCount").textContent = products.filter((item) => item.stock > 0).length;
  document.querySelector("#promoCount").textContent = products.filter((item) => item.promo).length;
  document.querySelector("#newCount").textContent = products.filter((item) => item.isNew).length;
}

function renderRecommendations() {
  if (!recommendedProducts) return;

  const picks = [...products]
    .filter((product) => product.stock > 0)
    .sort((first, second) => Number(second.promo) - Number(first.promo) || Number(second.isNew) - Number(first.isNew))
    .slice(0, 4);

  recommendedProducts.innerHTML = picks
    .map(
      (product) => `
        <article class="suggestion-item">
          <strong>${escapeHtml(product.name)}</strong>
          <span>${escapeHtml(product.category)} - ${rupiah.format(product.price)} - ${getStockLabel(product.stock)}</span>
        </article>
      `,
    )
    .join("");
}

function renderSuggestions() {
  if (!customerSuggestions) return;

  if (suggestions.length === 0) {
    customerSuggestions.innerHTML = '<p class="empty-state">Belum ada saran pelanggan.</p>';
    return;
  }

  customerSuggestions.innerHTML = suggestions
    .slice()
    .reverse()
    .map(
      (suggestion) => `
        <article class="suggestion-item">
          <strong>${escapeHtml(suggestion.name || "Pelanggan")}</strong>
          <span>${escapeHtml(suggestion.text)}</span>
        </article>
      `,
    )
    .join("");
}

function renderAll() {
  renderSummary();
  renderProducts();
  renderCart();
  renderRecommendations();
  renderSuggestions();
  setOperatorAccess(isOperatorActive());
}

function renderCart() {
  cartCount.textContent = state.cart.length;
  cartItems.innerHTML = "";

  if (state.cart.length === 0) {
    cartItems.innerHTML = '<p class="empty-state">Belum ada produk dipilih.</p>';
  } else {
    state.cart.forEach((product) => {
      const item = document.createElement("div");
      item.className = "cart-item";
      item.innerHTML = `
        <span class="thumb" aria-hidden="true">${escapeHtml(product.mark)}</span>
        <div>
          <p>${escapeHtml(product.name)}</p>
          <small>${escapeHtml(product.category)}</small>
        </div>
        <strong>${rupiah.format(product.price)}</strong>
      `;
      cartItems.appendChild(item);
    });
  }

  const total = state.cart.reduce((sum, product) => sum + product.price, 0);
  cartTotal.textContent = rupiah.format(total);
}

function setDrawer(open) {
  cartDrawer.classList.toggle("open", open);
  cartDrawer.setAttribute("aria-hidden", String(!open));
}

function switchView(viewId) {
  document.querySelectorAll(".app-view").forEach((view) => {
    view.classList.toggle("active", view.id === viewId);
  });
  document.querySelectorAll(".view-tab").forEach((button) => {
    button.classList.toggle("active", button.dataset.view === viewId);
  });
}

document.querySelectorAll(".view-tab").forEach((button) => {
  button.addEventListener("click", () => switchView(button.dataset.view));
});

document.querySelectorAll(".tab").forEach((button) => {
  button.addEventListener("click", () => {
    document.querySelectorAll(".tab").forEach((tab) => tab.classList.remove("active"));
    button.classList.add("active");
    state.activeFilter = button.dataset.filter;
    renderProducts();
  });
});

searchInput.addEventListener("input", (event) => {
  state.search = event.target.value.trim();
  renderProducts();
});

categoryFilter.addEventListener("change", (event) => {
  state.category = event.target.value;
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const button = event.target.closest(".add-button");
  if (!button) return;

  const product = products.find((item) => item.id === Number(button.dataset.id));
  if (!product || product.stock === 0) return;

  state.cart.push(product);
  renderCart();
});

cartButton.addEventListener("click", () => setDrawer(true));
closeDrawer.addEventListener("click", () => setDrawer(false));
cartDrawer.addEventListener("click", (event) => {
  if (event.target === cartDrawer) setDrawer(false);
});

productForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#productName").value.trim();
  const category = document.querySelector("#productCategory").value;
  const price = Number(document.querySelector("#productPrice").value);
  const oldPrice = Number(document.querySelector("#productOldPrice").value || 0);
  const stock = Number(document.querySelector("#productStock").value);
  const markInput = document.querySelector("#productMark").value.trim().toUpperCase();
  const promo = document.querySelector("#productPromo").checked;
  const isNew = document.querySelector("#productNew").checked;

  if (!name || price < 0 || stock < 0) {
    productStatus.textContent = "Mohon isi data produk dengan benar.";
    return;
  }

  const product = {
    id: Date.now(),
    name,
    category,
    price,
    oldPrice,
    stock,
    promo,
    isNew,
    mark: markInput || makeMark(name),
    custom: true,
  };

  products.push(product);
  saveCustomProducts();
  productForm.reset();
  document.querySelector("#productNew").checked = true;
  productStatus.textContent = `${name} berhasil ditambahkan.`;
  renderAll();
  switchView("catalogView");
});

operatorForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (operatorCode.value.trim() !== operatorAccessCode) {
    operatorStatus.textContent = "Kode operator salah.";
    return;
  }

  setOperatorAccess(true);
});

operatorLogout.addEventListener("click", () => {
  sessionStorage.removeItem(storageKeys.operator);
  setOperatorAccess(false);
});

suggestionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const name = document.querySelector("#suggestionName").value.trim();
  const text = document.querySelector("#suggestionText").value.trim();
  if (!text) {
    suggestionStatus.textContent = "Mohon tulis saran terlebih dahulu.";
    return;
  }

  suggestions.push({ name, text, createdAt: new Date().toISOString() });
  saveSuggestions();
  suggestionForm.reset();
  suggestionStatus.textContent = "Terima kasih, saran sudah tersimpan.";
  renderSuggestions();
});

renderAll();
