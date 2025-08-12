import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { 
  Box, 
  Button, 
  TextField, 
  Typography, 
  Container, 
  Paper, 
  Grid,
  FormControlLabel,
  Checkbox,
  Divider,
  Alert,
  CircularProgress
} from '@mui/material';
import { 
  Login as LoginIcon, 
  Person as PersonIcon,
  Lock as LockIcon,
  Visibility,
  VisibilityOff,
  LocalHospital as HospitalIcon
} from '@mui/icons-material';
import { AuthContext } from '../../contexts/AuthContext';
import ApiService from '../../services/ApiService';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);
  
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    remember_me: false
  });
  
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'remember_me' ? checked : value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username or email is required';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await ApiService.post('/auth/login', formData);
      
      if (response.data.success) {
        await login(response.data.token, response.data.user);
        toast.success(`Welcome back, ${response.data.user.full_name}!`);
        
        // Redirect based on role
        if (response.data.user.role === 'admin') {
          navigate('/analytics');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(response.data.error || 'Login failed');
        if (response.data.error === 'Invalid credentials') {
          setErrors({ 
            username: 'Invalid username or password',
            password: 'Invalid username or password'
          });
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || 'Network error. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role) => {
    setLoading(true);
    
    const demoCredentials = {
      admin: { username: 'admin', password: 'admin123' },
      patient: { username: 'demo_patient', password: 'patient123' }
    };
    
    const credentials = demoCredentials[role];
    
    try {
      const response = await ApiService.post('/auth/login', credentials);
      
      if (response.data.success) {
        await login(response.data.token, response.data.user);
        toast.success(`Demo login successful!`);
        
        if (response.data.user.role === 'admin') {
          navigate('/analytics');
        } else {
          navigate('/dashboard');
        }
      } else {
        toast.error(response.data.error || 'Demo login failed');
      }
    } catch (error) {
      console.error('Demo login error:', error);
      const errorMessage = error.response?.data?.error || 'Demo login failed. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container component="main" maxWidth="sm" sx={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center',
      py: 4
    }}>
      <Paper 
        elevation={8} 
        sx={{ 
          p: 4, 
          width: '100%',
          background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
          borderRadius: 3
        }}
      >
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <HospitalIcon sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
          <Typography variant="h4" component="h1" fontWeight="bold" color="primary">
            Respiratory AI
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            Advanced Disease Detection System
          </Typography>
        </Box>

        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>Demo Accounts:</strong><br />
            Admin: admin / admin123<br />
            Patient: demo_patient / patient123
          </Typography>
        </Alert>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username or Email"
            name="username"
            autoComplete="username"
            autoFocus
            value={formData.username}
            onChange={handleChange}
            error={!!errors.username}
            helperText={errors.username}
            InputProps={{
              startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type={showPassword ? 'text' : 'password'}
            id="password"
            autoComplete="current-password"
            value={formData.password}
            onChange={handleChange}
            error={!!errors.password}
            helperText={errors.password}
            InputProps={{
              startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
              endAdornment: (
                <Button
                  onClick={() => setShowPassword(!showPassword)}
                  sx={{ minWidth: 'auto', p: 1 }}
                >
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </Button>
              )
            }}
          />
          
          <FormControlLabel
            control={
              <Checkbox 
                name="remember_me"
                checked={formData.remember_me}
                onChange={handleChange}
                color="primary" 
              />
            }
            label="Remember me for 7 days"
            sx={{ mt: 1 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ 
              mt: 3, 
              mb: 2, 
              py: 1.5,
              fontSize: '1.1rem',
              background: 'linear-gradient(45deg, #2196F3 30%, #21CBF3 90%)'
            }}
            startIcon={loading ? <CircularProgress size={20} /> : <LoginIcon />}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>

          <Divider sx={{ my: 3 }}>
            <Typography variant="body2" color="text.secondary">
              OR TRY DEMO
            </Typography>
          </Divider>

          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleDemoLogin('admin')}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                Admin Demo
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                fullWidth
                variant="outlined"
                onClick={() => handleDemoLogin('patient')}
                disabled={loading}
                sx={{ py: 1.5 }}
              >
                Patient Demo
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Typography variant="body2" color="text.secondary">
              Don't have an account?{' '}
              <Link 
                to="/register" 
                style={{ 
                  color: '#2196F3', 
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                Create Account
              </Link>
            </Typography>
          </Box>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;
