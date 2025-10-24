import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showMoveToast, setShowMoveToast] = useState(false);
  const [showRemoveToast, setShowRemoveToast] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);
  const navigate = useNavigate();

  
  const getToken = () => {
    return localStorage.getItem('token') || sessionStorage.getItem('token');
  };

  
  const isAuthenticated = () => {
    return !!getToken();
  };

  
  const fetchWishlist = async () => {
    if (!isAuthenticated()) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const token = getToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        if (response.status === 401) {
          
          localStorage.removeItem('token');
          sessionStorage.removeItem('token');
          setError('Please login to view your wishlist');
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const wishlistData = await response.json();
      setWishlistItems(wishlistData);
      setError(null);
    } catch (err) {
      console.error('Error fetching wishlist:', err);
      setError(err.message || 'Failed to load wishlist');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWishlist();
  }, []);

  const removeFromWishlist = async (productId) => {
    if (!isAuthenticated()) {
      alert('Please login to manage your wishlist');
      navigate('/login');
      return;
    }

    try {
      setActionLoading(productId);
      const token = getToken();
      const API_BASE_URL = import.meta.env.VITE_API_URL;

      const response = await fetch(`${API_BASE_URL}/wishlist/${productId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to remove from wishlist');
      }

      
      const updatedWishlist = wishlistItems.filter(item => item._id !== productId);
      setWishlistItems(updatedWishlist);
      
      setShowRemoveToast(true);
      setTimeout(() => setShowRemoveToast(false), 3000);
    } catch (err) {
      console.error('Error removing from wishlist:', err);
      alert('Error removing item from wishlist. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const moveToCart = async (product) => {
    if (!isAuthenticated()) {
      alert('Please login to add items to cart');
      navigate('/login');
      return;
    }

    try {
      setActionLoading(product._id);
      
      
      await removeFromWishlist(product._id);
      
      
      const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
      const cartItem = {
        id: product._id,
        name: product.name,
        price: product.price,
        image: getImageUrl(product.imageUrl || product.image),
        size: 'M', 
        color: 'black', 
        quantity: 1
      };

     
      const existingItemIndex = existingCart.findIndex(
        item => item.id === cartItem.id && item.size === cartItem.size && item.color === cartItem.color
      );

      if (existingItemIndex === -1) {
        existingCart.push(cartItem);
        localStorage.setItem('cart', JSON.stringify(existingCart));
        
        
        window.dispatchEvent(new Event('cartUpdated'));
      }

      setShowMoveToast(true);
      setTimeout(() => setShowMoveToast(false), 3000);
    } catch (err) {
      console.error('Error moving to cart:', err);
      alert('Error moving item to cart. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
    window.scrollTo(0, 0);
  };

 
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    
    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    return imagePath.startsWith('/') ? `${BASE_URL}${imagePath}` : `${BASE_URL}/${imagePath}`;
  };

  const subtotal = wishlistItems.reduce((total, item) => total + item.price, 0);

  if (loading) {
    return (
      <div className="wishlist-page">
        <Navbar />
        <div className="container loading">
          <div className="loading-spinner large"></div>
          <p>Loading your wishlist...</p>
        </div>
        <Footer />
      </div>
    );
  }

  if (error && !isAuthenticated()) {
    return (
      <div className="wishlist-page">
        <Navbar />
        <div className="container error">
          <div className="empty-wishlist">
            <div className="empty-icon">🔒</div>
            <h2>Login Required</h2>
            <p>Please login to view your wishlist</p>
            <button 
              className="shop-btn" 
              onClick={() => navigate('/login')}
            >
              Login Now
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="wishlist-page">
        <Navbar />
        <div className="container error">
          <div className="empty-wishlist">
            <div className="empty-icon">⚠️</div>
            <h2>Error Loading Wishlist</h2>
            <p>{error}</p>
            <button 
              className="shop-btn" 
              onClick={fetchWishlist}
            >
              Try Again
            </button>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="wishlist-page">
      <Navbar />
      
      {/* Success Toast Messages */}
      {showMoveToast && (
        <div className="toast toast-success">
          <div className="toast-icon">✓</div>
          <span>Product moved to cart successfully!</span>
        </div>
      )}
      
      {showRemoveToast && (
        <div className="toast toast-info">
          <div className="toast-icon">ℹ</div>
          <span>Product removed from wishlist</span>
        </div>
      )}

      {/* Hero Section */}
      <div className="hero full-bleed">
        <div className="hero-inner">
          <div className="hero-mark">M</div>
          <h1>Wishlist</h1>
          <div className="breadcrumb">
            <span 
              style={{cursor: 'pointer'}} 
              onMouseOver={(e) => e.target.style.color = '#D4AF37'}
              onMouseOut={(e) => e.target.style.color = '#fff'}
              onClick={() => navigate('/')}
            >
              Home
            </span>
            <span style={{margin: '0 8px'}}>›</span>
            <span>Wishlist</span>
          </div>
        </div>
      </div>

      {/* Wishlist Content */}
      <div className="container">
        {wishlistItems.length === 0 ? (
          <div className="empty-wishlist">
            <div className="empty-icon">♥</div>
            <h2>Your wishlist is empty</h2>
            <p>Save your favorite items here for later!</p>
            <button 
              className="shop-btn" 
              onClick={() => navigate('/shop')}
            >
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="wishlist-content">
            {/* Wishlist Header */}
            <div className="wishlist-header">
              <h2>My Wishlist ({wishlistItems.length} items)</h2>
              <div className="wishlist-summary">
                <span>Total Value: <strong>Rs. {subtotal.toLocaleString()}</strong></span>
              </div>
            </div>

            {/* Wishlist Items Grid */}
            <div className="wishlist-grid">
              {wishlistItems.map((item) => (
                <div key={item._id} className="wishlist-card">
                  <div 
                    className="product-image-container"
                    onClick={() => handleProductClick(item._id)}
                  >
                    <img 
                      src={getImageUrl(item.imageUrl || item.image)} 
                      alt={item.name} 
                      className="product-image"
                    />
                    <div className="product-overlay">
                      <button className="quick-view-btn">Quick View</button>
                    </div>
                    <button 
                      className={`remove-wishlist-btn ${actionLoading === item._id ? 'loading' : ''}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist(item._id);
                      }}
                      disabled={actionLoading === item._id}
                      title="Remove from wishlist"
                    >
                      {actionLoading === item._id ? (
                        <div className="loading-spinner"></div>
                      ) : (
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
                        </svg>
                      )}
                    </button>
                  </div>
                  
                  <div className="product-info">
                    <h3 
                      className="product-name"
                      onClick={() => handleProductClick(item._id)}
                    >
                      {item.name}
                    </h3>
                    <div className="product-category">{item.category || 'Furniture'}</div>
                    <div className="product-price">Rs. {item.price.toLocaleString()}</div>
                    
                    <div className="product-description">
                      {item.description ? 
                        (item.description.length > 100 
                          ? `${item.description.substring(0, 100)}...` 
                          : item.description)
                        : 'No description available'
                      }
                    </div>
                    
                    <div className="product-actions">
                      <button 
                        className={`move-to-cart-btn ${actionLoading === item._id ? 'loading' : ''}`}
                        onClick={() => moveToCart(item)}
                        disabled={actionLoading === item._id}
                      >
                        {actionLoading === item._id ? (
                          <>
                            <div className="loading-spinner"></div>
                            Moving...
                          </>
                        ) : (
                          'Move to Cart'
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Wishlist Actions */}
            <div className="wishlist-actions">
              <button 
                className="continue-shopping-btn"
                onClick={() => navigate('/shop')}
              >
                Continue Shopping
              </button>
              <button 
                className="view-cart-btn"
                onClick={() => navigate('/cart')}
              >
                View Cart ({JSON.parse(localStorage.getItem('cart') || '[]').length})
              </button>
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
              <p>For all orders over $50, consectetur adipim scing elit.</p>
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
          --success: #10b981;
          --info: #3b82f6;
          --transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        * { box-sizing: border-box; }
        body, html, .wishlist-page { 
          background: #fff; 
          color: #111827; 
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; 
        }

        .container {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Loading and Error states */
        .loading, .error {
          text-align: center;
          padding: 4rem 1rem;
          font-size: 1.1rem;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1rem;
        }

        .error {
          color: #dc2626;
        }

        /* Toast Messages */
        .toast {
          position: fixed;
          top: 100px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          font-weight: 500;
          z-index: 9999;
          animation: toastSlideIn 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
          color: white;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .toast-icon {
          font-size: 1.2rem;
          font-weight: bold;
        }

        @keyframes toastSlideIn {
          0% {
            transform: translateX(400px) scale(0.8);
            opacity: 0;
          }
          70% {
            transform: translateX(-10px) scale(1.02);
          }
          100% {
            transform: translateX(0) scale(1);
            opacity: 1;
          }
        }

        .toast-success {
          background: linear-gradient(135deg, var(--success), #059669);
        }

        .toast-info {
          background: linear-gradient(135deg, var(--info), #2563eb);
        }

        /* Loading Spinner */
        .loading-spinner {
          width: 20px;
          height: 20px;
          border: 2px solid transparent;
          border-top: 2px solid currentColor;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        .loading-spinner.large {
          width: 40px;
          height: 40px;
          border-width: 3px;
        }

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .remove-wishlist-btn.loading,
        .move-to-cart-btn.loading {
          opacity: 0.7;
          cursor: not-allowed;
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
          animation: heroFadeIn 1.2s ease-out;
        }
        
        @keyframes heroFadeIn {
          0% {
            opacity: 0;
            transform: translateY(30px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
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
          animation: heroContentSlide 1s ease-out 0.3s both;
        }

        @keyframes heroContentSlide {
          0% {
            opacity: 0;
            transform: translateY(40px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-mark { 
          color: #D4AF37; 
          font-size: 3.25rem; 
          opacity: 0.95; 
          animation: heroMarkPulse 2s ease-in-out infinite alternate;
        }

        @keyframes heroMarkPulse {
          0% { transform: scale(1); }
          100% { transform: scale(1.1); }
        }

        .hero h1 { 
          font-size: clamp(1.75rem, 4.5vw, 2.75rem); 
          margin: 0; 
          font-weight: 700; 
          color: #fff;
          animation: textGlow 3s ease-in-out infinite alternate;
        }

        @keyframes textGlow {
          0% { text-shadow: 0 0 20px rgba(212, 175, 55, 0.3); }
          100% { text-shadow: 0 0 30px rgba(212, 175, 55, 0.6); }
        }

        .breadcrumb { 
          color: #fff; 
          font-size: 0.95rem; 
          cursor: default; 
        }

        /* Empty Wishlist */
        .empty-wishlist {
          text-align: center;
          padding: 5rem 1rem;
          animation: fadeInUp 0.8s ease-out;
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(50px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .empty-icon {
          font-size: 4rem;
          color: #e5e7eb;
          margin-bottom: 1.5rem;
          animation: heartBeat 2s ease-in-out infinite;
        }

        @keyframes heartBeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.1); }
        }

        .empty-wishlist h2 {
          font-size: 2rem;
          margin-bottom: 1rem;
          color: #111827;
        }

        .empty-wishlist p {
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
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .shop-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .shop-btn:hover {
          background: #b8941f;
          transform: translateY(-3px);
          box-shadow: 0 12px 25px rgba(212, 175, 55, 0.4);
        }

        .shop-btn:hover::before {
          left: 100%;
        }

        /* Wishlist Content */
        .wishlist-content {
          padding: 3rem 0 5rem;
          animation: fadeInUp 0.8s ease-out 0.2s both;
        }

        .wishlist-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 3rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid var(--light-cream);
          animation: slideInLeft 0.8s ease-out;
        }

        @keyframes slideInLeft {
          0% {
            opacity: 0;
            transform: translateX(-50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .wishlist-header h2 {
          font-size: 2rem;
          font-weight: 600;
          color: #111827;
          margin: 0;
        }

        .wishlist-summary {
          font-size: 1.1rem;
          color: var(--muted);
          animation: slideInRight 0.8s ease-out;
        }

        @keyframes slideInRight {
          0% {
            opacity: 0;
            transform: translateX(50px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .wishlist-summary strong {
          color: var(--gold);
          font-size: 1.2rem;
        }

        /* Wishlist Grid */
        .wishlist-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .wishlist-card {
          background: #fff;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          transition: var(--transition);
          position: relative;
          animation: cardAppear 0.6s ease-out;
          animation-fill-mode: both;
        }

        @keyframes cardAppear {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .wishlist-card:nth-child(1) { animation-delay: 0.1s; }
        .wishlist-card:nth-child(2) { animation-delay: 0.2s; }
        .wishlist-card:nth-child(3) { animation-delay: 0.3s; }
        .wishlist-card:nth-child(4) { animation-delay: 0.4s; }
        .wishlist-card:nth-child(5) { animation-delay: 0.5s; }
        .wishlist-card:nth-child(6) { animation-delay: 0.6s; }

        .wishlist-card:hover {
          transform: translateY(-12px) scale(1.02);
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }

        .product-image-container {
          position: relative;
          overflow: hidden;
          cursor: pointer;
        }

        .product-image {
          width: 100%;
          height: 250px;
          object-fit: cover;
          transition: var(--transition);
        }

        .wishlist-card:hover .product-image {
          transform: scale(1.1);
        }

        .product-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: linear-gradient(135deg, rgba(212, 175, 55, 0.9), rgba(184, 148, 31, 0.8));
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition);
        }

        .wishlist-card:hover .product-overlay {
          opacity: 1;
        }

        .quick-view-btn {
          padding: 0.75rem 1.5rem;
          background: white;
          color: var(--gold);
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          transform: translateY(20px);
        }

        .wishlist-card:hover .quick-view-btn {
          transform: translateY(0);
        }

        .quick-view-btn:hover {
          background: #111827;
          color: white;
          transform: translateY(-2px);
        }

        .remove-wishlist-btn {
          position: absolute;
          top: 12px;
          right: 12px;
          width: 40px;
          height: 40px;
          background: rgba(255, 255, 255, 0.95);
          border: none;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #ef4444;
          transition: var(--transition);
          opacity: 0;
          transform: scale(0.8);
          backdrop-filter: blur(10px);
        }

        .wishlist-card:hover .remove-wishlist-btn {
          opacity: 1;
          transform: scale(1);
        }

        .remove-wishlist-btn:hover:not(.loading) {
          background: #ef4444;
          color: white;
          transform: scale(1.1) rotate(90deg);
        }

        /* Product Info */
        .product-info {
          padding: 1.5rem;
        }

        .product-name {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #111827;
          cursor: pointer;
          transition: var(--transition);
          line-height: 1.4;
        }

        .product-name:hover {
          color: var(--gold);
          transform: translateX(5px);
        }

        .product-category {
          font-size: 0.85rem;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .product-price {
          font-size: 1.25rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 1rem;
        }

        .product-description {
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.4;
          margin-bottom: 1.5rem;
        }

        /* Product Actions */
        .product-actions {
          display: flex;
          gap: 0.75rem;
        }

        .move-to-cart-btn {
          flex: 1;
          padding: 1rem 1.5rem;
          background: linear-gradient(135deg, var(--gold), #b8941f);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          position: relative;
          overflow: hidden;
        }

        .move-to-cart-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .move-to-cart-btn:hover:not(.loading) {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4);
        }

        .move-to-cart-btn:hover:not(.loading)::before {
          left: 100%;
        }

        .move-to-cart-btn:active {
          transform: translateY(-1px);
        }

        /* Wishlist Actions */
        .wishlist-actions {
          display: flex;
          justify-content: center;
          gap: 1.5rem;
          padding-top: 3rem;
          border-top: 1px solid #e5e7eb;
          animation: fadeInUp 0.8s ease-out 0.4s both;
        }

        .continue-shopping-btn {
          padding: 1rem 2rem;
          background: transparent;
          border: 2px solid #111827;
          border-radius: 10px;
          color: #111827;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .continue-shopping-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(17, 24, 39, 0.1), transparent);
          transition: left 0.5s;
        }

        .continue-shopping-btn:hover {
          background: #111827;
          color: white;
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(17, 24, 39, 0.2);
        }

        .continue-shopping-btn:hover::before {
          left: 100%;
        }

        .view-cart-btn {
          padding: 1rem 2rem;
          background: linear-gradient(135deg, var(--gold), #b8941f);
          border: none;
          border-radius: 10px;
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition);
          position: relative;
          overflow: hidden;
        }

        .view-cart-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
          transition: left 0.5s;
        }

        .view-cart-btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(212, 175, 55, 0.4);
        }

        .view-cart-btn:hover::before {
          left: 100%;
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
          animation: fadeInUp 0.8s ease-out 0.6s both;
        }

        .feature { 
          flex: 1; 
          min-width: 180px; 
          text-align: center; 
          transition: var(--transition);
        }

        .feature:hover {
          transform: translateY(-5px);
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
          .wishlist-header {
            flex-direction: column;
            gap: 1rem;
            text-align: center;
          }

          .wishlist-grid {
            grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          }

          .wishlist-actions {
            flex-direction: column;
            align-items: center;
          }

          .continue-shopping-btn,
          .view-cart-btn {
            width: 200px;
          }

          .toast {
            left: 20px;
            right: 20px;
            width: auto;
          }
        }

        @media (max-width: 640px) {
          .hero { min-height: 220px; }
          
          .wishlist-content { 
            padding: 2rem 0 3rem; 
          }
          
          .wishlist-grid {
            grid-template-columns: 1fr;
          }

          .features-inner { 
            flex-direction: column; 
            gap: 1.5rem; 
            text-align: center; 
          }
        }
      `}</style>
    </div>
  );
};

export default Wishlist;