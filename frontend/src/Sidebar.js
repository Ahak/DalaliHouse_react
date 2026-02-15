import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from './AuthContext';

const Sidebar = () => {
  const { logout, user } = useContext(AuthContext);

  const getNavClass = ({ isActive }) =>
    `admin-sidebar-link ${isActive ? 'active' : ''}`;

  return (
    <aside className="admin-sidebar">
    

      <div className="admin-sidebar-section-title">ADMIN PANEL</div>
      <ul className="admin-sidebar-nav">
        <li>
          <NavLink to="/dashboard" className={getNavClass}>
            <span className="admin-sidebar-dot"></span>
            Dashboard
          </NavLink>
        </li>
        {user && user.role === 'admin' && (
          <>
            <li>
              <NavLink to="/manage-users" className={getNavClass}>
                <span className="admin-sidebar-dot"></span>
                Manage Users
              </NavLink>
            </li>
            <li>
              <NavLink to="/manage-properties" className={getNavClass}>
                <span className="admin-sidebar-dot"></span>
                Manage Properties
              </NavLink>
            </li>
            <li>
              <NavLink to="/manage-transactions" className={getNavClass}>
                <span className="admin-sidebar-dot"></span>
                Manage Transactions
              </NavLink>
            </li>
          </>
        )}
      </ul>

      <button onClick={logout} className="admin-logout-btn">
        Logout
      </button>

      
    </aside>
  );
};

export default Sidebar;
