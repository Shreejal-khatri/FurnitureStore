import React, { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Shop() {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchParams, setSearchParams] = useSearchParams();
  const [showFilterDropdown, setShowFilterDropdown] = useState(false);
  const navigate = useNavigate();

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16;

  const searchQuery = searchParams.get('search') || '';

  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    return imagePath.startsWith('/') ? `${BASE_URL}${imagePath}` : `${BASE_URL}/${imagePath}`;
  };

  useEffect(() => {
    const categoryFromUrl = searchParams.get('category');
    if (categoryFromUrl) {
      setSelectedCategory(categoryFromUrl);
    }
  }, [searchParams]);

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setShowFilterDropdown(false);
    setCurrentPage(1); 
    
    const newParams = {};
    if (searchQuery) newParams.search = searchQuery;
    if (category !== 'all') newParams.category = category;
    
    setSearchParams(newParams);
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
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => 
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredProducts(filtered);
    setCurrentPage(1); 
  }, [selectedCategory, products, searchQuery]);

 
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstItem, indexOfLastItem);

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

  const handleSortChange = (e) => {
    const sortValue = e.target.value;
    let sortedProducts = [...filteredProducts];
    
    switch(sortValue) {
      case 'price-low':
        sortedProducts.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        sortedProducts.sort((a, b) => b.price - a.price);
        break;
      case 'name':
        sortedProducts.sort((a, b) => a.name.localeCompare(b.name));
        break;
      default:
        break;
    }
    
    setFilteredProducts(sortedProducts);
    setCurrentPage(1); 
  };

  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  if (loading) {
    return (
      <div className="shop-page">
        <Navbar />
        <div className="container loading">Loading products...</div>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="shop-page">
        <Navbar />
        <div className="container error">Error: {error}</div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="shop-page">
      <Navbar />

      {/* Hero Section */}
      <header className="hero full-bleed">
        <div className="hero-inner">
          <div className="hero-mark">M</div>
          <h1>Shop</h1>
          <nav className="breadcrumb">Home &gt; Shop</nav>
        </div>
      </header>

      {/* Filter Section */}
      <div className="filter-bar full-bleed">
        <div className="container filter-inner">
          <div className="filter-left">
            <div className="filter-dropdown">
              <button 
                className="filter-btn" 
                onClick={() => setShowFilterDropdown(!showFilterDropdown)}
              >
                ☰ Filter
              </button>
              {showFilterDropdown && (
                <div className="dropdown-menu">
                  <button 
                    className={selectedCategory === 'all' ? 'active' : ''}
                    onClick={() => handleCategoryChange('all')}
                  >
                    All Products
                  </button>
                  <button 
                    className={selectedCategory === 'sofa' ? 'active' : ''}
                    onClick={() => handleCategoryChange('sofa')}
                  >
                    Sofa
                  </button>
                  <button 
                    className={selectedCategory === 'table' ? 'active' : ''}
                    onClick={() => handleCategoryChange('table')}
                  >
                    Table
                  </button>
                  <button 
                    className={selectedCategory === 'chair' ? 'active' : ''}
                    onClick={() => handleCategoryChange('chair')}
                  >
                    Chair
                  </button>
                  <button 
                    className={selectedCategory === 'bed' ? 'active' : ''}
                    onClick={() => handleCategoryChange('bed')}
                  >
                    Bed
                  </button>
                  <button 
                    className={selectedCategory === 'storage' ? 'active' : ''}
                    onClick={() => handleCategoryChange('storage')}
                  >
                    Storage
                  </button>
                </div>
              )}
            </div>
            <span className="results">
              Showing {filteredProducts.length} of {products.length} results
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in ${selectedCategory}`}
            </span>
          </div>

          <div className="filter-right">
            <label htmlFor="showCount">Show</label>
            <input 
              id="showCount" 
              className="show-input" 
              type="number" 
              value={itemsPerPage} 
              min={1}
              readOnly
              style={{backgroundColor: '#f9f9f9', cursor: 'not-allowed'}}
            />

            <label htmlFor="sortBy">Sort by</label>
            <select id="sortBy" className="sort-select" onChange={handleSortChange}>
              <option value="default">Default</option>
              <option value="name">Name</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product Grid */}
      <main className="container">
        {currentProducts.length === 0 ? (
          <div className="no-products">
            <p>
              No products found
              {searchQuery && ` for "${searchQuery}"`}
              {selectedCategory !== 'all' && ` in category "${selectedCategory}"`}.
            </p>
            {searchQuery && (
              <button 
                onClick={() => {
                  setSearchParams({});
                  setSelectedCategory('all');
                }}
                style={{
                  marginTop: '1rem',
                  padding: '0.75rem 1.5rem',
                  backgroundColor: '#333',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '1rem',
                }}
              >
                Clear Search
              </button>
            )}
          </div>
        ) : (
          <>
            <section className="product-grid">
              {currentProducts.map((product) => (
                <article 
                  className="product-card" 
                  key={product._id}
                  onClick={() => handleProductClick(product._id)}
                >
                  <div className="image-wrap">
                    <img 
                      src={getImageUrl(product.imageUrl)} 
                      alt={product.name} 
                      loading="lazy" 
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                  </div>
                  <div className="meta">
                    <h3 className="product-title">{product.name}</h3>
                    <div className="price">Rs. {product.price}</div>
                    {product.stock !== undefined && (
                      <div className="stock">
                        {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </section>

            {/* Pagination */}
            {filteredProducts.length > itemsPerPage && (
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
          </>
        )}
      </main>

      {/* Features Section */}
      <section className="features full-bleed">
        <div className="container features-inner">
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
      </section>

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
        }

        * { box-sizing: border-box; }
        body, html, .shop-page { background: #fff; color: #111827; font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; }

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

        .error {
          color: #dc2626;
        }

        .no-products {
          text-align: center;
          padding: 4rem 1rem;
          color: var(--muted);
        }

        .stock {
          font-size: 0.8rem;
          color: var(--muted);
          margin-top: 4px;
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

        /* FILTER BAR */
        .filter-bar { 
          background: var(--pink); 
          border-bottom: 1px solid rgba(0,0,0,0.03);
          margin-bottom: 2.5rem;
        }
        .filter-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem 0;
          gap: 1rem;
        }
        .filter-left { 
          display: flex; 
          gap: 1rem; 
          align-items: center; 
          position: relative;
          flex-wrap: wrap;
        }
        
        /* Filter Dropdown */
        .filter-dropdown {
          position: relative;
          display: inline-block;
        }
        
        .filter-btn { 
          background: white; 
          border: 1px solid #ddd; 
          border-radius: 6px; 
          font-weight: 600; 
          cursor: pointer; 
          padding: 0.5rem 1rem;
          position: relative;
          white-space: nowrap;
        }
        
        .dropdown-menu {
          position: absolute;
          top: 100%;
          left: 0;
          background: white;
          border: 1px solid #ddd;
          border-radius: 6px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          z-index: 1000;
          min-width: 160px;
          margin-top: 4px;
        }
        
        .dropdown-menu button {
          display: block;
          width: 100%;
          padding: 0.75rem 1rem;
          border: none;
          background: none;
          text-align: left;
          cursor: pointer;
          border-bottom: 1px solid #f0f0f0;
          transition: background-color 0.2s;
        }
        
        .dropdown-menu button:hover {
          background-color: #f8f9fa;
        }
        
        .dropdown-menu button.active {
          background-color: var(--pink);
          font-weight: 600;
        }
        
        .dropdown-menu button:last-child {
          border-bottom: none;
        }

        .results { 
          color: var(--muted); 
          font-size: 0.95rem; 
          line-height: 1.4;
        }
        .filter-right { 
          display: flex; 
          align-items: center; 
          gap: 0.75rem; 
          flex-wrap: wrap;
        }
        .show-input, .sort-select { 
          padding: 0.5rem 0.6rem; 
          border-radius: 6px; 
          border: 1px solid rgba(0,0,0,0.08); 
          min-width: 68px; 
        }

        /* PRODUCT GRID */
        .product-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 48px 36px;
          padding: 2.5rem 0;
          justify-items: center;
        }
        .product-card { 
          display: flex; 
          flex-direction: column; 
          align-items: center; 
          gap: 12px; 
          min-height: 360px;
          transition: transform 0.2s ease;
          cursor: pointer;
        }
        .product-card:hover {
          transform: translateY(-5px);
        }
        .image-wrap { 
          width: 100%; 
          display: flex; 
          justify-content: center; 
          align-items: center;
          background: transparent;
          border-radius: 8px;
          padding: 1rem;
        }
        .product-card img { 
          max-width: 220px; 
          height: 160px; 
          object-fit: contain;
        }
        .meta { 
          width: 100%; 
          text-align: center; 
          display: flex; 
          flex-direction: column; 
          gap: 6px; 
        }
        .product-title { 
          font-size: 0.95rem; 
          font-weight: 600; 
          margin: 0; 
          line-height: 1.25;
          height: 2.5em;
          overflow: hidden;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
        }
        .price { font-weight: 700; margin-top: 6px; color: #1f2937; }

        /* PAGINATION */
        .pagination { 
          display: flex; 
          justify-content: center; 
          gap: 12px; 
          padding: 1.25rem 0 3rem; 
          align-items: center;
        }
        .pagination .page {
          background: var(--pag-yellow);
          border: none;
          padding: 12px 18px;
          border-radius: 10px;
          cursor: pointer;
          transition: transform 200ms ease, box-shadow 200ms ease, background 200ms ease;
          font-weight: 600;
        }
        .pagination .page:hover:not(.disabled) { 
          transform: translateY(-3px); 
          box-shadow: 0 10px 24px rgba(15,23,42,0.08); 
        }
        .pagination .page.active { 
          background: var(--pag-active); 
        }
        .pagination .page.disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .pagination .page-ellipsis {
          padding: 12px 8px;
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
          padding: 5rem 1rem;
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
          line-height: 1.5;
        }

        /* Responsive */
        @media (max-width: 1100px) {
          .product-grid { grid-template-columns: repeat(3, 1fr); }
        }
        
        @media (max-width: 820px) {
          .product-grid { 
            grid-template-columns: repeat(2, 1fr); 
            gap: 32px 24px;
          }
          
          .features-inner { 
            flex-direction: column; 
            gap: 2.5rem; 
            padding: 3rem 1rem;
          }
          
          .features .f {
            text-align: center;
            min-width: 100%;
          }
          
          .pagination { flex-wrap: wrap; }
          
          .filter-inner {
            gap: 1rem;
          }
          
          .filter-right {
            justify-content: flex-start;
          }
        }
        
        @media (max-width: 640px) {
          .filter-inner { 
            flex-direction: column; 
            align-items: stretch;
            gap: 1rem;
            padding: 1rem 0;
          }
          
          .filter-left {
            width: 100%;
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          
          .filter-btn {
            width: 100%;
            text-align: center;
          }
          
          .results {
            text-align: center;
            font-size: 0.875rem;
          }
          
          .filter-right {
            width: 100%;
            justify-content: space-between;
            gap: 0.5rem;
          }
          
          .filter-right label {
            font-size: 0.875rem;
          }
          
          .show-input, .sort-select {
            flex: 1;
            min-width: 60px;
            font-size: 0.875rem;
          }
          
          .features-inner {
            padding: 2.5rem 1rem;
            gap: 2rem;
          }
          
          .features h4 {
            font-size: 1.2rem;
          }
          
          .features p {
            font-size: 0.9rem;
          }
        }
        
        @media (max-width: 520px) {
          .product-grid { 
            grid-template-columns: 1fr; 
            gap: 24px;
          }
          
          .hero { min-height: 220px; }
          
          .pagination .page { 
            padding: 10px 14px;
            font-size: 0.9rem;
          }
          
          .product-card {
            min-height: 320px;
          }
          
          .product-card img {
            max-width: 200px;
            height: 140px;
          }
        }
        
        @media (max-width: 400px) {
          .container {
            padding: 0 0.75rem;
          }
          
          .filter-right {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }
          
          .filter-right label {
            margin-bottom: -0.5rem;
          }
          
          .show-input, .sort-select {
            width: 100%;
          }
          
          .pagination {
            gap: 8px;
          }
          
          .pagination .page {
            padding: 8px 12px;
            font-size: 0.85rem;
          }
          
          .features h4 {
            font-size: 1.1rem;
          }
          
          .features p {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </div>
  );
}