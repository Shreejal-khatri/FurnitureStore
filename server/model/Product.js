const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true,
    maxlength: [100, 'Product name cannot be more than 100 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please add a price'],
    min: [0, 'Price cannot be negative']
  },
  description: {
    type: String,
    required: [true, 'Please add a description']
  },
  category: {
    type: String,
    required: [true, 'Please add a category'],
    trim: true
  },
  stock: {
    type: Number,
    required: [true, 'Please add stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  imageUrl: {
    type: String,
    default: null
  },
  additionalInfo: {
    material: { 
      type: String,
      default: ''
    },
    color: { 
      type: String,
      default: ''
    },
    dimensions: {
      type: String,
      default: '' 
    },
    weight: {
      type: String,
      default: '' 
    },
    assemblyRequired: {
      type: Boolean,
      default: false
    },
    careInstructions: {
      type: String,
      default: ''
    },
    warranty: { 
      type: String,
      default: ''
    },
    manufacturer: { 
      type: String,
      default: ''
    },
    style: {
      type: String,
      default: '' 
    },
    features: { 
      type: [String],
      default: [] 
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Product', productSchema);