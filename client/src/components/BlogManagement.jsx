import { useState, useEffect } from 'react';
import axios from 'axios';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Plus, Edit2, Trash2, X, Image as ImageIcon, Search, Calendar, User, Tag } from 'lucide-react';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingBlog, setEditingBlog] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [filterCategory, setFilterCategory] = useState('');

  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 3;

  const categories = ['Crafts', 'Design', 'Handmade', 'Interior', 'Wood', 'Other'];

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    author: '',
    category: 'Other',
    image: null
  });
  
  const token = localStorage.getItem('adminToken'); 
  const API_BASE_URL = import.meta.env.VITE_API_URL;

  const modules = {
    toolbar: [
      [{ header: [1, 2, 3, 4, 5, 6, false] }],
      [{ font: [] }],
      [{ size: [] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{ list: 'ordered' }, { list: 'bullet' }, { indent: '-1' }, { indent: '+1' }],
      ['link', 'image', 'video'],
      [{ color: [] }, { background: [] }],
      [{ align: [] }],
      ['clean']
    ],
    clipboard: {
      matchVisual: false
    }
  };

  const formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image', 'video',
    'color', 'background',
    'align'
  ];

  useEffect(() => {
    fetchBlogs();
  }, []);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/blogs`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(response.data);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch blogs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleContentChange = (value) => {
    setFormData(prev => ({ ...prev, content: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.content || !formData.category) {
      setError('Title, content, and category are required');
      return;
    }

    if (!editingBlog && !formData.image) {
      setError('Image is required for new blogs');
      return;
    }

    try {
      setIsLoading(true);
      setError('');

      const data = new FormData();
      data.append('title', formData.title);
      data.append('content', formData.content);
      data.append('author', formData.author || 'Admin');
      data.append('category', formData.category);
      if (formData.image) {
        data.append('image', formData.image);
      }

      if (editingBlog) {
        const response = await axios.put(
          `${API_BASE_URL}/blogs/${editingBlog._id}`,
          data,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );
        setBlogs(blogs.map(b => b._id === editingBlog._id ? response.data : b));
        setSuccessMessage('Blog updated successfully!');
      } else {
        const response = await axios.post(`${API_BASE_URL}/blogs`, data, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
        setBlogs([response.data, ...blogs]);
        setSuccessMessage('Blog created successfully!');
      }

      resetForm();
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to save blog');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (blog) => {
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      author: blog.author,
      category: blog.category || 'Other',
      image: null
    });
    setImagePreview(blog.imageUrl);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;

    try {
      setIsLoading(true);
      await axios.delete(`${API_BASE_URL}/blogs/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBlogs(blogs.filter(b => b._id !== id));
      setSuccessMessage('Blog deleted successfully!');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error(err);
      setError('Failed to delete blog');
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', content: '', author: '', category: 'Other', image: null });
    setImagePreview(null);
    setEditingBlog(null);
    setShowModal(false);
  };

  const stripHtml = (html) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  const filteredBlogs = blogs.filter(blog => {
    const matchesSearch = blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      stripHtml(blog.content).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === '' || blog.category === filterCategory;
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

  const getCategoryColor = (category) => {
    const colors = {
      'Crafts': '#8b5cf6',
      'Design': '#3b82f6',
      'Handmade': '#ec4899',
      'Interior': '#10b981',
      'Wood': '#f59e0b',
      'Other': '#6b7280'
    };
    return colors[category] || colors['Other'];
  };

  return (
    <div style={styles.container}>
      <style>{`
        * {
          box-sizing: border-box;
        }
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .modal-overlay {
          animation: fadeIn 0.2s ease;
        }
        .modal-content {
          animation: slideIn 0.3s ease;
        }
        .blog-card {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .blog-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.12);
        }
        .blog-card:hover .card-image {
          transform: scale(1.05);
        }
        .card-image {
          transition: transform 0.3s ease;
        }
        .quill {
          background: white;
        }
        .ql-container {
          font-size: 15px;
          min-height: 300px;
          max-height: 400px;
          overflow-y: auto;
        }
        .ql-editor {
          min-height: 300px;
        }
        .ql-toolbar {
          border-top-left-radius: 8px;
          border-top-right-radius: 8px;
          background: #f9fafb;
          border: 1px solid #e5e7eb;
        }
        .ql-container {
          border-bottom-left-radius: 8px;
          border-bottom-right-radius: 8px;
          border: 1px solid #e5e7eb;
          border-top: none;
        }
        .blog-content {
          line-height: 1.6;
          color: #374151;
        }
        .blog-content p {
          margin-bottom: 12px;
        }
        .blog-content h1, .blog-content h2, .blog-content h3 {
          margin-top: 16px;
          margin-bottom: 8px;
          font-weight: 600;
        }
        .blog-content ul, .blog-content ol {
          margin-left: 20px;
          margin-bottom: 12px;
        }
        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 6px;
          margin: 12px 0;
        }
        .add-button:hover {
          background: #1d4ed8;
          transform: translateY(-1px);
          box-shadow: 0 8px 16px rgba(37, 99, 235, 0.3);
        }
        .edit-button:hover {
          background: #e5e7eb;
        }
        .delete-button:hover {
          background: #fecaca;
        }
        .cancel-button:hover {
          background: #e5e7eb;
        }
        .submit-button:hover {
          background: #1d4ed8;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .submit-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        .category-badge {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          padding: 4px 10px;
          border-radius: 12px;
          font-size: 12px;
          font-weight: 600;
          color: white;
          margin-bottom: 12px;
        }
        .filter-button {
          padding: 8px 16px;
          border: 2px solid #e5e7eb;
          background: white;
          border-radius: 20px;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          color: #6b7280;
          white-space: nowrap;
        }
        .filter-button:hover {
          border-color: #2563eb;
          color: #2563eb;
        }
        .filter-button.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }
        select {
          cursor: pointer;
        }
        select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .file-label:hover {
          border-color: #2563eb;
          background: #f9fafb;
        }

        @media (max-width: 768px) {
          .modal-content {
            width: 95vw !important;
            max-height: 95vh !important;
            margin: 0 !important;
          }
          .form-row-responsive {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>

      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerText}>
          <h1 style={styles.title}>Blog Management</h1>
          <p style={styles.subtitle}>Create, edit, and manage your blog posts with categories</p>
        </div>
        <button className="add-button" style={styles.addButton} onClick={() => setShowModal(true)}>
          <Plus size={20} />
          <span>New Blog</span>
        </button>
      </div>

      {/* Messages */}
      {successMessage && (
        <div style={styles.successMessage}>{successMessage}</div>
      )}
      {error && (
        <div style={styles.errorMessage}>{error}</div>
      )}

      {/* Search and Filter Bar */}
      <div style={styles.controlsContainer}>
        <div style={styles.searchContainer}>
          <Search size={20} style={styles.searchIcon} />
          <input
            type="text"
            placeholder="Search blogs by title or content..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        <div style={styles.filterContainer}>
          <button
            className={`filter-button ${filterCategory === '' ? 'active' : ''}`}
            onClick={() => setFilterCategory('')}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              className={`filter-button ${filterCategory === cat ? 'active' : ''}`}
              onClick={() => setFilterCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Blog Grid */}
      {isLoading ? (
        <div style={styles.loader}>
          <div style={styles.spinner}></div>
          <p>Loading blogs...</p>
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            {currentBlogs.map(blog => (
              <div key={blog._id} className="blog-card" style={styles.card}>
                <div style={styles.imageContainer}>
                  <img src={blog.imageUrl} alt={blog.title} className="card-image" style={styles.cardImage} />
                  <div 
                    className="category-badge" 
                    style={{
                      ...styles.categoryBadge,
                      background: getCategoryColor(blog.category)
                    }}
                  >
                    <Tag size={12} />
                    {blog.category}
                  </div>
                </div>
                <div style={styles.cardContent}>
                  <h3 style={styles.cardTitle}>{blog.title}</h3>
                  <div 
                    className="blog-content"
                    style={styles.cardDescription}
                    dangerouslySetInnerHTML={{ 
                      __html: stripHtml(blog.content).substring(0, 120) + '...'
                    }}
                  />
                  <div style={styles.cardMeta}>
                    <div style={styles.metaItem}>
                      <User size={14} />
                      <span>{blog.author}</span>
                    </div>
                    <div style={styles.metaItem}>
                      <Calendar size={14} />
                      <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={styles.cardActions}>
                    <button className="edit-button" style={styles.editButton} onClick={() => handleEdit(blog)}>
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button className="delete-button" style={styles.deleteButton} onClick={() => handleDelete(blog._id)}>
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination - EXACTLY like UserManagement */}
          {filteredBlogs.length > itemsPerPage && (
            <div style={styles.paginationContainer}>
              <div style={styles.paginationInfo}>
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredBlogs.length)} of {filteredBlogs.length} blogs
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

      {filteredBlogs.length === 0 && !isLoading && (
        <div style={styles.emptyState}>
          <ImageIcon size={48} style={{ opacity: 0.3 }} />
          <p style={styles.emptyText}>
            {searchTerm || filterCategory ? 'No blogs found matching your filters' : 'No blogs found'}
          </p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" style={styles.modalOverlay} onClick={resetForm}>
          <div className="modal-content" style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>
                {editingBlog ? 'Edit Blog' : 'Create New Blog'}
              </h2>
              <button style={styles.closeButton} onClick={resetForm}>
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={styles.form}>
              <div className="form-row-responsive" style={styles.formRow}>
                <div style={styles.formGroup}>
                  <label style={styles.label}>Title *</label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    style={styles.input}
                    placeholder="Enter blog title"
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Category *</label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    style={styles.select}
                    required
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Author</label>
                <input
                  type="text"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  style={styles.input}
                  placeholder="Enter author name (defaults to Admin)"
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>Content *</label>
                <ReactQuill
                  theme="snow"
                  value={formData.content}
                  onChange={handleContentChange}
                  modules={modules}
                  formats={formats}
                  placeholder="Write your blog content with rich formatting..."
                />
              </div>

              <div style={styles.formGroup}>
                <label style={styles.label}>
                  Featured Image {!editingBlog && '*'}
                </label>
                <div style={styles.imageUpload}>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={styles.fileInput}
                    id="imageUpload"
                  />
                  <label htmlFor="imageUpload" className="file-label" style={styles.fileLabel}>
                    <ImageIcon size={20} />
                    <span style={styles.fileLabelText}>{formData.image ? formData.image.name : 'Choose an image'}</span>
                  </label>
                </div>
                {imagePreview && (
                  <div style={styles.previewContainer}>
                    <img src={imagePreview} alt="Preview" style={styles.preview} />
                  </div>
                )}
              </div>

              <div style={styles.modalActions}>
                <button type="button" className="cancel-button" style={styles.cancelButton} onClick={resetForm}>
                  Cancel
                </button>
                <button type="submit" className="submit-button" style={styles.submitButton} disabled={isLoading}>
                  {isLoading ? 'Saving...' : editingBlog ? 'Update Blog' : 'Create Blog'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: '20px',
    maxWidth: '1400px',
    margin: '0 auto',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
    boxSizing: 'border-box'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '32px',
    flexWrap: 'wrap',
    gap: '16px'
  },
  headerText: {
    flex: '1',
    minWidth: '200px'
  },
  title: {
    fontSize: 'clamp(24px, 5vw, 36px)',
    fontWeight: '700',
    color: '#111827',
    margin: '0 0 6px 0',
    letterSpacing: '-0.5px',
    wordBreak: 'break-word'
  },
  subtitle: {
    fontSize: 'clamp(14px, 2.5vw, 16px)',
    color: '#6b7280',
    margin: 0,
    wordBreak: 'break-word'
  },
  addButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '10px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    whiteSpace: 'nowrap'
  },
  successMessage: {
    padding: '16px 20px',
    backgroundColor: '#d1fae5',
    color: '#065f46',
    borderRadius: '10px',
    marginBottom: '24px',
    border: '1px solid #a7f3d0',
    fontWeight: '500',
    wordBreak: 'break-word'
  },
  errorMessage: {
    padding: '16px 20px',
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderRadius: '10px',
    marginBottom: '24px',
    border: '1px solid #fecaca',
    fontWeight: '500',
    wordBreak: 'break-word'
  },
  controlsContainer: {
    marginBottom: '28px',
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  searchContainer: {
    position: 'relative',
    width: '100%'
  },
  searchIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#9ca3af',
    pointerEvents: 'none',
    flexShrink: 0
  },
  searchInput: {
    width: '100%',
    padding: '12px 16px 12px 48px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    outline: 'none',
    transition: 'all 0.2s',
    backgroundColor: 'white',
    boxSizing: 'border-box'
  },
  filterContainer: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    overflowX: 'auto',
    paddingBottom: '4px'
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 340px), 1fr))',
    gap: '28px'
  },
  card: {
    backgroundColor: 'white',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    border: '1px solid #e5e7eb'
  },
  imageContainer: {
    width: '100%',
    height: '220px',
    overflow: 'hidden',
    backgroundColor: '#f3f4f6',
    position: 'relative'
  },
  cardImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover'
  },
  categoryBadge: {
    position: 'absolute',
    top: '12px',
    right: '12px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
  },
  cardContent: {
    padding: '24px'
  },
  cardTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#111827',
    margin: '0 0 12px 0',
    lineHeight: '1.4',
    wordBreak: 'break-word'
  },
  cardDescription: {
    fontSize: '14px',
    color: '#6b7280',
    lineHeight: '1.6',
    marginBottom: '16px',
    wordBreak: 'break-word'
  },
  cardMeta: {
    display: 'flex',
    gap: '16px',
    marginBottom: '16px',
    fontSize: '13px',
    color: '#6b7280',
    flexWrap: 'wrap'
  },
  metaItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    minWidth: 0
  },
  cardActions: {
    display: 'flex',
    gap: '10px',
    paddingTop: '16px',
    borderTop: '1px solid #f3f4f6'
  },
  editButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  deleteButton: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px 16px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    padding: '20px',
    backdropFilter: 'blur(2px)',
    overflowY: 'auto'
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '16px',
    width: '100%',
    maxWidth: '900px',
    maxHeight: '90vh',
    overflow: 'auto',
    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    margin: 'auto'
  },
  modalHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '28px',
    borderBottom: '1px solid #e5e7eb',
    position: 'sticky',
    top: 0,
    backgroundColor: 'white',
    zIndex: 10
  },
  modalTitle: {
    fontSize: 'clamp(20px, 4vw, 24px)',
    fontWeight: '600',
    color: '#111827',
    margin: 0,
    wordBreak: 'break-word',
    paddingRight: '12px'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    padding: '4px',
    display: 'flex',
    transition: 'color 0.2s',
    flexShrink: 0
  },
  form: {
    padding: '28px'
  },
  formRow: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '20px',
    marginBottom: '24px'
  },
  formGroup: {
    marginBottom: '24px'
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
    marginBottom: '8px'
  },
  input: {
    width: '100%',
    padding: '11px 14px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box'
  },
  select: {
    width: '100%',
    padding: '11px 14px',
    fontSize: '15px',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    outline: 'none',
    transition: 'all 0.2s',
    boxSizing: 'border-box',
    backgroundColor: 'white'
  },
  imageUpload: {
    marginBottom: '12px'
  },
  fileInput: {
    display: 'none'
  },
  fileLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '12px 18px',
    border: '2px dashed #d1d5db',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    color: '#6b7280',
    fontSize: '14px',
    fontWeight: '500'
  },
  fileLabelText: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap'
  },
  previewContainer: {
    marginTop: '12px',
    borderRadius: '10px',
    overflow: 'hidden',
    border: '1px solid #e5e7eb'
  },
  preview: {
    width: '100%',
    maxHeight: '240px',
    objectFit: 'cover'
  },
  modalActions: {
    display: 'flex',
    gap: '12px',
    justifyContent: 'flex-end',
    marginTop: '28px',
    paddingTop: '24px',
    borderTop: '1px solid #e5e7eb',
    flexWrap: 'wrap'
  },
  cancelButton: {
    padding: '11px 24px',
    backgroundColor: '#f3f4f6',
    color: '#374151',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'all 0.2s'
  },
  submitButton: {
    padding: '11px 28px',
    backgroundColor: '#2563eb',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '15px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)'
  },
  loader: {
    textAlign: 'center',
    padding: '80px 20px',
    fontSize: '16px',
    color: '#6b7280'
  },
  spinner: {
    width: '40px',
    height: '40px',
    margin: '0 auto 16px',
    border: '4px solid #e5e7eb',
    borderTop: '4px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite'
  },
  emptyState: {
    textAlign: 'center',
    padding: '100px 20px',
    color: '#9ca3af'
  },
  emptyText: {
    marginTop: '16px',
    fontSize: '16px',
    fontWeight: '500'
  },
 
  paginationContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '24px 20px',
    borderTop: '1.5px solid #e2e8f0',
    marginTop: '20px',
    backgroundColor: 'white',
    borderRadius: '12px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
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

export default BlogManagement;