import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Outlet } from 'react-router-dom';
import axios from 'axios';
import { XCircle } from 'lucide-react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ToastContainer from './components/ToastContainer';
import Home from './pages/Home';
import Store from './pages/Store';
import Checkout from './pages/Checkout';

import Terms from './pages/Terms';
import Impressum from './pages/Impressum';
import Privacy from './pages/Privacy';
import Category from './pages/Category';
import PaymentSuccess from './pages/PaymentSuccess';
import PaymentFailed from './pages/PaymentFailed';
import EmptyCart from './pages/EmptyCart';
import HeroBanner from './components/HeroBanner';
import FlashSaleBanner from './components/FlashSaleBanner';
import { FlashSaleProvider } from './context/FlashSaleContext';
import NotFound from './pages/NotFound';

// Admin imports
import AdminLogin from './pages/admin/AdminLogin';
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import Orders from './pages/admin/Orders';
import Products from './pages/admin/Products';
import FeaturedPackages from './pages/admin/FeaturedPackages';
import Customers from './pages/admin/Customers';
import Payments from './pages/admin/Payments';
import Coupons from './pages/admin/Coupons';
import GiftCards from './pages/admin/GiftCards';
import Announcements from './pages/admin/Announcements';
import FlashSaleAdmin from './pages/admin/FlashSale';

const StoreLayout = () => {
  const location = useLocation();
  const isCheckout = location.pathname === '/checkout';

  const [announcements, setAnnouncements] = useState({ bannerActive: false, bannerText: '', popupActive: false, popupText: '' });
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiUrl}/api/public/announcements`);
        setAnnouncements(res.data);
        if (res.data.popupActive) {
          setShowPopup(true);
        }
      } catch (err) {
        console.error('Failed to load announcements');
      }
    };
    fetchAnnouncements();
  }, []);

  return (
    <div className="app-container">
      <FlashSaleBanner />
      {announcements.bannerActive && !isCheckout && (
        <div style={{ background: 'var(--accent-orange)', color: '#fff', textAlign: 'center', padding: '0.75rem', fontWeight: 'bold', zIndex: 1000, position: 'relative', overflow: 'hidden', whiteSpace: 'nowrap' }}>
          <marquee scrollamount="10" behavior="scroll" direction="left" style={{ width: '100%', verticalAlign: 'middle' }}>
            {announcements.bannerText}
          </marquee>
        </div>
      )}
      <div style={{ position: 'relative' }}>
        <Navbar />
        {!isCheckout && <HeroBanner />}
        <main style={{ minHeight: '80vh' }}>
          <Outlet />
        </main>
      </div>
      <Footer />

      {showPopup && !isCheckout && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="animate-fade-up" style={{ background: 'var(--panel-bg)', padding: '2rem', borderRadius: '16px', maxWidth: '500px', width: '100%', position: 'relative', border: '1px solid var(--accent-cyan)', boxShadow: '0 0 30px rgba(6,182,212,0.2)' }}>
            <button onClick={() => setShowPopup(false)} style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}><XCircle size={24} /></button>
            <h2 style={{ color: 'var(--accent-cyan)', marginBottom: '1rem', marginTop: 0 }}>📢 Announcement</h2>
            <p style={{ color: '#fff', lineHeight: '1.6', whiteSpace: 'pre-wrap' }}>{announcements.popupText}</p>
            <button onClick={() => setShowPopup(false)} style={{ width: '100%', padding: '0.75rem', marginTop: '1.5rem', background: 'var(--accent-cyan)', color: '#000', fontWeight: 'bold', border: 'none', borderRadius: '8px', cursor: 'pointer' }}>Got it!</button>
          </div>
        </div>
      )}
    </div>
  );
};

function App() {
  return (
    <Router>
      <ToastContainer />
      <Routes>
        {/* Admin Routes */}
        <Route path="/user/admin/login" element={<AdminLogin />} />
        <Route path="/user/admin/*" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="orders" element={<Orders />} />
          <Route path="products" element={<Products />} />
          <Route path="featured" element={<FeaturedPackages />} />
          <Route path="customers" element={<Customers />} />
          <Route path="payments" element={<Payments />} />
          <Route path="coupons" element={<Coupons />} />
          <Route path="giftcards" element={<GiftCards />} />
          <Route path="announcements" element={<Announcements />} />
          <Route path="flash-sale" element={<FlashSaleAdmin />} />
        </Route>

        {/* Store Routes within Layout */}
        <Route element={<FlashSaleProvider><StoreLayout /></FlashSaleProvider>}>
          <Route path="/" element={<Home />} />
          <Route path="/store" element={<Store />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/payment-success" element={<PaymentSuccess />} />
          <Route path="/payment-failed" element={<PaymentFailed />} />
          <Route path="/empty-cart" element={<EmptyCart />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/impressum" element={<Impressum />} />
          <Route path="/privacy" element={<Privacy />} />
        </Route>

        {/* 404 Route outside Layout */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;
