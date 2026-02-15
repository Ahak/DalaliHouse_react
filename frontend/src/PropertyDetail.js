import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import Navbar from './Navbar';
import Swal from 'sweetalert2';

const PropertyDetail = () => {
  const API_BASE_URL = 'http://localhost:8000';
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('');
  const [processingPayment, setProcessingPayment] = useState(false);

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const response = await axios.get(`http://localhost:8000/api/properties/${id}/`);
        setProperty(response.data);
      } catch (error) {
        console.error('Error fetching property', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperty();
  }, [id]);

  const handlePurchase = async () => {
    try {
      // First, initiate the purchase to create a pending transaction
      await axios.post(`http://localhost:8000/api/properties/${id}/purchase/`);
      // Show payment modal
      setPaymentMethod('');
      setShowPaymentModal(true);
      Swal.fire({
        icon: 'info',
        title: 'Complete Payment',
        text: 'Your purchase will be successful only after payment is completed.',
      });
    } catch (error) {
      console.error('Error initiating purchase', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Failed to initiate purchase.',
      });
    }
  };

  const handlePayment = async () => {
    if (!paymentMethod) {
      Swal.fire({
        icon: 'warning',
        title: 'Warning',
        text: 'Please select a payment method.',
      });
      return;
    }

    setProcessingPayment(true);
    try {
      await axios.post(`http://localhost:8000/api/properties/${id}/process_payment/`, {
        payment_method: paymentMethod
      });
      setShowPaymentModal(false);
      Swal.fire({
        icon: 'success',
        title: 'Success',
        text: 'Payment successful! Your purchase is complete.',
      });
      // Refresh property data to show updated status
      const response = await axios.get(`http://localhost:8000/api/properties/${id}/`);
      setProperty(response.data);
    } catch (error) {
      console.error('Error processing payment', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'Payment failed. Please try again.',
      });
    } finally {
      setProcessingPayment(false);
    }
  };

  const resolveImageUrl = (imagePath) => {
    if (!imagePath) return '';
    return imagePath.startsWith('http') ? imagePath : `${API_BASE_URL}${imagePath}`;
  };

  if (loading) {
    return (
      <div>
        <Navbar />
        <div className="container mt-4">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div>
        <Navbar />
        <div className="container mt-4">
          <p>Property not found.</p>
        </div>
      </div>
    );
  }

  const images = [property.image1, property.image2, property.image3].filter((img) => img);
  const contactValue = property.seller?.phone || property.seller?.email || 'N/A';
  const sellerValue = property.seller?.username || 'N/A';

  return (
    <div className="property-detail-page">
      <Navbar />
      <div className="container-fluid py-4 px-3 px-lg-4">
        <div className="row g-4 align-items-start">
          <div className="col-lg-6">
            {images.length > 0 ? (
              <div className="property-detail-gallery" data-count={images.length}>
                {images.map((img, index) => (
                  <div key={index} className={`property-detail-gallery-item item-${index + 1}`}>
                    <img
                      src={resolveImageUrl(img)}
                      className="property-detail-gallery-img"
                      alt={`${property.title} ${index + 1}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="property-detail-no-image">No image available</div>
            )}
          </div>
          <div className="col-lg-6">
            <h2 className="property-detail-title">Property Details</h2>
            <h1 className="property-detail-subtitle">{property.title}</h1>
            <p className="property-detail-desc">{property.description}</p>

            <div className="property-detail-panel">
              <div className="property-detail-row">
                <span className="property-detail-label">Price:</span> TZS {property.price}
              </div>
              <div className="property-detail-row">
                <span className="property-detail-label">Location:</span> {property.address || 'N/A'}
              </div>
              <div className="property-detail-row">
                <span className="property-detail-label">Bedrooms:</span> {property.bedrooms ?? 0}
              </div>
              <div className="property-detail-row">
                <span className="property-detail-label">Bathrooms:</span> {property.bathrooms ?? 0}
              </div>
              <div className="property-detail-row">
                <span className="property-detail-label">Seller:</span> {sellerValue}
              </div>
              <div className="property-detail-row">
                <span className="property-detail-label">Contact:</span> {contactValue}
              </div>
            </div>

            <button className="btn btn-primary " onClick={handlePurchase}>
              Buy Now
            </button>
          </div>
        </div>
      </div>

      {showPaymentModal && (
        <div
          className="modal d-block"
          tabIndex="-1"
          role="dialog"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
        >
          <div className="modal-dialog modal-dialog-centered" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Complete Payment</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={processingPayment}
                ></button>
              </div>
              <div className="modal-body">
                <p className="mb-2">Choose a payment method to confirm your purchase.</p>
                <select
                  className="form-select"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  disabled={processingPayment}
                >
                  <option value="">Select payment method</option>
                  <option value="cash">Cash</option>
                  <option value="bank_transfer">Bank Transfer</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="card">Credit/Debit Card</option>
                </select>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowPaymentModal(false)}
                  disabled={processingPayment}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePayment}
                  disabled={processingPayment}
                >
                  {processingPayment ? 'Processing...' : 'Pay Now'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PropertyDetail;
