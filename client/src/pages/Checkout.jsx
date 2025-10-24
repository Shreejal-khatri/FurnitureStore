import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext'; 

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);


const CheckoutForm = ({ cartItems, cartTotal, cartSubtotal, shippingCost, formData }) => {
  const { token } = useAuth(); 
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    
    if (!formData.firstName || !formData.lastName || !formData.streetAddress || 
        !formData.townCity || !formData.zipCode || !formData.phone || !formData.email) {
      setError('Please fill in all required fields');
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      
      
      const paymentResponse = await fetch(`${API_BASE_URL}/create-payment-intent`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          amount: Math.round(cartTotal * 100),
          currency: 'npr',
          orderDetails: {
            items: cartItems,
            shippingAddress: formData,
            total: cartTotal
          }
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        throw new Error(errorData.error || 'Failed to create payment intent');
      }

      const { clientSecret } = await paymentResponse.json();

      
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        clientSecret,
        {
          payment_method: {
            card: elements.getElement(CardElement),
            billing_details: {
              name: `${formData.firstName} ${formData.lastName}`,
              email: formData.email,
              phone: formData.phone,
              address: {
                line1: formData.streetAddress,
                city: formData.townCity,
                postal_code: formData.zipCode,
                country: 'NP',
              },
            },
          },
        }
      );

      if (stripeError) {
        setError(stripeError.message);
        setProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        
        const orderResponse = await fetch(`${API_BASE_URL}/create-order`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            items: cartItems,
            shippingAddress: formData,
            paymentIntentId: paymentIntent.id,
            subtotal: cartSubtotal,
            shippingCost,
            total: cartTotal
          }),
        });

        if (!orderResponse.ok) {
          console.error('Failed to create order in database');
        }

        const orderData = await orderResponse.json();
        
        setSuccess(true);
        
    
        localStorage.removeItem('cart');
        window.dispatchEvent(new Event('cartUpdated'));
        
       
        setTimeout(() => {
          navigate('/order-success', { 
            state: { 
              orderId: orderData.order?.orderNumber || paymentIntent.id,
              orderDbId: orderData.order?._id,
              amount: cartTotal,
              items: cartItems,
              paymentMethod: 'Card Payment'
            } 
          });
        }, 2000);
      }
    } catch (err) {
      setError(err.message || 'Payment failed. Please try again.');
      console.error('Payment error:', err);
    } finally {
      setProcessing(false);
    }
  };

  const CARD_ELEMENT_OPTIONS = {
    style: {
      base: {
        fontSize: '16px',
        color: '#111827',
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        '::placeholder': {
          color: '#9ca3af',
        },
      },
      invalid: {
        color: '#ef4444',
      },
    },
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="payment-card-section">
        <div className="card-element-wrapper">
          <CardElement options={CARD_ELEMENT_OPTIONS} />
        </div>
      </div>

      {error && (
        <div className="payment-error">
          {error}
        </div>
      )}

      {success && (
        <div className="payment-success">
          ✓ Payment successful! Redirecting...
        </div>
      )}

      <button 
        type="submit" 
        className="place-order-btn"
        disabled={!stripe || processing || success}
      >
        {processing ? 'Processing...' : success ? 'Payment Successful!' : `Pay Now - Rs. ${cartTotal.toLocaleString()}`}
      </button>
    </form>
  );
};


