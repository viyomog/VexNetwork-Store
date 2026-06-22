import React, { useEffect, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { Plus, Edit2, Copy, Trash2, Search, XCircle, Tag, Check, X } from 'lucide-react';
import { toast } from '../../utils/toast';

const Products = () => {
  const { adminUser } = useOutletContext();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  const [formData, setFormData] = useState({
    name: '',
    price: 0,
    category: 'survival-rank',
    targetServer: 'global',
    color: '#9333EA',
    imageUrl: '',
    description: '',
    features: '', // We will parse this to array
    infoDetails: {
      perks: '',
      commands: '',
      others: '',
      note: '',
      kitPreviewImg: ''
    },
    active: true
  });

  const fetchProducts = async () => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.get(`${apiUrl}/api/admin/products`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProducts(res.data);
    } catch (err) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to permanently delete this product?')) return;
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.delete(`${apiUrl}/api/admin/products/${id}`, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Product deleted');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to delete product');
    }
  };

  const handleDuplicate = async (id) => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${apiUrl}/api/admin/products/${id}/duplicate`, {}, { headers: { Authorization: `Bearer ${token}` } });
      toast.success('Product duplicated as Inactive Copy');
      fetchProducts();
    } catch (err) {
      toast.error('Failed to duplicate product');
    }
  };

  const handleToggleActive = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.put(`${apiUrl}/api/admin/products/${id}`, { active: !currentStatus }, { headers: { Authorization: `Bearer ${token}` } });
      toast.success(`Product marked as ${!currentStatus ? 'Active' : 'Out of Stock'}`);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const openModal = (product = null) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        price: product.price,
        category: product.category,
        targetServer: product.targetServer || 'global',
        color: product.color || '#9333EA',
        imageUrl: product.imageUrl || '',
        description: product.description,
        features: product.features ? product.features.join('\n') : '',
        infoDetails: {
          perks: product.infoDetails?.perks ? product.infoDetails.perks.join('\n') : '',
          commands: product.infoDetails?.commands ? product.infoDetails.commands.join('\n') : '',
          others: product.infoDetails?.others ? product.infoDetails.others.join('\n') : '',
          note: product.infoDetails?.note || '',
          kitPreviewImg: product.infoDetails?.kitPreviewImg || ''
        },
        active: product.active !== false // Defaults to true if undefined
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: '', price: 0, category: 'survival-rank', targetServer: 'global', color: '#9333EA', imageUrl: '', description: '',
        features: '', infoDetails: { perks: '', commands: '', others: '', note: '', kitPreviewImg: '' }, active: true
      });
    }
    setShowModal(true);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const uploadData = new FormData();
    uploadData.append('image', file);

    const toastId = toast.loading('Uploading image...');
    try {
      const token = localStorage.getItem('admin_token');
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${apiUrl}/api/upload`, uploadData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      setFormData(prev => ({ ...prev, imageUrl: res.data.imageUrl }));
      toast.dismiss(toastId);
      toast.success('Image uploaded successfully');
    } catch (err) {
      toast.dismiss(toastId);
      toast.error(err.response?.data?.error || 'Failed to upload image');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('admin_token');
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    
    // Parse text areas back to arrays
    const payload = {
      ...formData,
      features: formData.features.split('\n').map(s => s.trim()).filter(s => s),
      infoDetails: {
        ...formData.infoDetails,
        perks: formData.infoDetails.perks.split('\n').map(s => s.trim()).filter(s => s),
        commands: formData.infoDetails.commands.split('\n').map(s => s.trim()).filter(s => s),
        others: formData.infoDetails.others.split('\n').map(s => s.trim()).filter(s => s),
      }
    };

    try {
      if (editingProduct) {
        await axios.put(`${apiUrl}/api/admin/products/${editingProduct._id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Product updated');
      } else {
        await axios.post(`${apiUrl}/api/admin/products`, payload, { headers: { Authorization: `Bearer ${token}` } });
        toast.success('Product created');
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      toast.error('Failed to save product');
    }
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()) || p.category.toLowerCase().includes(search.toLowerCase()));

  if (loading) return <div className="flex-center" style={{ minHeight: '60vh' }}>Loading Products...</div>;

  return (
    <div className="animate-fade-up">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.2rem' }}>Store Editor</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage products, prices, and stock status.</p>
        </div>
        
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div style={{ position: 'relative', width: '250px' }}>
            <Search style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} size={18} />
            <input 
              type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)}
              style={{ width: '100%', padding: '0.75rem 1rem 0.75rem 2.5rem', background: 'var(--panel-bg)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', outline: 'none' }}
            />
          </div>
          
          {(adminUser?.role === 'owner' || adminUser?.role === 'dev') && (
            <button 
              onClick={() => openModal()}
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1.5rem', background: 'var(--accent-orange)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', transition: 'filter 0.2s' }}
              onMouseOver={e => e.currentTarget.style.filter = 'brightness(1.1)'} onMouseOut={e => e.currentTarget.style.filter = 'none'}
            >
              <Plus size={18} /> Create Product
            </button>
          )}
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0', overflowX: 'auto', borderRadius: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: 'var(--panel-bg)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}>Product Name</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}>Category</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}>Price</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase' }}>Status</th>
              <th style={{ padding: '1rem', color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.85rem', textTransform: 'uppercase', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length > 0 ? filteredProducts.map((product) => (
              <tr key={product._id} style={{ borderBottom: '1px solid var(--border-color)', transition: 'background 0.2s', opacity: product.active === false ? 0.6 : 1 }} onMouseOver={e => e.currentTarget.style.background = 'rgba(255,255,255,0.02)'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', fontWeight: 'bold' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: product.color || '#9333EA' }}></div>
                  {product.name}
                </td>
                <td style={{ padding: '1rem', fontSize: '0.9rem' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(255,255,255,0.05)', padding: '0.2rem 0.5rem', borderRadius: '4px' }}>
                    <Tag size={12} /> {product.category}
                  </span>
                </td>
                <td style={{ padding: '1rem', fontWeight: 'bold' }}>₹{product.price}</td>
                <td style={{ padding: '1rem' }}>
                  <button 
                    onClick={() => handleToggleActive(product._id, product.active !== false)}
                    title="Toggle Stock Status"
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                  >
                    {product.active !== false 
                      ? <span style={{ color: '#10b981', background: 'rgba(16, 185, 129, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Check size={12}/> ACTIVE</span>
                      : <span style={{ color: '#ef4444', background: 'rgba(239, 68, 68, 0.1)', padding: '0.2rem 0.6rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.2rem' }}><X size={12}/> OUT OF STOCK</span>
                    }
                  </button>
                </td>
                <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                  {(adminUser?.role === 'owner' || adminUser?.role === 'dev') && (
                    <>
                      <button onClick={() => openModal(product)} title="Edit" style={{ background: 'transparent', border: 'none', color: 'var(--accent-cyan)', cursor: 'pointer', padding: '0.2rem' }}>
                        <Edit2 size={18} />
                      </button>
                      <button onClick={() => handleDuplicate(product._id)} title="Duplicate" style={{ background: 'transparent', border: 'none', color: 'var(--accent-orange)', cursor: 'pointer', padding: '0.2rem' }}>
                        <Copy size={18} />
                      </button>
                      <button onClick={() => handleDelete(product._id)} title="Delete" style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', padding: '0.2rem' }}>
                        <Trash2 size={18} />
                      </button>
                    </>
                  )}
                  {adminUser?.role === 'staff' && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>No access</span>
                  )}
                </td>
              </tr>
            )) : (
              <tr><td colSpan="5" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-muted)' }}>No products found.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* CREATE / EDIT MODAL */}
      {showModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-panel animate-fade-up" style={{ width: '100%', maxWidth: '800px', maxHeight: '90vh', overflowY: 'auto', background: 'var(--panel-bg)', padding: '2rem', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.5rem' }}>{editingProduct ? 'Edit Product' : 'Create New Product'}</h2>
              <button onClick={() => setShowModal(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                <XCircle size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Name *</label>
                  <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Category Slug *</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                    <option value="survival-rank" style={{ background: '#1f2937', color: '#fff' }}>Survival - Ranks</option>
                    <option value="survival-coin" style={{ background: '#1f2937', color: '#fff' }}>Survival - Coins</option>
                    <option value="lifesteal-rank" style={{ background: '#1f2937', color: '#fff' }}>Lifesteal - Ranks</option>
                    <option value="lifesteal-coin" style={{ background: '#1f2937', color: '#fff' }}>Lifesteal - Coins</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Target Server</label>
                  <select required value={formData.targetServer} onChange={e => setFormData({...formData, targetServer: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', outline: 'none' }}>
                    <option value="global" style={{ background: '#1f2937', color: '#fff' }}>Global (All Servers)</option>
                    <option value="survival" style={{ background: '#1f2937', color: '#fff' }}>Survival</option>
                    <option value="lifesteal" style={{ background: '#1f2937', color: '#fff' }}>Lifesteal</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Price (₹) *</label>
                  <input required type="number" min="0" value={formData.price} onChange={e => setFormData({...formData, price: Number(e.target.value)})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Theme Color Hex</label>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <input type="color" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} style={{ width: '50px', height: '42px', padding: '0', border: 'none', background: 'transparent', cursor: 'pointer' }} />
                    <input type="text" value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} style={{ flex: 1, padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Short Description</label>
                  <textarea rows="4" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', resize: 'vertical' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Custom Package Image (Optional)</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    {formData.imageUrl && (
                      <div style={{ position: 'relative', width: 'fit-content' }}>
                        <img src={formData.imageUrl} alt="Package" style={{ height: '60px', borderRadius: '4px' }} />
                        <button type="button" onClick={() => setFormData({...formData, imageUrl: ''})} style={{ position: 'absolute', top: '-5px', right: '-5px', background: 'red', color: 'white', borderRadius: '50%', border: 'none', cursor: 'pointer', padding: '2px' }}><X size={14} /></button>
                      </div>
                    )}
                    <input type="file" accept="image/*" onChange={handleImageUpload} style={{ width: '100%', padding: '0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px dotted var(--text-muted)', borderRadius: '8px', color: '#fff' }} />
                  </div>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Card Features</label>
                  <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem', color: '#666' }}>One per line</span>
                  <textarea rows="4" value={formData.features} onChange={e => setFormData({...formData, features: e.target.value})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', resize: 'vertical', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Modal Commands</label>
                  <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem', color: '#666' }}>One per line</span>
                  <textarea rows="4" value={formData.infoDetails.commands} onChange={e => setFormData({...formData, infoDetails: {...formData.infoDetails, commands: e.target.value}})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', resize: 'vertical', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Modal Perks</label>
                  <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem', color: '#666' }}>One per line</span>
                  <textarea rows="4" value={formData.infoDetails.perks} onChange={e => setFormData({...formData, infoDetails: {...formData.infoDetails, perks: e.target.value}})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', resize: 'vertical', fontFamily: 'monospace' }} />
                </div>
                <div>
                  <label style={{ display: 'block', marginBottom: '0.2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Modal Others</label>
                  <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.7rem', color: '#666' }}>One per line</span>
                  <textarea rows="4" value={formData.infoDetails.others} onChange={e => setFormData({...formData, infoDetails: {...formData.infoDetails, others: e.target.value}})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff', resize: 'vertical', fontFamily: 'monospace' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Note / Warning Text</label>
                <input type="text" value={formData.infoDetails.note} onChange={e => setFormData({...formData, infoDetails: {...formData.infoDetails, note: e.target.value}})} style={{ width: '100%', padding: '0.75rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', borderRadius: '8px', color: '#fff' }} />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: '0.75rem 1.5rem', background: 'transparent', border: '1px solid var(--border-color)', color: '#fff', borderRadius: '8px', cursor: 'pointer' }}>Cancel</button>
                <button type="submit" style={{ padding: '0.75rem 1.5rem', background: 'var(--accent-orange)', border: 'none', color: '#fff', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}>{editingProduct ? 'Save Changes' : 'Create Product'}</button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Products;
