import React from 'react';

const Privacy = () => {
  return (
    <div className="container animate-fade-up" style={{ padding: '4rem 0', maxWidth: '800px', minHeight: '60vh' }}>
      <h1 className="text-gradient" style={{ fontSize: '3rem', marginBottom: '2rem' }}>Privacy Policy</h1>
      
      <div className="glass-panel" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', lineHeight: '1.6', color: 'var(--text-muted)' }}>
        
        <section>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>1. Information We Collect</h2>
          <p>When you visit the VexNetwork store or purchase a package, we may collect certain information, including:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>Your Minecraft Username and UUID.</li>
            <li>Your Real Name, Email Address, and Contact Number (during checkout).</li>
            <li>Your IP Address and standard web log information.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>2. How We Use Your Information</h2>
          <p>We use the collected information for the following purposes:</p>
          <ul style={{ paddingLeft: '1.5rem', marginTop: '0.5rem' }}>
            <li>To process your transactions and deliver purchased digital goods.</li>
            <li>To prevent fraudulent transactions and chargebacks.</li>
            <li>To identify you securely on our Minecraft servers.</li>
            <li>To communicate with you regarding your purchase or support requests.</li>
          </ul>
        </section>

        <section>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>3. Data Security and Sharing</h2>
          <p>We implement strict security measures to maintain the safety of your personal information. <strong>We do not, and will never, sell your personal data to third parties.</strong> We securely transmit your payment data to our trusted payment processor, <a href="https://razorpay.com/privacy/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-orange)' }}>Razorpay</a>; we do not store your raw credit card numbers on our servers.</p>
        </section>

        <section>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>4. Data Retention</h2>
          <p>We retain your order history indefinitely to ensure you always have access to the ranks, coins, and items you purchased. Session data and cookies are temporary and cleared regularly.</p>
        </section>

        <section>
          <h2 style={{ color: '#fff', fontSize: '1.5rem', marginBottom: '0.5rem' }}>5. Data Deletion & Contact</h2>
          <p>If you wish to have your data permanently deleted from our servers, or if you have any questions regarding your privacy, please contact our support team at:</p>
          <p style={{ marginTop: '1rem' }}><a href="mailto:privacy@vexnetwork.fun" style={{ color: 'var(--accent-orange)', fontWeight: 'bold' }}>privacy@vexnetwork.fun</a></p>
        </section>

      </div>
    </div>
  );
};

export default Privacy;
