import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import Sidebar from './Sidebar';
import Swal from 'sweetalert2';

const ManageTransaction = () => {
  const [transactions, setTransactions] = useState([]);
  const [properties, setProperties] = useState([]);
  const [users, setUsers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [formData, setFormData] = useState({
    property: '',
    buyer: '',
    amount: '',
    transaction_date: ''
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchTransactions();
      fetchProperties();
      fetchUsers();
    }
  }, [user]);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/transactions/');
      setTransactions(response.data);
    } catch (error) {
      console.error('Error fetching transactions', error);
    }
  };

  const fetchProperties = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/properties/');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this transaction?')) {
      try {
        await axios.delete(`http://localhost:8000/api/transactions/${id}/`);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Transaction deleted successfully.',
        });
        fetchTransactions();
      } catch (error) {
        console.error('Error deleting transaction', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete transaction.',
        });
      }
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    setFormData({
      property: transaction.property.id,
      buyer: transaction.buyer.id,
      amount: transaction.amount,
      transaction_date: transaction.transaction_date.split('T')[0] // Format for date input
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingTransaction(null);
    setFormData({
      property: '',
      buyer: '',
      amount: '',
      transaction_date: new Date().toISOString().split('T')[0]
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingTransaction) {
        await axios.patch(`http://localhost:8000/api/transactions/${editingTransaction.id}/`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Transaction updated successfully.',
        });
      } else {
        await axios.post('http://localhost:8000/api/transactions/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Transaction created successfully.',
        });
      }
      setShowModal(false);
      fetchTransactions();
    } catch (error) {
      console.error('Error saving transaction', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save transaction.',
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingTransaction(null);
  };

  if (user && user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <div className="admin-topbar">
          <h2 className="admin-page-title">Manage Transactions</h2>
          <div className="admin-topbar-right">
            <div className="admin-avatar">AD</div>
          </div>
        </div>

        <div className="admin-content">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="admin-section-title mb-0">Transactions Table</h3>
            <button className="btn btn-primary admin-action-btn" onClick={handleAdd}>
              Add New Transaction
            </button>
          </div>

          <div className="table-responsive admin-table-wrap">
            <table className="table table-hover admin-table">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Property</th>
                <th>Buyer</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(transaction => (
                <tr key={transaction.id}>
                  <td>{transaction.id}</td>
                  <td>{transaction.property.title}</td>
                  <td>{transaction.buyer.username}</td>
                  <td>${transaction.amount}</td>
                  <td>{new Date(transaction.transaction_date).toLocaleDateString()}</td>
                  <td>
                    <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(transaction)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(transaction.id)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>

        {/* Modal */}
        {showModal && (
          <div className="modal show d-block admin-modal-backdrop" tabIndex="-1">
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingTransaction ? 'Edit Transaction' : 'Add New Transaction'}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Property</label>
                      <select
                        className="form-select"
                        value={formData.property}
                        onChange={(e) => setFormData({ ...formData, property: e.target.value })}
                        required
                      >
                        <option value="">Select Property</option>
                        {properties.map(property => (
                          <option key={property.id} value={property.id}>
                            {property.title} - {property.address}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Buyer</label>
                      <select
                        className="form-select"
                        value={formData.buyer}
                        onChange={(e) => setFormData({ ...formData, buyer: e.target.value })}
                        required
                      >
                        <option value="">Select Buyer</option>
                        {users.filter(u => u.role === 'buyer').map(buyer => (
                          <option key={buyer.id} value={buyer.id}>
                            {buyer.username} - {buyer.email}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Amount</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.amount}
                          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Transaction Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.transaction_date}
                          onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingTransaction ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ManageTransaction;
