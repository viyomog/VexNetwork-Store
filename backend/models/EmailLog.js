const mongoose = require('mongoose');

const emailLogSchema = new mongoose.Schema({
  to: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: false
  },
  status: {
    type: String,
    enum: ['sent', 'failed'],
    required: true
  },
  resendId: {
    type: String,
    required: false
  },
  error: {
    type: String,
    required: false
  },
  sentAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('EmailLog', emailLogSchema);
