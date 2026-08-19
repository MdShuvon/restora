let orders = [
  {
    id: 1,
    customer_name: "Demo",
    item_name: "Sample Dish",
    quantity: 2,
    unit_price: 12.99,
    table_number: "Table 5",
    notes: "No onions",
    status: "pending",
    source: "customer",
    group_id: "single-1",
    created_at: new Date().toISOString()
  }
];

let nextId = 2;

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "GET") {
    res.status(200).json(orders);
  } else if (req.method === "POST") {
    const {
      customerName,
      itemName,
      quantity,
      unitPrice,
      tableNumber,
      notes,
      status,
      groupId,
      source
    } = req.body || {};

    if (!customerName || !itemName || !quantity || unitPrice === undefined) {
      res.status(400).json({ error: "Missing required fields" });
    } else {
      const id = nextId++;
      const newOrder = {
        id,
        customer_name: customerName,
        item_name: itemName,
        quantity,
        unit_price: unitPrice,
        table_number: tableNumber || "Table",
        notes: notes || "",
        status: status || "pending",
        source: source || "customer",
        group_id: groupId || `single-${id}`,
        created_at: new Date().toISOString()
      };
      orders.push(newOrder);
      res.status(201).json(newOrder);
    }
  } else if (req.method === "PATCH") {
    const id = Number(req.query?.id);
    const { status, paymentStatus, paymentMethod, paidBy } = req.body || {};
    const order = orders.find(o => o.id === id);

    if (!order) {
      res.status(404).json({ error: "Order not found" });
      return;
    }

    if (!status && !paymentStatus) {
      res.status(400).json({ error: "Status or paymentStatus required" });
      return;
    }

    if (status) {
      order.status = status;
    }

    if (paymentStatus) {
      order.payment_status = paymentStatus;
      if (paymentStatus === "paid") {
        order.payment_method = paymentMethod || order.payment_method || "cash";
        order.paid_by = paidBy || order.paid_by || "Staff";
        order.paid_at = new Date().toISOString();
      } else {
        order.payment_method = null;
        order.paid_by = null;
        order.paid_at = null;
      }
    }

    res.status(200).json(order);
  }
};