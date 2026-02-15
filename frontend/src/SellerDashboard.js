import React, { useState, useContext, useEffect, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import SellerSidebar from './SellerSidebar';
import SellerProperties from './SellerProperties';
import SellerTransactions from './SellerTransactions';

const SellerDashboard = () => {
  const renderMetricIcon = (type) => {
    switch (type) {
      case 'home':
        return (
          <svg viewBox="0 0 16 16" className="seller-svg-icon-lg" aria-hidden="true">
            <path d="M8 1l7 4v10H1V5l7-4zm0 2L3 5.7V14h10V5.7L8 3zM6 8h4v4H6V8z" fill="currentColor" />
          </svg>
        );
      case 'check':
        return (
          <svg viewBox="0 0 16 16" className="seller-svg-icon-lg" aria-hidden="true">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm3.2 4.8L7.2 10 5 7.8l1.1-1.1 1.1 1.1 2.9-2.9 1.1 1z" fill="currentColor" />
          </svg>
        );
      case 'pending':
        return (
          <svg viewBox="0 0 16 16" className="seller-svg-icon-lg" aria-hidden="true">
            <path d="M8 1a7 7 0 100 14A7 7 0 008 1zm.8 3.5H7.2v4.2l3.3 2 .8-1.3-2.5-1.5V4.5z" fill="currentColor" />
          </svg>
        );
      case 'sales':
        return (
          <svg viewBox="0 0 16 16" className="seller-svg-icon-lg" aria-hidden="true">
            <path d="M8 1a4 4 0 014 4H9.5a1.5 1.5 0 10-1.5 1.5A4.5 4.5 0 118 1zm0 6a1.5 1.5 0 100 3h1a3 3 0 110 6H7v-2h2a1 1 0 100-2H8a3.5 3.5 0 010-7h1V3H7v2h1z" fill="currentColor" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderTopIcon = (type) => {
    if (type === 'bell') {
      return (
        <svg viewBox="0 0 16 16" className="seller-svg-icon" aria-hidden="true">
          <path d="M8 2a3 3 0 00-3 3v2.2L4 9v1h8V9l-1-1.8V5a3 3 0 00-3-3zm0 13a2 2 0 001.9-1.5H6.1A2 2 0 008 15z" fill="currentColor" />
        </svg>
      );
    }

    return (
      <svg viewBox="0 0 16 16" className="seller-svg-icon" aria-hidden="true">
        <path d="M9.7 1l.3 1.5c.3.1.6.2.9.4L12.3 2l1.4 1.4-.9 1.4c.2.3.3.6.4.9L14.7 6v2l-1.5.3c-.1.3-.2.6-.4.9l.9 1.4-1.4 1.4-1.4-.9c-.3.2-.6.3-.9.4L9.7 14h-2l-.3-1.5c-.3-.1-.6-.2-.9-.4L5.1 13 3.7 11.6l.9-1.4a3 3 0 01-.4-.9L2.7 8V6l1.5-.3c.1-.3.2-.6.4-.9L3.7 3.4 5.1 2l1.4.9c.3-.2.6-.3.9-.4L7.7 1h2zm-1 4a2 2 0 100 4 2 2 0 000-4z" fill="currentColor" />
      </svg>
    );
  };

  const [activeView, setActiveView] = useState('dashboard');
  const [stats, setStats] = useState({
    totalProperties: 0,
    approvedProperties: 0,
    pendingProperties: 0,
    totalSales: 0
  });
  const { user, logout } = useContext(AuthContext);

  const fetchSellerStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const [propertiesRes, transactionsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/properties/'),
        axios.get('http://localhost:8000/api/transactions/')
      ]);

      const sellerProperties = propertiesRes.data.filter((property) => property.seller.id === user.id);
      const sellerTransactions = transactionsRes.data.filter((transaction) => transaction.seller.id === user.id);
      const totalSales = sellerTransactions.reduce(
        (sum, transaction) => sum + Number(transaction.amount || 0),
        0
      );

      setStats({
        totalProperties: sellerProperties.length,
        approvedProperties: sellerProperties.filter((property) => property.status === 'approved').length,
        pendingProperties: sellerProperties.filter((property) => property.status === 'pending').length,
        totalSales
      });
    } catch (error) {
      console.error('Error fetching seller stats', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchSellerStats();
  }, [fetchSellerStats]);

  const renderContent = () => {
    switch (activeView) {
      case 'properties':
        return <SellerProperties onUpdated={fetchSellerStats} />;
      case 'transactions':
        return <SellerTransactions />;
      default:
        return (
          <section className="seller-section">
            <div className="seller-breadcrumb-wrap">
              <h2 className="seller-home-title">Home</h2>
            </div>

            <div className="row g-4 mb-4">
              <div className="col-md-6 col-xl-3">
                <div className="seller-kpi-card seller-kpi-red">
                  <div className="seller-kpi-head">
                    <h5>Total Properties</h5>
                    <span className="seller-kpi-icon">{renderMetricIcon('home')}</span>
                  </div>
                  <h3>{stats.totalProperties}</h3>
                  <p className="mb-0">All your listings</p>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="seller-kpi-card seller-kpi-blue">
                  <div className="seller-kpi-head">
                    <h5>Approved</h5>
                    <span className="seller-kpi-icon">{renderMetricIcon('check')}</span>
                  </div>
                  <h3>{stats.approvedProperties}</h3>
                  <p className="mb-0">Published listings</p>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="seller-kpi-card seller-kpi-green">
                  <div className="seller-kpi-head">
                    <h5>Pending</h5>
                    <span className="seller-kpi-icon">{renderMetricIcon('pending')}</span>
                  </div>
                  <h3>{stats.pendingProperties}</h3>
                  <p className="mb-0">Waiting review</p>
                </div>
              </div>
              <div className="col-md-6 col-xl-3">
                <div className="seller-kpi-card seller-kpi-orange">
                  <div className="seller-kpi-head">
                    <h5>Total Sales</h5>
                    <span className="seller-kpi-icon">{renderMetricIcon('sales')}</span>
                  </div>
                  <h3>${stats.totalSales.toLocaleString()}</h3>
                  <p className="mb-0">From completed deals</p>
                </div>
              </div>
            </div>

           
          </section>
        );
    }
  };

  return (
    <div className="seller-layout">
      <SellerSidebar activeView={activeView} setActiveView={setActiveView} />
      <main className="seller-main">
        <div className="seller-topbar">
          <div className="seller-search-wrap">
            <input className="seller-search" type="text" placeholder="Search..." />
            <button type="button" className="seller-search-btn" aria-label="Search">
              <svg viewBox="0 0 16 16" className="seller-svg-icon" aria-hidden="true">
                <path d="M11.7 10.3l3 3-1.4 1.4-3-3A5.5 5.5 0 1111.7 10.3zM6.5 3a3.5 3.5 0 100 7 3.5 3.5 0 000-7z" fill="currentColor" />
              </svg>
            </button>
          </div>
          <div className="seller-topbar-tools">
            <span className="seller-topbar-icon">{renderTopIcon('bell')}</span>
            <span className="seller-topbar-icon">{renderTopIcon('settings')}</span>
            <span className="seller-user-chip">{user?.username || 'Seller'}</span>
            <button className="btn btn-danger btn-sm" onClick={logout}>Logout</button>
          </div>
        </div>

        <div className="seller-content">{renderContent()}</div>
      </main>
    </div>
  );
};

export default SellerDashboard;
