import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LoginModal from './LoginModal';
import CartModal from './CartModal';

const Navbar = () => {
  const [username, setUsername] = useState(localStorage.getItem('mc_username') || null);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);

  useEffect(() => {
    const handleOpenCart = () => setIsCartModalOpen(true);
    window.addEventListener('openCart', handleOpenCart);
    return () => window.removeEventListener('openCart', handleOpenCart);
  }, []);

  const handleLoginClick = () => {
    setIsLoginModalOpen(true);
  };

  const handleLoginSuccess = (newUsername) => {
    setUsername(newUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('mc_username');
    setUsername(null);
    setIsCartModalOpen(false);
  };

  return (
    <>
      <div className="navbar-user-btn">
        {username ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }} onClick={() => setIsCartModalOpen(true)}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'Outfit' }}>{username}</div>
              <div style={{ color: 'var(--accent-orange)', fontSize: '0.75rem', fontWeight: 'bold' }}>VIEW CART</div>
            </div>
            <img src={`https://minotar.net/helm/${username}/40.png`} alt={username} style={{ borderRadius: '4px' }} />
          </div>
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: 'rgba(0,0,0,0.5)', padding: '0.5rem', borderRadius: '8px', cursor: 'pointer' }} onClick={handleLoginClick}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ color: '#fff', fontWeight: 'bold', fontFamily: 'Outfit' }}>Guest</div>
              <div style={{ color: 'var(--accent-orange)', fontSize: '0.75rem', fontWeight: 'bold' }}>CLICK TO LOGIN</div>
            </div>
            <img src="https://minotar.net/helm/Steve/40.png" alt="Guest" style={{ borderRadius: '4px' }} />
          </div>
        )}
      </div>

      <LoginModal 
        isOpen={isLoginModalOpen} 
        onClose={() => setIsLoginModalOpen(false)} 
        onLoginSuccess={handleLoginSuccess}
      />

      <CartModal 
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        username={username}
        onLogout={handleLogout}
      />
    </>
  );
};

export default Navbar;
