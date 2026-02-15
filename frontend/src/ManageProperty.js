import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';
import Sidebar from './Sidebar';
import Swal from 'sweetalert2';

const ManageProperty = () => {
  const API_BASE_URL = 'http://localhost:8000';
  const [properties, setProperties] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingProperty, setEditingProperty] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    description: '',
    bedrooms: 0,
    bathrooms: 0,
    image1: null,
    image2: null,
    image3: null
  });
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchProperties();
    }
  }, [user]);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/properties/');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties', error);
    }
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
    } catch (error) {
      console.error('Error approving property', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to approve property.',
      });
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axios.delete(`http://localhost:8000/api/properties/${id}/`);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Property deleted successfully.',
        });
        fetchProperties();
      } catch (error) {
        console.error('Error deleting property', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'Failed to delete property.',
        });
      }
    }
  };

  const handleEdit = (property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      address: property.address,
      price: property.price,
      description: property.description,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      image1: null,
      image2: null,
      image3: null
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingProperty(null);
    setFormData({
      title: '',
      address: '',
      price: '',
      description: '',
      bedrooms: 0,
      bathrooms: 0,
      image1: null,
      image2: null,
      image3: null
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingProperty) {
        await axios.patch(`http://localhost:8000/api/properties/${editingProperty.id}/`, formData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Property updated successfully.',
        });
      } else {
        await axios.post('http://localhost:8000/api/properties/', formData);
        Swal.fire({
          icon: 'success',
          title: 'Success',
          text: 'Property created successfully.',
        });
      }
      setShowModal(false);
      fetchProperties();
    } catch (error) {
      console.error('Error saving property', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to save property.',
      });
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingProperty(null);
  };

  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`;
  };

  if (user && user.role !== 'admin') {
    return <div>Access denied</div>;
  }

  return (
    <div className="admin-layout">
      <Sidebar />
      <main className="admin-main">
        <div className="admin-topbar">
          <h2 className="admin-page-title">Manage Properties</h2>
          <div className="admin-topbar-right">
            <div className="admin-avatar">AD</div>
          </div>
        </div>

        <div className="admin-content">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="admin-section-title mb-0">Properties Table</h3>
            <button className="btn btn-primary admin-action-btn" onClick={handleAdd}>
              Add New Property
            </button>
          </div>

          <div className="table-responsive admin-table-wrap">
            <table className="table table-hover admin-table">
            <thead className="table-dark">
              <tr>
                <th>ID</th>
                <th>Image</th>
                <th>Title</th>
                <th>Address</th>
                <th>Price</th>
                <th>Bedrooms</th>
                <th>Bathrooms</th>
                <th>Status</th>
                <th>Seller</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {properties.map(property => (
                <tr key={property.id}>
                  <td>{property.id}</td>
                  <td>
                    {property.image1 ? (
                      <img
                        src={resolveImageUrl(property.image1)}
                        alt={property.title || 'Property'}
                        className="admin-property-thumb"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                          const fallback = e.currentTarget.nextElementSibling;
                          if (fallback) fallback.style.display = 'grid';
                        }}
                      />
                    ) : (
                      <span className="admin-property-thumb-fallback visible">No Image</span>
                    )}
                    {property.image1 && <span className="admin-property-thumb-fallback">No Image</span>}
                  </td>
                  <td>{property.title}</td>
                  <td>{property.address}</td>
                  <td>${property.price}</td>
                  <td>{property.bedrooms || 0}</td>
                  <td>{property.bathrooms || 0}</td>
                  <td>
                    <span className={`badge bg-${property.status === 'approved' ? 'success' : property.status === 'pending' ? 'warning' : 'secondary'}`}>
                      {property.status}
                    </span>
                  </td>
                  <td>{property.seller.username}</td>
                  <td>
                    <button className="btn btn-success btn-sm me-1" onClick={() => handleApprove(property.id)} disabled={property.status === 'approved' || property.status === 'sold'}>
                      Approve
                    </button>
                    <button className="btn btn-warning btn-sm me-1" onClick={() => handleEdit(property)}>
                      Edit
                    </button>
                    <button className="btn btn-danger btn-sm" onClick={() => handleDelete(property.id)}>
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
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingProperty ? 'Edit Property' : 'Add New Property'}</h5>
                  <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Title</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Price</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          step="0.01"
                          required
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Address</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.address}
                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        required
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Description</label>
                      <textarea
                        className="form-control"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        rows="3"
                        required
                      />
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Bedrooms</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.bedrooms}
                          onChange={(e) => setFormData({ ...formData, bedrooms: parseInt(e.target.value) || 0 })}
                          min="0"
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Bathrooms</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.bathrooms}
                          onChange={(e) => setFormData({ ...formData, bathrooms: parseInt(e.target.value) || 0 })}
                          min="0"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Property Images (Optional)</label>
                      <input
                        type="file"
                        className="form-control mb-2"
                        onChange={(e) => setFormData({ ...formData, image1: e.target.files[0] })}
                        accept="image/*"
                      />
                      <input
                        type="file"
                        className="form-control mb-2"
                        onChange={(e) => setFormData({ ...formData, image2: e.target.files[0] })}
                        accept="image/*"
                      />
                      <input
                        type="file"
                        className="form-control mb-2"
                        onChange={(e) => setFormData({ ...formData, image3: e.target.files[0] })}
                        accept="image/*"
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={handleCloseModal}>
                      Cancel
                    </button>
                    <button type="submit" className="btn btn-primary">
                      {editingProperty ? 'Update' : 'Create'}
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

export default ManageProperty;
