const express = require('express');
const router = express.Router();
const PendingCommand = require('../models/PendingCommand');
const Order = require('../models/Order');

// In a real application, you should store this secret in .env
// For this tutorial/project, we'll read it from env or default it
const PLUGIN_SECRET = process.env.PLUGIN_SECRET || 'vexnetwork_secure_secret_123!';

// Middleware to authenticate the plugin
const authenticatePlugin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  if (token !== PLUGIN_SECRET) {
    return res.status(403).json({ error: 'Forbidden: Invalid plugin secret' });
  }

  next();
};

// GET fetch-commands
router.get('/fetch-commands', authenticatePlugin, async (req, res) => {
  try {
    const commands = await PendingCommand.find().limit(50);
    res.json(commands);
  } catch (err) {
    console.error('Error fetching commands for plugin:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

// POST ack-commands
router.post('/ack-commands', authenticatePlugin, async (req, res) => {
  try {
    const { commandIds } = req.body;
    if (!commandIds || !Array.isArray(commandIds)) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Fetch commands to get their orderIds before deleting
    const commandsToAck = await PendingCommand.find({ _id: { $in: commandIds } });
    const orderIds = [...new Set(commandsToAck.map(cmd => cmd.orderId).filter(id => id))];

    // Delete the commands that have been executed successfully
    await PendingCommand.deleteMany({ _id: { $in: commandIds } });
    
    // Update the associated orders to 'delivered'
    if (orderIds.length > 0) {
      await Order.updateMany(
        { orderId: { $in: orderIds } },
        { $set: { deliveryStatus: 'delivered' } }
      );
    }
    
    res.json({ success: true, acknowledged: commandIds.length });
  } catch (err) {
    console.error('Error acknowledging commands:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
