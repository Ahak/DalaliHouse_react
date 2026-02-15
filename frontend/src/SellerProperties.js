import React, { useState, useEffect, useContext, useCallback } from 'react';
import axios from 'axios';
import { Modal, Button } from 'react-bootstrap';
import { AuthContext } from './AuthContext';

const SellerProperties = ({ onUpdated }) => {
  const buildImageUrl = (imagePath) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) return imagePath;
    const normalizedPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
    return `http://localhost:8000${normalizedPath}`;
  };

  const [properties, setProperties] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    address: '',
    price: '',
    description: '',
    image1: null,
    image2: null,
    image3: null,
    bedrooms: 0,
    bathrooms: 0
  });
  const [editing, setEditing] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [fileInputKey, setFileInputKey] = useState(0);
  const { user } = useContext(AuthContext);

  const fetchProperties = useCallback(async () => {
    if (!user?.id) return;

    try {
      const response = await axios.get('http://localhost:8000/api/properties/');
      // Filter out sold properties - only show pending and approved properties
      setProperties(response.data.filter(prop => prop.seller.id === user.id && prop.status !== 'sold'));
    } catch (error) {
      console.error('Error fetching properties', error);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProperties();
  }, [fetchProperties]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const data = new FormData();
    data.append('title', formData.title);
    data.append('address', formData.address);
    data.append('price', formData.price);
    data.append('description', formData.description);
    data.append('bedrooms', formData.bedrooms);
    data.append('bathrooms', formData.bathrooms);
    if (formData.image1) data.append('image1', formData.image1);
    if (formData.image2) data.append('image2', formData.image2);
    if (formData.image3) data.append('image3', formData.image3);

    try {
      if (editing) {
        await axios.put(`http://localhost:8000/api/properties/${editing}/`, data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        setEditing(null);
      } else {
        await axios.post('http://localhost:8000/api/properties/', data, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
      }
      setFormData({ title: '', address: '', price: '', description: '', bedrooms: 0, bathrooms: 0, image1: null, image2: null, image3: null });
      setShowModal(false);
      fetchProperties();
      if (onUpdated) onUpdated();
    } catch (error) {
      console.error('Error saving property', error);
    }
  };

  const handleEdit = (property) => {
    setFormData({
      title: property.title,
      address: property.address,
      price: property.price,
      description: property.description,
      bedrooms: property.bedrooms,
      bathrooms: property.bathrooms,
      image1: null,
      image2: null,
      image3: null
    });
    setEditing(property.id);
    setShowModal(true);
  };

  const handleAdd = () => {
    setFormData({ title: '', address: '', price: '', description: '', bedrooms: 0, bathrooms: 0, image1: null, image2: null, image3: null });
    setFileInputKey(prev => prev + 1);
    setEditing(null);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        await axios.delete(`http://localhost:8000/api/properties/${id}/`);
        fetchProperties();
        if (onUpdated) onUpdated();
      } catch (error) {
        console.error('Error deleting property', error);
      }
    }
  };

  return (
    <section className="seller-section">
      <div className="seller-page-head mb-4">
        <h2 className="seller-page-title">My Properties</h2>
      </div>
      <button className="btn seller-btn-primary mb-3" onClick={handleAdd}>Add New Property</button>
      <div className="table-responsive seller-table-wrap">
        <table className="table seller-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Title</th>
              <th>Address</th>
              <th>Price</th>
              <th>Bedrooms</th>
              <th>Bathrooms</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {properties.map(property => (
              <tr key={property.id}>
                <td>
                  {property.image1 ? (
                    <img
                      src={buildImageUrl(property.image1)}
                      alt="Property"
                      className="seller-property-thumb"
                    />
                  ) : (
                    'No Image'
                  )}
                </td>
                <td>{property.title}</td>
                <td>{property.address}</td>
                <td>${property.price}</td>
                <td>{property.bedrooms}</td>
                <td>{property.bathrooms}</td>
                <td className="text-capitalize">{property.status}</td>
                <td>
                  <button className="btn btn-warning btn-sm me-2" onClick={() => handleEdit(property)}>Edit</button>
                  <button className="btn btn-danger btn-sm" onClick={() => handleDelete(property.id)}>Delete</button>
                </td>
              </tr>
            ))}
            {properties.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">No properties created yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editing ? 'Edit Property' : 'Add New Property'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <input
                type="text"
                name="title"
                placeholder="Title"
                value={formData.title}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="text"
                name="address"
                placeholder="Address"
                value={formData.address}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                className="form-control"
                required
              />
            </div>
            <div className="mb-3">
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                className="form-control"
                rows="3"
                required
              />
            </div>
            <div className="row">
              <div className="col-md-6 mb-3">
                <input
                  type="number"
                  name="bedrooms"
                  placeholder="Bedrooms"
                  value={formData.bedrooms}
                  onChange={handleChange}
                  className="form-control"
                  min="0"
                />
              </div>
              <div className="col-md-6 mb-3">
                <input
                  type="number"
                  name="bathrooms"
                  placeholder="Bathrooms"
                  value={formData.bathrooms}
                  onChange={handleChange}
                  className="form-control"
                  min="0"
                />
              </div>
            </div>
            <div className="mb-3">
              <label className="form-label">Property Images (Optional)</label>
              <input
                key={`image1-${fileInputKey}`}
                type="file"
                name="image1"
                onChange={(e) => setFormData({ ...formData, image1: e.target.files[0] })}
                className="form-control mb-2"
                accept="image/*"
              />
              <input
                key={`image2-${fileInputKey}`}
                type="file"
                name="image2"
                onChange={(e) => setFormData({ ...formData, image2: e.target.files[0] })}
                className="form-control mb-2"
                accept="image/*"
              />
              <input
                key={`image3-${fileInputKey}`}
                type="file"
                name="image3"
                onChange={(e) => setFormData({ ...formData, image3: e.target.files[0] })}
                className="form-control mb-2"
                accept="image/*"
              />
            </div>
            <Button type="submit" className="btn btn-primary me-2">{editing ? 'Update' : 'Add'} Property</Button>
            <Button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</Button>
          </form>
        </Modal.Body>
      </Modal>
    </section>
  );
};

export default SellerProperties;
