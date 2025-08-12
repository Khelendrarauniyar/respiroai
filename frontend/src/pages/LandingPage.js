import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  useMediaQuery,
  useTheme,
  Fade,
  Zoom,
  Slide
} from '@mui/material';
import {
  Menu as MenuIcon,
  Close as CloseIcon,
  Psychology as AIIcon,
  LocalHospital as HealthIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Assessment as AnalyticsIcon,
  People as PeopleIcon,
  ArrowForward as ArrowIcon,
  PlayArrow as PlayIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';
import './LandingPage.css';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Animated medical scan images (you can replace these with actual medical scan images)
  const medicalImages = [
    '🫁', // Lung
    '🩻', // X-ray
    '🧠', // Brain
    '💓', // Heart
    '🔬'  // Microscope
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % medicalImages.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [medicalImages.length]);

  const features = [
    {
      icon: <AIIcon />,
      title: 'AI-Powered Diagnosis',
      description: 'Advanced deep learning models for accurate respiratory disease detection',
      color: '#2196F3'
    },
    {
      icon: <HealthIcon />,
      title: 'Multi-Disease Detection',
      description: 'Detect Pneumonia, Tuberculosis, and Lung Cancer from medical scans',
      color: '#4CAF50'
    },
    {
      icon: <SpeedIcon />,
      title: 'Real-time Results',
      description: 'Get instant analysis with confidence scores and detailed reports',
      color: '#FF9800'
    },
    {
      icon: <SecurityIcon />,
      title: 'Secure & Private',
      description: 'HIPAA-compliant security for protecting sensitive medical data',
      color: '#9C27B0'
    },
    {
      icon: <AnalyticsIcon />,
      title: 'Advanced Analytics',
      description: 'Comprehensive patient management and medical history tracking',
      color: '#F44336'
    },
    {
      icon: <PeopleIcon />,
      title: 'Patient Management',
      description: 'Complete patient record system with multi-user support',
      color: '#607D8B'
    }
  ];

  const stats = [
    { number: '99.2%', label: 'Accuracy Rate' },
    { number: '10K+', label: 'Scans Analyzed' },
    { number: '500+', label: 'Healthcare Providers' },
    { number: '24/7', label: 'Availability' }
  ];

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/register');
    }
  };

  const handleLogin = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  const menuItems = [
    { label: 'Features', action: () => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' }) },
    { label: 'About', action: () => navigate('/about-public') },
    { label: 'Contact', action: () => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' }) }
  ];

  return (
    <Box className="landing-page">
      {/* Navigation Bar */}
      <AppBar position="fixed" sx={{ backgroundColor: 'rgba(255, 255, 255, 0.95)', backdropFilter: 'blur(20px)' }}>
        <Toolbar>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Typography
              variant="h6"
              component="div"
              sx={{ 
                flexGrow: 1, 
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'flex',
                alignItems: 'center',
                gap: 1
              }}
            >
              <HealthIcon sx={{ color: '#2196F3' }} />
              RespiroAI
            </Typography>
          </motion.div>

          <Box sx={{ flexGrow: 1 }} />

          {!isMobile ? (
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
              {menuItems.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Button
                    color="primary"
                    onClick={item.action}
                    sx={{ 
                      color: '#333',
                      '&:hover': {
                        backgroundColor: 'rgba(33, 150, 243, 0.1)'
                      }
                    }}
                  >
                    {item.label}
                  </Button>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Button
                  variant="outlined"
                  onClick={handleLogin}
                  sx={{ mr: 1 }}
                >
                  {isAuthenticated ? 'Dashboard' : 'Login'}
                </Button>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Button
                  variant="contained"
                  onClick={handleGetStarted}
                  sx={{
                    background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                    '&:hover': {
                      background: 'linear-gradient(45deg, #1976D2, #0097A7)',
                    }
                  }}
                >
                  {isAuthenticated ? 'Dashboard' : 'Get Started'}
                </Button>
              </motion.div>
            </Box>
          ) : (
            <IconButton
              edge="start"
              color="primary"
              onClick={() => setMobileMenuOpen(true)}
            >
              <MenuIcon />
            </IconButton>
          )}
        </Toolbar>
      </AppBar>

      {/* Mobile Menu */}
      <Drawer
        anchor="right"
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      >
        <Box sx={{ width: 250, pt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
            <IconButton onClick={() => setMobileMenuOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          <List>
            {menuItems.map((item) => (
              <ListItem 
                button 
                key={item.label}
                onClick={() => {
                  item.action();
                  setMobileMenuOpen(false);
                }}
              >
                <ListItemText primary={item.label} />
              </ListItem>
            ))}
            <ListItem button onClick={handleLogin}>
              <ListItemText primary={isAuthenticated ? 'Dashboard' : 'Login'} />
            </ListItem>
            <ListItem button onClick={handleGetStarted}>
              <ListItemText primary={isAuthenticated ? 'Dashboard' : 'Get Started'} />
            </ListItem>
          </List>
        </Box>
      </Drawer>

      {/* Hero Section */}
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Animated background elements */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            pointerEvents: 'none'
          }}
        >
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              style={{
                position: 'absolute',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                fontSize: `${Math.random() * 30 + 20}px`,
              }}
              animate={{
                y: [0, -30, 0],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            >
              {medicalImages[Math.floor(Math.random() * medicalImages.length)]}
            </motion.div>
          ))}
        </Box>

        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
              >
                <Typography
                  variant="h1"
                  sx={{
                    fontSize: { xs: '2.5rem', md: '3.5rem' },
                    fontWeight: 'bold',
                    color: 'white',
                    mb: 2,
                    textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
                  }}
                >
                  AI-Powered
                  <Box component="span" sx={{ 
                    background: 'linear-gradient(45deg, #FFD700, #FFA500)',
                    backgroundClip: 'text',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    display: 'block'
                  }}>
                    Respiratory Diagnosis
                  </Box>
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <Typography
                  variant="h5"
                  sx={{
                    color: 'rgba(255, 255, 255, 0.9)',
                    mb: 4,
                    fontWeight: 300,
                    lineHeight: 1.6
                  }}
                >
                  Advanced deep learning technology for early detection of
                  <strong> Pneumonia, Tuberculosis, and Lung Cancer</strong> from medical scans.
                </Typography>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
              >
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="contained"
                    size="large"
                    onClick={handleGetStarted}
                    endIcon={<ArrowIcon />}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                      '&:hover': {
                        background: 'linear-gradient(45deg, #FF5252, #FF7043)',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 8px 25px rgba(255, 107, 107, 0.3)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
                  </Button>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<PlayIcon />}
                    onClick={() => navigate('/about-public')}
                    sx={{
                      px: 4,
                      py: 1.5,
                      fontSize: '1.1rem',
                      color: 'white',
                      borderColor: 'white',
                      '&:hover': {
                        backgroundColor: 'rgba(255, 255, 255, 0.1)',
                        borderColor: 'white',
                        transform: 'translateY(-2px)'
                      },
                      transition: 'all 0.3s ease'
                    }}
                  >
                    Learn More
                  </Button>
                </Box>
              </motion.div>
            </Grid>

            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                transition={{ duration: 1, delay: 0.6 }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    height: 400
                  }}
                >
                  {/* Animated medical scan visualization */}
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: 'absolute',
                      width: 300,
                      height: 300,
                      border: '2px solid rgba(255, 255, 255, 0.3)',
                      borderRadius: '50%'
                    }}
                  />
                  <motion.div
                    animate={{ rotate: -360 }}
                    transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                    style={{
                      position: 'absolute',
                      width: 250,
                      height: 250,
                      border: '2px solid rgba(255, 255, 255, 0.2)',
                      borderRadius: '50%'
                    }}
                  />
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={currentImageIndex}
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0 }}
                      transition={{ duration: 0.5 }}
                      style={{
                        fontSize: '8rem',
                        textShadow: '0 0 20px rgba(255, 255, 255, 0.5)'
                      }}
                    >
                      {medicalImages[currentImageIndex]}
                    </motion.div>
                  </AnimatePresence>
                </Box>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Stats Section */}
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            {stats.map((stat, index) => (
              <Grid item xs={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography
                      variant="h3"
                      sx={{
                        fontWeight: 'bold',
                        background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                        backgroundClip: 'text',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                        mb: 1
                      }}
                    >
                      {stat.number}
                    </Typography>
                    <Typography variant="h6" color="text.secondary">
                      {stat.label}
                    </Typography>
                  </Box>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box id="features" sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h2"
              sx={{
                textAlign: 'center',
                mb: 6,
                fontWeight: 'bold',
                background: 'linear-gradient(45deg, #333, #666)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}
            >
              Why Choose RespiroAI?
            </Typography>
          </motion.div>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} lg={4} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.05 }}
                >
                  <Card
                    sx={{
                      height: '100%',
                      borderRadius: 4,
                      boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                      }
                    }}
                  >
                    <CardContent sx={{ p: 4, textAlign: 'center' }}>
                      <Box
                        sx={{
                          width: 80,
                          height: 80,
                          borderRadius: '50%',
                          backgroundColor: feature.color,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto 20px',
                          color: 'white',
                          fontSize: '2rem'
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold' }}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body1" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Box
        sx={{
          py: 8,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          textAlign: 'center'
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography variant="h3" sx={{ mb: 3, fontWeight: 'bold' }}>
              Ready to Transform Healthcare?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of healthcare providers using AI to improve patient outcomes
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleGetStarted}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF5252, #FF7043)',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Your Free Trial'}
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box id="contact" sx={{ py: 6, backgroundColor: '#333', color: 'white' }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                RespiroAI
              </Typography>
              <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
                Advanced AI-powered respiratory disease detection system for healthcare providers.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Contact Us
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                Email: khelendra.guptarauniyar@gmail.com<br />
                Phone: +1 (555) 123-4567<br />
                Address: 123 Healthcare Ave, Medical District
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Legal
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Button
                  color="inherit"
                  sx={{ justifyContent: 'flex-start', opacity: 0.8, textTransform: 'none' }}
                  onClick={() => navigate('/privacy-policy')}
                >
                  Privacy Policy
                </Button>
                <Button
                  color="inherit"
                  sx={{ justifyContent: 'flex-start', opacity: 0.8, textTransform: 'none' }}
                  onClick={() => navigate('/terms-of-service')}
                >
                  Terms of Service
                </Button>
                <Button
                  color="inherit"
                  sx={{ justifyContent: 'flex-start', opacity: 0.8, textTransform: 'none' }}
                  onClick={() => navigate('/mit-license')}
                >
                  MIT License
                </Button>
              </Box>
            </Grid>
          </Grid>
          <Box sx={{ textAlign: 'center', mt: 4, pt: 4, borderTop: '1px solid #555' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © 2025 RespiroAI. All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default LandingPage;
