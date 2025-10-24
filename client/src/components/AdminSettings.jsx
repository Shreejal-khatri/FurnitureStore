import React, { useState, useEffect } from 'react';
import { User, Mail, Shield, Calendar, Clock, LogOut, Settings, RefreshCw } from 'lucide-react';

const AdminSettings = () => {
  const [adminData, setAdminData] = useState({
    email: '',
    name: '',
    id: '',
    role: '',
    issuedAt: '',
    expiresAt: ''
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAdminData = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    
    const adminToken = localStorage.getItem('adminToken');
    
    if (!adminToken) {
      window.location.href = '/admin/login';
      return;
    }

    try {
      const tokenPayload = JSON.parse(atob(adminToken.split('.')[1]));
      
      setAdminData({
        email: tokenPayload.email,
        name: tokenPayload.name,
        id: tokenPayload.id,
        role: tokenPayload.role,
        issuedAt: tokenPayload.iat ? new Date(tokenPayload.iat * 1000).toLocaleDateString() : '',
        expiresAt: tokenPayload.exp ? new Date(tokenPayload.exp * 1000).toLocaleDateString() : ''
      });
    } catch (error) {
      console.error('Error parsing token:', error);
      handleLogout();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    window.location.href = '/admin/login';
  };

  if (loading) {
    return (
      <div style={styles.loadingContainer}>
        <div style={styles.loadingContent}>
          <div style={styles.spinner}></div>
          <p style={styles.loadingText}>Loading admin details...</p>
        </div>
      </div>
    );
  }

  const initial = adminData.name ? adminData.name.charAt(0).toUpperCase() : '?';

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerLeft}>
            <Settings color="#92400e" size={32} />
            <h1 style={styles.title}>Admin Settings</h1>
          </div>
          <button
            onClick={() => fetchAdminData(true)}
            disabled={refreshing}
            style={{
              ...styles.refreshButton,
              opacity: refreshing ? 0.5 : 1,
              cursor: refreshing ? 'not-allowed' : 'pointer'
            }}
            title="Refresh"
          >
            <RefreshCw 
              color="#92400e" 
              size={20}
              style={{
                animation: refreshing ? 'spin 1s linear infinite' : 'none'
              }}
            />
          </button>
        </div>

        {/* Profile Card */}
        <div style={styles.profileCard}>
          {/* Header Background */}
          <div style={styles.profileHeader}>
            <div style={styles.avatarWrapper}>
              <div style={styles.avatar}>
                {initial}
              </div>
            </div>
          </div>

          {/* Profile Info */}
          <div style={styles.profileContent}>
            <div style={styles.profileTop}>
              <div>
                <h2 style={styles.adminName}>{adminData.name}</h2>
                <div style={styles.emailRow}>
                  <Mail size={16} color="#4b5563" />
                  <span style={styles.emailText}>{adminData.email}</span>
                </div>
              </div>
              <div style={styles.roleBadge}>
                <Shield size={16} color="#92400e" />
                <span style={styles.roleText}>{adminData.role}</span>
              </div>
            </div>

            {/* Details Grid */}
            <div style={styles.detailsGrid}>
              <div style={styles.detailCard}>
                <div style={styles.detailCardContent}>
                  <div style={styles.iconBox1}>
                    <User color="#92400e" size={20} />
                  </div>
                  <div>
                    <p style={styles.detailLabel}>USERNAME</p>
                    <p style={styles.detailValue}>{adminData.name}</p>
                  </div>
                </div>
              </div>

              <div style={styles.detailCard}>
                <div style={styles.detailCardContent}>
                  <div style={styles.iconBox2}>
                    <Mail color="#c2410c" size={20} />
                  </div>
                  <div style={styles.detailValueContainer}>
                    <p style={styles.detailLabel}>EMAIL</p>
                    <p style={styles.detailValue}>{adminData.email}</p>
                  </div>
                </div>
              </div>

              <div style={styles.detailCard}>
                <div style={styles.detailCardContent}>
                  <div style={styles.iconBox3}>
                    <Calendar color="#78350f" size={20} />
                  </div>
                  <div>
                    <p style={styles.detailLabel}>TOKEN ISSUED</p>
                    <p style={styles.detailValue}>{adminData.issuedAt}</p>
                  </div>
                </div>
              </div>

              <div style={styles.detailCard}>
                <div style={styles.detailCardContent}>
                  <div style={styles.iconBox4}>
                    <Clock color="#9a3412" size={20} />
                  </div>
                  <div>
                    <p style={styles.detailLabel}>TOKEN EXPIRES</p>
                    <p style={styles.detailValue}>{adminData.expiresAt}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Admin ID Section */}
            <div style={styles.adminIdCard}>
              <div style={styles.adminIdContent}>
                <div style={styles.iconBox1}>
                  <Shield color="#92400e" size={20} />
                </div>
                <div style={styles.adminIdTextContainer}>
                  <p style={styles.detailLabel}>ADMIN ID</p>
                  <p style={styles.detailValue}>{adminData.id}</p>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              style={styles.logoutButton}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #b91c1c, #991b1b)';
                e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'linear-gradient(to right, #dc2626, #b91c1c)';
                e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
              }}
            >
              <LogOut size={20} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div style={styles.statsGrid}>
          <div style={{...styles.statCard, borderLeft: '4px solid #d97706'}}>
            <h3 style={styles.statLabel}>Account Status</h3>
            <p style={styles.statValue}>Active</p>
          </div>
          <div style={{...styles.statCard, borderLeft: '4px solid #ea580c'}}>
            <h3 style={styles.statLabel}>Security Level</h3>
            <p style={styles.statValueOrange}>High</p>
          </div>
          <div style={{...styles.statCard, borderLeft: '4px solid #92400e'}}>
            <h3 style={styles.statLabel}>Privileges</h3>
            <p style={styles.statValue}>Full Access</p>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: '#ffffff',
    padding: '48px 16px',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  wrapper: {
    maxWidth: '896px',
    margin: '0 auto'
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '32px'
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  title: {
    fontSize: '30px',
    fontWeight: 'bold',
    color: '#78350f',
    margin: 0
  },
  refreshButton: {
    padding: '8px',
    background: 'transparent',
    border: 'none',
    borderRadius: '8px',
    transition: 'background-color 0.2s',
    cursor: 'pointer'
  },
  profileCard: {
    backgroundColor: 'white',
    borderRadius: '16px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    overflow: 'hidden',
    marginBottom: '24px'
  },
  profileHeader: {
    height: '128px',
    background: 'linear-gradient(to right, #92400e, #c2410c)',
    position: 'relative'
  },
  avatarWrapper: {
    position: 'absolute',
    bottom: '-48px',
    left: '32px'
  },
  avatar: {
    width: '96px',
    height: '96px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #d97706, #c2410c)',
    color: 'white',
    fontSize: '36px',
    fontWeight: 'bold',
    borderRadius: '50%',
    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    border: '4px solid white'
  },
  profileContent: {
    paddingTop: '64px',
    paddingBottom: '32px',
    paddingLeft: '32px',
    paddingRight: '32px'
  },
  profileTop: {
    display: 'flex',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: '24px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  adminName: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: '4px',
    margin: '0 0 4px 0'
  },
  emailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px'
  },
  emailText: {
    color: '#4b5563',
    fontSize: '14px'
  },
  roleBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderRadius: '9999px',
    fontWeight: '600',
    fontSize: '14px'
  },
  roleText: {
    textTransform: 'capitalize'
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
    gap: '16px',
    marginBottom: '32px'
  },
  detailCard: {
    background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #fde68a'
  },
  detailCardContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  iconBox1: {
    padding: '8px',
    backgroundColor: '#fef3c7',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconBox2: {
    padding: '8px',
    backgroundColor: '#fed7aa',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconBox3: {
    padding: '8px',
    backgroundColor: '#fde68a',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  iconBox4: {
    padding: '8px',
    backgroundColor: '#fed7aa',
    borderRadius: '8px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  detailLabel: {
    fontSize: '10px',
    color: '#6b7280',
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
    fontWeight: '500',
    margin: '0 0 2px 0'
  },
  detailValue: {
    color: '#1f2937',
    fontWeight: '600',
    fontSize: '14px',
    margin: 0
  },
  detailValueContainer: {
    flex: 1,
    minWidth: 0
  },
  adminIdCard: {
    background: 'linear-gradient(135deg, #fef3c7, #fed7aa)',
    padding: '16px',
    borderRadius: '12px',
    border: '1px solid #fde68a',
    marginBottom: '24px'
  },
  adminIdContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  adminIdTextContainer: {
    flex: 1
  },
  logoutButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    width: '100%',
    padding: '12px 24px',
    background: 'linear-gradient(to right, #dc2626, #b91c1c)',
    color: 'white',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    fontWeight: '600',
    fontSize: '16px',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '16px'
  },
  statCard: {
    backgroundColor: 'white',
    padding: '24px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  },
  statLabel: {
    fontSize: '14px',
    fontWeight: '500',
    color: '#4b5563',
    marginBottom: '4px',
    margin: '0 0 4px 0'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#78350f',
    margin: 0
  },
  statValueOrange: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#9a3412',
    margin: 0
  },
  loadingContainer: {
    minHeight: '100vh',
    background: '#ffffff',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
  },
  loadingContent: {
    textAlign: 'center'
  },
  spinner: {
    width: '64px',
    height: '64px',
    border: '4px solid #92400e',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
    margin: '0 auto 16px'
  },
  loadingText: {
    color: '#92400e',
    fontWeight: '500',
    fontSize: '16px'
  }
};

export default AdminSettings;