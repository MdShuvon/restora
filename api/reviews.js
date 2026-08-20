const { sql } = require("./_db");

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  try {
    if (req.method === "GET") {
      const reviews = await sql`SELECT * FROM reviews ORDER BY created_at DESC`;
      return res.status(200).json(reviews);
    }

    if (req.method === "POST") {
      const { itemName, rating, comment, customerName } = req.body || {};
      const numericRating = Number(rating);

      if (!itemName || !numericRating || numericRating < 1 || numericRating > 5) {
        return res.status(400).json({ error: "Item and a rating between 1-5 are required" });
      }

      const result = await sql`
        INSERT INTO reviews (item_name, rating, comment, customer_name, created_at)
        VALUES (${itemName}, ${numericRating}, ${(comment || "").trim()}, ${(customerName || "").trim() || "Anonymous"}, NOW())
        RETURNING *
      `;

      return res.status(201).json(result[0]);
    }

    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("reviews.js error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
};