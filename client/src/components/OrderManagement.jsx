import React, { useState, useEffect } from 'react';

const OrderManagement = () => {
  const token = localStorage.getItem('adminToken');
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    paymentMethod: 'all',
    paymentStatus: 'all',
    orderStatus: 'all'
  });
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    pendingPayments: 0
  });
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const API_BASE_URL = import.meta.env?.VITE_API_URL;

  const styles = {
    container: {
      padding: '24px',
      backgroundColor: '#fefefe',
      minHeight: '100vh',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      background: 'linear-gradient(135deg, #fefefe 0%, #f8f9fa 100%)',
    },
    header: {
      background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '32px',
      boxShadow: '0 10px 30px rgba(139, 69, 19, 0.3)',
      border: '1px solid rgba(139, 69, 19, 0.1)',
    },
    headerContent: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: '24px',
    },
    title: {
      fontSize: '32px',
      fontWeight: '700',
      margin: '0 0 8px 0',
      color: 'white',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    subtitle: {
      fontSize: '16px',
      margin: 0,
      opacity: 0.9,
      color: 'white',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    },
    statsGrid: {
      display: 'flex',
      gap: '16px',
      flexWrap: 'wrap',
    },
    statCard: {
      backgroundColor: 'rgba(255, 255, 255, 0.15)',
      backdropFilter: 'blur(10px)',
      padding: '16px 24px',
      borderRadius: '12px',
      textAlign: 'center',
      minWidth: '120px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      transition: 'all 0.3s ease',
      cursor: 'pointer',
    },
    statNumber: {
      fontSize: '28px',
      fontWeight: '700',
      color: 'white',
      marginBottom: '4px',
      textShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    },
    statLabel: {
      fontSize: '13px',
      color: 'rgba(255, 255, 255, 0.9)',
      fontWeight: '500',
    },
    filtersCard: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      marginBottom: '32px',
      boxShadow: '0 4px 25px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(139, 69, 19, 0.05)',
    },
    sectionTitle: {
      fontSize: '22px',
      fontWeight: '700',
      color: '#111827',
      marginBottom: '24px',
      marginTop: 0,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
    },
    sectionIcon: {
      width: '40px',
      height: '40px',
      borderRadius: '10px',
      background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      boxShadow: '0 4px 12px rgba(139, 69, 19, 0.2)',
    },
    filtersGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '24px',
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
    },
    label: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '8px',
    },
    select: {
      padding: '12px 16px',
      border: '2px solid #e5e7eb',
      borderRadius: '10px',
      fontSize: '14px',
      transition: 'all 0.3s ease',
      outline: 'none',
      fontFamily: 'inherit',
      backgroundColor: 'white',
    },
    resetBtn: {
      backgroundColor: 'transparent',
      color: '#8B4513',
      border: '2px solid #8B4513',
      padding: '12px 28px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      alignSelf: 'flex-end',
    },
    ordersSection: {
      backgroundColor: 'white',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 4px 25px rgba(0, 0, 0, 0.08)',
      border: '1px solid rgba(139, 69, 19, 0.05)',
    },
    ordersHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: '24px',
    },
    ordersCount: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '500',
      backgroundColor: '#fafaf9',
      padding: '8px 16px',
      borderRadius: '20px',
    },
    loadingState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 32px',
      gap: '16px',
    },
    spinner: {
      width: '48px',
      height: '48px',
      border: '4px solid #f3f4f6',
      borderTop: '4px solid #8B4513',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    },
    emptyState: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '64px 32px',
      textAlign: 'center',
      backgroundColor: '#fafaf9',
      borderRadius: '12px',
      border: '2px dashed #d6d3d1',
    },
    emptyStateIcon: {
      fontSize: '48px',
      marginBottom: '16px',
    },
    emptyStateTitle: {
      fontSize: '20px',
      fontWeight: '600',
      color: '#374151',
      margin: '0 0 8px 0',
    },
    ordersList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    orderCard: {
      border: '1px solid #e7e5e4',
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'all 0.3s ease',
      backgroundColor: 'white',
    },
    orderHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '20px 24px',
      background: 'linear-gradient(135deg, #fefefe 0%, #fafaf9 100%)',
      borderBottom: '1px solid #e7e5e4',
    },
    orderNumber: {
      fontSize: '18px',
      fontWeight: '700',
      color: '#111827',
      margin: '0 0 4px 0',
    },
    orderDate: {
      fontSize: '13px',
      color: '#6b7280',
    },
    orderTotal: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#059669',
    },
    orderBody: {
      padding: '24px',
    },
    detailsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '20px',
      marginBottom: '20px',
      paddingBottom: '20px',
      borderBottom: '1px solid #f3f4f6',
    },
    detailGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
    },
    detailLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    detailValue: {
      fontSize: '14px',
      color: '#111827',
      lineHeight: '1.5',
    },
    itemsSection: {
      marginTop: '20px',
    },
    itemsHeader: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#374151',
      marginBottom: '12px',
    },
    itemsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    item: {
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      padding: '12px',
      backgroundColor: '#fafaf9',
      borderRadius: '8px',
      border: '1px solid #f3f4f6',
    },
    itemImage: {
      width: '56px',
      height: '56px',
      objectFit: 'cover',
      borderRadius: '6px',
      border: '2px solid #e7e5e4',
    },
    itemDetails: {
      flex: 1,
    },
    itemName: {
      fontSize: '14px',
      fontWeight: '600',
      color: '#111827',
      margin: '0 0 4px 0',
    },
    itemSpecs: {
      fontSize: '12px',
      color: '#6b7280',
    },
    itemPrice: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#111827',
    },
    badgesSection: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
      padding: '16px 24px',
      backgroundColor: '#fafaf9',
      borderTop: '1px solid #e7e5e4',
      borderBottom: '1px solid #e7e5e4',
    },
    badge: {
      padding: '8px 16px',
      borderRadius: '20px',
      fontSize: '13px',
      fontWeight: '700',
      color: 'white',
      textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      border: '1px solid transparent',
    },
    actionsSection: {
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
    },
    actionGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    },
    actionLabel: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#6b7280',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
    },
    actionButtons: {
      display: 'flex',
      gap: '12px',
      flexWrap: 'wrap',
    },
    primaryButton: {
      background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)',
    },
    successButton: {
      background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    },
    dangerOutlineButton: {
      backgroundColor: 'transparent',
      color: '#dc2626',
      border: '2px solid #dc2626',
      padding: '12px 24px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
    },
    viewButton: {
      backgroundColor: '#111827',
      color: 'white',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '10px',
      fontSize: '14px',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      marginTop: '8px',
    },
    modalOverlay: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: '20px',
    },
    modal: {
      backgroundColor: 'white',
      borderRadius: '16px',
      maxWidth: '900px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
      border: '1px solid #e7e5e4',
    },
    modalHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '24px 32px',
      borderBottom: '1px solid #e5e7eb',
      background: 'linear-gradient(135deg, #fefefe 0%, #fafaf9 100%)',
    },
    modalTitle: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#111827',
      margin: 0,
    },
    modalCloseButton: {
      background: 'none',
      border: 'none',
      color: '#6b7280',
      cursor: 'pointer',
      padding: '8px',
      fontSize: '24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: '8px',
      transition: 'all 0.2s',
    },
    modalContent: {
      padding: '32px',
    },
    paginationContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 0',
      borderTop: '1px solid #e7e5e4',
      marginTop: '24px',
    },
    paginationInfo: {
      fontSize: '14px',
      color: '#6b7280',
      fontWeight: '500',
    },
    paginationControls: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
    },
    paginationButton: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '8px 12px',
      border: '1px solid #d6d3d1',
      backgroundColor: 'white',
      color: '#374151',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px',
      fontWeight: '500',
      minWidth: '40px',
      height: '40px',
    },
    paginationButtonActive: {
      background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
      color: 'white',
      border: '1px solid #8B4513',
      boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)',
    },
    paginationButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
      backgroundColor: '#f5f5f4',
    },
    paginationEllipsis: {
      padding: '8px 12px',
      color: '#6b7280',
      fontSize: '14px',
    },
  };

  
