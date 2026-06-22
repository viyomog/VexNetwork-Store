import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from '../../utils/toast';
import { Zap, Save } from 'lucide-react';

const FlashSaleAdmin = () => {
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    title: 'EPIC STORE SALE',
    discountPercent: 10,
    endTime: '',
    active: false
  });

  useEffect(() => {
    const fetchSale = async () => {
      try {
        const token = localStorage.getItem('admin_token');
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${apiUrl}/api/admin/flash-sale`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        let dateStr = '';
        if (res.data.endTime) {
          const dt = new Date(res.data.endTime);
          dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
          dateStr = dt.toISOString().slice(0, 16);
        }

        setFormData({
          title: res.data.title || '',
          discountPercent: res.data.discountPercent || 0,
          endTime: dateStr,
          active: res.data.active || false
        });
      } catch (err) {
        toast.error('Failed to load flash sale settings');
      } finally {
        setLoading(false);
      }
    };
    fetchSale();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.endTime) {
      return toast.error('Please select an end time');
    }

    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.put(`${apiUrl}/api/admin/flash-sale`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      toast.success('Flash Sale updated successfully!');
    } catch (err) {
      toast.error('Failed to update flash sale');
    }
  };

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}>Loading...</div>;

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Zap className="text-orange" /> Global Flash Sale
          </h1>
          <p style={{ color: 'var(--text-muted)' }}>Configure a store-wide flash sale with a massive countdown timer.</p>
        </div>
      </div>

      <div style={{ background: 'var(--panel-bg)', borderRadius: '12px', border: '1px solid var(--border-color)', padding: '2rem', maxWidth: '600px' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.05)' }}>
            <div>
              <div style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>Sale Status</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Turn the flash sale on or off</div>
            </div>
            <label style={{ position: 'relative', display: 'inline-block', width: '50px', height: '28px', cursor: 'pointer' }}>
              <input 
                type="checkbox" 
                checked={formData.active} 
                onChange={e => setFormData({...formData, active: e.target.checked})} 
                style={{ opacity: 0, width: 0, height: 0 }} 
              />
              <span style={{
                position: 'absolute', cursor: 'pointer', top: 0, left: 0, right: 0, bottom: 0, 
                backgroundColor: formData.active ? 'var(--accent-orange)' : '#4b5563', 
                transition: '.4s', borderRadius: '34px'
              }}>
                <span style={{
                  position: 'absolute', height: '20px', width: '20px', left: formData.active ? '26px' : '4px', bottom: '4px', 
                  backgroundColor: 'white', transition: '.4s', borderRadius: '50%'
                }}></span>
              </span>
            </label>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Banner Title</label>
            <input 
              type="text" 
              required
              value={formData.title} 
              onChange={e => setFormData({...formData, title: e.target.value})} 
              style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} 
              placeholder="e.g. 🎃 HALLOWEEN SUPER SALE"
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Discount Percentage (%)</label>
            <input 
              type="number" 
              required
              min="1"
              max="100"
              value={formData.discountPercent} 
              onChange={e => setFormData({...formData, discountPercent: Number(e.target.value)})} 
              style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} 
            />
            <small style={{ color: 'var(--text-muted)', marginTop: '0.2rem', display: 'block' }}>This will be automatically applied to all packages in the store.</small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: 'var(--text-muted)' }}>Sale End Date & Time</label>
            <input 
              type="datetime-local" 
              required
              value={formData.endTime} 
              onChange={e => setFormData({...formData, endTime: e.target.value})} 
              style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} 
            />
          </div>

          <button 
            type="submit" 
            style={{ 
              width: '100%', marginTop: '1rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.5rem',
              padding: '0.75rem 1.5rem', background: 'var(--accent-orange)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'filter 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'} 
            onMouseOut={e => e.currentTarget.style.filter = 'none'}
          >
            <Save size={18} /> Save Flash Sale
          </button>
        </form>
      </div>
    </div>
  );
};

export default FlashSaleAdmin;
