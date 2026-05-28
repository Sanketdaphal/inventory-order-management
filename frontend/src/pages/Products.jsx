import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createProduct, deleteProduct, getProducts, updateProduct } from '../api';

const EMPTY = { name: '', sku: '', price: '', quantity_in_stock: '' };

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    try {
      const res = await getProducts();
      setProducts(res.data);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm(EMPTY);
    setModalOpen(true);
  };

  const openEdit = (p) => {
    setEditItem(p);
    setForm({
      name: p.name,
      sku: p.sku,
      price: p.price,
      quantity_in_stock: p.quantity_in_stock,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        sku: form.sku,
        price: parseFloat(form.price),
        quantity_in_stock: parseInt(form.quantity_in_stock, 10),
      };
      if (editItem) {
        await updateProduct(editItem.id, {
          name: payload.name,
          price: payload.price,
          quantity_in_stock: payload.quantity_in_stock,
        });
        toast.success('Product updated');
      } else {
        await createProduct(payload);
        toast.success('Product created');
      }
      setModalOpen(false);
      load();
    } catch (err) {
      const detail = err.response?.data?.detail;
      toast.error(typeof detail === 'string' ? detail : 'Operation failed');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"?`)) return;
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      load();
    } catch {
      toast.error('Failed to delete product');
    }
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Products</h1>
          <p className="page-subtitle">{products.length} products</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            className="search-bar"
            placeholder="Search…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <button type="button" className="btn btn-primary" onClick={openCreate}>
            + Add Product
          </button>
        </div>
      </div>

      <div className="card">
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>SKU</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td>{p.sku}</td>
                  <td>${Number(p.price).toFixed(2)}</td>
                  <td>
                    <span
                      className={`badge ${
                        p.quantity_in_stock === 0
                          ? 'badge-cancelled'
                          : p.quantity_in_stock <= 10
                            ? 'badge-low'
                            : 'badge-ok'
                      }`}
                    >
                      {p.quantity_in_stock}
                    </span>
                  </td>
                  <td>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                      Edit
                    </button>{' '}
                    <button
                      type="button"
                      className="btn btn-danger btn-sm"
                      onClick={() => handleDelete(p.id, p.name)}
                    >
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
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">{editItem ? 'Edit Product' : 'Add Product'}</span>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Name *</label>
                  <input
                    className="form-control"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU *</label>
                  <input
                    className="form-control"
                    required
                    disabled={!!editItem}
                    value={form.sku}
                    onChange={(e) => setForm({ ...form, sku: e.target.value })}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Price *</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={form.price}
                      onChange={(e) => setForm({ ...form, price: e.target.value })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Quantity in stock *</label>
                    <input
                      className="form-control"
                      type="number"
                      min="0"
                      required
                      value={form.quantity_in_stock}
                      onChange={(e) => setForm({ ...form, quantity_in_stock: e.target.value })}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editItem ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
