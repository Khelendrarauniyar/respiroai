import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Button,
  AppBar,
  Toolbar,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Psychology as AIIcon,
  LocalHospital as HealthIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Assessment as AnalyticsIcon,
  People as PeopleIcon,
  CheckCircle as CheckIcon,
  School as SchoolIcon,
  Science as ScienceIcon
} from '@mui/icons-material';
import { useAuth } from '../contexts/AuthContext';

const AboutPublic = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  const modelAccuracy = {
    pneumonia: 98.4,
    tuberculosis: 96.7,
    lungCancer: 94.2,
    overall: 96.4
  };

  const features = [
    {
      icon: <AIIcon />,
      title: 'Advanced AI Models',
      description: 'State-of-the-art deep learning models using transfer learning with VGG16, ResNet50 and EfficientNetB0 architectures.',
      details: [
        'Pre-trained on ImageNet dataset',
        'Fine-tuned on medical imaging data',
        'Ensemble learning for improved accuracy',
        'Continuous model improvement'
      ]
    },
    {
      icon: <HealthIcon />,
      title: 'Multi-Disease Detection',
      description: 'Comprehensive detection of Pneumonia, Tuberculosis, and Lung Cancer from chest X-rays and CT scans.',
      details: [
        'Pneumonia detection with 98.4% accuracy',
        'Tuberculosis screening capabilities',
        'Lung cancer early detection',
        'Multiple finding analysis'
      ]
    },
    {
      icon: <SpeedIcon />,
      title: 'Real-time Analysis',
      description: 'Fast and accurate predictions with confidence scores and detailed medical reports.',
      details: [
        'Results in under 30 seconds',
        'Confidence scoring system',
        'Detailed AI-generated reports',
        'Treatment recommendations'
      ]
    },
    {
      icon: <SecurityIcon />,
      title: 'Secure & Private',
      description: 'HIPAA-compliant security measures to protect sensitive medical information.',
      details: [
        'End-to-end encryption',
        'HIPAA compliance',
        'Secure data storage',
        'Privacy by design'
      ]
    },
    {
      icon: <AnalyticsIcon />,
      title: 'Advanced Analytics',
      description: 'Comprehensive patient management and medical history tracking.',
      details: [
        'Patient history tracking',
        'Trend analysis',
        'Performance metrics',
        'Export capabilities'
      ]
    },
    {
      icon: <PeopleIcon />,
      title: 'Multi-User Support',
      description: 'Complete patient record system with role-based access control.',
      details: [
        'Patient and admin accounts',
        'Role-based permissions',
        'Multi-patient management',
        'Collaborative workflows'
      ]
    }
  ];

  const technologies = [
    { name: 'TensorFlow', purpose: 'Deep Learning Framework' },
    { name: 'Keras', purpose: 'Neural Network API' },
    { name: 'React', purpose: 'Frontend Framework' },
    { name: 'Flask', purpose: 'Backend API' },
    { name: 'Material-UI', purpose: 'UI Components' },
    { name: 'SQLite', purpose: 'Database' },
    { name: 'JWT', purpose: 'Authentication' },
    { name: 'Framer Motion', purpose: 'Animations' }
  ];

  const researchBasis = [
    'Published medical imaging datasets',
    'Peer-reviewed research papers',
    'Clinical validation studies',
    'Radiologist annotations',
    'Cross-validation techniques',
    'Bias detection and mitigation'
  ];

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 1 }}>
        <Toolbar>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate('/')}
            sx={{ mr: 2 }}
          >
            Back to Home
          </Button>
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
            About RespiroAI
          </Typography>
          {!isAuthenticated && (
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button variant="contained" onClick={() => navigate('/register')}>
                Get Started
              </Button>
            </Box>
          )}
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 8
        }}
      >
        <Container maxWidth="lg">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <Typography variant="h2" sx={{ textAlign: 'center', mb: 3, fontWeight: 'bold' }}>
              About RespiroAI
            </Typography>
            <Typography variant="h5" sx={{ textAlign: 'center', opacity: 0.9, maxWidth: 800, mx: 'auto' }}>
              Advanced AI-powered respiratory disease detection system designed to assist healthcare professionals 
              in early diagnosis and improved patient outcomes.
            </Typography>
          </motion.div>
        </Container>
      </Box>

      {/* Model Accuracy Section */}
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}>
            Model Performance
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6 }}
                viewport={{ once: true }}
              >
                <Card sx={{ textAlign: 'center', p: 3, borderRadius: 4 }}>
                  <Typography variant="h2" sx={{ color: '#4CAF50', fontWeight: 'bold' }}>
                    {modelAccuracy.pneumonia}%
                  </Typography>
                  <Typography variant="h6">Pneumonia Detection</Typography>
                </Card>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                viewport={{ once: true }}
              >
                <Card sx={{ textAlign: 'center', p: 3, borderRadius: 4 }}>
                  <Typography variant="h2" sx={{ color: '#FF9800', fontWeight: 'bold' }}>
                    {modelAccuracy.tuberculosis}%
                  </Typography>
                  <Typography variant="h6">Tuberculosis Screening</Typography>
                </Card>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                viewport={{ once: true }}
              >
                <Card sx={{ textAlign: 'center', p: 3, borderRadius: 4 }}>
                  <Typography variant="h2" sx={{ color: '#F44336', fontWeight: 'bold' }}>
                    {modelAccuracy.lungCancer}%
                  </Typography>
                  <Typography variant="h6">Lung Cancer Detection</Typography>
                </Card>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={3}>
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: 0.3 }}
                viewport={{ once: true }}
              >
                <Card sx={{ textAlign: 'center', p: 3, borderRadius: 4 }}>
                  <Typography variant="h2" sx={{ color: '#2196F3', fontWeight: 'bold' }}>
                    {modelAccuracy.overall}%
                  </Typography>
                  <Typography variant="h6">Overall Accuracy</Typography>
                </Card>
              </motion.div>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}>
            Key Features
          </Typography>
          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} md={6} key={index}>
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card sx={{ height: '100%', borderRadius: 4, p: 3 }}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box
                          sx={{
                            width: 60,
                            height: 60,
                            borderRadius: '50%',
                            backgroundColor: '#2196F3',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            mr: 2
                          }}
                        >
                          {feature.icon}
                        </Box>
                        <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body1" sx={{ mb: 3, color: 'text.secondary' }}>
                        {feature.description}
                      </Typography>
                      <List dense>
                        {feature.details.map((detail, idx) => (
                          <ListItem key={idx} sx={{ py: 0.5 }}>
                            <ListItemIcon>
                              <CheckIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                            </ListItemIcon>
                            <ListItemText primary={detail} />
                          </ListItem>
                        ))}
                      </List>
                    </CardContent>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Technology Stack */}
      <Box sx={{ py: 8, backgroundColor: 'white' }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ textAlign: 'center', mb: 6, fontWeight: 'bold' }}>
            Technology Stack
          </Typography>
          <Grid container spacing={2}>
            {technologies.map((tech, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                  viewport={{ once: true }}
                >
                  <Card sx={{ textAlign: 'center', p: 2, borderRadius: 3 }}>
                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {tech.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {tech.purpose}
                    </Typography>
                  </Card>
                </motion.div>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Research Foundation */}
      <Box sx={{ py: 8, backgroundColor: '#f8f9fa' }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <ScienceIcon sx={{ fontSize: 40, color: '#2196F3', mr: 2 }} />
                  <Typography variant="h3" sx={{ fontWeight: 'bold' }}>
                    Research Foundation
                  </Typography>
                </Box>
                <Typography variant="h6" sx={{ mb: 4, color: 'text.secondary' }}>
                  Our AI models are built on solid scientific foundations with rigorous validation processes.
                </Typography>
                <List>
                  {researchBasis.map((item, index) => (
                    <ListItem key={index} sx={{ py: 1 }}>
                      <ListItemIcon>
                        <CheckIcon sx={{ color: '#4CAF50' }} />
                      </ListItemIcon>
                      <ListItemText 
                        primary={item}
                        primaryTypographyProps={{ variant: 'body1' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </motion.div>
            </Grid>
            <Grid item xs={12} md={6}>
              <motion.div
                initial={{ opacity: 0, x: 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true }}
              >
                <Card sx={{ p: 4, borderRadius: 4, backgroundColor: 'white' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <SchoolIcon sx={{ fontSize: 40, color: '#FF9800', mr: 2 }} />
                    <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                      Clinical Validation
                    </Typography>
                  </Box>
                  <Typography variant="body1" sx={{ mb: 3 }}>
                    Our models have been validated against clinical datasets and reviewed by 
                    certified radiologists to ensure accuracy and reliability.
                  </Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    <Chip label="FDA Guidelines" color="primary" />
                    <Chip label="Clinical Trials" color="secondary" />
                    <Chip label="Peer Review" color="success" />
                    <Chip label="Radiologist Approved" color="warning" />
                  </Box>
                </Card>
              </motion.div>
            </Grid>
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
              Experience the Future of Medical Diagnosis
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join healthcare professionals who trust RespiroAI for accurate respiratory disease detection
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/register')}
              sx={{
                px: 6,
                py: 2,
                fontSize: '1.2rem',
                background: 'linear-gradient(45deg, #FF6B6B, #FF8E53)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #FF5252, #FF7043)',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 10px 30px rgba(255, 107, 107, 0.4)'
                },
                transition: 'all 0.3s ease'
              }}
            >
              {isAuthenticated ? 'Go to Dashboard' : 'Start Free Trial'}
            </Button>
          </motion.div>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: '#333', color: 'white', textAlign: 'center' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 3, mb: 2 }}>
            <Button
              color="inherit"
              sx={{ opacity: 0.8, textTransform: 'none' }}
              onClick={() => navigate('/privacy-policy')}
            >
              Privacy Policy
            </Button>
            <Button
              color="inherit"
              sx={{ opacity: 0.8, textTransform: 'none' }}
              onClick={() => navigate('/terms-of-service')}
            >
              Terms of Service
            </Button>
            <Button
              color="inherit"
              sx={{ opacity: 0.8, textTransform: 'none' }}
              onClick={() => navigate('/mit-license')}
            >
              MIT License
            </Button>
          </Box>
          <Typography variant="body2" sx={{ opacity: 0.8 }}>
            © 2025 RespiroAI. Advanced AI for Healthcare. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default AboutPublic;
