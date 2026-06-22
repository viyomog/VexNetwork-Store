const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const rateLimit = require('express-rate-limit');
const Order = require('../models/Order');
const Package = require('../models/Package');
const User = require('../models/User');
const Coupon = require('../models/Coupon');
const GiftCard = require('../models/GiftCard');
const FlashSale = require('../models/FlashSale');
const PendingCommand = require('../models/PendingCommand');
const generateInvoice = require('../utils/invoiceGenerator');
const sendInvoiceEmail = require('../utils/emailSender');

// Helper to process commands
async function generatePendingCommands(order) {
  try {
    let packagesToProcess = [];
    if (order.isCartCheckout && order.cartItems && order.cartItems.length > 0) {
      packagesToProcess = await Package.find({ _id: { $in: order.cartItems } });
    } else if (order.packageId) {
      const pkg = await Package.findById(order.packageId);
      if (pkg) packagesToProcess.push(pkg);
    }

    for (const pkg of packagesToProcess) {
      if (pkg.infoDetails && pkg.infoDetails.commands) {
        for (const cmdTemplate of pkg.infoDetails.commands) {
          if (!cmdTemplate.trim()) continue;
          const parsedCmd = cmdTemplate.replace(/{username}/g, order.username);
          await PendingCommand.create({
            command: parsedCmd,
            username: order.username,
            orderId: order.orderId,
            packageId: pkg._id,
            targetServer: pkg.targetServer || 'global'
          });
        }
      }
    }
  } catch (err) {
    console.error('Error generating pending commands:', err);
  }
}

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'dummy_key_id',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret',
});

