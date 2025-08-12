import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography } from '@mui/material';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ 
  children, 
  requireAuth = true, 
  requireAdmin = false, 
  redirectTo = '/login' 
}) => {
  const { isAuthenticated, user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading spinner while auth is being determined
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)'
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3 }} />
        <Typography variant="h6" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // Check authentication requirements
  if (requireAuth && !isAuthenticated) {
    // Save attempted location for redirect after login
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // Check admin requirements
  if (requireAdmin && !isAdmin()) {
    return (
      <Navigate 
        to="/unauthorized" 
        state={{ from: location }} 
        replace 
      />
    );
  }

  // If we don't require auth and user is authenticated, 
  // redirect to appropriate dashboard
  if (!requireAuth && isAuthenticated) {
    const dashboard = isAdmin() ? '/admin/dashboard' : '/dashboard';
    return <Navigate to={dashboard} replace />;
  }

  return children;
};

export default ProtectedRoute;
