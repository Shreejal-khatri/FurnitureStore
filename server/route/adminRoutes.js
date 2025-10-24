const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const Admin = require('../model/User'); 
const adminAuth = require("../middleware/adminAuth");
const { protect } = require('../middleware/authMiddleware'); // Added: For token verification
const Order = require('../model/Order'); // Added: For order queries/updates
const User = require('../model/User'); // Add this import
const Product = require('../model/Product'); // Add this import - make sure this model exists
const router = express.Router();


// -------------------- REGISTER ADMIN --------------------
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    console.log("Register attempt:", { username, email });

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existingAdmin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (existingAdmin) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    // Create admin (password will be hashed automatically by pre-save hook)
    const admin = await Admin.create({
      username,
      email: email.toLowerCase().trim(),
      password,
      role: 'admin'
    });

    console.log("Admin created:", admin);

    // Generate JWT with full admin data
    const token = jwt.sign(
      { 
        id: admin._id, 
        name: admin.username,
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    res.status(201).json({
      message: 'Admin registered successfully',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// -------------------- LOGIN ADMIN --------------------
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", { email });

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    // Find admin by email
    const admin = await Admin.findOne({ email: email.toLowerCase().trim() });
    if (!admin || admin.role !== 'admin') {
      console.log("Admin not found or role mismatch");
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Compare password
    const match = await bcrypt.compare(password, admin.password);
    console.log("Password match:", match);
    if (!match) return res.status(401).json({ message: 'Invalid credentials' });

    // Generate JWT with full admin data
    const token = jwt.sign(
      { 
        id: admin._id, 
        name: admin.username,
        email: admin.email,
        role: admin.role
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '1h' }
    );

    res.status(200).json({
      message: 'Login successful',
      token,
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

// -------------------- GET CURRENT ADMIN --------------------
router.get('/me', adminAuth, async (req, res) => {
  try {
    const userWithoutPassword = {
      id: req.user.id,
      username: req.user.username,
      email: req.user.email,
      role: req.user.role
    };
    res.json(userWithoutPassword);
  } catch (err) {
    console.error("Get admin error:", err);
    res.status(500).json({ message: 'Server error' });
  }
});

// -------------------- GET ALL ORDERS (ADMIN ONLY) --------------------
router.get('/orders', protect, adminAuth, async (req, res) => {
  try {
    // Build dynamic filter from query params (matches frontend filters)
    const filter = {};
    if (req.query.paymentMethod && req.query.paymentMethod !== 'all') {
      filter['paymentInfo.paymentMethod'] = req.query.paymentMethod;
    }
    if (req.query.paymentStatus && req.query.paymentStatus !== 'all') {
      filter['paymentInfo.paymentStatus'] = req.query.paymentStatus;
    }
    if (req.query.orderStatus && req.query.orderStatus !== 'all') {
      filter.orderStatus = req.query.orderStatus;
    }

    const orders = await Order.find(filter)
      .populate('items.product')  // Populate product details (e.g., for images, names in frontend)
      .sort({ createdAt: -1 });  // Newest orders first

    // Calculate stats on backend (optional - reduces frontend computation)
    const stats = {
      total: orders.length,
      pending: orders.filter(o => o.orderStatus === 'pending').length,
      processing: orders.filter(o => o.orderStatus === 'processing').length,
      shipped: orders.filter(o => o.orderStatus === 'shipped').length,
      delivered: orders.filter(o => o.orderStatus === 'delivered').length,
      pendingPayments: orders.filter(o => o.paymentInfo?.paymentStatus === 'pending').length
    };

    console.log(`Admin fetched ${orders.length} orders with filters:`, filter);

    res.json({ 
      success: true, 
      count: orders.length, 
      orders, 
      stats  // Frontend can use this directly
    });
  } catch (error) {
    console.error('Admin fetch orders error:', error);
    res.status(500).json({ error: 'Server error while fetching orders' });
  }
});

// -------------------- UPDATE ORDER STATUS (ADMIN ONLY) --------------------
router.patch('/order/:id/status', protect, adminAuth, async (req, res) => {
  try {
    const { orderStatus } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    if (!validStatuses.includes(orderStatus)) {
      return res.status(400).json({ error: 'Invalid order status provided' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Optional: Business logic to prevent invalid transitions
    if (orderStatus === 'delivered' && order.orderStatus !== 'shipped') {
      return res.status(400).json({ error: 'Order must be shipped before marking as delivered' });
    }
    if (orderStatus === 'processing' && order.paymentInfo.paymentStatus !== 'completed') {
      return res.status(400).json({ error: 'Payment must be completed before processing' });
    }

    order.orderStatus = orderStatus;
    await order.save();

    console.log(`Admin updated order ${req.params.id} status to: ${orderStatus}`);

    res.json({ success: true, order });
  } catch (error) {
    console.error('Admin update order status error:', error);
    res.status(500).json({ error: 'Failed to update order status' });
  }
});

// -------------------- UPDATE PAYMENT STATUS (ADMIN ONLY) --------------------
router.patch('/order/:id/payment-status', protect, adminAuth, async (req, res) => {
  try {
    const { paymentStatus, paidAt } = req.body;
    
    // Validate status
    const validStatuses = ['pending', 'completed', 'failed'];
    if (!validStatuses.includes(paymentStatus)) {
      return res.status(400).json({ error: 'Invalid payment status provided' });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    order.paymentInfo.paymentStatus = paymentStatus;
    if (paymentStatus === 'completed' && !order.paymentInfo.paidAt) {
      order.paymentInfo.paidAt = paidAt || new Date();
    }

    // Auto-advance order status if payment completes and order is pending
    if (paymentStatus === 'completed' && order.orderStatus === 'pending') {
      order.orderStatus = 'processing';
    }

    await order.save();

    console.log(`Admin updated order ${req.params.id} payment status to: ${paymentStatus}`);

    res.json({ success: true, order });
  } catch (error) {
    console.error('Admin update payment status error:', error);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});


// Add these routes to your admin routes file

// -------------------- GET DASHBOARD STATS --------------------
router.get('/dashboard/stats', protect, adminAuth, async (req, res) => {
  try {
    // Get total revenue (sum of all completed orders)
    const revenueResult = await Order.aggregate([
      {
        $match: {
          'paymentInfo.paymentStatus': 'completed'
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$total' },
          totalOrders: { $sum: 1 }
        }
      }
    ]);

    // Get user count
    const userCount = await User.countDocuments({ role: { $ne: 'admin' } });
    
    // Get product count
    const productCount = await Product.countDocuments();
    
    // Get order status counts
    const orderStatusCounts = await Order.aggregate([
      {
        $group: {
          _id: '$orderStatus',
          count: { $sum: 1 }
        }
      }
    ]);

    // Calculate order metrics
    const orderMetrics = {
      completed: orderStatusCounts.find(o => o._id === 'delivered')?.count || 0,
      pending: orderStatusCounts.find(o => o._id === 'pending')?.count || 0,
      processing: orderStatusCounts.find(o => o._id === 'processing')?.count || 0,
      shipped: orderStatusCounts.find(o => o._id === 'shipped')?.count || 0,
      cancelled: orderStatusCounts.find(o => o._id === 'cancelled')?.count || 0
    };

    // Calculate changes (you might want to compare with previous period)
    // For now, using placeholder values
    const totalRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
    const totalOrders = revenueResult.length > 0 ? revenueResult[0].totalOrders : 0;

    const stats = {
      totalRevenue,
      totalOrders,
      activeUsers: userCount,
      totalProducts: productCount,
      revenueChange: 12.5, // You can calculate this by comparing with previous period
      ordersChange: 8.2,
      usersChange: 23.1,
      productsChange: -2.4,
      orderMetrics
    };

    res.json(stats);
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

// -------------------- GET REVENUE ANALYTICS --------------------
router.get('/analytics/revenue', protect, adminAuth, async (req, res) => {
  try {
    const { period = '7d' } = req.query;
    
    // Calculate date range based on period
    const endDate = new Date();
    const startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '3m':
        startDate.setMonth(endDate.getMonth() - 3);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }

    // Get daily revenue for the period
    const dailyRevenue = await Order.aggregate([
      {
        $match: {
          'paymentInfo.paymentStatus': 'completed',
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          revenue: { $sum: '$total' },
          orders: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Format for frontend
    const weeklyData = dailyRevenue.map(day => ({
      day: new Date(day._id).toLocaleDateString('en-US', { weekday: 'short' }),
      revenue: day.revenue,
      orders: day.orders
    }));

    // If no data, return some sample structure
    if (weeklyData.length === 0) {
      const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      weeklyData = days.map(day => ({
        day,
        revenue: Math.floor(Math.random() * 1000) + 500,
        orders: Math.floor(Math.random() * 10) + 1
      }));
    }

    const maxRevenue = Math.max(...weeklyData.map(d => d.revenue));

    res.json({
      weeklyData,
      maxRevenue,
      period
    });
  } catch (error) {
    console.error('Revenue analytics error:', error);
    res.status(500).json({ error: 'Failed to fetch revenue analytics' });
  }
});

module.exports = router;
