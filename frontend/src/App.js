import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import Login from './Login';
import Register from './Register';
import Dashboard from './Dashboard';
import ManageUser from './ManageUser';
import ManageProperty from './ManageProperty';
import ManageTransaction from './ManageTransaction';
import PropertyDetail from './PropertyDetail';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/manage-users" element={<AdminRoute><ManageUser /></AdminRoute>} />
            <Route path="/manage-properties" element={<AdminRoute><ManageProperty /></AdminRoute>} />
            <Route path="/manage-transactions" element={<AdminRoute><ManageTransaction /></AdminRoute>} />
            <Route path="/property/:id" element={<PrivateRoute><PropertyDetail /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/login" />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

const PrivateRoute = ({ children }) => {
  const { token } = React.useContext(AuthContext);
  return token ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { token, user } = React.useContext(AuthContext);
  if (!token) return <Navigate to="/login" />;
  if (user && user.role !== 'admin') return <Navigate to="/dashboard" />;
  return children;
};

export default App;
