import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 
import axios from 'axios';

const Blog = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const BASE_URL = import.meta.env.VITE_API_BASE;
  
  
  const itemsPerPage = 5;

  const stripHtml = (html) => {
    if (!html) return '';
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;
    return imagePath.startsWith('/') ? `${BASE_URL}${imagePath}` : `${BASE_URL}/${imagePath}`;
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`${BASE_URL}/api/blogs`);
        setBlogPosts(response.data);
        setError(null);
      } catch (err) {
        console.error('Error fetching blogs:', err);
        setError('Failed to load blogs');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, [BASE_URL]);

  const filteredBlogs = blogPosts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = !selectedCategory || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  
  const totalPages = Math.ceil(filteredBlogs.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentBlogs = filteredBlogs.slice(indexOfFirstItem, indexOfLastItem);

  const goToPage = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 3;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 2) {
        for (let i = 1; i <= 3; i++) {
          pages.push(i);
        }
        if (totalPages > 3) {
          pages.push('...');
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 1) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 2; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const recentPosts = [...blogPosts].slice(0, 5);

  const categories = blogPosts.reduce((acc, post) => {
    const category = post.category || 'Uncategorized';
    const existing = acc.find(c => c.name === category);
    if (existing) {
      existing.count++;
    } else {
      acc.push({ name: category, count: 1 });
    }
    return acc;
  }, []);

  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const handleCategoryClick = (categoryName) => {
    setSelectedCategory(selectedCategory === categoryName ? '' : categoryName);
    setCurrentPage(1); 
  };

  const handleReadMore = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedBlog(null);
  };

  const handleRecentPostClick = (blog) => {
    setSelectedBlog(blog);
    setShowModal(true);
  };

  
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory]);

  return (
    <div className="blog-page">
      <Navbar />
      
      {/* Hero Section */}
      <div className="hero full-bleed">
        <div className="hero-inner">
          <div className="hero-mark">M</div>
          <h1>Blog</h1>
          <div className="breadcrumb">
            <span style={{cursor: 'pointer'}} 
                  onMouseOver={(e) => e.target.style.color = '#D4AF37'}
                  onMouseOut={(e) => e.target.style.color = '#fff'}>
              Home
            </span>
            <span style={{margin: '0 8px'}}>›</span>
            <span>Blog</span>
          </div>
        </div>
      </div>

      {/* Blog Content */}
      <div className="container">
        <div className="blog-content">
          {/* Mobile Search - Positioned at top */}
          <div className="mobile-search">
            <div className="search-box">
              <input 
                type="text"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="search-btn">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
                </svg>
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="blog-main">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>Loading blogs...</p>
              </div>
            ) : error ? (
              <div style={{ textAlign: 'center', padding: '3rem', color: '#ef4444' }}>
                <p>{error}</p>
              </div>
            ) : currentBlogs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '3rem' }}>
                <p>No blogs found</p>
              </div>
            ) : (
              currentBlogs.map(post => (
                <article key={post._id} className="blog-post">
                  <div className="post-image">
                    <img src={getImageUrl(post.imageUrl)} alt={post.title} />
                  </div>
                  <div className="post-content">
                    <div className="post-meta">
                      <span className="post-author">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                        </svg>
                        {post.author || 'Admin'}
                      </span>
                      <span className="post-date">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/>
                        </svg>
                        {formatDate(post.createdAt)}
                      </span>
                      {post.category && (
                        <span className="post-category">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.63 5.84C17.27 5.33 16.67 5 16 5L5 5.01C3.9 5.01 3 5.9 3 7v10c0 1.1.9 1.99 2 1.99L16 19c.67 0 1.27-.33 1.63-.84L22 12l-4.37-6.16z" fill="currentColor"/>
                          </svg>
                          {post.category}
                        </span>
                      )}
                    </div>
                    <h2>{post.title}</h2>
                    <p>{stripHtml(post.content).substring(0, 200)}...</p>
                    <button className="read-more" onClick={() => handleReadMore(post)}>Read more</button>
                  </div>
                </article>
              ))
            )}

            {/* Pagination */}
            {!loading && filteredBlogs.length > itemsPerPage && (
              <div className="pagination">
                <button 
                  className={`page ${currentPage === 1 ? 'disabled' : ''}`}
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  Previous
                </button>
                
                {getPageNumbers().map((page, index) => (
                  page === '...' ? (
                    <span key={`ellipsis-${index}`} className="page-ellipsis">...</span>
                  ) : (
                    <button
                      key={page}
                      className={`page ${currentPage === page ? 'active' : ''}`}
                      onClick={() => goToPage(page)}
                    >
                      {page}
                    </button>
                  )
                ))}
                
                <button 
                  className={`page next ${currentPage === totalPages ? 'disabled' : ''}`}
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                >
                  Next
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="blog-sidebar">
            {/* Desktop Search - Hidden on mobile */}
            <div className="sidebar-widget desktop-search">
              <div className="search-box">
                <input 
                  type="text"
                  placeholder="Search..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <button className="search-btn">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" fill="currentColor"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Categories */}
            {categories.length > 0 && (
              <div className="sidebar-widget">
                <h3>Categories</h3>
                <ul className="categories-list">
                  {categories.map((category, index) => (
                    <li 
                      key={index}
                      onClick={() => handleCategoryClick(category.name)}
                      className={selectedCategory === category.name ? 'active' : ''}
                    >
                      <span>{category.name}</span>
                      <span>{category.count}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Recent Posts */}
            {recentPosts.length > 0 && (
              <div className="sidebar-widget">
                <h3>Recent Posts</h3>
                <div className="recent-posts">
                  {recentPosts.map(post => (
                    <div 
                      key={post._id} 
                      className="recent-post"
                      onClick={() => handleRecentPostClick(post)}
                    >
                      <img src={getImageUrl(post.imageUrl)} alt={post.title} />
                      <div className="recent-post-content">
                        <h4>{post.title}</h4>
                        <span className="recent-post-date">{formatDate(post.createdAt)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
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
        body, html, .blog-page { 
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

        /* BLOG CONTENT */
        .blog-content {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 4rem;
          padding: 5rem 0;
        }

        .blog-main {
          display: flex;
          flex-direction: column;
          gap: 3rem;
        }

        /* Mobile Search - Hidden on desktop */
        .mobile-search {
          display: none;
          margin-bottom: 2rem;
        }

        /* Desktop Search - Hidden on mobile */
        .desktop-search {
          display: block;
        }

        /* Blog Posts */
        .blog-post {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .post-image {
          width: 100%;
          height: 600px;
          overflow: hidden;
          border-radius: 12px;
        }

        .post-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .post-content {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .post-meta {
          display: flex;
          gap: 1.5rem;
          font-size: 0.9rem;
          color: var(--muted);
        }

        .post-meta span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .post-meta svg {
          flex-shrink: 0;
        }

        .post-content h2 {
          font-size: 1.75rem;
          font-weight: 600;
          margin: 0;
          color: #111827;
        }

        .post-content p {
          line-height: 1.6;
          color: var(--muted);
          margin: 0;
        }

        .read-more {
          background: none;
          border: none;
          color: #111827;
          font-weight: 500;
          cursor: pointer;
          text-decoration: underline;
          align-self: flex-start;
          padding: 0;
          font-size: 1rem;
        }

        .read-more:hover {
          color: var(--gold);
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: center;
          gap: 12px;
          padding: 2rem 0;
          align-items: center;
        }

        .pagination .page {
          background: var(--pag-yellow);
          border: none;
          padding: 12px 18px;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s;
          font-weight: 600;
        }

        .pagination .page:hover:not(.disabled) {
          transform: translateY(-2px);
          box-shadow: 0 8px 20px rgba(0,0,0,0.1);
        }

        .pagination .page.active {
          background: var(--pag-active);
        }

        .pagination .page.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .pagination .page.next {
          background: var(--pag-yellow);
          padding: 12px 24px;
        }

        .page-ellipsis {
          padding: 12px 8px;
          color: var(--muted);
        }

        /* Sidebar */
        .blog-sidebar {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
          padding-top: 1rem;
        }

        .sidebar-widget {
          background: #fff;
        }

        .sidebar-widget h3 {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #111827;
        }

        /* Search */
        .search-box {
          display: flex;
          border: 1px solid #d1d5db;
          border-radius: 10px;
          overflow: hidden;
          margin-bottom: 2rem;
        }

        .search-box input {
          flex: 1;
          padding: 1rem 1.5rem;
          border: none;
          outline: none;
          font-family: inherit;
        }

        .search-btn {
          padding: 1rem 1.5rem;
          border: none;
          background: #f9fafb;
          cursor: pointer;
          border-left: 1px solid #d1d5db;
        }

        /* Categories */
        .categories-list {
          list-style: none;
          margin: 0;
          padding: 0;
        }

        .categories-list li {
          display: flex;
          justify-content: space-between;
          padding: 0.75rem 0;
          border-bottom: 1px solid #f3f4f6;
          color: var(--muted);
          cursor: pointer;
          transition: all 0.2s;
        }

        .categories-list li:last-child {
          border-bottom: none;
        }

        .categories-list li:hover {
          color: var(--gold);
        }

        .categories-list li.active {
          color: var(--gold);
          font-weight: 600;
        }

        /* Recent Posts */
        .recent-posts {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .recent-post {
          display: flex;
          gap: 1rem;
          align-items: flex-start;
          cursor: pointer;
          transition: all 0.2s;
          padding: 0.5rem;
          border-radius: 8px;
        }

        .recent-post:hover {
          background: #f9fafb;
          transform: translateX(4px);
        }

        .recent-post img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          flex-shrink: 0;
        }

        .recent-post-content h4 {
          font-size: 1rem;
          font-weight: 500;
          margin: 0 0 0.5rem 0;
          line-height: 1.4;
          color: #111827;
        }

        .recent-post-date {
          font-size: 0.875rem;
          color: var(--muted);
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

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
          padding: 2rem;
          overflow-y: auto;
          backdrop-filter: blur(4px);
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          position: relative;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .modal-close {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: #f3f4f6;
          transform: rotate(90deg);
        }

        .modal-image {
          width: 100%;
          height: 400px;
          overflow: hidden;
          border-radius: 16px 16px 0 0;
        }

        .modal-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .modal-body {
          padding: 2.5rem;
        }

        .modal-meta {
          display: flex;
          gap: 1.5rem;
          font-size: 0.9rem;
          color: var(--muted);
          margin-bottom: 1.5rem;
          flex-wrap: wrap;
        }

        .modal-meta span {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .modal-title {
          font-size: 2.25rem;
          font-weight: 700;
          margin: 0 0 1.5rem 0;
          color: #111827;
          line-height: 1.3;
        }

        .modal-text {
          font-size: 1.05rem;
          line-height: 1.8;
          color: #374151;
        }

        .modal-text p {
          margin-bottom: 1.25rem;
        }

        .modal-text h1,
        .modal-text h2,
        .modal-text h3,
        .modal-text h4,
        .modal-text h5,
        .modal-text h6 {
          margin-top: 2rem;
          margin-bottom: 1rem;
          font-weight: 600;
          color: #111827;
        }

        .modal-text ul,
        .modal-text ol {
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
        }

        .modal-text li {
          margin-bottom: 0.5rem;
        }

        .modal-text img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 1.5rem 0;
        }

        .modal-text blockquote {
          border-left: 4px solid var(--gold);
          padding-left: 1.5rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: var(--muted);
        }

        .modal-text a {
          color: var(--gold);
          text-decoration: underline;
        }

        .modal-text a:hover {
          color: #b8941f;
        }

        /* Responsive */
        @media (max-width: 968px) {
          .blog-content {
            grid-template-columns: 1fr;
            gap: 3rem;
          }
          
          .features-inner { 
            flex-direction: column; 
            gap: 1.5rem; 
            text-align: center; 
          }

          /* Show mobile search, hide desktop search */
          .mobile-search {
            display: block;
          }
          .desktop-search {
            display: none;
          }
        }
        
        @media (max-width: 640px) {
          .hero { min-height: 220px; }
          
          .blog-content { 
            padding: 3rem 0; 
          }
          
          .post-image {
            height: 250px;
          }
          
          .post-meta {
            flex-direction: column;
            gap: 0.5rem;
          }
          
          .pagination {
            flex-wrap: wrap;
          }
          
          .pagination .page {
            padding: 10px 14px;
          }

          .modal-image {
            height: 250px;
          }

          .modal-body {
            padding: 1.5rem;
          }

          .modal-title {
            font-size: 1.75rem;
          }

          .modal-text {
            font-size: 1rem;
          }

          .modal-close {
            top: 1rem;
            right: 1rem;
            width: 36px;
            height: 36px;
          }

          .recent-post {
            padding: 0.75rem;
          }

          .recent-post:hover {
            transform: translateX(2px);
          }
        }
      `}</style>
    </div>
  );
};

export default Blog;