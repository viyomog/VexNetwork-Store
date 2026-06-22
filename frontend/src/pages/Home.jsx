import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { FaFire, FaDiscord, FaGift as GiftIcon } from 'react-icons/fa';
import { toast } from '../utils/toast';

import bannerImg from '../assets/banner.jpg';
import logoImg from '../assets/logo.png';
import coinImg from '../assets/coin.png';
import rank1Img from '../assets/rank (1).png';
import rank2Img from '../assets/rank (2).png';
import PackageCard from '../components/PackageCard';

const Home = () => {
  const [packages, setPackages] = useState([]);
  const [giftCardCode, setGiftCardCode] = useState('');
  const [giftCardResult, setGiftCardResult] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeatured = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiUrl}/api/packages/featured`);
        setPackages(res.data);
      } catch (err) {
        console.error('Failed to load featured packages');
      }
    };
    fetchFeatured();
  }, []);

  const handleCheckGiftCard = async () => {
    if (!giftCardCode) return toast.error('Enter a gift card code');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${apiUrl}/api/public/giftcard/${giftCardCode}`);
      setGiftCardResult(res.data);
    } catch (err) {
      if (err.response?.status === 404) {
        toast.error('Invalid Gift Card Code');
      } else {
        toast.error('Failed to check balance');
      }
      setGiftCardResult(null);
    }
  };

  const handlePurchase = (pkgId) => {
    navigate('/checkout', { state: { packageId: pkgId } });
  };

  return (
    <div>
      {/* Main Content Layout */}
      <section className="container home-layout">

        {/* Sidebar */}
        <aside className="home-sidebar">
          <div className="sidebar-panel">
            <div className="sidebar-header">SELECT A CATEGORY</div>
            <Link to="/category/lifesteal-coin" style={{ textDecoration: 'none' }}>
              <div className="sidebar-item">
                <img src={coinImg} alt="Coins" /> Coins [LifeSteal]
              </div>
            </Link>
            <Link to="/category/lifesteal-rank" style={{ textDecoration: 'none' }}>
              <div className="sidebar-item">
                <img src={rank1Img} alt="Lifesteal Rank" /> Lifesteal Ranks
              </div>
            </Link>
            <Link to="/category/survival-coin" style={{ textDecoration: 'none' }}>
              <div className="sidebar-item">
                <img src={coinImg} alt="Coins" /> Coins [Survival]
              </div>
            </Link>
            <Link to="/category/survival-rank" style={{ textDecoration: 'none' }}>
              <div className="sidebar-item">
                <img src={rank2Img} alt="Survival Rank" /> Survival Ranks
              </div>
            </Link>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flexGrow: 1, width: '100%' }}>

          <div className="content-panel" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
            <div className="panel-header">FEATURED PACKAGES</div>
            {packages.length > 0 ? (
              <div className="featured-grid">
                {packages.map(pkg => (
                  <PackageCard key={pkg._id} pkg={pkg} onPurchase={handlePurchase} />
                ))}
              </div>
            ) : (
              <p style={{ color: 'var(--text-muted)' }}>Check back later for featured items!</p>
            )}
          </div>

          {/* Server Info / Rules Placeholder */}
          <div className="content-panel" style={{ marginTop: '2rem' }}>
            <h2 className="panel-header" style={{ fontSize: '1.5rem', marginTop: 0 }}>VexNetwork Store</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              VexNetwork is a free-to-play Public Minecraft Server. Items can be purchased here to enhance gameplay and grant the player various special perks.<br />
              Please note that all purchases are final; purchases won't be refunded if you are banned, jailed, or muted in-game for breaking our rules. Please ensure you are over 18 or have parental permission before purchasing from the store.
            </p>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6' }}>
              Need any questions answered before checkout? Waited more than 20 minutes but your package still has not arrived? Ask the community/staff on Discord, or for payment support, submit a support ticket on our Discord Server. You can also contact us on our Public Contact Email: <a href="mailto:vexnetworrkk@gmail.com" className="text-orange">vexnetworrkk@gmail.com</a>
            </p>
            <button className="btn-sm bg-orange" onClick={() => window.open('https://discord.gg/d6q9ZvC55b', '_blank')}>Discord Server</button>

            <h2 className="panel-header" style={{ fontSize: '1.2rem', marginTop: '2rem', color: 'var(--accent-red)' }}>REFUND POLICY</h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              All payments are final and non-refundable. Attempting a chargeback or opening a PayPal dispute will result in <strong>permanent</strong> and irreversible <strong>banishment</strong> from all of our servers, and other minecraft stores.<br />
              Payments are taken and secured by Our Payment Gateways, a world leader in online gaming transactions.<br /><br />
              It could take between 1-20 minutes for your purchase to be credited in-game. If you are still not credited after this time period, please open a support ticket on our forums with proof of purchase and we will look into your issue.<br />
              If you are banned from VexNetwork for breaking our rules, you will lose access to your purchased goods for the duration of your ban. The strict "no refund policy" will also remain in place.
            </p>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button className="btn-sm bg-red" onClick={() => navigate('/terms')}>Terms and Conditions</button>
              <button className="btn-sm bg-red" onClick={() => navigate('/impressum')}>Impressum</button>
              <button className="btn-sm bg-red" onClick={() => navigate('/privacy')}>Privacy Policy</button>
            </div>

            <div className="gift-card-box" style={{ background: '#26272e', marginTop: '3rem', maxWidth: '400px', padding: '1.5rem', borderRadius: '8px', border: 'none' }}>
              <div style={{ width: '100%' }}>
                <h3 style={{ color: 'var(--accent-orange)', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span><GiftIcon /></span> GIFT CARD BALANCE
                </h3>
                <div style={{ display: 'flex', background: 'var(--bg-color)', borderRadius: '6px' }}>
                  <input type="text" value={giftCardCode} onChange={e => setGiftCardCode(e.target.value.toUpperCase())} placeholder="Card Number" style={{ flexGrow: 1, padding: '0.75rem', background: 'transparent', border: 'none', color: '#fff', outline: 'none' }} />
                  <button onClick={handleCheckGiftCard} className="btn-sm bg-green" style={{ borderRadius: '0 6px 6px 0', border: 'none', cursor: 'pointer' }}>Check</button>
                </div>
                {giftCardResult && (
                  <div style={{ marginTop: '1rem', padding: '1rem', background: 'rgba(0,0,0,0.2)', borderRadius: '6px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Status:</span>
                      <strong style={{ 
                        color: giftCardResult.status === 'active' ? '#10b981' : (giftCardResult.status === 'used' ? 'var(--text-muted)' : '#ef4444'),
                        textTransform: 'uppercase'
                      }}>{giftCardResult.status}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Balance:</span>
                      <strong style={{ color: 'var(--accent-cyan)' }}>₹{giftCardResult.amount}</strong>
                    </div>
                  </div>
                )}
              </div>
            </div>

          </div>

        </main>
      </section>
    </div>
  );
};

export default Home;