// Strict Rate Limiter for Coupons (max 5 requests per minute)
const couponLimiter = rateLimit({
  windowMs: 60 * 1000, 
  max: 5,
  message: { error: 'Too many coupon attempts. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Validate Discount
router.post('/validate-discount', couponLimiter, async (req, res) => {
  try {
    const { amount, couponCode, giftCardCode } = req.body;
    let discount = 0;

    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (!coupon) return res.status(400).json({ error: 'Invalid Coupon' });
      if (coupon.expiry && new Date(coupon.expiry) < new Date()) return res.status(400).json({ error: 'Invalid Coupon' });
      if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) return res.status(400).json({ error: 'Invalid Coupon' });
      if (coupon.minCartValue > amount) return res.status(400).json({ error: `Cart value must be at least ₹${coupon.minCartValue}` });
      
      if (coupon.type === 'percentage') {
        discount += amount * (coupon.value / 100);
      } else {
        discount += coupon.value;
      }
    }

    if (giftCardCode) {
      const card = await GiftCard.findOne({ code: giftCardCode.toUpperCase(), status: 'active' });
      if (!card) return res.status(400).json({ error: 'Invalid Gift Card' });
      discount += card.amount;
    }

    res.json({ discount });
  } catch (error) {
    res.status(500).json({ error: 'Failed to validate discount' });
  }
});

// Create Order
router.post('/create', async (req, res) => {
  try {
    const { packageId, username, email, realName, isCartCheckout, couponCode, giftCardCode, isGift, buyerUsername } = req.body;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }

    let amount = 0;
    let description = '';
    let cartItems = [];

    const cartLookupUsername = isGift ? buyerUsername : username;

    if (isCartCheckout) {
      const user = await User.findOne({ username: new RegExp(`^${cartLookupUsername}$`, 'i') }).populate('cart');
      if (!user || user.cart.length === 0) {
        return res.status(400).json({ error: 'Cart is empty or user not found' });
      }
      amount = user.cart.reduce((sum, item) => sum + (item?.price || 0), 0);
      description = `Cart checkout for ${username}`;
      cartItems = user.cart.map(item => item._id);
    } else {
      if (!packageId) {
        return res.status(400).json({ error: 'Package ID is required for direct purchase' });
      }
      const pkg = await Package.findById(packageId);
      if (!pkg) {
        return res.status(404).json({ error: 'Package not found' });
      }
      amount = pkg.price;
      description = `Purchase of ${pkg.name}`;
    }

    if (amount <= 0) {
      return res.status(400).json({ error: 'Invalid order amount' });
    }

    // Apply Flash Sale first
    const flashSale = await FlashSale.findOne();
    let flashDiscountAmount = 0;
    if (flashSale && flashSale.active && new Date(flashSale.endTime) > new Date()) {
      flashDiscountAmount = amount * (flashSale.discountPercent / 100);
      amount = amount - flashDiscountAmount; // Reduce base amount for coupon
    }

    let discount = 0;
    
    // Apply Coupon
    if (couponCode) {
      const coupon = await Coupon.findOne({ code: couponCode.toUpperCase(), active: true });
      if (coupon) {
        if (coupon.expiry && new Date(coupon.expiry) < new Date()) {
          return res.status(400).json({ error: 'Coupon expired' });
        }
        if (coupon.maxUses > 0 && coupon.usedCount >= coupon.maxUses) {
          return res.status(400).json({ error: 'Coupon max uses reached' });
        }
        if (coupon.minCartValue > amount) {
          return res.status(400).json({ error: `Cart value must be at least ₹${coupon.minCartValue}` });
        }
        if (coupon.type === 'percentage') {
          discount += amount * (coupon.value / 100);
        } else {
          discount += coupon.value;
        }
      }
    }

    // Apply Gift Card
    if (giftCardCode) {
      const card = await GiftCard.findOne({ code: giftCardCode.toUpperCase(), status: 'active' });
      if (card) {
        discount += card.amount;
      } else {
        return res.status(400).json({ error: 'Invalid or inactive Gift Card' });
      }
    }

    let finalAmount = Math.max(0, amount - discount);

    // Razorpay amount is in paise (multiply by 100). Minimum amount Razorpay accepts is ₹1 (100 paise)
    // If final amount is 0, we can bypass Razorpay, but for simplicity of this implementation, let's say minimum is 1 INR if not fully free.
    // However, if the gift card covers 100%, we should ideally skip Razorpay entirely.
    // For now, if finalAmount == 0, we will still let it pass if Razorpay allows it or we simulate a fake order.
    // Razorpay requires at least 1 INR. If it's completely free, we need a separate "free checkout" flow.
    // Let's implement a quick bypass if finalAmount <= 0.
    
    if (finalAmount <= 0) {
      const newOrder = new Order({
        orderId: `free_${Date.now()}_${username}`,
        username,
        email,
        realName,
        packageId: isCartCheckout ? null : packageId,
        amount: 0,
        isCartCheckout,
        cartItems,
        status: 'paid', // Mark as paid immediately
        couponUsed: couponCode ? couponCode.toUpperCase() : null,
        giftCardUsed: giftCardCode ? giftCardCode.toUpperCase() : null,
        isGift,
        buyerUsername
      });
      await newOrder.save();

      // Process immediately
      if (isCartCheckout) {
        await User.findOneAndUpdate(
          { username: new RegExp(`^${cartLookupUsername}$`, 'i') },
          { $set: { cart: [] } }
        );
      }
      if (couponCode) await Coupon.findOneAndUpdate({ code: couponCode.toUpperCase() }, { $inc: { usedCount: 1 } });
      if (giftCardCode) await GiftCard.findOneAndUpdate({ code: giftCardCode.toUpperCase() }, { status: 'used' });

      await generatePendingCommands(newOrder);

      try {
        let packagesToProcess = [];
        if (newOrder.isCartCheckout && newOrder.cartItems && newOrder.cartItems.length > 0) {
          packagesToProcess = await Package.find({ _id: { $in: newOrder.cartItems } });
        } else if (newOrder.packageId) {
          const pkg = await Package.findById(newOrder.packageId);
          if (pkg) packagesToProcess.push(pkg);
        }
        const pdfBuffer = await generateInvoice(newOrder, packagesToProcess);
        await sendInvoiceEmail(newOrder, pdfBuffer);
      } catch (emailErr) {
        console.error("Error generating/sending free invoice:", emailErr);
      }

      return res.json({ freeCheckout: true, orderId: newOrder.orderId });
    }

    const options = {
      amount: Math.round(finalAmount * 100),
      currency: 'INR',
      receipt: `receipt_${Date.now()}_${username}`
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return res.status(500).json({ error: 'Some error occurred while creating Razorpay order' });
    }

    // Save order to our DB
    const newOrder = new Order({
      orderId: order.id,
      username,
      email,
      realName,
      packageId: isCartCheckout ? null : packageId,
      amount: finalAmount,
      isCartCheckout,
      cartItems,
      couponUsed: couponCode ? couponCode.toUpperCase() : null,
      giftCardUsed: giftCardCode ? giftCardCode.toUpperCase() : null,
      isGift,
      buyerUsername
    });
    await newOrder.save();

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID
    });

  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Verify Payment
router.post('/verify', async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body;

    const sign = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSign = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET || 'dummy_key_secret')
      .update(sign.toString())
      .digest("hex");

    if (razorpay_signature === expectedSign) {
      // Payment is successful
      const order = await Order.findOneAndUpdate(
        { orderId: razorpay_order_id },
        { status: 'paid', paymentId: razorpay_payment_id },
        { returnDocument: 'after' }
      );
      
      // If it was a cart checkout, clear the user's cart (use buyerUsername if it's a gift)
      if (order && order.isCartCheckout) {
        const cartClearUsername = order.isGift ? order.buyerUsername : order.username;
        await User.findOneAndUpdate(
          { username: new RegExp(`^${cartClearUsername}$`, 'i') },
          { $set: { cart: [] } }
        );
      }

      // Mark coupon and giftcard used
      if (order && order.couponUsed) {
        await Coupon.findOneAndUpdate({ code: order.couponUsed }, { $inc: { usedCount: 1 } });
      }
      if (order && order.giftCardUsed) {
        await GiftCard.findOneAndUpdate({ code: order.giftCardUsed }, { status: 'used' });
      }
      
      // Trigger command generation for plugin
      if (order) {
        await generatePendingCommands(order);

        // Generate and Send Invoice
        try {
          let packagesToProcess = [];
          if (order.isCartCheckout && order.cartItems && order.cartItems.length > 0) {
            packagesToProcess = await Package.find({ _id: { $in: order.cartItems } });
          } else if (order.packageId) {
            const pkg = await Package.findById(order.packageId);
            if (pkg) packagesToProcess.push(pkg);
          }
          const pdfBuffer = await generateInvoice(order, packagesToProcess);
          await sendInvoiceEmail(order, pdfBuffer);
        } catch (emailErr) {
          console.error("Error generating/sending invoice:", emailErr);
        }
      }
      
      return res.status(200).json({ message: "Payment verified successfully", orderId: razorpay_order_id });
    } else {
      return res.status(400).json({ message: "Invalid signature sent!" });
    }
  } catch (error) {
    console.error('Error verifying payment:', error);
    res.status(500).json({ message: "Internal Server Error!" });
  }
});

// Download Invoice Route
router.get('/invoice/:orderId', async (req, res) => {
  try {
    const order = await Order.findOne({ orderId: req.params.orderId });
    if (!order) return res.status(404).json({ error: 'Order not found' });

    let packagesToProcess = [];
    if (order.isCartCheckout && order.cartItems && order.cartItems.length > 0) {
      packagesToProcess = await Package.find({ _id: { $in: order.cartItems } });
    } else if (order.packageId) {
      const pkg = await Package.findById(order.packageId);
      if (pkg) packagesToProcess.push(pkg);
    }

    const pdfBuffer = await generateInvoice(order, packagesToProcess);
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=Invoice_${order.orderId}.pdf`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Error downloading invoice:', error);
    res.status(500).json({ error: 'Failed to generate invoice' });
  }
});

module.exports = router;
