const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../model/Order');
const Product = require('../model/Product');
const { protect } = require('../middleware/authMiddleware'); 
const adminAuth = require('../middleware/adminAuth'); 


// ---------------------------
// Create Payment Intent (Card Payments)
// ---------------------------
router.post('/create-payment-intent', protect, async (req, res) => {
  try {
    const { amount, currency, orderDetails } = req.body;

    // Validate stock
    for (const item of orderDetails.items) {
      const product = await Product.findById(item.id);
      if (!product) return res.status(404).json({ error: `Product ${item.name} not found` });
      if (product.stock < item.quantity) {
        return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      }
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount),
      currency: currency || 'npr',
      metadata: {
        items: JSON.stringify(orderDetails.items.map(item => ({
          id: item.id,
          name: item.name,
          quantity: item.quantity
        })))
      }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------
// Create Order (all payment methods)
// ---------------------------
router.post('/create-order', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentIntentId, subtotal, shippingCost, total } = req.body;

    //Validate stock & update
    for (const item of items) {
      const product = await Product.findById(item.id);
      if (!product) return res.status(404).json({ error: `Product ${item.name} not found` });
      if (product.stock < item.quantity) return res.status(400).json({ error: `Insufficient stock for ${product.name}. Available: ${product.stock}` });
      product.stock -= item.quantity;
      await product.save();
    }

    //Detect payment method
    let paymentMethod = 'stripe';
    let paymentStatus = 'completed';
    let paidAt = new Date();

    if (paymentIntentId.startsWith('COD-')) {
      paymentMethod = 'cod';
      paymentStatus = 'pending';
      paidAt = null;
    } else if (paymentIntentId.startsWith('BANK-')) {
      paymentMethod = 'bank_transfer';
      paymentStatus = 'pending';
      paidAt = null;
    }

    //Create order
    const order = new Order({
      user: req.user._id, 
      items: items.map(item => ({
        product: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        size: item.size,
        color: item.color,
        image: item.image
      })),
      shippingAddress,
      paymentInfo: {
        paymentIntentId,
        paymentMethod,
        paymentStatus,
        paidAt
      },
      subtotal,
      shippingCost,
      total,
      orderStatus: paymentMethod === 'stripe' ? 'processing' : 'pending'
    });

    await order.save();
    res.status(201).json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------
// Update Payment Status (COD/Bank Transfer)
// ---------------------------
router.patch('/order/:id/payment-status', protect, async (req, res) => {
  try {
    const { paymentStatus, paidAt } = req.body;
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    order.paymentInfo.paymentStatus = paymentStatus;
    if (paymentStatus === 'completed' && !order.paymentInfo.paidAt) {
      order.paymentInfo.paidAt = paidAt || new Date();
    }
    if (paymentStatus === 'completed' && order.orderStatus === 'pending') {
      order.orderStatus = 'processing';
    }

    await order.save();
    res.json({ success: true, order });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------
// Get All Orders for Logged-in User
// ---------------------------
router.get('/orders', protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate('items.product')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: orders.length, orders });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

// ---------------------------
// Get Single Order by ID (only if belongs to user)
// ---------------------------
router.get('/order/:id', protect, async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, user: req.user._id }).populate('items.product');
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});


module.exports = router;
