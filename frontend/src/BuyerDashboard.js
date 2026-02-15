import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Swal from 'sweetalert2';

const BuyerDashboard = () => {
  const [properties, setProperties] = useState([]);

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const response = await axios.get('http://localhost:8000/api/properties/?status=approved');
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties', error);
    }
  };



  return (
    <div>
      <Navbar />
      <div className="container-fluid mt-4">
        <h2 className="mb-4">Buyer Dashboard</h2>
        <div className="row">
          {properties.map(property => (
            <div key={property.id} className="col-md-6 col-lg-3 mb-4">
              <div className="card" style={{ width: '15rem' }}>
                {property.image1 ? (
  <img
    src={property.image1.startsWith('http') ? property.image1 : `http://localhost:8000${property.image1}`}
    className="card-img-top"
    alt={property.title}
    style={{ height: '200px', objectFit: 'cover' }}
  />
) : (
  <div className="card-img-top d-flex align-items-center justify-content-center bg-light" style={{ height: '200px' }}>
    No image
  </div>
)}

                <div className="card-body">
                  <h5 className="card-title">{property.title}</h5>
                  <p className="card-text">Address: {property.address}<br />Price: Tzs {property.price}<br />Bedrooms: {property.bedrooms}<br />Bathrooms: {property.bathrooms}</p>
                  <Link to={`/property/${property.id}`} className="btn btn-primary">View Details</Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default BuyerDashboard;
