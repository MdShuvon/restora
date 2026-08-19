const form = document.getElementById("customer-order-form");
const menuSelect = document.getElementById("menu-select");
const statusMessage = document.getElementById("customer-status");
const customerTotal = document.getElementById("customer-total");
const menuCount = document.getElementById("menu-count");
const resetButton = document.getElementById("customer-reset-button");
const addToCartButton = document.getElementById("add-to-cart-button");
const cartList = document.getElementById("cart-list");
const cartTemplate = document.getElementById("cart-item-template");
const cartEmptyMessage = document.getElementById("cart-empty-message");

const receiptEmptyMessage = document.getElementById("receipt-empty-message");
const receiptPrintArea = document.getElementById("receipt-print-area");
const receiptStatusBadge = document.getElementById("receipt-status-badge");
const receiptNoEl = document.getElementById("receipt-no");
const receiptDateEl = document.getElementById("receipt-date");
const receiptCustomerEl = document.getElementById("receipt-customer");
const receiptTableEl = document.getElementById("receipt-table");
const receiptItemsBody = document.getElementById("receipt-items-body");
const receiptGrandTotalEl = document.getElementById("receipt-grand-total");
const receiptPrintButton = document.getElementById("receipt-print-button");
const receiptDownloadButton = document.getElementById("receipt-download-button");

const state = {
  menu: [],
  cart: [], // { itemId, name, unitPrice, quantity, notes }
  orderSubmitted: false,
  receiptNo: null,
  receiptDate: null
};

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD"
});

function formatMoney(value) {
  return moneyFormatter.format(Number(value || 0));
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function renderMenuOptions() {
  const defaultOption = '<option value="">Select item</option>';
  if (!state.menu.length) {
    menuSelect.innerHTML = defaultOption;
    menuCount.textContent = "0";
    return;
  }

  menuCount.textContent = String(state.menu.length);
  menuSelect.innerHTML = defaultOption + state.menu.map((item) => {
    const itemPrice = Number(item.price || 0);
    return `<option value="${item.id}">${item.name} — ${formatMoney(itemPrice)}</option>`;
  }).join("");
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
    statusMessage.textContent = `${state.menu.length} items available. Choose one from the dropdown.`;
  } catch (error) {
    console.error(error);
    statusMessage.textContent = "Menu cannot load. Please ask the restaurant owner to add items.";
  }
}

function cartLineTotal(cartItem) {
  return Number(cartItem.unitPrice || 0) * Number(cartItem.quantity || 0);
}

function cartGrandTotal() {
  return state.cart.reduce((sum, cartItem) => sum + cartLineTotal(cartItem), 0);
}

function updateCartTotal() {
  customerTotal.textContent = formatMoney(cartGrandTotal());
}

function renderOrderPreview() {
  if (!state.cart.length) {
    receiptEmptyMessage.classList.remove("hidden");
    receiptPrintArea.classList.add("hidden");
    receiptPrintButton.disabled = true;
    receiptDownloadButton.disabled = true;
    return;
  }

  receiptEmptyMessage.classList.add("hidden");
  receiptPrintArea.classList.remove("hidden");
  receiptPrintButton.disabled = false;
  receiptDownloadButton.disabled = false;

  const customerName = document.getElementById("customer-name").value.trim();
  const tableNumber = document.getElementById("table-number").value.trim();

  if (state.orderSubmitted) {
    receiptStatusBadge.textContent = "✓ Confirmed";
    receiptStatusBadge.className = "receipt-submitted-badge";
    receiptNoEl.textContent = state.receiptNo || "—";
    receiptDateEl.textContent = state.receiptDate || "—";
  } else {
    receiptStatusBadge.textContent = "Draft — not submitted yet";
    receiptStatusBadge.className = "receipt-draft-badge";
    receiptNoEl.textContent = "Pending";
    receiptDateEl.textContent = "Pending";
  }

  receiptCustomerEl.textContent = customerName || "—";
  receiptTableEl.textContent = tableNumber || "—";

  receiptItemsBody.innerHTML = state.cart.map((item) => `
    <tr>
      <td>
        <div>${escapeHtml(item.name)}</div>
        ${item.notes ? `<div class="receipt-item-note">${escapeHtml(item.notes)}</div>` : ""}
      </td>
      <td class="num">${item.quantity}</td>
      <td class="num">${escapeHtml(formatMoney(item.unitPrice))}</td>
      <td class="num">${escapeHtml(formatMoney(cartLineTotal(item)))}</td>
    </tr>
  `).join("");

  receiptGrandTotalEl.textContent = formatMoney(cartGrandTotal());
  const paymentNoteEl = document.getElementById("receipt-payment-note");
  if (paymentNoteEl) {
    paymentNoteEl.textContent = "Payment status: Unpaid — please pay at the table after your meal.";
  }
}

