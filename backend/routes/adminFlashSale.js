const express = require('express');
const router = express.Router();
const FlashSale = require('../models/FlashSale');
const authAdmin = require('../middleware/authAdmin');

// Get the single flash sale configuration
router.get('/', authAdmin(), async (req, res) => {
  try {
    let sale = await FlashSale.findOne();
    if (!sale) {
      sale = await FlashSale.create({
        title: 'EPIC STORE SALE',
        discountPercent: 10,
        endTime: new Date(Date.now() + 86400000), // +24 hours
        active: false
      });
    }
    res.json(sale);
  } catch (error) {
    console.error('Flash sale GET error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

// Update the flash sale configuration
router.put('/', authAdmin(['owner', 'dev']), async (req, res) => {
  try {
    const { title, discountPercent, endTime, active } = req.body;
    let sale = await FlashSale.findOne();
    if (!sale) {
      sale = new FlashSale();
    }
    sale.title = title;
    sale.discountPercent = discountPercent;
    sale.endTime = endTime;
    sale.active = active;
    await sale.save();
    res.json(sale);
  } catch (error) {
    console.error('Flash sale PUT error:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});

module.exports = router;
