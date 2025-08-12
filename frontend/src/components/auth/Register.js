import React, { useState } from 'react';
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
  Stepper,
  Step,
  StepLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Divider
} from '@mui/material';
import { 
  PersonAdd as RegisterIcon,
  Person as PersonIcon,
  Email as EmailIcon,
  Lock as LockIcon,
  Phone as PhoneIcon,
  Home as HomeIcon,
  LocalHospital as HospitalIcon,
  Visibility,
  VisibilityOff
} from '@mui/icons-material';
import ApiService from '../../services/ApiService';

const Register = () => {
  const navigate = useNavigate();
  
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [formData, setFormData] = useState({
    // Basic Information
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    full_name: '',
    
    // Personal Details
    phone: '',
    date_of_birth: '',
    gender: '',
    address: '',
    emergency_contact: '',
    
    // Medical Information
    medical_history: '',
    allergies: '',
    current_medications: '',
    chronic_conditions: '',
    blood_type: '',
    height_cm: '',
    weight_kg: ''
  });
  
  const [errors, setErrors] = useState({});

  const steps = ['Account Info', 'Personal Details', 'Medical Profile'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear errors when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateStep = (step) => {
    const newErrors = {};
    
    if (step === 0) {
      // Basic Information
      if (!formData.username.trim()) {
        newErrors.username = 'Username is required';
      } else if (formData.username.length < 3) {
        newErrors.username = 'Username must be at least 3 characters';
      }
      
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        newErrors.email = 'Invalid email format';
      }
      
      if (!formData.password) {
        newErrors.password = 'Password is required';
      } else if (formData.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
        newErrors.password = 'Password must contain uppercase, lowercase, and number';
      }
      
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (!formData.full_name.trim()) {
        newErrors.full_name = 'Full name is required';
      }
    }
    
    if (step === 1) {
      // Personal Details - Optional but validate format
      if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
        newErrors.phone = 'Invalid phone number format';
      }
      
      if (formData.date_of_birth) {
        const birthDate = new Date(formData.date_of_birth);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 0 || age > 150) {
          newErrors.date_of_birth = 'Invalid date of birth';
        }
      }
    }
    
    if (step === 2) {
      // Medical Information - Optional but validate format
      if (formData.height_cm && (formData.height_cm < 30 || formData.height_cm > 300)) {
        newErrors.height_cm = 'Height must be between 30-300 cm';
      }
      
      if (formData.weight_kg && (formData.weight_kg < 1 || formData.weight_kg > 500)) {
        newErrors.weight_kg = 'Weight must be between 1-500 kg';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(activeStep)) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleSubmit = async () => {
    if (!validateStep(2)) {
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await ApiService.post('/auth/register', formData);
      
      if (response.data.success) {
        toast.success('Registration successful! Please log in.');
        navigate('/login');
      } else {
        toast.error(response.data.error || 'Registration failed');
        if (response.data.error && response.data.error.includes('already exists')) {
          setActiveStep(0); // Go back to first step
          setErrors({ username: response.data.error, email: response.data.error });
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      const errorMessage = error.response?.data?.error || 'Network error. Please try again.';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = (step) => {
    switch (step) {
      case 0:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                error={!!errors.username}
                helperText={errors.username}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="email"
                label="Email Address"
                name="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                error={!!errors.email}
                helperText={errors.email}
                InputProps={{
                  startAdornment: <EmailIcon sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="full_name"
                label="Full Name"
                name="full_name"
                autoComplete="name"
                value={formData.full_name}
                onChange={handleChange}
                error={!!errors.full_name}
                helperText={errors.full_name}
                InputProps={{
                  startAdornment: <PersonIcon sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
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
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                id="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                InputProps={{
                  startAdornment: <LockIcon sx={{ color: 'action.active', mr: 1 }} />,
                  endAdornment: (
                    <Button
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      sx={{ minWidth: 'auto', p: 1 }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </Button>
                  )
                }}
              />
            </Grid>
          </Grid>
        );
        
      case 1:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="phone"
                label="Phone Number"
                name="phone"
                autoComplete="tel"
                value={formData.phone}
                onChange={handleChange}
                error={!!errors.phone}
                helperText={errors.phone}
                InputProps={{
                  startAdornment: <PhoneIcon sx={{ color: 'action.active', mr: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                id="date_of_birth"
                label="Date of Birth"
                name="date_of_birth"
                type="date"
                value={formData.date_of_birth}
                onChange={handleChange}
                error={!!errors.date_of_birth}
                helperText={errors.date_of_birth}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth error={!!errors.gender}>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  label="Gender"
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Select Gender</em>
                  </MenuItem>
                  <MenuItem value="male">Male</MenuItem>
                  <MenuItem value="female">Female</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                  <MenuItem value="prefer_not_to_say">Prefer not to say</MenuItem>
                </Select>
                {errors.gender && (
                  <FormHelperText>{errors.gender}</FormHelperText>
                )}
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="address"
                label="Address"
                name="address"
                multiline
                rows={2}
                value={formData.address}
                onChange={handleChange}
                error={!!errors.address}
                helperText={errors.address}
                InputProps={{
                  startAdornment: <HomeIcon sx={{ color: 'action.active', mr: 1, alignSelf: 'flex-start', mt: 1 }} />
                }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="emergency_contact"
                label="Emergency Contact"
                name="emergency_contact"
                placeholder="Name and phone number"
                value={formData.emergency_contact}
                onChange={handleChange}
                error={!!errors.emergency_contact}
                helperText={errors.emergency_contact}
              />
            </Grid>
          </Grid>
        );
        
      case 2:
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="medical_history"
                label="Medical History"
                name="medical_history"
                multiline
                rows={3}
                placeholder="Previous illnesses, surgeries, hospitalizations..."
                value={formData.medical_history}
                onChange={handleChange}
                error={!!errors.medical_history}
                helperText={errors.medical_history}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="allergies"
                label="Allergies"
                name="allergies"
                placeholder="Food allergies, drug allergies, environmental allergies..."
                value={formData.allergies}
                onChange={handleChange}
                error={!!errors.allergies}
                helperText={errors.allergies}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="current_medications"
                label="Current Medications"
                name="current_medications"
                multiline
                rows={2}
                placeholder="List all current medications and dosages..."
                value={formData.current_medications}
                onChange={handleChange}
                error={!!errors.current_medications}
                helperText={errors.current_medications}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                id="chronic_conditions"
                label="Chronic Conditions"
                name="chronic_conditions"
                placeholder="Diabetes, hypertension, asthma, etc..."
                value={formData.chronic_conditions}
                onChange={handleChange}
                error={!!errors.chronic_conditions}
                helperText={errors.chronic_conditions}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth>
                <InputLabel id="blood-type-label">Blood Type</InputLabel>
                <Select
                  labelId="blood-type-label"
                  id="blood_type"
                  name="blood_type"
                  value={formData.blood_type}
                  label="Blood Type"
                  onChange={handleChange}
                >
                  <MenuItem value="">
                    <em>Select</em>
                  </MenuItem>
                  <MenuItem value="A+">A+</MenuItem>
                  <MenuItem value="A-">A-</MenuItem>
                  <MenuItem value="B+">B+</MenuItem>
                  <MenuItem value="B-">B-</MenuItem>
                  <MenuItem value="AB+">AB+</MenuItem>
                  <MenuItem value="AB-">AB-</MenuItem>
                  <MenuItem value="O+">O+</MenuItem>
                  <MenuItem value="O-">O-</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="height_cm"
                label="Height (cm)"
                name="height_cm"
                type="number"
                value={formData.height_cm}
                onChange={handleChange}
                error={!!errors.height_cm}
                helperText={errors.height_cm}
                inputProps={{ min: 30, max: 300 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                id="weight_kg"
                label="Weight (kg)"
                name="weight_kg"
                type="number"
                value={formData.weight_kg}
                onChange={handleChange}
                error={!!errors.weight_kg}
                helperText={errors.weight_kg}
                inputProps={{ min: 1, max: 500 }}
              />
            </Grid>
          </Grid>
        );
        
      default:
        return 'Unknown step';
    }
  };

  return (
    <Container component="main" maxWidth="md" sx={{ 
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
            Join Respiratory AI
          </Typography>
          <Typography variant="h6" color="text.secondary" sx={{ mt: 1 }}>
            Create your medical profile
          </Typography>
        </Box>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box sx={{ mt: 2 }}>
          {renderStepContent(activeStep)}
          
          <Box sx={{ display: 'flex', flexDirection: 'row', pt: 3 }}>
            <Button
              color="inherit"
              disabled={activeStep === 0}
              onClick={handleBack}
              sx={{ mr: 1 }}
            >
              Back
            </Button>
            
            <Box sx={{ flex: '1 1 auto' }} />
            
            {activeStep === steps.length - 1 ? (
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading}
                sx={{ 
                  py: 1.5,
                  px: 3,
                  background: 'linear-gradient(45deg, #4CAF50 30%, #45a049 90%)'
                }}
                startIcon={loading ? <CircularProgress size={20} /> : <RegisterIcon />}
              >
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            ) : (
              <Button
                variant="contained"
                onClick={handleNext}
                sx={{ py: 1.5, px: 3 }}
              >
                Next
              </Button>
            )}
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Box sx={{ textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            Already have an account?{' '}
            <Link 
              to="/login" 
              style={{ 
                color: '#2196F3', 
                textDecoration: 'none',
                fontWeight: 'bold'
              }}
            >
              Sign In
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Register;
