import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Sidebar from './Sidebar';
import Swal from 'sweetalert2';

const AdminDashboard = () => {
  const [properties, setProperties] = useState([]);
  const [stats, setStats] = useState({
    totalSellers: 0,
    totalBuyers: 0,
    totalProperties: 0,
    totalTransactions: 0
  });
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    fetchProperties();
    fetchStats();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/properties/?status=pending');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties', error);
    }
  };

  const fetchStats = async () => {
    try {
      const [usersRes, propertiesRes, transactionsRes] = await Promise.all([
        axios.get('http://localhost:8000/api/users/'),
        axios.get('http://localhost:8000/api/properties/'),
        axios.get('http://localhost:8000/api/transactions/')
      ]);

      const users = usersRes.data;
      const propertiesData = propertiesRes.data;
      const transactions = transactionsRes.data;

      setStats({
        totalSellers: users.filter((u) => u.role === 'seller').length,
        totalBuyers: users.filter((u) => u.role === 'buyer').length,
        totalProperties: propertiesData.length,
        totalTransactions: transactions.length
      });

      generateNotifications(users, propertiesData, transactions);
    } catch (error) {
      console.error('Error fetching stats', error);
    }
  };

  const generateNotifications = (users, propertiesData, transactions) => {
    const nextNotifications = [];
    let id = 1;

    const recentUsers = users.filter((user) => {
      const userDate = new Date(user.date_joined);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return userDate > weekAgo;
    });

    recentUsers.forEach((user) => {
      nextNotifications.push({
        id: id++,
        message: `${user.username} registered as ${user.role}`,
        icon: 'USR',
        color: 'success'
      });
    });

    const pendingProperties = propertiesData.filter((prop) => prop.status === 'pending');
    if (pendingProperties.length > 0) {
      nextNotifications.push({
        id: id++,
        message: `${pendingProperties.length} properties waiting for approval`,
        icon: 'PRP',
        color: 'warning'
      });
    }

    const recentTransactions = transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.transaction_date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return transactionDate > weekAgo;
    });

    recentTransactions.forEach((transaction) => {
      nextNotifications.push({
        id: id++,
        message: `New transaction: ${transaction.property.title} sold for $${transaction.amount}`,
        icon: 'TRX',
        color: 'info'
      });
    });

    const approvedProperties = propertiesData.filter((prop) => prop.status === 'approved');
    if (approvedProperties.length > 0 && nextNotifications.length < 5) {
      nextNotifications.push({
        id: id++,
        message: `${approvedProperties.length} properties have been approved recently`,
        icon: 'OK',
        color: 'primary'
      });
    }

    setNotifications(nextNotifications.slice(0, 6));
  };

  const handleApprove = async (id) => {
    try {
      await axios.post(`http://localhost:8000/api/properties/${id}/approve/`);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Property approved successfully.',
      });
      fetchProperties();
      fetchStats();
    } catch (error) {
      console.error('Error approving property', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to approve property.',
      });
    }
  };

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <div className="admin-topbar">
          <h2 className="admin-page-title">Dashboard</h2>
          <div className="admin-topbar-right">
            <div className="admin-avatar">AD</div>
          </div>
        </div>

        <div className="admin-content">
          <div className="row g-4 mb-4">
            <div className="col-md-6 col-xl-3">
              <div className="admin-metric-card">
                <div className="admin-metric-head">
                  <h5>Total Sellers</h5>
                  <span className="admin-metric-icon admin-icon-red">S</span>
                </div>
                <h2>{stats.totalSellers}</h2>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="admin-metric-card">
                <div className="admin-metric-head">
                  <h5>Total Buyers</h5>
                  <span className="admin-metric-icon admin-icon-orange">B</span>
                </div>
                <h2>{stats.totalBuyers}</h2>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="admin-metric-card">
                <div className="admin-metric-head">
                  <h5>Total Properties</h5>
                  <span className="admin-metric-icon admin-icon-pink">P</span>
                </div>
                <h2>{stats.totalProperties}</h2>
              </div>
            </div>
            <div className="col-md-6 col-xl-3">
              <div className="admin-metric-card">
                <div className="admin-metric-head">
                  <h5>Total Transactions</h5>
                  <span className="admin-metric-icon admin-icon-blue">T</span>
                </div>
                <h2>{stats.totalTransactions}</h2>
              </div>
            </div>
          </div>

          {notifications.length > 0 && (
            <div className="card admin-panel-card mb-4">
              <div className="card-header admin-panel-header">
                <h5 className="mb-0">Recent Activity Notifications</h5>
              </div>
              <div className="card-body">
                <div className="row">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="col-md-4 mb-3">
                      <div className={`alert alert-${notification.color} d-flex align-items-center admin-alert`} role="alert">
                        <span className="admin-alert-icon me-2">{notification.icon}</span>
                        <strong>{notification.message}</strong>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default AdminDashboard;
