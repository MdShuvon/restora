const { Redis } = require("@upstash/redis");

const redis = Redis.fromEnv();
const REVIEWS_KEY = "restora:reviews";
const NEXT_ID_KEY = "restora:reviews:nextId";

async function getReviews() {
  const data = await redis.get(REVIEWS_KEY);
  return Array.isArray(data) ? data : [];
}

async function saveReviews(reviews) {
  await redis.set(REVIEWS_KEY, reviews);
}

module.exports = async (req, res) => {
  res.setHeader("Content-Type", "application/json");
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method === "GET") {
    const reviews = await getReviews();
    res.status(200).json(reviews);
  } else if (req.method === "POST") {
    const { itemName, rating, comment, customerName } = req.body || {};
    const numericRating = Number(rating);

    if (!itemName || !numericRating || numericRating < 1 || numericRating > 5) {
      res.status(400).json({ error: "Item and a rating between 1-5 are required" });
      return;
    }

    const id = await redis.incr(NEXT_ID_KEY);
    const newReview = {
      id,
      item_name: itemName,
      rating: numericRating,
      comment: (comment || "").trim(),
      customer_name: (customerName || "").trim() || "Anonymous",
      created_at: new Date().toISOString()
    };

    const reviews = await getReviews();
    reviews.push(newReview);
    await saveReviews(reviews);

    res.status(201).json(newReview);
  } else {
    res.status(405).json({ error: "Method not allowed" });
  }
};