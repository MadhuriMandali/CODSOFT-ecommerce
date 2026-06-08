const router = require("express").Router();

const products = [
  { id: 1, name: "Laptop", price: 50000, category: "Electronics", rating: 4.5, reviews: 128, badge: "Best Seller", emoji: "💻", desc: "High performance laptop for work & gaming" },
  { id: 2, name: "Smartphone", price: 25000, category: "Electronics", rating: 4.7, reviews: 245, badge: "New", emoji: "📱", desc: "Latest smartphone with pro camera system" },
  { id: 3, name: "T-Shirt", price: 3000, category: "Fashion", rating: 4.2, reviews: 89, badge: "", emoji: "👕", desc: "Premium cotton comfort fit t-shirt" },
  { id: 4, name: "Books", price: 3000, category: "Education", rating: 4.8, reviews: 312, badge: "Top Rated", emoji: "📚", desc: "Bestselling collection of must-read books" },
  { id: 5, name: "Headphones", price: 8000, category: "Electronics", rating: 4.6, reviews: 175, badge: "Hot", emoji: "🎧", desc: "Noise cancelling wireless headphones" },
  { id: 6, name: "Sneakers", price: 5000, category: "Fashion", rating: 4.3, reviews: 98, badge: "", emoji: "👟", desc: "Lightweight running & casual sneakers" },
  { id: 7, name: "Backpack", price: 2500, category: "Accessories", rating: 4.4, reviews: 67, badge: "Sale", emoji: "🎒", desc: "Durable 30L travel & college backpack" },
  { id: 8, name: "Watch", price: 12000, category: "Accessories", rating: 4.9, reviews: 203, badge: "Premium", emoji: "⌚", desc: "Smart watch with health tracking features" },
];

router.get("/", (req, res) => {
  res.json(products);
});

router.get("/:id", (req, res) => {
  const product = products.find(p => p.id === parseInt(req.params.id));
  if (!product) return res.status(404).json({ message: "Product not found" });
  res.json(product);
});

module.exports = router;