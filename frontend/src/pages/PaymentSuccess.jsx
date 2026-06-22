import React from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { TiArrowBack } from 'react-icons/ti';
import { FaDownload } from 'react-icons/fa';

const PaymentSuccess = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const orderId = location.state?.orderId;
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '2rem', textAlign: 'center' }}>
      <div className="animate-fade-up" style={{ background: 'var(--panel-bg)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--accent-green)', boxShadow: '0 0 30px rgba(34, 197, 94, 0.2)', maxWidth: '500px', width: '100%' }}>
        <CheckCircle size={80} color="var(--accent-green)" style={{ margin: '0 auto 1.5rem auto' }} />
        <h1 style={{ color: 'var(--accent-green)', marginBottom: '1rem', fontSize: '2rem' }}>Payment Successful!</h1>
        <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', lineHeight: '1.6' }}>
          Thank you for your purchase! Your payment has been securely processed and your items will be delivered in-game shortly.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
          {orderId && (
            <a 
              href={`${apiUrl}/api/payments/invoice/${orderId}`} 
              download
              style={{ 
                display: 'inline-flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                background: 'rgba(255,255,255,0.1)', 
                color: 'white', 
                padding: '0.8rem 1.5rem', 
                borderRadius: '8px', 
                textDecoration: 'none', 
                fontWeight: 'bold', 
                border: '1px solid rgba(255,255,255,0.2)' 
              }}
            >
              <FaDownload size={16} /> Download Invoice
            </a>
          )}
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', background: 'var(--accent-green)', color: '#000', padding: '1rem 2rem', borderRadius: '8px', textDecoration: 'none', fontWeight: 'bold', transition: 'all 0.2s', border: 'none' }}>
            <TiArrowBack size={20} />
            Return to Store
          </Link>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess;
