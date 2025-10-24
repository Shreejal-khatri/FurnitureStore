import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const navigate = useNavigate();
  const adminToken = localStorage.getItem("adminToken");

  useEffect(() => {
    if (!adminToken) {
      navigate("/admin/login");
      return;
    }
    fetchUsers();
  }, [adminToken, navigate]);

  const fetchUsers = async () => {
    try {
      setLoading(true);

      const API_BASE_URL = import.meta.env.VITE_API_URL;

      const res = await axios.get(`${API_BASE_URL}/user`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      setUsers(res.data.data);
      setError(null);
    } catch (err) {
      setError("Failed to fetch users. Make sure you are an admin.");
      console.error("Error fetching users:", err);
      if (err.response && err.response.status === 401) {
        navigate("/admin/login");
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;

    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;

      await axios.delete(`${API_BASE_URL}/user/${id}`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      setSuccessMessage("User deleted successfully");
      fetchUsers();
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (err) {
      setError("Failed to delete user. Please try again.");
      console.error("Error deleting user:", err);
    }
  };

  const getInitial = (username) => {
    if (!username) return "?";
    return username.charAt(0).toUpperCase();
  };

  const getRandomColor = (username) => {
    const colors = [
      "#3498db", "#e74c3c", "#2ecc71", "#f39c12", "#9b59b6",
      "#1abc9c", "#d35400", "#c0392b", "#16a085", "#8e44ad",
      "#27ae60", "#2980b9", "#e67e22", "#7f8c8d"
    ];
    const index = username ? username.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  const viewUserDetails = (user) => {
    setSelectedUser(user);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedUser(null);
  };

  const totalPages = Math.ceil(users.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = users.slice(indexOfFirstItem, indexOfLastItem);

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

  const styles = {
    container: {
      padding: "24px",
      backgroundColor: "#f5f7f9",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    header: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: "24px",
    },
    title: {
      color: "#2c3e50",
      fontWeight: "700",
      fontSize: "28px",
      margin: "0",
    },
    refreshBtn: {
      backgroundColor: "#3498db",
      color: "white",
      border: "none",
      padding: "10px 20px",
      borderRadius: "6px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "16px",
      boxShadow: "0 4px 8px rgba(52, 152, 219, 0.3)",
      transition: "background-color 0.3s ease, box-shadow 0.3s ease",
    },
    alert: {
      padding: "14px 20px",
      borderRadius: "6px",
      marginBottom: "20px",
      fontWeight: "600",
      fontSize: "15px",
    },
    alertError: {
      backgroundColor: "#fde8e8",
      color: "#e53e3e",
      border: "1.5px solid #feb2b2",
    },
    alertSuccess: {
      backgroundColor: "#f0fff4",
      color: "#38a169",
      border: "1.5px solid #9ae6b4",
    },
    loading: {
      textAlign: "center",
      padding: "50px",
      color: "#718096",
      fontStyle: "italic",
      fontSize: "18px",
    },
    tableContainer: {
      backgroundColor: "white",
      borderRadius: "12px",
      boxShadow: "0 6px 20px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    tableHeader: {
      backgroundColor: "#f8f9fa",
      padding: "18px 20px",
      textAlign: "left",
      fontWeight: "700",
      color: "#4a5568",
      borderBottom: "3px solid #e2e8f0",
      fontSize: "16px",
    },
    tableCell: {
      padding: "18px 20px",
      borderBottom: "1.5px solid #e2e8f0",
      color: "#2d3748",
      fontSize: "15px",
    },
    tableRow: {
      transition: "background-color 0.3s ease",
      cursor: "default",
    },
    noUsers: {
      textAlign: "center",
      color: "#a0aec0",
      fontStyle: "italic",
      fontSize: "16px",
    },
    roleBadge: {
      backgroundColor: "#ebf8ff",
      color: "#3182ce",
      padding: "6px 12px",
      borderRadius: "12px",
      fontSize: "13px",
      fontWeight: "600",
      letterSpacing: "0.03em",
    },
    statusBadge: {
      padding: "6px 12px",
      borderRadius: "12px",
      fontSize: "13px",
      fontWeight: "600",
      letterSpacing: "0.03em",
    },
    statusActive: {
      backgroundColor: "#f0fff4",
      color: "#38a169",
    },
    actions: {
      display: "flex",
      gap: "12px",
    },
    actionBtn: {
      padding: "8px 16px",
      border: "none",
      borderRadius: "8px",
      cursor: "pointer",
      fontSize: "15px",
      fontWeight: "600",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
    },
    viewBtn: {
      backgroundColor: "#e6fffa",
      color: "#234e52",
    },
    deleteBtn: {
      backgroundColor: "#fff5f5",
      color: "#c53030",
    },
    modalOverlay: {
      position: "fixed",
      top: "0",
      left: "0",
      right: "0",
      bottom: "0",
      backgroundColor: "rgba(0, 0, 0, 0.6)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: "1000",
    },
    modal: {
      backgroundColor: "white",
      borderRadius: "12px",
      width: "520px",
      maxWidth: "90%",
      boxShadow: "0 8px 30px rgba(0, 0, 0, 0.2)",
      overflow: "hidden",
    },
    modalHeader: {
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      padding: "24px 28px",
      borderBottom: "1.5px solid #e2e8f0",
    },
    modalTitle: {
      margin: "0",
      color: "#2d3748",
      fontWeight: "700",
      fontSize: "22px",
    },
    closeBtn: {
      background: "none",
      border: "none",
      fontSize: "28px",
      cursor: "pointer",
      color: "#718096",
      transition: "color 0.3s ease",
    },
    modalBody: {
      padding: "28px 32px",
    },
    userDetail: {
      display: "flex",
      marginBottom: "20px",
      alignItems: "center",
    },
    detailLabel: {
      fontWeight: "700",
      width: "110px",
      color: "#4a5568",
      fontSize: "16px",
    },
    detailValue: {
      color: "#2d3748",
      fontSize: "16px",
    },
    modalFooter: {
      padding: "20px 28px",
      borderTop: "1.5px solid #e2e8f0",
      textAlign: "right",
    },
    closeModalBtn: {
      backgroundColor: "#e2e8f0",
      color: "#4a5568",
      border: "none",
      padding: "10px 22px",
      borderRadius: "8px",
      cursor: "pointer",
      fontWeight: "600",
      fontSize: "16px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      transition: "background-color 0.3s ease",
    },
   
    userCell: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
    },
    profileIcon: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "bold",
      fontSize: "16px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    },
    modalProfileIcon: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontWeight: "bold",
      fontSize: "32px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      marginRight: "20px",
    },
    modalUserInfo: {
      display: "flex",
      alignItems: "center",
      marginBottom: "24px",
      paddingBottom: "20px",
      borderBottom: "2px solid #e2e8f0",
    },
    modalUsername: {
      fontSize: "24px",
      fontWeight: "700",
      color: "#2d3748",
      margin: "0",
    },
    modalUserEmail: {
      fontSize: "16px",
      color: "#718096",
      margin: "4px 0 0 0",
    },
    paginationContainer: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '24px 20px',
      borderTop: '1.5px solid #e2e8f0',
      marginTop: '0',
    },
    paginationInfo: {
      fontSize: '14px',
      color: '#718096',
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
      border: '1px solid #cbd5e0',
      backgroundColor: 'white',
      color: '#4a5568',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      fontSize: '14px',
      fontWeight: '500',
      minWidth: '40px',
      height: '40px',
    },
    paginationButtonActive: {
      backgroundColor: '#8B4513',
      color: 'white',
      border: '1px solid #8B4513',
      boxShadow: '0 4px 8px rgba(139, 69, 19, 0.3)',
    },
    paginationButtonDisabled: {
      opacity: '0.5',
      cursor: 'not-allowed',
      backgroundColor: '#f7fafc',
    },
    paginationEllipsis: {
      padding: '8px 12px',
      color: '#a0aec0',
      fontSize: '14px',
    },
  };

  if (!adminToken) return <div>Access denied. Please log in as admin.</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>User Management</h2>
        <button
          onClick={fetchUsers}
          style={styles.refreshBtn}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = "#2980b9";
            e.target.style.boxShadow = "0 6px 12px rgba(41, 128, 185, 0.5)";
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = "#3498db";
            e.target.style.boxShadow = "0 4px 8px rgba(52, 152, 219, 0.3)";
          }}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div style={{ ...styles.alert, ...styles.alertError }}>{error}</div>
      )}
      {successMessage && (
        <div style={{ ...styles.alert, ...styles.alertSuccess }}>
          {successMessage}
        </div>
      )}

      {loading ? (
        <div style={styles.loading}>Loading users...</div>
      ) : (
        <div style={styles.tableContainer}>
          <table style={styles.table}>
            <thead>
              <tr>
                <th style={styles.tableHeader}>User</th>
                <th style={styles.tableHeader}>Email</th>
                <th style={styles.tableHeader}>Role</th>
                <th style={styles.tableHeader}>Status</th>
                <th style={styles.tableHeader}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ ...styles.tableCell, ...styles.noUsers }}>
                    No users found
                  </td>
                </tr>
              ) : (
                currentUsers.map((user) => (
                  <tr
                    key={user._id}
                    style={styles.tableRow}
                    onMouseOver={(e) =>
                      (e.currentTarget.style.backgroundColor = "#f7fafc")
                    }
                    onMouseOut={(e) =>
                      (e.currentTarget.style.backgroundColor = "transparent")
                    }
                  >
                    <td style={styles.tableCell}>
                      <div style={styles.userCell}>
                        <div 
                          style={{
                            ...styles.profileIcon,
                            backgroundColor: getRandomColor(user.username)
                          }}
                        >
                          {getInitial(user.username)}
                        </div>
                        <div>
                          <div style={{ fontWeight: "600", color: "#2d3748" }}>
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td style={styles.tableCell}>{user.email}</td>
                    <td style={styles.tableCell}>
                      <span style={styles.roleBadge}>{user.role || "User"}</span>
                    </td>
                    <td style={styles.tableCell}>
                      <span style={{ ...styles.statusBadge, ...styles.statusActive }}>
                        Active
                      </span>
                    </td>
                    <td style={styles.tableCell}>
                      <div style={styles.actions}>
                        <button
                          onClick={() => viewUserDetails(user)}
                          style={{ ...styles.actionBtn, ...styles.viewBtn }}
                          onMouseOver={(e) =>
                            (e.target.style.backgroundColor = "#b2f5ea")
                          }
                          onMouseOut={(e) =>
                            (e.target.style.backgroundColor = "#e6fffa")
                          }
                        >
                          View
                        </button>
                        <button
                          onClick={() => handleDelete(user._id)}
                          style={{ ...styles.actionBtn, ...styles.deleteBtn }}
                          onMouseOver={(e) =>
                            (e.target.style.backgroundColor = "#fed7d7")
                          }
                          onMouseOut={(e) =>
                            (e.target.style.backgroundColor = "#fff5f5")
                          }
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          {users.length > itemsPerPage && (
            <div style={styles.paginationContainer}>
              <div style={styles.paginationInfo}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, users.length)} of {users.length} users
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
        </div>
      )}

      {showModal && selectedUser && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h3 style={styles.modalTitle}>User Details</h3>
              <button
                onClick={closeModal}
                style={styles.closeBtn}
                onMouseOver={(e) => (e.target.style.color = "#4a5568")}
                onMouseOut={(e) => (e.target.style.color = "#718096")}
              >
                &times;
              </button>
            </div>
            <div style={styles.modalBody}>
              <div style={styles.modalUserInfo}>
                <div 
                  style={{
                    ...styles.modalProfileIcon,
                    backgroundColor: getRandomColor(selectedUser.username)
                  }}
                >
                  {getInitial(selectedUser.username)}
                </div>
                <div>
                  <h4 style={styles.modalUsername}>{selectedUser.username}</h4>
                  <p style={styles.modalUserEmail}>{selectedUser.email}</p>
                </div>
              </div>
              
              <div style={styles.userDetail}>
                <label style={styles.detailLabel}>Role:</label>
                <span style={styles.detailValue}>{selectedUser.role || "User"}</span>
              </div>
              <div style={styles.userDetail}>
                <label style={styles.detailLabel}>User ID:</label>
                <span style={styles.detailValue}>{selectedUser._id}</span>
              </div>
              <div style={styles.userDetail}>
                <label style={styles.detailLabel}>Joined:</label>
                <span style={styles.detailValue}>
                  {new Date(selectedUser.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div style={styles.userDetail}>
                <label style={styles.detailLabel}>Last Updated:</label>
                <span style={styles.detailValue}>
                  {new Date(selectedUser.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
            </div>
            <div style={styles.modalFooter}>
              <button
                onClick={closeModal}
                style={styles.closeModalBtn}
                onMouseOver={(e) =>
                  (e.target.style.backgroundColor = "#cbd5e0")
                }
                onMouseOut={(e) =>
                  (e.target.style.backgroundColor = "#e2e8f0")
                }
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}