const fetchOrders = async () => {
  const token = localStorage.getItem('adminToken');
  setLoading(true);
  try {
    const params = new URLSearchParams();
    if (filter.paymentMethod !== 'all') params.append('paymentMethod', filter.paymentMethod);
    if (filter.paymentStatus !== 'all') params.append('paymentStatus', filter.paymentStatus);
    if (filter.orderStatus !== 'all') params.append('orderStatus', filter.orderStatus);

    const response = await fetch(`${API_BASE_URL}/admin/orders?${params.toString()}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`, 
      },
    });

    const data = await response.json();

    if (data.success) {
      setOrders(data.orders);
      calculateStats(data.orders);
    }
  } catch (error) {
    console.error('Error fetching orders:', error);
  } finally {
    setLoading(false);
  }
};

  
  const calculateStats = (ordersData) => {
    const stats = {
      total: ordersData.length,
      pending: ordersData.filter(o => o.orderStatus === 'pending').length,
      processing: ordersData.filter(o => o.orderStatus === 'processing').length,
      shipped: ordersData.filter(o => o.orderStatus === 'shipped').length,
      delivered: ordersData.filter(o => o.orderStatus === 'delivered').length,
      pendingPayments: ordersData.filter(o => o.paymentInfo.paymentStatus === 'pending').length
    };
    setStats(stats);
  };

  
  const updatePaymentStatus = async (orderId, status) => {
    if (!confirm(`Confirm payment as ${status}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/order/${orderId}/payment-status`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
           Authorization: `Bearer ${token}`,
         },
        body: JSON.stringify({ 
          paymentStatus: status,
          paidAt: new Date().toISOString()
        })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Payment marked as ${status}!`);
        fetchOrders();
      }
    } catch (error) {
      alert('Failed to update payment status');
      console.error(error);
    }
  };

  
  const updateOrderStatus = async (orderId, status) => {
    if (!confirm(`Update order status to ${status}?`)) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/order/${orderId}/status`, {
        method: 'PATCH',
        headers: {
         'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },

        body: JSON.stringify({ orderStatus: status })
      });

      const data = await response.json();
      if (data.success) {
        alert(`Order status updated to ${status}!`);
        fetchOrders();
      }
    } catch (error) {
      alert('Failed to update order status');
      console.error(error);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  
  const totalPages = Math.ceil(orders.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentOrders = orders.slice(indexOfFirstItem, indexOfLastItem);

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
    const maxPagesToShow = 5;
    
    if (totalPages <= maxPagesToShow) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push('...');
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push('...');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push('...');
        pages.push(currentPage - 1);
        pages.push(currentPage);
        pages.push(currentPage + 1);
        pages.push('...');
        pages.push(totalPages);
      }
    }
    
    return pages;
  };

  const getPaymentMethodBadge = (method) => {
    const badges = {
      stripe: { text: 'Card Payment', color: '#6366f1' },
      bank_transfer: { text: 'Bank Transfer', color: '#f59e0b' },
      cod: { text: 'Cash on Delivery', color: '#10b981' }
    };
    return badges[method] || { text: method, color: '#6b7280' };
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processing: '#3b82f6',
      shipped: '#8b5cf6',
      delivered: '#10b981',
      cancelled: '#ef4444',
      completed: '#10b981',
      failed: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  return (
    <div style={styles.container}>
      {/* Header with Stats */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div>
            <h1 style={styles.title}>Order Management</h1>
            <p style={styles.subtitle}>Manage and track all customer orders</p>
          </div>
          <div style={styles.statsGrid}>
            <div style={styles.statCard} onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 69, 19, 0.15)';
            }} onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={styles.statNumber}>{stats.total}</div>
              <div style={styles.statLabel}>Total Orders</div>
            </div>
            <div style={styles.statCard} onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 69, 19, 0.15)';
            }} onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={styles.statNumber}>{stats.pending}</div>
              <div style={styles.statLabel}>Pending</div>
            </div>
            <div style={styles.statCard} onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 69, 19, 0.15)';
            }} onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={styles.statNumber}>{stats.processing}</div>
              <div style={styles.statLabel}>Processing</div>
            </div>
            <div style={styles.statCard} onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 69, 19, 0.15)';
            }} onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={styles.statNumber}>{stats.shipped}</div>
              <div style={styles.statLabel}>Shipped</div>
            </div>
            <div style={styles.statCard} onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 69, 19, 0.15)';
            }} onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={styles.statNumber}>{stats.delivered}</div>
              <div style={styles.statLabel}>Delivered</div>
            </div>
            <div style={styles.statCard} onMouseEnter={e => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.boxShadow = '0 12px 30px rgba(139, 69, 19, 0.15)';
            }} onMouseLeave={e => {
              e.currentTarget.style.transform = 'none';
              e.currentTarget.style.boxShadow = 'none';
            }}>
              <div style={styles.statNumber}>{stats.pendingPayments}</div>
              <div style={styles.statLabel}>Pending Payments</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={styles.filtersCard}>
        <div style={styles.sectionTitle}>
          <span style={styles.sectionIcon}>🔍</span>
          <span>Filter Orders</span>
        </div>
        <div style={styles.filtersGrid}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Payment Method</label>
            <select 
              style={styles.select}
              value={filter.paymentMethod}
              onChange={(e) => setFilter({...filter, paymentMethod: e.target.value})}
              onFocus={(e) => e.target.style.borderColor = '#8B4513'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="all">All Methods</option>
              <option value="stripe">Card Payment</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cod">Cash on Delivery</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Payment Status</label>
            <select 
              style={styles.select}
              value={filter.paymentStatus}
              onChange={(e) => setFilter({...filter, paymentStatus: e.target.value})}
              onFocus={(e) => e.target.style.borderColor = '#8B4513'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Order Status</label>
            <select 
              style={styles.select}
              value={filter.orderStatus}
              onChange={(e) => setFilter({...filter, orderStatus: e.target.value})}
              onFocus={(e) => e.target.style.borderColor = '#8B4513'}
              onBlur={(e) => e.target.style.borderColor = '#e5e7eb'}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>

          <button 
            style={styles.resetBtn}
            onClick={() => setFilter({
              paymentMethod: 'all',
              paymentStatus: 'all',
              orderStatus: 'all'
            })}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#8B4513';
              e.currentTarget.style.color = 'white';
              e.currentTarget.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#8B4513';
              e.currentTarget.style.transform = 'none';
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>

      {/* Orders List */}
      <div style={styles.ordersSection}>
        <div style={styles.ordersHeader}>
          <div style={styles.sectionTitle}>
            <span style={styles.sectionIcon}>📦</span>
            <span>Orders</span>
          </div>
          <span style={styles.ordersCount}>{orders.length} {orders.length === 1 ? 'order' : 'orders'}</span>
        </div>

        {loading ? (
          <div style={styles.loadingState}>
            <div style={styles.spinner}></div>
            <p style={{color: '#6b7280', fontSize: '16px', fontWeight: '600'}}>Loading orders...</p>
          </div>
        ) : orders.length === 0 ? (
          <div style={styles.emptyState}>
            <div style={styles.emptyStateIcon}>📭</div>
            <h3 style={styles.emptyStateTitle}>No orders found</h3>
            <p style={{fontSize: '16px', color: '#6b7280', margin: 0}}>Try adjusting your filters to see more results</p>
          </div>
        ) : (
          <>
            <div style={styles.ordersList}>
              {currentOrders.map((order) => {
                const paymentBadge = getPaymentMethodBadge(order.paymentInfo.paymentMethod);
                return (
                  <div 
                    key={order._id} 
                    style={styles.orderCard}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 8px 25px rgba(139, 69, 19, 0.15)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'none';
                    }}
                  >
                    {/* Order Header */}
                    <div style={styles.orderHeader}>
                      <div>
                        <h3 style={styles.orderNumber}>#{order.orderNumber}</h3>
                        <p style={styles.orderDate}>
                          {new Date(order.createdAt).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                      <div style={styles.orderTotal}>Rs. {order.total.toLocaleString()}</div>
                    </div>

                    {/* Order Body */}
                    <div style={styles.orderBody}>
                      <div style={styles.detailsGrid}>
                        <div style={styles.detailGroup}>
                          <span style={styles.detailLabel}>Customer</span>
                          <span style={styles.detailValue}>
                            {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                          </span>
                        </div>

                        <div style={styles.detailGroup}>
                          <span style={styles.detailLabel}>Contact</span>
                          <span style={styles.detailValue}>
                            {order.shippingAddress.phone}<br/>
                            {order.shippingAddress.email}
                          </span>
                        </div>

                        <div style={styles.detailGroup}>
                          <span style={styles.detailLabel}>Shipping Address</span>
                          <span style={styles.detailValue}>
                            {order.shippingAddress.streetAddress}<br/>
                            {order.shippingAddress.townCity}, {order.shippingAddress.province}
                          </span>
                        </div>
                      </div>

                      {/* Items Section */}
                      <div style={styles.itemsSection}>
                        <div style={styles.itemsHeader}>Order Items ({order.items.length})</div>
                        <div style={styles.itemsList}>
                          {order.items.map((item, idx) => (
                            <div key={idx} style={styles.item}>
                              <img src={item.image} alt={item.name} style={styles.itemImage} />
                              <div style={styles.itemDetails}>
                                <p style={styles.itemName}>{item.name}</p>
                                <p style={styles.itemSpecs}>
                                  {item.size} • {item.color} • Qty: {item.quantity}
                                </p>
                              </div>
                              <div style={styles.itemPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Badges */}
                    <div style={styles.badgesSection}>
                      <span style={{...styles.badge, backgroundColor: paymentBadge.color}}>
                        {paymentBadge.text}
                      </span>
                      <span style={{...styles.badge, backgroundColor: getStatusColor(order.paymentInfo.paymentStatus)}}>
                        Payment: {order.paymentInfo.paymentStatus}
                      </span>
                      <span style={{...styles.badge, backgroundColor: getStatusColor(order.orderStatus)}}>
                        Order: {order.orderStatus}
                      </span>
                    </div>

                    {/* Actions */}
                    <div style={styles.actionsSection}>
                      {/* Payment Actions */}
                      {order.paymentInfo.paymentStatus === 'pending' && (
                        <div style={styles.actionGroup}>
                          <label style={styles.actionLabel}>Payment Actions</label>
                          <div style={styles.actionButtons}>
                            <button 
                              style={styles.successButton}
                              onClick={() => updatePaymentStatus(order._id, 'completed')}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                              }}
                            >
                              ✓ Confirm Payment
                            </button>
                            <button 
                              style={styles.dangerOutlineButton}
                              onClick={() => updatePaymentStatus(order._id, 'failed')}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#dc2626';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#dc2626';
                                e.currentTarget.style.transform = 'none';
                              }}
                            >
                              ✗ Mark Failed
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Order Status Actions */}
                      <div style={styles.actionGroup}>
                        <label style={styles.actionLabel}>Order Status</label>
                        <div style={styles.actionButtons}>
                          {order.orderStatus === 'pending' && (
                            <button 
                              style={styles.primaryButton}
                              onClick={() => updateOrderStatus(order._id, 'processing')}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 69, 19, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 69, 19, 0.3)';
                              }}
                            >
                              Start Processing
                            </button>
                          )}
                          {order.orderStatus === 'processing' && (
                            <button 
                              style={styles.primaryButton}
                              onClick={() => updateOrderStatus(order._id, 'shipped')}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(139, 69, 19, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(139, 69, 19, 0.3)';
                              }}
                            >
                              🚚 Mark as Shipped
                            </button>
                          )}
                          {order.orderStatus === 'shipped' && (
                            <button 
                              style={styles.successButton}
                              onClick={() => updateOrderStatus(order._id, 'delivered')}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-2px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(16, 185, 129, 0.4)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'none';
                                e.currentTarget.style.boxShadow = '0 4px 12px rgba(16, 185, 129, 0.3)';
                              }}
                            >
                              ✓ Mark as Delivered
                            </button>
                          )}
                          {order.orderStatus !== 'cancelled' && order.orderStatus !== 'delivered' && (
                            <button 
                              style={styles.dangerOutlineButton}
                              onClick={() => updateOrderStatus(order._id, 'cancelled')}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#dc2626';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'translateY(-2px)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                                e.currentTarget.style.color = '#dc2626';
                                e.currentTarget.style.transform = 'none';
                              }}
                            >
                              Cancel Order
                            </button>
                          )}
                        </div>
                      </div>

                      <button 
                        style={styles.viewButton}
                        onClick={() => {
                          setSelectedOrder(order);
                          setShowModal(true);
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#000';
                          e.currentTarget.style.transform = 'translateY(-2px)';
                          e.currentTarget.style.boxShadow = '0 6px 20px rgba(0, 0, 0, 0.3)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = '#111827';
                          e.currentTarget.style.transform = 'none';
                          e.currentTarget.style.boxShadow = 'none';
                        }}
                      >
                        View Full Details →
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {orders.length > itemsPerPage && (
              <div style={styles.paginationContainer}>
                <div style={styles.paginationInfo}>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, orders.length)} of {orders.length} orders
                </div>
                <div style={styles.paginationControls}>
                  <button
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === 1 ? styles.paginationButtonDisabled : {})
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="15,18 9,12 15,6" />
                    </svg>
                  </button>
                  
                  {getPageNumbers().map((page, index) => (
                    page === '...' ? (
                      <span key={`ellipsis-${index}`} style={styles.paginationEllipsis}>...</span>
                    ) : (
                      <button
                        key={page}
                        onClick={() => goToPage(page)}
                        style={{
                          ...styles.paginationButton,
                          ...(currentPage === page ? styles.paginationButtonActive : {})
                        }}
                      >
                        {page}
                      </button>
                    )
                  ))}
                  
                  <button
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                    style={{
                      ...styles.paginationButton,
                      ...(currentPage === totalPages ? styles.paginationButtonDisabled : {})
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="9,18 15,12 9,6" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && selectedOrder && (
        <div style={styles.modalOverlay} onClick={() => setShowModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Order #{selectedOrder.orderNumber}</h2>
              <button 
                style={styles.modalCloseButton}
                onClick={() => setShowModal(false)}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f5f5f4'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                ×
              </button>
            </div>
            <div style={styles.modalContent}>
              <div style={styles.detailsGrid}>
                <div style={styles.detailGroup}>
                  <span style={styles.detailLabel}>Order Total</span>
                  <span style={{...styles.detailValue, fontSize: '20px', fontWeight: '700', color: '#059669'}}>
                    Rs. {selectedOrder.total.toLocaleString()}
                  </span>
                </div>
                <div style={styles.detailGroup}>
                  <span style={styles.detailLabel}>Order Date</span>
                  <span style={styles.detailValue}>
                    {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </span>
                </div>
                <div style={styles.detailGroup}>
                  <span style={styles.detailLabel}>Payment Method</span>
                  <span style={styles.detailValue}>
                    {getPaymentMethodBadge(selectedOrder.paymentInfo.paymentMethod).text}
                  </span>
                </div>
              </div>

              <div style={{marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e7e5e4'}}>
                <h3 style={{fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px'}}>
                  Customer Information
                </h3>
                <div style={styles.detailsGrid}>
                  <div style={styles.detailGroup}>
                    <span style={styles.detailLabel}>Name</span>
                    <span style={styles.detailValue}>
                      {selectedOrder.shippingAddress.firstName} {selectedOrder.shippingAddress.lastName}
                    </span>
                  </div>
                  <div style={styles.detailGroup}>
                    <span style={styles.detailLabel}>Email</span>
                    <span style={styles.detailValue}>{selectedOrder.shippingAddress.email}</span>
                  </div>
                  <div style={styles.detailGroup}>
                    <span style={styles.detailLabel}>Phone</span>
                    <span style={styles.detailValue}>{selectedOrder.shippingAddress.phone}</span>
                  </div>
                  <div style={styles.detailGroup}>
                    <span style={styles.detailLabel}>Address</span>
                    <span style={styles.detailValue}>
                      {selectedOrder.shippingAddress.streetAddress}<br/>
                      {selectedOrder.shippingAddress.townCity}, {selectedOrder.shippingAddress.province}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #e7e5e4'}}>
                <h3 style={{fontSize: '18px', fontWeight: '700', color: '#111827', marginBottom: '16px'}}>
                  Order Items
                </h3>
                <div style={styles.itemsList}>
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} style={styles.item}>
                      <img src={item.image} alt={item.name} style={styles.itemImage} />
                      <div style={styles.itemDetails}>
                        <p style={styles.itemName}>{item.name}</p>
                        <p style={styles.itemSpecs}>
                          {item.size} • {item.color} • Qty: {item.quantity}
                        </p>
                      </div>
                      <div style={styles.itemPrice}>Rs. {(item.price * item.quantity).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default OrderManagement;