import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
  createOrder,
  deleteOrder,
  getCustomers,
  getOrder,
  getOrders,
  getProducts,
} from '../api';

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({
    customer_id: '',
    items: [{ product_id: '', quantity: 1 }],
  });

  const load = async () => {
    try {
      const [oRes, cRes, pRes] = await Promise.all([getOrders(), getCustomers(), getProducts()]);
      setOrders(oRes.data);
      setCustomers(cRes.data);
      setProducts(pRes.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const calcTotal = () =>
    form.items.reduce((sum, item) => {
      const product = products.find(p => p.id === parseInt(item.product_id, 10));
      return sum + (product ? product.price * (parseInt(item.quantity, 10) || 0) : 0);
    }, 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    const items = form.items
      .filter(i => i.product_id && i.quantity > 0)
      .map(i => ({ product_id: parseInt(i.product_id, 10), quantity: parseInt(i.quantity, 10) }));

    if (!form.customer_id || items.length === 0) {
      toast.error('Select a customer and at least one product');
      return;
    }
    setSaving(true);
    try {
      await createOrder({ customer_id: parseInt(form.customer_id, 10), items });
      toast.success('Order placed successfully');
      setModalOpen(false);
      setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create order');
    } finally { setSaving(false); }
  };

  const viewDetails = async (id) => {
    try { const res = await getOrder(id); setDetailOrder(res.data); }
    catch { toast.error('Failed to load order details'); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order? Stock will be restored automatically.')) return;
    try { await deleteOrder(id); toast.success('Order deleted — stock restored'); load(); }
    catch { toast.error('Failed to delete order'); }
  };

  const filtered = orders.filter(o => {
    const name = o.customer?.full_name?.toLowerCase() || '';
    return String(o.id).includes(search) || name.includes(search.toLowerCase());
  });

  const totalRevenue = orders.reduce((s, o) => s + Number(o.total_amount), 0);
  const avgOrder = orders.length ? totalRevenue / orders.length : 0;

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="topbar-title">🛒 Orders</h1>
          <p className="topbar-subtitle">{orders.length} orders · Total revenue: ${totalRevenue.toFixed(2)}</p>
        </div>
        <div className="header-actions">
          <input className="search-bar" placeholder="Search by order # or customer…" value={search} onChange={e => setSearch(e.target.value)} />
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Create Order</button>
        </div>
      </div>

      <div className="page-content">
        {/* Summary strip */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)' }}>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div>
              <div className="stat-value">{orders.length}</div>
              <div className="stat-label">Total Orders</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div>
              <div className="stat-value">${totalRevenue.toFixed(0)}</div>
              <div className="stat-label">Total Revenue</div>
              <div className="stat-change up">↑ All time</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📈</div>
            <div>
              <div className="stat-value">${avgOrder.toFixed(0)}</div>
              <div className="stat-label">Avg Order Value</div>
            </div>
          </div>
        </div>

        <div className="info-banner">
          <span className="info-banner-icon">♻️</span>
          <span>Deleting an order <strong>automatically restores</strong> the stock for all products in that order.</span>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading">Loading orders…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              {search ? 'No orders match your search.' : 'No orders yet.'}
              <br /><small>Click "+ Create Order" to place your first order.</small>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>Order #</th><th>Customer</th><th>Items</th><th>Order Total</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map(o => (
                    <tr key={o.id}>
                      <td><strong style={{ color: '#007185' }}>#{String(o.id).padStart(4, '0')}</strong></td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#FF9900', color: '#0F1111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.78rem', flexShrink: 0 }}>
                            {(o.customer?.full_name || '?').charAt(0).toUpperCase()}
                          </div>
                          {o.customer?.full_name || `Customer #${o.customer_id}`}
                        </div>
                      </td>
                      <td><span className="badge badge-pending">{o.items?.length || 0} item{o.items?.length !== 1 ? 's' : ''}</span></td>
                      <td><strong>${Number(o.total_amount).toFixed(2)}</strong></td>
                      <td>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => viewDetails(o.id)}>View</button>{' '}
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="tip-box">
          📋 <strong>How ordering works:</strong> Select a customer → add products → place order. Stock is deducted automatically by the system.
        </div>
      </div>

      {/* Create Order Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🛒 Place New Order</span>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Select Customer *</label>
                  <select className="form-control" required value={form.customer_id} onChange={e => setForm({ ...form, customer_id: e.target.value })}>
                    <option value="">Choose a customer…</option>
                    {customers.map(c => (
                      <option key={c.id} value={c.id}>{c.full_name} — {c.email}</option>
                    ))}
                  </select>
                </div>

                <div style={{ fontWeight: 700, fontSize: '0.82rem', marginBottom: 8, marginTop: 16 }}>
                  Order Items
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <select className="form-control" value={item.product_id}
                      onChange={e => {
                        const items = [...form.items];
                        items[idx] = { ...items[idx], product_id: e.target.value };
                        setForm({ ...form, items });
                      }}>
                      <option value="">Select product…</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                          {p.name} — ${p.price} (stock: {p.quantity_in_stock})
                        </option>
                      ))}
                    </select>
                    <input className="form-control" type="number" min="1" value={item.quantity}
                      onChange={e => {
                        const items = [...form.items];
                        items[idx] = { ...items[idx], quantity: e.target.value };
                        setForm({ ...form, items });
                      }} />
                    {form.items.length > 1 && (
                      <button type="button" className="btn btn-ghost btn-sm"
                        onClick={() => setForm({ ...form, items: form.items.filter((_, i) => i !== idx) })}>
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button type="button" className="btn btn-ghost btn-sm" style={{ marginTop: 4 }}
                  onClick={() => setForm({ ...form, items: [...form.items, { product_id: '', quantity: 1 }] })}>
                  + Add another item
                </button>
                <div className="order-total-box">
                  Estimated Total: <span style={{ float: 'right' }}>${calcTotal().toFixed(2)}</span>
                  <div style={{ clear: 'both', fontSize: '0.75rem', fontWeight: 400, color: '#565959', marginTop: 3 }}>
                    Final total is calculated by the server at order placement.
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Placing Order…' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🧾 Order #{String(detailOrder.id).padStart(4, '0')} — Receipt</span>
              <button type="button" className="modal-close" onClick={() => setDetailOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ background: '#F0F2F2', border: '1px solid #D5D9D9', borderRadius: 4, padding: '10px 14px', marginBottom: 14, fontSize: '0.85rem' }}>
                <strong>Customer:</strong> {detailOrder.customer?.full_name}<br />
                <span style={{ color: '#007185' }}>{detailOrder.customer?.email}</span>
              </div>
              <table>
                <thead>
                  <tr><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr>
                </thead>
                <tbody>
                  {detailOrder.items?.map(item => (
                    <tr key={item.id}>
                      <td>{item.product?.name || `Product #${item.product_id}`}</td>
                      <td>{item.quantity}</td>
                      <td>${Number(item.unit_price).toFixed(2)}</td>
                      <td><strong>${(item.unit_price * item.quantity).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="order-total-box" style={{ textAlign: 'right', marginTop: 10 }}>
                Order Total: <strong>${Number(detailOrder.total_amount).toFixed(2)}</strong>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