function renderCart() {
  cartList.innerHTML = "";

  if (!state.cart.length) {
    cartEmptyMessage.style.display = "block";
    updateCartTotal();
    renderOrderPreview();
    return;
  }

  cartEmptyMessage.style.display = "none";
  const fragment = document.createDocumentFragment();

  state.cart.forEach((cartItem, index) => {
    const row = cartTemplate.content.firstElementChild.cloneNode(true);
    row.querySelector(".cart-item-name").textContent = cartItem.name;
    row.querySelector(".cart-item-qty").textContent = `Qty: ${cartItem.quantity}`;
    row.querySelector(".cart-item-unit").textContent = `${formatMoney(cartItem.unitPrice)} each`;
    row.querySelector(".cart-item-line-total").textContent = formatMoney(cartLineTotal(cartItem));
    row.querySelector(".cart-item-notes").textContent = cartItem.notes ? `Note: ${cartItem.notes}` : "No notes";

    const removeButton = row.querySelector(".cart-remove-button");
    removeButton.addEventListener("click", () => {
      state.cart.splice(index, 1);
      renderCart();
    });
    if (state.orderSubmitted) {
      removeButton.disabled = true;
    }

    fragment.appendChild(row);
  });

  cartList.appendChild(fragment);
  updateCartTotal();
  renderOrderPreview();
}

function setFormEnabled(enabled) {
  document.getElementById("customer-name").disabled = !enabled;
  document.getElementById("table-number").disabled = !enabled;
  menuSelect.disabled = !enabled;
  document.getElementById("quantity").disabled = !enabled;
  document.getElementById("notes").disabled = !enabled;
  addToCartButton.disabled = !enabled;
  form.querySelector('button[type="submit"]').disabled = !enabled;
}

