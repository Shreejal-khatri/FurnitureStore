import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar"; 
import Footer from "../components/Footer"; 

export default function Home() {
  const navigate = useNavigate();
  const [products, setProducts] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [blogsLoading, setBlogsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [blogsError, setBlogsError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE;

  
  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return 'https://via.placeholder.com/400x220';
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath.startsWith('/') ? `${BASE_URL}${imagePath}` : `${BASE_URL}/${imagePath}`;
  };

  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_BASE_URL}/products`);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Received non-JSON response:', text.substring(0, 200));
          throw new Error('Server returned HTML instead of JSON. Check your API endpoint.');
        }
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError(err.message || "Failed to load products.");
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setBlogsLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_BASE_URL}/blogs`);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Received non-JSON response:', text.substring(0, 200));
          throw new Error('Server returned HTML instead of JSON. Check your API endpoint.');
        }
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        setBlogs(data);
        setBlogsError(null);
      } catch (err) {
        console.error("Error fetching blogs:", err);
        setBlogsError(err.message || "Failed to load blogs.");
      } finally {
        setBlogsLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  
  const handleBlogClick = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  
  const closeModal = () => {
    setShowModal(false);
    setSelectedBlog(null);
  };

  
  const topPicksProducts = products.slice(0, 4);

  
  const homepageBlogs = blogs.slice(0, 3);

  
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      {/* Navbar */}
      <Navbar />
      <div className="home-container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-text">
              <h1>Rocket single seater</h1>
              <button className="hero-link" onClick={() => navigate('/shop')}>Shop Now</button>
            </div>
            <div className="hero-image">
              <img
                src="https://res.cloudinary.com/dzrfxgqb6/image/upload/v1758632472/MainChair_n8pap3.png"
                alt="Rocket single seater"
              />
            </div>
          </div>
        </section>

        {/* Side Tables */}
        <section className="side-tables-section">
          <div className="side-tables-container">
            <div className="side-table-card" onClick={() => navigate('/shop?category=table')} style={{ cursor: 'pointer' }}>
              <img
                src="https://res.cloudinary.com/dzrfxgqb6/image/upload/v1758636755/Hightable_joge6b.png"
                alt="Table"
              />
              <h2>Table</h2>
              <button className="card-link" onClick={(e) => { e.stopPropagation(); navigate('/shop?category=table'); }}>View More</button>
            </div>
            <div className="side-table-card" onClick={() => navigate('/shop?category=sofa')} style={{ cursor: 'pointer' }}>
              <img
                src="https://res.cloudinary.com/dzrfxgqb6/image/upload/v1758636756/Sofa_hqokjz.png"
                alt="Sofa"
              />
              <h2>Sofa</h2>
              <button className="card-link" onClick={(e) => { e.stopPropagation(); navigate('/shop?category=sofa'); }}>View More</button>
            </div>
          </div>
        </section>

        {/* Top Picks */}
        <section className="top-picks-section">
          <div className="container">
            <div className="section-header">
              <h2>Top Picks For You</h2>
              <p>Find a bright ideal to suit your taste with our great selection of suspension, floor and table lights.</p>
            </div>
            
            {loading ? (
              <div className="loading-state">Loading products...</div>
            ) : error ? (
              <div className="error-state">Error: {error}</div>
            ) : topPicksProducts.length === 0 ? (
              <div className="no-products-state">No products available</div>
            ) : (
              <div className="top-picks-grid">
                {topPicksProducts.map((product) => (
                  <div 
                    className="pick-card" 
                    key={product._id}
                    onClick={() => handleProductClick(product._id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={product.imageUrl || 'https://via.placeholder.com/220'}
                      alt={product.name}
                    />
                    <h3>{product.name}</h3>
                    <p>Rs. {product.price.toFixed(2)}</p>
                  </div>
                ))}
              </div>
            )}
            
            <div className="section-footer">
              <button className="view-more" onClick={() => navigate('/shop')}>View More</button>
            </div>
          </div>
        </section>

        {/* New Arrivals */}
        <section className="new-arrivals-section">
          <div className="container">
            <div className="arrival-content">
              <div className="arrival-image">
                <img
                  src="https://res.cloudinary.com/dzrfxgqb6/image/upload/v1758640245/vecteezy_top-view-of-beige-modular-sofa-with-multiple-pillows-and_59046873_c2cqn1.png"
                  alt="Asgaard sofa"
                />
              </div>
              <div className="arrival-text">
                <div className="section-header">
                  <h2>New Arrivals</h2>
                  <h3>Asgaard sofa</h3>
                </div>
                <button className="order-now" onClick={() => navigate('/shop')}>Order Now</button>
              </div>
            </div>
          </div>
        </section>

        {/* Blogs */}
        <section className="blogs-section">
          <div className="container">
            <div className="section-header">
              <h2>Our Blogs</h2>
              <p>Find a bright ideal to suit your taste with our great selection</p>
            </div>
            
            {blogsLoading ? (
              <div className="loading-state">Loading blogs...</div>
            ) : blogsError ? (
              <div className="error-state">Error: {blogsError}</div>
            ) : homepageBlogs.length === 0 ? (
              <div className="no-products-state">No blogs available</div>
            ) : (
              <div className="blogs-grid">
                {homepageBlogs.map((blog) => (
                  <div 
                    className="blog-card" 
                    key={blog._id}
                    onClick={() => handleBlogClick(blog)}
                    style={{ cursor: 'pointer' }}
                  >
                    <img
                      src={getImageUrl(blog.imageUrl)}
                      alt={blog.title}
                    />
                    <h3>{blog.title}</h3>
                    <p>{formatDate(blog.createdAt)}</p>
                    <button 
                      className="blog-link"
                      onClick={(e) => { e.stopPropagation(); handleBlogClick(blog); }}
                    >
                      Read More
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            <div className="section-footer">
              <button className="view-all" onClick={() => navigate('/blog')}>View All Post</button>
            </div>
          </div>
        </section>

        {/* Enhanced Instagram Section */}
        <section className="instagram-section">
          <div className="instagram-bg">
            <div className="instagram-overlay"></div>
          </div>
          <div className="instagram-content">
            <div className="container">
              <div className="section-header">
                <h2>Our Instagram</h2>
                <p>Follow our store on Instagram for the latest updates and inspirations</p>
              </div>
              <div className="section-footer">
                <button className="instagram-link">Follow Us</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Blog Modal */}
      {showModal && selectedBlog && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeModal}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
              </svg>
            </button>
            
            <div className="modal-image">
              <img src={getImageUrl(selectedBlog.imageUrl)} alt={selectedBlog.title} />
            </div>
            
            <div className="modal-body">
              <div className="modal-meta">
                <span className="modal-author">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                  </svg>
                  {selectedBlog.author || 'Admin'}
                </span>
                <span className="modal-date">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/>
                  </svg>
                  {formatDate(selectedBlog.createdAt)}
                </span>
                {selectedBlog.category && (
                  <span className="modal-category">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z" fill="currentColor"/>
                    </svg>
                    {selectedBlog.category}
                  </span>
                )}
              </div>
              
              <h1 className="modal-title">{selectedBlog.title}</h1>
              
              <div className="modal-text" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <Footer />

      {/* Optimized Smooth Animations CSS */}
      <style>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* GPU acceleration and smooth scrolling optimizations */
        html {
          scroll-behavior: smooth;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        body {
          overflow-x: hidden;
        }
        
        .home-container { 
          width: 100%;
          font-family: sans-serif; 
          overflow-x: hidden;
        }
        
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Enhanced container for very small screens */
        @media (max-width: 480px) {
          .container {
            padding: 0 0.75rem;
          }
        }

        /* Loading, Error, and No Products States */
        .loading-state,
        .error-state,
        .no-products-state {
          text-align: center;
          padding: 3rem 1rem;
          font-size: 1.125rem;
          color: #6B7280;
        }

        .error-state {
          color: #DC2626;
        }

        /* Section Headers */
        .section-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .section-header h2 {
          font-size: clamp(1.75rem, 4vw, 2.25rem);
          font-weight: bold;
          margin-bottom: 1rem;
          color: #1F2937;
          line-height: 1.2;
        }

        .section-header p {
          color: #6B7280;
          font-size: clamp(0.875rem, 2.5vw, 1rem);
          line-height: 1.6;
          max-width: 600px;
          margin: 0 auto;
          padding: 0 1rem;
        }

        .section-footer {
          text-align: center;
          margin-top: 3rem;
        }

        @media (max-width: 480px) {
          .section-header {
            margin-bottom: 2rem;
          }
          
          .section-footer {
            margin-top: 2rem;
          }
        }
        
        /* Hero Section */
        .hero-section { 
          background-color: #FEF3C7; 
          padding: clamp(2rem, 8vw, 4rem) 0;
          min-height: 60vh;
          display: flex;
          align-items: center;
        }
        
        .hero-content {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          width: 100%;
        }
        
        @media (min-width: 768px) {
          .hero-content {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            gap: 3rem;
          }
        }

        @media (max-width: 480px) {
          .hero-content {
            padding: 0 0.75rem;
            gap: 1.5rem;
          }
        }
        
        .hero-text { 
          text-align: center;
          flex: 1;
          max-width: 100%;
        }
        
        @media (min-width: 768px) {
          .hero-text {
            text-align: left;
            max-width: 50%;
          }
        }
        
        .hero-text h1 { 
          font-size: clamp(2rem, 6vw, 3rem); 
          font-weight: bold; 
          margin-bottom: clamp(1.5rem, 4vw, 2rem);
          color: #1F2937;
          line-height: 1.2;
          word-wrap: break-word;
        }
        
        .hero-link { 
          text-decoration: underline; 
          font-size: clamp(1rem, 3vw, 1.25rem); 
          color: #1F2937;
          font-weight: 600;
          text-underline-offset: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.75rem 1.5rem;
          border-radius: 0.25rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          will-change: transform, background-color;
          transform: translateZ(0);
        }

        .hero-link:hover,
        .hero-link:focus {
          background-color: rgba(31, 41, 55, 0.1);
          outline: none;
          transform: translateZ(0) scale(1.02);
        }

        .hero-link:active {
          transform: translateZ(0) translateY(1px) scale(0.98);
        }
        
        .hero-image { 
          flex: 1;
          display: flex;
          justify-content: center;
          width: 100%;
          max-width: 100%;
        }

        @media (min-width: 768px) {
          .hero-image {
            max-width: 50%;
          }
        }
        
        .hero-image img { 
          max-width: 100%;
          height: auto;
          max-height: clamp(300px, 50vh, 450px);
          object-fit: contain;
          width: auto;
        }
        
        /* Side Tables */
        .side-tables-section { 
          background-color: #FEE2E2; 
          padding: clamp(2rem, 8vw, 4rem) 0;
        }
        
        .side-tables-container {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 1rem;
        }
        
        @media (min-width: 640px) {
          .side-tables-container {
            flex-direction: row;
            justify-content: center;
            gap: clamp(2rem, 6vw, 4rem);
          }
        }

        @media (max-width: 480px) {
          .side-tables-container {
            padding: 0 0.75rem;
            gap: 1.5rem;
          }
        }
        
        .side-table-card {
          text-align: center;
          flex: 1;
          max-width: 100%;
          width: 100%;
        }

        @media (min-width: 640px) {
          .side-table-card {
            max-width: 350px;
          }
        }
        
        .side-table-card img { 
          width: 100%;
          max-width: clamp(200px, 50vw, 240px);
          height: auto;
          margin: 0 auto 1.5rem;
          display: block;
          object-fit: contain;
        }
        
        .side-table-card h2 { 
          font-size: clamp(1.25rem, 4vw, 1.5rem);
          font-weight: 600; 
          margin-bottom: 1.5rem;
          color: #1F2937;
        }
        
        .card-link { 
          text-decoration: underline; 
          font-size: clamp(0.875rem, 2.5vw, 1rem); 
          color: #374151;
          font-weight: 600;
          text-underline-offset: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          will-change: transform, background-color;
          transform: translateZ(0);
        }

        .card-link:hover,
        .card-link:focus {
          background-color: rgba(55, 65, 81, 0.1);
          outline: none;
          transform: translateZ(0) scale(1.02);
        }

        .card-link:active {
          transform: translateZ(0) translateY(1px) scale(0.98);
        }
        
        /* Top Picks */
        .top-picks-section { 
          padding: clamp(3rem, 8vw, 5rem) 0;
          background-color: white;
        }
        
        .top-picks-grid { 
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin: 3rem 0;
        }
        
        @media (min-width: 480px) {
          .top-picks-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 1.5rem;
          }
        }
        
        @media (min-width: 768px) {
          .top-picks-grid {
            gap: 2rem;
          }
        }
        
        @media (min-width: 1024px) {
          .top-picks-grid {
            grid-template-columns: repeat(4, 1fr);
            gap: 2.5rem;
          }
        }

        @media (max-width: 479px) {
          .top-picks-grid {
            gap: 1.5rem;
            margin: 2rem 0;
          }
        }
        
        .pick-card {
          text-align: center;
          padding: 1rem;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          transform: translateZ(0);
        }

        .pick-card:hover {
          transform: translateZ(0) translateY(-8px);
        }

        @media (max-width: 480px) {
          .pick-card {
            padding: 0.75rem;
          }
        }
        
        .pick-card img { 
          width: 100%;
          max-width: 220px;
          height: auto;
          margin: 0 auto 1.5rem;
          display: block;
          object-fit: contain;
        }

        @media (max-width: 480px) {
          .pick-card img {
            max-width: 180px;
            margin-bottom: 1rem;
          }
        }
        
        .pick-card h3 { 
          font-weight: 600; 
          margin-bottom: 0.75rem;
          color: #1F2937;
          font-size: clamp(1rem, 3vw, 1.125rem);
          line-height: 1.4;
          word-wrap: break-word;
          hyphens: auto;
        }
        
        .pick-card p { 
          color: #374151;
          font-weight: 600;
          font-size: clamp(0.875rem, 2.5vw, 1rem);
        }
        
        .view-more { 
          text-decoration: underline; 
          display: inline-block;
          color: #1F2937;
          font-weight: 600;
          font-size: clamp(1rem, 3vw, 1.125rem);
          text-underline-offset: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.75rem 1.5rem;
          border-radius: 0.25rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          will-change: transform, background-color;
          transform: translateZ(0);
        }

        .view-more:hover,
        .view-more:focus {
          background-color: rgba(31, 41, 55, 0.1);
          outline: none;
          transform: translateZ(0) scale(1.02);
        }

        .view-more:active {
          transform: translateZ(0) translateY(1px) scale(0.98);
        }
        
        /* New Arrivals */
        .new-arrivals-section { 
          background-color: #FEF3C7; 
          padding: clamp(3rem, 8vw, 5rem) 0;
        }
        
        .arrival-content {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 2rem;
          max-width: 1000px;
          margin: 0 auto;
        }
        
        @media (min-width: 768px) {
          .arrival-content {
            flex-direction: row;
            justify-content: center;
            gap: clamp(3rem, 8vw, 5rem);
          }
        }

        @media (max-width: 480px) {
          .arrival-content {
            gap: 1.5rem;
          }
        }
        
        .arrival-image {
          flex: 1;
          display: flex;
          justify-content: center;
          width: 100%;
          max-width: 100%;
        }

        @media (min-width: 768px) {
          .arrival-image {
            max-width: 50%;
          }
        }
        
        .arrival-image img { 
          max-width: 100%;
          height: auto;
          max-height: clamp(300px, 50vh, 450px);
          object-fit: contain;
          width: auto;
        }
        
        .arrival-text { 
          text-align: center;
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: center;
          max-width: 100%;
        }
        
        @media (min-width: 768px) {
          .arrival-text {
            text-align: left;
            max-width: 50%;
          }
        }

        .arrival-text .section-header {
          margin-bottom: 2rem;
        }

        @media (max-width: 480px) {
          .arrival-text .section-header {
            margin-bottom: 1.5rem;
          }
        }

        .arrival-text .section-header h2 {
          text-align: inherit;
          margin-bottom: 0.5rem;
        }

        .arrival-text h3 {
          font-size: clamp(1.25rem, 4vw, 1.5rem);
          color: #374151;
          font-weight: 500;
          margin: 0;
          word-wrap: break-word;
        }
        
        .order-now { 
          border: 1px solid #000; 
          padding: clamp(0.75rem, 3vw, 1rem) clamp(1.5rem, 5vw, 2.5rem); 
          text-decoration: none;
          color: #000;
          font-weight: 600;
          display: inline-block;
          transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: clamp(0.875rem, 2.5vw, 1rem);
          border-radius: 0.25rem;
          cursor: pointer;
          background: none;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          will-change: transform, background-color, color;
          transform: translateZ(0);
        }
        
        .order-now:hover,
        .order-now:focus {
          background-color: #000;
          color: white;
          outline: none;
          transform: translateZ(0) translateY(-2px);
        }

        .order-now:active {
          transform: translateZ(0) translateY(0);
        }
        
        /* Blogs */
        .blogs-section { 
          padding: clamp(3rem, 8vw, 5rem) 0;
          background-color: white;
        }
        
        .blogs-grid { 
          display: grid;
          grid-template-columns: 1fr;
          gap: 2rem;
          margin: 3rem 0;
        }
        
        @media (min-width: 768px) {
          .blogs-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 2.5rem;
          }
        }

        @media (max-width: 479px) {
          .blogs-grid {
            gap: 1.5rem;
            margin: 2rem 0;
          }
        }
        
        .blog-card {
          text-align: center;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
          transform: translateZ(0);
        }

        .blog-card:hover {
          transform: translateZ(0) translateY(-8px);
        }
        
        .blog-card img { 
          width: 100%;
          height: clamp(180px, 40vw, 220px);
          object-fit: cover;
          border-radius: 0.5rem; 
          margin-bottom: 1.5rem;
        }

        @media (max-width: 480px) {
          .blog-card img {
            margin-bottom: 1rem;
          }
        }
        
        .blog-card h3 { 
          font-weight: 600; 
          margin-bottom: 1rem;
          color: #1F2937;
          font-size: clamp(1rem, 3vw, 1.125rem);
          line-height: 1.4;
          word-wrap: break-word;
          hyphens: auto;
        }

        @media (max-width: 480px) {
          .blog-card h3 {
            margin-bottom: 0.75rem;
          }
        }
        
        .blog-card p { 
          color: #6B7280; 
          font-size: clamp(0.75rem, 2vw, 0.875rem);
          margin-bottom: 1.25rem;
        }

        @media (max-width: 480px) {
          .blog-card p {
            margin-bottom: 1rem;
          }
        }
        
        .blog-link { 
          text-decoration: underline; 
          display: inline-block;
          color: #374151;
          font-weight: 600;
          text-underline-offset: 4px;
          background: none;
          border: none;
          cursor: pointer;
          font-size: clamp(0.875rem, 2.5vw, 1rem);
          padding: 0.5rem 1rem;
          border-radius: 0.25rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          will-change: transform, background-color;
          transform: translateZ(0);
        }

        .blog-link:hover,
        .blog-link:focus {
          background-color: rgba(55, 65, 81, 0.1);
          outline: none;
          transform: translateZ(0) scale(1.02);
        }

        .blog-link:active {
          transform: translateZ(0) translateY(1px) scale(0.98);
        }
        
        .view-all { 
          text-decoration: underline; 
          display: inline-block;
          color: #1F2937;
          font-weight: 600;
          font-size: clamp(1rem, 3vw, 1.125rem);
          text-underline-offset: 4px;
          background: none;
          border: none;
          cursor: pointer;
          padding: 0.75rem 1.5rem;
          border-radius: 0.25rem;
          transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          will-change: transform, background-color;
          transform: translateZ(0);
        }

        .view-all:hover,
        .view-all:focus {
          background-color: rgba(31, 41, 55, 0.1);
          outline: none;
          transform: translateZ(0) scale(1.02);
        }

        .view-all:active {
          transform: translateZ(0) translateY(1px) scale(0.98);
        }
        
        /* Enhanced Instagram Section */
        .instagram-section { 
          position: relative;
          padding: clamp(5rem, 12vw, 8rem) 0;
          min-height: 60vh;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }
        
        .instagram-bg {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url('https://res.cloudinary.com/dzrfxgqb6/image/upload/v1758643536/clay-banks-oO6Gm16Cqcg-unsplash_xi1boi.jpg');
          background-size: cover;
          background-position: center;
          background-repeat: no-repeat;
          z-index: 1;
          transform: translateZ(0);
        }
        
        .instagram-overlay {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          z-index: 2;
          transform: translateZ(0);
        }
        
        .instagram-content {
          position: relative;
          z-index: 3;
          width: 100%;
        }
        
        .instagram-section .section-header h2 {
          color: white;
          font-size: clamp(2rem, 6vw, 3rem);
          margin-bottom: 1.5rem;
        }
        
        .instagram-section .section-header p {
          color: rgba(255, 255, 255, 0.9);
          font-size: clamp(1rem, 3vw, 1.25rem);
          max-width: 500px;
        }
        
        .instagram-link { 
          border: 2px solid white; 
          padding: clamp(1rem, 3vw, 1.25rem) clamp(2rem, 5vw, 3rem); 
          text-decoration: none; 
          border-radius: 50px;
          color: white;
          font-weight: 600;
          display: inline-block;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-size: clamp(1rem, 3vw, 1.125rem);
          cursor: pointer;
          background: transparent;
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
          letter-spacing: 0.5px;
          position: relative;
          overflow: hidden;
          will-change: transform, background-color, color, box-shadow;
          transform: translateZ(0);
          backface-visibility: hidden;
        }
        
        .instagram-link:hover,
        .instagram-link:focus {
          background-color: white;
          color: #000;
          transform: translateZ(0) translateY(-3px);
          box-shadow: 0 15px 30px rgba(0, 0, 0, 0.25);
          outline: none;
        }

        .instagram-link:active {
          transform: translateZ(0) translateY(-1px);
          box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
        }

        /* Blog Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.75);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 9999;
          padding: 1rem;
          overflow-y: auto;
          font-family: sans-serif;
        }

        .modal-content {
          background: white;
          border-radius: 0.5rem;
          max-width: 1000px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          margin: auto;
        }

        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: white;
          border: none;
          border-radius: 50%;
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.2s;
        }

        .modal-close:hover {
          background-color: #f3f4f6;
          transform: scale(1.1);
        }

        .modal-close svg {
          color: #374151;
          width: 28px;
          height: 28px;
        }

        .modal-image {
          width: 100%;
          height: 400px;
          overflow: hidden;
          border-radius: 0.5rem 0.5rem 0 0;
        }

        .modal-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-body {
          padding: 3rem;
        }

        .modal-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 2rem;
          margin-bottom: 2rem;
          color: #6B7280;
          font-size: 1rem;
        }

        .modal-meta span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-author svg,
        .modal-date svg,
        .modal-category svg {
          width: 18px;
          height: 18px;
        }

        .modal-title {
          font-size: clamp(1.75rem, 4vw, 2.5rem);
          font-weight: bold;
          color: #1F2937;
          margin-bottom: 2rem;
          line-height: 1.3;
          font-family: sans-serif;
        }

        .modal-text {
          color: #374151;
          line-height: 1.8;
          font-size: 1.125rem;
          font-family: sans-serif;
        }

        .modal-text p {
          margin-bottom: 1.5rem;
          font-size: 1.125rem;
          line-height: 1.8;
        }

        .modal-text h1 {
          font-size: 2rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1F2937;
        }

        .modal-text h2 {
          font-size: 1.75rem;
          font-weight: bold;
          margin-top: 2rem;
          margin-bottom: 1rem;
          color: #1F2937;
        }

        .modal-text h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 1rem;
          color: #1F2937;
        }

        .modal-text ul, .modal-text ol {
          margin-left: 2rem;
          margin-bottom: 1.5rem;
          font-size: 1.125rem;
          line-height: 1.8;
        }

        .modal-text li {
          margin-bottom: 0.5rem;
        }

        .modal-text img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 2rem 0;
        }

        .modal-text strong {
          font-weight: 600;
          color: #1F2937;
        }

        .modal-text em {
          font-style: italic;
        }

        .modal-text a {
          color: #2563eb;
          text-decoration: underline;
        }

        .modal-text a:hover {
          color: #1d4ed8;
        }

        @media (max-width: 1024px) {
          .modal-content {
            max-width: 95%;
          }

          .modal-body {
            padding: 2.5rem;
          }

          .modal-image {
            height: 350px;
          }
        }

        @media (max-width: 768px) {
          .modal-content {
            max-height: 95vh;
            max-width: 100%;
          }

          .modal-body {
            padding: 2rem;
          }

          .modal-title {
            font-size: 1.75rem;
            margin-bottom: 1.5rem;
          }

          .modal-image {
            height: 250px;
          }

          .modal-text {
            font-size: 1rem;
          }

          .modal-text p {
            font-size: 1rem;
          }

          .modal-text h1 {
            font-size: 1.5rem;
          }

          .modal-text h2 {
            font-size: 1.35rem;
          }

          .modal-text h3 {
            font-size: 1.2rem;
          }

          .modal-meta {
            gap: 1.5rem;
            font-size: 0.875rem;
          }

          .modal-close {
            top: 1rem;
            right: 1rem;
            width: 40px;
            height: 40px;
          }

          .modal-close svg {
            width: 24px;
            height: 24px;
          }
        }

        @media (max-width: 480px) {
          .modal-body {
            padding: 1.5rem;
          }

          .modal-image {
            height: 200px;
          }
        }

        /* Enhanced touch targets for mobile */
        @media (max-width: 767px) {
          button, .hero-link, .card-link, .view-more, .order-now, .blog-link, .view-all, .instagram-link {
            min-height: 44px;
            min-width: 44px;
          }
        }

        /* Better image loading and performance optimizations */
        img {
          max-width: 100%;
          height: auto;
          transform: translateZ(0);
          backface-visibility: hidden;
        }

        /* Enhanced focus styles for accessibility */
        button:focus-visible,
        .hero-link:focus-visible,
        .card-link:focus-visible,
        .view-more:focus-visible,
        .order-now:focus-visible,
        .blog-link:focus-visible,
        .view-all:focus-visible,
        .instagram-link:focus-visible {
          outline: 2px solid #000;
          outline-offset: 2px;
        }

        .instagram-link:focus-visible {
          outline: 2px solid white;
          outline-offset: 2px;
        }

        /* Performance optimizations for smooth scrolling */
        @media (prefers-reduced-motion: no-preference) {
          * {
            scroll-behavior: smooth;
          }
        }

        /* Reduce motion for users who prefer it */
        @media (prefers-reduced-motion: reduce) {
          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
            scroll-behavior: auto !important;
          }
        }

        /* Additional GPU acceleration for better performance */
        .pick-card,
        .blog-card,
        .hero-link,
        .card-link,
        .view-more,
        .order-now,
        .blog-link,
        .view-all,
        .instagram-link {
          backface-visibility: hidden;
          perspective: 1000px;
        }
      `}</style>
    </>
  );
}