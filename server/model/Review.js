const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'Product ID is required']
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  customerName: {
    type: String,
    required: [true, 'Customer name is required'],
    trim: true
  },
  rating: {
    type: Number,
    required: [true, 'Rating is required'],
    min: [1, 'Rating must be at least 1'],
    max: [5, 'Rating cannot exceed 5']
  },
  title: {
    type: String,
    required: [true, 'Review title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  comment: {
    type: String,
    required: [true, 'Review comment is required'],
    trim: true,
    maxlength: [1000, 'Comment cannot exceed 1000 characters']
  },
  verified: {
    type: Boolean,
    default: false
  },
  status: {
    type: String,
    enum: ['active', 'flagged', 'removed'],
    default: 'active'
  }
}, {
  timestamps: true
});

//Prevent duplicate reviews from same user for same product
reviewSchema.index({ productId: 1, userId: 1 }, { unique: true });

//Method to get average rating for a product
reviewSchema.statics.getAverageRating = async function(productId) {
  const result = await this.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        status: 'active'
      }
    },
    {
      $group: {
        _id: '$productId',
        averageRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);
  
  return result.length > 0 ? result[0] : { averageRating: 0, totalReviews: 0 };
};

//Method to get rating distribution
reviewSchema.statics.getRatingDistribution = async function(productId) {
  const result = await this.aggregate([
    {
      $match: {
        productId: new mongoose.Types.ObjectId(productId),
        status: 'active'
      }
    },
    {
      $group: {
        _id: '$rating',
        count: { $sum: 1 }
      }
    },
    {
      $sort: { _id: -1 }
    }
  ]);
  
  const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  result.forEach(item => {
    distribution[item._id] = item.count;
  });
  
  return distribution;
};

module.exports = mongoose.model('Review', reviewSchema);