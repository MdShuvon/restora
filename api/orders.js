let orders = [
  {
    id: 1,
    customer_name: "Demo",
    item_name: "Sample Dish",
    quantity: 2,
    unit_price: 12.99,
    table_number: "Table 5",
    notes: "No onions",
    status: "pending"
  }
];

let nextId = 2;

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  if (req.method === "GET") {
    res.status(200).json(orders);
  } else if (req.method === "POST") {
    const { customerName, itemName, quantity, unitPrice, tableNumber, notes, status } = req.body || {};
    if (!customerName || !itemName || !quantity || unitPrice === undefined) {
      res.status(400).json({ error: "Missing required fields" });
    } else {
      const newOrder = {
        id: nextId++,
        customer_name: customerName,
        item_name: itemName,
        quantity,
        unit_price: unitPrice,
        table_number: tableNumber || "Table",
        notes: notes || "",
        status: status || "pending"
      };
      orders.push(newOrder);
      res.status(201).json(newOrder);
    }
  } else if (req.method === "PATCH") {
    const id = Number(req.query?.id);
    const { status } = req.body || {};
    const order = orders.find(o => o.id === id);
    if (!order) {
      res.status(404).json({ error: "Order not found" });
    } else if (!status) {
      res.status(400).json({ error: "Status required" });
    } else {
      order.status = status;
      res.status(200).json(order);
    }
  } else if (req.method === "DELETE") {
    const id = Number(req.query?.id);
    const idx = orders.findIndex(o => o.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Order not found" });
    } else {
      orders.splice(idx, 1);
      res.status(200).json({ deleted: true });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};