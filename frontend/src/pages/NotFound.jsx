import React from 'react';
import { Link } from 'react-router-dom';
import { Ghost } from 'lucide-react';
import { TiArrowBack } from 'react-icons/ti';

const NotFound = () => {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center', background: 'radial-gradient(circle at center, rgba(168, 85, 247, 0.1) 0%, var(--bg-color) 70%)' }}>
      <div className="animate-fade-up animate-glow" style={{ background: 'var(--panel-bg)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--accent-orange)', maxWidth: '500px', width: '100%', position: 'relative', overflow: 'hidden' }}>
        <div className="animate-float" style={{ display: 'flex', justifyContent: 'center', marginBottom: '1.5rem', color: 'var(--accent-orange)' }}>
          <Ghost size={90} strokeWidth={1.5} />
        </div>
        <h1 style={{ color: 'var(--accent-orange)', marginBottom: '1rem', fontSize: '3.5rem', fontWeight: '900', textShadow: '0 0 20px rgba(168, 85, 247, 0.5)' }}>404</h1>
        <h2 style={{ color: '#fff', marginBottom: '1rem', fontSize: '1.8rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2.5rem', lineHeight: '1.6' }}>
          Oops! It looks like you've wandered into the void. The page you are looking for doesn't exist or has been moved.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <Link to="/" style={{ 
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem', 
            background: 'var(--accent-orange)', color: '#fff', 
            padding: '1rem 2rem', borderRadius: '8px', 
            textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s', border: 'none' 
          }}>
            <TiArrowBack size={20} />
            Return to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
