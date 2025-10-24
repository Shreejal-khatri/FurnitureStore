const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  name: String,
  price: Number,
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  size: String,
  color: String,
  image: String
});

const orderSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  orderNumber: {
    type: String,
    required: false, 
    unique: true      
  },
  items: [orderItemSchema],
  shippingAddress: {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    companyName: String,
    country: { type: String, required: true },
    streetAddress: { type: String, required: true },
    townCity: { type: String, required: true },
    province: { type: String, required: true },
    zipCode: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    additionalInfo: String
  },
  paymentInfo: {
    paymentIntentId: String,
    paymentMethod: {
      type: String,
      enum: ['stripe', 'bank_transfer', 'cod'],
      default: 'stripe'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending'
    },
    paidAt: Date
  },
  subtotal: {
    type: Number,
    required: true
  },
  shippingCost: {
    type: Number,
    required: true,
    default: 0
  },
  total: {
    type: Number,
    required: true
  },
  orderStatus: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  deliveredAt: Date
}, {
  timestamps: true
});


orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    try {
      const lastOrder = await this.constructor.findOne({}, { orderNumber: 1 }, { sort: { createdAt: -1 } });
      
      if (lastOrder && lastOrder.orderNumber) {
        const match = lastOrder.orderNumber.match(/ORD-(\d+)/);
        if (match) {
          const lastNumber = parseInt(match[1]);
          this.orderNumber = `ORD-${(lastNumber + 1).toString().padStart(6, '0')}`;
        } else {
          this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
        }
      } else {
        this.orderNumber = 'ORD-000001';
      }
    } catch (error) {
      console.error('Error generating order number:', error);
      this.orderNumber = `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    }
  }
  next();
});


orderSchema.index({ 'paymentInfo.paymentStatus': 1 });
orderSchema.index({ orderStatus: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
