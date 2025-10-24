import React, { useState } from 'react';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 

const MyAccount = () => {
  const [loginData, setLoginData] = useState({
    username: '',
    password: '',
    remember: false
  });

  const [registerData, setRegisterData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [loading, setLoading] = useState({
    login: false,
    register: false
  });

  const [errors, setErrors] = useState({
    login: '',
    register: ''
  });

  const [success, setSuccess] = useState({
    login: '',
    register: ''
  });

  
  const API_BASE_URL = 
    (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_URL) ||
    (typeof process !== 'undefined' && process.env?.REACT_APP_API_URL);

  const handleLoginChange = (e) => {
    const { name, value, type, checked } = e.target;
    setLoginData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    
    
    if (errors.login) {
      setErrors(prev => ({ ...prev, login: '' }));
    }
  };

  const handleRegisterChange = (e) => {
    setRegisterData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    
    
    if (errors.register) {
      setErrors(prev => ({ ...prev, register: '' }));
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    
   
    setErrors(prev => ({ ...prev, login: '' }));
    setSuccess(prev => ({ ...prev, login: '' }));
    
    
    if (!loginData.username || !loginData.password) {
      setErrors(prev => ({ ...prev, login: 'Please fill in all fields' }));
      return;
    }

    setLoading(prev => ({ ...prev, login: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: loginData.username, 
          password: loginData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(prev => ({ ...prev, login: 'Login successful!' }));
        
        
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        
        
        setTimeout(() => {
          window.location.href = '/'; // 
        }, 1500);
        
      } else {
        setErrors(prev => ({ ...prev, login: data.message || 'Login failed' }));
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors(prev => ({ ...prev, login: 'Network error. Please try again.' }));
    } finally {
      setLoading(prev => ({ ...prev, login: false }));
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    
    
    setErrors(prev => ({ ...prev, register: '' }));
    setSuccess(prev => ({ ...prev, register: '' }));
    
    
    if (!registerData.username || !registerData.email || !registerData.password) {
      setErrors(prev => ({ ...prev, register: 'Please fill in all fields' }));
      return;
    }

    if (registerData.password !== registerData.confirmPassword) {
      setErrors(prev => ({ ...prev, register: 'Passwords do not match' }));
      return;
    }

    if (registerData.password.length < 6) {
      setErrors(prev => ({ ...prev, register: 'Password must be at least 6 characters long' }));
      return;
    }

    setLoading(prev => ({ ...prev, register: true }));

    try {
      const response = await fetch(`${API_BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: registerData.username,
          email: registerData.email,
          password: registerData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(prev => ({ ...prev, register: 'Registration successful! You can now login.' }));
        
        
        setRegisterData({
          username: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
      } else {
        setErrors(prev => ({ ...prev, register: data.message || 'Registration failed' }));
      }
    } catch (error) {
      console.error('Registration error:', error);
      setErrors(prev => ({ ...prev, register: 'Network error. Please try again.' }));
    } finally {
      setLoading(prev => ({ ...prev, register: false }));
    }
  };

  return (
    <div className="my-account-page">
      <Navbar />
      
      {/* Hero Section */}
      <div className="hero full-bleed">
        <div className="hero-inner">
          <div className="hero-mark">M</div>
          <h1>My Account</h1>
          <div className="breadcrumb">
            <span style={{cursor: 'pointer'}} 
                  onMouseOver={(e) => e.target.style.color = '#D4AF37'}
                  onMouseOut={(e) => e.target.style.color = '#fff'}>
              Home
            </span>
            <span style={{margin: '0 8px'}}>›</span>
            <span>My account</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container">
        <div className="account-content">
          
          {/* Login Section */}
          <div className="form-section">
            <h2>Log In</h2>
            <div className="form-container">
              {errors.login && (
                <div className="error-message">
                  {errors.login}
                </div>
              )}
              {success.login && (
                <div className="success-message">
                  {success.login}
                </div>
              )}
              
              <div className="form-group">
                <label>Username or email address</label>
                <input
                  type="text"
                  name="username"
                  value={loginData.username}
                  onChange={handleLoginChange}
                  className="form-input"
                  disabled={loading.login}
                />
              </div>
              
              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={loginData.password}
                  onChange={handleLoginChange}
                  className="form-input"
                  disabled={loading.login}
                />
              </div>

              <div className="checkbox-container">
                <input
                  type="checkbox"
                  name="remember"
                  id="remember"
                  checked={loginData.remember}
                  onChange={handleLoginChange}
                  className="form-checkbox"
                  disabled={loading.login}
                />
                <label htmlFor="remember" className="checkbox-label">
                  Remember me
                </label>
              </div>

              <button 
                type="submit" 
                className="form-button"
                onClick={handleLoginSubmit}
                disabled={loading.login}
              >
                {loading.login ? 'Logging in...' : 'Log In'}
              </button>

              <div className="form-link-container">
                <a href="#" className="form-link">
                  Lost Your Password?
                </a>
              </div>
            </div>
          </div>

          {/* Register Section */}
          <div className="form-section">
            <h2>Register</h2>
            <div className="form-container">
              {errors.register && (
                <div className="error-message">
                  {errors.register}
                </div>
              )}
              {success.register && (
                <div className="success-message">
                  {success.register}
                </div>
              )}
              
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  value={registerData.username}
                  onChange={handleRegisterChange}
                  className="form-input"
                  disabled={loading.register}
                />
              </div>
              
              <div className="form-group">
                <label>Email address</label>
                <input
                  type="email"
                  name="email"
                  value={registerData.email}
                  onChange={handleRegisterChange}
                  className="form-input"
                  disabled={loading.register}
                />
              </div>

              <div className="form-group">
                <label>Password</label>
                <input
                  type="password"
                  name="password"
                  value={registerData.password}
                  onChange={handleRegisterChange}
                  className="form-input"
                  disabled={loading.register}
                />
              </div>

              <div className="form-group">
                <label>Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={registerData.confirmPassword}
                  onChange={handleRegisterChange}
                  className="form-input"
                  disabled={loading.register}
                />
              </div>

              <div className="info-text">
                Your personal data will be used to support your experience throughout this website, to manage access to your account, and for other purposes described in our{' '}
                <a href="#" className="privacy-link">
                  privacy policy
                </a>.
              </div>

              <button 
                type="submit" 
                className="form-button"
                onClick={handleRegisterSubmit}
                disabled={loading.register}
              >
                {loading.register ? 'Creating Account...' : 'Register'}
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
          --error: #ef4444;
          --success: #22c55e;
        }

        * { box-sizing: border-box; }
        body, html, .my-account-page { 
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

        /* ACCOUNT CONTENT */
        .account-content {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 48px;
          padding: 64px 0;
        }

        .form-section {
          width: 100%;
        }

        .form-section h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 32px;
          color: #111827;
        }

        .form-container {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .form-group label {
          color: #374151;
          font-weight: 500;
          font-size: 0.95rem;
        }

        .form-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 16px;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
        }

        .form-input:focus {
          border-color: #D4AF37;
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .form-input:disabled {
          background-color: #f3f4f6;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .checkbox-container {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .form-checkbox {
          width: 16px;
          height: 16px;
          accent-color: #D4AF37;
        }

        .checkbox-label {
          color: #374151;
          font-size: 0.95rem;
        }

        .form-button {
          background-color: transparent;
          color: #111827;
          padding: 14px 48px;
          border-radius: 8px;
          border: 1px solid #d1d5db;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s ease;
          font-size: 16px;
          font-family: inherit;
          width: 100%;
          max-width: 200px;
        }

        .form-button:hover:not(:disabled) {
          background-color: #111827;
          color: white;
          border-color: #111827;
        }

        .form-button:disabled {
          background-color: #f3f4f6;
          color: #9ca3af;
          cursor: not-allowed;
          border-color: #e5e7eb;
        }

        .form-link-container {
          padding-top: 8px;
        }

        .form-link {
          color: var(--muted);
          text-decoration: none;
          font-size: 14px;
          transition: color 0.2s;
        }

        .form-link:hover {
          color: #D4AF37;
        }

        .info-text {
          font-size: 14px;
          color: var(--muted);
          line-height: 1.5;
        }

        .privacy-link {
          color: #111827;
          font-weight: 600;
          text-decoration: none;
          transition: color 0.2s;
        }

        .privacy-link:hover {
          color: #D4AF37;
        }

        /* Error and Success Messages */
        .error-message, .success-message {
          padding: 16px 20px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 16px;
          border-left: 4px solid;
          display: flex;
          align-items: flex-start;
          line-height: 1.5;
          animation: fadeIn 0.3s ease-in;
        }

        .error-message {
          background-color: rgba(239, 68, 68, 0.08);
          color: #dc2626;
          border-color: #ef4444;
          border: 1px solid rgba(239, 68, 68, 0.25);
          border-left: 4px solid #ef4444;
        }

        .success-message {
          background-color: rgba(34, 197, 94, 0.08);
          color: #16a34a;
          border-color: #22c55e;
          border: 1px solid rgba(34, 197, 94, 0.25);
          border-left: 4px solid #22c55e;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
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

        /* Responsive */
        @media (max-width: 820px) {
          .account-content { 
            grid-template-columns: 1fr; 
            gap: 32px; 
          }
          .features-inner { 
            flex-direction: column; 
            gap: 1.5rem; 
            text-align: center; 
          }
        }
        @media (max-width: 520px) {
          .hero { min-height: 220px; }
          .account-content { padding: 32px 0; }
        }
      `}</style>
    </div>
  );
};

export default MyAccount;