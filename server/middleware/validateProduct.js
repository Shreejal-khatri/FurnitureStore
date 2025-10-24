const { body, validationResult } = require("express-validator");

const validateProduct = [
  body("name")
    .isString().withMessage("Name must be a string")
    .isLength({ min: 3, max: 100 }).withMessage("Name must be between 3 and 100 characters"),

  body("price")
    .isFloat({ min: 0 }).withMessage("Price must be a positive number")
    .toFloat(), 

  body("description")
    .optional()
    .isLength({ max: 500 }).withMessage("Description cannot exceed 500 characters"),

  body("category")
    .isString().withMessage("Category is required")
    .notEmpty().withMessage("Category cannot be empty"),

  body("stock")
    .isInt({ min: 0 }).withMessage("Stock must be a non-negative integer")
    .toInt(), 

  
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      console.log('Validation errors:', errors.array());
      return res.status(400).json({ 
        success: false,
        message: 'Validation failed',
        errors: errors.array() 
      });
    }
    
  
    console.log('Processed values:', {
      name: req.body.name,
      price: req.body.price, 
      stock: req.body.stock  
    });
    
    next();
  }
];

module.exports = validateProduct;