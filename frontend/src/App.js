import React, { useState } from "react";
import "./App.css";

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

const categories = ["All", "Electronics", "Fashion", "Accessories", "Education"];
const categoryIcons = {
  All: "🌟",
  Electronics: "⚡",
  Fashion: "👗",
  Accessories: "💎",
  Education: "📖",
};

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1, 2, 3, 4, 5].map((s) => (
        <span key={s} className={s <= Math.floor(rating) ? "star filled" : s - 0.5 <= rating ? "star half" : "star"}>
          ★
        </span>
      ))}
      <span className="rating-num">{rating}</span>
    </div>
  );
}

export default function App() {
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [loginData, setLoginData] = useState({ email: "", password: "" });
  const [registerData, setRegisterData] = useState({ name: "", email: "", password: "" });
  const [authMode, setAuthMode] = useState("login");
  const [authError, setAuthError] = useState("");
  const [checkoutError, setCheckoutError] = useState("");
  const [checkoutSuccess, setCheckoutSuccess] = useState("");
  const [pendingCheckout, setPendingCheckout] = useState(false);
  const [address, setAddress] = useState({ fullName: "", addressLine: "", city: "", state: "", postalCode: "", country: "India" });
  const [toast, setToast] = useState("");
  const [loading, setLoading] = useState(false);
  const [orderLoading, setOrderLoading] = useState(false);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [sortBy, setSortBy] = useState("default");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const isNetworkError = (err) => {
    if (!err) return false;
    const msg = String(err.message || err);
    return err.name === "TypeError" || /failed to fetch|network|fetch/i.test(msg);
  };

  const addToCart = (product) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) return prev.map((item) => (item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
      return [...prev, { ...product, qty: 1 }];
    });
    showToast(`${product.emoji} ${product.name} added to cart!`);
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));

  const updateQty = (id, delta) => {
    setCart((prev) => prev.map((item) => (item.id === id ? { ...item, qty: Math.max(1, item.qty + delta) } : item)));
  };

  const toggleWishlist = (id) => {
    setWishlist((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const handleLoginOpen = () => {
    setAuthError("");
    setAuthMode("login");
    setPendingCheckout(false);
    setLoginOpen(true);
  };

  const handleRegisterOpen = () => {
    setAuthError("");
    setAuthMode("register");
    setPendingCheckout(false);
    setLoginOpen(true);
  };

  const handleLogout = () => {
    setUser(null);
    showToast("Logged out successfully.");
  };

  const handleAuthSubmit = async (event) => {
    event.preventDefault();
    setAuthError("");
    setLoading(true);

    const payload = authMode === "register" ? registerData : loginData;
    const endpoint = authMode === "register" ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || (authMode === "register" ? "Registration failed." : "Login failed."));
      setUser(data.user);
      setLoginOpen(false);
      setLoginData({ email: "", password: "" });
      setRegisterData({ name: "", email: "", password: "" });
      showToast(authMode === "register" ? `Account created. Welcome, ${data.user.name}!` : `Welcome back, ${data.user.name}!`);

      if (pendingCheckout) {
        setPendingCheckout(false);
        if (cart.length > 0) {
          setCheckoutError("");
          setCheckoutSuccess("");
          setCheckoutOpen(true);
        }
      }
    } catch (error) {
      // If backend is down (connection refused), allow a local demo fallback
      if (isNetworkError(error)) {
        if (authMode === "login") {
          if (loginData.email === "demo@shopkart.com" && loginData.password === "demo123") {
            const demoUser = { id: "demo", name: "Demo User", email: loginData.email };
            setUser(demoUser);
            setLoginOpen(false);
            setLoginData({ email: "", password: "" });
            showToast("Offline: signed in as Demo User");

            if (pendingCheckout) {
              setPendingCheckout(false);
              if (cart.length > 0) {
                setCheckoutError("");
                setCheckoutSuccess("");
                setCheckoutOpen(true);
              }
            }
          } else {
            setAuthError("Unable to reach server. Use demo@shopkart.com / demo123 to sign in offline.");
          }
        } else {
          const demoUser = { id: "demo", name: registerData.name || "Demo User", email: registerData.email || "demo@shopkart.com" };
          setUser(demoUser);
          setLoginOpen(false);
          setRegisterData({ name: "", email: "", password: "" });
          showToast("Offline: account created locally (demo)");

          if (pendingCheckout) {
            setPendingCheckout(false);
            if (cart.length > 0) {
              setCheckoutError("");
              setCheckoutSuccess("");
              setCheckoutOpen(true);
            }
          }
        }
      } else {
        setAuthError(error.message || "Unable to complete authentication. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      showToast("Add items to cart before checkout.");
      return;
    }

    if (!user) {
      setPendingCheckout(true);
      setCheckoutError("");
      setAuthMode("login");
      setLoginOpen(true);
      return;
    }

    setCheckoutError("");
    setCheckoutSuccess("");
    setCheckoutOpen(true);
  };

  const handlePlaceOrder = async (event) => {
    event.preventDefault();
    setCheckoutError("");

    if (!address.fullName.trim() || !address.addressLine.trim() || !address.city.trim() || !address.state.trim() || !address.postalCode.trim() || !address.country.trim()) {
      setCheckoutError("Please complete all shipping address fields.");
      return;
    }

    setOrderLoading(true);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cart, shippingAddress: address, user, total: cartTotal }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Order failed.");
      setCheckoutSuccess(`Order #${data.orderId} confirmed!`);
      setCart([]);
      setAddress({ fullName: "", addressLine: "", city: "", state: "", postalCode: "", country: "India" });
      showToast("Order placed successfully!");
    } catch (error) {
      // If server unreachable, save a demo/local order and inform the user
      if (isNetworkError(error)) {
        const orderId = `demo-${Date.now()}`;
        const order = { orderId, cart, shippingAddress: address, total: cartTotal, date: new Date().toISOString() };
        try {
          const stored = JSON.parse(localStorage.getItem("demoOrders") || "[]");
          stored.push(order);
          localStorage.setItem("demoOrders", JSON.stringify(stored));
        } catch (e) {
          // ignore localStorage failures
        }
        setCheckoutSuccess(`Order #${orderId} saved locally (offline).`);
        setCart([]);
        setAddress({ fullName: "", addressLine: "", city: "", state: "", postalCode: "", country: "India" });
        showToast("Order saved locally. It will be processed when the server is available.");
      } else {
        setCheckoutError(error.message || "Unable to place order. Please try again.");
      }
    } finally {
      setOrderLoading(false);
    }
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  let filtered = products.filter(
    (product) =>
      (category === "All" || product.category === category) &&
      product.name.toLowerCase().includes(search.toLowerCase())
  );

  if (sortBy === "low") filtered = [...filtered].sort((a, b) => a.price - b.price);
  if (sortBy === "high") filtered = [...filtered].sort((a, b) => b.price - a.price);
  if (sortBy === "rating") filtered = [...filtered].sort((a, b) => b.rating - a.rating);

  return (
    <div className="app">
      {toast && <div className="toast">{toast}</div>}

      <nav className="navbar">
        <div className="nav-brand">
          <span className="brand-icon">🛍️</span>
          <span className="brand-name">ShopKart</span>
        </div>
        <div className="nav-search">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="nav-actions">
          {user ? (
            <>
              <span className="nav-user">👋 Hi, {user.name}</span>
              <button className="nav-btn" onClick={handleLogout}>
                Logout 🔓
              </button>
            </>
          ) : (
            <>
              <button className="nav-btn" onClick={handleLoginOpen}>
                🔐 Login
              </button>
              <button className="nav-btn" onClick={handleRegisterOpen}>
                🆕 Create account
              </button>
            </>
          )}
          <button className="cart-btn" onClick={() => setCartOpen(true)}>
            🛒 Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">🔥 Summer Sale — Up to 50% Off</p>
          <h1 className="hero-title">
            Shop the Best.
            <br />Live the Best.
          </h1>
          <p className="hero-sub">Thousands of products. Unbeatable prices. Fast delivery.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => document.getElementById("products").scrollIntoView({ behavior: "smooth" })}>
              Shop Now →
            </button>
            <button className="btn-outline">View Deals</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card floating">🛍️</div>
          <div className="hero-card floating2">⚡</div>
          <div className="hero-card floating3">🎁</div>
        </div>
      </section>

      <section className="categories-bar">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`cat-pill ${category === cat ? "active" : ""}`}
            onClick={() => setCategory(cat)}
          >
            {categoryIcons[cat]} {cat}
            </button>
        ))}
        <select className="sort-select" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="default">Sort By</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </section>

      <div className="stats-bar">
        <div className="stat">
          <span className="stat-num">10K+</span>
          <span className="stat-label">Products</span>
        </div>
        <div className="stat">
          <span className="stat-num">50K+</span>
          <span className="stat-label">Happy Customers</span>
        </div>
        <div className="stat">
          <span className="stat-num">Free</span>
          <span className="stat-label">Delivery on ₹500+</span>
        </div>
        <div className="stat">
          <span className="stat-num">24/7</span>
          <span className="stat-label">Customer Support</span>
        </div>
      </div>

      <section className="products-section" id="products">
        <h2 className="section-title">
          {category === "All" ? "Featured Products" : category}
          <span className="product-count"> ({filtered.length} items)</span>
        </h2>
        {filtered.length === 0 ? (
          <div className="no-results">😕 No products found for "{search}"</div>
        ) : (
          <div className="products-grid">
            {filtered.map((product) => (
              <div className="product-card" key={product.id}>
                {product.badge && <span className="badge">{product.badge}</span>}
                <button
                  className={`wishlist-btn ${wishlist.includes(product.id) ? "wishlisted" : ""}`}
                  onClick={() => toggleWishlist(product.id)}
                >
                  {wishlist.includes(product.id) ? "❤️" : "🤍"}
                </button>
                <div className="product-img">
                  <span className="product-emoji">{product.emoji}</span>
                </div>
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">{product.desc}</p>
                  <StarRating rating={product.rating} />
                  <span className="review-count">({product.reviews} reviews)</span>
                  <div className="product-footer">
                    <span className="product-price">?{product.price.toLocaleString()}</span>
                    <button className="add-to-cart" onClick={() => addToCart(product)}>
                      + Add to Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="promo-banner">
        <div className="promo-item">
          <span className="promo-icon">🚚</span>
          <div>
            <strong>Free Delivery</strong>
            <p>On orders above ₹500</p>
          </div>
        </div>
        <div className="promo-item">
          <span className="promo-icon">🔄</span>
          <div>
            <strong>Easy Returns</strong>
            <p>30-day return policy</p>
          </div>
        </div>
        <div className="promo-item">
          <span className="promo-icon">🔒</span>
          <div>
            <strong>Secure Payment</strong>
            <p>100% safe transactions</p>
          </div>
        </div>
        <div className="promo-item">
          <span className="promo-icon">🎁</span>
          <div>
            <strong>Gift Wrapping</strong>
            <p>Available on all orders</p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-icon">🛍️</span> ShopKart
            <p>Your one-stop shop for everything you love.</p>
          </div>
          <div className="footer-links">
            <h4>Shop</h4>
            <button type="button" className="footer-link-button">Electronics</button>
            <button type="button" className="footer-link-button">Fashion</button>
            <button type="button" className="footer-link-button">Accessories</button>
          </div>
          <div className="footer-links">
            <h4>Help</h4>
            <button type="button" className="footer-link-button">Track Order</button>
            <button type="button" className="footer-link-button">Returns</button>
            <button type="button" className="footer-link-button">Contact Us</button>
          </div>
          <div className="footer-links">
            <h4>Follow Us</h4>
            <button type="button" className="footer-link-button">Instagram</button>
            <button type="button" className="footer-link-button">Twitter</button>
            <button type="button" className="footer-link-button">Facebook</button>
          </div>
        </div>
        <div className="footer-bottom">
          © 2026 ShopKart. All rights reserved. | Made with ❤️
        </div>
      </footer>

      {cartOpen && (
        <div className="cart-overlay" onClick={() => setCartOpen(false)}>
          <div className="cart-drawer" onClick={(e) => e.stopPropagation()}>
            <div className="cart-header">
              <h2>🛒 Your Cart ({cartCount})</h2>
              <button className="close-btn" onClick={() => setCartOpen(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <div className="cart-empty">
                <p>🛍️ Your cart is empty!</p>
                <button className="btn-primary" onClick={() => setCartOpen(false)}>Start Shopping</button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item) => (
                    <div className="cart-item" key={item.id}>
                      <span className="cart-emoji">{item.emoji}</span>
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <span>₹{item.price.toLocaleString()}</span>
                      </div>
                      <div className="qty-controls">
                        <button onClick={() => updateQty(item.id, -1)}>-</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}>+</button>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>🗑️</button>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total">
                    <span>Total:</span>
                    <strong>?{cartTotal.toLocaleString()}</strong>
                  </div>
                  <button className="checkout-btn" onClick={() => { setCartOpen(false); handleCheckout(); }}>
                    Proceed to Checkout
                  </button>
                  <button className="continue-btn" onClick={() => setCartOpen(false)}>Continue Shopping</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {loginOpen && (
        <div className="form-overlay" onClick={() => setLoginOpen(false)}>
          <div className="form-panel" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2>{authMode === "register" ? "✨ Create your ShopKart account" : "🔐 Login to ShopKart"}</h2>
              <button className="close-btn" onClick={() => setLoginOpen(false)}>✕</button>
            </div>
            <form className="auth-form" onSubmit={handleAuthSubmit}>
              {authMode === "register" && (
                <label>
                  Full Name
                  <input
                    type="text"
                    value={registerData.name}
                    onChange={(e) => setRegisterData({ ...registerData, name: e.target.value })}
                    placeholder="Your full name"
                    required
                  />
                </label>
              )}
              <label>
                Email
                <input
                  type="email"
                  value={authMode === "register" ? registerData.email : loginData.email}
                  onChange={(e) => authMode === "register" ? setRegisterData({ ...registerData, email: e.target.value }) : setLoginData({ ...loginData, email: e.target.value })}
                  placeholder="you@example.com"
                  required
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={authMode === "register" ? registerData.password : loginData.password}
                  onChange={(e) => authMode === "register" ? setRegisterData({ ...registerData, password: e.target.value }) : setLoginData({ ...loginData, password: e.target.value })}
                  placeholder="••••••••"
                  required
                />
              </label>
              {authError && <div className="form-error">{authError}</div>}
              <button className="btn-primary" type="submit" disabled={loading}>
                {loading ? (authMode === "register" ? "Creating account..." : "Signing in...") : (authMode === "register" ? "Create account ✨" : "Sign in 🔐")}
              </button>
              <div className="auth-switch">
                {authMode === "register" ? (
                  <p>
                    Already have an account?{' '}
                    <button type="button" className="link-button" onClick={handleLoginOpen}>
                      Sign in 🔐
                    </button>
                  </p>
                ) : (
                  <p>
                    New here?{' '}
                    <button type="button" className="link-button" onClick={handleRegisterOpen}>
                      Create account ✨
                    </button>
                  </p>
                )}
              </div>
              {authMode === "login" && (
                <p className="form-note">Use <strong>demo@shopkart.com</strong> / <strong>demo123</strong> to log in.</p>
              )}
            </form>
          </div>
        </div>
      )}

      {checkoutOpen && (
        <div className="form-overlay" onClick={() => setCheckoutOpen(false)}>
          <div className="form-panel checkout-panel" onClick={(e) => e.stopPropagation()}>
            <div className="form-header">
              <h2>Checkout</h2>
              <button className="close-btn" onClick={() => setCheckoutOpen(false)}>✕</button>
            </div>
            {cart.length === 0 ? (
              <div className="checkout-empty">
                <p>Your cart is empty. Add items before checkout.</p>
                <button className="btn-primary" onClick={() => setCheckoutOpen(false)}>Keep Shopping</button>
              </div>
            ) : (
              <form className="checkout-form" onSubmit={handlePlaceOrder}>
                <div className="checkout-summary">
                  <h3>Order Summary</h3>
                  <p>{cartCount} items • ₹{cartTotal.toLocaleString()}</p>
                  <div className="summary-items">
                    {cart.map((item) => (
                      <div key={item.id} className="summary-item">
                        <span>{item.qty}x {item.name}</span>
                        <strong>₹{(item.price * item.qty).toLocaleString()}</strong>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="checkout-address">
                  <h3>Shipping Address</h3>
                  <div className="form-grid">
                    <label>
                      Full Name
                      <input
                        value={address.fullName}
                        onChange={(e) => setAddress({ ...address, fullName: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Address
                      <input
                        value={address.addressLine}
                        onChange={(e) => setAddress({ ...address, addressLine: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      City
                      <input
                        value={address.city}
                        onChange={(e) => setAddress({ ...address, city: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      State
                      <input
                        value={address.state}
                        onChange={(e) => setAddress({ ...address, state: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Postal Code
                      <input
                        value={address.postalCode}
                        onChange={(e) => setAddress({ ...address, postalCode: e.target.value })}
                        required
                      />
                    </label>
                    <label>
                      Country
                      <input
                        value={address.country}
                        onChange={(e) => setAddress({ ...address, country: e.target.value })}
                        required
                      />
                    </label>
                  </div>
                </div>
                {checkoutError && <div className="form-error">{checkoutError}</div>}
                {checkoutSuccess && <div className="form-success">{checkoutSuccess}</div>}
                <button className="btn-primary" type="submit" disabled={orderLoading}>
                  {orderLoading ? "Placing order..." : "Place Order"}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
