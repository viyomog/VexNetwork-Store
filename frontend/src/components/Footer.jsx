import React from 'react';
import { Link } from 'react-router-dom';
import { FaDiscord, FaTwitter, FaYoutube, FaHeart } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer style={{ 
      background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', 
      borderTop: '1px solid rgba(249, 115, 22, 0.2)', 
      padding: '4rem 0 2rem 0', 
      marginTop: 'auto',
      boxShadow: '0 -20px 40px rgba(249, 115, 22, 0.05)'
    }}>
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '3rem', marginBottom: '3rem' }}>
          
          {/* Brand Column */}
          <div>
            <h2 style={{ fontFamily: 'Outfit', fontSize: '2rem', color: '#fff', marginBottom: '1rem', textShadow: '0 2px 10px rgba(249, 115, 22, 0.5)' }}>
              Vex<span style={{ color: 'var(--accent-orange)' }}>Network</span>
            </h2>
            <p style={{ color: 'var(--text-muted)', lineHeight: '1.6', marginBottom: '1.5rem' }}>
              The ultimate Minecraft experience. Join our community and embark on a journey filled with custom content, amazing features, and endless fun!
            </p>
            <div className="social-links" style={{ display: 'flex', gap: '1rem' }}>
              <a href="https://discord.gg/d6q9ZvC55b" target="_blank" rel="noreferrer" className="social-icon">
                <FaDiscord />
              </a>
              <a href="#" className="social-icon">
                <FaTwitter />
              </a>
              <a href="#" className="social-icon">
                <FaYoutube />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Quick Links</h3>
            <ul className="footer-links" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0 }}>
              <li><Link to="/" className="footer-link">Home</Link></li>
              <li><Link to="/store" className="footer-link">Browse Store</Link></li>
              <li><Link to="/terms" className="footer-link">Terms & Conditions</Link></li>
              <li><a href="https://discord.gg/d6q9ZvC55b" target="_blank" rel="noreferrer" className="footer-link">Support / Discord</a></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '1.2rem' }}>Legal Information</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <a href="/terms" className="footer-link">Terms & Conditions</a>
              <a href="/privacy" className="footer-link">Privacy Policy</a>
              <a href="/impressum" className="footer-link">Impressum</a>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom" style={{ 
          borderTop: '1px solid rgba(255,255,255,0.05)', 
          paddingTop: '2rem', 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          flexWrap: 'wrap', 
          gap: '1rem' 
        }}>
          <div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Copyright &copy; 2026 <strong style={{ color: '#fff' }}>VexNetwork</strong>. All Rights Reserved.
            </p>
            <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
              Not affiliated with or endorsed by Mojang AB.
            </p>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            Made with <FaHeart style={{ color: 'var(--accent-red)' }} /> for the community
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
