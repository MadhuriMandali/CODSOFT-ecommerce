const router = require("express").Router();

const users = [
  { name: "Demo User", email: "demo@shopkart.com", password: "demo123" }
];

router.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: "Name, email and password are required." });
  }

  const existingUser = users.find((user) => user.email === email);
  if (existingUser) {
    return res.status(409).json({ message: "Email is already registered." });
  }

  users.push({ name, email, password });
  res.json({ message: "Registration successful.", user: { name, email } });
});

router.post("/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: "Email and password are required." });
  }

  const user = users.find((item) => item.email === email && item.password === password);
  if (!user) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({ token: "sampletoken", user: { name: user.name, email: user.email } });
});

module.exports = router;