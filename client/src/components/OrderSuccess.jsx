import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const OrderSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    
    const { orderId, orderDbId, amount, items, paymentMethod } = location.state || {};
    
    if (!orderId) {
      navigate('/shop');
      return;
    }

    setOrderDetails({
      orderId,
      orderDbId,
      amount,
      items: items || [],
      paymentMethod: paymentMethod || 'Card Payment',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      })
    });

    setLoading(false);

    const timer = setTimeout(() => {
      document.querySelector('.success-checkmark')?.classList.add('animate');
    }, 100);

    return () => clearTimeout(timer);
  }, [location, navigate]);

  
  const getPaymentStatusInfo = () => {
    if (!orderDetails) return { status: '', badgeClass: '', dotColor: '' };
    
    const paymentMethod = orderDetails.paymentMethod?.toLowerCase();
    
    if (paymentMethod.includes('card') || paymentMethod.includes('stripe')) {
      return {
        status: 'Paid',
        badgeClass: 'status-paid',
        dotColor: '#10b981',
        message: 'Your payment has been successfully processed.'
      };
    } else if (paymentMethod.includes('bank')) {
      return {
        status: 'Pending',
        badgeClass: 'status-pending', 
        dotColor: '#f59e0b',
        message: 'Awaiting bank transfer. We will process your order once payment is confirmed.'
      };
    } else if (paymentMethod.includes('cod') || paymentMethod.includes('cash')) {
      return {
        status: 'Pending',
        badgeClass: 'status-pending',
        dotColor: '#f59e0b',
        message: 'Pay with cash when your order is delivered.'
      };
    } else {
      return {
        status: 'Pending',
        badgeClass: 'status-pending',
        dotColor: '#f59e0b',
        message: 'Payment status pending.'
      };
    }
  };

  if (loading || !orderDetails) {
    return null;
  }

  const paymentStatusInfo = getPaymentStatusInfo();

  return (
    <div className="order-success-page">
      <Navbar />

      {/* Hero Section */}
      <div className="hero full-bleed">
        <div className="hero-inner">
          <div className="hero-mark">M</div>
          <h1>Order Confirmed</h1>
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
            <span>Order Success</span>
          </div>
        </div>
      </div>

      {/* Success Content */}
      <div className="container">
        <div className="success-content">
          {/* Success Message */}
          <div className="success-card">
            <div className="success-checkmark">
              <svg viewBox="0 0 52 52">
                <circle cx="26" cy="26" r="25" fill="none"/>
                <path fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8"/>
              </svg>
            </div>
            
            <h2>Thank You for Your Order!</h2>
            <p className="success-message">
              {paymentStatusInfo.message}
            </p>

            {/* Order Details Card */}
            <div className="order-info-card">
              <div className="order-info-row">
                <span className="label">Order Number</span>
                <span className="value order-number">{orderDetails.orderId}</span>
              </div>
              <div className="order-info-row">
                <span className="label">Order Date</span>
                <span className="value">{orderDetails.date}</span>
              </div>
              <div className="order-info-row">
                <span className="label">Total Amount</span>
                <span className="value total-amount">Rs. {orderDetails.amount.toLocaleString()}</span>
              </div>
              <div className="order-info-row">
                <span className="label">Payment Method</span>
                <span className="value">{orderDetails.paymentMethod}</span>
              </div>
              <div className="order-info-row">
                <span className="label">Payment Status</span>
                <span className={`value status-badge ${paymentStatusInfo.badgeClass}`}>
                  <span 
                    className="status-dot" 
                    style={{ backgroundColor: paymentStatusInfo.dotColor }}
                  ></span>
                  {paymentStatusInfo.status}
                </span>
              </div>
            </div>

            {/* Additional instructions for pending payments */}
            {paymentStatusInfo.status === 'Pending' && (
              <div className="payment-instructions">
                <h4>Next Steps:</h4>
                {orderDetails.paymentMethod.includes('Bank') && (
                  <div className="instructions-content bank-transfer-instructions">
                    <div className="bank-details-card">
                      <div className="bank-header">
                        <div className="bank-icon">🏦</div>
                        <div className="bank-info">
                          <h5>Bank Transfer Instructions</h5>
                          <p>Complete your payment to process your order</p>
                        </div>
                      </div>
                      
                      <div className="payment-methods-grid">
                        <div className="qr-section">
                          <div className="qr-code-placeholder">
                            <img 
                              src="https://res.cloudinary.com/dzrfxgqb6/image/upload/v1759913802/qrcode_vz4ewr.png"
                              alt="Bank Payment QR Code"
                              className="qr-code-image"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.nextSibling.style.display = 'block';
                              }}
                            />
                            <div className="qr-code-fallback">
                              <div className="qr-inner">
                                <div className="qr-pattern">
                                  {Array.from({ length: 25 }).map((_, i) => (
                                    <div 
                                      key={i} 
                                      className="qr-cell" 
                                      style={{ 
                                        opacity: Math.random() > 0.4 ? 1 : 0,
                                        animationDelay: `${i * 0.05}s`
                                      }}
                                    ></div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                          <p className="qr-note">Scan QR code with your banking app</p>
                        </div>
            
                        <div className="bank-details-section">
                          <div className="detail-item">
                            <span className="detail-label">Bank Name</span>
                            <span className="detail-value">Nepal Investment Mega Bank</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Account Name</span>
                            <span className="detail-value">Meubel House</span>
                          </div>
                          <div className="detail-item">
                            <span className="detail-label">Account Number</span>
                            <span className="detail-value">1234567890123456</span>
                          </div>
                          <div className="detail-item highlight">
                            <span className="detail-label">Reference Number</span>
                            <span className="detail-value ref-number">{orderDetails.orderId}</span>
                          </div>
                          <div className="detail-item total-amount">
                            <span className="detail-label">Amount to Transfer</span>
                            <span className="detail-value amount">Rs. {orderDetails.amount.toLocaleString()}</span>
                          </div>
                        </div>
                      </div>
            
                      <div className="important-notes">
                        <div className="note-item">
                          <span className="note-icon">💡</span>
                          <span>Use exact amount and reference number</span>
                        </div>
                        <div className="note-item">
                          <span className="note-icon">⏱️</span>
                          <span>Order will process after payment confirmation (2-4 hours)</span>
                        </div>
                        <div className="note-item">
                          <span className="note-icon">📧</span>
                          <span>Email payment receipt to payments@meubelhouse.com</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {(orderDetails.paymentMethod.includes('COD') || orderDetails.paymentMethod.includes('Cash')) && (
                  <div className="instructions-content cod-instructions">
                    <div className="cod-card">
                      <div className="cod-header">
                        <div className="cod-icon">💰</div>
                        <div className="cod-info">
                          <h5>Cash on Delivery</h5>
                          <p>Keep your cash ready! Our delivery partner will contact you within 24 hours to schedule delivery and collect payment.</p>
                        </div>
                      </div>
                      
                      <div className="cod-details">
                        <div className="amount-display">
                          <span className="amount-label">Prepare Exact Amount</span>
                          <span className="cod-amount">Rs. {orderDetails.amount.toLocaleString()}</span>
                        </div>
                        
                        <div className="cod-features">
                          <div className="feature">
                            <span className="feature-icon">📞</span>
                            <span>We'll call you to confirm delivery time</span>
                          </div>
                          <div className="feature">
                            <span className="feature-icon">💵</span>
                            <span>Have exact cash ready for delivery</span>
                          </div>
                          <div className="feature">
                            <span className="feature-icon">🛵</span>
                            <span>Pay directly to our delivery partner</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Order Items */}
            {orderDetails.items.length > 0 && (
              <div className="order-items-section">
                <h3>Order Items</h3>
                <div className="items-list">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="item-card">
                      <div className="item-image">
                        <img src={item.image} alt={item.name} />
                      </div>
                      <div className="item-details">
                        <h4>{item.name}</h4>
                        <p className="item-meta">
                          Size: {item.size} • Color: {item.color} • Qty: {item.quantity}
                        </p>
                        <p className="item-price">Rs. {(item.price * item.quantity).toLocaleString()}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="action-buttons">
              {orderDetails.orderDbId && (
                <button 
                  className="btn btn-secondary"
                  onClick={() => navigate('/my-orders')}
                >
                  View Order Details
                </button>
              )}
              <button 
                className="btn btn-primary"
                onClick={() => navigate('/shop')}
              >
                Continue Shopping
              </button>
            </div>
          </div>

          {/* What's Next Section */}
          <div className="whats-next-section">
            <h3>What Happens Next?</h3>
            <div className="timeline">
              <div className="timeline-item">
                <div className="timeline-icon">1</div>
                <div className="timeline-content">
                  <h4>Order Confirmation</h4>
                  <p>You'll receive an email confirmation with your order details.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon">2</div>
                <div className="timeline-content">
                  <h4>Processing</h4>
                  <p>We'll prepare your items for shipping within 1-2 business days.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon">3</div>
                <div className="timeline-content">
                  <h4>Shipping</h4>
                  <p>Your order will be shipped and you'll receive tracking information.</p>
                </div>
              </div>
              <div className="timeline-item">
                <div className="timeline-icon">4</div>
                <div className="timeline-content">
                  <h4>Delivery</h4>
                  <p>Your order will arrive at your doorstep within 3-7 business days.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features full-bleed">
        <div className="container">
          <div className="features-inner">
            <div className="f">
              <h4>Free Delivery</h4>
              <p>For all orders over Rs. 50,000, consectetur adipim scing elit.</p>
            </div>
            <div className="f">
              <h4>90 Days Return</h4>
              <p>If goods have problems, consectetur adipim scing elit.</p>
            </div>
            <div className="f">
              <h4>Secure Payment</h4>
              <p>100% secure payment, consectetur adipim scing elit.</p>
            </div>
          </div>
        </div>
      </div>

      <Footer />

      <style>{`
        :root {
          --max-width: 1200px;
          --muted: #6b7280;
          --pink: #F8EDEE;
          --gold: #D4AF37;
          --light-gray: #f9fafb;
          --success-green: #10b981;
        }

        * { box-sizing: border-box; }
        body, html, .order-success-page { 
          background: #fff; 
          color: #111827; 
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; 
        }

        .container {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 1rem;
        }

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
          background-image: url('https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=400&fit=crop');
          background-size: cover;
          background-position: center;
          min-height: 320px;
          display: flex;
          justify-content: center;   
          align-items: center;       
          color: #fff;
          text-align: center;
          position: relative;
        }
        
        .hero::after {
          content: "";
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          background: rgba(0,0,0,0.4);
          z-index: 0;
        }
        
        .hero-inner {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 3.25rem 1rem;
          position: relative;
          z-index: 1;
        }

        .hero-mark { color: #D4AF37; font-size: 3.25rem; opacity: 0.95; }
        .hero h1 { font-size: clamp(1.75rem, 4.5vw, 2.75rem); margin: 0; font-weight: 700; }
        .breadcrumb { font-size: 0.95rem; }

        /* SUCCESS CONTENT */
        .success-content {
          max-width: 900px;
          margin: 0 auto;
          padding: 5rem 0;
        }

        .success-card {
          background: #fff;
          border-radius: 16px;
          padding: 3rem 2rem;
          text-align: center;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06);
          margin-bottom: 3rem;
        }

        /* SUCCESS CHECKMARK */
        .success-checkmark {
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
        }

        .success-checkmark svg {
          width: 80px;
          height: 80px;
        }

        .success-checkmark circle {
          stroke: var(--success-green);
          stroke-width: 2;
          stroke-dasharray: 166;
          stroke-dashoffset: 166;
        }

        .success-checkmark path {
          stroke: var(--success-green);
          stroke-width: 2;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 48;
          stroke-dashoffset: 48;
        }

        .success-checkmark.animate circle {
          animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
        }

        .success-checkmark.animate path {
          animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.4s forwards;
        }

        @keyframes stroke {
          100% {
            stroke-dashoffset: 0;
          }
        }

        .success-card h2 {
          font-size: 2rem;
          font-weight: 700;
          margin: 0 0 1rem 0;
          color: #111827;
        }

        .success-message {
          font-size: 1.1rem;
          color: var(--muted);
          line-height: 1.6;
          margin: 0 0 2.5rem 0;
        }

        /* ORDER INFO CARD */
        .order-info-card {
          background: var(--light-gray);
          border-radius: 12px;
          padding: 2rem;
          margin-bottom: 2.5rem;
          text-align: left;
        }

        .order-info-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem 0;
          border-bottom: 1px solid #e5e7eb;
        }

        .order-info-row:last-child {
          border-bottom: none;
        }

        .order-info-row .label {
          font-weight: 500;
          color: var(--muted);
        }

        .order-info-row .value {
          font-weight: 600;
          color: #111827;
        }

        .order-number {
          font-family: 'Courier New', monospace;
          font-size: 1.1rem;
          color: var(--gold);
        }

        .total-amount {
          font-size: 1.25rem;
          color: var(--gold);
        }

        .status-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .status-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        /* Payment Status Badges */
        .status-paid {
          color: #10b981 !important;
        }

        .status-paid .status-dot {
          background: #10b981;
        }

        .status-pending {
          color: #f59e0b !important;
        }

        .status-pending .status-dot {
          background: #f59e0b;
        }

        /* ORDER ITEMS */
        .order-items-section {
          margin-bottom: 2.5rem;
          text-align: left;
        }

        .order-items-section h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #111827;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .item-card {
          display: flex;
          gap: 1rem;
          padding: 1rem;
          background: var(--light-gray);
          border-radius: 10px;
          transition: transform 0.2s;
        }

        .item-card:hover {
          transform: translateX(4px);
        }

        .item-image {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          flex-shrink: 0;
        }

        .item-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .item-details {
          flex: 1;
        }

        .item-details h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 0 0 0.25rem 0;
          color: #111827;
        }

        .item-meta {
          font-size: 0.875rem;
          color: var(--muted);
          margin: 0 0 0.5rem 0;
        }

        .item-price {
          font-size: 1rem;
          font-weight: 600;
          color: var(--gold);
          margin: 0;
        }

        /* ACTION BUTTONS */
        .action-buttons {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn {
          padding: 1rem 2rem;
          border-radius: 10px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          border: none;
          min-width: 200px;
        }

        .btn-primary {
          background: #111827;
          color: #fff;
        }

        .btn-primary:hover {
          background: #000;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.15);
        }

        .btn-secondary {
          background: none;
          border: 2px solid #111827;
          color: #111827;
        }

        .btn-secondary:hover {
          background: #111827;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        /* WHAT'S NEXT SECTION */
        .whats-next-section {
          background: #fff;
          border-radius: 16px;
          padding: 3rem 2rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
        }

        .whats-next-section h3 {
          font-size: 1.75rem;
          font-weight: 700;
          margin: 0 0 2rem 0;
          text-align: center;
          color: #111827;
        }

        .timeline {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          max-width: 600px;
          margin: 0 auto;
        }

        .timeline-item {
          display: flex;
          gap: 1.5rem;
          position: relative;
        }

        .timeline-item:not(:last-child)::before {
          content: "";
          position: absolute;
          left: 24px;
          top: 48px;
          width: 2px;
          height: calc(100% + 2rem);
          background: linear-gradient(to bottom, var(--gold), transparent);
        }

        .timeline-icon {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), #e4c87e);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.25rem;
          flex-shrink: 0;
          box-shadow: 0 4px 10px rgba(212, 175, 55, 0.3);
        }

        .timeline-content h4 {
          font-size: 1.1rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #111827;
        }

        .timeline-content p {
          font-size: 0.95rem;
          color: var(--muted);
          margin: 0;
          line-height: 1.5;
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
        .features .f { 
          flex: 1; 
          min-width: 180px; 
          text-align: center; 
        }
        .features h4 { 
          margin: 0 0 0.75rem 0; 
          font-weight: 700; 
          font-size: 1.4rem; 
        }
        .features p { 
          margin: 0; 
          color: var(--muted); 
          font-size: 1rem; 
        }

        /* Payment Instructions Styles */
        .payment-instructions {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          border-radius: 16px;
          padding: 2rem;
          margin: 1.5rem 0;
          border: 1px solid #e2e8f0;
          border-left: 4px solid #f59e0b;
        }

        .payment-instructions h4 {
          margin: 0 0 1.5rem 0;
          color: #1e293b;
          font-size: 1.25rem;
          font-weight: 600;
        }

        /* Bank Transfer Styles */
        .bank-transfer-instructions .bank-details-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }

        .bank-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          padding-bottom: 1rem;
          border-bottom: 2px solid #f1f5f9;
        }

        .bank-icon {
          font-size: 2rem;
          background: linear-gradient(135deg, #3b82f6, #1d4ed8);
          border-radius: 12px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .bank-info h5 {
          margin: 0 0 0.25rem 0;
          color: #1e293b;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .bank-info p {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
        }

        .payment-methods-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin-bottom: 1.5rem;
        }

        .qr-section {
          text-align: center;
        }

        /* Cloudinary QR Code Styles */
        .qr-code-placeholder {
          position: relative;
          background: white;
          border: 2px dashed #cbd5e1;
          border-radius: 12px;
          padding: 1.5rem;
          margin-bottom: 1rem;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 250px;
        }

        .qr-code-image {
          width: 200px;
          height: 200px;
          border-radius: 8px;
          object-fit: cover;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .qr-code-fallback {
          display: none;
          width: 200px;
          height: 200px;
          background: #f8fafc;
          border-radius: 8px;
          position: relative;
          overflow: hidden;
        }

        .qr-code-image:not([src]) + .qr-code-fallback,
        .qr-code-image[src=""] + .qr-code-fallback {
          display: block;
        }

        .qr-inner {
          width: 100%;
          height: 100%;
          padding: 10px;
        }

        .qr-pattern {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          grid-template-rows: repeat(5, 1fr);
          gap: 3px;
          width: 100%;
          height: 100%;
        }

        .qr-cell {
          background: #1e293b;
          border-radius: 2px;
          animation: qrAppear 0.5s ease-out forwards;
          opacity: 0;
        }

        @keyframes qrAppear {
          to {
            opacity: 1;
          }
        }

        .qr-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          text-align: center;
          pointer-events: none;
        }

        .scan-text {
          font-size: 0.8rem;
          color: #64748b;
          font-weight: 600;
          margin-bottom: 0.5rem;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
        }

        .bank-logo {
          font-size: 1.2rem;
          font-weight: 700;
          color: #3b82f6;
          background: white;
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          border: 2px solid #3b82f6;
          box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
        }

        .qr-note {
          font-size: 0.85rem;
          color: #64748b;
          margin: 0;
        }

        .bank-details-section {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .detail-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.75rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .detail-item.highlight {
          background: #fff7ed;
          border-color: #fdba74;
        }

        .detail-item.total-amount {
          background: linear-gradient(135deg, #fffbeb, #fed7aa);
          border-color: #f59e0b;
        }

        .detail-label {
          font-weight: 500;
          color: #475569;
          font-size: 0.9rem;
          min-width: 120px;
        }

        .detail-value {
          font-weight: 600;
          color: #1e293b;
          text-align: right;
          flex: 1;
        }

        .detail-value.ref-number {
          color: #dc2626;
          font-family: 'Courier New', monospace;
        }

        .detail-value.amount {
          color: #dc2626;
          font-size: 1.1rem;
        }

        .important-notes {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          background: #f0f9ff;
          padding: 1.25rem;
          border-radius: 8px;
          border-left: 4px solid #0ea5e9;
        }

        .note-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #0369a1;
          font-size: 0.9rem;
        }

        .note-icon {
          font-size: 1rem;
        }

        /* COD Styles */
        .cod-instructions .cod-card {
          background: white;
          border-radius: 12px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          border: 2px solid #f0f9ff;
        }

        .cod-header {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }

        .cod-icon {
          font-size: 2rem;
          background: linear-gradient(135deg, #10b981, #059669);
          border-radius: 12px;
          width: 60px;
          height: 60px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .cod-info h5 {
          margin: 0 0 0.25rem 0;
          color: #1e293b;
          font-size: 1.1rem;
          font-weight: 600;
        }

        .cod-info p {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
        }

        .cod-details {
          text-align: center;
        }

        .amount-display {
          background: linear-gradient(135deg, #ecfdf5, #d1fae5);
          padding: 1.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          border: 2px solid #a7f3d0;
        }

        .amount-label {
          display: block;
          color: #065f46;
          font-size: 0.9rem;
          margin-bottom: 0.5rem;
          font-weight: 500;
        }

        .cod-amount {
          font-size: 2rem;
          font-weight: 700;
          color: #065f46;
        }

        .cod-features {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 1rem;
        }

        .feature {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
        }

        .feature-icon {
          font-size: 1.5rem;
        }

        .feature span:last-child {
          font-size: 0.85rem;
          color: #475569;
          text-align: center;
          font-weight: 500;
        }

        /* RESPONSIVE */
        @media (max-width: 768px) {
          .success-card {
            padding: 2rem 1.5rem;
          }

          .success-card h2 {
            font-size: 1.5rem;
          }

          .order-info-card {
            padding: 1.5rem;
          }

          .action-buttons {
            flex-direction: column;
          }

          .btn {
            width: 100%;
          }

          .timeline-item {
            gap: 1rem;
          }

          .timeline-icon {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }

          .timeline-item:not(:last-child)::before {
            left: 20px;
          }

          .features-inner { 
            flex-direction: column; 
            gap: 1.5rem; 
            text-align: center; 
          }

          .item-card {
            flex-direction: column;
          }

          .item-image {
            width: 100%;
            height: 200px;
          }

          .payment-methods-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .qr-code-image {
            width: 150px;
            height: 150px;
          }
          
          .qr-code-fallback {
            width: 150px;
            height: 150px;
          }
          
          .detail-item {
            flex-direction: column;
            align-items: flex-start;
            gap: 0.5rem;
          }
          
          .detail-value {
            text-align: left;
          }
          
          .cod-features {
            grid-template-columns: 1fr;
          }
          
          .payment-instructions {
            padding: 1.5rem;
          }
        }

        @media (max-width: 480px) {
          .hero { min-height: 220px; }
          .success-content { padding: 3rem 0; }
          .whats-next-section { padding: 2rem 1rem; }
          
          .bank-header,
          .cod-header {
            flex-direction: column;
            text-align: center;
            gap: 0.75rem;
          }
          
          .bank-icon,
          .cod-icon {
            align-self: center;
          }
        }
      `}</style>
    </div>
  );
};

export default OrderSuccess;