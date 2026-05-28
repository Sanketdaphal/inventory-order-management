import React, { useEffect, useState } from 'react';
import { API_URL, getDashboardStats, getOrders, getProducts } from '../api';

const TIPS = [
  '💡 Add a unique SKU for every product to prevent duplicate entries.',
  '📦 Stock levels ≤ 10 units are flagged as Low Stock in the dashboard.',
  '🛒 Creating an order automatically reduces available inventory.',
  '♻️ Deleting an order restores stock for all items in that order.',
  '✉️ Customer emails must be unique — each account needs a different address.',
];

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tipIdx] = useState(() => Math.floor(Math.random() * TIPS.length));

  useEffect(() => {
    async function load() {
      try {
        const [statsRes, ordersRes, productsRes] = await Promise.all([
          getDashboardStats(),
          getOrders(),
          getProducts(),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data.slice(0, 6));
        setProducts(productsRes.data);
        setError(null);
      } catch (err) {
        setError(err.response?.data?.detail || err.message || 'Cannot reach the backend API');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <div className="loading">Loading StockPilot dashboard…</div>;

  if (error || !stats) {
    return (
      <div>
        <div className="topbar">
          <div><h1 className="topbar-title">Dashboard</h1></div>
        </div>
        <div className="page-content">
          <div className="card error-card">
            <p><strong>Could not connect to the backend.</strong></p>
            <p>{error}</p>
            <p>API URL: <code>{API_URL}</code></p>
          </div>
        </div>
      </div>
    );
  }

  const totalStock = products.reduce((s, p) => s + p.quantity_in_stock, 0);
  const outOfStock = products.filter(p => p.quantity_in_stock === 0).length;
  const lowStock = products.filter(p => p.quantity_in_stock > 0 && p.quantity_in_stock <= 10).length;
  const goodStock = products.length - outOfStock - lowStock;
  const totalRevenue = recentOrders.reduce((s, o) => s + o.total_amount, 0);

  return (
    <div>
      {/* Top bar */}
      <div className="topbar">
        <div>
          <h1 className="topbar-title">📊 Dashboard</h1>
          <p className="topbar-subtitle">Welcome back to StockPilot — your inventory control centre</p>
        </div>
      </div>

      <div className="page-content">
        {/* Daily tip */}
        <div className="info-banner">
          <span className="info-banner-icon">ℹ️</span>
          <span>{TIPS[tipIdx]}</span>
        </div>

        {/* Stat cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">📦</div>
            <div>
              <div className="stat-value">{stats.total_products}</div>
              <div className="stat-label">Total Products</div>
              <div className="stat-change neutral">{totalStock} units in stock</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div>
              <div className="stat-value">{stats.total_customers}</div>
              <div className="stat-label">Registered Customers</div>
              <div className="stat-change up">↑ Active accounts</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">🛒</div>
            <div>
              <div className="stat-value">{stats.total_orders}</div>
              <div className="stat-label">Total Orders</div>
              <div className="stat-change neutral">All time</div>
            </div>
          </div>
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div>
              <div className="stat-value">${totalRevenue.toFixed(0)}</div>
              <div className="stat-label">Recent Revenue</div>
              <div className="stat-change up">↑ Last 6 orders</div>
            </div>
          </div>
        </div>

        {/* Stock health bar */}
        <div className="card">
          <div className="card-title">📈 Inventory Health Overview</div>
          <div style={{ marginBottom: 12 }}>
            <div className="stock-health">
              <div className="stock-health-seg green" style={{ width: `${products.length ? (goodStock / products.length) * 100 : 0}%`, background: '#067D62' }} />
              <div className="stock-health-seg" style={{ width: `${products.length ? (lowStock / products.length) * 100 : 0}%`, background: '#FF9900' }} />
              <div className="stock-health-seg" style={{ width: `${products.length ? (outOfStock / products.length) * 100 : 0}%`, background: '#B12704' }} />
            </div>
            <div style={{ display: 'flex', gap: 20, fontSize: '0.78rem', marginTop: 6 }}>
              <span style={{ color: '#067D62' }}>● In Stock ({goodStock})</span>
              <span style={{ color: '#FF9900' }}>● Low Stock ({lowStock})</span>
              <span style={{ color: '#B12704' }}>● Out of Stock ({outOfStock})</span>
            </div>
          </div>

          {stats.low_stock_products.length > 0 && (
            <>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 8, color: '#B12704' }}>
                ⚠️ Reorder Required ({stats.low_stock_products.length} items)
              </div>
              {stats.low_stock_products.slice(0, 5).map(p => (
                <div key={p.id} className="progress-row">
                  <span className="progress-label" title={p.name}>{p.name.slice(0, 14)}{p.name.length > 14 ? '…' : ''}</span>
                  <div className="progress-track">
                    <div className="progress-fill orange" style={{ width: `${Math.min((p.quantity_in_stock / 10) * 100, 100)}%` }} />
                  </div>
                  <span className="progress-count">{p.quantity_in_stock}</span>
                </div>
              ))}
            </>
          )}

          {stats.low_stock_products.length === 0 && (
            <div className="tip-box">✅ All products are well stocked. No reorder needed right now.</div>
          )}
        </div>

        <div className="dashboard-grid">
          {/* Recent orders */}
          <div className="card">
            <div className="card-title">🛒 Recent Orders</div>
            {recentOrders.length === 0 ? (
              <div className="empty-state">No orders placed yet.<br /><small>Go to Orders to create your first order.</small></div>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>#</th><th>Customer</th><th>Items</th><th>Total</th></tr></thead>
                  <tbody>
                    {recentOrders.map(o => (
                      <tr key={o.id}>
                        <td><strong>#{o.id}</strong></td>
                        <td>{o.customer?.full_name || `Customer #${o.customer_id}`}</td>
                        <td>{o.items?.length || 0}</td>
                        <td><strong>${Number(o.total_amount).toFixed(2)}</strong></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* How to use */}
          <div className="card">
            <div className="card-title">🚀 Getting Started</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { num: '1', text: 'Add your products with a unique SKU, price, and starting stock.', icon: '📦' },
                { num: '2', text: 'Register your customers with a unique email and phone number.', icon: '👥' },
                { num: '3', text: 'Create orders by selecting a customer and adding products.', icon: '🛒' },
                { num: '4', text: 'Stock is reduced automatically — no manual updates needed.', icon: '✅' },
              ].map(step => (
                <div key={step.num} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', fontSize: '0.83rem' }}>
                  <div style={{ background: '#FF9900', color: '#0F1111', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0, fontSize: '0.72rem' }}>{step.num}</div>
                  <span>{step.icon} {step.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
