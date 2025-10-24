import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    
    const savedCart = JSON.parse(localStorage.getItem('cart') || '[]');
    setCartItems(savedCart);

  
    const handleCartUpdate = () => {
      const updatedCart = JSON.parse(localStorage.getItem('cart') || '[]');
      setCartItems(updatedCart);
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    return () => window.removeEventListener('cartUpdated', handleCartUpdate);
  }, []);

  const updateQuantity = (index, newQuantity) => {
    if (newQuantity < 1 || newQuantity > 5) return;
    
    const updatedCart = [...cartItems];
    updatedCart[index].quantity = newQuantity;
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (index) => {
    const updatedCart = cartItems.filter((_, i) => i !== index);
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      alert('Your cart is empty. Add some items first!');
      return;
    }
    
    
    navigate('/checkout');
  };

  const handleContinueShopping = () => {
    navigate('/shop');
  };

  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <div className="cart-page">
      <Navbar />
      
      {/* Hero Section */}
      <div className="hero full-bleed">
        <div className="hero-inner">
          <div className="hero-mark">M</div>
          <h1>Cart</h1>
          <div className="breadcrumb">
            <span 
              style={{cursor: 'pointer'}} 
              onClick={() => navigate('/')}
              onMouseOver={(e) => e.target.style.color = '#D4AF37'}
              onMouseOut={(e) => e.target.style.color = '#fff'}
            >
              Home
            </span>
            <span style={{margin: '0 8px'}}>›</span>
            <span>Cart</span>
          </div>
        </div>
      </div>

      {/* Cart Content */}
      <div className="container">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <h2>Your cart is empty</h2>
            <p>Add some items to get started!</p>
            <button className="shop-btn" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
          </div>
        ) : (
          <div className="cart-content">
            {/* Cart Table */}
            <div className="cart-main">
              <div className="cart-table">
                <div className="cart-header">
                  <div className="header-cell">Product</div>
                  <div className="header-cell">Price</div>
                  <div className="header-cell">Quantity</div>
                  <div className="header-cell">Subtotal</div>
                  <div className="header-cell"></div>
                </div>

                {cartItems.map((item, index) => (
                  <div key={index} className="cart-row">
                    <div className="product-cell">
                      <img src={item.image} alt={item.name} className="product-image" />
                      <div className="product-details">
                        <span className="product-name">{item.name}</span>
                        <div className="product-options">
                          <span className="option-label">Size: <strong>{item.size}</strong></span>
                          <span className="option-label">Color: 
                            <span 
                              className="color-indicator"
                              style={{
                                background: item.color === 'blue' ? '#3b82f6' : 
                                           item.color === 'black' ? '#111827' : '#a16207'
                              }}
                            ></span>
                            <strong>{item.color}</strong>
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="price-cell">Rs. {item.price.toLocaleString()}</div>
                    <div className="quantity-cell">
                      <div className="quantity-controls">
                        <button 
                          onClick={() => updateQuantity(index, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                        >
                          -
                        </button>
                        <span>{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(index, item.quantity + 1)}
                          disabled={item.quantity >= 5}
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="subtotal-cell">Rs. {(item.price * item.quantity).toLocaleString()}</div>
                    <div className="remove-cell">
                      <button 
                        className="remove-btn"
                        onClick={() => removeItem(index)}
                        title="Remove item"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3,6 5,6 21,6"/>
                          <path d="M19,6v14a2,2,0,0,1-2,2H7a2,2,0,0,1-2-2V6m3,0V4a2,2,0,0,1,2-2h4a2,2,0,0,1,2,2V6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Cart Totals */}
            <div className="cart-sidebar">
              <div className="cart-totals">
                <h3>Cart Totals</h3>
                
                <div className="totals-row">
                  <span>Subtotal</span>
                  <span className="amount">Rs. {subtotal.toLocaleString()}</span>
                </div>
                
                <div className="totals-row total-row">
                  <span>Total</span>
                  <span className="amount total-amount">Rs. {subtotal.toLocaleString()}</span>
                </div>
                
                <button className="checkout-btn" onClick={handleCheckout}>
                  Check Out
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Features Section */}
      <div className="features full-bleed">
        <div className="container">
          <div className="features-inner">
            <div className="feature">
              <h4>Free Delivery</h4>
              <p>For all orders over Rs. 50,000, consectetur adipim scing elit.</p>
            </div>
            <div className="feature">
              <h4>90 Days Return</h4>
              <p>If goods have problems, consectetur adipim scing elit.</p>
            </div>
            <div className="feature">
              <h4>Secure Payment</h4>
              <p>100% secure payment, consectetur adipim scing elit.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      {/* Styles */}
      <style>{`
        /* Page base */
        :root {
          --max-width: 1200px;
          --muted: #6b7280;
          --pink: #F8EDEE;
          --gold: #D4AF37;
          --light-cream: #FFF9E6;
        }

        * { box-sizing: border-box; }
        body, html, .cart-page { 
          background: #fff; 
          color: #111827; 
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; 
        }

        .container {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Full-bleed sections */
        .full-bleed {
          width: 100vw;
          position: relative;
          left: 50%;
          right: 50%;
          margin-left: -50vw;
          margin-right: -50vw;
        }

        /* HERO */
        .hero {
          background-image: url('https://res.cloudinary.com/dzrfxgqb6/image/upload/v1761288787/99-films-yr9l_xQPDL0-unsplash_lmk6zr.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          min-height: 320px;
          display: flex;
          justify-content: center;   
          align-items: center;       
          color: #fff;
          text-align: center;
          position: relative;
          z-index: 1;
        }
        
        .hero::after {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.4);
          z-index: -1;
        }
        
        .hero-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 3.25rem 1rem;
        }

        .hero-mark { color: #D4AF37; font-size: 3.25rem; opacity: 0.95; }
        .hero h1 { font-size: clamp(1.75rem, 4.5vw, 2.75rem); margin: 0; font-weight: 700; color: #fff }
        .breadcrumb { color: #fff; font-size: 0.95rem; }

        /* Empty Cart */
        .empty-cart {
          text-align: center;
          padding: 5rem 1rem;
        }

        .empty-cart h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #111827;
        }

        .empty-cart p {
          color: var(--muted);
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .shop-btn {
          padding: 1rem 2rem;
          background: var(--gold);
          color: white;
          border: none;
          border-radius: 8px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
        }

        .shop-btn:hover {
          background: #b8941f;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(212, 175, 55, 0.3);
        }

        /* CART CONTENT */
        .cart-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 4rem;
          padding: 5rem 0;
        }

        /* Cart Table */
        .cart-table {
          background: var(--light-cream);
          border-radius: 12px;
          overflow: hidden;
        }

        .cart-header {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 60px;
          gap: 1rem;
          padding: 1.5rem 2rem;
          background: var(--light-cream);
          font-weight: 600;
          font-size: 1rem;
          color: #111827;
        }

        .header-cell {
          display: flex;
          align-items: center;
        }

        .cart-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 60px;
          gap: 1rem;
          padding: 2rem;
          border-bottom: none;
          align-items: center;
          background: #fff;
          transition: all 0.3s;
        }

        .cart-row:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }

        .cart-row:last-child {
          border-bottom: none;
        }

        .product-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .product-image {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .product-details {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .product-name {
          font-weight: 600;
          color: #111827;
          font-size: 1.1rem;
        }

        .product-options {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .option-label {
          font-size: 0.85rem;
          color: var(--muted);
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .color-indicator {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          display: inline-block;
          border: 2px solid #fff;
          box-shadow: 0 0 0 1px #d1d5db;
          margin-left: 0.25rem;
        }

        .price-cell, .subtotal-cell {
          color: #111827;
          font-weight: 600;
          font-size: 1rem;
        }

        .quantity-cell {
          display: flex;
          align-items: center;
        }

        .quantity-controls {
          display: flex;
          align-items: center;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          overflow: hidden;
          background: #fff;
        }

        .quantity-controls button {
          width: 32px;
          height: 32px;
          border: none;
          background: #f9fafb;
          cursor: pointer;
          font-size: 1rem;
          font-weight: 600;
          color: #111827;
          transition: all 0.2s;
        }

        .quantity-controls button:hover:not(:disabled) {
          background: #e5e7eb;
          color: var(--gold);
        }

        .quantity-controls button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .quantity-controls span {
          padding: 0 1rem;
          font-weight: 600;
          min-width: 40px;
          text-align: center;
        }

        .remove-btn {
          background: none;
          border: none;
          cursor: pointer;
          color: var(--gold);
          padding: 8px;
          border-radius: 4px;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .remove-btn:hover {
          background: #fee;
          color: #dc2626;
        }

        /* Cart Totals */
        .cart-totals {
          background: var(--light-cream);
          padding: 2rem;
          border-radius: 12px;
          height: fit-content;
          position: sticky;
          top: 2rem;
        }

        .cart-totals h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 2rem 0;
          text-align: center;
          color: #111827;
        }

        .totals-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .totals-row:last-of-type {
          border-bottom: none;
          margin-bottom: 2rem;
        }

        .total-row {
          font-weight: 600;
          font-size: 1.1rem;
          padding: 1.5rem 0;
        }

        .amount {
          font-weight: 500;
          color: var(--muted);
        }

        .total-amount {
          color: var(--gold);
          font-weight: 600;
          font-size: 1.25rem;
        }

        .checkout-btn {
          width: 100%;
          padding: 1rem 2rem;
          background: none;
          border: 2px solid #111827;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          color: #111827;
        }

        .checkout-btn:hover {
          background: #111827;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        /* FEATURES */
        .features { 
          background: var(--pink); 
          border-top: 1px solid rgba(0,0,0,0.03); 
          border-bottom: 1px solid rgba(0,0,0,0.03); 
        }

        .features-inner {
          display: flex;
          gap: 2.5rem;
          padding: 5rem 0;
          justify-content: space-between;
          align-items: flex-start;
        }

        .feature { 
          flex: 1; 
          min-width: 180px; 
          text-align: center; 
        }

        .feature h4 { 
          margin: 0 0 0.75rem 0; 
          font-weight: 700; 
          font-size: 1.4rem; 
        }

        .feature p { 
          margin: 0; 
          color: var(--muted); 
          font-size: 1rem; 
        }

        /* Responsive */
        @media (max-width: 968px) {
          .cart-content {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          
          .cart-totals {
            position: static;
          }
          
          .features-inner { 
            flex-direction: column; 
            gap: 1.5rem; 
            text-align: center; 
          }

          .cart-header,
          .cart-row {
            grid-template-columns: 1fr;
            gap: 1rem;
          }

          .product-cell {
            justify-content: flex-start;
          }

          .header-cell {
            display: none;
          }

          .price-cell::before,
          .subtotal-cell::before {
            content: attr(data-label);
            font-weight: 600;
            margin-right: 0.5rem;
            color: var(--muted);
          }

          .quantity-cell {
            justify-content: flex-start;
          }
        }
        
        @media (max-width: 640px) {
          .hero { min-height: 220px; }
          
          .cart-content { 
            padding: 3rem 0; 
          }
          
          .cart-table {
            margin: 0 -1rem;
            border-radius: 0;
          }

          .cart-header,
          .cart-row {
            padding: 1rem;
          }

          .product-image {
            width: 80px;
            height: 80px;
          }

          .product-name {
            font-size: 1rem;
          }
        }
      `}</style>
    </div>
  );
};

export default Cart;