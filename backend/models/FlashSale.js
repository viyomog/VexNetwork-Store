const mongoose = require('mongoose');

const flashSaleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    default: 'FLASH SALE'
  },
  discountPercent: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  endTime: {
    type: Date,
    required: true
  },
  active: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model('FlashSale', flashSaleSchema);
