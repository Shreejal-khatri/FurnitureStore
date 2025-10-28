import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FaFacebookF, FaLinkedinIn, FaTwitter, FaHeart, FaRegHeart, FaStar, FaStarHalfAlt } from 'react-icons/fa';
import Navbar from '../components/Navbar'; 
import Footer from '../components/Footer'; 
import { useAuth } from '../context/AuthContext'; 

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useAuth(); 
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState('description');
  const [selectedImage, setSelectedImage] = useState(0);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showError, setShowError] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [wishlistLoading, setWishlistLoading] = useState(false);


  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [hasUserReviewed, setHasUserReviewed] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);

  
  const getImageUrl = (imagePath) => {
    if (!imagePath) return '/placeholder-image.jpg';
    if (imagePath.startsWith('http')) return imagePath;

    const BASE_URL = import.meta.env.VITE_API_BASE_URL;
    return imagePath.startsWith('/') ? `${BASE_URL}${imagePath}` : `${BASE_URL}/${imagePath}`;
  };


  const isAuthenticated = () => {
    return !!token;
  };

  //Fetch reviews from API
  const fetchReviews = async () => {
    if (!id) return;
    
    try {
      setReviewsLoading(true);
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      
      //Fetch reviews
      const reviewsResponse = await fetch(`${API_BASE_URL}/reviews/product/${id}`);
      if (reviewsResponse.ok) {
        const reviewsData = await reviewsResponse.json();
        if (reviewsData.success) {
          setReviews(reviewsData.data.reviews);
        }
      }
      
      //Fetch review statistics
      const statsResponse = await fetch(`${API_BASE_URL}/reviews/product/${id}/stats`);
      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        if (statsData.success) {
          setReviewStats(statsData.data);
        }
      }
    } catch (err) {
      console.error("Error fetching reviews:", err);
    } finally {
      setReviewsLoading(false);
    }
  };

  //Check if user has reviewed this product
  const checkUserReviewStatus = async () => {
    if (!isAuthenticated() || !id) return;
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_BASE_URL}/reviews/product/${id}/check`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setHasUserReviewed(data.data.hasReviewed);
        }
      }
    } catch (error) {
      console.error('Error checking review status:', error);
    }
  };

const submitReview = async (reviewData) => {
  if (!isAuthenticated()) {
    navigate('/login-register');
    return false;
  }

  try {
    setSubmittingReview(true);
    const API_BASE_URL = import.meta.env.VITE_API_URL;
    
    const reviewPayload = {
      productId: id,
      rating: reviewData.rating,
      title: reviewData.title,
      comment: reviewData.comment,
    };

    console.log('Submitting review:', reviewPayload); 

    const response = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(reviewPayload)
    });

    console.log('Response status:', response.status); 

    if (response.ok) {
      const result = await response.json();
      console.log('Response data:', result); 
      
      if (result.success) {
        await fetchReviews();
        await checkUserReviewStatus();
        setShowReviewForm(false);
        setShowSuccess(true);
        setErrorMessage('Review submitted successfully!');
        setTimeout(() => setShowSuccess(false), 3000);
        return true;
      }
    } else {
      const errorData = await response.json();
      console.log('Error response:', errorData); 
      setShowError(true);
      setErrorMessage(errorData.message || 'Failed to submit review');
      setTimeout(() => setShowError(false), 3000);
      return false;
    }
  } catch (error) {
    console.error('Error submitting review:', error);
    setShowError(true);
    setErrorMessage('Failed to submit review. Please try again.');
    setTimeout(() => setShowError(false), 3000);
    return false;
  } finally {
    setSubmittingReview(false);
  }
};

  const ReviewForm = () => {
    const [rating, setRating] = useState(0);
    const [title, setTitle] = useState('');
    const [comment, setComment] = useState('');
    const [hoverRating, setHoverRating] = useState(0);

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (rating === 0) {
        setShowError(true);
        setErrorMessage('Please select a rating');
        setTimeout(() => setShowError(false), 3000);
        return;
      }

      const success = await submitReview({
        rating,
        title,
        comment
      });
      
      if (success) {
        setRating(0);
        setTitle('');
        setComment('');
      }
    };

    const resetForm = () => {
      setRating(0);
      setTitle('');
      setComment('');
      setShowReviewForm(false);
    };

    return (
      <form onSubmit={handleSubmit} className="review-form">
        <h3>Write a Review</h3>
        
        <div className="rating-input">
          <label>Rating *</label>
          <div className="star-rating">
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                type="button"
                className={`star-btn ${star <= (hoverRating || rating) ? 'active' : ''}`}
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                <FaStar />
              </button>
            ))}
          </div>
          <div className="rating-text">
            {rating > 0 ? `${rating} star${rating > 1 ? 's' : ''}` : 'Select rating'}
          </div>
        </div>

        <div className="form-group">
          <input
            type="text"
            placeholder="Review title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            maxLength={100}
          />
        </div>

        <div className="form-group">
          <textarea
            placeholder="Your review *"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            required
            rows="4"
            maxLength={1000}
          />
          <div className="char-count">{comment.length}/1000</div>
        </div>

        <div className="form-actions">
          <button 
            type="button" 
            onClick={resetForm}
            disabled={submittingReview}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            disabled={submittingReview}
            className="submit-btn"
          >
            {submittingReview ? 'Submitting...' : 'Submit Review'}
          </button>
        </div>
      </form>
    );
  };

  const checkWishlistStatus = async () => {
    if (!isAuthenticated() || !product) return;
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;
      
      const response = await fetch(`${API_BASE_URL}/wishlist`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const wishlist = await response.json();
        const isInWishlist = wishlist.some(item => item._id === product._id);
        setIsFavorite(isInWishlist);
      }
    } catch (error) {
      console.error('Error checking wishlist:', error);
    }
  };

 
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_BASE_URL}/products/${id}`);
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          console.error('Received non-JSON response:', text.substring(0, 200));
          throw new Error('Server returned HTML instead of JSON. Check your API endpoint.');
        }
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const productData = await response.json();
        setProduct(productData);
        setError(null);
      } catch (err) {
        console.error("Error fetching product:", err);
        setError(err.message || "Failed to load product.");
      } finally {
        setLoading(false);
      }
    };

    
    const fetchRelatedProducts = async () => {
      try {
        const API_BASE_URL = import.meta.env.VITE_API_URL;
        const response = await fetch(`${API_BASE_URL}/products`);
        
        if (response.ok) {
          const products = await response.json();
          const related = products
            .filter(p => p._id !== id)
            .slice(0, 4);
          setRelatedProducts(related);
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
      }
    };

    if (id) {
      fetchProduct();
      fetchRelatedProducts();
      fetchReviews();
    }
  }, [id]);

  
  useEffect(() => {
    if (product) {
      checkWishlistStatus();
      if (isAuthenticated()) {
        checkUserReviewStatus();
      }
    }
  }, [product]);

  const handleAddToCart = () => {
    
    if (!isAuthenticated()) {
      console.log('No token found');
      navigate('/login-register');
      return;
    }

    
    if (!selectedSize || !selectedColor) {
      setShowError(true);
      setErrorMessage('Please select both size and color before adding to cart');
      setTimeout(() => {
        setShowError(false);
        setErrorMessage('');
      }, 3000);
      return;
    }

    
    const existingCart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    
    const cartItem = {
      id: product._id,
      name: product.name,
      price: product.price,
      image: getImageUrl(product.imageUrl),
      size: selectedSize,
      color: selectedColor,
      quantity: quantity
    };

    
    const existingItemIndex = existingCart.findIndex(
      item => item.id === cartItem.id && 
              item.size === cartItem.size && 
              item.color === cartItem.color
    );

    let newCart = [...existingCart];
    
    if (existingItemIndex > -1) {
      
      const newQuantity = newCart[existingItemIndex].quantity + quantity;
      
      
      if (newQuantity > 5) {
        setShowError(true);
        setErrorMessage('Maximum 5 items allowed per product');
        setTimeout(() => {
          setShowError(false);
          setErrorMessage('');
        }, 3000);
        return;
      }
      
      newCart[existingItemIndex].quantity = newQuantity;
    } else {
      
      if (quantity > 5) {
        setShowError(true);
        setErrorMessage('Maximum 5 items allowed per product');
        setTimeout(() => {
          setShowError(false);
          setErrorMessage('');
        }, 3000);
        return;
      }
      
      
      newCart.push(cartItem);
    }

    
    localStorage.setItem('cart', JSON.stringify(newCart));
    
    
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 3000);
    
    console.log('Added to cart:', cartItem);
    console.log('Current cart:', newCart);
    
    
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const toggleFavorite = async () => {
    if (!isAuthenticated()) {
      
      alert('Please login to add items to your wishlist');
      navigate('/login-register');
      return;
    }

    if (!product) return;

    setWishlistLoading(true);
    
    try {
      const API_BASE_URL = import.meta.env.VITE_API_URL;

      if (isFavorite) {
        
        const response = await fetch(`${API_BASE_URL}/wishlist/${product._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setIsFavorite(false);
          console.log('Removed from wishlist');
        } else {
          throw new Error('Failed to remove from wishlist');
        }
      } else {
        
        const response = await fetch(`${API_BASE_URL}/wishlist/${product._id}`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          setIsFavorite(true);
          console.log('Added to wishlist');
        } else if (response.status === 400) {
          
          setIsFavorite(true);
        } else {
          throw new Error('Failed to add to wishlist');
        }
      }
    } catch (error) {
      console.error('Error toggling wishlist:', error);
      alert('Error updating wishlist. Please try again.');
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRelatedProductClick = (productId) => {
    navigate(`/product/${productId}`);
    window.scrollTo(0, 0);
  };

  const handleViewMoreClick = () => {
    navigate('/shop');
  };

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(<FaStar key={i} className="star filled" />);
    }

    if (hasHalfStar) {
      stars.push(<FaStarHalfAlt key="half" className="star filled" />);
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<FaStar key={`empty-${i}`} className="star empty" />);
    }

    return stars;
  };

  if (loading) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="container loading">Loading product...</div>
        <Footer />
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="product-detail-page">
        <Navbar />
        <div className="container error">Error: {error || 'Product not found'}</div>
        <Footer />
      </div>
    );
  }

  const productImages = [
    getImageUrl(product.imageUrl),
    getImageUrl(product.imageUrl),
    getImageUrl(product.imageUrl),
    getImageUrl(product.imageUrl)
  ];

  return (
    <div className="product-detail-page">
      <Navbar />
      
      {/* Success/Error Messages */}
      {showSuccess && (
        <div className="toast toast-success">
          ✓ {errorMessage}
        </div>
      )}
      
      {showError && (
        <div className="toast toast-error">
          ⚠ {errorMessage}
        </div>
      )}
      
      {/* Breadcrumb */}
      <div className="container">
        <div className="breadcrumb-nav">
          <span className="breadcrumb-link" onClick={() => navigate('/')}>Home</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-link" onClick={() => navigate('/shop')}>Shop</span>
          <span className="breadcrumb-separator">›</span>
          <span className="breadcrumb-current">{product.name}</span>
        </div>
      </div>

      {/* Product Section */}
      <div className="container">
        <div className="product-section">
          {/* Product Images */}
          <div className="product-images">
            <div className="thumbnail-list">
              {productImages.map((img, index) => (
                <div 
                  key={index}
                  className={`thumbnail ${selectedImage === index ? 'active' : ''}`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img src={img} alt={`${product.name} view ${index + 1}`} />
                </div>
              ))}
            </div>
            <div className="main-image">
              <img src={productImages[selectedImage]} alt={product.name} />
              {/* Wishlist button on main image */}
              <button 
                className={`wishlist-btn-main ${isFavorite ? 'active' : ''} ${wishlistLoading ? 'loading' : ''}`}
                onClick={toggleFavorite}
                disabled={wishlistLoading}
                title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
              </button>
            </div>
          </div>

          {/* Product Info */}
          <div className="product-info">
            <h1>{product.name}</h1>
            <div className="price">Rs. {product.price}</div>
            <div className="rating">
              <div className="stars">
                {reviewStats ? renderStars(reviewStats.averageRating) : <span>★★★★☆</span>}
              </div>
              <span className="review-count">
                {reviewStats ? `${reviewStats.totalReviews} Customer Review${reviewStats.totalReviews !== 1 ? 's' : ''}` : '5 Customer Review'}
              </span>
            </div>
            
            <p className="product-description">
              {product.description}
            </p>

            <div className="product-options">
              <div className="size-selection">
                <label>
                  Size {!selectedSize && <span className="required">*</span>}
                </label>
                <div className="size-buttons">
                  {['L', 'XL', 'XS'].map(size => (
                    <button 
                      key={size}
                      className={`size-btn ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <div className="color-selection">
                <label>
                  Color {!selectedColor && <span className="required">*</span>}
                </label>
                <div className="color-options">
                  <div 
                    className={`color-option blue ${selectedColor === 'blue' ? 'active' : ''}`}
                    onClick={() => setSelectedColor('blue')}
                    title="Blue"
                  ></div>
                  <div 
                    className={`color-option black ${selectedColor === 'black' ? 'active' : ''}`}
                    onClick={() => setSelectedColor('black')}
                    title="Black"
                  ></div>
                  <div 
                    className={`color-option brown ${selectedColor === 'brown' ? 'active' : ''}`}
                    onClick={() => setSelectedColor('brown')}
                    title="Brown"
                  ></div>
                </div>
              </div>
            </div>

            <div className="purchase-section">
              <div className="quantity-selector">
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                >
                  -
                </button>
                <span>{quantity}</span>
                <button 
                  onClick={() => {
                    
                    if (quantity < 5) {
                      setQuantity(quantity + 1);
                    } else {
                      setShowError(true);
                      setErrorMessage('Maximum 5 items allowed per product');
                      setTimeout(() => {
                        setShowError(false);
                        setErrorMessage('');
                      }, 3000);
                    }
                  }}
                >
                  +
                </button>
              </div>
              <button className="add-to-cart-btn" onClick={handleAddToCart}>
                Add To Cart
              </button>
              <button 
                className={`wishlist-btn ${isFavorite ? 'active' : ''} ${wishlistLoading ? 'loading' : ''}`}
                onClick={toggleFavorite}
                disabled={wishlistLoading}
                title={isFavorite ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                {wishlistLoading ? '...' : (isFavorite ? <FaHeart /> : <FaRegHeart />)}
              </button>
            </div>

            <div className="product-meta">
              <div className="meta-item">
                <span>SKU:</span>
                <span>{product._id?.substring(0, 8) || 'SS001'}</span>
              </div>
              <div className="meta-item">
                <span>Category:</span>
                <span>{product.category || 'Sofas'}</span>
              </div>
              <div className="meta-item">
                <span>Tags:</span>
                <span>{product.category ? `${product.category}, Furniture, Home, Shop` : 'Sofa, Chair, Home, Shop'}</span>
              </div>
              <div className="meta-item">
                <span>Share:</span>
                <div className="social-links">
                  <button className="social-icon facebook">
                    <FaFacebookF />
                  </button>
                  <button className="social-icon linkedin">
                    <FaLinkedinIn />
                  </button>
                  <button className="social-icon twitter">
                    <FaTwitter />
                  </button>
                  <button 
                    className={`heart-icon ${isFavorite ? 'favorite' : ''}`}
                    onClick={toggleFavorite}
                    disabled={wishlistLoading}
                  >
                    {isFavorite ? <FaHeart /> : <FaRegHeart />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Tabs */}
      <div className="container">
        <div className="product-tabs">
          <div className="tab-nav">
            <button 
              className={`tab-btn ${activeTab === 'description' ? 'active' : ''}`}
              onClick={() => setActiveTab('description')}
            >
              Description
            </button>
            <button 
              className={`tab-btn ${activeTab === 'additional' ? 'active' : ''}`}
              onClick={() => setActiveTab('additional')}
            >
              Additional Information
            </button>
            <button 
              className={`tab-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => setActiveTab('reviews')}
            >
              Reviews [{reviewStats ? reviewStats.totalReviews : 5}]
            </button>
          </div>
          
          <div className="tab-content">
            {activeTab === 'description' && (
              <div>
                <p>{product.description}</p>
              </div>
            )}
            {activeTab === 'additional' && (
              <div className="additional-info-grid">
                {product.additionalInfo?.material && (
                  <div className="info-item">
                    <strong>Material:</strong>
                    <span>{product.additionalInfo.material}</span>
                  </div>
                )}
                {product.additionalInfo?.color && (
                  <div className="info-item">
                    <strong>Color:</strong>
                    <span>{product.additionalInfo.color}</span>
                  </div>
                )}
                {product.additionalInfo?.dimensions && (
                  <div className="info-item">
                    <strong>Dimensions:</strong>
                    <span>{product.additionalInfo.dimensions}</span>
                  </div>
                )}
                {product.additionalInfo?.weight && (
                  <div className="info-item">
                    <strong>Weight:</strong>
                    <span>{product.additionalInfo.weight}</span>
                  </div>
                )}
                {product.additionalInfo?.style && (
                  <div className="info-item">
                    <strong>Style:</strong>
                    <span>{product.additionalInfo.style}</span>
                  </div>
                )}
                {product.additionalInfo?.manufacturer && (
                  <div className="info-item">
                    <strong>Manufacturer:</strong>
                    <span>{product.additionalInfo.manufacturer}</span>
                  </div>
                )}
                {product.additionalInfo?.warranty && (
                  <div className="info-item">
                    <strong>Warranty:</strong>
                    <span>{product.additionalInfo.warranty}</span>
                  </div>
                )}
                {product.additionalInfo?.careInstructions && (
                  <div className="info-item full-width">
                    <strong>Care Instructions:</strong>
                    <span>{product.additionalInfo.careInstructions}</span>
                  </div>
                )}
                {product.additionalInfo?.assemblyRequired !== undefined && (
                  <div className="info-item">
                    <strong>Assembly Required:</strong>
                    <span>{product.additionalInfo.assemblyRequired ? 'Yes' : 'No'}</span>
                  </div>
                )}
                {product.additionalInfo?.features && product.additionalInfo.features.length > 0 && (
                  <div className="info-item full-width">
                    <strong>Features:</strong>
                    <div className="features-list">
                      {product.additionalInfo.features.map((feature, index) => (
                        <span key={index} className="feature-tag">{feature}</span>
                      ))}
                    </div>
                  </div>
                )}
                
                {/* Fallback for products without additionalInfo */}
                {(!product.additionalInfo || Object.keys(product.additionalInfo).length === 0) && (
                  <div className="no-additional-info">
                    <p>No additional information available for this product.</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === 'reviews' && (
              <div className="reviews-section">
                {reviewsLoading ? (
                  <div className="loading-reviews">Loading reviews...</div>
                ) : (
                  <>
                    <div className="reviews-header">
                      <div className="reviews-summary">
                        <div className="overall-rating">
                          <div className="rating-number">
                            {reviewStats ? reviewStats.averageRating.toFixed(1) : '4.8'}
                          </div>
                          <div className="rating-stars">
                            {renderStars(reviewStats ? reviewStats.averageRating : 4.8)}
                          </div>
                          <div className="total-reviews">Based on {reviewStats?.totalReviews || 5} reviews</div>
                        </div>
                        <div className="rating-breakdown">
                          {[5, 4, 3, 2, 1].map(rating => {
                            const percentage = reviewStats?.ratingDistribution[rating]?.percentage || 0;
                            const count = reviewStats?.ratingDistribution[rating]?.count || 0;
                            
                            return (
                              <div key={rating} className="rating-bar">
                                <span>{rating} stars</span>
                                <div className="bar-container">
                                  <div className="bar-fill" style={{width: `${percentage}%`}}></div>
                                </div>
                                <span>{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                      
                      {isAuthenticated() && !hasUserReviewed && (
                        <button 
                          className="add-review-btn"
                          onClick={() => setShowReviewForm(true)}
                        >
                          Write a Review
                        </button>
                      )}
                      
                      {!isAuthenticated() && (
                        <div className="review-login-prompt">
                          <p>Want to share your experience?</p>
                          <button 
                            className="login-to-review-btn"
                            onClick={() => navigate('/login-register')}
                          >
                            Login to Write a Review
                          </button>
                        </div>
                      )}
                    </div>

                    {showReviewForm && <ReviewForm />}

                    {hasUserReviewed && (
                      <div className="user-review-notice">
                        <p>✓ You have already reviewed this product</p>
                      </div>
                    )}

                    <div className="reviews-list">
                      {reviews.length > 0 ? (
                        reviews.map(review => (
                          <div key={review._id} className="review-item">
                            <div className="review-header">
                              <div className="reviewer-info">
                                <div className="reviewer-name">
                                  {review.customerName}
                                  {user && review.customerName === user.name && (
                                    <span className="your-review-badge">Your Review</span>
                                  )}
                                </div>
                                {review.verified && <span className="verified-badge">Verified Purchase</span>}
                              </div>
                              <div className="review-date">{review.formattedDate || review.date}</div>
                            </div>
                            <div className="review-rating">
                              {renderStars(review.rating)}
                            </div>
                            <div className="review-title">{review.title}</div>
                            <div className="review-comment">{review.comment}</div>
                          </div>
                        ))
                      ) : (
                        <div className="no-reviews">
                          <p>No reviews yet. Be the first to review this product!</p>
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Product Images Gallery */}
      <div className="container">
        <div className="product-gallery">
          <img src="https://images.unsplash.com/photo-1567538096630-e0c55bd6374c?w=600&h=400&fit=crop" alt="Product view 1" />
          <img src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=600&h=400&fit=crop" alt="Product view 2" />
        </div>
      </div>

      {/* Related Products */}
      <div className="container">
        <div className="related-products">
          <h2>Related Products</h2>
          <div className="products-grid">
            {relatedProducts.map(relatedProduct => (
              <div 
                key={relatedProduct._id} 
                className="product-card"
                onClick={() => handleRelatedProductClick(relatedProduct._id)}
              >
                <div className="product-image-container">
                  <img src={getImageUrl(relatedProduct.imageUrl)} alt={relatedProduct.name} />
                  <div className="product-overlay">
                    <button className="quick-view-btn">Quick View</button>
                  </div>
                </div>
                <h3>{relatedProduct.name}</h3>
                <p className="product-price">Rs. {relatedProduct.price}</p>
                <div className="product-category">{relatedProduct.category}</div>
              </div>
            ))}
          </div>
          <div className="view-more">
            <button className="view-more-btn" onClick={handleViewMoreClick}>
              View More
            </button>
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
          --transition: all 0.3s ease;
        }

        * { box-sizing: border-box; }
        body, html, .product-detail-page { 
          background: #fff; 
          color: #111827; 
          font-family: Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial; 
        }

        .container {
          max-width: var(--max-width);
          margin: 0 auto;
          padding: 0 1rem;
        }

        /* Toast Messages */
        .toast {
          position: fixed;
          top: 100px;
          right: 20px;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          z-index: 9999;
          animation: slideIn 0.3s ease-out;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @keyframes slideIn {
          from {
            transform: translateX(400px);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        .toast-success {
          background: #10b981;
          color: white;
        }

        .toast-error {
          background: #ef4444;
          color: white;
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

        /* Breadcrumb */
        .breadcrumb-nav {
          padding: 2rem 0 1rem;
          font-size: 0.9rem;
          color: var(--muted);
        }

        .breadcrumb-link {
          color: var(--muted);
          cursor: pointer;
          transition: var(--transition);
        }

        .breadcrumb-link:hover {
          color: var(--gold);
        }

        .breadcrumb-separator {
          margin: 0 8px;
        }

        .breadcrumb-current {
          color: #111827;
          font-weight: 500;
        }

        /* Product Section */
        .product-section {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          padding: 2rem 0 4rem;
        }

        .product-images {
          display: flex;
          gap: 1.5rem;
        }

        .thumbnail-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .thumbnail {
          width: 80px;
          height: 80px;
          border-radius: 8px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          transition: var(--transition);
        }

        .thumbnail.active {
          border-color: var(--gold);
        }

        .thumbnail:hover {
          transform: scale(1.05);
          border-color: var(--gold);
        }

        .thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .main-image {
          flex: 1;
          background: var(--pag-yellow);
          border-radius: 12px;
          padding: 2rem;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: var(--transition);
          position: relative;
        }

        .main-image:hover {
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .main-image img {
          max-width: 100%;
          max-height: 400px;
          object-fit: contain;
          transition: var(--transition);
        }

        .main-image:hover img {
          transform: scale(1.02);
        }

        /* Wishlist Button on Main Image */
        .wishlist-btn-main {
          position: absolute;
          top: 15px;
          right: 15px;
          background: white;
          border: none;
          border-radius: 50%;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
          transition: var(--transition);
          color: #d1d5db;
        }

        .wishlist-btn-main:hover,
        .wishlist-btn:hover {
          transform: scale(1.1);
        }

        .wishlist-btn-main.active,
        .wishlist-btn.active {
          color: #e74c3c;
        }

        .wishlist-btn-main.loading,
        .wishlist-btn.loading {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Product Info */
        .product-info h1 {
          font-size: 2.5rem;
          font-weight: 400;
          margin: 0 0 1rem;
        }

        .price {
          font-size: 1.5rem;
          color: var(--muted);
          margin-bottom: 1rem;
        }

        .rating {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin-bottom: 1rem;
          padding-bottom: 1rem;
          border-bottom: 1px solid #e5e7eb;
        }

        .stars {
          color: var(--gold);
        }

        .review-count {
          color: var(--muted);
          font-size: 0.9rem;
        }

        .product-description {
          line-height: 1.6;
          margin-bottom: 2rem;
          color: #374151;
        }

        .product-options {
          margin-bottom: 2rem;
        }

        .size-selection, .color-selection {
          margin-bottom: 1.5rem;
        }

        .size-selection label, .color-selection label {
          display: block;
          font-weight: 500;
          margin-bottom: 0.5rem;
          color: var(--muted);
        }

        .required {
          color: #ef4444;
          font-weight: 700;
          margin-left: 4px;
        }

        .size-buttons {
          display: flex;
          gap: 0.75rem;
        }

        .size-btn {
          padding: 0.5rem 1rem;
          border: 1px solid #d1d5db;
          background: transparent;
          border-radius: 6px;
          cursor: pointer;
          transition: var(--transition);
        }

        .size-btn:hover {
          border-color: var(--gold);
          color: var(--gold);
        }

        .size-btn.active {
          background: var(--gold);
          color: white;
          border-color: var(--gold);
        }

        .color-options {
          display: flex;
          gap: 0.75rem;
        }

        .color-option {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          cursor: pointer;
          border: 3px solid transparent;
          transition: var(--transition);
          position: relative;
        }

        .color-option:hover {
          transform: scale(1.1);
        }

        .color-option.active {
          border-color: #111827;
          transform: scale(1.1);
        }

        .color-option.active::after {
          content: '✓';
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-weight: bold;
          font-size: 14px;
        }

        .color-option.blue { background: #3b82f6; }
        .color-option.black { background: #111827; }
        .color-option.brown { background: #a16207; }

        .purchase-section {
          display: flex;
          gap: 1rem;
          align-items: center;
          margin-bottom: 2rem;
        }

        .quantity-selector {
          display: flex;
          align-items: center;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          overflow: hidden;
        }

        .quantity-selector button {
          padding: 0.75rem 1rem;
          border: none;
          background: #f9fafb;
          cursor: pointer;
          transition: var(--transition);
        }

        .quantity-selector button:hover {
          background: #e5e7eb;
        }

        .quantity-selector span {
          padding: 0.75rem 1.5rem;
          background: white;
        }

        .add-to-cart-btn {
          padding: 0.75rem 2rem;
          background: transparent;
          border: 1px solid #111827;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: var(--transition);
        }

        .add-to-cart-btn:hover {
          background: #111827;
          color: white;
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .wishlist-btn {
          background: #f8f9fa;
          border: 1px solid #dee2e6;
          border-radius: 6px;
          padding: 0.75rem;
          cursor: pointer;
          transition: var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #d1d5db;
        }

        .wishlist-btn:hover {
          border-color: #e74c3c;
          color: #e74c3c;
        }

        .wishlist-btn.active {
          background: #e74c3c;
          border-color: #e74c3c;
          color: white;
        }

        .product-meta {
          border-top: 1px solid #e5e7eb;
          padding-top: 2rem;
        }

        .meta-item {
          display: flex;
          margin-bottom: 0.75rem;
          align-items: center;
        }

        .meta-item span:first-child {
          color: var(--muted);
          min-width: 100px;
          font-weight: 500;
        }

        /* Social Links */
        .social-links {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .social-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: #111827;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: var(--transition);
          font-size: 16px;
        }

        .social-icon svg {
          width: 16px;
          height: 16px;
        }

        .social-icon:hover {
          background: var(--gold);
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(212, 175, 55, 0.3);
        }

        .heart-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          background: transparent;
          color: #d1d5db;
          border: 1px solid #d1d5db;
          border-radius: 4px;
          font-size: 16px;
          cursor: pointer;
          transition: var(--transition);
        }

        .heart-icon:hover {
          border-color: #ef4444;
          color: #ef4444;
          transform: scale(1.1);
        }

        .heart-icon.favorite {
          background: #ef4444;
          border-color: #ef4444;
          color: white;
          transform: scale(1.1);
        }

        /* Tabs */
        .product-tabs {
          padding: 3rem 0;
          border-top: 1px solid #e5e7eb;
        }

        .tab-nav {
          display: flex;
          justify-content: center;
          gap: 3rem;
          margin-bottom: 2rem;
        }

        .tab-btn {
          background: none;
          border: none;
          font-size: 1.1rem;
          padding: 0.5rem 0;
          cursor: pointer;
          color: var(--muted);
          transition: var(--transition);
          border-bottom: 2px solid transparent;
        }

        .tab-btn:hover {
          color: #111827;
        }

        .tab-btn.active {
          color: #111827;
          border-bottom-color: var(--gold);
        }

        .tab-content {
          max-width: 800px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .tab-content p {
          margin-bottom: 1.5rem;
        }

        /* Additional Information Styles */  
        .additional-info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-top: 1rem;
        }
        
        .info-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          padding: 20px;
          border: 1px solid #eee;
          border-radius: 8px;
          background: white;
          transition: all 0.3s ease;
          cursor: pointer;
          margin-bottom: 15px;
        }
        
        .info-item:hover {
          border-color: #333;
        }
        
        .info-item:last-child {
          margin-bottom: 0;
        }
        
        .info-item.full-width {
          grid-column: 1 / -1;
        }
        
        .info-item strong {
          font-size: 18px;
          font-weight: 600;
          color: #333;
          margin-bottom: 8px;
        }
        
        .info-item span {
          font-size: 15px;
          color: #666;
          line-height: 1.6;
        }
        
        .features-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        
        .feature-tag {
          background: var(--gold);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
          font-size: 0.8rem;
          font-weight: 500;
        }
        
        .no-additional-info {
          text-align: center;
          padding: 2rem;
          color: var(--muted);
          font-style: italic;
          grid-column: 1 / -1;
        }

        /* Reviews Section Styles */
        .reviews-section {
          padding: 2rem 0;
        }

        .reviews-summary {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 3rem;
          margin-bottom: 3rem;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 12px;
        }

        .overall-rating {
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
        }

        .rating-number {
          font-size: 3rem;
          font-weight: 700;
          color: #111827;
          margin-bottom: 0.5rem;
        }

        .rating-stars {
          display: flex;
          gap: 2px;
          margin-bottom: 0.5rem;
        }

        .star {
          font-size: 1.2rem;
        }

        .star.filled {
          color: var(--gold);
        }

        .star.empty {
          color: #d1d5db;
        }

        .total-reviews {
          color: var(--muted);
          font-size: 0.9rem;
        }

        .rating-breakdown {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .rating-bar {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .rating-bar span:first-child {
          min-width: 60px;
          font-size: 0.9rem;
          color: var(--muted);
        }

        .bar-container {
          flex: 1;
          height: 8px;
          background: #e5e7eb;
          border-radius: 4px;
          overflow: hidden;
        }

        .bar-fill {
          height: 100%;
          background: var(--gold);
          border-radius: 4px;
          transition: width 0.5s ease;
        }

        .rating-bar span:last-child {
          min-width: 20px;
          text-align: right;
          font-size: 0.9rem;
          color: var(--muted);
        }

        .reviews-list {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }

        .review-item {
          padding: 2rem;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: white;
          transition: var(--transition);
        }

        .review-item:hover {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          transform: translateY(-2px);
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .reviewer-info {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .reviewer-name {
          font-weight: 600;
          color: #111827;
        }

        .verified-badge {
          background: #10b981;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          font-weight: 500;
        }

        .review-date {
          color: var(--muted);
          font-size: 0.9rem;
        }

        .review-rating {
          display: flex;
          gap: 2px;
          margin-bottom: 0.75rem;
        }

        .review-title {
          font-weight: 600;
          font-size: 1.1rem;
          margin-bottom: 0.5rem;
          color: #111827;
        }

        .review-comment {
          line-height: 1.6;
          color: #374151;
        }

        /* Review Form Styles */
        .review-form {
          background: #f8f9fa;
          padding: 2rem;
          border-radius: 12px;
          margin-bottom: 2rem;
          border: 1px solid #e5e7eb;
        }

        .review-form h3 {
          margin-bottom: 1.5rem;
          color: #111827;
        }

        .rating-input {
          margin-bottom: 1.5rem;
        }

        .rating-input label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #374151;
        }

        .star-rating {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 0.5rem;
        }

        .star-btn {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.5rem;
          color: #d1d5db;
          transition: color 0.2s ease;
          padding: 0.25rem;
        }

        .star-btn.active {
          color: var(--gold);
        }

        .star-btn:hover {
          color: var(--gold);
          transform: scale(1.1);
        }

        .rating-text {
          font-size: 0.9rem;
          color: var(--muted);
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        .form-group input,
        .form-group textarea {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.3s ease;
        }

        .form-group input:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--gold);
        }

        .char-count {
          text-align: right;
          font-size: 0.8rem;
          color: var(--muted);
          margin-top: 0.25rem;
        }

        .form-actions {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }

        .form-actions button {
          padding: 0.75rem 1.5rem;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .form-actions button[type="button"] {
          background: white;
          color: #374151;
        }

        .form-actions button[type="button"]:hover {
          background: #f3f4f6;
        }

        .form-actions .submit-btn {
          background: var(--gold);
          color: white;
          border-color: var(--gold);
        }

        .form-actions .submit-btn:hover:not(:disabled) {
          background: #b8941f;
          transform: translateY(-1px);
        }

        .form-actions button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        /* Review Header Styles */
        .reviews-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          gap: 2rem;
        }

        .add-review-btn {
          background: var(--gold);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.3s ease;
        }

        .add-review-btn:hover {
          background: #b8941f;
          transform: translateY(-2px);
        }

        .review-login-prompt {
          text-align: center;
          padding: 1rem;
          background: #f0f9ff;
          border-radius: 8px;
          border: 1px solid #bae6fd;
        }

        .login-to-review-btn {
          background: #0ea5e9;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 6px;
          cursor: pointer;
          margin-top: 0.5rem;
        }

        .user-review-notice {
          background: #f0fdf4;
          border: 1px solid #bbf7d0;
          color: #166534;
          padding: 1rem;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .your-review-badge {
          background: var(--gold);
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.7rem;
          margin-left: 0.5rem;
        }

        .loading-reviews {
          text-align: center;
          padding: 2rem;
          color: var(--muted);
        }

        .no-reviews {
          text-align: center;
          padding: 3rem;
          color: var(--muted);
          font-style: italic;
        }

        /* Product Gallery */
        .product-gallery {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          margin: 3rem 0;
        }

        .product-gallery img {
          width: 100%;
          border-radius: 12px;
          background: var(--pag-yellow);
          transition: var(--transition);
        }

        .product-gallery img:hover {
          transform: scale(1.02);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        /* Related Products */
        .related-products {
          padding: 4rem 0;
        }

        .related-products h2 {
          text-align: center;
          font-size: 2rem;
          font-weight: 500;
          margin-bottom: 3rem;
        }

        .products-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
        }

        .product-card {
          text-align: center;
          cursor: pointer;
          transition: var(--transition);
          border-radius: 12px;
          padding: 1rem;
          position: relative;
        }

        .product-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
          background: white;
        }

        .product-image-container {
          position: relative;
          overflow: hidden;
          border-radius: 8px;
          margin-bottom: 1rem;
        }

        .product-card img {
          width: 100%;
          height: 230px;
          object-fit: cover;
          border-radius: 8px;
          transition: var(--transition);
        }

        .product-card:hover img {
          transform: scale(1.05);
        }

        .product-overlay {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: var(--transition);
          border-radius: 8px;
        }

        .product-card:hover .product-overlay {
          opacity: 1;
        }

        .quick-view-btn {
          padding: 0.75rem 1.5rem;
          background: var(--gold);
          color: white;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
          transition: var(--transition);
        }

        .quick-view-btn:hover {
          background: #b8941f;
          transform: translateY(-2px);
        }

        .product-card h3 {
          font-size: 1rem;
          font-weight: 400;
          margin: 0.5rem 0;
          transition: var(--transition);
        }

        .product-card:hover h3 {
          color: var(--gold);
        }

        .product-price {
          font-weight: 700;
          margin: 0.25rem 0;
          color: #111827;
        }

        .product-category {
          font-size: 0.8rem;
          color: var(--muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .view-more {
          text-align: center;
          border-top: 1px solid #e5e7eb;
          padding-top: 2rem;
        }

        .view-more-btn {
          color: var(--gold);
          background: none;
          border: none;
          font-size: 1rem;
          cursor: pointer;
          text-decoration: underline;
          font-weight: 500;
          transition: var(--transition);
          padding: 0.5rem 1rem;
          border-radius: 6px;
        }

        .view-more-btn:hover {
          background: var(--pag-yellow);
          text-decoration: none;
          transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 968px) {
          .product-section {
            grid-template-columns: 1fr;
            gap: 2rem;
          }
          
          .products-grid {
            grid-template-columns: repeat(2, 1fr);
          }

          .toast {
            left: 20px;
            right: 20px;
            width: auto;
          }

          .reviews-summary {
            grid-template-columns: 1fr;
            gap: 2rem;
          }

          .reviews-header {
            flex-direction: column;
            align-items: stretch;
          }
        }

        @media (max-width: 640px) {
          .product-images {
            flex-direction: column-reverse;
          }
          
          .thumbnail-list {
            flex-direction: row;
            overflow-x: auto;
          }
          
          .products-grid {
            grid-template-columns: 1fr;
          }
          
          .product-gallery {
            grid-template-columns: 1fr;
          }

          .product-info h1 {
            font-size: 1.75rem;
          }

          .purchase-section {
            flex-direction: column;
            align-items: stretch;
          }

          .add-to-cart-btn {
            width: 100%;
          }

          .wishlist-btn {
            width: 100%;
          }

          .additional-info-grid {
            grid-template-columns: 1fr;
          }

          .review-header {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
};

export default ProductDetail;