import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { getOrders, createOrder, updateOrder, deleteOrder, getCustomers, getProducts } from '../api';

const STATUS_OPTIONS = ['pending', 'confirmed', 'shipped', 'delivered', 'cancelled'];

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [detailOrder, setDetailOrder] = useState(null);
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const [orderForm, setOrderForm] = useState({ customer_id: '', notes: '', items: [{ product_id: '', quantity: 1 }] });

  const load = async () => {
    try {
      const [oRes, cRes, pRes] = await Promise.all([getOrders(), getCustomers(), getProducts()]);
      setOrders(oRes.data.reverse());
      setCustomers(cRes.data);
      setProducts(pRes.data);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = () => {
    setOrderForm({ customer_id: '', notes: '', items: [{ product_id: '', quantity: 1 }] });
    setModalOpen(true);
  };

  const addItem = () => setOrderForm(f => ({ ...f, items: [...f.items, { product_id: '', quantity: 1 }] }));
  const removeItem = (idx) => setOrderForm(f => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));
  const updateItem = (idx, field, value) => setOrderForm(f => ({
    ...f, items: f.items.map((item, i) => i === idx ? { ...item, [field]: value } : item)
  }));

  const calcTotal = () => {
    return orderForm.items.reduce((sum, item) => {
      const p = products.find(p => p.id === parseInt(item.product_id));
      return sum + (p ? p.price * (parseInt(item.quantity) || 0) : 0);
    }, 0);
  };

  const handleCreateOrder = async (e) => {
    e.preventDefault();
    if (!orderForm.customer_id) { toast.error('Please select a customer'); return; }
    const items = orderForm.items.filter(i => i.product_id && i.quantity > 0);
    if (items.length === 0) { toast.error('Add at least one item'); return; }

    setSaving(true);
    try {
      await createOrder({
        customer_id: parseInt(orderForm.customer_id),
        notes: orderForm.notes || undefined,
        items: items.map(i => ({ product_id: parseInt(i.product_id), quantity: parseInt(i.quantity) })),
      });
      toast.success('Order placed successfully');
      setModalOpen(false);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create order');
    } finally { setSaving(false); }
  };

  const handleStatusUpdate = async () => {
    if (!newStatus) return;
    setSaving(true);
    try {
      await updateOrder(statusModalOrder.id, { status: newStatus });
      toast.success('Order status updated');
      setStatusModalOrder(null);
      load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update status');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this order? Stock will be restored if not cancelled.')) return;
    try {
      await deleteOrder(id);
      toast.success('Order deleted');
      load();
    } catch { toast.error('Failed to delete order'); }
  };

  const statusBadge = (status) => <span className={`badge badge-${status}`}>{status}</span>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>+ New Order</button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading orders…</div>
        ) : orders.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <div className="empty-text">No orders yet. Place your first order!</div>
          </div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(o => (
                  <tr key={o.id}>
                    <td><strong>#{o.id}</strong></td>
                    <td>{o.customer?.name || `Customer #${o.customer_id}`}</td>
                    <td>{o.items?.length || 0} item{(o.items?.length || 0) !== 1 ? 's' : ''}</td>
                    <td><strong>${parseFloat(o.total_amount).toFixed(2)}</strong></td>
                    <td>{statusBadge(o.status)}</td>
                    <td style={{ color: '#94a3b8', fontSize: '0.8rem' }}>{new Date(o.created_at).toLocaleDateString()}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setDetailOrder(o)}>View</button>
                        <button className="btn btn-success btn-sm" onClick={() => { setStatusModalOrder(o); setNewStatus(o.status); }}>Status</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>Delete</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Order Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 580 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">New Order</span>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateOrder}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer *</label>
                  <select className="form-control" required value={orderForm.customer_id} onChange={e => setOrderForm(f => ({...f, customer_id: e.target.value}))}>
                    <option value="">Select customer…</option>
                    {customers.map(c => <option key={c.id} value={c.id}>{c.name} ({c.email})</option>)}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Order Items *</label>
                  <div className="order-items-list">
                    {orderForm.items.map((item, idx) => (
                      <div key={idx} className="order-item-row">
                        <select className="form-control" value={item.product_id} onChange={e => updateItem(idx, 'product_id', e.target.value)}>
                          <option value="">Select product…</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id} disabled={p.stock_quantity === 0}>
                              {p.name} — ${p.price} (Stock: {p.stock_quantity})
                            </option>
                          ))}
                        </select>
                        <input className="form-control" type="number" min="1" placeholder="Qty" value={item.quantity} onChange={e => updateItem(idx, 'quantity', e.target.value)} />
                        {orderForm.items.length > 1 && (
                          <button type="button" className="remove-item-btn" onClick={() => removeItem(idx)}>✕</button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button type="button" className="add-item-btn" onClick={addItem}>+ Add Item</button>
                </div>

                <div className="form-group">
                  <label className="form-label">Notes</label>
                  <textarea className="form-control" rows={2} value={orderForm.notes} onChange={e => setOrderForm(f => ({...f, notes: e.target.value}))} placeholder="Optional order notes…" />
                </div>

                <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 8, padding: '12px 16px', marginTop: 8 }}>
                  <strong>Estimated Total: ${calcTotal().toFixed(2)}</strong>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Placing…' : 'Place Order'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Order #{detailOrder.id}</span>
              <button className="modal-close" onClick={() => setDetailOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', gap: 24, marginBottom: 12 }}>
                  <div><span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>CUSTOMER</span><div><strong>{detailOrder.customer?.name}</strong></div><div style={{ color: '#6366f1', fontSize: '0.85rem' }}>{detailOrder.customer?.email}</div></div>
                  <div><span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>STATUS</span><div style={{ marginTop: 4 }}>{<span className={`badge badge-${detailOrder.status}`}>{detailOrder.status}</span>}</div></div>
                  <div><span style={{ color: '#94a3b8', fontSize: '0.8rem' }}>DATE</span><div>{new Date(detailOrder.created_at).toLocaleString()}</div></div>
                </div>
                {detailOrder.notes && <p style={{ color: '#64748b', fontSize: '0.875rem', background: '#f8fafc', padding: '8px 12px', borderRadius: 6 }}>{detailOrder.notes}</p>}
              </div>
              <table>
                <thead><tr><th>Product</th><th>SKU</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
                <tbody>
                  {detailOrder.items?.map(item => (
                    <tr key={item.id}>
                      <td>{item.product?.name || `Product #${item.product_id}`}</td>
                      <td><code style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: 4, fontSize: '0.8rem' }}>{item.product?.sku}</code></td>
                      <td>{item.quantity}</td>
                      <td>${parseFloat(item.unit_price).toFixed(2)}</td>
                      <td><strong>${(item.unit_price * item.quantity).toFixed(2)}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div style={{ textAlign: 'right', marginTop: 12, fontSize: '1rem', fontWeight: 700 }}>
                Total: ${parseFloat(detailOrder.total_amount).toFixed(2)}
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setDetailOrder(null)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Status Update Modal */}
      {statusModalOrder && (
        <div className="modal-overlay" onClick={() => setStatusModalOrder(null)}>
          <div className="modal" style={{ maxWidth: 380 }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Update Order #{statusModalOrder.id} Status</span>
              <button className="modal-close" onClick={() => setStatusModalOrder(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">New Status</label>
                <select className="form-control" value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                  {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              {newStatus === 'cancelled' && statusModalOrder.status !== 'cancelled' && (
                <p style={{ color: '#f59e0b', fontSize: '0.85rem', background: '#fef3c7', padding: '8px 12px', borderRadius: 6 }}>
                  ⚠️ Cancelling will restore stock for all items in this order.
                </p>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-ghost" onClick={() => setStatusModalOrder(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleStatusUpdate} disabled={saving}>{saving ? 'Saving…' : 'Update'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
