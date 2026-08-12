const ADMIN_PASSWORD = "restora123";

const adminModal = document.getElementById("admin-modal");
const loginInput = document.getElementById("admin-password-input");
const loginError = document.getElementById("admin-error");
const loginSubmit = document.getElementById("admin-submit");
const loginCancel = document.getElementById("admin-cancel");

function showLoginModal(message = "") {
  if (message) {
    loginError.textContent = message;
    loginError.classList.remove("hidden");
  } else {
    loginError.classList.add("hidden");
  }
  adminModal.classList.remove("hidden");
  loginInput.focus();
}

function hideLoginModal() {
  adminModal.classList.add("hidden");
}

function requireAdminAccess() {
  if (sessionStorage.getItem("restora-admin-auth") === "true") {
    return;
  }

  showLoginModal();
  return false;
}

function handleAdminLogin() {
  const value = loginInput.value.trim();
  if (value === ADMIN_PASSWORD) {
    sessionStorage.setItem("restora-admin-auth", "true");
    hideLoginModal();
    return true;
  }

  showLoginModal("Incorrect password.");
  return false;
}

loginSubmit.addEventListener("click", () => {
  if (handleAdminLogin()) {
    window.location.reload();
  }
});

loginCancel.addEventListener("click", () => {
  window.location.href = "/index.html";
});

loginInput.addEventListener("keydown", (event) => {
  if (event.key === "Enter") {
    handleAdminLogin();
  }
});

if (!sessionStorage.getItem("restora-admin-auth")) {
  showLoginModal();
}

const refreshButton = document.getElementById("refresh-button");
const ordersList = document.getElementById("orders-list");
const statusMessage = document.getElementById("status-message");
const menuList = document.getElementById("menu-list");
const menuStatus = document.getElementById("menu-status");
const restaurantOrderTemplate = document.getElementById("restaurant-order-template");
const menuTemplate = document.getElementById("menu-template");
const menuForm = document.getElementById("menu-form");
const pendingCount = document.getElementById("pending-count");
const readyCount = document.getElementById("ready-count");

const state = {
  orders: [],
  menu: []
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatMoney(value) {
  return moneyFormatter.format(Number(value || 0));
}

function formatDate(value) {
  const dateValue = new Date(value);
  return Number.isNaN(dateValue.getTime()) ? "Unknown" : dateValue.toLocaleString();
}

function renderDashboardMetrics() {
  const pending = state.orders.filter((order) => String(order.status || "pending") !== "ready").length;
  const ready = state.orders.filter((order) => String(order.status || "pending") === "ready").length;
  pendingCount.textContent = String(pending);
  readyCount.textContent = String(ready);
}

function renderMenu() {
  if (!state.menu.length) {
    menuList.innerHTML = '<div class="order-card"><h4>No menu items</h4><p class="order-notes">Add your first item using the form.</p></div>';
    menuStatus.textContent = "No menu items yet.";
    return;
  }

  menuList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  state.menu.forEach((item) => {
    const row = menuTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".menu-item-name").textContent = item.name;
    row.querySelector(".menu-item-price").textContent = formatMoney(item.price);
    row.querySelector(".menu-delete-button").addEventListener("click", () => deleteMenuItem(item.id));
    fragment.appendChild(row);
  });

  menuList.appendChild(fragment);
  menuStatus.textContent = `${state.menu.length} menu items loaded.`;
}

