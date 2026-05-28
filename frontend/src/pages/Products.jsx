import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../api';

const EMPTY = { name: '', sku: '', price: '', quantity_in_stock: '' };
const FILTERS = ['All', 'In Stock', 'Low Stock', 'Out of Stock'];

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try { const res = await getProducts(); setProducts(res.data); }
    catch { toast.error('Failed to load products'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => { setEditItem(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (p) => {
    setEditItem(p);
    setForm({ name: p.name, sku: p.sku, price: p.price, quantity_in_stock: p.quantity_in_stock });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      const payload = { name: form.name, sku: form.sku, price: parseFloat(form.price), quantity_in_stock: parseInt(form.quantity_in_stock, 10) };
      if (editItem) {
        await updateProduct(editItem.id, { name: payload.name, price: payload.price, quantity_in_stock: payload.quantity_in_stock });
        toast.success('Product updated');
      } else { await createProduct(payload); toast.success('Product added to catalog'); }
      setModalOpen(false); load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Operation failed');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from catalog?`)) return;
    try { await deleteProduct(id); toast.success('Product removed'); load(); }
    catch { toast.error('Failed to delete product'); }
  };

  const inStock = products.filter(p => p.quantity_in_stock > 10).length;
  const lowStock = products.filter(p => p.quantity_in_stock > 0 && p.quantity_in_stock <= 10).length;
  const outStock = products.filter(p => p.quantity_in_stock === 0).length;

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.sku.toLowerCase().includes(search.toLowerCase());
    if (filter === 'In Stock') return matchSearch && p.quantity_in_stock > 10;
    if (filter === 'Low Stock') return matchSearch && p.quantity_in_stock > 0 && p.quantity_in_stock <= 10;
    if (filter === 'Out of Stock') return matchSearch && p.quantity_in_stock === 0;
    return matchSearch;
  });

  const totalValue = products.reduce((s, p) => s + p.price * p.quantity_in_stock, 0);

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="topbar-title">📦 Products</h1>
          <p className="topbar-subtitle">{products.length} SKUs · Inventory value: ${totalValue.toFixed(2)}</p>
        </div>
        <div className="header-actions">
          <input className="search-bar" placeholder="Search by name or SKU…" value={search} onChange={e => setSearch(e.target.value)} />
          <button type="button" className="btn btn-primary" onClick={openCreate}>+ Add Product</button>
        </div>
      </div>

      <div className="page-content">
        {/* Summary strip */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('In Stock')}>
            <div className="stat-icon" style={{ background: '#E6F4F1' }}>✅</div>
            <div>
              <div className="stat-value" style={{ color: '#067D62' }}>{inStock}</div>
              <div className="stat-label">In Stock</div>
            </div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('Low Stock')}>
            <div className="stat-icon" style={{ background: '#FFF9E6' }}>⚠️</div>
            <div>
              <div className="stat-value" style={{ color: '#FF9900' }}>{lowStock}</div>
              <div className="stat-label">Low Stock</div>
            </div>
          </div>
          <div className="stat-card" style={{ cursor: 'pointer' }} onClick={() => setFilter('Out of Stock')}>
            <div className="stat-icon" style={{ background: '#FEF0EC' }}>🚫</div>
            <div>
              <div className="stat-value" style={{ color: '#B12704' }}>{outStock}</div>
              <div className="stat-label">Out of Stock</div>
            </div>
          </div>
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 14, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <button key={f} type="button"
              onClick={() => setFilter(f)}
              style={{
                padding: '5px 14px', borderRadius: 99, fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                background: filter === f ? '#FF9900' : '#fff',
                color: filter === f ? '#0F1111' : '#565959',
                border: `1px solid ${filter === f ? '#FF9900' : '#D5D9D9'}`,
              }}>
              {f}
            </button>
          ))}
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading">Loading products…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              {search || filter !== 'All' ? `No products match your search/filter.` : 'No products yet.'}
              <br /><small>Click "+ Add Product" to add your first SKU.</small>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>#</th><th>Product Name</th><th>SKU</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <tr key={p.id}>
                      <td style={{ color: '#999', fontSize: '0.75rem' }}>{i + 1}</td>
                      <td><strong>{p.name}</strong></td>
                      <td><code>{p.sku}</code></td>
                      <td><strong>${Number(p.price).toFixed(2)}</strong></td>
                      <td>{p.quantity_in_stock} units</td>
                      <td>
                        <span className={`badge ${p.quantity_in_stock === 0 ? 'badge-cancelled' : p.quantity_in_stock <= 10 ? 'badge-low' : 'badge-ok'}`}>
                          {p.quantity_in_stock === 0 ? 'Out of Stock' : p.quantity_in_stock <= 10 ? 'Low Stock' : 'In Stock'}
                        </span>
                      </td>
                      <td>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>Edit</button>{' '}
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(p.id, p.name)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="tip-box">
          📌 <strong>Tip:</strong> Click any stat card above to filter the table. SKU cannot be changed after creation.
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editItem ? '✏️ Edit Product' : '📦 Add New Product'}</span>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input className="form-control" required placeholder="e.g. Wireless Mouse" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU / Product Code *</label>
                  <input className="form-control" required disabled={!!editItem} placeholder="e.g. WM-001" value={form.sku} onChange={e => setForm({ ...form, sku: e.target.value })} />
                  {!editItem && <small style={{ color: '#565959', fontSize: '0.75rem' }}>SKU must be unique and cannot be changed later.</small>}
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price (₹ / $) *</label>
                    <input className="form-control" type="number" min="0" step="0.01" required placeholder="0.00" value={form.price} onChange={e => setForm({ ...form, price: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Opening Stock *</label>
                    <input className="form-control" type="number" min="0" required placeholder="0" value={form.quantity_in_stock} onChange={e => setForm({ ...form, quantity_in_stock: e.target.value })} />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editItem ? 'Update Product' : 'Add to Catalog'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
