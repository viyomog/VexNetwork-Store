import React, { useState, useEffect } from 'react';
import { useFlashSale } from '../context/FlashSaleContext';

const FlashSaleBanner = () => {
  const { flashSale } = useFlashSale();
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    if (!flashSale.active || !flashSale.endTime) return;

    const calculateTimeLeft = () => {
      const difference = new Date(flashSale.endTime) - new Date();
      if (difference <= 0) {
        setTimeLeft('EXPIRED');
        return;
      }
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft(`${days > 0 ? days + 'd ' : ''}${hours}h ${minutes}m ${seconds}s`);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [flashSale]);

  if (!flashSale.active || timeLeft === 'EXPIRED') return null;

  return (
    <div style={{
      background: 'linear-gradient(90deg, #7C3AED, #A855F7, #7C3AED)',
      backgroundSize: '200% auto',
      animation: 'gradient 3s ease infinite',
      color: '#fff',
      textAlign: 'center',
      padding: '0.75rem',
      fontWeight: 'bold',
      zIndex: 1001,
      position: 'relative',
      boxShadow: '0 0 15px rgba(124, 58, 237, 0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '1rem',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      fontSize: '1rem'
    }}>
      <span>⚡ {flashSale.title} ({flashSale.discountPercent}% OFF)</span>
      <span style={{ 
        background: 'rgba(0,0,0,0.2)', 
        padding: '0.2rem 0.5rem', 
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '1.1rem'
      }}>
        ENDS IN: {timeLeft}
      </span>
      <style>{`
        @keyframes gradient {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
      `}</style>
    </div>
  );
};

export default FlashSaleBanner;
