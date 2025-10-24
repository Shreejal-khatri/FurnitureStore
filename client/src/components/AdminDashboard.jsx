import React, { useState, useEffect } from "react";
import {
  FiBox,
  FiUsers,
  FiBarChart2,
  FiSettings,
  FiShoppingCart,
  FiTrendingUp,
  FiTrendingDown,
  FiDollarSign,
  FiPackage,
  FiCheckCircle,
  FiClock,
  FiAlertCircle,
  FiMenu,
  FiX,
  FiLogOut,
  FiMail,
  FiSearch,
  FiRefreshCw,
  FiFileText,
} from "react-icons/fi";

import { useNavigate } from "react-router-dom";
import ProductManagement from "../components/ProductManagement";
import UserManagement from "../components/UserManagement";
import OrderManagement from "../components/OrderManagement";
import BlogManagement from "../components/BlogManagement";
import MessageManagement from "../components/MessageManagement";
import AdminSettings from "../components/AdminSettings";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  const API_BASE_URL = import.meta.env?.VITE_API_URL;

  
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  useEffect(() => {
    const adminToken = localStorage.getItem("adminToken");
    
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }

    if (activeTab === "overview") {
      fetchDashboardData();
    }
  }, [navigate, activeTab]);

 
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobile && sidebarOpen) {
        const sidebar = document.querySelector('[data-sidebar]');
        const menuButton = document.querySelector('[data-menu-button]');
        if (sidebar && !sidebar.contains(event.target) && 
            menuButton && !menuButton.contains(event.target)) {
          setSidebarOpen(false);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarOpen, isMobile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("adminToken");
      
      const statsResponse = await fetch(`${API_BASE_URL}/admin/dashboard/stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!statsResponse.ok) {
        if (statsResponse.status === 401) {
          localStorage.removeItem("adminToken");
          navigate("/admin/login");
          return;
        }
        throw new Error('Failed to fetch dashboard stats');
      }

      const statsData = await statsResponse.json();

      const ordersResponse = await fetch(`${API_BASE_URL}/admin/orders?limit=5`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!ordersResponse.ok) {
        throw new Error('Failed to fetch recent orders');
      }

      const ordersData = await ordersResponse.json();

      const revenueResponse = await fetch(`${API_BASE_URL}/admin/analytics/revenue?period=7d`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const revenueData = revenueResponse.ok ? await revenueResponse.json() : null;

      const limitedOrders = ordersData.orders ? ordersData.orders.slice(0, 5) : [];

      setDashboardData({
        stats: statsData,
        recentOrders: limitedOrders,
        revenueData: revenueData
      });
      setError(null);
    } catch (err) {
      console.error('Dashboard data fetch error:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    if (!searchQuery.trim()) {
      setSearchResults(null);
      return;
    }

    performClientSearch(searchQuery);
  };

  const performClientSearch = (query) => {
    const results = {
      orders: [],
      products: [],
      users: [],
      sections: [],
      total: 0
    };

    const lowerQuery = query.toLowerCase();

    const sectionKeywords = {
      'dashboard': ['dashboard', 'overview', 'home', 'stats', 'analytics'],
      'products': ['product', 'products', 'inventory', 'items', 'catalog'],
      'users': ['user', 'users', 'customers', 'accounts', 'members'],
      'orders': ['order', 'orders', 'purchase', 'purchases', 'transactions', 'sales'],
      'blogs': ['blog', 'blogs', 'post', 'posts', 'articles', 'content'],
      'messages': ['message', 'messages', 'contact', 'inbox', 'mail'],
      'settings': ['setting', 'settings', 'config', 'configuration', 'preferences']
    };

    Object.entries(sectionKeywords).forEach(([section, keywords]) => {
      if (keywords.some(keyword => keyword.includes(lowerQuery) || lowerQuery.includes(keyword))) {
        const navItem = navItems.find(item => item.id === section);
        if (navItem) {
          results.sections.push({
            id: navItem.id,
            title: navItem.title,
            description: navItem.description,
            icon: navItem.icon
          });
        }
      }
    });

    if (dashboardData?.recentOrders) {
      results.orders = dashboardData.recentOrders.filter(order => 
        order.orderNumber?.toLowerCase().includes(lowerQuery) ||
        order.shippingAddress?.firstName?.toLowerCase().includes(lowerQuery) ||
        order.shippingAddress?.lastName?.toLowerCase().includes(lowerQuery) ||
        order.shippingAddress?.email?.toLowerCase().includes(lowerQuery)
      );
    }

    results.total = results.sections.length + results.orders.length + results.products.length + results.users.length;
    setSearchResults(results);
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchResults(null);
  };

  const handleNavItemClick = (tabId) => {
    setActiveTab(tabId);
    if (isMobile) {
      setSidebarOpen(false);
    }
  };

  const navItems = [
    {
      id: "overview",
      title: "Dashboard",
      icon: <FiBarChart2 size={20} />,
      description: "Overview & Analytics",
    },
    {
      id: "products",
      title: "Products",
      icon: <FiBox size={20} />,
      description: "Manage inventory",
    },
    {
      id: "users",
      title: "Users",
      icon: <FiUsers size={20} />,
      description: "User management",
    },
    {
      id: "orders",
      title: "Orders",
      icon: <FiShoppingCart size={20} />,
      description: "Order tracking",
    },
    {
      id: "blogs",
      title: "Blogs",
      icon: <FiFileText size={20} />,
      description: "Manage blog posts",
    },
    {
      id: "messages",
      title: "Messages",
      icon: <FiMail size={20} />,
      description: "Contact messages",
    },
    {
      id: "settings",
      title: "Settings",
      icon: <FiSettings size={20} />,
      description: "System config",
    },
  ];

  const getStatusStyle = (status) => {
    const styles = {
      completed: { bg: "#ecfdf5", color: "#10b981", text: "Completed" },
      processing: { bg: "#eff6ff", color: "#3b82f6", text: "Processing" },
      pending: { bg: "#fef3c7", color: "#f59e0b", text: "Pending" },
      shipped: { bg: "#eff6ff", color: "#3b82f6", text: "Shipped" },
      delivered: { bg: "#ecfdf5", color: "#10b981", text: "Delivered" },
      cancelled: { bg: "#fef2f2", color: "#ef4444", text: "Cancelled" },
    };
    return styles[status] || styles.pending;
  };

  const formatCurrency = (amount) => {
    return `Rs ${amount.toLocaleString('en-NP', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins} mins ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  const BarChart = ({ data, height = 280 }) => {
    if (!data || !data.weeklyData || data.weeklyData.length === 0) {
      return (
        <div style={styles.noData}>
          <FiBarChart2 size={32} color="#d1d5db" />
          <p>No revenue data available</p>
        </div>
      );
    }

    const values = data.weeklyData.map(item => item.revenue);
    const maxValue = Math.max(...values);

    return (
      <div style={{ ...styles.chartPlaceholder, height }}>
        <div style={styles.chartBars}>
          {data.weeklyData.map((day, i) => (
            <div key={i} style={styles.barContainer}>
              <div style={{
                ...styles.bar,
                height: `${(day.revenue / maxValue) * 80}%`,
                backgroundColor: i === data.weeklyData.length - 1 ? "#8B4513" : "#A0522D",
              }} />
              <div style={styles.barLabel}>{day.day}</div>
              <div style={styles.barValue}>{formatCurrency(day.revenue)}</div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (loading && activeTab === "overview") {
    return (
      <div style={styles.dashboard}>
        <div style={styles.loadingContainer}>
          <div style={styles.loadingSpinner}></div>
          <p style={styles.loadingText}>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.dashboard}>
      {/* Top Header */}
      <header style={{
        ...styles.header,
        ...(isMobile ? styles.headerMobile : {})
      }}>
        <div style={styles.headerLeft}>
          <button 
            data-menu-button
            style={styles.menuButton}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <FiX size={20} /> : <FiMenu size={20} />}
          </button>
          <h1 style={styles.logo}>AdminPro</h1>
        </div>

        <div style={{
          ...styles.headerCenter,
          ...(isMobile ? styles.headerCenterMobile : {})
        }}>
          <form onSubmit={handleSearch} style={styles.searchBar}>
            <FiSearch style={styles.searchIcon} />
            <input 
              type="text" 
              placeholder="Search orders, products, users..." 
              style={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                type="button"
                onClick={clearSearch}
                style={styles.clearSearchButton}
              >
                <FiX size={16} />
              </button>
            )}
          </form>
          
          {searchResults && (
            <div style={styles.searchDropdown}>
              <div style={styles.searchDropdownHeader}>
                <span>Found {searchResults.total} results</span>
                <button onClick={clearSearch} style={styles.closeSearchButton}>
                  <FiX size={16} />
                </button>
              </div>
              
              {searchResults.sections && searchResults.sections.length > 0 && (
                <div style={styles.searchSection}>
                  <div style={styles.searchSectionTitle}>
                    <FiSearch size={14} />
                    Sections ({searchResults.sections.length})
                  </div>
                  {searchResults.sections.map((section) => (
                    <div 
                      key={section.id} 
                      style={styles.searchResultItem}
                      onClick={() => {
                        handleNavItemClick(section.id);
                        clearSearch();
                      }}
                    >
                      <div style={styles.searchResultInfo}>
                        <div style={styles.searchResultTitle}>
                          <span style={styles.sectionIcon}>{section.icon}</span>
                          {section.title}
                        </div>
                        <div style={styles.searchResultMeta}>{section.description}</div>
                      </div>
                      <FiTrendingUp size={16} color="#8B4513" />
                    </div>
                  ))}
                </div>
              )}

              {searchResults.orders && searchResults.orders.length > 0 && (
                <div style={styles.searchSection}>
                  <div style={styles.searchSectionTitle}>
                    <FiShoppingCart size={14} />
                    Orders ({searchResults.orders.length})
                  </div>
                  {searchResults.orders.map((order) => (
                    <div 
                      key={order._id} 
                      style={styles.searchResultItem}
                      onClick={() => {
                        handleNavItemClick('orders');
                        clearSearch();
                      }}
                    >
                      <div style={styles.searchResultInfo}>
                        <div style={styles.searchResultTitle}>
                          {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                        </div>
                        <div style={styles.searchResultMeta}>
                          Order #{order.orderNumber} • {formatCurrency(order.total)}
                        </div>
                      </div>
                      <div style={{
                        ...styles.orderStatus,
                        backgroundColor: getStatusStyle(order.orderStatus).bg,
                        color: getStatusStyle(order.orderStatus).color,
                      }}>
                        {getStatusStyle(order.orderStatus).text}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {searchResults.total === 0 && (
                <div style={styles.noSearchResults}>
                  <FiSearch size={24} color="#d1d5db" />
                  <p>No results found for "{searchQuery}"</p>
                </div>
              )}
            </div>
          )}
        </div>

        <div style={{
          ...styles.headerRight,
          ...(isMobile ? styles.headerRightMobile : {})
        }}>
          <div style={styles.userMenu}>
            <div style={styles.userAvatar}>AD</div>
            {!isMobile && (
              <div style={styles.userDetails}>
                <div style={styles.userName}>Admin User</div>
                <div style={styles.userRole}>Administrator</div>
              </div>
            )}
          </div>
          <button style={styles.logoutButton} onClick={handleLogout}>
            <FiLogOut size={18} />
          </button>
        </div>
      </header>

      <div style={styles.mainLayout}>
        {/* Mobile Sidebar Overlay */}
        {isMobile && sidebarOpen && (
          <div 
            style={styles.mobileOverlay}
            onClick={() => setSidebarOpen(false)}
          />
        )}

        {/* Left Sidebar */}
        <aside 
          data-sidebar
          style={{
            ...styles.sidebar,
            ...(isMobile ? styles.sidebarMobile : {}),
            transform: isMobile 
              ? (sidebarOpen ? 'translateX(0)' : 'translateX(-100%)')
              : 'translateX(0)',
          }}
        >
          <nav style={styles.sidebarNav}>
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavItemClick(item.id)}
                style={{
                  ...styles.navItem,
                  ...(activeTab === item.id ? styles.navItemActive : {}),
                }}
              >
                <div style={{
                  ...styles.navIcon,
                  color: activeTab === item.id ? "#8B4513" : "#6b7280"
                }}>
                  {item.icon}
                </div>
                <div style={styles.navText}>
                  <div style={{
                    ...styles.navTitle,
                    color: activeTab === item.id ? "#8B4513" : "#374151"
                  }}>
                    {item.title}
                  </div>
                  <div style={styles.navDescription}>{item.description}</div>
                </div>
                {activeTab === item.id && <div style={styles.activeIndicator} />}
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content Area */}
        <main style={{
          ...styles.mainContent,
          ...(isMobile ? styles.mainContentMobile : {})
        }}>
          {activeTab === "overview" && (
            <div style={styles.overviewContent}>
              <div style={{
                ...styles.contentHeader,
                ...(isMobile ? styles.contentHeaderMobile : {})
              }}>
                <div>
                  <h2 style={styles.pageTitle}>Dashboard Overview</h2>
                  <p style={styles.pageSubtitle}>Welcome back! Here's what's happening today.</p>
                </div>
                <div style={styles.headerActions}>
                  {error && (
                    <span style={styles.errorText}>{error}</span>
                  )}
                  <button 
                    style={styles.refreshButton}
                    onClick={fetchDashboardData}
                    disabled={loading}
                  >
                    <FiRefreshCw size={16} style={loading ? styles.spinning : {}} />
                    <span>Refresh</span>
                  </button>
                </div>
              </div>

              {error && !dashboardData ? (
                <div style={styles.errorContainer}>
                  <FiAlertCircle size={48} color="#ef4444" />
                  <h3>Failed to load data</h3>
                  <p>{error}</p>
                  <button style={styles.retryButton} onClick={fetchDashboardData}>
                    Try Again
                  </button>
                </div>
              ) : (
                <>
                  {/* Stats Cards */}
                  <div style={{
                    ...styles.statsGrid,
                    ...(isMobile ? styles.statsGridMobile : {})
                  }}>
                    {dashboardData?.stats ? (
                      <>
                        <div style={styles.statCard}>
                          <div style={styles.statCardHeader}>
                            <div style={styles.statIconBox}>
                              <FiDollarSign size={24} color="#10b981" />
                            </div>
                            <div style={styles.statChange}>
                              {dashboardData.stats.revenueChange >= 0 ? (
                                <FiTrendingUp size={14} />
                              ) : (
                                <FiTrendingDown size={14} />
                              )}
                              <span>{dashboardData.stats.revenueChange}%</span>
                            </div>
                          </div>
                          <div style={styles.statValue}>
                            {formatCurrency(dashboardData.stats.totalRevenue)}
                          </div>
                          <div style={styles.statLabel}>Total Revenue</div>
                        </div>

                        <div style={styles.statCard}>
                          <div style={styles.statCardHeader}>
                            <div style={styles.statIconBox}>
                              <FiShoppingCart size={24} color="#3b82f6" />
                            </div>
                            <div style={styles.statChange}>
                              {dashboardData.stats.ordersChange >= 0 ? (
                                <FiTrendingUp size={14} />
                              ) : (
                                <FiTrendingDown size={14} />
                              )}
                              <span>{dashboardData.stats.ordersChange}%</span>
                            </div>
                          </div>
                          <div style={styles.statValue}>{dashboardData.stats.totalOrders}</div>
                          <div style={styles.statLabel}>Total Orders</div>
                        </div>

                        <div style={styles.statCard}>
                          <div style={styles.statCardHeader}>
                            <div style={styles.statIconBox}>
                              <FiUsers size={24} color="#8b5cf6" />
                            </div>
                            <div style={styles.statChange}>
                              {dashboardData.stats.usersChange >= 0 ? (
                                <FiTrendingUp size={14} />
                              ) : (
                                <FiTrendingDown size={14} />
                              )}
                              <span>{dashboardData.stats.usersChange}%</span>
                            </div>
                          </div>
                          <div style={styles.statValue}>{dashboardData.stats.activeUsers}</div>
                          <div style={styles.statLabel}>Active Users</div>
                        </div>

                        <div style={styles.statCard}>
                          <div style={styles.statCardHeader}>
                            <div style={styles.statIconBox}>
                              <FiPackage size={24} color="#f59e0b" />
                            </div>
                            <div style={styles.statChange}>
                              {dashboardData.stats.productsChange >= 0 ? (
                                <FiTrendingUp size={14} />
                              ) : (
                                <FiTrendingDown size={14} />
                              )}
                              <span>{dashboardData.stats.productsChange}%</span>
                            </div>
                          </div>
                          <div style={styles.statValue}>{dashboardData.stats.totalProducts}</div>
                          <div style={styles.statLabel}>Total Products</div>
                        </div>
                      </>
                    ) : (
                      [...Array(4)].map((_, index) => (
                        <div key={index} style={styles.statCard}>
                          <div style={styles.statCardHeader}>
                            <div style={styles.statIconBox}></div>
                            <div style={styles.statChange}></div>
                          </div>
                          <div style={styles.statValue}></div>
                          <div style={styles.statLabel}></div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Charts and Activity Row */}
                  <div style={{
                    ...styles.chartsRow,
                    ...(isMobile ? styles.chartsRowMobile : {})
                  }}>
                    {/* Revenue Chart */}
                    <div style={styles.chartCard}>
                      <div style={styles.chartHeader}>
                        <div>
                          <h3 style={styles.chartTitle}>Revenue Overview</h3>
                          <p style={styles.chartSubtitle}>Weekly revenue performance</p>
                        </div>
                        <select style={styles.chartSelect}>
                          <option>Last 7 days</option>
                          <option>Last 30 days</option>
                          <option>Last 3 months</option>
                        </select>
                      </div>
                      <BarChart data={dashboardData?.revenueData} />
                    </div>

                    {/* Recent Orders */}
                    <div style={styles.ordersCard}>
                      <div style={styles.chartHeader}>
                        <div>
                          <h3 style={styles.chartTitle}>Recent Orders</h3>
                          <p style={styles.chartSubtitle}>Latest 5 customer transactions</p>
                        </div>
                        <button 
                          style={styles.viewAllButton}
                          onClick={() => handleNavItemClick('orders')}
                        >
                          View All
                        </button>
                      </div>
                      <div style={styles.ordersList}>
                        {dashboardData?.recentOrders && dashboardData.recentOrders.length > 0 ? (
                          dashboardData.recentOrders.map((order, index) => (
                            <div key={order._id || index} style={{
                              ...styles.orderItem,
                              ...(isMobile ? styles.orderItemMobile : {})
                            }}>
                              <div style={styles.orderInfo}>
                                <div style={styles.orderIcon}>
                                  <FiShoppingCart size={16} />
                                </div>
                                <div>
                                  <div style={styles.orderCustomer}>
                                    {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
                                  </div>
                                  <div style={styles.orderId}>#{order.orderNumber}</div>
                                </div>
                              </div>
                              <div style={{
                                ...styles.orderRight,
                                ...(isMobile ? styles.orderRightMobile : {})
                              }}>
                                <div style={styles.orderAmount}>
                                  {formatCurrency(order.total)}
                                </div>
                                <div style={{
                                  ...styles.orderStatus,
                                  backgroundColor: getStatusStyle(order.orderStatus).bg,
                                  color: getStatusStyle(order.orderStatus).color,
                                }}>
                                  {getStatusStyle(order.orderStatus).text}
                                </div>
                                <div style={styles.orderTime}>
                                  {formatDate(order.createdAt)}
                                </div>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div style={styles.noData}>
                            <FiShoppingCart size={24} color="#d1d5db" />
                            <p>No recent orders</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Metrics */}
                  {dashboardData?.stats?.orderMetrics && (
                    <div style={{
                      ...styles.metricsRow,
                      ...(isMobile ? styles.metricsRowMobile : {})
                    }}>
                      <div style={styles.metricCard}>
                        <div style={styles.metricHeader}>
                          <FiCheckCircle size={20} color="#10b981" />
                          <span style={styles.metricTitle}>Completed Orders</span>
                        </div>
                        <div style={styles.metricValue}>
                          {dashboardData.stats.orderMetrics.completed}
                        </div>
                        <div style={styles.metricProgress}>
                          <div style={{
                            ...styles.progressBar, 
                            width: `${(dashboardData.stats.orderMetrics.completed / dashboardData.stats.totalOrders) * 100}%`,
                            backgroundColor: '#10b981'
                          }} />
                        </div>
                      </div>

                      <div style={styles.metricCard}>
                        <div style={styles.metricHeader}>
                          <FiClock size={20} color="#f59e0b" />
                          <span style={styles.metricTitle}>Pending Orders</span>
                        </div>
                        <div style={styles.metricValue}>
                          {dashboardData.stats.orderMetrics.pending}
                        </div>
                        <div style={styles.metricProgress}>
                          <div style={{
                            ...styles.progressBar, 
                            width: `${(dashboardData.stats.orderMetrics.pending / dashboardData.stats.totalOrders) * 100}%`,
                            backgroundColor: '#f59e0b'
                          }} />
                        </div>
                      </div>

                      <div style={styles.metricCard}>
                        <div style={styles.metricHeader}>
                          <FiAlertCircle size={20} color="#ef4444" />
                          <span style={styles.metricTitle}>Cancelled Orders</span>
                        </div>
                        <div style={styles.metricValue}>
                          {dashboardData.stats.orderMetrics.cancelled}
                        </div>
                        <div style={styles.metricProgress}>
                          <div style={{
                            ...styles.progressBar, 
                            width: `${(dashboardData.stats.orderMetrics.cancelled / dashboardData.stats.totalOrders) * 100}%`,
                            backgroundColor: '#ef4444'
                          }} />
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}

          {activeTab !== "overview" && (
            <div style={styles.moduleWrapper}>
              <div style={styles.contentHeader}>
                <div>
                  <h2 style={styles.pageTitle}>
                    {navItems.find(item => item.id === activeTab)?.title}
                  </h2>
                  <p style={styles.pageSubtitle}>
                    {navItems.find(item => item.id === activeTab)?.description}
                  </p>
                </div>
              </div>
              <div style={styles.moduleContent}>
                {activeTab === "products" && <ProductManagement />}
                {activeTab === "users" && <UserManagement />}
                {activeTab === "orders" && <OrderManagement />}
                {activeTab === "blogs" && <BlogManagement/>}
                {activeTab === "messages" && <MessageManagement/>}
                {activeTab === "settings" && <AdminSettings/>}
              </div>
            </div>
          )}
        </main>
      </div>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .spinning {
          animation: spin 1s linear infinite;
        }
      `}</style>
    </div>
  );
}

const styles = {
  dashboard: {
    padding: '16px',
    backgroundColor: '#fefefe',
    minHeight: '100vh',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    background: 'linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%)',
  },
  header: {
    background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
    borderRadius: '12px',
    padding: '16px 20px',
    marginBottom: '24px',
    boxShadow: '0 8px 24px rgba(139, 69, 19, 0.3)',
    border: '1px solid rgba(139, 69, 19, 0.1)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '20px',
    flexWrap: 'nowrap',
    minHeight: '80px',
  },
  headerMobile: {
    flexWrap: 'wrap',
    padding: '12px 16px',
    gap: '12px',
    minHeight: 'auto',
  },
  headerLeft: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  menuButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    flexShrink: 0,
  },
  logo: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 700,
    color: "#fff",
    whiteSpace: 'nowrap',
  },
  headerCenter: {
    flex: 1,
    minWidth: 0,
    maxWidth: '500px',
    position: "relative",
  },
  headerCenterMobile: {
    order: 3,
    minWidth: '100%',
    maxWidth: '100%',
    marginTop: '8px',
  },
  searchBar: {
    position: "relative",
    width: "100%",
    display: 'flex',
    alignItems: 'center',
  },
  searchIcon: {
    position: "absolute",
    left: 12,
    top: "50%",
    transform: "translateY(-50%)",
    color: "rgba(255,255,255,0.7)",
    pointerEvents: "none",
    zIndex: 1,
  },
  searchInput: {
    width: "100%",
    padding: "12px 40px 12px 40px",
    border: "1px solid rgba(255,255,255,0.2)",
    borderRadius: 8,
    fontSize: '14px',
    outline: "none",
    transition: "all 0.2s ease",
    backgroundColor: "rgba(255,255,255,0.1)",
    color: "#fff",
    backdropFilter: 'blur(10px)',
  },
  clearSearchButton: {
    position: "absolute",
    right: 12,
    top: "50%",
    transform: "translateY(-50%)",
    width: 24,
    height: 24,
    border: "none",
    borderRadius: "50%",
    backgroundColor: "rgba(255,255,255,0.2)",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    zIndex: 1,
  },
  searchDropdown: {
    position: "absolute",
    top: "calc(100% + 8px)",
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: 12,
    boxShadow: "0 10px 40px rgba(0,0,0,0.2)",
    maxHeight: '400px',
    overflowY: "auto",
    zIndex: 1000,
  },
  searchDropdownHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    borderBottom: "1px solid #e2e8f0",
    fontSize: '13px',
    fontWeight: 600,
    color: "#64748b",
  },
  closeSearchButton: {
    width: 24,
    height: 24,
    border: "none",
    borderRadius: "50%",
    backgroundColor: "#f1f5f9",
    color: "#64748b",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  searchSection: {
    borderBottom: "1px solid #f1f5f9",
  },
  searchSectionTitle: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "12px 16px 8px",
    fontSize: '12px',
    fontWeight: 600,
    color: "#8B4513",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  searchResultItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 16px",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
  },
  searchResultInfo: {
    flex: 1,
  },
  searchResultTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 2,
  },
  searchResultMeta: {
    fontSize: '12px',
    color: "#64748b",
  },
  noSearchResults: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: '32px',
    gap: 12,
    color: "#94a3b8",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexShrink: 0,
  },
  headerRightMobile: {
    marginLeft: 'auto',
  },
  userMenu: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "8px 12px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    backgroundColor: 'rgba(255,255,255,0.1)',
    backdropFilter: 'blur(10px)',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: "50%",
    background: "linear-gradient(135deg, #fff 0%, #f0f0f0 100%)",
    color: "#8B4513",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: '14px',
    flexShrink: 0,
  },
  userDetails: {
    display: "flex",
    flexDirection: "column",
    flexShrink: 0,
  },
  userName: {
    fontSize: '14px',
    fontWeight: 600,
    color: "#fff",
    whiteSpace: 'nowrap',
  },
  userRole: {
    fontSize: '12px',
    color: "rgba(255,255,255,0.8)",
    whiteSpace: 'nowrap',
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    border: "1px solid rgba(255,255,255,0.2)",
    backgroundColor: "rgba(239, 68, 68, 0.2)",
    color: "#fff",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    flexShrink: 0,
  },
  mainLayout: {
    display: "flex",
    gap: 24,
    minHeight: 'calc(100vh - 120px)',
    position: 'relative',
  },
  mobileOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 999,
  },
  sidebar: {
    width: '280px',
    backgroundColor: "#ffffff",
    borderRadius: '12px',
    border: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    boxShadow: '0 4px 20px rgba(139, 69, 19, 0.1)',
    transition: 'transform 0.3s ease',
    flexShrink: 0,
  },
  sidebarMobile: {
    position: 'fixed',
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 1000,
    borderRadius: 0,
  },
  sidebarNav: {
    padding: "16px 12px",
    flex: 1,
  },
  navItem: {
    position: "relative",
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "12px 16px",
    marginBottom: 4,
    backgroundColor: "transparent",
    border: "none",
    borderRadius: 10,
    cursor: "pointer",
    textAlign: "left",
    transition: "all 0.2s ease",
    width: "100%",
  },
  navItemActive: {
    backgroundColor: "#fef8f0",
  },
  navIcon: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "color 0.2s ease",
    flexShrink: 0,
  },
  navText: {
    flex: 1,
    minWidth: 0,
  },
  navTitle: {
    fontSize: '14px',
    fontWeight: 600,
    marginBottom: 2,
    transition: "color 0.2s ease",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  navDescription: {
    fontSize: '12px',
    color: "#94a3b8",
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  activeIndicator: {
    position: "absolute",
    right: 0,
    width: 3,
    height: "60%",
    backgroundColor: "#8B4513",
    borderRadius: "4px 0 0 4px",
  },
  mainContent: {
    flexGrow: 1,
    padding: 0,
    overflowY: "auto",
    minWidth: 0,
  },
  mainContentMobile: {
    width: '100%',
  },
  overviewContent: {
    maxWidth: '100%',
    margin: 0,
  },
  contentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px',
  },
  contentHeaderMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '12px',
  },
  headerActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
  },
  errorText: {
    color: '#ef4444',
    fontSize: '14px',
    fontWeight: 500,
  },
  refreshButton: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "10px 16px",
    backgroundColor: "#8B4513",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    fontSize: '14px',
    fontWeight: 600,
    cursor: "pointer",
    transition: "all 0.2s ease",
    whiteSpace: 'nowrap',
  },
  spinning: {
    animation: 'spin 1s linear infinite',
  },
  pageTitle: {
    margin: 0,
    fontSize: '24px',
    fontWeight: 700,
    color: "#8B4513",
    marginBottom: 4,
  },
  pageSubtitle: {
    margin: 0,
    fontSize: '14px',
    color: "#64748b",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: '16px',
    marginBottom: '24px',
  },
  statsGridMobile: {
    gridTemplateColumns: "1fr",
    gap: '12px',
  },
  statCard: {
    backgroundColor: "#ffffff",
    borderRadius: '12px',
    padding: '20px',
    border: "1px solid #e2e8f0",
    transition: "all 0.3s ease",
    cursor: "pointer",
    boxShadow: '0 2px 10px rgba(139, 69, 19, 0.05)',
  },
  statCardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: '16px',
  },
  statIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: '#fef8f0',
  },
  statChange: {
    display: "flex",
    alignItems: "center",
    gap: 4,
    fontSize: '14px',
    fontWeight: 600,
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 700,
    color: "#8B4513",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: '14px',
    color: "#64748b",
    fontWeight: 500,
  },
  chartsRow: {
    display: "grid",
    gridTemplateColumns: "1.5fr 1fr",
    gap: '24px',
    marginBottom: '24px',
  },
  chartsRowMobile: {
    gridTemplateColumns: "1fr",
    gap: '16px',
  },
  chartCard: {
    backgroundColor: "#ffffff",
    borderRadius: '12px',
    padding: '20px',
    border: "1px solid #e2e8f0",
    boxShadow: '0 2px 10px rgba(139, 69, 19, 0.05)',
  },
  chartHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: '20px',
    flexWrap: 'wrap',
    gap: '12px',
  },
  chartTitle: {
    margin: 0,
    fontSize: '18px',
    fontWeight: 700,
    color: "#8B4513",
    marginBottom: 4,
  },
  chartSubtitle: {
    margin: 0,
    fontSize: '13px',
    color: "#64748b",
  },
  chartSelect: {
    padding: "8px 12px",
    border: "1px solid #e2e8f0",
    borderRadius: 8,
    fontSize: '13px',
    color: "#475569",
    backgroundColor: "#f8fafc",
    cursor: "pointer",
    outline: "none",
  },
  chartPlaceholder: {
    height: '240px',
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  chartBars: {
    display: "flex",
    alignItems: "flex-end",
    gap: '12px',
    height: "100%",
    width: "100%",
    padding: "20px 0",
  },
  barContainer: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    height: "100%",
  },
  bar: {
    width: "100%",
    borderRadius: "8px 8px 0 0",
    transition: "all 0.3s ease",
    minHeight: '20px',
  },
  barLabel: {
    fontSize: '11px',
    color: "#94a3b8",
    marginTop: 8,
    fontWeight: 500,
  },
  barValue: {
    fontSize: '10px',
    color: "#64748b",
    marginTop: 4,
    fontWeight: 600,
  },
  ordersCard: {
    backgroundColor: "#ffffff",
    borderRadius: '12px',
    padding: '20px',
    border: "1px solid #e2e8f0",
    boxShadow: '0 2px 10px rgba(139, 69, 19, 0.05)',
  },
  viewAllButton: {
    padding: "8px 16px",
    backgroundColor: "transparent",
    border: "1px solid #8B4513",
    borderRadius: 8,
    fontSize: '13px',
    fontWeight: 600,
    color: "#8B4513",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  ordersList: {
    display: "flex",
    flexDirection: "column",
    gap: '12px',
  },
  orderItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: '12px',
    backgroundColor: "#f8fafc",
    borderRadius: 10,
    transition: "all 0.2s ease",
  },
  orderItemMobile: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    gap: '8px',
  },
  orderInfo: {
    display: "flex",
    alignItems: "center",
    gap: '12px',
    flex: 1,
    minWidth: 0,
  },
  orderIcon: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#fff",
    border: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#64748b",
    flexShrink: 0,
  },
  orderCustomer: {
    fontSize: '14px',
    fontWeight: 600,
    color: "#0f172a",
    marginBottom: 2,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  orderId: {
    fontSize: '12px',
    color: "#94a3b8",
    whiteSpace: 'nowrap',
  },
  orderRight: {
    textAlign: "right",
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
    gap: '4px',
    flexShrink: 0,
  },
  orderRightMobile: {
    textAlign: 'left',
    alignItems: 'flex-start',
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  orderAmount: {
    fontSize: '14px',
    fontWeight: 700,
    color: "#8B4513",
    whiteSpace: 'nowrap',
  },
  orderStatus: {
    display: "inline-block",
    padding: "4px 10px",
    borderRadius: 6,
    fontSize: '11px',
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  orderTime: {
    fontSize: '11px',
    color: "#94a3b8",
    whiteSpace: 'nowrap',
  },
  metricsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: '16px',
  },
  metricsRowMobile: {
    gridTemplateColumns: "1fr",
  },
  metricCard: {
    backgroundColor: "#ffffff",
    borderRadius: '12px',
    padding: '20px',
    border: "1px solid #e2e8f0",
    boxShadow: '0 2px 10px rgba(139, 69, 19, 0.05)',
  },
  metricHeader: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    marginBottom: '16px',
  },
  metricTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: "#475569",
  },
  metricValue: {
    fontSize: '24px',
    fontWeight: 700,
    color: "#8B4513",
    marginBottom: '12px',
  },
  metricProgress: {
    width: "100%",
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 4,
    overflow: "hidden",
  },
  progressBar: {
    height: "100%",
    borderRadius: 4,
    transition: "width 0.6s ease",
  },
  moduleWrapper: {
    maxWidth: '100%',
    margin: 0,
  },
  moduleContent: {
    backgroundColor: "#ffffff",
    borderRadius: '12px',
    padding: '24px',
    border: "1px solid #e2e8f0",
    minHeight: '400px',
    boxShadow: '0 2px 10px rgba(139, 69, 19, 0.05)',
    overflowX: 'auto',
  },
  placeholder: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    height: 400,
    color: "#94a3b8",
    gap: 16,
  },
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '50vh',
    gap: 16,
  },
  loadingSpinner: {
    width: 40,
    height: 40,
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #8B4513',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    color: '#6b7280',
    fontSize: '16px',
  },
  errorContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '40vh',
    gap: 16,
    textAlign: 'center',
  },
  retryButton: {
    padding: '10px 20px',
    backgroundColor: '#8B4513',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: 600,
  },
  noData: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: 200,
    gap: 12,
    color: '#94a3b8',
  },
  sectionIcon: {
    display: 'inline-flex',
    marginRight: '8px',
  },
};