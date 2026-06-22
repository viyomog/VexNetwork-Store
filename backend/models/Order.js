const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: {
    type: String,
    required: true,
    unique: true
  },
  paymentId: {
    type: String
  },
  username: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: false
  },
  realName: {
    type: String,
    required: false
  },
  isGift: {
    type: Boolean,
    default: false
  },
  buyerUsername: {
    type: String,
    required: false
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: false
  },
  isCartCheckout: {
    type: Boolean,
    default: false
  },
  cartItems: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package'
  }],
  amount: {
    type: Number,
    required: true
  },
  couponUsed: {
    type: String,
    default: null
  },
  giftCardUsed: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['created', 'paid', 'failed', 'refunded'],
    default: 'created'
  },
  deliveryStatus: {
    type: String,
    enum: ['pending', 'delivered', 'failed'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Add a partial TTL index to automatically delete unpaid orders (status: 'created') after 7 days
orderSchema.index(
  { createdAt: 1 },
  { 
    expireAfterSeconds: 7 * 24 * 60 * 60, // 7 days in seconds
    partialFilterExpression: { status: 'created' }
  }
);

module.exports = mongoose.model('Order', orderSchema);
