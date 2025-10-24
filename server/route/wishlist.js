const express = require('express');
const router = express.Router();

// Import the protect function from authmiddleware
const { protect } = require('../middleware/authMiddleware');

console.log('Loading User model...');
const User = require('../model/User');
console.log('User type:', typeof User);

console.log('Loading Product model...');
const Product = require('../model/Product');
console.log('Product type:', typeof Product);

//Only proceed if protect is a function
if (typeof protect !== 'function') {
  console.error('ERROR: protect middleware is not a function!');
  process.exit(1);
}

//GET user's wishlist
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('wishlist');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user.wishlist);
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//ADD item to wishlist
router.post('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.wishlist.some(id => id.toString() === productId)) {
      return res.status(400).json({ message: 'Product already in wishlist' });
    }

    user.wishlist.push(productId);
    await user.save();
    
    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

//REMOVE item from wishlist
router.delete('/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.wishlist = user.wishlist.filter(id => id.toString() !== productId);
    await user.save();
    
    const updatedUser = await User.findById(req.user.id).populate('wishlist');
    res.json(updatedUser.wishlist);
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;