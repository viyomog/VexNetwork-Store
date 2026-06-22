import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaFire, FaDiscord } from 'react-icons/fa';
import { TiArrowBack } from "react-icons/ti";
import { toast } from '../utils/toast';

import bannerImg from '../assets/banner.jpg';
import logoImg from '../assets/logo.png';

const HeroBanner = () => {
  const [mcPlayers, setMcPlayers] = useState('...');
  const [discordPlayers, setDiscordPlayers] = useState('...');
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  useEffect(() => {
    // Fetch MC Players
    axios.get('https://api.mcsrvstat.us/3/vexnetwork.fun')
      .then(res => {
        if (res.data && res.data.players) {
          setMcPlayers(res.data.players.online);
        } else {
          setMcPlayers(0);
        }
      })
      .catch(() => setMcPlayers(0));

    // Fetch Discord Players
    axios.get('https://discord.com/api/v9/invites/d6q9ZvC55b?with_counts=true')
      .then(res => {
        if (res.data && res.data.approximate_member_count) {
          setDiscordPlayers(res.data.approximate_member_count);
        } else {
          setDiscordPlayers(0);
        }
      })
      .catch(() => setDiscordPlayers(0));
  }, []);

  return (
    <section style={{ 
      position: 'relative', 
      height: '450px', 
      backgroundImage: `url(${bannerImg})`, 
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      {/* Overlay */}
      <div style={{ position: 'absolute', inset: 0, backgroundColor: 'var(--hero-overlay)' }}></div>
      
      <div className="container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        
        {!isHome && (
          <button 
            onClick={() => navigate('/')}
            style={{
              position: 'absolute',
              top: '2rem',
              left: '1rem',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '24px',
              padding: '0.6rem 1.2rem',
              color: '#ddd',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              zIndex: 10,
              backdropFilter: 'blur(5px)'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
              e.currentTarget.style.color = '#ddd';
            }}
          >
            <TiArrowBack size={22} /> Home
          </button>
        )}

        <div className="hero-badges-container">
          {/* IP Copy Badge (Left) */}
          <div 
            className="badge-orange floating-badge" 
            style={{ cursor: 'pointer' }}
            onClick={() => {
              navigator.clipboard.writeText('play.vexnetwork.net').then(() => {
                toast.success('IP Copied to clipboard!');
              });
            }}
          >
            <div className="badge-icon"><FaFire /></div>
            <div className="floating-count">{mcPlayers}</div>
            <div>
              <div className="badge-text-primary">vexnetwork.fun</div>
              <div className="badge-text-secondary">CLICK TO COPY</div>
            </div>
          </div>

          {/* Discord Join Badge (Right) */}
          <div 
            className="badge-orange floating-badge" 
            style={{ cursor: 'pointer' }}
            onClick={() => window.open('https://discord.gg/d6q9ZvC55b', '_blank')}
          >
            <div>
              <div className="floating-count">{discordPlayers}</div>
              <div className="badge-text-primary">DISCORD SERVER</div>
              <div className="badge-text-secondary">CLICK TO JOIN</div>
            </div>
            <div className="badge-icon"><FaDiscord /></div>
          </div>
        </div>

        {/* Center Logo Area */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
          <img 
            src={logoImg} 
            alt="VexNetwork Logo" 
            style={{ 
              maxWidth: '600px', 
              width: '100%',
              animation: 'slowPulse 4s ease-in-out infinite'
            }} 
          />
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
