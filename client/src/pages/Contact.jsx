import React, { useState } from 'react';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 

const Contact = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({
    show: false,
    type: '', 
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleSubmit = async () => {
    
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      showNotification('error', 'Please fill all required fields.');
      return;
    }

    
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(formData.email)) {
      showNotification('error', 'Please provide a valid email address.');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/contact`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        showNotification('success', data.message || 'Message sent successfully!');
        
        setFormData({
          name: '',
          email: '',
          subject: '',
          message: ''
        });
      } else {
        showNotification('error', data.error || 'Failed to send message. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      showNotification('error', 'Network error. Please check your connection and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="contact-page">
      <Navbar />
      
      {/* Notification Toast */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
        </div>
      )}
      
      {/* Hero Section */}
      <div className="hero full-bleed">
        <div className="hero-inner">
          <div className="hero-mark">M</div>
          <h1>Contact</h1>
          <div className="breadcrumb">
            <span style={{cursor: 'pointer'}} 
                  onMouseOver={(e) => e.target.style.color = '#D4AF37'}
                  onMouseOut={(e) => e.target.style.color = '#fff'}>
              Home
            </span>
            <span style={{margin: '0 8px'}}>›</span>
            <span>Contact</span>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="container">
        <div className="contact-section">
          <div className="contact-header">
            <h2>Get In Touch With Us</h2>
            <p>For More Information About Our Product & Services, Please Feel Free To Drop Us<br />An Email. Our Staff Always Be There To Help You Out. Do Not Hesitate!</p>
          </div>

          <div className="contact-content">
            {/* Contact Info */}
            <div className="contact-info">
              <div className="info-item">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#111827"/>
                  </svg>
                </div>
                <div className="info-details">
                  <h3>Address</h3>
                  <p>236 5th SE Avenue, New York NY10000, United States</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#111827"/>
                  </svg>
                </div>
                <div className="info-details">
                  <h3>Phone</h3>
                  <p>Mobile: +(84) 546-6789<br />Hotline: +(84) 456-6789</p>
                </div>
              </div>

              <div className="info-item">
                <div className="info-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 12 5.5 15.5 8zM8 9.5l4 2.5 4-2.5V16H8V9.5z" fill="#111827"/>
                  </svg>
                </div>
                <div className="info-details">
                  <h3>Working Time</h3>
                  <p>Monday-Friday: 9:00 - 22:00<br />Saturday-Sunday: 9:00 - 21:00</p>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form">
              <div className="form-group">
                <label>Your name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Abc"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Abc@def.com"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Subject</label>
                <input
                  type="text"
                  name="subject"
                  value={formData.subject}
                  onChange={handleInputChange}
                  placeholder="This is an optional"
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label>Message</label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Hi! i'd like to ask about"
                  className="form-textarea"
                  rows="4"
                ></textarea>
              </div>

              <button onClick={handleSubmit} className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Sending...' : 'Submit'}
              </button>
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
              <p>For all orders over $50, consectetur adipim scing elit.</p>
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

      {/* Styles */}
      <style>{`
        /* Page base */
        :root {
          --max-width: 1200px;
          --muted: #6b7280;
          --pink: #F8EDEE;
          --pag-yellow: #FFF3CC;
          --pag-active: #FDE68A;
          --gold: #D4AF37;
        }

        * { box-sizing: border-box; }
        body, html, .contact-page { 
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

        /* CONTACT SECTION */
        .contact-section {
          padding: 5rem 0;
        }

        .contact-header {
          text-align: center;
          margin-bottom: 4rem;
        }

        .contact-header h2 {
          font-size: 2.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #111827;
        }

        .contact-header p {
          color: var(--muted);
          font-size: 1rem;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        .contact-content {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          max-width: 1000px;
          margin: 0 auto;
        }

        /* Contact Info */
        .contact-info {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        .info-item {
          display: flex;
          gap: 1.5rem;
          align-items: flex-start;
        }

        .info-icon {
          font-size: 1.5rem;
          margin-top: 0.25rem;
          color: #111827;
          font-weight: bold;
        }

        .info-details h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 0.75rem 0;
          color: #111827;
        }

        .info-details p {
          margin: 0;
          color: #111827;
          line-height: 1.6;
        }

        /* Contact Form */
        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .form-group label {
          font-weight: 500;
          color: #111827;
          font-size: 1rem;
        }

        .form-input {
          padding: 1.25rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
          background: #fff;
        }

        .form-input:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .form-input::placeholder {
          color: #9ca3af;
        }

        .form-textarea {
          padding: 1.25rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
          background: #fff;
          resize: vertical;
          min-height: 120px;
        }

        .form-textarea:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .form-textarea::placeholder {
          color: #9ca3af;
        }

        .submit-btn {
          background: transparent;
          color: #111827;
          padding: 1rem 2.5rem;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1rem;
          font-family: inherit;
          align-self: flex-start;
        }

        .submit-btn:hover {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        .submit-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .submit-btn:disabled:hover {
          background: transparent;
          color: #111827;
        }

        /* Notification Toast */
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 10px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          z-index: 9999;
          animation: slideIn 0.3s ease-out;
          max-width: 400px;
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .notification.success {
          background: #10b981;
          color: white;
        }

        .notification.error {
          background: #ef4444;
          color: white;
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .notification-icon {
          font-size: 1.25rem;
          font-weight: bold;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
        }

        .notification-message {
          font-size: 0.95rem;
          line-height: 1.4;
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

        /* Mobile Responsive Styles */
        @media (max-width: 768px) {
          .hero {
            min-height: 250px;
            padding: 2rem 1rem;
          }
          
          .hero-inner {
            padding: 2rem 1rem;
            gap: 4px;
          }
          
          .hero-mark {
            font-size: 2.5rem;
          }
          
          .hero h1 {
            font-size: 1.75rem;
          }
          
          .breadcrumb {
            font-size: 0.85rem;
          }
          
          .contact-section {
            padding: 3rem 0;
          }
          
          .contact-header {
            margin-bottom: 2.5rem;
          }
          
          .contact-header h2 {
            font-size: 1.75rem;
            margin-bottom: 0.75rem;
          }
          
          .contact-header p {
            font-size: 0.9rem;
            line-height: 1.5;
          }
          
          .contact-header br {
            display: none;
          }
          
          .contact-content {
            grid-template-columns: 1fr;
            gap: 3rem;
            padding: 0 1rem;
          }
          
          .contact-info {
            gap: 2rem;
            order: 2;
          }
          
          .contact-form {
            order: 1;
            gap: 1.5rem;
          }
          
          .info-item {
            flex-direction: column;
            gap: 0.75rem;
            text-align: center;
            align-items: center;
          }
          
          .info-icon {
            margin-top: 0;
            align-self: center;
          }
          
          .info-details h3 {
            font-size: 1.25rem;
            margin-bottom: 0.5rem;
          }
          
          .info-details p {
            font-size: 0.9rem;
          }
          
          .form-group label {
            font-size: 0.9rem;
          }
          
          .form-input,
          .form-textarea {
            padding: 1rem 1.25rem;
            font-size: 0.9rem;
          }
          
          .submit-btn {
            width: 100%;
            align-self: stretch;
            padding: 1rem;
            font-size: 1rem;
          }
          
          .features-inner {
            flex-direction: column;
            gap: 2rem;
            padding: 3rem 0;
          }
          
          .features .f {
            min-width: auto;
          }
          
          .features h4 {
            font-size: 1.2rem;
          }
          
          .features p {
            font-size: 0.9rem;
          }
          
          .notification {
            top: 10px;
            left: 10px;
            right: 10px;
            max-width: none;
            margin: 0;
          }
        }
        
        @media (max-width: 480px) {
          .hero {
            min-height: 200px;
          }
          
          .hero-inner {
            padding: 1.5rem 1rem;
          }
          
          .hero-mark {
            font-size: 2rem;
          }
          
          .hero h1 {
            font-size: 1.5rem;
          }
          
          .contact-section {
            padding: 2rem 0;
          }
          
          .contact-header h2 {
            font-size: 1.5rem;
          }
          
          .contact-header p {
            font-size: 0.85rem;
          }
          
          .contact-content {
            gap: 2rem;
            padding: 0 0.5rem;
          }
          
          .info-details h3 {
            font-size: 1.1rem;
          }
          
          .form-input,
          .form-textarea {
            padding: 0.875rem 1rem;
          }
        }

        /* Tablet and Desktop */
        @media (min-width: 769px) and (max-width: 968px) {
          .contact-content {
            grid-template-columns: 1fr;
            gap: 4rem;
          }
          
          .features-inner { 
            flex-direction: column; 
            gap: 1.5rem; 
            text-align: center; 
          }

          .notification {
            left: 20px;
            right: 20px;
            max-width: calc(100% - 40px);
          }
        }
      `}</style>
    </div>
  );
};

export default Contact;