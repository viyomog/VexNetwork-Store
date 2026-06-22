import React from 'react';
import { Link } from 'react-router-dom';
import { XCircle } from 'lucide-react';
import { TiArrowBack } from 'react-icons/ti';

const PaymentFailed = () => {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div className="animate-fade-up" style={{ background: 'var(--panel-bg)', padding: '3rem', borderRadius: '16px', border: '1px solid #ef4444', boxShadow: '0 0 30px rgba(239, 68, 68, 0.2)', maxWidth: '500px', width: '100%' }}>
        <XCircle size={80} color="#ef4444" style={{ margin: '0 auto 1.5rem auto' }} />
        <h1 style={{ color: '#ef4444', marginBottom: '1rem', fontSize: '2rem' }}>Payment Failed</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Oops! Something went wrong with your transaction. Your payment was not processed and you have not been charged. Please try again or use a different payment method.
        </p>
        <Link to="/checkout" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: '#ef4444', color: '#fff', padding: '1rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s', border: 'none' }}>
          <TiArrowBack size={20} />
          Try Again
        </Link>
      </div>
    </div>
  );
};

export default PaymentFailed;
