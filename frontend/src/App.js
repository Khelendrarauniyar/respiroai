import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { Toaster } from 'react-hot-toast';
import 'react-toastify/dist/ReactToastify.css';

// Authentication
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Layout and Navigation
import Navbar from './components/Navbar';
import Navigation from './components/layout/Navigation';

// Pages
import Dashboard from './pages/Dashboard';
import Upload from './pages/Upload';
import Patients from './pages/Patients';
import PatientDetails from './pages/PatientDetails';
import PatientRegistration from './pages/PatientRegistration';
import PatientManagement from './pages/PatientManagement';
import Analytics from './pages/Analytics';
import About from './pages/About';
import AboutPublic from './pages/AboutPublic';
import LandingPage from './pages/LandingPage';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import MITLicense from './pages/MITLicense';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import Unauthorized from './pages/Unauthorized';

// Admin Components
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminScans from './components/admin/AdminScans';

import ApiService from './services/ApiService';

import './App.css';

// Main App Content Component
const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [systemStatus, setSystemStatus] = useState(null);
  const [systemLoading, setSystemLoading] = useState(true);

  useEffect(() => {
    checkSystemHealth();
  }, []);

  const checkSystemHealth = async () => {
    try {
      const response = await ApiService.checkHealth();
      setSystemStatus(response.data);
    } catch (error) {
      console.error('Failed to check system health:', error);
      setSystemStatus({ status: 'error', message: 'Backend connection failed' });
    } finally {
      setSystemLoading(false);
    }
  };

  // Show loading while checking authentication
  if (loading || systemLoading) {
    return (
      <div className="app-loading">
        <div className="loading-spinner"></div>
        <p>Loading Respiratory Disease Detection System...</p>
      </div>
    );
  }

  // If not authenticated, show login/register routes
  if (!isAuthenticated) {
    return (
      <div className="App">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/about-public" element={<AboutPublic />} />
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />
          <Route path="/mit-license" element={<MITLicense />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
            },
          }}
        />
      </div>
    );
  }

  // Authenticated user routes
  return (
    <div className="App">
      <Navigation systemStatus={systemStatus} />
      
      <main className="main-content">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/upload" 
            element={
              <ProtectedRoute>
                <Upload />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient/register" 
            element={
              <ProtectedRoute>
                <PatientRegistration />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients" 
            element={
              <ProtectedRoute>
                <Patients />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patients/:id" 
            element={
              <ProtectedRoute>
                <PatientDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/patient-management" 
            element={
              <ProtectedRoute>
                <PatientManagement />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/analytics" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/analytics" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <Analytics />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/users" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminUsers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/scans" 
            element={
              <ProtectedRoute requireAdmin={true}>
                <AdminScans />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/about" 
            element={
              <ProtectedRoute>
                <About />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/about-public" 
            element={<AboutPublic />}
          />
          <Route 
            path="/privacy-policy" 
            element={<PrivacyPolicy />}
          />
          <Route 
            path="/terms-of-service" 
            element={<TermsOfService />}
          />
          <Route 
            path="/mit-license" 
            element={<MITLicense />}
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/settings" 
            element={
              <ProtectedRoute>
                <Settings />
              </ProtectedRoute>
            } 
          />
          <Route path="/unauthorized" element={<Unauthorized />} />
          <Route path="/login" element={<Navigate to="/dashboard" replace />} />
          <Route path="/register" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </main>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
      
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />
    </div>
  );
};

// Main App Component with AuthProvider
function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
