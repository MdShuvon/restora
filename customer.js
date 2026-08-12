const form = document.getElementById("customer-order-form");
const menuSelect = document.getElementById("menu-select");
const menuList = document.getElementById("customer-menu-list");
const menuTemplate = document.getElementById("customer-menu-template");
const statusMessage = document.getElementById("customer-status");
const customerTotal = document.getElementById("customer-total");
const menuCount = document.getElementById("menu-count");
const resetButton = document.getElementById("customer-reset-button");

const state = {
  menu: [],
  selectedItem: null
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatMoney(value) {
  return moneyFormatter.format(Number(value || 0));
}

function renderMenuOptions() {
  const defaultOption = '<option value="">Select item</option>';
  if (!state.menu.length) {
    menuSelect.innerHTML = defaultOption;
    menuCount.textContent = "0";
    customerTotal.textContent = formatMoney(0);
    return;
  }

  menuCount.textContent = String(state.menu.length);
  menuSelect.innerHTML = defaultOption + state.menu.map((item) => {
    const itemPrice = Number(item.price || 0);
    return `<option value="${item.id}">${item.name} - ${formatMoney(itemPrice)}</option>`;
  }).join("");

  if (state.selectedItem) {
    menuSelect.value = String(state.selectedItem.id);
  }
}

function renderMenuList() {
  if (!state.menu.length) {
    menuList.innerHTML = '<div class="order-card"><h4>No menu items yet</h4><p class="order-notes">Restaurant owner should add items first.</p></div>';
    statusMessage.textContent = "No menu items available.";
    return;
  }

  menuList.innerHTML = "";
  const fragment = document.createDocumentFragment();

  state.menu.forEach((item) => {
    const row = menuTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".menu-item-name").textContent = item.name;
    row.querySelector(".menu-item-price").textContent = formatMoney(item.price);
    row.querySelector(".select-item-button").addEventListener("click", () => {
      state.selectedItem = item;
      menuSelect.value = String(item.id);
      statusMessage.textContent = `${item.name} selected.`;
    });
    fragment.appendChild(row);
  });

  menuList.appendChild(fragment);
  statusMessage.textContent = `${state.menu.length} items available.`;
}

function updateCustomerTotal() {
  const selectedId = menuSelect.value;
  const selected = state.menu.find((item) => String(item.id) === String(selectedId));
  const quantity = Number(document.getElementById("quantity").value || 1);
  const total = selected ? Number(selected.price || 0) * quantity : 0;
  customerTotal.textContent = formatMoney(total);
}

async function loadMenu() {
  try {
    const response = await fetch("/api/menu");
    if (!response.ok) {
      throw new Error("Unable to load menu.");
    }

    const menu = await response.json();
    state.menu = Array.isArray(menu) ? menu : [];
    renderMenuOptions();
    renderMenuList();
    updateCustomerTotal();
  } catch (error) {
    console.error(error);
    statusMessage.textContent = "Menu cannot load. Please ask the restaurant owner to add items.";
    menuList.innerHTML = '<div class="order-card"><h4>Menu unavailable</h4><p class="order-notes">The restaurant menu is currently offline.</p></div>';
  }
}

function resetCustomerForm() {
  form.reset();
  document.getElementById("quantity").value = 1;
  state.selectedItem = null;
  updateCustomerTotal();
}

function showNotification(message, type = "success") {
  statusMessage.textContent = message;
  statusMessage.className = `status-message status-${type}`;
  statusMessage.style.opacity = "1";
  if (type === "success") {
    setTimeout(() => {
      statusMessage.style.opacity = "0.7";
    }, 3000);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  const customerName = document.getElementById("customer-name").value.trim();
  const tableNumber = document.getElementById("table-number").value.trim();
  const selectedId = menuSelect.value;
  const quantity = Number(document.getElementById("quantity").value);
  const notes = document.getElementById("notes").value.trim();
  const selectedItem = state.menu.find((item) => String(item.id) === String(selectedId));

  if (!customerName || !tableNumber || !selectedItem || quantity <= 0) {
    showNotification("Please complete all fields and choose a valid item.", "error");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Processing...";
  submitButton.disabled = true;

  try {
    const response = await fetch("/api/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        customerName,
        itemName: selectedItem.name,
        quantity,
        unitPrice: Number(selectedItem.price || 0),
        tableNumber,
        notes,
        source: "customer",
        status: "pending"
      })
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}));
      throw new Error(errorBody.error || "Unable to save order.");
    }

    const responseData = await response.json();
    showNotification("✓ Order submitted successfully! Receipt opening...", "success");
    const printWindow = window.open("", "_blank", "width=900,height=1000");

    if (printWindow) {
      const html = `<!DOCTYPE html><html><head><meta charset="UTF-8" /><title>Restora Receipt</title><style>body{font-family:Arial,sans-serif;padding:30px;background:#f7f3ee;color:#1f1a17} .box{max-width:480px;margin:auto;background:#fff;border-radius:16px;padding:24px;border:1px solid #e3d8c6} h1{text-align:center;margin-bottom:6px} .small{text-align:center;color:#675c55;letter-spacing:0.12em;text-transform:uppercase;font-size:12px;margin-bottom:24px} .row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #eee} .total{font-size:18px;font-weight:700;padding-top:16px;text-align:right} .notes{margin-top:18px;background:#faf5f0;padding:12px;border-radius:10px}</style></head><body><div class="box"><h1>Restora</h1><div class="small">Customer Receipt</div><div class="row"><span>Customer</span><strong>${escapeHtml(customerName)}</strong></div><div class="row"><span>Table</span><strong>${escapeHtml(tableNumber)}</strong></div><div class="row"><span>Item</span><strong>${escapeHtml(selectedItem.name)}</strong></div><div class="row"><span>Qty</span><strong>${quantity}</strong></div><div class="row"><span>Unit</span><strong>${escapeHtml(formatMoney(Number(selectedItem.price || 0)))}</strong></div><div class="total">Total: ${escapeHtml(formatMoney(Number(selectedItem.price || 0) * quantity))}</div><div class="notes"><strong>Notes:</strong> ${escapeHtml(notes || "No notes")}</div></div><script>window.onload=function(){window.print();setTimeout(function(){window.close();},500)};<\/script></body></html>`;
      printWindow.document.write(html);
      printWindow.document.close();
    }

    resetCustomerForm();
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    if (responseData && responseData.id) {
      console.log("Saved order id:", responseData.id);
    }
  } catch (error) {
    console.error(error);
    showNotification(error.message || "Unable to save order.", "error");
    submitButton.textContent = originalText;
    submitButton.disabled = false;
  }
});

menuSelect.addEventListener("change", updateCustomerTotal);
document.getElementById("quantity").addEventListener("input", updateCustomerTotal);
resetButton.addEventListener("click", resetCustomerForm);

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

loadMenu();
