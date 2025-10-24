const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please enter a blog title'],
    trim: true
  },
  content: {
    type: String,
    required: [true, 'Please enter blog content']
  },
  imageUrl: {
    type: String,
    required: [true, 'Please include a main image']
  },
  author: {
    type: String,
    default: 'Admin'
  },
  category: {
    type: String,
    required: [true, 'Please select a category'],
    default: 'Other'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Blog', blogSchema);
