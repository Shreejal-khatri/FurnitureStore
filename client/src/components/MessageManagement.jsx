import React, { useState, useEffect } from 'react';

const MessageManagement = () => {
  const API_BASE_URL = import.meta.env.VITE_API_URL;
  
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [notification, setNotification] = useState({
    show: false,
    type: '',
    message: ''
  });
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  
  const [currentPage, setCurrentPage] = useState(1);
  const [messagesPerPage] = useState(10);

  
  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/contact`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
      } else {
        showNotification('error', 'Failed to fetch messages.');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      showNotification('error', 'Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      
      const response = await fetch(`${API_BASE_URL}/contact/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.ok) {
        setMessages(messages.filter(msg => msg._id !== id));
        showNotification('success', 'Message deleted successfully!');
        if (selectedMessage && selectedMessage._id === id) {
          setShowModal(false);
          setSelectedMessage(null);
        }
      } else {
        showNotification('error', 'Failed to delete message.');
      }
    } catch (error) {
      console.error('Error deleting message:', error);
      showNotification('error', 'Network error. Please try again.');
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const openMessageModal = (message) => {
    setSelectedMessage(message);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedMessage(null);
  };

  
  const indexOfLastMessage = currentPage * messagesPerPage;
  const indexOfFirstMessage = indexOfLastMessage - messagesPerPage;
  const currentMessages = messages.slice(indexOfFirstMessage, indexOfLastMessage);
  const totalPages = Math.ceil(messages.length / messagesPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
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

  return (
    <div className="message-management">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`notification ${notification.type}`}>
          <div className="notification-content">
            <span className="notification-icon">
              {notification.type === 'success' ? '✓' : '✕'}
            </span>
            <span className="notification-message">{notification.message}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="admin-header">
        <div className="header-content">
          <div className="header-icon">
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#8B4513"/>
            </svg>
          </div>
          <div>
            <h1>Message Management</h1>
            <p>View and manage all contact form submissions</p>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="white"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{messages.length}</div>
            <div className="stat-label">Total Messages</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="white"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{currentMessages.length}</div>
            <div className="stat-label">Current Page</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon-box" style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' }}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm2 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" fill="white"/>
            </svg>
          </div>
          <div className="stat-info">
            <div className="stat-value">{totalPages}</div>
            <div className="stat-label">Total Pages</div>
          </div>
        </div>
      </div>

      {/* Messages Table */}
      <div className="messages-container">
        {isLoading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="#d1d5db"/>
              </svg>
            </div>
            <h3>No Messages Yet</h3>
            <p>When users submit the contact form, their messages will appear here.</p>
          </div>
        ) : (
          <>
            <div className="table-wrapper">
              <table className="messages-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Subject</th>
                    <th>Message Preview</th>
                    <th>Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentMessages.map((msg) => (
                    <tr key={msg._id}>
                      <td className="name-cell">
                        <div className="name-avatar">{msg.name.charAt(0).toUpperCase()}</div>
                        <span>{msg.name}</span>
                      </td>
                      <td className="email-cell">
                        <a href={`mailto:${msg.email}`}>{msg.email}</a>
                      </td>
                      <td className="subject-cell">{msg.subject || '-'}</td>
                      <td className="message-preview">
                        {msg.message.substring(0, 50)}
                        {msg.message.length > 50 ? '...' : ''}
                      </td>
                      <td className="date-cell">{formatDate(msg.createdAt)}</td>
                      <td className="actions-cell">
                        <button 
                          className="btn-view"
                          onClick={() => openMessageModal(msg)}
                          title="View full message"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" fill="currentColor"/>
                          </svg>
                        </button>
                        <button 
                          className="btn-delete"
                          onClick={() => handleDelete(msg._id)}
                          title="Delete message"
                        >
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                          </svg>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <div className="pagination-info">
                  Showing {indexOfFirstMessage + 1} to {Math.min(indexOfLastMessage, messages.length)} of {messages.length} messages
                </div>
                <div className="pagination-controls">
                  <button 
                    className="pagination-btn"
                    onClick={goToPreviousPage}
                    disabled={currentPage === 1}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z" fill="currentColor"/>
                    </svg>
                    Previous
                  </button>
                  
                  <div className="pagination-numbers">
                    {getPageNumbers().map((page, index) => (
                      page === '...' ? (
                        <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
                      ) : (
                        <button
                          key={page}
                          className={`pagination-number ${currentPage === page ? 'active' : ''}`}
                          onClick={() => paginate(page)}
                        >
                          {page}
                        </button>
                      )
                    ))}
                  </div>

                  <button 
                    className="pagination-btn"
                    onClick={goToNextPage}
                    disabled={currentPage === totalPages}
                  >
                    Next
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M10 6L8.59 7.41 13.17 12l-4.58 4.59L10 18l6-6z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Message Modal */}
      {showModal && selectedMessage && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Message Details</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            
            <div className="modal-body">
              <div className="detail-row">
                <label>From:</label>
                <div className="detail-value">
                  <div className="sender-info">
                    <div className="sender-avatar">{selectedMessage.name.charAt(0).toUpperCase()}</div>
                    <span>{selectedMessage.name}</span>
                  </div>
                </div>
              </div>
              
              <div className="detail-row">
                <label>Email:</label>
                <div className="detail-value">
                  <a href={`mailto:${selectedMessage.email}`} className="email-link">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" fill="currentColor"/>
                    </svg>
                    {selectedMessage.email}
                  </a>
                </div>
              </div>
              
              {selectedMessage.subject && (
                <div className="detail-row">
                  <label>Subject:</label>
                  <div className="detail-value subject-badge">{selectedMessage.subject}</div>
                </div>
              )}
              
              <div className="detail-row">
                <label>Date:</label>
                <div className="detail-value">
                  <div className="date-badge">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.5-13H11v6l5.25 3.15.75-1.23-4.5-2.67z" fill="currentColor"/>
                    </svg>
                    {formatDate(selectedMessage.createdAt)}
                  </div>
                </div>
              </div>
              
              <div className="detail-row message-full">
                <label>Message:</label>
                <div className="detail-value message-text">{selectedMessage.message}</div>
              </div>
            </div>
            
            <div className="modal-footer">
              <button className="btn-modal-delete" onClick={() => handleDelete(selectedMessage._id)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                </svg>
                Delete Message
              </button>
              <button className="btn-modal-close" onClick={closeModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Styles */}
      <style>{`
        * { box-sizing: border-box; }
        
        .message-management {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
          background: transparent;
          min-height: 100vh;
        }

        /* Header */
        .admin-header {
          margin-bottom: 2rem;
          background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
          padding: 2rem;
          border-radius: 16px;
          box-shadow: 0 4px 20px rgba(139, 69, 19, 0.2);
        }

        .header-content {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .header-icon {
          width: 64px;
          height: 64px;
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(10px);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .admin-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #fff;
          margin: 0 0 0.5rem 0;
        }

        .admin-header p {
          color: rgba(255, 255, 255, 0.9);
          margin: 0;
          font-size: 1rem;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .stat-card {
          background: white;
          border-radius: 16px;
          padding: 1.5rem;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          display: flex;
          align-items: center;
          gap: 1.5rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }

        .stat-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }

        .stat-icon-box {
          width: 64px;
          height: 64px;
          border-radius: 14px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-info {
          display: flex;
          flex-direction: column;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 700;
          color: #111827;
          line-height: 1;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        /* Messages Container */
        .messages-container {
          background: white;
          border-radius: 16px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        /* Loading State */
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          gap: 1rem;
        }

        .spinner {
          width: 48px;
          height: 48px;
          border: 4px solid #f3f4f6;
          border-top-color: #8B4513;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .loading-state p {
          color: #6b7280;
          margin: 0;
          font-weight: 500;
        }

        /* Empty State */
        .empty-state {
          text-align: center;
          padding: 5rem 2rem;
        }

        .empty-icon {
          margin-bottom: 1.5rem;
          opacity: 0.5;
        }

        .empty-state h3 {
          font-size: 1.5rem;
          font-weight: 600;
          color: #111827;
          margin: 0 0 0.75rem 0;
        }

        .empty-state p {
          color: #6b7280;
          margin: 0;
          font-size: 1rem;
        }

        /* Table */
        .table-wrapper {
          overflow-x: auto;
        }

        .messages-table {
          width: 100%;
          border-collapse: collapse;
        }

        .messages-table thead {
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-bottom: 2px solid #e5e7eb;
        }

        .messages-table th {
          padding: 1.25rem 1rem;
          text-align: left;
          font-weight: 600;
          color: #374151;
          font-size: 0.8125rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .messages-table tbody tr {
          border-bottom: 1px solid #f3f4f6;
          transition: all 0.2s;
        }

        .messages-table tbody tr:hover {
          background: #fef8f0;
        }

        .messages-table td {
          padding: 1.25rem 1rem;
          color: #111827;
          font-size: 0.875rem;
        }

        .name-cell {
          font-weight: 600;
          color: #111827;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .name-avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          flex-shrink: 0;
        }

        .email-cell a {
          color: #3b82f6;
          text-decoration: none;
          transition: color 0.2s;
        }

        .email-cell a:hover {
          color: #2563eb;
          text-decoration: underline;
        }

        .subject-cell {
          color: #6b7280;
          font-weight: 500;
        }

        .message-preview {
          max-width: 350px;
          color: #6b7280;
          line-height: 1.5;
        }

        .date-cell {
          color: #6b7280;
          white-space: nowrap;
          font-size: 0.8125rem;
        }

        .actions-cell {
          display: flex;
          gap: 0.5rem;
        }

        .btn-view,
        .btn-delete {
          padding: 0.5rem;
          border: none;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .btn-view {
          background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
          color: #3b82f6;
        }

        .btn-view:hover {
          background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%);
          transform: translateY(-1px);
        }

        .btn-delete {
          background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%);
          color: #ef4444;
        }

        .btn-delete:hover {
          background: linear-gradient(135deg, #fee2e2 0%, #fecaca 100%);
          transform: translateY(-1px);
        }

        /* Pagination */
        .pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem;
          border-top: 1px solid #f3f4f6;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .pagination-info {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .pagination-controls {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .pagination-btn {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: white;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          color: #374151;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        .pagination-number:hover {
          background: #f9fafb;
          border-color: #8B4513;
          color: #8B4513;
        }

        .pagination-number.active {
          background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
          border-color: #8B4513;
          color: white;
        }

        .pagination-ellipsis {
          min-width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
          font-size: 0.875rem;
        }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 1rem;
          animation: fadeIn 0.2s;
          backdrop-filter: blur(4px);
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        .modal-content {
          background: white;
          border-radius: 16px;
          max-width: 640px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          animation: slideUp 0.3s;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
        }

        @keyframes slideUp {
          from {
            transform: translateY(20px);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }

        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #f3f4f6;
          background: linear-gradient(135deg, #fef8f0 0%, #fff 100%);
        }

        .modal-header h2 {
          margin: 0;
          font-size: 1.5rem;
          font-weight: 700;
          color: #8B4513;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .modal-close {
          background: rgba(139, 69, 19, 0.1);
          border: none;
          font-size: 1.5rem;
          color: #8B4513;
          cursor: pointer;
          line-height: 1;
          padding: 0;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .modal-close:hover {
          background: rgba(139, 69, 19, 0.2);
          transform: rotate(90deg);
        }

        .modal-body {
          padding: 2rem;
        }

        .detail-row {
          margin-bottom: 1.5rem;
        }

        .detail-row:last-child {
          margin-bottom: 0;
        }

        .detail-row label {
          display: block;
          font-weight: 600;
          color: #374151;
          margin-bottom: 0.75rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        .detail-value {
          color: #111827;
          font-size: 1rem;
        }

        .sender-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .sender-avatar {
          width: 48px;
          height: 48px;
          border-radius: 50%;
          background: linear-gradient(135deg, #8B4513 0%, #A0522D 100%);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 1.25rem;
        }

        .email-link {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          color: #3b82f6;
          text-decoration: none;
          padding: 0.5rem 1rem;
          background: #eff6ff;
          border-radius: 8px;
          transition: all 0.2s;
        }

        .email-link:hover {
          background: #dbeafe;
          text-decoration: none;
        }

        .subject-badge {
          display: inline-block;
          padding: 0.5rem 1rem;
          background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
          border-radius: 8px;
          font-weight: 500;
          color: #92400e;
        }

        .date-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: #f3f4f6;
          border-radius: 8px;
          color: #6b7280;
          font-weight: 500;
        }

        .message-full {
          margin-top: 2rem;
          padding-top: 2rem;
          border-top: 2px solid #f3f4f6;
        }

        .message-text {
          padding: 1.5rem;
          background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
          border-radius: 12px;
          line-height: 1.7;
          white-space: pre-wrap;
          border: 1px solid #e5e7eb;
          font-size: 0.9375rem;
        }

        .modal-footer {
          display: flex;
          gap: 0.75rem;
          padding: 1.5rem 2rem;
          border-top: 1px solid #f3f4f6;
          justify-content: flex-end;
          background: #fafafa;
        }

        .btn-modal-delete,
        .btn-modal-close {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 0.875rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .btn-modal-delete {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .btn-modal-delete:hover {
          background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
        }

        .btn-modal-close {
          background: white;
          color: #374151;
          border: 1px solid #e5e7eb;
        }

        .btn-modal-close:hover {
          background: #f9fafb;
          border-color: #d1d5db;
        }

        /* Notification Toast */
        .notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 12px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
          z-index: 9999;
          animation: slideInRight 0.3s ease-out;
          max-width: 400px;
          backdrop-filter: blur(10px);
        }

        @keyframes slideInRight {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .notification.success {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          color: white;
        }

        .notification.error {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
        }

        .notification-content {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .notification-icon {
          font-size: 1.25rem;
          font-weight: bold;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.3);
          flex-shrink: 0;
        }

        .notification-message {
          font-size: 0.9375rem;
          line-height: 1.5;
          font-weight: 500;
        }

        /* Responsive */
        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
          }
        }

        @media (max-width: 768px) {
          .admin-header {
            padding: 1.5rem;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
          }

          .admin-header h1 {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .messages-table th,
          .messages-table td {
            padding: 0.875rem 0.5rem;
            font-size: 0.8125rem;
          }

          .message-preview {
            max-width: 200px;
          }

          .name-avatar {
            width: 32px;
            height: 32px;
            font-size: 0.75rem;
          }

          .modal-content {
            margin: 0 0.5rem;
          }

          .modal-header,
          .modal-body,
          .modal-footer {
            padding: 1.25rem;
          }

          .pagination {
            flex-direction: column;
            align-items: stretch;
          }

          .pagination-controls {
            justify-content: center;
          }

          .pagination-btn {
            flex: 1;
          }

          .notification {
            left: 10px;
            right: 10px;
            max-width: calc(100% - 20px);
          }
        }

        @media (max-width: 640px) {
          .actions-cell {
            flex-direction: column;
          }

          .btn-view,
          .btn-delete {
            width: 100%;
          }

          .pagination-numbers {
            gap: 0.125rem;
          }

          .pagination-number {
            min-width: 32px;
            height: 32px;
            font-size: 0.8125rem;
          }
        }

        /* Smooth scrollbar */
        .modal-content::-webkit-scrollbar {
          width: 8px;
        }

        .modal-content::-webkit-scrollbar-track {
          background: #f3f4f6;
        }

        .modal-content::-webkit-scrollbar-thumb {
          background: #8B4513;
          border-radius: 4px;
        }

        .modal-content::-webkit-scrollbar-thumb:hover {
          background: #A0522D;
        }
      `}</style>
    </div>
  );
};

export default MessageManagement; 
        