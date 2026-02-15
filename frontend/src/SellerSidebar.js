import React from 'react';

const SellerSidebar = ({ activeView, setActiveView }) => {
  const renderNavIcon = (icon) => {
    switch (icon) {
      case 'dashboard':
        return (
          <svg viewBox="0 0 16 16" className="seller-svg-icon" aria-hidden="true">
            <path d="M1 1h6v6H1V1zm8 0h6v3H9V1zM1 9h3v6H1V9zm5 0h9v6H6V9z" fill="currentColor" />
          </svg>
        );
      case 'properties':
        return (
          <svg viewBox="0 0 16 16" className="seller-svg-icon" aria-hidden="true">
            <path d="M8 1l7 4v10H1V5l7-4zm0 2L3 5.7V14h10V5.7L8 3zM6 8h4v4H6V8z" fill="currentColor" />
          </svg>
        );
      case 'transactions':
        return (
          <svg viewBox="0 0 16 16" className="seller-svg-icon" aria-hidden="true">
            <path d="M2 2h12v2H2V2zm0 4h12v8H2V6zm2 2v4h2V8H4zm3 0v4h2V8H7zm3 0v4h2V8h-2z" fill="currentColor" />
          </svg>
        );
      default:
        return null;
    }
  };

  const navItems = [
    { key: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
    { key: 'properties', label: 'My Properties', icon: 'properties' },
    { key: 'transactions', label: 'Transactions', icon: 'transactions' }
  ];

  return (
    <aside className="seller-sidebar">
      <div className="seller-sidebar-top">
        <div className="seller-brand-bolt">
          <svg viewBox="0 0 16 16" className="seller-svg-icon" aria-hidden="true">
            <path d="M9.7 1L3 8h4l-.7 7L13 8H9l.7-7z" fill="currentColor" />
          </svg>
        </div>
        <span>Seller Panel</span>
      </div>

      <div className="seller-sidebar-body">
        <ul className="seller-sidebar-nav">
          {navItems.map((item) => (
            <li key={item.key}>
              <button
                type="button"
                className={`seller-sidebar-link ${activeView === item.key ? 'active' : ''}`}
                onClick={() => setActiveView(item.key)}
              >
                <span className="seller-sidebar-dot">{renderNavIcon(item.icon)}</span>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
};

export default SellerSidebar;
