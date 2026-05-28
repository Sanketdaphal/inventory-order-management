import React from 'react';
import { NavLink, Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Customers from './pages/Customers.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Orders from './pages/Orders.jsx';
import Products from './pages/Products.jsx';
import './App.css';

const NAV = [
  { to: '/', label: 'Dashboard', end: true, icon: '📊', num: '01' },
  { to: '/products', label: 'Products', icon: '📦', num: '02' },
  { to: '/customers', label: 'Customers', icon: '👥', num: '03' },
  { to: '/orders', label: 'Orders', icon: '🛒', num: '04' },
];

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#fff',
            color: '#0F1111',
            border: '1px solid #D5D9D9',
            borderRadius: '4px',
            fontSize: '0.875rem',
            boxShadow: '0 4px 16px rgba(15,17,17,0.18)',
          },
          success: { iconTheme: { primary: '#067D62', secondary: '#E6F4F1' } },
          error: { iconTheme: { primary: '#B12704', secondary: '#FEF0EC' } },
        }}
      />
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <div className="brand-mark">S</div>
            <div>
              <span className="brand-text">StockPilot</span>
              <span className="brand-tagline">Inventory Management</span>
            </div>
          </div>
          <div className="sidebar-section-label">Navigation</div>
          <nav className="sidebar-nav">
            {NAV.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <span style={{ fontSize: '1rem' }}>{item.icon}</span>
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
          <div className="sidebar-footer">
            <span className="section-kicker">v1.0</span>
            <p className="sidebar-footnote">
              StockPilot — Smart inventory, order tracking &amp; customer management in one place.
            </p>
          </div>
        </aside>
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/products" element={<Products />} />
            <Route path="/customers" element={<Customers />} />
            <Route path="/orders" element={<Orders />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
