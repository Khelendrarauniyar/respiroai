import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  AppBar,
  Toolbar,
  Divider,
  List,
  ListItem,
  ListItemText,
  Alert
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Gavel as LegalIcon
} from '@mui/icons-material';

const TermsOfService = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Acceptance of Terms",
      content: [
        "By accessing or using RespiroAI services, you agree to be bound by these Terms",
        "If you disagree with any part of these terms, you may not access the service",
        "These terms apply to all visitors, users, and healthcare providers",
        "You must be at least 18 years old or have legal guardian consent to use our services"
      ]
    },
    {
      title: "Service Description",
      content: [
        "RespiroAI provides AI-powered respiratory disease detection from medical images",
        "Our services include analysis of chest X-rays and CT scans for pneumonia, tuberculosis, and lung cancer",
        "Results are provided for healthcare professional review and are not definitive diagnoses",
        "Services are intended to assist, not replace, professional medical judgment"
      ]
    },
    {
      title: "User Responsibilities",
      content: [
        "Provide accurate and complete information when registering",
        "Maintain the confidentiality of your account credentials",
        "Use the service only for legitimate medical purposes",
        "Comply with all applicable laws and regulations",
        "Ensure proper consent for patient data uploads"
      ]
    },
    {
      title: "Medical Disclaimer",
      content: [
        "RespiroAI is a diagnostic aid tool, not a medical device for independent diagnosis",
        "All AI-generated results must be reviewed by qualified healthcare professionals",
        "We do not provide medical advice, diagnosis, or treatment recommendations",
        "Always consult with healthcare providers for medical decisions",
        "Emergency medical situations require immediate professional medical attention"
      ]
    },
    {
      title: "Data and Privacy",
      content: [
        "Medical data is handled in compliance with HIPAA and applicable privacy laws",
        "You retain ownership of your medical data and images",
        "We may use anonymized data for research and service improvement",
        "Data security measures are implemented to protect your information",
        "See our Privacy Policy for detailed information handling practices"
      ]
    },
    {
      title: "Service Availability and Limitations",
      content: [
        "We strive for 99.9% uptime but cannot guarantee uninterrupted service",
        "Scheduled maintenance may temporarily affect service availability",
        "AI models have inherent limitations and may not detect all conditions",
        "Image quality and technical factors may affect analysis accuracy",
        "Service improvements and updates may change functionality"
      ]
    },
    {
      title: "Intellectual Property",
      content: [
        "RespiroAI and related trademarks are our intellectual property",
        "AI models, algorithms, and software are proprietary and protected",
        "You may not reverse engineer, copy, or redistribute our technology",
        "User-generated content remains your property",
        "We respect third-party intellectual property rights"
      ]
    },
    {
      title: "Limitation of Liability",
      content: [
        "RespiroAI provides services 'as is' without warranties of any kind",
        "We are not liable for medical decisions based on our AI analysis",
        "Our liability is limited to the amount paid for services",
        "We are not responsible for indirect, incidental, or consequential damages",
        "Some jurisdictions may not allow limitation of liability"
      ]
    },
    {
      title: "Termination",
      content: [
        "You may terminate your account at any time",
        "We may suspend or terminate accounts for terms violations",
        "Upon termination, your right to use the service ceases immediately",
        "Data retention policies continue to apply after termination",
        "Surviving provisions include liability limitations and dispute resolution"
      ]
    }
  ];

  return (
    <Box>
      {/* Navigation */}
      <AppBar position="static" sx={{ backgroundColor: 'white', color: 'black', boxShadow: 1 }}>
        <Toolbar>
          <Button
            startIcon={<BackIcon />}
            onClick={() => navigate(-1)}
            sx={{ mr: 2 }}
          >
            Back
          </Button>
          <LegalIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Terms of Service
          </Typography>
        </Toolbar>
      </AppBar>

      {/* Header */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          color: 'white',
          py: 6
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="h2" sx={{ textAlign: 'center', mb: 2, fontWeight: 'bold' }}>
            Terms of Service
          </Typography>
          <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
            Legal terms and conditions for using RespiroAI services
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 2, opacity: 0.8 }}>
            Last updated: August 12, 2025
          </Typography>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          {/* Important Notice */}
          <Alert severity="warning" sx={{ mb: 4 }}>
            <Typography variant="body1">
              <strong>Important:</strong> These terms govern your use of RespiroAI's medical AI services. 
              Please read carefully as they contain important information about your rights and obligations, 
              including limitations of liability and dispute resolution procedures.
            </Typography>
          </Alert>

          {/* Introduction */}
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            Terms and Conditions
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            Welcome to RespiroAI. These Terms of Service ("Terms") govern your use of our AI-powered 
            respiratory disease detection platform and related services. By using our services, you 
            enter into a legal agreement with RespiroAI and agree to comply with these terms.
          </Typography>

          <Divider sx={{ my: 4 }} />

          {/* Sections */}
          {sections.map((section, index) => (
            <Box key={index} sx={{ mb: 4 }}>
              <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#2196F3' }}>
                {index + 1}. {section.title}
              </Typography>
              <List>
                {section.content.map((item, itemIndex) => (
                  <ListItem key={itemIndex} sx={{ py: 0.5, pl: 0 }}>
                    <ListItemText 
                      primary={`• ${item}`}
                      primaryTypographyProps={{ variant: 'body1', sx: { lineHeight: 1.6 } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          ))}

          <Divider sx={{ my: 4 }} />

          {/* Governing Law */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#2196F3' }}>
              Governing Law and Dispute Resolution
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              These Terms are governed by the laws of [Your Jurisdiction]. Any disputes arising from 
              these Terms or your use of RespiroAI services will be resolved through:
            </Typography>
            <List>
              <ListItem sx={{ py: 0.5, pl: 0 }}>
                <ListItemText primary="• Initial attempt at good faith negotiation" />
              </ListItem>
              <ListItem sx={{ py: 0.5, pl: 0 }}>
                <ListItemText primary="• Binding arbitration if negotiation fails" />
              </ListItem>
              <ListItem sx={{ py: 0.5, pl: 0 }}>
                <ListItemText primary="• Jurisdiction in [Your Court System] for legal proceedings" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Contact Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#2196F3' }}>
              Contact Information
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              For questions about these Terms of Service, please contact our Legal Department:
            </Typography>
            <Box sx={{ mt: 2, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body1">
                <strong>Legal Department</strong><br />
                Email: khelendra.guptarauniyar@gmail.com<br />
                Phone: +1 (555) 123-4567<br />
                Address: 123 Healthcare Ave, Medical District, City, State 12345
              </Typography>
            </Box>
          </Box>

          {/* Updates to Terms */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#2196F3' }}>
              Updates to These Terms
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              We may update these Terms of Service from time to time to reflect changes in our services, 
              legal requirements, or business practices. We will notify you of material changes by email 
              or through our platform at least 30 days before they take effect. Your continued use of 
              our services after the effective date constitutes acceptance of the updated terms.
            </Typography>
          </Box>

          {/* Medical Disclaimer Box */}
          <Alert severity="error" sx={{ mb: 4 }}>
            <Typography variant="body1">
              <strong>Medical Disclaimer:</strong> RespiroAI is a diagnostic aid tool intended for use 
              by qualified healthcare professionals. It is not a substitute for professional medical 
              judgment, diagnosis, or treatment. Always seek the advice of qualified healthcare providers 
              with questions about medical conditions or treatments.
            </Typography>
          </Alert>

          {/* Action Buttons */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              onClick={() => navigate(-1)}
              sx={{
                px: 4,
                py: 1.5,
                background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2, #0097A7)',
                }
              }}
            >
              I Accept These Terms
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: '#f8f9fa', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © 2025 RespiroAI. These Terms of Service are effective as of August 12, 2025.
        </Typography>
      </Box>
    </Box>
  );
};

export default TermsOfService;
