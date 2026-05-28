import React, { useEffect, useState } from 'react';
import { getProducts, getCustomers, getOrders } from '../api';

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, customers: 0, orders: 0, revenue: 0 });
  const [lowStock, setLowStock] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [pRes, cRes, oRes] = await Promise.all([getProducts(), getCustomers(), getOrders()]);
        const products = pRes.data;
        const customers = cRes.data;
        const orders = oRes.data;

        const revenue = orders
          .filter(o => o.status !== 'cancelled')
          .reduce((sum, o) => sum + o.total_amount, 0);

        setStats({ products: products.length, customers: customers.length, orders: orders.length, revenue });
        setLowStock(products.filter(p => p.stock_quantity <= 5).slice(0, 5));
        setRecentOrders([...orders].reverse().slice(0, 5));
      } catch {}
      finally { setLoading(false); }
    }
    fetchData();
  }, []);

  const statusBadge = (status) => <span className={`badge badge-${status}`}>{status}</span>;

  if (loading) return <div className="loading">Loading dashboard…</div>;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome to your Inventory & Order Management System</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon purple">🛍️</div>
          <div>
            <div className="stat-value">{stats.products}</div>
            <div className="stat-label">Total Products</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon blue">👥</div>
          <div>
            <div className="stat-value">{stats.customers}</div>
            <div className="stat-label">Total Customers</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon amber">📋</div>
          <div>
            <div className="stat-value">{stats.orders}</div>
            <div className="stat-label">Total Orders</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon green">💰</div>
          <div>
            <div className="stat-value">${stats.revenue.toFixed(2)}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">⚠️ Low Stock Alerts</span>
          </div>
          {lowStock.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">✅</div>
              <div className="empty-text">All products are well-stocked</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th>Stock</th>
                </tr>
              </thead>
              <tbody>
                {lowStock.map(p => (
                  <tr key={p.id}>
                    <td>{p.name}</td>
                    <td><code>{p.sku}</code></td>
                    <td>
                      <span className={`badge ${p.stock_quantity === 0 ? 'badge-cancelled' : 'badge-low'}`}>
                        {p.stock_quantity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <span className="card-title">🕒 Recent Orders</span>
          </div>
          {recentOrders.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">📭</div>
              <div className="empty-text">No orders yet</div>
            </div>
          ) : (
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map(o => (
                  <tr key={o.id}>
                    <td>#{o.id}</td>
                    <td>{o.customer?.name || `#${o.customer_id}`}</td>
                    <td>${o.total_amount.toFixed(2)}</td>
                    <td>{statusBadge(o.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
