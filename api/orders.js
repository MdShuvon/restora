const { sql } = require("./_db");

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    if (req.method === "GET") {
      const orders = await sql`SELECT * FROM orders ORDER BY id DESC`;
      return res.status(200).json(orders);
    }

    if (req.method === "POST") {
      const { customerName, itemName, quantity, unitPrice, tableNumber, notes, status, groupId, source } = req.body || {};

      if (!customerName || !itemName || !quantity || unitPrice === undefined) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const result = await sql`
        INSERT INTO orders (customer_name, item_name, quantity, unit_price, table_number, notes, status, source, group_id, created_at)
        VALUES (${customerName}, ${itemName}, ${quantity}, ${unitPrice}, ${tableNumber || "Table"}, ${notes || ""}, ${status || "pending"}, ${source || "customer"}, ${groupId || null}, NOW())
        RETURNING *
      `;

      return res.status(201).json(result[0]);
    }

    if (req.method === "PATCH") {
      const id = Number(req.query?.id);
      const { status, paymentStatus, paymentMethod, paidBy } = req.body || {};

      if (!status && !paymentStatus) {
        return res.status(400).json({ error: "Status or paymentStatus required" });
      }

      if (status) {
        await sql`UPDATE orders SET status = ${status} WHERE id = ${id}`;
      }

      if (paymentStatus === "paid") {
        await sql`
          UPDATE orders SET payment_status = ${paymentStatus},
            payment_method = ${paymentMethod || "cash"}, paid_by = ${paidBy || "Staff"}, paid_at = NOW()
          WHERE id = ${id}
        `;
      } else if (paymentStatus) {
        await sql`
          UPDATE orders SET payment_status = ${paymentStatus}, payment_method = NULL, paid_by = NULL, paid_at = NULL
          WHERE id = ${id}
        `;
      }

      const updated = await sql`SELECT * FROM orders WHERE id = ${id}`;
      if (updated.length === 0) {
        return res.status(404).json({ error: "Order not found" });
      }
      return res.status(200).json(updated[0]);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("orders.js error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};