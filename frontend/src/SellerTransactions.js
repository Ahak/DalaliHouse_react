import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

const SellerTransactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [totalStats, setTotalStats] = useState({ total_count: 0, total_amount: 0 });
  const { user } = useContext(AuthContext);

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return;

    try {
      // Backend already filters transactions by seller (property__seller), so we can use data directly
      const response = await axios.get('http://localhost:8000/api/transactions/');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  }, [user?.id]);

  const fetchTotalStats = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get('http://localhost:8000/api/transactions/total/');
      setTotalStats(response.data);
    } catch (error) {
      console.error('Error fetching total stats', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchTransactions();
    fetchTotalStats();
  }, [fetchTransactions, fetchTotalStats]);

  // Helper function to format payment method
  const formatPaymentMethod = (method) => {
    if (!method) return '-';
    const methodMap = {
      'cash': 'Cash',
      'bank_transfer': 'Bank Transfer',
      'mobile_money': 'Mobile Money',
      'card': 'Credit/Debit Card'
    };
    return methodMap[method] || method;
  };

  // Helper function to format payment status with badge
  const formatPaymentStatus = (status) => {
    const statusClass = {
      'pending': 'bg-warning',
      'completed': 'bg-success',
      'failed': 'bg-danger'
    };
    return (
      <span className={`badge ${statusClass[status] || 'bg-secondary'} text-capitalize`}>
        {status}
      </span>
    );
  };

  return (
    <section className="seller-section">
      <div className="seller-page-head mb-4">
        <h2 className="seller-page-title">My Transactions</h2>
      </div>

      {/* Total Transactions Summary */}
      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <div className="card seller-panel-card">
            <div className="card-body">
              <h5 className="card-title text-muted mb-2">Total Transactions</h5>
              <h2 className="mb-0">{totalStats.total_count}</h2>
            </div>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card seller-panel-card">
            <div className="card-body">
              <h5 className="card-title text-muted mb-2">Total Amount</h5>
              <h2 className="mb-0">${totalStats.total_amount.toLocaleString()}</h2>
            </div>
          </div>
        </div>
      </div>

      {transactions.length > 0 ? (
        <div className="table-responsive seller-table-wrap">
          <table className="table table-hover seller-table">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Property</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th>Transaction Date</th>
                <th>Payment Method</th>
                <th>Payment Status</th>
                <th>Payment Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>#{transaction.id}</td>
                  <td>{transaction.property.title}</td>
                  <td>{transaction.buyer.username}</td>
                  <td>${transaction.amount}</td>
                  <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                  <td>{formatPaymentMethod(transaction.payment_method)}</td>
                  <td>{formatPaymentStatus(transaction.payment_status)}</td>
                  <td>
                    {transaction.payment_date 
                      ? new Date(transaction.payment_date).toLocaleDateString() 
                      : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="card seller-panel-card">
          <div className="card-body">
            <p className="mb-0 text-muted">No transactions yet.</p>
          </div>
        </div>
      )}
    </section>
  );
};

export default SellerTransactions;
