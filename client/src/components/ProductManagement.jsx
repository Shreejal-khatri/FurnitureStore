import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function ProductManagement() {
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({
    name: '', 
    price: '', 
    description: '', 
    category: '', 
    stock: '',
    additionalInfo: {
      material: '',
      color: '',
      dimensions: '',
      weight: '',
      assemblyRequired: false,
      careInstructions: '',
      warranty: '',
      manufacturer: '',
      style: '',
      features: []
    }
  });
  const [editingProduct, setEditingProduct] = useState(null);

  
  const [addImageFile, setAddImageFile] = useState(null);
  const [addImagePreview, setAddImagePreview] = useState(null);

  const [editImageFile, setEditImageFile] = useState(null);
  const [editImagePreview, setEditImagePreview] = useState(null);

  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const token = localStorage.getItem('adminToken');
  const fileInputRef = useRef(null);
  const editFileInputRef = useRef(null);


  
  const getImageUrl = (imagePath) => {
  if (!imagePath) return '/placeholder-image.jpg';
  if (imagePath.startsWith('http')) return imagePath;

  const BASE_URL = import.meta.env.VITE_API_BASE;

  return imagePath.startsWith('/') ? `${BASE_URL}${imagePath}` : `${BASE_URL}/${imagePath}`;
};


  useEffect(() => {
    fetchProducts();
  }, []);



  const fetchProducts = async () => {
  try {
    setIsLoading(true);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const res = await axios.get(`${API_BASE_URL}/products`);

    setProducts(res.data || []);
    setError('');
  } catch (err) {
    console.error(err);
    setError('Failed to fetch products');
  } finally {
    setIsLoading(false);
  }
};

  
  const handleAddFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setAddImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setAddImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setError('');
    }
  };

  const removeAddImage = () => {
    setAddImageFile(null);
    setAddImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAdditionalInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewProduct(prev => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleFeaturesChange = (e) => {
    const features = e.target.value.split(',').map(f => f.trim()).filter(f => f);
    setNewProduct(prev => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        features
      }
    }));
  };


  const handleAddProduct = async () => {
  if (!newProduct.name || !newProduct.price || !newProduct.description || !newProduct.category || !newProduct.stock) {
    setError('Please fill all required fields.');
    return;
  }

  try {
    setIsLoading(true);
    const formData = new FormData();

    formData.append('name', newProduct.name);
    formData.append('price', newProduct.price);
    formData.append('description', newProduct.description);
    formData.append('category', newProduct.category);
    formData.append('stock', newProduct.stock);

    formData.append('additionalInfo', JSON.stringify(newProduct.additionalInfo));

    if (addImageFile) {
      formData.append('image', addImageFile);
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    const res = await axios.post(`${API_BASE_URL}/products`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    setProducts([res.data, ...products]);
    setNewProduct({ 
      name: '', 
      price: '', 
      description: '', 
      category: '', 
      stock: '',
      additionalInfo: {
        material: '',
        color: '',
        dimensions: '',
        weight: '',
        assemblyRequired: false,
        careInstructions: '',
        warranty: '',
        manufacturer: '',
        style: '',
        features: []
      }
    });
    setAddImageFile(null);
    setAddImagePreview(null);
    setError('');
    setSuccessMessage('Product added successfully!');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }

    setTimeout(() => setSuccessMessage(''), 3000);
  } catch (err) {
    console.error('Error details:', err);
    setError(err.response?.data?.message || 'Failed to add product');
  } finally {
    setIsLoading(false);
  }
};

  
  const openEditModal = (product) => {
    setEditingProduct({ 
      ...product,
      additionalInfo: product.additionalInfo || {
        material: '',
        color: '',
        dimensions: '',
        weight: '',
        assemblyRequired: false,
        careInstructions: '',
        warranty: '',
        manufacturer: '',
        style: '',
        features: []
      }
    });
    setEditImageFile(null);
    setEditImagePreview(
      product.imageUrl ? `${getImageUrl(product.imageUrl)}?t=${Date.now()}` : null
    );
    if (editFileInputRef.current) editFileInputRef.current.value = '';
  };

  const closeEditModal = () => {
    setEditingProduct(null);
    setEditImageFile(null);
    setEditImagePreview(null);
    setError('');
  };

  const handleEditFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError('Image size must be less than 5MB');
        return;
      }
      setEditImageFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setEditImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      setError('');
    }
  };

  const removeEditImage = () => {
    setEditImageFile(null);
    setEditImagePreview(null);
    if (editFileInputRef.current) {
      editFileInputRef.current.value = '';
    }
  };

  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleEditAdditionalInfoChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEditingProduct(prev => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        [name]: type === 'checkbox' ? checked : value
      }
    }));
  };

  const handleEditFeaturesChange = (e) => {
    const features = e.target.value.split(',').map(f => f.trim()).filter(f => f);
    setEditingProduct(prev => ({
      ...prev,
      additionalInfo: {
        ...prev.additionalInfo,
        features
      }
    }));
  };


  const handleEditProduct = async () => {
  if (!editingProduct.name || !editingProduct.price || !editingProduct.description || !editingProduct.category || !editingProduct.stock) {
    setError('Please fill all required fields.');
    return;
  }

  try {
    setIsLoading(true);
    const formData = new FormData();

    formData.append('name', editingProduct.name);
    formData.append('price', editingProduct.price);
    formData.append('description', editingProduct.description);
    formData.append('category', editingProduct.category);
    formData.append('stock', editingProduct.stock);

    formData.append('additionalInfo', JSON.stringify(editingProduct.additionalInfo));

    if (editImageFile) {
      formData.append('image', editImageFile);
    }

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    await axios.put(`${API_BASE_URL}/products/${editingProduct._id}`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
      }
    });

    await fetchProducts();

    closeEditModal();
    setError('');
    setSuccessMessage('Product updated successfully!');

    setTimeout(() => setSuccessMessage(''), 3000);
  } catch (err) {
    console.error('Error details:', err);
    setError(err.response?.data?.message || 'Failed to update product');
  } finally {
    setIsLoading(false);
  }
};

