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
  const [form, setForm] = useState({
    customer_id: '',
    items: [{ product_id: '', quantity: 1 }],
  });

  const load = async () => {
    try {
      const [oRes, cRes, pRes] = await Promise.all([
        getOrders(),
        getCustomers(),
        getProducts(),
      ]);
      setOrders(oRes.data);
      setCustomers(cRes.data);
      setProducts(pRes.data);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const calcTotal = () =>
    form.items.reduce((sum, item) => {
      const product = products.find((p) => p.id === parseInt(item.product_id, 10));
      return sum + (product ? product.price * (parseInt(item.quantity, 10) || 0) : 0);
    }, 0);

  const handleCreate = async (e) => {
    e.preventDefault();
    const items = form.items
      .filter((i) => i.product_id && i.quantity > 0)
      .map((i) => ({
        product_id: parseInt(i.product_id, 10),
        quantity: parseInt(i.quantity, 10),
      }));

    if (!form.customer_id || items.length === 0) {
      toast.error('Select a customer and at least one product');
      return;
    }

    setSaving(true);
    try {
      await createOrder({
        customer_id: parseInt(form.customer_id, 10),
        items,
      });
      toast.success('Order created');
      setModalOpen(false);
      setForm({ customer_id: '', items: [{ product_id: '', quantity: 1 }] });
      load();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  const viewDetails = async (id) => {
    try {
      const res = await getOrder(id);
      setDetailOrder(res.data);
    } catch {
      toast.error('Failed to load order details');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Cancel/delete this order? Stock will be restored.')) return;
    try {
      await deleteOrder(id);
      toast.success('Order deleted');
      load();
    } catch {
      toast.error('Failed to delete order');
    }
  };

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Orders</h1>
          <p className="page-subtitle">{orders.length} orders</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>
          + Create Order
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Order #</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id}>
                  <td>#{o.id}</td>
                  <td>{o.customer?.full_name || `Customer #${o.customer_id}`}</td>
                  <td>{o.items?.length || 0}</td>
                  <td>${Number(o.total_amount).toFixed(2)}</td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => viewDetails(o.id)}>
                      View
                    </button>{' '}
                    <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(o.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Create Order</span>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleCreate}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Customer *</label>
                  <select
                    className="form-control"
                    required
                    value={form.customer_id}
                    onChange={(e) => setForm({ ...form, customer_id: e.target.value })}
                  >
                    <option value="">Select customer…</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.full_name} ({c.email})
                      </option>
                    ))}
                  </select>
                </div>
                {form.items.map((item, idx) => (
                  <div key={idx} className="order-item-row">
                    <select
                      className="form-control"
                      value={item.product_id}
                      onChange={(e) => {
                        const items = [...form.items];
                        items[idx] = { ...items[idx], product_id: e.target.value };
                        setForm({ ...form, items });
                      }}
                    >
                      <option value="">Select product…</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id} disabled={p.quantity_in_stock === 0}>
                          {p.name} — ${p.price} (stock: {p.quantity_in_stock})
                        </option>
                      ))}
                    </select>
                    <input
                      className="form-control"
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => {
                        const items = [...form.items];
                        items[idx] = { ...items[idx], quantity: e.target.value };
                        setForm({ ...form, items });
                      }}
                    />
                    {form.items.length > 1 && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        onClick={() =>
                          setForm({
                            ...form,
                            items: form.items.filter((_, i) => i !== idx),
                          })
                        }
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() =>
                    setForm({
                      ...form,
                      items: [...form.items, { product_id: '', quantity: 1 }],
                    })
                  }
                >
                  + Add item
                </button>
                <p style={{ marginTop: 12, fontWeight: 600 }}>
                  Estimated total (backend calculates final): ${calcTotal().toFixed(2)}
                </p>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Creating…' : 'Place Order'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {detailOrder && (
        <div className="modal-overlay" onClick={() => setDetailOrder(null)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">Order #{detailOrder.id}</span>
              <button type="button" className="modal-close" onClick={() => setDetailOrder(null)}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Customer:</strong> {detailOrder.customer?.full_name} ({detailOrder.customer?.email})
              </p>
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Qty</th>
                    <th>Unit Price</th>
                    <th>Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  {detailOrder.items?.map((item) => (
                    <tr key={item.id}>
                      <td>{item.product?.name || item.product_id}</td>
                      <td>{item.quantity}</td>
                      <td>${Number(item.unit_price).toFixed(2)}</td>
                      <td>${(item.unit_price * item.quantity).toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p style={{ textAlign: 'right', fontWeight: 700 }}>
                Total: ${Number(detailOrder.total_amount).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
