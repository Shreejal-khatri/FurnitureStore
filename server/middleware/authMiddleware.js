const jwt = require("jsonwebtoken");
const User = require("../model/User");

const protect = async (req, res, next) => {
  try {
    let token;

    console.log('🔐 Auth check - Headers:', req.headers.authorization); 

    
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
      console.log('🔑 Token extracted:', token ? 'EXISTS' : 'NULL'); 
    }


    if (!token) {
      console.log('❌ No token found'); 
      return res.status(401).json({
        success: false,
        message: "Not authorized, token missing",
      });
    }

    try {
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log('✅ Token decoded, user ID:', decoded.id); 

      
      req.user = await User.findById(decoded.id).select("-password");

      if (!req.user) {
        console.log('❌ User not found in database'); 
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      console.log('✅ User authenticated:', req.user._id); 
      next();
    } catch (err) {
      console.log('❌ Token verification failed:', err.message); 
      return res.status(401).json({
        success: false,
        message: "Not authorized, token invalid",
      });
    }
  } catch (err) {
    console.log('❌ Auth middleware error:', err); 
    return res.status(500).json({
      success: false,
      message: "Server error in authentication",
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Not authorized, user missing",
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role '${req.user.role}' is not authorized to access this route`,
      });
    }

    next();
  };
};

module.exports = { protect, authorize };

