const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const authRoutes = require("./route/authRoutes");
const userRoutes = require("./route/userRoutes");
const productRoutes = require("./route/productRoutes");
const adminRoutes = require('./route/adminRoutes');
const wishlistRoutes = require('./route/wishlist');
const paymentRoutes = require('./route/paymentRoutes'); 
const blogRoutes = require('./route/blogRoutes');
const contactRoutes = require('./route/contactRoutes');
const reviewRoutes = require('./route/reviewRoutes');





const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


//CORS configuration
const allowedOrigins = (process.env.FRONTEND_URL || "").split(",");
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true); //allow requests with no origin
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      } else {
        return callback(new Error("CORS policy: Origin not allowed"), false);
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
  })
);

//Routes
app.use("/api/auth", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api", paymentRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/contact", contactRoutes);
app.use('/api/reviews', reviewRoutes);

//404 handler
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

//Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Server error",
    error: process.env.NODE_ENV === "production" ? {} : err.message,
  });
});

//Connect to MongoDB and start server
const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("✅ MongoDB connected successfully");
    app.listen(PORT, () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

