import React from 'react';
import { NavLink, Route, Routes, BrowserRouter as Router } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Customers from './pages/Customers.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Orders from './pages/Orders.jsx';
import Products from './pages/Products.jsx';
import './App.css';

function App() {
  return (
    <Router>
      <Toaster position="top-right" toastOptions={{ duration: 3500 }} />
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-brand">
            <span className="brand-icon">📦</span>
            <span className="brand-text">InvenTrack</span>
          </div>
          <nav className="sidebar-nav">
            <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Dashboard
            </NavLink>
            <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Products
            </NavLink>
            <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Customers
            </NavLink>
            <NavLink to="/orders" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              Orders
            </NavLink>
          </nav>
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
