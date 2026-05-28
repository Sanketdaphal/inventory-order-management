import React from 'react';

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="topbar">
      <div>
        <h1 className="topbar-title">{title}</h1>
        {subtitle && <p className="topbar-subtitle">{subtitle}</p>}
      </div>
      {children && <div className="header-actions">{children}</div>}
    </div>
  );
}
