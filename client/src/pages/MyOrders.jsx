import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const MyOrders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  useEffect(() => {
    if (token) fetchOrders();
  }, [token]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error('Failed to fetch orders');

      const data = await res.json();
      setOrders(data.orders || []);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getPaymentStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      completed: '#10b981',
      failed: '#ef4444',
      refunded: '#8b5e3c'
    };
    return colors[status] || '#6b7280';
  };

  const filteredOrders = orders.filter(order => filter === 'all' || order.orderStatus === filter);
  
  
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, endIndex);

  
  useEffect(() => {
    setCurrentPage(1);
  }, [filter]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const formatDate = (date) => new Date(date).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric'
  });

  if (loading) return (
    <div>
      <Navbar />
      <div className="container">
        <p style={{ padding: '4rem 0', textAlign: 'center', fontSize: '1.1rem' }}>Loading your orders...</p>
      </div>
      <Footer />
    </div>
  );

  if (error) return (
    <div>
      <Navbar />
      <div className="container">
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>
          <h2 style={{ color: '#ef4444', marginBottom: '1rem' }}>Error Loading Orders</h2>
          <p style={{ marginBottom: '1.5rem' }}>{error}</p>
          <button onClick={fetchOrders} style={{
            background: '#D4AF37',
            color: '#fff',
            padding: '0.75rem 1.5rem',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '500'
          }}>Retry</button>
        </div>
      </div>
      <Footer />
    </div>
  );

  return (
    <div className="my-orders-page">
      <Navbar />

      {/* Hero Section */}
      <div className="hero full-bleed">
        <div className="hero-inner">
          <div className="hero-mark">M</div>
          <h1>My Orders</h1>
          <div className="breadcrumb">
            <span style={{cursor: 'pointer'}}
                  onMouseOver={(e) => e.target.style.color = '#D4AF37'}
                  onMouseOut={(e) => e.target.style.color = '#fff'}>
              Home
            </span>
            <span style={{margin: '0 8px'}}>›</span>
            <span>My Orders</span>
          </div>
        </div>
      </div>

      <div className="container">
        {/* Filter */}
        <div className="filter-bar">
          {['all','pending','processing','shipped','delivered','cancelled'].map(f => (
            <button
              key={f}
              className={filter === f ? 'active' : ''}
              onClick={() => setFilter(f)}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {filteredOrders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📦</div>
            <h2>No Orders Found</h2>
            <p>You haven't placed any orders yet.</p>
            <a href="/shop" className="shop-btn">Start Shopping</a>
          </div>
        ) : (
          <>
            <div className="orders-list">
              {currentOrders.map(order => (
                <div key={order._id} className="order-card">

                  {/* Header */}
                  <div className="order-header">
                    <div className="order-header-left">
                      <h3>Order #{order.orderNumber}</h3>
                      <p className="order-date">Placed on {formatDate(order.createdAt)}</p>
                    </div>
                    <div className="badges">
                      <span className="badge" style={{ backgroundColor: getStatusColor(order.orderStatus) }}>
                        {order.orderStatus.charAt(0).toUpperCase() + order.orderStatus.slice(1)}
                      </span>
                      <span className="badge" style={{ backgroundColor: getPaymentStatusColor(order.paymentInfo.paymentStatus) }}>
                        Payment: {order.paymentInfo.paymentStatus}
                      </span>
                    </div>
                  </div>

                  {/* Items */}
                  <div className="order-items">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="order-item">
                        <img src={item.image} alt={item.name} className="item-image" />
                        <div className="item-details">
                          <h4>{item.name}</h4>
                          <div className="item-meta">
                            {item.size && <span>Size: {item.size}</span>}
                            {item.color && <span>Color: {item.color}</span>}
                            <span>Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div className="item-price">NPR {item.price.toLocaleString()}</div>
                      </div>
                    ))}
                  </div>

                  {/* Summary */}
                  <div className="order-summary">
                    <div className="summary-row">
                      <span>Subtotal:</span>
                      <span>NPR {order.subtotal.toLocaleString()}</span>
                    </div>
                    <div className="summary-row">
                      <span>Shipping:</span>
                      <span>NPR {order.shippingCost.toLocaleString()}</span>
                    </div>
                    <div className="summary-row total">
                      <span>Total:</span>
                      <span>NPR {order.total.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Shipping */}
                  <div className="shipping-info">
                    <h4>📍 Shipping Address</h4>
                    <p>
                      <strong>{order.shippingAddress.firstName} {order.shippingAddress.lastName}</strong><br/>
                      {order.shippingAddress.streetAddress}<br/>
                      {order.shippingAddress.townCity}, {order.shippingAddress.province} {order.shippingAddress.zipCode}<br/>
                      {order.shippingAddress.country}<br/>
                      📞 {order.shippingAddress.phone}<br/>
                      ✉️ {order.shippingAddress.email}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                {[...Array(totalPages)].map((_, index) => (
                  <button
                    key={index + 1}
                    className={`page ${currentPage === index + 1 ? 'active' : ''}`}
                    onClick={() => handlePageChange(index + 1)}
                  >
                    {index + 1}
                  </button>
                ))}
                
                <button 
                  className="page-btn"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />

      {/* Styles */}
      <style>{`
        :root {
          --max-width: 1200px;
          --muted: #6b7280;
          --pink: #F8EDEE;
          --pag-yellow: #FFF3CC;
          --pag-active: #FDE68A;
          --gold: #D4AF37;
        }

        * { box-sizing: border-box; }
        body, html, .my-orders-page { 
          background: #fff; 
          color: #111827; 
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
          margin: 0;
          padding: 0;
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

        .hero-mark { 
          color: var(--gold); 
          font-size: 3.25rem; 
          opacity: 0.95;
          font-weight: 700;
        }
        
        .hero h1 { 
          font-size: clamp(1.75rem, 4.5vw, 2.75rem); 
          margin: 0; 
          font-weight: 700; 
          color: #fff;
          text-shadow: 0 2px 4px rgba(0,0,0,0.3);
        }
        
        .breadcrumb { 
          color: #fff; 
          font-size: 0.95rem;
          text-shadow: 0 1px 2px rgba(0,0,0,0.3);
        }

        /* Orders Page */
        .filter-bar {
          display: flex;
          gap: 0.75rem;
          margin: 2.5rem 0 2rem 0;
          flex-wrap: wrap;
          justify-content: center;
        }

        .filter-bar button {
          background: var(--pag-yellow);
          border: 2px solid transparent;
          padding: 0.65rem 1.5rem;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 600;
          font-size: 0.95rem;
          transition: all 0.3s ease;
          text-transform: capitalize;
        }

        .filter-bar button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.2);
        }

        .filter-bar button.active {
          background: var(--gold);
          color: #fff;
          border-color: var(--gold);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .orders-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .order-card {
          border: 2px solid #e5e7eb;
          border-radius: 16px;
          padding: 2rem;
          background: #fff;
          box-shadow: 0 4px 16px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
        }

        .order-card:hover {
          box-shadow: 0 8px 24px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }

        .order-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1.5rem;
          padding-bottom: 1.5rem;
          border-bottom: 2px solid #f3f4f6;
        }

        .order-header-left h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 0.5rem 0;
        }

        .order-date {
          color: var(--muted);
          font-size: 0.9rem;
          margin: 0;
        }

        .badges {
          display: flex;
          gap: 0.5rem;
          flex-wrap: wrap;
          justify-content: flex-end;
        }

        .badges .badge {
          padding: 0.4rem 0.9rem;
          border-radius: 8px;
          color: #fff;
          font-size: 0.8rem;
          font-weight: 600;
          text-transform: capitalize;
          white-space: nowrap;
          box-shadow: 0 2px 6px rgba(0,0,0,0.15);
        }

        .order-items {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .order-item {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          padding: 1rem;
          border-radius: 12px;
          background: #f9fafb;
          transition: all 0.2s ease;
        }

        .order-item:hover {
          background: #f3f4f6;
        }

        .order-item img.item-image {
          width: 90px;
          height: 90px;
          object-fit: cover;
          border-radius: 10px;
          border: 2px solid #e5e7eb;
          flex-shrink: 0;
        }

        .item-details {
          flex: 1;
        }

        .item-details h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #111827;
        }

        .item-meta {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
          font-size: 0.9rem;
          color: var(--muted);
        }

        .item-meta span {
          display: inline-block;
        }

        .item-price {
          font-size: 1.2rem;
          font-weight: 700;
          color: var(--gold);
          text-align: right;
          flex-shrink: 0;
        }

        .order-summary {
          background: var(--pink);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 0.5rem 0;
          font-size: 1rem;
          color: #374151;
        }

        .summary-row.total {
          border-top: 2px solid #e5e7eb;
          margin-top: 0.5rem;
          padding-top: 1rem;
          font-size: 1.3rem;
          font-weight: 700;
          color: var(--gold);
        }

        .shipping-info {
          background: #f9fafb;
          border-radius: 12px;
          padding: 1.5rem;
          border: 1px solid #e5e7eb;
        }

        .shipping-info h4 { 
          font-weight: 700;
          font-size: 1.1rem;
          margin: 0 0 1rem 0;
          color: #111827;
        }

        .shipping-info p {
          margin: 0;
          line-height: 1.8;
          color: #374151;
        }

        .shipping-info strong {
          color: #111827;
          font-size: 1.05rem;
        }

        .empty-state {
          text-align: center;
          padding: 5rem 1rem;
        }

        .empty-icon {
          font-size: 5rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        .empty-state h2 {
          font-size: 1.8rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          color: #111827;
        }

        .empty-state p {
          color: var(--muted);
          font-size: 1.1rem;
          margin-bottom: 2rem;
        }

        .shop-btn {
          background: var(--gold);
          color: #fff;
          padding: 1rem 2.5rem;
          border-radius: 10px;
          display: inline-block;
          text-decoration: none;
          font-weight: 600;
          font-size: 1.05rem;
          transition: all 0.3s ease;
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .shop-btn:hover {
          background: #c49d2e;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.4);
        }

        /* PAGINATION */
        .pagination { 
          display: flex; 
          justify-content: center; 
          align-items: center;
          gap: 12px; 
          padding: 2rem 0 3rem;
          flex-wrap: wrap;
        }

        .pagination .page {
          background: var(--pag-yellow);
          border: none;
          padding: 12px 18px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          font-size: 1rem;
          min-width: 45px;
        }

        .pagination .page:hover { 
          transform: translateY(-3px); 
          box-shadow: 0 6px 16px rgba(15,23,42,0.1);
          background: #ffe999;
        }

        .pagination .page.active { 
          background: var(--pag-active);
          box-shadow: 0 4px 12px rgba(253,230,138,0.4);
        }

        .pagination .page-btn {
          background: var(--gold);
          color: #fff;
          border: none;
          padding: 12px 24px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 600;
          font-size: 1rem;
        }

        .pagination .page-btn:hover:not(:disabled) {
          background: #c49d2e;
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(212, 175, 55, 0.3);
        }

        .pagination .page-btn:disabled {
          background: #d1d5db;
          cursor: not-allowed;
          opacity: 0.5;
        }

        @media (max-width: 768px) {
          .order-header {
            flex-direction: column;
            gap: 1rem;
          }

          .badges {
            justify-content: flex-start;
          }

          .order-item {
            flex-direction: column;
            align-items: flex-start;
            text-align: left;
          }

          .order-item img.item-image {
            width: 100%;
            height: 180px;
          }

          .item-price {
            text-align: left;
            font-size: 1.3rem;
          }

          .filter-bar {
            gap: 0.5rem;
            justify-content: flex-start;
          }

          .filter-bar button {
            padding: 0.5rem 1rem;
            font-size: 0.85rem;
          }

          .order-card {
            padding: 1.25rem;
          }

          .pagination {
            gap: 8px;
          }

          .pagination .page {
            padding: 10px 14px;
            font-size: 0.9rem;
            min-width: 40px;
          }

          .pagination .page-btn {
            padding: 10px 18px;
            font-size: 0.9rem;
          }
        }

        @media (max-width: 480px) {
          .hero {
            min-height: 240px;
          }

          .order-header-left h3 {
            font-size: 1.2rem;
          }

          .summary-row.total {
            font-size: 1.15rem;
          }
        }
      `}</style>
    </div>
  );
};

export default MyOrders;