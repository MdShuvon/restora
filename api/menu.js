const { sql } = require("./_db");

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    if (req.method === "GET") {
      const menu = await sql`SELECT * FROM menu ORDER BY id ASC`;
      return res.status(200).json(menu);
    }

    if (req.method === "POST") {
      const { name, price } = req.body || {};
      if (!name || price === undefined) {
        return res.status(400).json({ error: "Name and price required" });
      }
      const result = await sql`INSERT INTO menu (name, price) VALUES (${name}, ${price}) RETURNING *`;
      return res.status(201).json(result[0]);
    }

    if (req.method === "DELETE") {
      const id = Number(req.query?.id);
      const result = await sql`DELETE FROM menu WHERE id = ${id} RETURNING *`;
      if (result.length === 0) {
        return res.status(404).json({ error: "Not found" });
      }
      return res.status(200).json({ deleted: true });
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("menu.js error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};