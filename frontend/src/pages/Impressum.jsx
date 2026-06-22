import React from 'react';

const Impressum = () => {
  return (
    <div className="container animate-fade-up" style={{ padding: '4rem 2rem', color: 'var(--text-main)', maxWidth: '800px' }}>
      <div style={{ background: 'var(--panel-bg)', padding: '3rem', borderRadius: '16px', border: '1px solid var(--border-color)', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
        <h1 style={{ color: 'var(--accent-orange)', marginBottom: '1.5rem', fontSize: '2.5rem' }}>Impressum</h1>
        <div style={{ width: '60px', height: '4px', background: 'var(--accent-orange)', marginBottom: '2rem', borderRadius: '2px' }}></div>
        
        <div style={{ color: 'var(--text-main)', lineHeight: '1.8', fontSize: '1.1rem' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            <strong>Information required according to local law.</strong>
          </p>
          
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1.5rem', borderRadius: '12px', borderLeft: '4px solid var(--accent-orange)', marginBottom: '2rem' }}>
            <h3 style={{ color: '#fff', marginBottom: '0.5rem', fontSize: '1.2rem' }}>VexNetwork</h3>
            <p style={{ color: 'var(--text-muted)' }}>
              <strong>Email:</strong> <a href="mailto:vexnetworrkk@gmail.com" style={{ color: 'var(--accent-cyan)', textDecoration: 'none' }}>vexnetworrkk@gmail.com</a>
            </p>
          </div>
          
          <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem' }}>
            We are committed to providing a safe and fair environment for all our players. If you have any questions, concerns, or legal inquiries, please contact us at the email address provided above. We strive to respond to all inquiries within 48 hours.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Impressum;
