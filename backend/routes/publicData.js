const express = require('express');
const router = express.Router();
const Announcement = require('../models/Announcement');
const GiftCard = require('../models/GiftCard');
const FlashSale = require('../models/FlashSale');

// GET public flash sale
router.get('/flash-sale', async (req, res) => {
  try {
    const sale = await FlashSale.findOne();
    if (sale && sale.active && new Date(sale.endTime) > new Date()) {
      return res.json({
        active: true,
        title: sale.title,
        discountPercent: sale.discountPercent,
        endTime: sale.endTime
      });
    }
    return res.json({ active: false });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
});

// GET public announcements
router.get('/announcements', async (req, res) => {
  try {
    const settings = await Announcement.findOne().lean();
    if (!settings) {
      return res.json({
        bannerActive: false,
        bannerText: '',
        popupActive: false,
        popupText: ''
      });
    }

    res.json({
      bannerActive: settings.bannerActive,
      bannerText: settings.bannerText,
      popupActive: settings.popupActive,
      popupText: settings.popupText
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch announcements' });
  }
});

// GET public gift card balance
router.get('/giftcard/:code', async (req, res) => {
  try {
    const code = req.params.code.toUpperCase();
    const card = await GiftCard.findOne({ code }).lean();

    if (!card) {
      return res.status(404).json({ error: 'Gift card not found' });
    }

    res.json({
      amount: card.amount,
      status: card.status
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch gift card' });
  }
});

module.exports = router;
