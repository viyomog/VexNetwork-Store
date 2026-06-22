import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { TiArrowBack } from 'react-icons/ti';

const EmptyCart = () => {
  return (
    <div style={{ minHeight: '70vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', overflow: 'hidden', position: 'relative' }}>
      
      {/* Background glow effects */}
      <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(168,85,247,0.15) 0%, rgba(0,0,0,0) 70%)', zIndex: 0, filter: 'blur(40px)', animation: 'pulse 4s infinite' }} />

      <div className="animate-fade-up" style={{ zIndex: 1, position: 'relative' }}>
        <div style={{ display: 'inline-block', position: 'relative' }}>
          <ShoppingCart size={100} color="var(--text-muted)" style={{ opacity: 0.5, marginBottom: '2rem', filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.1))' }} />
          {/* Fun bouncing ghost or visual element */}
          <div style={{ position: 'absolute', top: '-10px', right: '-10px', fontSize: '2rem', animation: 'bounce 2s infinite' }}>👻</div>
        </div>

        <h1 style={{ color: '#fff', fontSize: '3rem', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '2px', background: 'linear-gradient(90deg, #fff, #a855f7)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Your Cart is Empty!
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 3rem auto', lineHeight: '1.6' }}>
          It looks like the Endermen stole all your items! Don't worry, there are plenty more epic ranks, coins, and keys waiting for you in the store.
        </p>
        
        <Link to="/" className="hero-btn primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', padding: '1.2rem 3rem', fontSize: '1.1rem' }}>
          <TiArrowBack size={24} />
          Explore the Store
        </Link>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-15px); }
        }
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: translate(-50%, -50%) scale(1); }
          50% { opacity: 1; transform: translate(-50%, -50%) scale(1.2); }
        }
      `}} />
    </div>
  );
};

export default EmptyCart;
