import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { FiUser, FiSearch, FiHeart, FiShoppingCart, FiMenu, FiX, FiLogOut, FiFileText } from "react-icons/fi";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const [showSearchBar, setShowSearchBar] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [hoveredLink, setHoveredLink] = useState(null);
  const navigate = useNavigate();
  const searchInputRef = useRef(null);

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      try {
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
  }, []);

  
  useEffect(() => {
    const loadCartCount = () => {
      try {
        const cart = localStorage.getItem('cart');
        if (cart) {
          const cartItems = JSON.parse(cart);
          const totalCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);
          setCartCount(totalCount);
        } else {
          setCartCount(0);
        }
      } catch (error) {
        console.error('Error loading cart count:', error);
        setCartCount(0);
      }
    };

    loadCartCount();

    
    const handleCartUpdate = () => {
      loadCartCount();
    };

    window.addEventListener('cartUpdated', handleCartUpdate);
    window.addEventListener('storage', handleCartUpdate);

    return () => {
      window.removeEventListener('cartUpdated', handleCartUpdate);
      window.removeEventListener('storage', handleCartUpdate);
    };
  }, []);

  
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);

  
  const getUserInitials = (user) => {
    if (!user || !user.username) return 'U';
    
    const names = user.username.trim().split(' ');
    if (names.length === 1) {
      return names[0].charAt(0).toUpperCase();
    }
    return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
  };

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setShowProfileDropdown(!showProfileDropdown);
  };

  const toggleSearchBar = () => {
    setShowSearchBar(!showSearchBar);
    if (showSearchBar) {
      setSearchQuery('');
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?search=${encodeURIComponent(searchQuery.trim())}`);
      setShowSearchBar(false);
      setSearchQuery('');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setShowProfileDropdown(false);
    navigate('/');
  };

  const handleProfileNavigation = (path) => {
    navigate(path);
    setShowProfileDropdown(false);
  };

  const styles = {
    navbar: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '15px 40px',
      background: 'white',
      borderBottom: '1px solid #eee',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      zIndex: 1000,
    },
    leftSpacer: {
      flex: 1,
    },
    mobileMenuToggle: {
      display: 'none',
      cursor: 'pointer',
      zIndex: 1001,
    },
    hamburgerIcon: {
      fontSize: '24px',
      color: '#333',
      strokeWidth: 1.8,
    },
    navLinks: {
      display: 'flex',
      gap: '40px',
      fontSize: '16px',
      fontWeight: 500,
      justifyContent: 'center',
      flex: 1,
    },
    navLinksOpen: {
      position: 'fixed',
      top: 0,
      left: 0,
      width: '280px',
      height: '100vh',
      background: 'white',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      padding: '80px 30px 30px',
      gap: '25px',
      transition: 'left 0.3s ease-in-out',
      boxShadow: '2px 0 10px rgba(0, 0, 0, 0.1)',
      zIndex: 999,
    },
    navLinkWrapper: {
      position: 'relative',
      display: 'inline-block',
    },
    navLink: {
      background: 'none',
      border: 'none',
      textDecoration: 'none',
      color: '#222',
      transition: 'color 0.3s ease',
      padding: '8px 16px',
      cursor: 'pointer',
      fontSize: '16px',
      fontWeight: 500,
      fontFamily: 'inherit',
    },
    navLinkHover: {
      color: '#78350f',
    },
    underline: {
      position: 'absolute',
      bottom: '4px',
      left: '16px',
      right: '16px',
      height: '2px',
      backgroundColor: '#78350f',
      transformOrigin: 'center',
      transition: 'transform 0.3s ease',
    },
    navIcons: {
      display: 'flex',
      gap: '22px',
      fontSize: '20px',
      flex: 1,
      justifyContent: 'flex-end',
      alignItems: 'center',
      position: 'relative',
    },
    navIcon: {
      cursor: 'pointer',
      color: '#333',
      strokeWidth: 1.8,
      transition: 'color 0.3s',
    },
    navIconHover: {
      color: '#78350f',
    },
    cartIconContainer: {
      position: 'relative',
      cursor: 'pointer',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartBadge: {
      position: 'absolute',
      top: '-8px',
      right: '-10px',
      backgroundColor: '#dc2626',
      color: 'white',
      borderRadius: '50%',
      width: '20px',
      height: '20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '700',
      border: '2px solid white',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
    },
    searchContainer: {
      position: 'absolute',
      right: '140px',
      top: '50%',
      transform: 'translateY(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      backgroundColor: 'white',
      borderRadius: '25px',
      padding: '8px 16px',
      boxShadow: '0 2px 12px rgba(0, 0, 0, 0.15)',
      border: '2px solid #333',
      zIndex: 1002,
      width: showSearchBar ? '320px' : '0',
      opacity: showSearchBar ? 1 : 0,
      visibility: showSearchBar ? 'visible' : 'hidden',
      overflow: 'hidden',
      transition: 'width 0.3s ease, opacity 0.3s ease, visibility 0.3s ease',
    },
    searchForm: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      width: '100%',
    },
    searchInput: {
      flex: 1,
      border: 'none',
      outline: 'none',
      fontSize: '15px',
      padding: '6px 0',
      backgroundColor: 'transparent',
    },
    searchButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#333',
      display: 'flex',
      alignItems: 'center',
      padding: '4px',
      transition: 'color 0.2s',
    },
    closeSearchButton: {
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      color: '#666',
      display: 'flex',
      alignItems: 'center',
      padding: '4px',
      transition: 'color 0.2s',
    },
    profileContainer: {
      position: 'relative',
    },
    profileIcon: {
      width: '36px',
      height: '36px',
      borderRadius: '50%',
      backgroundColor: '#333',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: '2px solid transparent',
    },
    profileIconHover: {
      backgroundColor: '#555',
      transform: 'translateY(-1px)',
      borderColor: '#ddd',
    },
    dropdown: {
      position: 'absolute',
      top: '100%',
      right: '0',
      marginTop: '8px',
      backgroundColor: 'white',
      borderRadius: '8px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
      border: '1px solid #e5e7eb',
      minWidth: '200px',
      zIndex: 1001,
      opacity: showProfileDropdown ? 1 : 0,
      visibility: showProfileDropdown ? 'visible' : 'hidden',
      transform: showProfileDropdown ? 'translateY(0)' : 'translateY(-10px)',
      transition: 'all 0.2s ease',
    },
    dropdownHeader: {
      padding: '12px 16px',
      borderBottom: '1px solid #f3f4f6',
      backgroundColor: '#f9fafb',
      borderRadius: '8px 8px 0 0',
    },
    dropdownName: {
      fontWeight: '600',
      fontSize: '14px',
      color: '#111827',
      margin: '0 0 4px 0',
    },
    dropdownEmail: {
      fontSize: '12px',
      color: '#6b7280',
      margin: 0,
    },
    dropdownItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 16px',
      fontSize: '14px',
      color: '#374151',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      border: 'none',
      background: 'none',
      width: '100%',
      textAlign: 'left',
    },
    dropdownItemHover: {
      backgroundColor: '#f3f4f6',
      color: '#111827',
    },
    logoutItem: {
      color: '#dc2626',
      borderTop: '1px solid #f3f4f6',
    },
  };

  const mobileStyles = `
    @keyframes cartPulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.15); }
    }

    .cart-badge-animated {
      animation: cartPulse 0.3s ease-in-out;
    }

    @media (max-width: 1024px) {
      .navbar {
        padding: 15px 30px;
      }
      .nav-links {
        gap: 30px;
      }
      .nav-icons {
        gap: 18px;
      }
    }

    @media (max-width: 768px) {
      .navbar {
        padding: 15px 20px !important;
        flex-wrap: nowrap !important;
        position: relative;
      }
      .left-spacer {
        display: none;
      }
      .mobile-menu-toggle {
        display: block !important;
        order: 1;
        flex-shrink: 0;
      }
      .nav-links {
        position: fixed;
        top: 0;
        left: ${isMobileMenuOpen ? '0' : '-100%'};
        width: 280px;
        height: 100vh;
        background: white;
        flex-direction: column;
        justify-content: flex-start;
        align-items: flex-start;
        padding: 80px 30px 30px;
        gap: 25px;
        transition: left 0.3s ease-in-out;
        box-shadow: 2px 0 10px rgba(0, 0, 0, 0.1);
        z-index: 999;
      }
      .nav-link-wrapper {
        width: 100%;
      }
      .nav-link {
        font-size: 18px;
        font-weight: 600;
        color: #333;
        padding: 12px 0;
        border-bottom: 1px solid #f0f0f0;
        width: 100%;
        text-align: left;
        transition: color 0.3s, background-color 0.3s, padding-left 0.3s;
      }
      .nav-link:hover {
        color: #78350f;
        background-color: #f5f5f4;
        padding-left: 10px;
      }
      .underline {
        display: none;
      }
      .nav-icons {
        order: 2;
        flex: none;
        gap: 14px;
        flex-shrink: 0;
        position: relative;
      }
      .nav-icon {
        font-size: 20px;
      }
      .profile-icon {
        width: 32px !important;
        height: 32px !important;
        font-size: 13px !important;
      }
      
      /* Mobile Search Bar - Full Width Below Navbar */
      .search-container {
        position: fixed !important;
        top: 60px !important;
        left: 0 !important;
        right: 0 !important;
        width: 100% !important;
        max-width: 100% !important;
        transform: none !important;
        border-radius: 0 !important;
        border: none !important;
        border-bottom: 2px solid #333 !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1) !important;
        padding: 12px 20px !important;
        z-index: 998 !important;
        height: ${showSearchBar ? '56px' : '0'} !important;
        opacity: ${showSearchBar ? '1' : '0'} !important;
        visibility: ${showSearchBar ? 'visible' : 'hidden'} !important;
        transition: height 0.3s ease, opacity 0.3s ease, visibility 0.3s ease !important;
      }
      
      .cart-badge {
        width: 17px !important;
        height: 17px !important;
        font-size: 9px !important;
        top: -6px !important;
        right: -8px !important;
      }
    }

    @media (max-width: 480px) {
      .navbar {
        padding: 12px 16px !important;
      }
      .nav-icons {
        gap: 12px;
      }
      .nav-icon {
        font-size: 19px;
      }
      .nav-links {
        width: 260px;
        padding: 70px 25px 25px;
      }
      .nav-link {
        font-size: 16px;
        padding: 10px 0;
      }
      .profile-icon {
        width: 30px !important;
        height: 30px !important;
        font-size: 12px !important;
      }
      .dropdown {
        right: -10px;
        min-width: 180px;
      }
      
      /* Adjust search bar for smaller screens */
      .search-container {
        padding: 10px 16px !important;
        top: 55px !important;
        height: ${showSearchBar ? '52px' : '0'} !important;
      }
      
      .search-input {
        font-size: 14px !important;
      }
      
      .cart-badge {
        width: 16px !important;
        height: 16px !important;
        font-size: 9px !important;
        top: -5px !important;
        right: -7px !important;
      }
    }

    @media (max-width: 360px) {
      .navbar {
        padding: 10px 12px !important;
      }
      .nav-icons {
        gap: 10px;
      }
      .nav-icon {
        font-size: 18px;
      }
      .profile-icon {
        width: 28px !important;
        height: 28px !important;
        font-size: 11px !important;
      }
      .search-container {
        padding: 8px 12px !important;
      }
    }

    .dropdown-item:hover {
      background-color: #f3f4f6;
      color: #111827;
    }

    .logout-item:hover {
      background-color: #fef2f2;
      color: #dc2626;
    }

    .search-button:hover {
      color: #555;
    }

    .close-search-button:hover {
      color: #333;
    }
  `;

  return (
    <>
      <style>{mobileStyles}</style>
      <nav className="navbar" style={styles.navbar}>
        {/* Left spacer for desktop */}
        <div className="left-spacer" style={styles.leftSpacer}></div>

        {/* Mobile hamburger menu */}
        <div 
          className="mobile-menu-toggle" 
          style={styles.mobileMenuToggle}
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <FiX className="hamburger-icon" style={styles.hamburgerIcon} />
          ) : (
            <FiMenu className="hamburger-icon" style={styles.hamburgerIcon} />
          )}
        </div>

        {/* Navigation links */}
        <div 
          className={`nav-links ${isMobileMenuOpen ? 'nav-links-open' : ''}`}
          style={isMobileMenuOpen ? {...styles.navLinks, ...styles.navLinksOpen} : styles.navLinks}
        >
          <div className="nav-link-wrapper" style={styles.navLinkWrapper}>
            <button 
              className="nav-link" 
              style={styles.navLink}
              onClick={() => handleNavigation('/')}
              onMouseEnter={() => {
                setHoveredLink('home');
              }}
              onMouseLeave={() => {
                setHoveredLink(null);
              }}
            >
              Home
            </button>
            <div 
              className="underline"
              style={{
                ...styles.underline,
                transform: hoveredLink === 'home' ? 'scaleX(1)' : 'scaleX(0)'
              }}
            />
          </div>
          
          <div className="nav-link-wrapper" style={styles.navLinkWrapper}>
            <button 
              className="nav-link" 
              style={styles.navLink}
              onClick={() => handleNavigation('/shop')}
              onMouseEnter={() => {
                setHoveredLink('shop');
              }}
              onMouseLeave={() => {
                setHoveredLink(null);
              }}
            >
              Shop
            </button>
            <div 
              className="underline"
              style={{
                ...styles.underline,
                transform: hoveredLink === 'shop' ? 'scaleX(1)' : 'scaleX(0)'
              }}
            />
          </div>
          
          <div className="nav-link-wrapper" style={styles.navLinkWrapper}>
            <button 
              className="nav-link" 
              style={styles.navLink}
              onClick={() => handleNavigation('/aboutus')}
              onMouseEnter={() => {
                setHoveredLink('about');
              }}
              onMouseLeave={() => {
                setHoveredLink(null);
              }}
            >
              About
            </button>
            <div 
              className="underline"
              style={{
                ...styles.underline,
                transform: hoveredLink === 'about' ? 'scaleX(1)' : 'scaleX(0)'
              }}
            />
          </div>
          
          <div className="nav-link-wrapper" style={styles.navLinkWrapper}>
            <button 
              className="nav-link" 
              style={styles.navLink}
              onClick={() => handleNavigation('/contact')}
              onMouseEnter={() => {
                setHoveredLink('contact');
              }}
              onMouseLeave={() => {
                setHoveredLink(null);
              }}
            >
              Contact
            </button>
            <div 
              className="underline"
              style={{
                ...styles.underline,
                transform: hoveredLink === 'contact' ? 'scaleX(1)' : 'scaleX(0)'
              }}
            />
          </div>
        </div>

        {/* Right side icons */}
        <div className="nav-icons" style={styles.navIcons}>
          {/* Animated Search Container - Inline for desktop, below for mobile */}
          <div className="search-container" style={styles.searchContainer}>
            <div style={styles.searchForm}>
              <input
                ref={searchInputRef}
                type="text"
                className="search-input"
                style={styles.searchInput}
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch(e);
                  }
                }}
              />
              <button 
                type="button"
                className="search-button"
                style={styles.searchButton}
                onClick={handleSearch}
              >
                <FiSearch size={18} />
              </button>
              <button 
                type="button"
                className="close-search-button"
                style={styles.closeSearchButton}
                onClick={toggleSearchBar}
              >
                <FiX size={18} />
              </button>
            </div>
          </div>

          {/* Profile Icon */}
          <div className="profile-container" style={styles.profileContainer}>
            {user ? (
              <>
                <div 
                  className="profile-icon"
                  style={styles.profileIcon}
                  onClick={toggleProfileDropdown}
                  onMouseEnter={(e) => {
                    Object.assign(e.target.style, styles.profileIconHover);
                  }}
                  onMouseLeave={(e) => {
                    Object.assign(e.target.style, styles.profileIcon);
                  }}
                >
                  {getUserInitials(user)}
                </div>
                
                {/* Profile Dropdown */}
                <div className="dropdown" style={styles.dropdown}>
                  <div style={styles.dropdownHeader}>
                    <p style={styles.dropdownName}>{user.username}</p>
                    <p style={styles.dropdownEmail}>{user.email}</p>
                  </div>
                  
                  <button 
                    className="dropdown-item"
                    style={styles.dropdownItem}
                    onClick={() => handleProfileNavigation('/profile')}
                    onMouseEnter={(e) => {
                      Object.assign(e.target.style, {...styles.dropdownItem, ...styles.dropdownItemHover});
                    }}
                    onMouseLeave={(e) => {
                      Object.assign(e.target.style, styles.dropdownItem);
                    }}
                  >
                    <FiUser size={16} />
                    My Account
                  </button>
                  
                  <button 
                    className="dropdown-item"
                    style={styles.dropdownItem}
                    onClick={() => handleProfileNavigation('/my-orders')}
                    onMouseEnter={(e) => {
                      Object.assign(e.target.style, {...styles.dropdownItem, ...styles.dropdownItemHover});
                    }}
                    onMouseLeave={(e) => {
                      Object.assign(e.target.style, styles.dropdownItem);
                    }}
                  >
                    <FiShoppingCart size={16} />
                    My Orders
                  </button>

                  <button 
                    className="dropdown-item"
                    style={styles.dropdownItem}
                    onClick={() => handleProfileNavigation('/blog')}
                    onMouseEnter={(e) => {
                      Object.assign(e.target.style, {...styles.dropdownItem, ...styles.dropdownItemHover});
                    }}
                    onMouseLeave={(e) => {
                      Object.assign(e.target.style, styles.dropdownItem);
                    }}
                  >
                    <FiFileText size={16} />
                    Blogs
                  </button>
                  
                  <button 
                    className="dropdown-item logout-item"
                    style={{...styles.dropdownItem, ...styles.logoutItem}}
                    onClick={handleLogout}
                    onMouseEnter={(e) => {
                      e.target.style.backgroundColor = '#fef2f2';
                      e.target.style.color = '#dc2626';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.backgroundColor = 'transparent';
                      e.target.style.color = '#dc2626';
                    }}
                  >
                    <FiLogOut size={16} />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <FiUser 
                className="nav-icon" 
                style={styles.navIcon}
                onClick={() => handleNavigation('/profile')}
              />
            )}
          </div>

          {/* Search Icon - only visible when search bar is closed */}
          {!showSearchBar && (
            <FiSearch 
              className="nav-icon" 
              style={styles.navIcon}
              onClick={toggleSearchBar}
            />
          )}

          <FiHeart 
            className="nav-icon" 
            style={styles.navIcon}
            onClick={() => handleNavigation('/wishlist')}
          />

          {/* Shopping Cart with Counter */}
          <div 
            className="cart-icon-container"
            style={styles.cartIconContainer}
            onClick={() => handleNavigation('/cart')}
          >
            <FiShoppingCart 
              className="nav-icon" 
              style={styles.navIcon}
            />
            {cartCount > 0 && (
              <span className="cart-badge cart-badge-animated" style={styles.cartBadge}>
                {cartCount > 99 ? '99+' : cartCount}
              </span>
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Navbar;