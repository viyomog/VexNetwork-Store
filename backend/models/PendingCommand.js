const mongoose = require('mongoose');

const pendingCommandSchema = new mongoose.Schema({
  command: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true
  },
  orderId: {
    type: String,
    required: true
  },
  packageId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Package',
    required: false
  },
  targetServer: {
    type: String,
    enum: ['global', 'survival', 'lifesteal'],
    default: 'global'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('PendingCommand', pendingCommandSchema);
