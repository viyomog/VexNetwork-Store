require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const packageRoutes = require('./routes/packages');
const paymentRoutes = require('./routes/payments');
const cartRoutes = require('./routes/cart');
const adminAuthRoutes = require('./routes/adminAuth');
const adminDataRoutes = require('./routes/adminData');
const adminOrdersRoutes = require('./routes/adminOrders');
const adminProductsRoutes = require('./routes/adminProducts');
const adminCustomersRoutes = require('./routes/adminCustomers');
const adminPaymentsRoutes = require('./routes/adminPayments');
const adminCouponsRoutes = require('./routes/adminCoupons');
const adminGiftCardsRoutes = require('./routes/adminGiftCards');
const adminAnnouncementsRoutes = require('./routes/adminAnnouncements');
const adminFlashSaleRoutes = require('./routes/adminFlashSale');
const uploadRoutes = require('./routes/upload');
const publicDataRoutes = require('./routes/publicData');
const pluginAPIRoutes = require('./routes/pluginAPI');

const app = express();

// CORS configuration (Domain Locking)
const allowedOrigins = [
  'https://store.vexnetwork.fun',
  process.env.FRONTEND_URL,
  'http://localhost:5173'
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());

// Global Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader('Content-Security-Policy', "default-src 'self'; img-src 'self' data: https:; font-src 'self' data: https:; style-src 'self' 'unsafe-inline' https:; script-src 'self' 'unsafe-inline' 'unsafe-eval' https:; connect-src 'self' https: wss:; object-src 'none'; frame-ancestors 'none';");
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// API Rate Limiting
app.set('trust proxy', 1);
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 150, // limit each IP to 150 requests per windowMs
  message: { error: 'Too many requests from this IP, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', globalLimiter);

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/VexNetwork')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admin', adminAuthRoutes);
app.use('/api/admin/data', adminDataRoutes);
app.use('/api/admin/orders', adminOrdersRoutes);
app.use('/api/admin/products', adminProductsRoutes);
app.use('/api/admin/customers', adminCustomersRoutes);
app.use('/api/admin/payments', adminPaymentsRoutes);
app.use('/api/admin/coupons', adminCouponsRoutes);
app.use('/api/admin/giftcards', adminGiftCardsRoutes);
app.use('/api/admin/announcements', adminAnnouncementsRoutes);
app.use('/api/admin/flash-sale', adminFlashSaleRoutes);
app.use('/api/upload', uploadRoutes);

// Public API
app.use('/api/public', publicDataRoutes);
app.use('/api/plugin', pluginAPIRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Minecraft Store API is running.' });
});

// Root route
app.get('/', (req, res) => {
  res.send(`
    <html>
      <body style="font-family: system-ui, sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; margin: 0; background-color: #0f0f13; color: white;">
        <div style="text-align: center; background: rgba(168,85,247,0.1); padding: 3rem; border-radius: 12px; border: 1px solid rgba(168,85,247,0.3);">
          <h1 style="color: #a855f7; margin-bottom: 1rem;">VexNetwork Backend API</h1>
          <p style="color: #9ca3af;">The backend server is online and running successfully.</p>
        </div>
      </body>
    </html>
  `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
