const express = require('express');
const router = express.Router();
const PendingCommand = require('../models/PendingCommand');
const Order = require('../models/Order');

// The plugin secrets are loaded from environment variables
const authenticatePlugin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  
  const survivalSecret = process.env.SURVIVAL_SECRET || 'survival_secret_123!';
  const lifestealSecret = process.env.LIFESTEAL_SECRET || 'lifesteal_secret_123!';
  const globalSecret = process.env.PLUGIN_SECRET || 'vexnetwork_secure_secret_123!';

  let serverConnected = null;

  if (token === survivalSecret) {
    serverConnected = 'survival';
  } else if (token === lifestealSecret) {
    serverConnected = 'lifesteal';
  } else if (token === globalSecret) {
    serverConnected = 'global'; // For backwards compatibility or a proxy-wide plugin
  }

  if (!serverConnected) {
    return res.status(403).json({ error: 'Forbidden: Invalid plugin secret' });
  }

  req.targetServer = serverConnected;
  next();
};

// GET fetch-commands
router.get('/fetch-commands', authenticatePlugin, async (req, res) => {
  try {
    const filter = req.targetServer === 'global' ? {} : { targetServer: { $in: [req.targetServer, 'global'] } };
    const commands = await PendingCommand.find(filter).limit(50);
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
