const menu = [
  { id: 1, name: "Grilled Chicken", price: 12.99 },
  { id: 2, name: "Biryani", price: 9.99 },
  { id: 3, name: "Tandoori Naan", price: 4.99 }
];

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");
  
  if (req.method === "GET") {
    res.status(200).json(menu);
  } else if (req.method === "POST") {
    const { name, price } = req.body || {};
    if (!name || price === undefined) {
      res.status(400).json({ error: "Name and price required" });
    } else {
      const newItem = { id: Math.max(...menu.map(m => m.id), 0) + 1, name, price };
      menu.push(newItem);
      res.status(201).json(newItem);
    }
  } else if (req.method === "DELETE") {
    const id = Number(req.query?.id);
    const idx = menu.findIndex(m => m.id === id);
    if (idx === -1) {
      res.status(404).json({ error: "Not found" });
    } else {
      menu.splice(idx, 1);
      res.status(200).json({ deleted: true });
    }
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};