const Checkout = () => {
  const { token } = useAuth(); 
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    companyName: '',
    country: 'Nepal',
    streetAddress: '',
    townCity: '',
    province: 'Bagmati Province',
    zipCode: '',
    phone: '',
    email: '',
    additionalInfo: ''
  });

  
  useEffect(() => {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
      navigate('/shop');
    }
    setCartItems(cart);
  }, [navigate]);

  
  const cartSubtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingCost = cartSubtotal > 50000 ? 0 : 500;
  const cartTotal = cartSubtotal + shippingCost;

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handlePaymentMethodChange = (method) => {
    setPaymentMethod(method);
  };

  
  const handleNonCardOrder = async () => {
    
    
    if (!formData.firstName || !formData.lastName || !formData.streetAddress || 
        !formData.townCity || !formData.zipCode || !formData.phone || !formData.email) {
      alert('Please fill in all required fields');
      return;
    }

    setProcessing(true);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      
      
      const orderResponse = await fetch(`${API_BASE_URL}/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({
          items: cartItems,
          shippingAddress: formData,
          paymentIntentId: `${paymentMethod.toUpperCase()}-${Date.now()}`,
          subtotal: cartSubtotal,
          shippingCost,
          total: cartTotal
        }),
      });

      if (!orderResponse.ok) {
        throw new Error('Failed to create order');
      }

      const orderData = await orderResponse.json();
      
      
      localStorage.removeItem('cart');
      window.dispatchEvent(new Event('cartUpdated'));
      
      
      navigate('/order-success', { 
        state: { 
          orderId: orderData.order?.orderNumber,
          orderDbId: orderData.order?._id,
          amount: cartTotal,
          items: cartItems,
          paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery' : 'Direct Bank Transfer'
        } 
      });
    } catch (err) {
      alert(err.message || 'Failed to place order. Please try again.');
      console.error('Order error:', err);
    } finally {
      setProcessing(false);
    }
  };

  if (cartItems.length === 0) {
    return null;
  }

  return (
    <div className="checkout-page">
      <Navbar />
      
      {/* Hero Section */}
      <div className="hero full-bleed">
        <div className="hero-inner">
          <div className="hero-mark">M</div>
          <h1>Checkout</h1>
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
            <span>Checkout</span>
          </div>
        </div>
      </div>

      {/* Checkout Content */}
      <div className="container">
        <div className="checkout-content">
          {/* Billing Details */}
          <div className="billing-section">
            <h2>Billing details</h2>
            
            <div className="billing-form">
              <div className="form-row">
                <div className="form-group">
                  <label>First Name *</label>
                  <input 
                    type="text" 
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Last Name *</label>
                  <input 
                    type="text" 
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Company Name (Optional)</label>
                <input 
                  type="text" 
                  name="companyName"
                  value={formData.companyName}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-group">
                <label>Country / Region *</label>
                <select 
                  name="country"
                  value={formData.country}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Nepal">Nepal</option>
                  <option value="India">India</option>
                  <option value="USA">USA</option>
                  <option value="UK">UK</option>
                </select>
              </div>

              <div className="form-group">
                <label>Street address *</label>
                <input 
                  type="text" 
                  name="streetAddress"
                  value={formData.streetAddress}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Town / City *</label>
                <input 
                  type="text" 
                  name="townCity"
                  value={formData.townCity}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Province *</label>
                <select 
                  name="province"
                  value={formData.province}
                  onChange={handleInputChange}
                  required
                >
                  <option value="Bagmati Province">Bagmati Province</option>
                  <option value="Gandaki Province">Gandaki Province</option>
                  <option value="Lumbini Province">Lumbini Province</option>
                  <option value="Karnali Province">Karnali Province</option>
                  <option value="Sudurpashchim Province">Sudurpashchim Province</option>
                  <option value="Province No. 1">Province No. 1</option>
                  <option value="Madhesh Province">Madhesh Province</option>
                </select>
              </div>

              <div className="form-group">
                <label>ZIP code *</label>
                <input 
                  type="text" 
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Phone *</label>
                <input 
                  type="tel" 
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-group">
                <label>Email address *</label>
                <input 
                  type="email" 
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
              </div>

              {/* <div className="form-group">
                <input 
                  type="text" 
                  name="additionalInfo"
                  placeholder="Additional information"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  className="additional-info"
                />
              </div>
            </div>
          </div> */}
          <div className="form-group">
                <label>Additional Information (Optional)</label>
                <textarea
                  name="additionalInfo"
                  placeholder="Notes about your order, e.g. special notes for delivery"
                  value={formData.additionalInfo}
                  onChange={handleInputChange}
                  rows="4"
                />
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="order-section">
            <div className="order-summary">
              <div className="summary-header">
                <span>Product</span>
                <span>Subtotal</span>
              </div>

              {cartItems.map((item, index) => (
                <div key={index} className="summary-item">
                  <span>
                    {item.name} × {item.quantity}
                    <div style={{ fontSize: '0.85rem', color: '#9ca3af', marginTop: '0.25rem' }}>
                      Size: {item.size}, Color: {item.color}
                    </div>
                  </span>
                  <span>Rs. {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}

              <div className="summary-row">
                <span>Subtotal</span>
                <span>Rs. {cartSubtotal.toLocaleString()}</span>
              </div>

              <div className="summary-row">
                <span>Shipping</span>
                <span>{shippingCost === 0 ? 'Free' : `Rs. ${shippingCost}`}</span>
              </div>

              <div className="summary-row total">
                <span>Total</span>
                <span className="total-amount">Rs. {cartTotal.toLocaleString()}</span>
              </div>
            </div>

            {/* Payment Methods */}
            <div className="payment-methods">
              <h3 style={{ fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
                Payment Method
              </h3>

              <div className="payment-option">
                <input 
                  type="radio" 
                  id="card" 
                  name="payment"
                  checked={paymentMethod === 'card'}
                  onChange={() => handlePaymentMethodChange('card')}
                />
                <label htmlFor="card">Card Payment (Stripe)</label>
              </div>

              <div className="payment-option">
                <input 
                  type="radio" 
                  id="bank-transfer" 
                  name="payment"
                  checked={paymentMethod === 'bank'}
                  onChange={() => handlePaymentMethodChange('bank')}
                />
                <label htmlFor="bank-transfer">Direct Bank Transfer</label>
              </div>
              
              {paymentMethod === 'bank' && (
                <div className="payment-description">
                  Make your payment directly into our bank account. Please use your Order ID as the payment reference. Your order will not be shipped until the funds have cleared in our account.
                </div>
              )}

              <div className="payment-option">
                <input 
                  type="radio" 
                  id="cash-on-delivery" 
                  name="payment"
                  checked={paymentMethod === 'cod'}
                  onChange={() => handlePaymentMethodChange('cod')}
                />
                <label htmlFor="cash-on-delivery">Cash On Delivery</label>
              </div>

              {paymentMethod === 'cod' && (
                <div className="payment-description">
                  Pay with cash upon delivery. Please keep exact change handy to help our delivery partner.
                </div>
              )}
            </div>

            {/* Conditional Payment Forms */}
            {paymentMethod === 'card' ? (
              <Elements stripe={stripePromise}>
                <CheckoutForm 
                  cartItems={cartItems}
                  cartTotal={cartTotal}
                  cartSubtotal={cartSubtotal}
                  shippingCost={shippingCost}
                  formData={formData}
                />
              </Elements>
            ) : (
              <>
                <div className="privacy-notice">
                  Your personal data will be used to support your experience throughout this website, 
                  to manage access to your account, and for other purposes described in our{' '}
                  <a href="#" className="privacy-link">privacy policy</a>.
                </div>

                <button 
                  className="place-order-btn"
                  onClick={handleNonCardOrder}
                  disabled={processing}
                >
                  {processing ? 'Processing...' : `Place Order - Rs. ${cartTotal.toLocaleString()}`}
                </button>
              </>
            )}
          </div>
        </div>
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
        :root {
          --max-width: 1200px;
          --muted: #6b7280;
          --pink: #F8EDEE;
          --gold: #D4AF37;
          --light-gray: #f9fafb;
        }

        * { box-sizing: border-box; }
        body, html, .checkout-page { 
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

        .hero {
          background-image: url('https://res.cloudinary.com/dzrfxgqb6/image/upload/v1761288787/99-films-yr9l_xQPDL0-unsplash_lmk6zr.jpg');
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

        .checkout-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          padding: 5rem 0;
          align-items: start;
        }

        .billing-section h2 {
          font-size: 2rem;
          font-weight: 600;
          margin-bottom: 2rem;
        }

        .billing-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-weight: 500;
          font-size: 0.95rem;
        }

        .form-group input,
        .form-group select {
          padding: 1rem 1.25rem;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-family: inherit;
          font-size: 1rem;
          transition: border-color 0.2s;
        }

        .form-group input:focus,
        .form-group select:focus {
          outline: none;
          border-color: var(--gold);
        }

        .additional-info {
          min-height: 100px !important;
        }

        .order-section {
          position: sticky;
          top: 2rem;
        }

        .order-summary {
          background: #fff;
          padding: 0;
          margin-bottom: 2rem;
        }

        .summary-header {
          display: flex;
          justify-content: space-between;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          font-size: 1.25rem;
          margin-bottom: 1.5rem;
        }

        .summary-item {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid #f3f4f6;
          color: var(--muted);
          gap: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 1rem 0;
          border-bottom: 1px solid #f3f4f6;
        }

        .summary-row.total {
          border-bottom: none;
          font-weight: 600;
          font-size: 1.1rem;
          padding: 1.5rem 0;
        }

        .total-amount {
          color: var(--gold);
          font-weight: 600;
          font-size: 1.5rem;
        }

        .payment-methods {
          margin-bottom: 2rem;
        }

        .payment-option {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 1rem 0;
        }

        .payment-option input[type="radio"] {
          width: 20px;
          height: 20px;
          accent-color: var(--gold);
        }

        .payment-option label {
          font-weight: 500;
          cursor: pointer;
        }

        .payment-description {
          background: var(--light-gray);
          padding: 1rem;
          margin: 0.5rem 0 1rem 0;
          border-radius: 8px;
          color: var(--muted);
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .payment-card-section {
          margin-bottom: 2rem;
        }

        .card-element-wrapper {
          padding: 1rem 1.25rem;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          background: white;
        }

        .payment-error {
          background: #fee;
          color: #c00;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .payment-success {
          background: #efe;
          color: #060;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .privacy-notice {
          font-size: 0.9rem;
          color: var(--muted);
          line-height: 1.5;
          margin-bottom: 2rem;
        }

        .privacy-link {
          color: #111827;
          text-decoration: underline;
        }

        .place-order-btn {
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

        .place-order-btn:hover:not(:disabled) {
          background: #111827;
          color: #fff;
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .place-order-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

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
        }

        .feature { 
          flex: 1; 
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
        }

        @media (max-width: 968px) {
          .checkout-content {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          
          .features-inner { 
            flex-direction: column; 
            gap: 1.5rem; 
          }

          .form-row {
            grid-template-columns: 1fr;
          }

          .order-section {
            position: static;
          }
        }
        
        @media (max-width: 640px) {
          .hero { min-height: 220px; }
          .checkout-content { padding: 3rem 0; }
          .billing-section h2 { font-size: 1.5rem; }
        }
      `}</style>
    </div>
  );
};

export default Checkout;