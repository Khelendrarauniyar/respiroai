import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions
} from '@mui/material';
import {
  Lock as LockIcon,
  Home as HomeIcon,
  ArrowBack as BackIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const Unauthorized = () => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const handleGoHome = () => {
    navigate('/dashboard');
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Card sx={{ textAlign: 'center', p: 4 }}>
        <CardContent>
          <Box sx={{ mb: 3 }}>
            <LockIcon sx={{ fontSize: 80, color: 'error.main', mb: 2 }} />
          </Box>
          
          <Typography variant="h3" component="h1" gutterBottom color="error">
            Access Denied
          </Typography>
          
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            You don't have permission to access this page
          </Typography>
          
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            {isAdmin() 
              ? 'This page is restricted to specific admin roles.'
              : 'This page is only accessible to administrators.'
            }
          </Typography>

          {user && (
            <Box sx={{ mb: 4, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Logged in as: <strong>{user.email}</strong> ({user.role})
              </Typography>
            </Box>
          )}
        </CardContent>
        
        <CardActions sx={{ justifyContent: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<BackIcon />}
            onClick={handleGoBack}
          >
            Go Back
          </Button>
          
          <Button
            variant="contained"
            startIcon={<HomeIcon />}
            onClick={handleGoHome}
          >
            Go to Dashboard
          </Button>
        </CardActions>
      </Card>
    </Container>
  );
};

export default Unauthorized;
