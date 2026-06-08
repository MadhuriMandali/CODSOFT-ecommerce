const router = require("express").Router();

const orders = [];

router.post("/", (req, res) => {
  const { cart, shippingAddress, user, total } = req.body;

  if (!user || !user.email) {
    return res.status(400).json({ message: "User must be logged in to place an order." });
  }

  if (!Array.isArray(cart) || cart.length === 0) {
    return res.status(400).json({ message: "Cart cannot be empty." });
  }

  if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.addressLine || !shippingAddress.city || !shippingAddress.postalCode) {
    return res.status(400).json({ message: "Complete shipping address is required." });
  }

  const orderId = orders.length + 1;
  const newOrder = {
    id: orderId,
    user,
    cart,
    shippingAddress,
    total,
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  res.json({ orderId, message: "Order placed successfully.", order: newOrder });
});

module.exports = router;