function resetCustomerForm() {
  form.reset();
  document.getElementById("quantity").value = 1;
  state.cart = [];
  state.orderSubmitted = false;
  state.receiptNo = null;
  state.receiptDate = null;
  setFormEnabled(true);
  renderCart();
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

addToCartButton.addEventListener("click", () => {
  const selectedId = menuSelect.value;
  const quantity = Number(document.getElementById("quantity").value);
  const notes = document.getElementById("notes").value.trim();
  const selectedItem = state.menu.find((item) => String(item.id) === String(selectedId));

  if (!selectedItem) {
    showNotification("Please choose an item first.", "error");
    return;
  }

  if (!Number.isInteger(quantity) || quantity <= 0) {
    showNotification("Quantity must be at least 1.", "error");
    return;
  }

  state.cart.push({
    itemId: selectedItem.id,
    name: selectedItem.name,
    unitPrice: Number(selectedItem.price || 0),
    quantity,
    notes
  });

  renderCart();
  showNotification(`${selectedItem.name} added to your order.`, "success");

  menuSelect.value = "";
  document.getElementById("quantity").value = 1;
  document.getElementById("notes").value = "";
});

// Keep the live preview's customer name / table number in sync as they type
document.getElementById("customer-name").addEventListener("input", renderOrderPreview);
document.getElementById("table-number").addEventListener("input", renderOrderPreview);

receiptPrintButton.addEventListener("click", () => {
  window.print();
});

receiptDownloadButton.addEventListener("click", () => {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ unit: "mm", format: "a4" });

  const customerName = document.getElementById("customer-name").value.trim() || "-";
  const tableNumber = document.getElementById("table-number").value.trim() || "-";
  const receiptNo = state.orderSubmitted ? (state.receiptNo || "-") : "Pending";
  const receiptDateText = state.orderSubmitted
    ? (state.receiptDate || "-")
    : new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" });
  const grandTotal = cartGrandTotal();

  doc.setFont("helvetica", "bold");
  doc.setFontSize(22);
  doc.setTextColor(184, 92, 56);
  doc.text("Restora", 105, 20, { align: "center" });

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(120, 110, 100);
  doc.text("ORDER RECEIPT", 105, 27, { align: "center" });

  doc.setDrawColor(220, 210, 195);
  doc.line(20, 32, 190, 32);

  let y = 40;
  const metaLine = (label, value) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(100, 90, 80);
    doc.text(label, 20, y);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(30, 25, 20);
    doc.text(String(value), 190, y, { align: "right" });
    y += 7;
  };
  metaLine("Receipt No.", receiptNo);
  metaLine("Date", receiptDateText);
  metaLine("Customer", customerName);
  metaLine("Table", tableNumber);

  const rows = state.cart.map((item) => [
    item.name + (item.notes ? `\n(${item.notes})` : ""),
    String(item.quantity),
    formatMoney(item.unitPrice),
    formatMoney(cartLineTotal(item))
  ]);

  doc.autoTable({
    startY: y + 4,
    head: [["Item", "Qty", "Price", "Total"]],
    body: rows,
    theme: "grid",
    headStyles: { fillColor: [34, 79, 139], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      1: { halign: "right", cellWidth: 20 },
      2: { halign: "right", cellWidth: 30 },
      3: { halign: "right", cellWidth: 30 }
    },
    styles: { font: "helvetica", fontSize: 10, cellPadding: 3 }
  });

  const finalY = doc.lastAutoTable.finalY + 10;
  doc.setDrawColor(30, 25, 20);
  doc.setLineWidth(0.6);
  doc.line(20, finalY, 190, finalY);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.setTextColor(100, 90, 80);
  doc.text("Grand total", 20, finalY + 9);

    doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(184, 92, 56);
  doc.text(formatMoney(grandTotal), 190, finalY + 9, { align: "right" });

  const noteY = finalY + 20;
  doc.setFillColor(184, 92, 56);
  doc.roundedRect(20, noteY - 5, 170, 9, 2, 2, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9);
  doc.setTextColor(255, 255, 255);
  doc.text("UNPAID — Please pay at the table after your meal", 105, noteY + 1, { align: "center" });

  const filename = state.orderSubmitted ? `restora-${state.receiptNo}.pdf` : "restora-draft-order.pdf";
  doc.save(filename);
});

form.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (state.orderSubmitted) {
    return;
  }

  const customerName = document.getElementById("customer-name").value.trim();
  const tableNumber = document.getElementById("table-number").value.trim();

  if (!customerName || !tableNumber) {
    showNotification("Please enter customer name and table number.", "error");
    return;
  }

  if (!state.cart.length) {
    showNotification("Add at least one item to your order before submitting.", "error");
    return;
  }

  const submitButton = form.querySelector('button[type="submit"]');
  const originalText = submitButton.textContent;
  submitButton.textContent = "Processing...";
  submitButton.disabled = true;

  try {
    const orderGroupId = `grp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    // Each cart item is saved as its own order line, all tagged with the
    // same groupId, customer name, and table number — the restaurant
    // dashboard groups them back into one ticket (owner's copy).
    for (const cartItem of state.cart) {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          itemName: cartItem.name,
          quantity: cartItem.quantity,
          unitPrice: cartItem.unitPrice,
          tableNumber,
          notes: cartItem.notes,
          source: "customer",
          status: "pending",
          groupId: orderGroupId
        })
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({}));
        throw new Error(errorBody.error || "Unable to save one of the order items.");
      }
    }

    state.orderSubmitted = true;
    state.receiptNo = "R-" + Date.now().toString().slice(-8);
    state.receiptDate = new Date().toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short"
    });

    setFormEnabled(false);
    renderCart();
    showNotification("✓ Order submitted successfully! See your receipt on the right.", "success");
    alert("✓ Your order has been submitted successfully! Check your receipt on the right.");
  } catch (error) {
    console.error(error);
    submitButton.textContent = originalText;
    submitButton.disabled = false;
    showNotification(error.message || "Unable to save order.", "error");
  }
});

resetButton.addEventListener("click", resetCustomerForm);

renderCart();
loadMenu();