import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from './AuthContext';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Register = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: '',
    role: 'buyer'
  });
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await register(formData);
    if (success) {
      navigate('/login');
    } else {
      Swal.fire({
        icon: 'error',
        title: 'Registration Failed',
        text: 'Please check your details and try again.',
      });
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-shell">
        <div className="auth-card auth-card-register">
          <div className="auth-icon-wrap">
          
          </div>

          <h2 className="auth-title">Register</h2>

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="auth-input-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                className="form-control auth-input"
                required
              />
            </div>
            <div className="auth-input-group">
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                className="form-control auth-input"
                required
              />
            </div>
            <div className="auth-input-group">
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                className="form-control auth-input"
                required
              />
            </div>
            <div className="auth-input-row">
              <div className="auth-input-group">
                <input
                  type="text"
                  name="first_name"
                  placeholder="First Name"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="form-control auth-input"
                  required
                />
              </div>
              <div className="auth-input-group">
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last Name"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="form-control auth-input"
                  required
                />
              </div>
            </div>
            <div className="auth-input-group">
              <select
                name="role"
                value={formData.role}
                onChange={handleChange}
                className="form-select auth-input auth-select"
              >
                <option value="buyer">Buyer</option>
                <option value="seller">Seller</option>
              </select>
            </div>

            <button type="submit" className="btn auth-submit-btn w-100">Create Account</button>
          </form>

          <div className="auth-switch">
            <p>I have an account? <Link to="/login">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
