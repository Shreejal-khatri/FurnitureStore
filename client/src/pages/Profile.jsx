import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 


const API_URL = import.meta.env.VITE_API_URL;

const Profile = () => {
  const [user, setUser] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    
    const fetchUserData = async () => {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found');
        window.location.href = '/login-register';
        return;
      }

      try {
        
        const response = await fetch(`${API_URL}/user/profile`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const result = await response.json();

        if (!response.ok) {
          if (response.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login-register';
            return;
          }
          throw new Error(result.message || 'Failed to fetch user data');
        }

        
        const userData = result.data;
        setUser(userData);
        setFormData({
          username: userData.username || '',
          email: userData.email || '',
          phone: userData.phone || '',
          address: userData.address || ''
        });

        
        localStorage.setItem('user', JSON.stringify(userData));

      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('token');
      
      
      const response = await fetch(`${API_URL}/user/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to update profile');
      }

      
      const updatedUser = result.data;
      
      
      setUser(updatedUser);
      setIsEditing(false);
      
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      console.log('Profile updated successfully:', updatedUser);
      
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
    }
  };

  const handleCancel = () => {
    setFormData({
      username: user?.username || '',
      email: user?.email || '',
      phone: user?.phone || '',
      address: user?.address || ''
    });
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login-register';
  };


  const getInitial = () => {
    if (formData.username && formData.username.trim()) {
      return formData.username.trim().charAt(0).toUpperCase();
    }
    if (user?.username && user.username.trim()) {
      return user.username.trim().charAt(0).toUpperCase();
    }
    if (user?.email && user.email.trim()) {
      return user.email.trim().charAt(0).toUpperCase();
    }
    return 'U';
  };

  if (loading) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h2>Loading profile...</h2>
        </div>
        <Footer />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="profile-page">
        <Navbar />
        <div className="container" style={{ padding: '4rem 1rem', textAlign: 'center' }}>
          <h2>User not found</h2>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="profile-page">
      <Navbar />
      
      {/* Hero Section */}
      <div className="hero full-bleed">
        <div className="hero-inner">
          <div className="hero-mark">M</div>
          <h1>My Profile</h1>
          <div className="breadcrumb">
            <span style={{cursor: 'pointer'}} 
                  onMouseOver={(e) => e.target.style.color = '#D4AF37'}
                  onMouseOut={(e) => e.target.style.color = '#fff'}>
              Home
            </span>
            <span style={{margin: '0 8px'}}>›</span>
            <span>Profile</span>
          </div>
        </div>
      </div>

      {/* Profile Section */}
      <div className="container">
        <div className="profile-section">
          <div className="profile-header">
            <div className="profile-avatar">
              {getInitial()}
            </div>
            <div className="profile-header-info">
              <h2>{user.username || 'User'}</h2>
              <p>{user.email || 'No email provided'}</p>
            </div>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>

          <div className="profile-content">
            {/* Profile Info */}
            <div className="profile-info">
              <h3>Account Information</h3>
              
              <div className="info-grid">
                <div className="info-item">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="#111827"/>
                    </svg>
                  </div>
                  <div className="info-details">
                    <span className="info-label">Username</span>
                    <p>{user.username || 'Not provided'}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#111827"/>
                    </svg>
                  </div>
                  <div className="info-details">
                    <span className="info-label">Email Address</span>
                    <p>{user.email || 'Not provided'}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z" fill="#111827"/>
                    </svg>
                  </div>
                  <div className="info-details">
                    <span className="info-label">Phone Number</span>
                    <p>{user.phone || 'Not provided'}</p>
                  </div>
                </div>

                <div className="info-item">
                  <div className="info-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="#111827"/>
                    </svg>
                  </div>
                  <div className="info-details">
                    <span className="info-label">Address</span>
                    <p>{user.address || 'Not provided'}</p>
                  </div>
                </div>
              </div>

              {!isEditing && (
                <button onClick={() => setIsEditing(true)} className="edit-btn">
                  Edit Profile
                </button>
              )}
            </div>

            {/* Edit Form */}
            {isEditing && (
              <div className="profile-form">
                <h3>Edit Profile</h3>
                
                <div className="form-group">
                  <label>Username</label>
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleInputChange}
                    placeholder="Enter your username"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="Enter your email"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="Enter your phone number"
                    className="form-input"
                  />
                </div>

                <div className="form-group">
                  <label>Address</label>
                  <textarea
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    placeholder="Enter your address"
                    className="form-textarea"
                    rows="3"
                  ></textarea>
                </div>

                <div className="form-actions">
                  <button onClick={handleSave} className="save-btn">
                    Save Changes
                  </button>
                  <button onClick={handleCancel} className="cancel-btn">
                    Cancel
                  </button>
                </div>
              </div>
            )}
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
          --gold: #D4AF37;
        }

        * { box-sizing: border-box; }
        body, html, .profile-page { 
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

        /* PROFILE SECTION */
        .profile-section {
          padding: 5rem 0;
        }

        .profile-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          padding-bottom: 3rem;
          border-bottom: 1px solid #e5e7eb;
          margin-bottom: 3rem;
        }

        .profile-avatar {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          background: linear-gradient(135deg, var(--gold), #f59e0b);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: 700;
          color: white;
        }

        .profile-header-info {
          flex: 1;
        }

        .profile-header-info h2 {
          font-size: 2rem;
          font-weight: 600;
          margin: 0 0 0.5rem 0;
          color: #111827;
        }

        .profile-header-info p {
          margin: 0;
          color: var(--muted);
          font-size: 1rem;
        }

        .logout-btn {
          background: transparent;
          color: #ef4444;
          padding: 0.75rem 1.5rem;
          border: 1px solid #ef4444;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 0.95rem;
          font-family: inherit;
        }

        .logout-btn:hover {
          background: #ef4444;
          color: white;
        }

        .profile-content {
          display: grid;
          grid-template-columns: 1fr;
          gap: 3rem;
          max-width: 900px;
          margin: 0 auto;
        }

        /* Profile Info */
        .profile-info h3,
        .profile-form h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin: 0 0 2rem 0;
          color: #111827;
        }

        .info-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2.5rem;
        }

        .info-item {
          display: flex;
          gap: 1.25rem;
          align-items: flex-start;
          padding: 2rem;
          background: white;
          border-radius: 16px;
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
        }

        .info-item:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
          border-color: rgba(212, 175, 55, 0.3);
        }

        .info-icon {
          margin-top: 0.125rem;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #f9fafb, #f3f4f6);
          border-radius: 12px;
          flex-shrink: 0;
        }

        .info-icon svg {
          width: 24px;
          height: 24px;
        }

        .info-details {
          flex: 1;
        }

        .info-label {
          display: block;
          font-size: 0.8125rem;
          color: var(--muted);
          margin-bottom: 0.5rem;
          text-transform: uppercase;
          letter-spacing: 0.025em;
          font-weight: 600;
        }

        .info-details p {
          margin: 0;
          color: #111827;
          font-weight: 500;
          font-size: 1.0625rem;
          line-height: 1.5;
        }

        .edit-btn {
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
        }

        .edit-btn:hover {
          background: #111827;
          color: white;
          border-color: #111827;
        }

        /* Profile Form */
        .profile-form {
          padding: 2rem;
          background: #f9fafb;
          border-radius: 10px;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .form-group label {
          font-weight: 500;
          color: #111827;
          font-size: 1rem;
        }

        .form-input {
          padding: 1rem 1.25rem;
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
          padding: 1rem 1.25rem;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
          font-family: inherit;
          background: #fff;
          resize: vertical;
          min-height: 100px;
        }

        .form-textarea:focus {
          border-color: var(--gold);
          box-shadow: 0 0 0 3px rgba(212, 175, 55, 0.1);
        }

        .form-textarea::placeholder {
          color: #9ca3af;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          margin-top: 2rem;
        }

        .save-btn {
          background: #111827;
          color: white;
          padding: 1rem 2.5rem;
          border: 1px solid #111827;
          border-radius: 10px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 1rem;
          font-family: inherit;
        }

        .save-btn:hover {
          background: #1f2937;
        }

        .cancel-btn {
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
        }

        .cancel-btn:hover {
          background: #f9fafb;
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
        @media (max-width: 968px) {
          .info-grid {
            grid-template-columns: 1fr;
          }
          
          .features-inner { 
            flex-direction: column; 
            gap: 1.5rem; 
            text-align: center; 
          }
        }
        
        @media (max-width: 640px) {
          .hero { min-height: 220px; }
          
          .profile-section { 
            padding: 3rem 0; 
          }
          
          .profile-header {
            flex-direction: column;
            text-align: center;
          }
          
          .logout-btn {
            width: 100%;
          }
          
          .form-actions {
            flex-direction: column;
          }
          
          .save-btn,
          .cancel-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;