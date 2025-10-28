const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const Product = require('../model/Product');
const validateProduct = require('../middleware/validateProduct'); 

//CREATE product (Admin)
router.post(
  '/',
  protect,
  authorize('admin'),
  upload.single('image'),
  validateProduct,   
  async (req, res) => {
    try {
      console.log('Request body:', req.body);
      console.log('Request file:', req.file);

      const { name, price, description, category, stock, additionalInfo } = req.body;

      
      let parsedAdditionalInfo = {};
      if (additionalInfo) {
        try {
          parsedAdditionalInfo = typeof additionalInfo === 'string' 
            ? JSON.parse(additionalInfo) 
            : additionalInfo;
        } catch (error) {
          console.error('Error parsing additionalInfo:', error);
        }
      }

      const product = await Product.create({
        name,
        price: parseFloat(price),
        description,
        category,
        stock: parseInt(stock),
        imageUrl: req.file ? req.file.path : null,
        additionalInfo: parsedAdditionalInfo
      });

      res.status(201).json(product);
    } catch (error) {
      console.error('Error creating product:', error);
      res.status(500).json({ message: 'Server error while creating product' });
    }
  }
);

//UPDATE product (Admin)
router.put(
  '/:id',
  protect,
  authorize('admin'),
  upload.single('image'),
  validateProduct,   
  async (req, res) => {
    try {
      const updates = { ...req.body };

      if (updates.price) updates.price = Number(updates.price);
      if (updates.stock) updates.stock = Number(updates.stock);

      
      if (updates.additionalInfo && typeof updates.additionalInfo === 'string') {
        try {
          updates.additionalInfo = JSON.parse(updates.additionalInfo);
        } catch (error) {
          console.error('Error parsing additionalInfo:', error);
        }
      }

      if (req.file) {
        updates.imageUrl = req.file.path; 
      } else if (!updates.imageUrl) {
        const existingProduct = await Product.findById(req.params.id);
        if (existingProduct) {
          updates.imageUrl = existingProduct.imageUrl;
        }
      }

      const product = await Product.findByIdAndUpdate(
        req.params.id,
        updates,
        { new: true, runValidators: true }
      );

      if (!product) {
        return res.status(404).json({ success: false, message: 'Product not found' });
      }

      res.json(product);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, message: err.message });
    }
  }
);

//DELETE product (Admin)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: err.message });
  }
});

//GET all products (Public)
router.get("/", async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Server error while fetching products" });
  }
});

//GET single product by ID (Public)
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    res.json(product);
  } catch (error) {
    console.error("Error fetching product:", error);
    res.status(500).json({ message: "Server error while fetching product" });
  }
});

module.exports = router;