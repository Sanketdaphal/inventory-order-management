import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { createCustomer, deleteCustomer, getCustomers } from '../api';

const EMPTY = { full_name: '', email: '', phone: '' };

export default function Customers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');

  const load = async () => {
    try { const res = await getCustomers(); setCustomers(res.data); }
    catch { toast.error('Failed to load customers'); }
    finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      await createCustomer(form);
      toast.success('Customer registered successfully');
      setModalOpen(false); setForm(EMPTY); load();
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to create customer');
    } finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove "${name}" from customer database?`)) return;
    try { await deleteCustomer(id); toast.success('Customer removed'); load(); }
    catch (err) { toast.error(err.response?.data?.detail || 'Failed to delete'); }
  };

  const filtered = customers.filter(c =>
    c.full_name.toLowerCase().includes(search.toLowerCase()) ||
    c.email.toLowerCase().includes(search.toLowerCase()) ||
    c.phone.includes(search)
  );

  return (
    <div>
      <div className="topbar">
        <div>
          <h1 className="topbar-title">👥 Customers</h1>
          <p className="topbar-subtitle">{customers.length} registered customers in your database</p>
        </div>
        <div className="header-actions">
          <input className="search-bar" placeholder="Search by name, email or phone…" value={search} onChange={e => setSearch(e.target.value)} />
          <button type="button" className="btn btn-primary" onClick={() => setModalOpen(true)}>+ Add Customer</button>
        </div>
      </div>

      <div className="page-content">
        {/* Summary */}
        <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(3, 1fr)', marginBottom: 18 }}>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div>
              <div className="stat-value">{customers.length}</div>
              <div className="stat-label">Total Customers</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">✉️</div>
            <div>
              <div className="stat-value">{customers.length}</div>
              <div className="stat-label">Unique Emails</div>
              <div className="stat-change up">All verified</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">📋</div>
            <div>
              <div className="stat-value">{filtered.length}</div>
              <div className="stat-label">Showing Results</div>
            </div>
          </div>
        </div>

        <div className="info-banner">
          <span className="info-banner-icon">ℹ️</span>
          <span>Each customer must have a <strong>unique email address</strong>. Customers with active orders cannot be deleted.</span>
        </div>

        <div className="card" style={{ padding: 0 }}>
          {loading ? (
            <div className="loading">Loading customers…</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              {search ? 'No customers match your search.' : 'No customers yet.'}
              <br /><small>Click "+ Add Customer" to register your first customer.</small>
            </div>
          ) : (
            <div className="table-container">
              <table>
                <thead>
                  <tr><th>#</th><th>Full Name</th><th>Email Address</th><th>Phone</th><th>Customer ID</th><th>Actions</th></tr>
                </thead>
                <tbody>
                  {filtered.map((c, i) => (
                    <tr key={c.id}>
                      <td style={{ color: '#999', fontSize: '0.75rem' }}>{i + 1}</td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#FF9900', color: '#0F1111', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.85rem', flexShrink: 0 }}>
                            {c.full_name.charAt(0).toUpperCase()}
                          </div>
                          <strong>{c.full_name}</strong>
                        </div>
                      </td>
                      <td style={{ color: '#007185' }}>{c.email}</td>
                      <td>{c.phone}</td>
                      <td><code>CST-{String(c.id).padStart(4, '0')}</code></td>
                      <td>
                        <button type="button" className="btn btn-danger btn-sm" onClick={() => handleDelete(c.id, c.full_name)}>Remove</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="tip-box">
          🔒 <strong>Privacy note:</strong> Customer emails are stored securely and used only for order identification.
        </div>
      </div>

      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">👤 Register New Customer</span>
              <button type="button" className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input className="form-control" required placeholder="e.g. Alice Johnson" value={form.full_name} onChange={e => setForm({ ...form, full_name: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Email Address *</label>
                  <input className="form-control" type="email" required placeholder="e.g. alice@example.com" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
                  <small style={{ color: '#565959', fontSize: '0.75rem' }}>Must be unique — one account per email.</small>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number *</label>
                  <input className="form-control" required placeholder="e.g. +1-555-0101" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Registering…' : 'Register Customer'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
