import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { User, ShieldCheck, Mail, Phone, Lock, CreditCard, Gift, Trash2, ShoppingCart } from 'lucide-react';
import { TiArrowBack } from "react-icons/ti";
import { toast } from '../utils/toast';
import { useFlashSale } from '../context/FlashSaleContext';
import '../checkout.css';

const Checkout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [username, setUsername] = useState(localStorage.getItem('mc_username') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('mc_username'));
  const [loading, setLoading] = useState(false);
  const [pkg, setPkg] = useState(null);
  const [cartItems, setCartItems] = useState(location.state?.cartItems || []);
  
  // New Form State
  const [realName, setRealName] = useState('');
  const [email, setEmail] = useState('');
  const [contact, setContact] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('razorpay');
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState(0);
  const [isGift, setIsGift] = useState(false);
  const [giftUsername, setGiftUsername] = useState('');
  const { flashSale } = useFlashSale();

  const packageId = location.state?.packageId;
  const isCartCheckout = location.state?.isCartCheckout;

  useEffect(() => {
    if (isCartCheckout && cartItems.length === 0) {
      navigate('/empty-cart');
      return;
    }
    if (packageId && !isCartCheckout) {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      axios.get(`${apiUrl}/api/packages/${packageId}`)
        .then(res => setPkg(res.data))
        .catch(err => console.error('Error fetching package:', err));
    }
  }, [packageId, isCartCheckout, cartItems, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim()) return;
    
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/auth/login`, { username });
      localStorage.setItem('mc_username', username);
      setIsLoggedIn(true);
      window.dispatchEvent(new Event('storage'));
    } catch (err) {
      toast.error('Failed to login. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveItem = async (pkgId, idx) => {
    if (!isCartCheckout) return;
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/cart/${username}/remove`, { packageId: pkgId, index: idx });
      setCartItems(prev => prev.filter((_, i) => i !== idx));
      toast.success('Item removed from checkout');
    } catch (err) {
      console.error(err);
      toast.error('Failed to remove item');
    }
  };

  const initPayment = (data) => {
    const options = {
      key: data.keyId,
      amount: data.amount,
      currency: data.currency,
      name: "VexNetwork Store",
      description: isCartCheckout ? `Cart Checkout for ${username}` : `Purchase of ${pkg?.name}`,
      order_id: data.orderId,
      prefill: {
        name: realName,
        email: email,
        contact: contact
      },
      handler: async (response) => {
        try {
          const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
          const verifyUrl = `${apiUrl}/api/payments/verify`;
          const { data: verifyData } = await axios.post(verifyUrl, response);
          console.log(verifyData);
          toast.success('Payment Successful! Your purchase will be applied shortly.');
          navigate('/payment-success', { state: { orderId: verifyData.orderId } });
        } catch (error) {
          console.log(error);
          toast.error('Payment verification failed!');
          navigate('/payment-failed');
        }
      },
      theme: {
        color: "#d8b4fe",
      },
    };
    const rzp1 = new window.Razorpay(options);
    rzp1.open();
  };

  const handleCheckout = async () => {
    if (!isLoggedIn) return;
    if (!isCartCheckout && !packageId) return;
    if (!realName || !email || !contact) {
      return toast.error('Please fill out all Customer Information fields.');
    }
    if (isGift && !giftUsername.trim()) {
      return toast.error("Please enter your friend's Minecraft Username.");
    }
    if (!termsAgreed) {
      return toast.error('You must agree to the Terms & Conditions.');
    }
    
    if (paymentMethod === 'stripe') {
      return toast.info('Stripe payments are coming soon!');
    }
    
    setLoading(true);
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(`${apiUrl}/api/payments/create`, {
        packageId: isCartCheckout ? null : packageId,
        username: isGift ? giftUsername : username,
        buyerUsername: isGift ? username : null,
        isGift,
        email,
        realName,
        isCartCheckout,
        couponCode,
        giftCardCode: paymentMethod === 'giftcard' ? giftCardCode : null
      });
      
      if (data.freeCheckout) {
        toast.success('Payment Successful! Store Credit applied.');
        navigate('/payment-success', { state: { orderId: data.orderId } });
        return;
      }
      
      initPayment(data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to initiate payment. ' + (err.response?.data?.error || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleApplyDiscount = async () => {
    if (!couponCode && (!giftCardCode || paymentMethod !== 'giftcard')) return;
    try {
      const originalSubtotal = isCartCheckout 
        ? cartItems.reduce((sum, item) => sum + (item.price || 0), 0)
        : (pkg?.price || 0);

      const isSaleActive = flashSale && flashSale.active && new Date(flashSale.endTime) > new Date();
      const flashDiscountAmount = isSaleActive ? originalSubtotal * (flashSale.discountPercent / 100) : 0;
      const subtotal = originalSubtotal - flashDiscountAmount;

      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const { data } = await axios.post(`${apiUrl}/api/payments/validate-discount`, {
        amount: subtotal,
        couponCode,
        giftCardCode: paymentMethod === 'giftcard' ? giftCardCode : null
      });
      
      setAppliedDiscount(data.discount);
      toast.success('Discount Applied!');
    } catch (err) {
      setAppliedDiscount(0);
      toast.error(err.response?.data?.error || 'Failed to validate discount');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="container flex-center" style={{ minHeight: '60vh' }}>
        <div className="glass-panel animate-fade-up" style={{ padding: '3rem', maxWidth: '400px', width: '100%', textAlign: 'center' }}>
          <div style={{ width: '64px', height: '64px', background: 'rgba(139, 92, 246, 0.2)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem auto', color: 'var(--primary-purple)' }}>
            <User size={32} />
          </div>
          <h2 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Login to Store</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>Enter your exact Minecraft username to continue.</p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <input 
              type="text" 
              className="input-field" 
              placeholder="Notch" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%' }}>
              {loading ? 'Continuing...' : 'Continue'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (!isCartCheckout && (!packageId || !pkg)) {
    return (
      <div className="container flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <h2>No package selected for checkout.</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">Go to Home</button>
      </div>
    );
  }

  if (isCartCheckout && cartItems.length === 0) {
    return (
      <div className="container flex-center" style={{ minHeight: '60vh', flexDirection: 'column', gap: '1rem' }}>
        <h2>Your cart is empty.</h2>
        <button onClick={() => navigate('/')} className="btn btn-primary">Go to Home</button>
      </div>
    );
  }

  // Calculate Totals and 18% GST Logic
  const isSaleActive = flashSale && flashSale.active && new Date(flashSale.endTime) > new Date();
  
  const originalSubtotal = isCartCheckout 
    ? cartItems.reduce((sum, item) => sum + (item.price || 0), 0)
    : (pkg?.price || 0);
  
  const flashDiscountAmount = isSaleActive ? originalSubtotal * (flashSale.discountPercent / 100) : 0;
  const subtotal = originalSubtotal - flashDiscountAmount;
  
  const gstAmount = subtotal * 0.18;
  const storeDiscount = gstAmount; // Discount cancels out GST exactly
  const finalTotal = Math.max(0, subtotal + gstAmount - storeDiscount - appliedDiscount);

  return (
    <div className="checkout-page-container animate-fade-up">
      <div className="checkout-header" style={{ position: 'relative' }}>
        <button 
          onClick={() => navigate(-1)} 
          style={{ position: 'absolute', left: 0, top: '0.5rem', background: 'transparent', border: 'none', color: 'var(--text-muted)', fontSize: '2rem', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <TiArrowBack />
        </button>
        <h1 style={{ paddingLeft: '3rem' }}>Secure Checkout</h1>
        <p style={{ paddingLeft: '3rem' }}>Review your items and complete your purchase securely.</p>
      </div>
      
      <div className="checkout-grid">
        
        {/* Left Column: Order Summary */}
        <div className="checkout-section">
          <div className="checkout-section-title">Order Summary</div>
          
          <div className="checkout-items-list">
            {isCartCheckout ? (
              cartItems.map((item, idx) => (
                <div key={`${item._id}-${idx}`} className="checkout-item-card">
                  <div className="checkout-item-details">
                    <div className="checkout-item-icon" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: item.imageUrl ? '0' : '1rem' }}>
                      {item.imageUrl ? <img src={item.imageUrl} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} /> : <ShoppingCart size={24} color="#d8b4fe" />}
                    </div>
                    <div className="checkout-item-info">
                      <h4 style={{ color: item.color || '#fff' }}>{item.name}</h4>
                      <p>{item.category.replace('-', ' ')}</p>
                    </div>
                  </div>
                  <div className="checkout-item-price-remove">
                    <div className="checkout-item-price">
                      {isSaleActive ? (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                          <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>₹{item.price.toFixed(2)}</span>
                          <span style={{ color: '#10b981' }}>₹{(item.price - (item.price * (flashSale.discountPercent / 100))).toFixed(2)}</span>
                        </div>
                      ) : (
                        `₹${item.price.toFixed(2)}`
                      )}
                    </div>
                    <button className="checkout-item-remove" onClick={() => handleRemoveItem(item._id, idx)}>
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="checkout-item-card">
                <div className="checkout-item-details">
                  <div className="checkout-item-icon" style={{ overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: pkg?.imageUrl ? '0' : '1rem' }}>
                    {pkg?.imageUrl ? <img src={pkg.imageUrl} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '8px' }} /> : <ShoppingCart size={24} color="#d8b4fe" />}
                  </div>
                  <div className="checkout-item-info">
                    <h4 style={{ color: pkg?.color || '#fff' }}>{pkg?.name}</h4>
                    <p>Direct Purchase</p>
                  </div>
                </div>
                <div className="checkout-item-price-remove">
                  <div className="checkout-item-price">
                    {isSaleActive ? (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', fontSize: '0.8rem' }}>₹{(pkg?.price || 0).toFixed(2)}</span>
                        <span style={{ color: '#10b981' }}>₹{((pkg?.price || 0) - ((pkg?.price || 0) * (flashSale.discountPercent / 100))).toFixed(2)}</span>
                      </div>
                    ) : (
                      `₹${(pkg?.price || 0).toFixed(2)}`
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-totals">
            <div className="checkout-total-line">
              <span>Subtotal</span>
              <span>
                {isSaleActive ? (
                  <span style={{ textDecoration: 'line-through', color: 'var(--text-muted)', marginRight: '0.5rem' }}>₹{originalSubtotal.toFixed(2)}</span>
                ) : null}
                ₹{subtotal.toFixed(2)}
              </span>
            </div>
            {isSaleActive && (
              <div className="checkout-total-line" style={{ marginTop: '0.5rem', color: '#10b981' }}>
                <span>Flash Sale Discount ({flashSale.discountPercent}%)</span>
                <span>-₹{flashDiscountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="checkout-total-line" style={{ marginTop: '0.5rem' }}>
              <span>Taxes & Fees (18% GST)</span>
              <span>₹{gstAmount.toFixed(2)}</span>
            </div>
            <div className="checkout-total-line" style={{ marginTop: '0.5rem', color: '#10b981' }}>
              <span>Store Discount (GST Absorbed)</span>
              <span>-₹{storeDiscount.toFixed(2)}</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="checkout-total-line" style={{ marginTop: '0.5rem', color: '#10b981' }}>
                <span>Promo Discount</span>
                <span>-₹{appliedDiscount.toFixed(2)}</span>
              </div>
            )}
            <div className="checkout-total-line final-total">
              <span>Total</span>
              <span>₹{finalTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Right Column: Customer Info & Payment */}
        <div>
          {/* Gifting Section */}
          <div className="checkout-section" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isGift ? '1.5rem' : '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Gift className="text-orange" />
                <h2 style={{ fontSize: '1.2rem', margin: 0, fontWeight: 600 }}>Gift a Friend?</h2>
              </div>
              <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                <input type="checkbox" checked={isGift} onChange={e => setIsGift(e.target.checked)} style={{ width: '20px', height: '20px', accentColor: 'var(--accent-orange)' }} />
              </label>
            </div>
            
            {isGift && (
              <div className="animate-fade-up">
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '1rem' }}>Your friend will receive the items in-game, but the receipt will be emailed to you.</p>
                <div className="checkout-input-group" style={{ marginBottom: 0 }}>
                  <label>Friend's Minecraft Username *</label>
                  <div className="checkout-input-wrapper">
                    <User size={18} className="checkout-input-icon" />
                    <input 
                      type="text" 
                      className="checkout-input" 
                      placeholder="e.g. Notch"
                      value={giftUsername}
                      onChange={e => setGiftUsername(e.target.value)}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="checkout-section" style={{ marginBottom: '2rem' }}>
            <div className="checkout-section-title">Customer Information</div>
            
            <div className="checkout-input-group">
              <label>Real Name</label>
              <div className="checkout-input-wrapper">
                <User size={18} className="checkout-input-icon" />
                <input 
                  type="text" 
                  className="checkout-input" 
                  placeholder="John Doe"
                  value={realName}
                  onChange={e => setRealName(e.target.value)}
                />
              </div>
            </div>

            <div className="checkout-input-group">
              <label>Email Address</label>
              <div className="checkout-input-wrapper">
                <Mail size={18} className="checkout-input-icon" />
                <input 
                  type="email" 
                  className="checkout-input" 
                  placeholder="receipts@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="checkout-input-group" style={{ marginBottom: 0 }}>
              <label>Contact Number</label>
              <div className="checkout-input-wrapper">
                <Phone size={18} className="checkout-input-icon" />
                <input 
                  type="tel" 
                  className="checkout-input" 
                  placeholder="+91 9876543210"
                  value={contact}
                  onChange={e => setContact(e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <div className="checkout-section-title">Payment Method</div>
            
            <div className="checkout-payment-methods">
              <label className={`payment-method-label ${paymentMethod === 'razorpay' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  className="payment-radio"
                  checked={paymentMethod === 'razorpay'}
                  onChange={() => setPaymentMethod('razorpay')}
                />
                <div className="payment-method-info">
                  <CreditCard size={20} className="payment-method-icon" /> Razorpay
                </div>
              </label>

              <label className={`payment-method-label disabled ${paymentMethod === 'stripe' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  className="payment-radio"
                  checked={paymentMethod === 'stripe'}
                  onChange={() => setPaymentMethod('stripe')}
                />
                <div className="payment-method-info" style={{ color: 'var(--text-muted)' }}>
                  <CreditCard size={20} /> Stripe (Coming Soon)
                </div>
              </label>

              <label className={`payment-method-label ${paymentMethod === 'giftcard' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="payment" 
                  className="payment-radio"
                  checked={paymentMethod === 'giftcard'}
                  onChange={() => setPaymentMethod('giftcard')}
                />
                <div className="payment-method-info">
                  <Gift size={20} className="payment-method-icon" /> Gift Card
                </div>
              </label>
              
              {paymentMethod === 'giftcard' && (
                <div className="checkout-input-wrapper" style={{ marginTop: '0.5rem' }}>
                  <Gift size={18} className="checkout-input-icon" />
                  <input 
                    type="text" 
                    className="checkout-input" 
                    placeholder="Enter Gift Card Code"
                    value={giftCardCode}
                    onChange={e => setGiftCardCode(e.target.value.toUpperCase())}
                  />
                </div>
              )}
            </div>
            
            <div className="checkout-input-group" style={{ marginTop: '1.5rem', marginBottom: '1rem' }}>
              <label>Promo / Coupon Code</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <input 
                  type="text" 
                  className="checkout-input" 
                  placeholder="SUMMER25"
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value.toUpperCase())}
                  style={{ flexGrow: 1 }}
                />
                <button type="button" onClick={handleApplyDiscount} className="btn-sm bg-orange" style={{ border: 'none', borderRadius: '8px' }}>Apply</button>
              </div>
            </div>

            <label className="checkout-terms">
              <input 
                type="checkbox" 
                checked={termsAgreed}
                onChange={e => setTermsAgreed(e.target.checked)}
              />
              <span>I agree to the <strong>Terms & Conditions</strong> and <strong>Refund Policy</strong>.</span>
            </label>

            <button 
              onClick={handleCheckout} 
              className="checkout-submit-btn" 
              disabled={loading}
            >
              <Lock size={18} /> {loading ? 'Processing...' : 'Complete Purchase'}
            </button>

            <div className="checkout-secure-footer">
              <ShieldCheck size={14} /> Secure SSL Encrypted Checkout
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
};

export default Checkout;
