(function () {
  const STORAGE_KEY = "gorras_cart_v3";
  function $(sel, root = document) {
    return root.querySelector(sel);
  }
  function formatMoney(n) {
    return Number(n).toFixed(2);
  }

  let cart = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

  const cartSidebar = $("#cartSidebar");
  const openCartBtn = $("#openCartBtn");
  const closeCartBtn = $("#closeCartBtn");
  const cartItemsRoot = $("#cartItems");
  const cartTotalEl = $("#cartTotal");
  const emptyCartBtn = $("#emptyCartBtn");
  const checkoutBtn = $("#checkoutBtn");

  function updateCartCountDisplay(totalCount) {
    document.querySelectorAll("#cartCount").forEach((el) => {
      el.textContent = totalCount;
      el.classList.add("updated");
      setTimeout(() => el.classList.remove("updated"), 300);
    });
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    render();
  }

  function addToCart(item) {
    const idx = cart.findIndex((c) => c.id === item.id);
    if (idx > -1) {
      cart[idx].qty += item.qty;
    } else {
      cart.push(item);
    }
    save();
  }

  function setQty(id, qty) {
    const idx = cart.findIndex((c) => c.id === id);
    if (idx > -1) {
      cart[idx].qty = Math.max(0, qty);
      if (cart[idx].qty === 0) cart.splice(idx, 1);
      save();
    }
  }

  function emptyCart() {
    cart = [];
    save();
  }

  function computeTotal() {
    return cart.reduce(
      (s, i) => s + Number(i.price || 0) * Number(i.qty || 1),
      0
    );
  }

  function render() {
    const totalCount = cart.reduce((s, i) => s + Number(i.qty || 0), 0);
    updateCartCountDisplay(totalCount);

    if (!cartItemsRoot) return;
    cartItemsRoot.innerHTML = "";

    if (cart.length === 0) {
      cartItemsRoot.innerHTML =
        '<div class="empty-msg">Tu carrito está vacío.</div>';
    } else {
      cart.forEach((it) => {
        const div = document.createElement("div");
        div.className = "cart-item";
        div.innerHTML = `
          <img src="${it.image || "https://via.placeholder.com/68"}" alt="${it.title || "Producto"}" />
          <div class="meta">
            <div><strong>${it.title}</strong></div>
            <div class="price">Precio: C$ ${formatMoney(it.price || 0)}</div>
            <div class="qty-controls">
              <button class="qty-btn" data-action="dec" data-id="${it.id}">-</button>
              <div class="qty-display">${it.qty}</div>
              <button class="qty-btn" data-action="inc" data-id="${it.id}">+</button>
            </div>
          </div>
        `;
        cartItemsRoot.appendChild(div);
      });
    }

    if (cartTotalEl) cartTotalEl.textContent = formatMoney(computeTotal());
  }

  if (cartItemsRoot) {
    cartItemsRoot.addEventListener("click", function (e) {
      const btn = e.target.closest(".qty-btn");
      if (!btn) return;
      const id = btn.getAttribute("data-id");
      const action = btn.getAttribute("data-action");
      const it = cart.find((c) => c.id === id);
      if (!it) return;
      if (action === "inc") it.qty = Number(it.qty) + 1;
      if (action === "dec") it.qty = Number(it.qty) - 1;
      if (it.qty <= 0) cart = cart.filter((c) => c.id !== id);
      save();
    });
  }

  if (openCartBtn)
    openCartBtn.addEventListener("click", function () {
      if (cartSidebar) cartSidebar.classList.add("visible");
    });

  if (closeCartBtn)
    closeCartBtn.addEventListener("click", function () {
      if (cartSidebar) cartSidebar.classList.remove("visible");
    });

  if (emptyCartBtn)
    emptyCartBtn.addEventListener("click", function () {
      if (confirm("¿Vaciar carrito?")) emptyCart();
    });

  if (checkoutBtn)
    checkoutBtn.addEventListener("click", function () {
      if (cart.length === 0) {
        alert("Tu carrito está vacío.");
        return;
      }
      const phone =
        $("#whatsappBtn")?.getAttribute("href")?.replace("https://wa.me/", "") ||
        "";
      let msg = "Hola, quiero hacer un pedido:%0A";
      cart.forEach(
        (i) =>
          (msg += `- ${i.title} x${i.qty} = C$${formatMoney(
            i.price * i.qty
          )}%0A`)
      );
      msg += `Total: C$${formatMoney(computeTotal())}`;
      const url = "https://wa.me/" + phone + "?text=" + msg;
      window.open(url, "_blank");
    });

  function initAddButtons() {
    const addBtns = document.querySelectorAll(".add-to-cart");
    addBtns.forEach((b) => {
      if (b.dataset._gorras_init) return;
      b.dataset._gorras_init = "1";
      b.addEventListener("click", function () {
        const id =
          b.getAttribute("data-id") || b.id || "p" + Date.now().toString();
        const title =
          b.getAttribute("data-title") ||
          b.getAttribute("data-name") ||
          b.dataset.title ||
          b.textContent.trim() ||
          "Producto";
        const price = Number(
          b.getAttribute("data-price") || b.dataset.price || 0
        );
        const image =
          b.getAttribute("data-image") || b.dataset.image || "";
        addToCart({ id, title, price, image, qty: 1 });
        b.classList.add("added");
        setTimeout(() => b.classList.remove("added"), 800);
      });
    });
  }

  window.GorrasCart = {
    add: addToCart,
    setQty: setQty,
    empty: emptyCart,
    getCart: () => JSON.parse(JSON.stringify(cart)),
  };

  initAddButtons();
  render();

  const mo = new MutationObserver(() => initAddButtons());
  mo.observe(document.body, { childList: true, subtree: true });
})();
