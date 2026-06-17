import React, { useState, useEffect } from "react";
import "./App.css";

const categories = ["All", "Electronics", "Fashion", "Accessories", "Education"];

const MOCK_PRODUCTS = [
  { id: 1, name: "Wireless Earbuds", category: "Electronics", price: 1999, rating: 4.5, reviews: 320, emoji: "🎧", desc: "Premium sound with noise cancellation.", badge: "🔥 Hot" },
  { id: 2, name: "Smart Watch", category: "Electronics", price: 4999, rating: 4.3, reviews: 215, emoji: "⌚", desc: "Track fitness, calls & notifications.", badge: "New" },
  { id: 3, name: "Bluetooth Speaker", category: "Electronics", price: 2499, rating: 4.6, reviews: 180, emoji: "🔊", desc: "360° sound, waterproof & portable." },
  { id: 4, name: "Casual T-Shirt", category: "Fashion", price: 499, rating: 4.1, reviews: 540, emoji: "👕", desc: "Comfortable cotton, everyday wear.", badge: "50% Off" },
  { id: 5, name: "Denim Jacket", category: "Fashion", price: 1799, rating: 4.4, reviews: 98, emoji: "🧥", desc: "Classic denim, slim fit." },
  { id: 6, name: "Running Shoes", category: "Fashion", price: 2299, rating: 4.7, reviews: 412, emoji: "👟", desc: "Lightweight & breathable sole.", badge: "Top Rated" },
  { id: 7, name: "Leather Wallet", category: "Accessories", price: 799, rating: 4.2, reviews: 267, emoji: "👜", desc: "Genuine leather, slim design." },
  { id: 8, name: "Sunglasses", category: "Accessories", price: 999, rating: 4.0, reviews: 134, emoji: "🕶️", desc: "UV400 protection, polarised lens." },
  { id: 9, name: "Wrist Watch", category: "Accessories", price: 3499, rating: 4.8, reviews: 88, emoji: "🕰️", desc: "Analog quartz, stainless steel.", badge: "Premium" },
  { id: 10, name: "React Crash Course", category: "Education", price: 599, rating: 4.9, reviews: 720, emoji: "📘", desc: "Master React from scratch.", badge: "Bestseller" },
  { id: 11, name: "Python Bootcamp", category: "Education", price: 799, rating: 4.8, reviews: 1050, emoji: "🐍", desc: "Complete Python for beginners to pro." },
  { id: 12, name: "UI/UX Design Guide", category: "Education", price: 449, rating: 4.6, reviews: 390, emoji: "🎨", desc: "Design thinking & Figma essentials." },
];

function StarRating({ rating }) {
  return (
    <div className="stars">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={s <= Math.floor(rating) ? "star filled" : s - 0.5 <= rating ? "star half" : "star"}>★</span>
      ))}
      <span className="rating-num">{rating}</span>
    </div>
  );
}

