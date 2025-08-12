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
  ListItemText
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Security as SecurityIcon
} from '@mui/icons-material';

const PrivacyPolicy = () => {
  const navigate = useNavigate();

  const sections = [
    {
      title: "Information We Collect",
      content: [
        "Personal information (name, email, contact details) when you register",
        "Medical information uploaded for analysis (chest X-rays, CT scans)",
        "Usage data and analytics to improve our services",
        "Technical data (IP address, browser type, device information)"
      ]
    },
    {
      title: "How We Use Your Information",
      content: [
        "Provide AI-powered medical image analysis services",
        "Maintain and improve our diagnostic algorithms",
        "Communicate with you about your account and services",
        "Ensure system security and prevent fraud",
        "Comply with legal and regulatory requirements"
      ]
    },
    {
      title: "Data Protection and Security",
      content: [
        "All medical data is encrypted in transit and at rest",
        "HIPAA-compliant security measures and protocols",
        "Regular security audits and vulnerability assessments",
        "Access controls and authentication mechanisms",
        "Data backup and disaster recovery procedures"
      ]
    },
    {
      title: "Data Sharing and Disclosure",
      content: [
        "We do not sell or rent your personal information to third parties",
        "Medical data may be shared with healthcare providers with your consent",
        "Anonymized data may be used for research and algorithm improvement",
        "We may disclose information when required by law or court order",
        "Emergency situations where disclosure may prevent harm"
      ]
    },
    {
      title: "Your Rights and Choices",
      content: [
        "Access and review your personal information",
        "Request correction of inaccurate data",
        "Delete your account and associated data",
        "Export your medical data in a portable format",
        "Opt-out of non-essential communications"
      ]
    },
    {
      title: "Data Retention",
      content: [
        "Medical images are retained for 7 years as per medical standards",
        "Account information is kept while your account is active",
        "Usage logs are retained for 2 years for security purposes",
        "Anonymized research data may be retained indefinitely",
        "You can request early deletion of your data"
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
          <SecurityIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            Privacy Policy
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
            Privacy Policy
          </Typography>
          <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
            Your privacy and data security are our top priorities
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 2, opacity: 0.8 }}>
            Last updated: August 12, 2025
          </Typography>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          {/* Introduction */}
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            Our Commitment to Privacy
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            RespiroAI is committed to protecting the privacy and security of your personal and medical information. 
            This Privacy Policy explains how we collect, use, store, and protect your information when you use our 
            AI-powered respiratory disease detection services. We comply with HIPAA, GDPR, and other applicable 
            privacy regulations to ensure the highest standards of data protection.
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

          {/* HIPAA Compliance */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#2196F3' }}>
              HIPAA Compliance
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              As a healthcare technology provider, RespiroAI is committed to full HIPAA compliance:
            </Typography>
            <List>
              <ListItem sx={{ py: 0.5, pl: 0 }}>
                <ListItemText primary="• All staff undergo HIPAA training and certification" />
              </ListItem>
              <ListItem sx={{ py: 0.5, pl: 0 }}>
                <ListItemText primary="• Business Associate Agreements with healthcare partners" />
              </ListItem>
              <ListItem sx={{ py: 0.5, pl: 0 }}>
                <ListItemText primary="• Regular compliance audits and risk assessments" />
              </ListItem>
              <ListItem sx={{ py: 0.5, pl: 0 }}>
                <ListItemText primary="• Secure breach notification procedures" />
              </ListItem>
            </List>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Contact Information */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#2196F3' }}>
              Contact Us About Privacy
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              If you have questions about this Privacy Policy or our data practices, please contact our 
              Privacy Officer:
            </Typography>
            <Box sx={{ mt: 2, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body1">
                <strong>Privacy Officer</strong><br />
                Email: privacy@respiroai.com<br />
                Phone: +1 (555) 123-4567<br />
                Address: 123 Healthcare Ave, Medical District, City, State 12345
              </Typography>
            </Box>
          </Box>

          {/* Policy Updates */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#2196F3' }}>
              Policy Updates
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              We may update this Privacy Policy from time to time to reflect changes in our practices or 
              legal requirements. We will notify you of any material changes by email or through our platform. 
              Your continued use of our services after such notifications constitutes acceptance of the updated policy.
            </Typography>
          </Box>

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
              I Understand
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: '#f8f9fa', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © 2025 RespiroAI. This Privacy Policy is effective as of August 12, 2025.
        </Typography>
      </Box>
    </Box>
  );
};

export default PrivacyPolicy;
