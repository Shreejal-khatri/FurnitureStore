import React, { useState, useEffect, useRef } from 'react';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 

const AboutUs = () => {
  const [counters, setCounters] = useState({ years: 0, customers: 0, products: 0 });
  const [hasAnimated, setHasAnimated] = useState(false);
  const statsRef = useRef(null);

  const animateCounters = () => {
    if (hasAnimated) return;
    setHasAnimated(true);
    
    const targets = { years: 10, customers: 50000, products: 200 };
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;

    let currentStep = 0;

    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setCounters({
        years: Math.floor(targets.years * progress),
        customers: Math.floor(targets.customers * progress),
        products: Math.floor(targets.products * progress)
      });

      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters(targets);
      }
    }, stepTime);
  };

  useEffect(() => {
    const handleScroll = () => {
      if (!statsRef.current || hasAnimated) return;

      const rect = statsRef.current.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;

      if (isVisible) {
        animateCounters();
      }
    };

    window.addEventListener('scroll', handleScroll);
    
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAnimated]);

  const formatNumber = (num, suffix = '') => {
    if (num >= 1000) {
      return (num / 1000).toFixed(0) + 'K' + suffix;
    }
    return num + suffix;
  };

  return (
    <div className="about-page">
      <Navbar />
      
      {/* Hero Section */}
      <div className="hero full-bleed">
        <div className="hero-inner">
          <div className="hero-mark">M</div>
          <h1>About Us</h1>
          <div className="breadcrumb">
            <span style={{cursor: 'pointer'}} 
                  onMouseOver={(e) => e.target.style.color = '#D4AF37'}
                  onMouseOut={(e) => e.target.style.color = '#fff'}>
              Home
            </span>
            <span style={{margin: '0 8px'}}>›</span>
            <span>About Us</span>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div className="container">
        <div className="about-section">
          <div className="about-header">
            <h2>Our Story & Mission</h2>
            <p>We are dedicated to delivering exceptional quality products and services that exceed expectations.<br />Our commitment to excellence drives everything we do, from innovation to customer satisfaction.</p>
          </div>

          <div className="about-content">
            {/* Company Story */}
            <div className="story-section">
              <div className="story-text">
                <h3>Founded on Excellence</h3>
                <p>Since our founding, we have been committed to creating products and services that make a meaningful difference in people's lives. What started as a vision has grown into a trusted brand that customers rely on for quality, innovation, and exceptional service.</p>
                
                <p>Our journey began with a simple belief: that every customer deserves products that not only meet their needs but exceed their expectations. This philosophy continues to guide us as we expand our offerings and reach new milestones.</p>
                
                <div className="stats-grid" ref={statsRef}>
                  <div className="stat-item">
                    <div className="stat-number">{counters.years}+</div>
                    <div className="stat-label">Years of Excellence</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{formatNumber(counters.customers, '+')}</div>
                    <div className="stat-label">Happy Customers</div>
                  </div>
                  <div className="stat-item">
                    <div className="stat-number">{counters.products}+</div>
                    <div className="stat-label">Products Delivered</div>
                  </div>
                </div>
              </div>
              
              <div className="story-image">
                <img src="https://res.cloudinary.com/dzrfxgqb6/image/upload/v1759070706/austin-distel-wD1LRb9OeEo-unsplash_kznrvt.jpg" alt="Our team at work" />
              </div>
            </div>

            {/* Values Section */}
            <div className="values-section">
              <h3>Our Core Values</h3>
              <div className="values-grid">
                <div className="value-item">
                  <div className="value-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2L3.09 8.26L12 22L20.91 8.26L12 2Z" fill="#D4AF37" stroke="#D4AF37" strokeWidth="1"/>
                    </svg>
                  </div>
                  <h4>Quality First</h4>
                  <p>We never compromise on quality. Every product undergoes rigorous testing to ensure it meets our high standards and exceeds customer expectations.</p>
                </div>
                
                <div className="value-item">
                  <div className="value-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="#D4AF37"/>
                    </svg>
                  </div>
                  <h4>Customer Focused</h4>
                  <p>Our customers are at the heart of everything we do. We listen, adapt, and continuously improve to serve you better every day.</p>
                </div>
                
                <div className="value-item">
                  <div className="value-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3H5C3.9 3 3 3.9 3 5V19C3 20.1 3.9 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3ZM9 17L5 13L6.41 11.59L9 14.17L17.59 5.58L19 7L9 17Z" fill="#D4AF37"/>
                    </svg>
                  </div>
                  <h4>Innovation</h4>
                  <p>We embrace new technologies and creative solutions to stay ahead of industry trends and deliver cutting-edge products and services.</p>
                </div>
                
                <div className="value-item">
                  <div className="value-icon">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M16 11C17.66 11 18.99 9.66 18.99 8C18.99 6.34 17.66 5 16 5C14.34 5 13 6.34 13 8C13 9.66 14.34 11 16 11ZM8 11C9.66 11 10.99 9.66 10.99 8C10.99 6.34 9.66 5 8 5C6.34 5 5 6.34 5 8C5 9.66 6.34 11 8 11ZM8 13C5.67 13 1 14.17 1 16.5V19H15V16.5C15 14.17 10.33 13 8 13ZM16 13C15.71 13 15.38 13.02 15.03 13.05C16.19 13.89 17 15.02 17 16.5V19H23V16.5C23 14.17 18.33 13 16 13Z" fill="#D4AF37"/>
                    </svg>
                  </div>
                  <h4>Teamwork</h4>
                  <p>We believe in the power of collaboration. Our diverse team brings together different perspectives to create exceptional results.</p>
                </div>
              </div>
            </div>

            {/* Leadership Section */}
            <div className="leadership-section">
              <h3>Meet Our Leadership</h3>
              <div className="leadership-grid">
                <div className="leader-card">
                  <div className="leader-image">
                    <img src="https://res.cloudinary.com/dzrfxgqb6/image/upload/v1758432165/Business1_b2vsrf.jpg" alt="CEO" />
                  </div>
                  <div className="leader-info">
                    <h4>Sarah Johnson</h4>
                    <p className="leader-title">Chief Executive Officer</p>
                    <p className="leader-bio">With over 15 years of industry experience, Sarah leads our company with a vision for innovation and sustainable growth.</p>
                  </div>
                </div>
                
                <div className="leader-card">
                  <div className="leader-image">
                    <img src="https://res.cloudinary.com/dzrfxgqb6/image/upload/v1758432182/Business2_xsg8jh.jpg" alt="CTO" />
                  </div>
                  <div className="leader-info">
                    <h4>Michael Chen</h4>
                    <p className="leader-title">Chief Technology Officer</p>
                    <p className="leader-bio">Michael drives our technology strategy, ensuring we stay at the forefront of innovation in our industry.</p>
                  </div>
                </div>
                
                <div className="leader-card">
                  <div className="leader-image">
                    <img src="https://res.cloudinary.com/dzrfxgqb6/image/upload/v1758432377/Business5_gyyraz.jpg" alt="COO" />
                  </div>
                  <div className="leader-info">
                    <h4>Emily Rodriguez</h4>
                    <p className="leader-title">Chief Operating Officer</p>
                    <p className="leader-bio">Emily oversees our operations, ensuring exceptional service delivery and operational excellence across all departments.</p>
                  </div>
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
        body, html, .about-page { 
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

        /* ABOUT SECTION */
        .about-section {
          padding: 5rem 0;
        }

        .about-header {
          text-align: center;
          margin-bottom: 5rem;
        }

        .about-header h2 {
          font-size: 2.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #111827;
        }

        .about-header p {
          color: var(--muted);
          font-size: 1rem;
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
        }

        .about-content {
          display: flex;
          flex-direction: column;
          gap: 6rem;
        }

        /* Story Section */
        .story-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          align-items: center;
        }

        .story-text h3 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #111827;
        }

        .story-text p {
          color: #111827;
          line-height: 1.7;
          margin-bottom: 1.5rem;
          font-size: 1rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-top: 2.5rem;
        }

        .stat-item {
          text-align: center;
        }

        .stat-number {
          font-size: 2.5rem;
          font-weight: 700;
          color: var(--gold);
          margin-bottom: 0.5rem;
          transition: all 0.3s ease;
          min-height: 3.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-label {
          font-size: 0.875rem;
          color: var(--muted);
          font-weight: 500;
        }

        .story-image {
          position: relative;
        }

        .story-image img {
          width: 100%;
          height: 400px;
          object-fit: cover;
          border-radius: 12px;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        /* Values Section */
        .values-section h3 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-bottom: 3rem;
          color: #111827;
          text-align: center;
        }

        .values-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 3rem;
        }

        .value-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 2rem;
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s;
        }

        .value-item:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .value-icon {
          margin-bottom: 1.5rem;
        }

        .value-item h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #111827;
        }

        .value-item p {
          color: var(--muted);
          line-height: 1.6;
          margin: 0;
        }

        /* Leadership Section */
        .leadership-section h3 {
          font-size: 1.875rem;
          font-weight: 600;
          margin-bottom: 3rem;
          color: #111827;
          text-align: center;
        }

        .leadership-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2.5rem;
        }

        .leader-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
          transition: all 0.3s;
        }

        .leader-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
        }

        .leader-image {
          position: relative;
          overflow: hidden;
        }

        .leader-image img {
          width: 100%;
          height: 350px;
          object-fit: cover;
          transition: transform 0.3s;
        }

        .leader-card:hover .leader-image img {
          transform: scale(1.05);
        }

        .leader-info {
          padding: 2rem;
        }

        .leader-info h4 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
          color: #111827;
        }

        .leader-title {
          color: var(--gold);
          font-weight: 500;
          margin-bottom: 1rem;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .leader-bio {
          color: var(--muted);
          line-height: 1.6;
          margin: 0;
          font-size: 0.875rem;
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
        @media (max-width: 1024px) {
          .story-section {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          
          .leadership-grid {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (max-width: 768px) {
          .values-grid {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .leadership-grid {
            grid-template-columns: 1fr;
          }
          
          .stats-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
          }
          
          .features-inner { 
            flex-direction: column; 
            gap: 1.5rem; 
            text-align: center; 
          }
        }
        
        @media (max-width: 640px) {
          .hero { min-height: 220px; }
          
          .about-section { 
            padding: 3rem 0; 
          }
          
          .about-header h2 {
            font-size: 1.75rem;
          }
          
          .about-content {
            gap: 4rem;
          }
          
          .value-item {
            padding: 1.5rem;
          }
          
          .leader-info {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default AboutUs;