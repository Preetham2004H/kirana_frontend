import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../css/Sidebar.css';

const Sidebar = () => {
  const { isAdmin } = useAuth();

  const adminLinks = [
    { path: '/admin/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/admin/products', icon: '📦', label: 'Products' },
    { path: '/admin/categories', icon: '🗂️', label: 'Categories' },
    { path: '/admin/sales', icon: '💰', label: 'Sales' }
  ];

  const shopkeeperLinks = [
    { path: '/shopkeeper/dashboard', icon: '📊', label: 'Dashboard' }
  ];

  const links = isAdmin ? adminLinks : shopkeeperLinks;

  return (
    <aside className="sidebar">
      <div className="sidebar-content">
        <nav className="sidebar-nav">
          {links.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <span className="sidebar-icon">{link.icon}</span>
              <span className="sidebar-label">{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