export default function App() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cart, setCart] = useState([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState("summary");
  const [accountOpen, setAccountOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [user, setUser] = useState(null);
  const [storedAccount, setStoredAccount] = useState(null);
  const [accountForm, setAccountForm] = useState({ name: "", email: "", password: "" });
  const [addressForm, setAddressForm] = useState({ street: "", city: "", state: "", zip: "", country: "India" });
  const [shippingAddress, setShippingAddress] = useState({ street: "", city: "", state: "", zip: "", country: "India" });
  const [paymentDetails, setPaymentDetails] = useState({ cardNumber: "", expiry: "", cvv: "", billingName: "" });
  const [orders, setOrders] = useState([]);
  const [category, setCategory] = useState("All");
  const [search, setSearch] = useState("");
  const [wishlist, setWishlist] = useState([]);
  const [toast, setToast] = useState("");
  const [sortBy, setSortBy] = useState("default");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/products`);
        const data = await response.json();
        setProducts(Array.isArray(data) && data.length > 0 ? data : MOCK_PRODUCTS);
      } catch (error) {
        console.error('Error fetching products:', error);
        setProducts(MOCK_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const handleLogin = (event) => {
    event.preventDefault();
    if (!storedAccount) {
      showToast('No account found. Please register first.');
      return;
    }
    if (storedAccount.email !== accountForm.email || storedAccount.password !== accountForm.password) {
      showToast('Email or password is incorrect.');
      return;
    }
    setUser(storedAccount);
    setShippingAddress(storedAccount.address || shippingAddress);
    setAccountOpen(false);
    showToast(`Welcome back, ${storedAccount.name}!`);
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    if (!accountForm.name || !accountForm.email || !accountForm.password) {
      showToast('Please fill all registration fields.');
      return;
    }
    try {
      const API = process.env.REACT_APP_API_URL || 'http://localhost:5000';
      const response = await fetch(`${API}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: accountForm.name,
          email: accountForm.email,
          password: accountForm.password,
        }),
      });
      const data = await response.json();
      if (!response.ok) {
        showToast(data.message || 'Registration failed.');
        return;
      }
      const profile = { ...accountForm, address: addressForm };
      setStoredAccount(profile);
      setUser(profile);
      setShippingAddress(addressForm);
      setAccountOpen(false);
      showToast(`Welcome, ${accountForm.name}! Your account is ready.`);
    } catch (error) {
      console.error('Register error:', error);
      showToast('Registration failed. Please try again.');
    }
  };

  const handleLogout = () => {
    setUser(null);
    setAuthMode('login');
    setAccountForm({ name: '', email: '', password: '' });
    setAddressForm({ street: '', city: '', state: '', zip: '', country: 'India' });
    setAccountOpen(false);
    showToast('You have been logged out.');
  };

  const handleAddressUpdate = (event) => {
    event.preventDefault();
    if (!user) { showToast('Log in to update your address.'); return; }
    const updatedUser = { ...user, address: addressForm };
    setUser(updatedUser);
    setStoredAccount(updatedUser);
    setShippingAddress(addressForm);
    showToast('Address updated successfully.');
  };

  const handleProceedToPayment = () => {
    if (cart.length === 0) { showToast('Your cart is empty. Add items first.'); return; }
    if (!user) {
      setCartOpen(false);
      setAccountOpen(true);
      showToast('Please log in before checkout.');
      return;
    }
    setCheckoutStep('payment');
    setCheckoutOpen(true);
    setCartOpen(false);
  };

  const handlePlaceOrder = (event) => {
    event.preventDefault();
    if (!paymentDetails.cardNumber || !paymentDetails.expiry || !paymentDetails.cvv || !paymentDetails.billingName) {
      showToast('Enter payment details to place your order.');
      return;
    }
    if (!shippingAddress.street || !shippingAddress.city || !shippingAddress.state || !shippingAddress.zip) {
      showToast('Please update your shipping address.');
      return;
    }
    const newOrder = {
      id: Date.now(),
      items: [...cart],
      total: cartTotal,
      date: new Date().toLocaleDateString(),
      address: shippingAddress,
      payment: {
        card: `**** **** **** ${paymentDetails.cardNumber.slice(-4)}`,
        name: paymentDetails.billingName,
      },
      status: 'Confirmed',
    };
    setOrders(prev => [newOrder, ...prev]);
    setCart([]);
    setCheckoutOpen(false);
    setCheckoutStep('summary');
    setPaymentDetails({ cardNumber: '', expiry: '', cvv: '', billingName: '' });
    showToast('Your order has been placed successfully!');
  };

  const updateShippingAddress = (field, value) => {
    setShippingAddress(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="app">
        <div className="hero">
          <div className="hero-content">
            <h1 className="hero-title">Loading products...</h1>
          </div>
        </div>
      </div>
    );
  }

  const addToCart = (product) => {
    setCart(prev => {
      const exists = prev.find(i => i.id === product.id);
      if (exists) return prev.map(i => i.id === product.id ? {...i, qty: i.qty + 1} : i);
      return [...prev, {...product, qty: 1}];
    });
    showToast(`${product.emoji} ${product.name} added to cart!`);
  };

  const removeFromCart = (id) => setCart(prev => prev.filter(i => i.id !== id));
  const updateQty = (id, delta) => {
    setCart(prev => prev.map(i => i.id === id ? {...i, qty: Math.max(1, i.qty + delta)} : i));
  };
  const toggleWishlist = (id) => {
    setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const cartTotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const cartCount = cart.reduce((sum, i) => sum + i.qty, 0);

  let filtered = products.filter(p =>
    (category === "All" || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );
  if (sortBy === "low") filtered = [...filtered].sort((a,b) => a.price - b.price);
  if (sortBy === "high") filtered = [...filtered].sort((a,b) => b.price - a.price);
  if (sortBy === "rating") filtered = [...filtered].sort((a,b) => b.rating - a.rating);

  return (
    <div className="app" id="top">
      {toast && <div className="toast" style={{position:'fixed',top:20,left:'50%',transform:'translateX(-50%)',background:'#333',color:'#fff',padding:'12px 24px',borderRadius:8,zIndex:9999}}>{toast}</div>}

      {/* NAVBAR */}
      <nav className="navbar" style={{position:'relative',zIndex:100}}>
        <div className="nav-brand">
          <span className="brand-icon">🛍️</span>
          <span className="brand-name">ShopKart</span>
        </div>
        <div className="nav-search">
          <span className="search-icon">🔍</span>
          <input type="text" placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="search-input" />
        </div>
        <div className="nav-actions" style={{position:'relative',zIndex:100}}>
          <button
            className="nav-btn"
            style={{cursor:'pointer',position:'relative',zIndex:100}}
            onClick={() => { console.log('Login clicked'); setAccountOpen(true); }}
          >
            {user ? `👤 Hi, ${user.name}` : '👤 Login'}
          </button>
          <button className="cart-btn" style={{cursor:'pointer',position:'relative',zIndex:100}} onClick={() => { setCheckoutStep('summary'); setCartOpen(true); }}>
            🛒 Cart
            {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="hero">
        <div className="hero-content">
          <p className="hero-tag">🔥 Summer Sale — Up to 50% Off</p>
          <h1 className="hero-title">Shop the Best.<br/>Live the Best.</h1>
          <p className="hero-sub">Thousands of products. Unbeatable prices. Fast delivery.</p>
          <div className="hero-btns">
            <button className="btn-primary" onClick={() => document.getElementById('products').scrollIntoView({behavior:'smooth'})}>Shop Now →</button>
            <button className="btn-outline">View Deals</button>
          </div>
        </div>
        <div className="hero-visual">
          <div className="hero-card floating">🛍️</div>
          <div className="hero-card floating2">⚡</div>
          <div className="hero-card floating3">🎁</div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="categories-bar">
        {categories.map(cat => (
          <button key={cat} className={`cat-pill ${category === cat ? "active" : ""}`} onClick={() => setCategory(cat)}>
            {cat === "All" ? "🌟" : cat === "Electronics" ? "⚡" : cat === "Fashion" ? "👗" : cat === "Accessories" ? "💎" : "📖"} {cat}
          </button>
        ))}
        <select className="sort-select" value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="default">Sort By</option>
          <option value="low">Price: Low to High</option>
          <option value="high">Price: High to Low</option>
          <option value="rating">Top Rated</option>
        </select>
      </section>

      {/* STATS */}
      <div className="stats-bar">
        <div className="stat"><span className="stat-num">10K+</span><span className="stat-label">Products</span></div>
        <div className="stat"><span className="stat-num">50K+</span><span className="stat-label">Happy Customers</span></div>
        <div className="stat"><span className="stat-num">Free</span><span className="stat-label">Delivery on ₹500+</span></div>
        <div className="stat"><span className="stat-num">24/7</span><span className="stat-label">Customer Support</span></div>
      </div>

      {/* PRODUCTS */}
      <section className="products-section" id="products">
        <h2 className="section-title">
          {category === "All" ? "Featured Products" : category}
          <span className="product-count"> ({filtered.length} items)</span>
        </h2>
        {filtered.length === 0 ? (
          <div className="no-results">😕 No products found for "{search}"</div>
        ) : (
          <div className="products-grid">
            {filtered.map(product => (
              <div className="product-card" key={product.id}>
                {product.badge && <span className="badge">{product.badge}</span>}
                <button className={`wishlist-btn ${wishlist.includes(product.id) ? "wishlisted" : ""}`} onClick={() => toggleWishlist(product.id)}>
                  {wishlist.includes(product.id) ? "❤️" : "🤍"}
                </button>
                <div className="product-img"><span className="product-emoji">{product.emoji}</span></div>
                <div className="product-info">
                  <span className="product-category">{product.category}</span>
                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-desc">{product.desc}</p>
                  <StarRating rating={product.rating} />
                  <span className="review-count">({product.reviews} reviews)</span>
                  <div className="product-footer">
                    <span className="product-price">₹{product.price.toLocaleString()}</span>
                    <button className="add-to-cart" onClick={() => addToCart(product)}>+ Add to Cart</button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* PROMO */}
      <section className="promo-banner">
        <div className="promo-item"><span className="promo-icon">🚚</span><div><strong>Free Delivery</strong><p>On orders above ₹500</p></div></div>
        <div className="promo-item"><span className="promo-icon">🔄</span><div><strong>Easy Returns</strong><p>30-day return policy</p></div></div>
        <div className="promo-item"><span className="promo-icon">🔒</span><div><strong>Secure Payment</strong><p>100% safe transactions</p></div></div>
        <div className="promo-item"><span className="promo-icon">🎁</span><div><strong>Gift Wrapping</strong><p>Available on all orders</p></div></div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <div className="footer-top">
          <div className="footer-brand">
            <span className="brand-icon">🛍️</span> ShopKart
            <p>Your one-stop shop for everything you love.</p>
          </div>
          <div className="footer-links">
            <h4>Shop</h4>
            <a href="#top">Electronics</a>
            <a href="#top">Fashion</a>
            <a href="#top">Accessories</a>
          </div>
          <div className="footer-links">
            <h4>Help</h4>
            <a href="#top">Track Order</a>
            <a href="#top">Returns</a>
            <a href="#top">Contact Us</a>
          </div>
          <div className="footer-links">
            <h4>Follow Us</h4>
            <a href="#top">Instagram</a>
            <a href="#top">Twitter</a>
            <a href="#top">Facebook</a>
          </div>
        </div>
        <div className="footer-bottom">© 2026 ShopKart. All rights reserved. | Made with ❤️</div>
      </footer>

      {/* CART DRAWER */}
      {cartOpen && (
        <div className="cart-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:1000}} onClick={() => setCartOpen(false)}>
          <div className="cart-drawer" style={{position:'fixed',right:0,top:0,bottom:0,width:400,background:'#fff',overflowY:'auto',padding:20,zIndex:1001}} onClick={e => e.stopPropagation()}>
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
                  {cart.map(item => (
                    <div className="cart-item" key={item.id}>
                      <span className="cart-emoji">{item.emoji}</span>
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <span>₹{item.price.toLocaleString()}</span>
                      </div>
                      <div className="qty-controls">
                        <button onClick={() => updateQty(item.id, -1)}>−</button>
                        <span>{item.qty}</span>
                        <button onClick={() => updateQty(item.id, 1)}>+</button>
                      </div>
                      <button className="remove-btn" onClick={() => removeFromCart(item.id)}>🗑️</button>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total"><span>Total:</span><strong>₹{cartTotal.toLocaleString()}</strong></div>
                  <button className="checkout-btn" onClick={handleProceedToPayment}>Proceed to Checkout →</button>
                  <button className="continue-btn" onClick={() => setCartOpen(false)}>Continue Shopping</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* CHECKOUT DRAWER */}
      {checkoutOpen && (
        <div className="cart-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:1000}} onClick={() => setCheckoutOpen(false)}>
          <div className="cart-drawer" style={{position:'fixed',right:0,top:0,bottom:0,width:400,background:'#fff',overflowY:'auto',padding:20,zIndex:1001}} onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2>✅ Checkout</h2>
              <button className="close-btn" onClick={() => setCheckoutOpen(false)}>✕</button>
            </div>
            {checkoutStep === 'summary' ? (
              <>
                <div className="cart-items">
                  {cart.map(item => (
                    <div className="cart-item" key={item.id}>
                      <span className="cart-emoji">{item.emoji}</span>
                      <div className="cart-item-info">
                        <strong>{item.name}</strong>
                        <span>₹{item.price.toLocaleString()} x {item.qty}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <div className="cart-total"><span>Total:</span><strong>₹{cartTotal.toLocaleString()}</strong></div>
                  <button className="checkout-btn" onClick={() => setCheckoutStep('payment')}>Proceed to Payment →</button>
                  <button className="continue-btn" onClick={() => setCheckoutOpen(false)}>Cancel</button>
                </div>
              </>
            ) : (
              <form className="checkout-form" onSubmit={handlePlaceOrder}>
                <div className="checkout-section">
                  <h3>Shipping Address</h3>
                  <label>Street<input type="text" value={shippingAddress.street} onChange={e => updateShippingAddress('street', e.target.value)} /></label>
                  <label>City<input type="text" value={shippingAddress.city} onChange={e => updateShippingAddress('city', e.target.value)} /></label>
                  <label>State<input type="text" value={shippingAddress.state} onChange={e => updateShippingAddress('state', e.target.value)} /></label>
                  <label>ZIP<input type="text" value={shippingAddress.zip} onChange={e => updateShippingAddress('zip', e.target.value)} /></label>
                </div>
                <div className="checkout-section">
                  <h3>Payment Details</h3>
                  <label>Cardholder Name<input type="text" value={paymentDetails.billingName} onChange={e => setPaymentDetails(prev => ({ ...prev, billingName: e.target.value }))} /></label>
                  <label>Card Number<input type="text" value={paymentDetails.cardNumber} onChange={e => setPaymentDetails(prev => ({ ...prev, cardNumber: e.target.value }))} /></label>
                  <label>Expiry<input type="text" value={paymentDetails.expiry} onChange={e => setPaymentDetails(prev => ({ ...prev, expiry: e.target.value }))} /></label>
                  <label>CVV<input type="text" value={paymentDetails.cvv} onChange={e => setPaymentDetails(prev => ({ ...prev, cvv: e.target.value }))} /></label>
                </div>
                <div className="cart-footer">
                  <div className="cart-total"><span>Order Total:</span><strong>₹{cartTotal.toLocaleString()}</strong></div>
                  <button type="submit" className="checkout-btn">Pay Now</button>
                  <button className="continue-btn" type="button" onClick={() => setCheckoutStep('summary')}>Back to Summary</button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ACCOUNT MODAL */}
      {accountOpen && (
        <div className="cart-overlay" style={{position:'fixed',top:0,left:0,right:0,bottom:0,background:'rgba(0,0,0,0.5)',zIndex:1000}} onClick={() => setAccountOpen(false)}>
          <div className="cart-drawer" style={{position:'fixed',right:0,top:0,bottom:0,width:400,background:'#fff',overflowY:'auto',padding:20,zIndex:1001}} onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2>{user ? '👤 My Account' : authMode === 'login' ? '🔑 Sign In' : '✨ Create Account'}</h2>
              <button className="close-btn" onClick={() => setAccountOpen(false)}>✕</button>
            </div>
            {user ? (
              <div className="account-section">
                <p>👋 Hello, <strong>{user.name}</strong>!</p>
                <p>📧 {user.email}</p>
                <hr />
                <h3>Update Address</h3>
                <form onSubmit={handleAddressUpdate} className="checkout-form">
                  <label>Street<input type="text" value={addressForm.street} onChange={e => setAddressForm(p => ({...p, street: e.target.value}))} /></label>
                  <label>City<input type="text" value={addressForm.city} onChange={e => setAddressForm(p => ({...p, city: e.target.value}))} /></label>
                  <label>State<input type="text" value={addressForm.state} onChange={e => setAddressForm(p => ({...p, state: e.target.value}))} /></label>
                  <label>ZIP<input type="text" value={addressForm.zip} onChange={e => setAddressForm(p => ({...p, zip: e.target.value}))} /></label>
                  <button type="submit" className="checkout-btn">Save Address</button>
                </form>
                {orders.length > 0 && (
                  <>
                    <hr />
                    <h3>My Orders</h3>
                    {orders.map(order => (
                      <div key={order.id} className="order-card" style={{border:'1px solid #eee',padding:10,marginBottom:10,borderRadius:8}}>
                        <p><strong>Order #{order.id}</strong> — {order.date}</p>
                        <p>Status: {order.status}</p>
                        <p>Total: ₹{order.total.toLocaleString()}</p>
                      </div>
                    ))}
                  </>
                )}
                <button className="continue-btn" onClick={handleLogout} style={{marginTop:16}}>Logout</button>
              </div>
            ) : (
              <form className="checkout-form" onSubmit={authMode === 'login' ? handleLogin : handleRegister}>
                {authMode === 'register' && (
                  <label>Full Name<input type="text" value={accountForm.name} onChange={e => setAccountForm(p => ({...p, name: e.target.value}))} /></label>
                )}
                <label>Email<input type="email" value={accountForm.email} onChange={e => setAccountForm(p => ({...p, email: e.target.value}))} /></label>
                <label>Password<input type="password" value={accountForm.password} onChange={e => setAccountForm(p => ({...p, password: e.target.value}))} /></label>
                {authMode === 'register' && (
                  <>
                    <h3>Address (optional)</h3>
                    <label>Street<input type="text" value={addressForm.street} onChange={e => setAddressForm(p => ({...p, street: e.target.value}))} /></label>
                    <label>City<input type="text" value={addressForm.city} onChange={e => setAddressForm(p => ({...p, city: e.target.value}))} /></label>
                    <label>State<input type="text" value={addressForm.state} onChange={e => setAddressForm(p => ({...p, state: e.target.value}))} /></label>
                    <label>ZIP<input type="text" value={addressForm.zip} onChange={e => setAddressForm(p => ({...p, zip: e.target.value}))} /></label>
                  </>
                )}
                <button type="submit" className="checkout-btn" style={{marginTop:12}}>
                  {authMode === 'login' ? 'Sign In' : 'Create Account ✨'}
                </button>
                <button type="button" className="continue-btn" style={{marginTop:8}} onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}>
                  {authMode === 'login' ? 'No account? Register' : 'Already have an account? Sign in'}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}