const handleDeleteProduct = async (id) => {
  if (!window.confirm('Are you sure you want to delete this product?')) return;

  try {
    setIsLoading(true);

    const API_BASE_URL = import.meta.env.VITE_API_URL;

    await axios.delete(`${API_BASE_URL}/products/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setProducts(products.filter(p => p._id !== id));
    setSuccessMessage('Product deleted successfully!');

    setTimeout(() => setSuccessMessage(''), 3000);
  } catch (err) {
    console.error(err);
    setError('Failed to delete product');
  } finally {
    setIsLoading(false);
  }
};

  
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstItem, indexOfLastItem);

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


  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.headerContent}>
          <div style={styles.headerText}>
            <h1 style={styles.title}>Product Management</h1>
            <p style={styles.subtitle}>Manage your product inventory with precision and efficiency</p>
          </div>
          <div style={styles.headerStats}>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{products.length}</div>
              <div style={styles.statLabel}>Total Products</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{products.filter(p => p.stock > 0).length}</div>
              <div style={styles.statLabel}>In Stock</div>
            </div>
            <div style={styles.statCard}>
              <div style={styles.statNumber}>{products.filter(p => p.stock === 0).length}</div>
              <div style={styles.statLabel}>Out of Stock</div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div style={styles.alertContainer}>
          <div style={styles.alert}>
            <div style={styles.alertContent}>
              <div style={styles.alertIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="15" y1="9" x2="9" y2="15" />
                  <line x1="9" y1="9" x2="15" y2="15" />
                </svg>
              </div>
              <div>
                <h4 style={styles.alertTitle}>Error</h4>
                <p style={styles.alertMessage}>{error}</p>
              </div>
              <button 
                onClick={() => setError('')}
                style={styles.alertClose}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div style={styles.alertContainer}>
          <div style={{...styles.alert, ...styles.successAlert}}>
            <div style={styles.alertContent}>
              <div style={{...styles.alertIcon, color: '#10b981'}}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22,4 12,14.01 9,11.01" />
                </svg>
              </div>
              <div>
                <h4 style={{...styles.alertTitle, color: '#10b981'}}>Success</h4>
                <p style={{...styles.alertMessage, color: '#047857'}}>{successMessage}</p>
              </div>
              <button 
                onClick={() => setSuccessMessage('')}
                style={{...styles.alertClose, color: '#10b981'}}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {isLoading && (
        <div style={styles.loadingOverlay}>
          <div style={styles.loadingContent}>
            <div style={styles.spinner}></div>
            <span style={styles.loadingText}>Processing...</span>
          </div>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <h2 style={styles.modalTitle}>Edit Product</h2>
              <button onClick={closeEditModal} style={styles.modalCloseButton}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <div style={styles.modalContent}>
              <div style={styles.formGrid}>
                <div style={styles.formColumn}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Product Name <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      placeholder="Enter product name"
                      value={editingProduct.name}
                      onChange={handleEditInputChange}
                      style={styles.input}
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Price (Rs) <span style={styles.required}>*</span>
                    </label>
                    <div style={styles.inputWithIcon}>
                      <span style={styles.inputIcon}>Rs </span>
                      <input
                        type="number"
                        name="price"
                        placeholder="0.00"
                        value={editingProduct.price}
                        onChange={handleEditInputChange}
                        style={{ ...styles.input, paddingLeft: '32px' }}
                        min="0"
                        step="0.01"
                        required
                      />
                    </div>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Category <span style={styles.required}>*</span>
                    </label>
                    <select
                      name="category"
                      value={editingProduct.category}
                      onChange={handleEditInputChange}
                      style={styles.input}
                      required
                    >
                      <option value="">Select category</option>
                      <option value="Sofa">Sofa</option>
                      <option value="Table">Table</option>
                      <option value="Bed">Bed</option>
                      <option value="Chair">Chair</option>
                      <option value="Storage">Storage</option>
                    </select>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>
                      Stock Quantity <span style={styles.required}>*</span>
                    </label>
                    <input
                      type="number"
                      name="stock"
                      placeholder="Enter stock quantity"
                      value={editingProduct.stock}
                      onChange={handleEditInputChange}
                      style={styles.input}
                      min="0"
                      required
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Description <span style={styles.required}>*</span></label>
                    <textarea
                      name="description"
                      placeholder="Enter detailed product description..."
                      value={editingProduct.description}
                      onChange={handleEditInputChange}
                      style={styles.textarea}
                      required
                      rows="4"
                    />
                  </div>
                </div>

                <div style={styles.formColumn}>
                  <div style={styles.formGroup}>
                    <label style={styles.label}>Product Image</label>
                    {editImagePreview ? (
                      <div style={styles.imagePreviewContainer}>
                        <img
                          src={editImagePreview}
                          alt="Product preview"
                          style={styles.imagePreview}
                        />
                        <div style={styles.imagePreviewOverlay}>
                          <button
                            type="button"
                            onClick={removeEditImage}
                            style={styles.removeImageButton}
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <line x1="18" y1="6" x2="6" y2="18" />
                              <line x1="6" y1="6" x2="18" y2="18" />
                            </svg>
                            Remove
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div style={styles.fileDropZone}>
                        <input
                          type="file"
                          onChange={handleEditFileChange}
                          style={styles.fileInput}
                          accept="image/*"
                          id="edit-file-upload"
                          ref={editFileInputRef}
                        />
                        <label htmlFor="edit-file-upload" style={styles.fileDropContent}>
                          <div style={styles.fileDropIcon}>
                            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                              <polyline points="17,8 12,3 7,8" />
                              <line x1="12" y1="3" x2="12" y2="15" />
                            </svg>
                          </div>
                          <div style={styles.fileDropText}>
                            <span style={styles.fileDropTitle}>Click to upload</span>
                            <span style={styles.fileDropSubtitle}>PNG, JPG up to 5MB</span>
                          </div>
                        </label>
                      </div>
                    )}
                  </div>

                  <h3 style={styles.sectionSubtitle}>Additional Information</h3>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Material</label>
                    <input
                      type="text"
                      name="material"
                      placeholder="e.g., Solid Oak Wood"
                      value={editingProduct.additionalInfo?.material || ''}
                      onChange={handleEditAdditionalInfoChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Color</label>
                    <input
                      type="text"
                      name="color"
                      placeholder="e.g., Natural Brown"
                      value={editingProduct.additionalInfo?.color || ''}
                      onChange={handleEditAdditionalInfoChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Dimensions</label>
                    <input
                      type="text"
                      name="dimensions"
                      placeholder="e.g., cm (W) x 90cm (D) x 75cm (H)180"
                      value={editingProduct.additionalInfo?.dimensions || ''}
                      onChange={handleEditAdditionalInfoChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Weight</label>
                    <input
                      type="text"
                      name="weight"
                      placeholder="e.g., 45kg"
                      value={editingProduct.additionalInfo?.weight || ''}
                      onChange={handleEditAdditionalInfoChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Style</label>
                    <input
                      type="text"
                      name="style"
                      placeholder="e.g., Modern, Traditional, Scandinavian"
                      value={editingProduct.additionalInfo?.style || ''}
                      onChange={handleEditAdditionalInfoChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Manufacturer</label>
                    <input
                      type="text"
                      name="manufacturer"
                      placeholder="e.g., Nordic Furniture Co."
                      value={editingProduct.additionalInfo?.manufacturer || ''}
                      onChange={handleEditAdditionalInfoChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Warranty</label>
                    <input
                      type="text"
                      name="warranty"
                      placeholder="e.g., 5 years structural warranty"
                      value={editingProduct.additionalInfo?.warranty || ''}
                      onChange={handleEditAdditionalInfoChange}
                      style={styles.input}
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Care Instructions</label>
                    <textarea
                      name="careInstructions"
                      placeholder="e.g., Wipe with damp cloth. Avoid direct sunlight."
                      value={editingProduct.additionalInfo?.careInstructions || ''}
                      onChange={handleEditAdditionalInfoChange}
                      style={styles.textarea}
                      rows="3"
                    />
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        name="assemblyRequired"
                        checked={editingProduct.additionalInfo?.assemblyRequired || false}
                        onChange={handleEditAdditionalInfoChange}
                        style={styles.checkbox}
                      />
                      <span>Assembly Required</span>
                    </label>
                  </div>

                  <div style={styles.formGroup}>
                    <label style={styles.label}>Features (comma-separated)</label>
                    <input
                      type="text"
                      name="features"
                      placeholder="e.g., Extendable, Scratch-resistant, Eco-friendly"
                      value={editingProduct.additionalInfo?.features?.join(', ') || ''}
                      onChange={handleEditFeaturesChange}
                      style={styles.input}
                    />
                  </div>
                </div>
              </div>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={closeEditModal}
                style={styles.secondaryButton}
              >
                Cancel
              </button>
              <button
                onClick={handleEditProduct}
                style={{
                  ...styles.primaryButton,
                  ...(isLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {})
                }}
                disabled={isLoading}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
                </svg>
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Product Form */}
      <div style={styles.addProductSection}>
        <h2 style={styles.sectionTitle}>Add New Product</h2>
        <div style={styles.formGrid}>
          <div style={styles.formColumn}>
            {/* ADDED MISSING REQUIRED FIELDS */}
            <div style={styles.formGroup}>
              <label style={styles.label}>
                Product Name <span style={styles.required}>*</span>
              </label>
              <input
                type="text"
                name="name"
                placeholder="Enter product name"
                value={newProduct.name}
                onChange={handleInputChange}
                style={styles.input}
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Price (Rs) <span style={styles.required}>*</span>
              </label>
              <div style={styles.inputWithIcon}>
                <span style={styles.inputIcon}>Rs </span>
                <input
                  type="number"
                  name="price"
                  placeholder="0.00"
                  value={newProduct.price}
                  onChange={handleInputChange}
                  style={{ ...styles.input, paddingLeft: '32px' }}
                  min="0"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Category <span style={styles.required}>*</span>
              </label>
              <select
                name="category"
                value={newProduct.category}
                onChange={handleInputChange}
                style={styles.input}
                required
              >
                <option value="">Select category</option>
                <option value="Sofa">Sofa</option>
                <option value="Table">Table</option>
                <option value="Bed">Bed</option>
                <option value="Chair">Chair</option>
                <option value="Storage">Storage</option>
              </select>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Stock Quantity <span style={styles.required}>*</span>
              </label>
              <input
                type="number"
                name="stock"
                placeholder="Enter stock quantity"
                value={newProduct.stock}
                onChange={handleInputChange}
                style={styles.input}
                min="0"
                required
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>
                Description <span style={styles.required}>*</span>
              </label>
              <textarea
                name="description"
                placeholder="Enter detailed product description..."
                value={newProduct.description}
                onChange={handleInputChange}
                style={styles.textarea}
                required
                rows="6"
              />
            </div>
          </div>

          <div style={styles.formColumn}>
            <div style={styles.formGroup}>
              <label style={styles.label}>Product Image</label>

              {addImagePreview ? (
                <div style={styles.imagePreviewContainer}>
                  <img
                    src={addImagePreview}
                    alt="Product preview"
                    style={styles.imagePreview}
                  />
                  <div style={styles.imagePreviewOverlay}>
                    <button
                      type="button"
                      onClick={removeAddImage}
                      style={styles.removeImageButton}
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="18" y1="6" x2="6" y2="18" />
                        <line x1="6" y1="6" x2="18" y2="18" />
                      </svg>
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <div style={styles.fileDropZone}>
                  <input
                    type="file"
                    onChange={handleAddFileChange}
                    style={styles.fileInput}
                    accept="image/*"
                    id="add-file-upload"
                    ref={fileInputRef}
                  />
                  <label htmlFor="add-file-upload" style={styles.fileDropContent}>
                    <div style={styles.fileDropIcon}>
                      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17,8 12,3 7,8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    </div>
                    <div style={styles.fileDropText}>
                      <span style={styles.fileDropTitle}>
                        Click to upload or drag and drop
                      </span>
                      <span style={styles.fileDropSubtitle}>PNG, JPG, GIF up to 5MB</span>
                    </div>
                  </label>
                </div>
              )}
            </div>

            <h3 style={styles.sectionSubtitle}>Additional Information</h3>

            <div style={styles.formGroup}>
              <label style={styles.label}>Material</label>
              <input
                type="text"
                name="material"
                placeholder="e.g., Solid Oak Wood"
                value={newProduct.additionalInfo.material}
                onChange={handleAdditionalInfoChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Color</label>
              <input
                type="text"
                name="color"
                placeholder="e.g., Natural Brown"
                value={newProduct.additionalInfo.color}
                onChange={handleAdditionalInfoChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Dimensions</label>
              <input
                type="text"
                name="dimensions"
                placeholder="e.g., 180cm (W) x 90cm (D) x 75cm (H)"
                value={newProduct.additionalInfo.dimensions}
                onChange={handleAdditionalInfoChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Weight</label>
              <input
                type="text"
                name="weight"
                placeholder="e.g., 45kg"
                value={newProduct.additionalInfo.weight}
                onChange={handleAdditionalInfoChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Style</label>
              <input
                type="text"
                name="style"
                placeholder="e.g., Modern, Traditional, Scandinavian"
                value={newProduct.additionalInfo.style}
                onChange={handleAdditionalInfoChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Manufacturer</label>
              <input
                type="text"
                name="manufacturer"
                placeholder="e.g., Nordic Furniture Co."
                value={newProduct.additionalInfo.manufacturer}
                onChange={handleAdditionalInfoChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Warranty</label>
              <input
                type="text"
                name="warranty"
                placeholder="e.g., 5 years structural warranty"
                value={newProduct.additionalInfo.warranty}
                onChange={handleAdditionalInfoChange}
                style={styles.input}
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Care Instructions</label>
              <textarea
                name="careInstructions"
                placeholder="e.g., Wipe with damp cloth. Avoid direct sunlight."
                value={newProduct.additionalInfo.careInstructions}
                onChange={handleAdditionalInfoChange}
                style={styles.textarea}
                rows="3"
              />
            </div>

            <div style={styles.formGroup}>
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  name="assemblyRequired"
                  checked={newProduct.additionalInfo.assemblyRequired}
                  onChange={handleAdditionalInfoChange}
                  style={styles.checkbox}
                />
                <span>Assembly Required</span>
              </label>
            </div>

            <div style={styles.formGroup}>
              <label style={styles.label}>Features (comma-separated)</label>
              <input
                type="text"
                name="features"
                placeholder="e.g., Extendable, Scratch-resistant, Eco-friendly"
                value={newProduct.additionalInfo.features.join(', ')}
                onChange={handleFeaturesChange}
                style={styles.input}
              />
            </div>
          </div>
        </div>

        <div style={styles.formActions}>
          <button
            onClick={handleAddProduct}
            style={{
              ...styles.primaryButton,
              ...(isLoading ? { opacity: 0.6, cursor: 'not-allowed' } : {})
            }}
            disabled={isLoading}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 8 }}>
              <path d="M12 20h9" />
              <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4 12.5-12.5z" />
            </svg>
            Add Product
          </button>
        </div>
      </div>

      {/* Products List */}
      <div style={styles.productsList}>
        <h2 style={styles.sectionTitle}>Product List</h2>
        {products.length === 0 ? (
          <p style={styles.noProductsText}>No products available.</p>
        ) : (
          <>
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.tableHeader}>Image</th>
                    <th style={styles.tableHeader}>Name</th>
                    <th style={styles.tableHeader}>Price</th>
                    <th style={styles.tableHeader}>Category</th>
                    <th style={styles.tableHeader}>Stock</th>
                    <th style={styles.tableHeader}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {currentProducts.map((product, index) => (
                    <tr key={product._id} style={{
                      ...styles.tableRow,
                      backgroundColor: index % 2 === 0 ? '#f9fafb' : 'white'
                    }}>
                      <td style={styles.tableCell}>
                        <div style={styles.productImageContainer}>
                          <img
                            src={getImageUrl(product.imageUrl)}
                            alt={product.name}
                            style={styles.productImage}
                            onError={(e) => {
                              e.target.src = '/placeholder-image.jpg';
                            }}
                          />
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.productDetails}>
                          <div style={styles.productName}>{product.name}</div>
                          <div style={styles.productDescription}>{product.description}</div>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.priceContainer}>
                          <span style={styles.price}>Rs {parseFloat(product.price).toFixed(2)}</span>
                        </div>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={styles.categoryBadge}>{product.category}</span>
                      </td>
                      <td style={styles.tableCell}>
                        <span style={{
                          ...styles.stockBadge,
                          ...(product.stock > 10 ? styles.stockGood : 
                               product.stock > 0 ? styles.stockWarning : styles.stockDanger)
                        }}>
                          {product.stock}
                        </span>
                      </td>
                      <td style={styles.tableCell}>
                        <div style={styles.actionButtons}>
                          <button
                            onClick={() => openEditModal(product)}
                            style={styles.editButton}
                            title="Edit Product"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                            </svg>
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteProduct(product._id)}
                            style={styles.deleteButton}
                            title="Delete Product"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18" />
                              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                            </svg>
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {products.length > itemsPerPage && (
              <div style={styles.paginationContainer}>
                <div style={styles.paginationInfo}>
                  Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, products.length)} of {products.length} products
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
    </div>
  );
}

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
  headerText: {
    color: 'white',
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
  headerStats: {
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
  alertContainer: {
    marginBottom: '24px',
  },
  alert: {
    backgroundColor: '#fee2e2',
    border: '1px solid #fecaca',
    borderRadius: '12px',
    padding: '16px',
    boxShadow: '0 4px 12px rgba(220, 38, 38, 0.1)',
  },
  successAlert: {
    backgroundColor: '#d1fae5',
    border: '1px solid #a7f3d0',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.1)',
  },
  alertContent: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '12px',
  },
  alertIcon: {
    color: '#ef4444',
    flexShrink: 0,
  },
  alertTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#991b1b',
    margin: '0 0 4px 0',
  },
  alertMessage: {
    fontSize: '14px',
    color: '#7f1d1d',
    margin: 0,
  },
  alertClose: {
    marginLeft: 'auto',
    background: 'none',
    border: 'none',
    color: '#ef4444',
    cursor: 'pointer',
    padding: '4px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '4px',
    transition: 'background-color 0.2s',
  },
  loadingOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(8px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
  },
  loadingContent: {
    backgroundColor: 'white',
    padding: '32px 48px',
    borderRadius: '16px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    boxShadow: '0 20px 50px rgba(0, 0, 0, 0.3)',
    border: '1px solid #e7e5e4',
  },
  spinner: {
    width: '48px',
    height: '48px',
    border: '4px solid #f3f4f6',
    borderTop: '4px solid #8B4513',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  },
  loadingText: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#374151',
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
    maxWidth: '1100px',
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
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '8px',
    transition: 'all 0.2s',
  },
  modalContent: {
    padding: '32px',
  },
  modalActions: {
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    padding: '24px 32px',
    borderTop: '1px solid #e5e7eb',
  },
  addProductSection: {
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
  sectionSubtitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#8B4513',
    marginTop: '24px',
    marginBottom: '16px',
    paddingBottom: '8px',
    borderBottom: '2px solid #fed7aa',
  },
  formGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '24px',
  },
  formColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
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
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  required: {
    color: '#ef4444',
  },
  input: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: 'inherit',
    backgroundColor: 'white',
  },
  inputWithIcon: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: '16px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#8B4513',
    fontSize: '14px',
    fontWeight: '600',
  },
  textarea: {
    padding: '12px 16px',
    border: '2px solid #e5e7eb',
    borderRadius: '10px',
    fontSize: '14px',
    transition: 'all 0.3s ease',
    outline: 'none',
    fontFamily: 'inherit',
    resize: 'vertical',
    minHeight: '120px',
    backgroundColor: 'white',
  },
  checkboxLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    fontSize: '14px',
    fontWeight: '500',
    color: '#374151',
    cursor: 'pointer',
  },
  checkbox: {
    width: '18px',
    height: '18px',
    cursor: 'pointer',
  },
  fileDropZone: {
    border: '2px dashed #d6d3d1',
    borderRadius: '12px',
    padding: '32px',
    textAlign: 'center',
    transition: 'all 0.3s ease',
    cursor: 'pointer',
    backgroundColor: '#fafaf9',
  },
  fileInput: {
    display: 'none',
  },
  fileDropContent: {
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
  },
  fileDropIcon: {
    color: '#8B4513',
  },
  fileDropText: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  fileDropTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#374151',
  },
  fileDropSubtitle: {
    fontSize: '12px',
    color: '#6b7280',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: '12px',
    overflow: 'hidden',
    border: '2px solid #e5e7eb',
    transition: 'all 0.3s ease',
  },
  imagePreview: {
    width: '100%',
    height: '200px',
    objectFit: 'cover',
    display: 'block',
  },
  imagePreviewOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(139, 69, 19, 0.9)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    opacity: 0,
    transition: 'opacity 0.3s ease',
  },
  removeImageButton: {
    backgroundColor: '#ef4444',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '8px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
  },
  formActions: {
    marginTop: '24px',
    display: 'flex',
    justifyContent: 'flex-end',
    gap: '12px',
    paddingTop: '24px',
    borderTop: '1px solid #e7e5e4',
  },
  primaryButton: {
    background: 'linear-gradient(135deg, #8B4513 0%, #A0522D 100%)',
    color: 'white',
    border: 'none',
    padding: '12px 28px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    transition: 'all 0.3s ease',
    boxShadow: '0 4px 12px rgba(139, 69, 19, 0.3)',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    color: '#8B4513',
    border: '2px solid #8B4513',
    padding: '12px 28px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
  },
  productsList: {
    backgroundColor: 'white',
    borderRadius: '16px',
    padding: '32px',
    boxShadow: '0 4px 25px rgba(0, 0, 0, 0.08)',
    border: '1px solid rgba(139, 69, 19, 0.05)',
  },
  noProductsText: {
    textAlign: 'center',
    color: '#6b7280',
    fontSize: '16px',
    padding: '48px',
  },
  tableContainer: {
    overflowX: 'auto',
    borderRadius: '12px',
    border: '1px solid #e7e5e4',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
  },
  table: {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
  },
  tableHeader: {
    backgroundColor: '#fafaf9',
    padding: '16px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: '700',
    color: '#374151',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    borderBottom: '2px solid #e7e5e4',
    background: 'linear-gradient(135deg, #fefefe 0%, #fafaf9 100%)',
  },
  tableRow: {
    transition: 'all 0.3s ease',
    borderBottom: '1px solid #f3f4f6',
  },
  tableCell: {
    padding: '16px',
    borderBottom: '1px solid #f3f4f6',
  },
  productImageContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '8px',
    overflow: 'hidden',
    border: '2px solid #e7e5e4',
    backgroundColor: '#f5f5f4',
  },
  productImage: {
    width: '100%',
    height: '100%',
    objectFit: 'cover',
  },
  productDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  productName: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#111827',
  },
  productDescription: {
    fontSize: '13px',
    color: '#6b7280',
    maxWidth: '300px',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  priceContainer: {
    display: 'flex',
    alignItems: 'center',
  },
  price: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#059669',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '6px 12px',
    backgroundColor: '#fef7ed',
    color: '#8B4513',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '600',
    border: '1px solid #fed7aa',
  },
  stockBadge: {
    display: 'inline-block',
    padding: '8px 16px',
    borderRadius: '20px',
    fontSize: '13px',
    fontWeight: '700',
    textShadow: '0 1px 2px rgba(0, 0, 0, 0.1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
    border: '1px solid transparent',
  },
  stockGood: {
    backgroundColor: '#dcfce7',
    color: '#166534',
    borderColor: '#bbf7d0',
    boxShadow: '0 4px 15px rgba(34, 197, 94, 0.3), 0 0 20px rgba(34, 197, 94, 0.1)',
  },
  stockWarning: {
    backgroundColor: '#fef3c7',
    color: '#92400e',
    borderColor: '#fde68a',
    boxShadow: '0 4px 15px rgba(245, 158, 11, 0.3), 0 0 20px rgba(245, 158, 11, 0.1)',
  },
  stockDanger: {
    backgroundColor: '#fee2e2',
    color: '#991b1b',
    borderColor: '#fecaca',
    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3), 0 0 20px rgba(239, 68, 68, 0.1)',
  },
  actionButtons: {
    display: 'flex',
    gap: '8px',
  },
  editButton: {
    backgroundColor: '#fef7ed',
    color: '#8B4513',
    border: '1px solid #fed7aa',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s ease',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fecaca',
    padding: '8px 16px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'all 0.3s ease',
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

const spinAnimation = `
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = spinAnimation;
  document.head.appendChild(styleSheet);
}