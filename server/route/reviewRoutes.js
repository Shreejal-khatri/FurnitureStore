const express = require('express');
const router = express.Router();
const Review = require('../model/Review');
const Product = require('../model/Product');
const { protect } = require('../middleware/authMiddleware');
const { body, validationResult } = require('express-validator');

//Helper function to update product rating
const updateProductRating = async (productId) => {
  try {
    const ratingData = await Review.getAverageRating(productId);
    await Product.findByIdAndUpdate(productId, {
      averageRating: ratingData.averageRating || 0,
      reviewCount: ratingData.totalReviews || 0
    });
  } catch (error) {
    console.error('Error updating product rating:', error);
  }
};

//Validation rules
const reviewValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters'),
  body('productId')
    .isMongoId()
    .withMessage('Valid product ID is required')
];

//@desc    Get reviews for a product
//@route   GET /api/reviews/product/:productId
//@access  Public
router.get('/product/:productId', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    //Check if product exists
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    //Build query
    const query = { 
      productId: req.params.productId, 
      status: 'active' 
    };

    //Get reviews with pagination
    const reviews = await Review.find(query)
      .populate('userId', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    //Get total count for pagination
    const totalReviews = await Review.countDocuments(query);
    const totalPages = Math.ceil(totalReviews / limit);

    //Format response
    const formattedReviews = reviews.map(review => ({
      _id: review._id,
      customerName: review.customerName,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      date: review.createdAt,
      formattedDate: new Date(review.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      verified: review.verified,
      isCurrentUser: req.user && review.userId && review.userId._id.toString() === req.user.id
    }));

    res.json({
      success: true,
      data: {
        reviews: formattedReviews,
        pagination: {
          currentPage: page,
          totalPages,
          totalReviews,
          hasNext: page < totalPages,
          hasPrev: page > 1
        }
      }
    });
  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching reviews'
    });
  }
});

//@desc    Get review statistics for a product
//@route   GET /api/reviews/product/:productId/stats
//@access  Public
router.get('/product/:productId/stats', async (req, res) => {
  try {
    //Check if product exists
    const product = await Product.findById(req.params.productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    const averageRatingData = await Review.getAverageRating(req.params.productId);
    const ratingDistribution = await Review.getRatingDistribution(req.params.productId);

    //Calculate percentages for each rating
    const total = averageRatingData.totalReviews;
    const distributionWithPercentages = {};
    
    for (let rating = 1; rating <= 5; rating++) {
      distributionWithPercentages[rating] = {
        count: ratingDistribution[rating],
        percentage: total > 0 ? Math.round((ratingDistribution[rating] / total) * 100) : 0
      };
    }

    res.json({
      success: true,
      data: {
        averageRating: averageRatingData.averageRating ? Number(averageRatingData.averageRating.toFixed(1)) : 0,
        totalReviews: averageRatingData.totalReviews || 0,
        ratingDistribution: distributionWithPercentages
      }
    });
  } catch (error) {
    console.error('Get review stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching review statistics'
    });
  }
});

//@desc    Check if user has reviewed a product
//@route   GET /api/reviews/product/:productId/check
//@access  Private
router.get('/product/:productId/check', protect, async (req, res) => {
  try {
    const review = await Review.findOne({
      productId: req.params.productId,
      userId: req.user.id
    });

    res.json({
      success: true,
      data: {
        hasReviewed: !!review,
        review: review ? {
          _id: review._id,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          date: review.createdAt
        } : null
      }
    });
  } catch (error) {
    console.error('Check review status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking review status'
    });
  }
});

//@desc    Submit a new review
//@route   POST /api/reviews
//@access  Private
router.post('/', protect, reviewValidation, async (req, res) => {
  try {
    //Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { productId, rating, title, comment } = req.body;

    //Check if product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    //Check if user already reviewed this product
    const existingReview = await Review.findOne({
      productId,
      userId: req.user.id
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: 'You have already reviewed this product'
      });
    }

    // Create and save review
    const review = new Review({
      productId,
      userId: req.user.id,
      customerName: req.user.name || req.user.username || 'Customer', 
      rating: parseInt(rating),
      title: title.trim(),
      comment: comment.trim(),
      verified: true
    });

    await review.save();

    //Update product's average rating
    await updateProductRating(productId);

    //Populate the review for response
    await review.populate('userId', 'name email');

    res.status(201).json({
      success: true,
      data: {
        review: {
          _id: review._id,
          customerName: review.customerName,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          date: review.createdAt,
          formattedDate: new Date(review.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          verified: review.verified,
          isCurrentUser: true
        }
      },
      message: 'Review submitted successfully'
    });
  } catch (error) {
    console.error('Submit review error:', error);
    //Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while submitting review'
    });
  }
});

// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
// @desc    Update a review
// @route   PUT /api/reviews/:reviewId
// @access  Private
router.put('/:reviewId', protect, [
  body('rating')
    .optional()
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 100 })
    .withMessage('Title must be between 5 and 100 characters'),
  body('comment')
    .optional()
    .trim()
    .isLength({ min: 10, max: 1000 })
    .withMessage('Comment must be between 10 and 1000 characters')
], async (req, res) => {
  try {
    //Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    //Check if user owns the review
    if (review.userId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this review'
      });
    }

    //Check if review can be edited (within 24 hours)
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if ((Date.now() - review.createdAt) > twentyFourHours) {
      return res.status(400).json({
        success: false,
        message: 'Review can only be edited within 24 hours of submission'
      });
    }

    // Update fields
    if (req.body.rating) review.rating = parseInt(req.body.rating);
    if (req.body.title) review.title = req.body.title.trim();
    if (req.body.comment) review.comment = req.body.comment.trim();

    // Update customerName in case user profile changed
    review.customerName = req.user.name || req.user.username || 'Customer';

    await review.save();

    // Update product rating
    await updateProductRating(review.productId);

    res.json({
      success: true,
      data: {
        review: {
          _id: review._id,
          customerName: review.customerName,
          rating: review.rating,
          title: review.title,
          comment: review.comment,
          date: review.createdAt,
          formattedDate: new Date(review.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          verified: review.verified,
          isCurrentUser: true
        }
      },
      message: 'Review updated successfully'
    });
  } catch (error) {
    console.error('Update review error:', error);
    
    //Handle validation errors specifically
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Server error while updating review'
    });
  }
});

//@desc    Delete a review
//@route   DELETE /api/reviews/:reviewId
//@access  Private
router.delete('/:reviewId', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: 'Review not found'
      });
    }

    //Check if user owns the review or is admin
    if (review.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this review'
      });
    }

    const productId = review.productId;
    
   
    review.status = 'removed';
    await review.save();

   
    await updateProductRating(productId);

    res.json({
      success: true,
      message: 'Review deleted successfully'
    });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting review'
    });
  }
});

module.exports = router;