function renderOrders() {
  if (!state.orders.length) {
    ordersList.innerHTML = '<div class="order-card"><h4>No active orders</h4><p class="order-notes">Customer orders will appear here once submitted.</p></div>';
    statusMessage.textContent = "No orders found.";
    renderDashboardMetrics();
    return;
  }

  ordersList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  state.orders.forEach((order) => {
    const card = restaurantOrderTemplate.content.firstElementChild.cloneNode(true);
    const total = Number(order.quantity || 0) * Number(order.unit_price || 0);
    const status = String(order.status || "pending");
    const orderName = order.customer_name || "Guest";
    const tableValue = order.table_number || "Table";

    card.querySelector(".order-table").textContent = tableValue;
    card.querySelector(".order-total").textContent = formatMoney(total);
    card.querySelector(".order-customer").textContent = orderName;
    card.querySelector(".order-status").textContent = status === "ready" ? "Ready" : "Pending";
    card.querySelector(".order-eta").textContent = formatDate(order.created_at);
    card.querySelector(".order-item").textContent = `${order.item_name || "Item"} x ${order.quantity || 1}`;
    card.querySelector(".order-notes").textContent = order.notes || "No notes.";

    const callButton = card.querySelector(".call-button");
    callButton.addEventListener("click", () => callTable(order));

    const readyButton = card.querySelector(".ready-button");
    readyButton.addEventListener("click", () => markOrderReady(order.id));
    if (status === "ready") {
      readyButton.textContent = "Ready sent";
      readyButton.disabled = true;
    }

    fragment.appendChild(card);
  });

  ordersList.appendChild(fragment);
  statusMessage.textContent = `${state.orders.length} order(s) loaded.`;
  renderDashboardMetrics();
}

async function loadMenu() {
  try {
    const response = await fetch("/api/menu");
    if (!response.ok) {
      throw new Error("Unable to load menu.");
    }

    const menu = await response.json();
    state.menu = Array.isArray(menu) ? menu : [];
    renderMenu();
  } catch (error) {
    console.error(error);
    menuStatus.textContent = "Could not load menu.";
    menuList.innerHTML = '<div class="order-card"><h4>Menu error</h4><p class="order-notes">Unable to reach the menu API.</p></div>';
  }
}

async function loadOrders() {
  try {
    const response = await fetch("/api/orders");
    if (!response.ok) {
      throw new Error("Unable to load orders.");
    }

    const orders = await response.json();
    state.orders = Array.isArray(orders) ? orders : [];
    renderOrders();
  } catch (error) {
    console.error(error);
    statusMessage.textContent = "Could not load live order queue.";
  }
}

async function deleteMenuItem(itemId) {
  try {
    const response = await fetch(`/api/menu?id=${encodeURIComponent(itemId)}`, { method: "DELETE" });
    if (!response.ok) {
      throw new Error("Delete failed.");
    }

    await loadMenu();
  } catch (error) {
    console.error(error);
    menuStatus.textContent = "Menu item could not be deleted.";
  }
}

async function markOrderReady(orderId) {
  try {
    const response = await fetch(`/api/orders?id=${encodeURIComponent(orderId)}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status: "ready" })
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || "Unable to update order.");
    }

    await loadOrders();
    statusMessage.textContent = "\u2713 Order marked ready.";
    statusMessage.className = "status-message status-success";
  } catch (error) {
    console.error(error);
    statusMessage.textContent = error.message || "Unable to update order.";
    statusMessage.className = "status-message status-error";
  }
}

function callTable(order) {
  const table = order.table_number || "this table";
  const customer = order.customer_name || "Guest";
  statusMessage.textContent = `\ud83d\udd14 Calling table ${table} for ${customer}...`;
  statusMessage.className = "status-message status-success";
  setTimeout(() => {
    statusMessage.textContent = `\u2713 Table ${table} called.`;
  }, 1200);
}

menuForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  const name = document.getElementById("menu-name").value.trim();
  const price = Number(document.getElementById("menu-price").value);

  if (!name || Number.isNaN(price) || price < 0) {
    menuStatus.textContent = "Please enter a valid item name and price.";
    menuStatus.className = "status-message status-error";
    return;
  }

  const submitButton = menuForm.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Adding...";
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/menu", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ name, price })
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || "Unable to add menu item.");
    }

    menuForm.reset();
    document.getElementById("menu-price").value = "0.00";
    await loadMenu();
    menuStatus.textContent = "\u2713 Menu item \"" + name + "\" added successfully.";
    menuStatus.className = "status-message status-success";
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  } catch (error) {
    console.error(error);
    menuStatus.textContent = error.message || "Unable to add menu item.";
    menuStatus.className = "status-message status-error";
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
});

refreshButton.addEventListener("click", async () => {
  await loadMenu();
  await loadOrders();
});

loadMenu();
loadOrders();
