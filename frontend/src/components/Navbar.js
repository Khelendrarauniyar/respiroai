import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  FiHome, 
  FiUpload, 
  FiUsers, 
  FiBarChart2, 
  FiInfo,
  FiActivity,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';
import './Navbar.css';

const Navbar = ({ systemStatus }) => {
  const getStatusIcon = () => {
    if (!systemStatus) return <FiAlertCircle className="status-icon warning" />;
    
    switch (systemStatus.status) {
      case 'healthy':
        return <FiCheckCircle className="status-icon healthy" />;
      case 'error':
        return <FiAlertCircle className="status-icon error" />;
      default:
        return <FiAlertCircle className="status-icon warning" />;
    }
  };

  const getStatusText = () => {
    if (!systemStatus) return 'Checking...';
    
    switch (systemStatus.status) {
      case 'healthy':
        return `System Healthy (${systemStatus.models_loaded || 0} models loaded)`;
      case 'error':
        return 'System Error';
      default:
        return 'System Status Unknown';
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo and Title */}
        <div className="navbar-brand">
          <FiActivity className="brand-icon" />
          <div className="brand-text">
            <h1>RespirAI</h1>
            <span>Respiratory Disease Detection</span>
          </div>
        </div>

        {/* Navigation Links */}
        <div className="navbar-nav">
          <NavLink 
            to="/dashboard" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            <FiHome />
            <span>Dashboard</span>
          </NavLink>
          
          <NavLink 
            to="/upload" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            <FiUpload />
            <span>Upload & Analyze</span>
          </NavLink>
          
          <NavLink 
            to="/patients" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            <FiUsers />
            <span>Patients</span>
          </NavLink>
          
          <NavLink 
            to="/analytics" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            <FiBarChart2 />
            <span>Analytics</span>
          </NavLink>
          
          <NavLink 
            to="/about" 
            className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}
          >
            <FiInfo />
            <span>About</span>
          </NavLink>
        </div>

        {/* System Status */}
        <div className="navbar-status">
          {getStatusIcon()}
          <span className="status-text">{getStatusText()}</span>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
