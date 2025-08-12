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
  Alert
} from '@mui/material';
import {
  ArrowBack as BackIcon,
  Code as CodeIcon
} from '@mui/icons-material';

const MITLicense = () => {
  const navigate = useNavigate();

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
          <CodeIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            MIT License
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
            MIT License
          </Typography>
          <Typography variant="h6" sx={{ textAlign: 'center', opacity: 0.9 }}>
            Open Source License for RespiroAI Components
          </Typography>
          <Typography variant="body1" sx={{ textAlign: 'center', mt: 2, opacity: 0.8 }}>
            Copyright © 2025 RespiroAI Team
          </Typography>
        </Container>
      </Box>

      {/* Content */}
      <Container maxWidth="lg" sx={{ py: 6 }}>
        <Paper sx={{ p: 4, borderRadius: 4 }}>
          {/* Introduction */}
          <Typography variant="h4" sx={{ mb: 3, fontWeight: 'bold' }}>
            Open Source License
          </Typography>
          <Typography variant="body1" sx={{ mb: 4, lineHeight: 1.8 }}>
            RespiroAI is committed to contributing to the open source community. Certain components 
            of our platform are released under the MIT License, one of the most permissive and 
            widely-used open source licenses.
          </Typography>

          <Alert severity="info" sx={{ mb: 4 }}>
            <Typography variant="body1">
              <strong>Note:</strong> This license applies to specific open source components of RespiroAI. 
              The core AI models and proprietary algorithms are subject to separate commercial licensing terms.
            </Typography>
          </Alert>

          <Divider sx={{ my: 4 }} />

          {/* MIT License Text */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#2196F3' }}>
              MIT License
            </Typography>
            <Paper 
              sx={{ 
                p: 3, 
                backgroundColor: '#f8f9fa', 
                fontFamily: 'monospace', 
                border: '1px solid #e0e0e0',
                borderRadius: 2
              }}
            >
              <Typography variant="body2" sx={{ lineHeight: 2, whiteSpace: 'pre-line' }}>
{`Copyright (c) 2025 RespiroAI Team

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.`}
              </Typography>
            </Paper>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* What This Means */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#2196F3' }}>
              What This Means
            </Typography>
            
            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#4CAF50' }}>
              You Can:
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              • Use the software for any purpose, including commercial use<br />
              • Modify the source code to fit your needs<br />
              • Distribute copies of the original or modified software<br />
              • Include the software in proprietary applications<br />
              • Sublicense the software under different terms
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#FF9800' }}>
              You Must:
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              • Include the original copyright notice in all copies<br />
              • Include the MIT License text in all copies<br />
              • Not hold the authors liable for any damages
            </Typography>

            <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: '#F44336' }}>
              You Cannot:
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              • Hold the authors or copyright holders liable for damages<br />
              • Use the authors' names to endorse derived products without permission<br />
              • Expect any warranty or guarantee of functionality
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Open Source Components */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#2196F3' }}>
              Open Source Components
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              The following components of RespiroAI are available under the MIT License:
            </Typography>
            
            <Paper sx={{ p: 3, backgroundColor: '#f8f9fa', borderRadius: 2 }}>
              <Typography variant="body1" sx={{ lineHeight: 2 }}>
                • <strong>Frontend UI Components:</strong> React components for medical image upload and display<br />
                • <strong>Data Preprocessing Tools:</strong> Image preprocessing and normalization utilities<br />
                • <strong>API Client Libraries:</strong> JavaScript/Python clients for RespiroAI API<br />
                • <strong>Documentation and Examples:</strong> Integration guides and sample code<br />
                • <strong>Testing Utilities:</strong> Unit tests and integration test frameworks
              </Typography>
            </Paper>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Commercial Components */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#2196F3' }}>
              Commercial/Proprietary Components
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              The following components are proprietary and subject to separate commercial licensing:
            </Typography>
            
            <Alert severity="warning" sx={{ mb: 3 }}>
              <Typography variant="body1">
                These components are <strong>NOT</strong> covered by the MIT License and require 
                separate licensing agreements for commercial use.
              </Typography>
            </Alert>

            <Paper sx={{ p: 3, backgroundColor: '#fff3e0', borderRadius: 2, border: '1px solid #ffcc02' }}>
              <Typography variant="body1" sx={{ lineHeight: 2 }}>
                • <strong>AI Models:</strong> Trained neural networks for disease detection<br />
                • <strong>Core Algorithms:</strong> Proprietary image analysis and classification algorithms<br />
                • <strong>Training Data:</strong> Curated medical imaging datasets<br />
                • <strong>Backend Services:</strong> AI inference engines and processing pipelines<br />
                • <strong>Commercial API:</strong> Production-ready API services and infrastructure
              </Typography>
            </Paper>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Contributing */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 3, fontWeight: 'bold', color: '#2196F3' }}>
              Contributing to Open Source Components
            </Typography>
            <Typography variant="body1" sx={{ mb: 3, lineHeight: 1.8 }}>
              We welcome contributions to our open source components! To contribute:
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.8 }}>
              1. Fork our repository on GitHub<br />
              2. Create a feature branch for your changes<br />
              3. Submit a pull request with a clear description<br />
              4. Ensure your code follows our style guidelines<br />
              5. Include appropriate tests for new features
            </Typography>
          </Box>

          <Divider sx={{ my: 4 }} />

          {/* Contact */}
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" sx={{ mb: 2, fontWeight: 'bold', color: '#2196F3' }}>
              Questions About Licensing?
            </Typography>
            <Typography variant="body1" sx={{ mb: 2, lineHeight: 1.8 }}>
              For questions about licensing, commercial use, or partnerships:
            </Typography>
            <Box sx={{ mt: 2, p: 3, backgroundColor: '#f5f5f5', borderRadius: 2 }}>
              <Typography variant="body1">
                <strong>Licensing Team</strong><br />
                Email: licensing@respiroai.com<br />
                GitHub: https://github.com/respiroai<br />
                Website: https://respiroai.com/developers
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons */}
          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button
              variant="contained"
              onClick={() => navigate(-1)}
              sx={{
                px: 4,
                py: 1.5,
                mr: 2,
                background: 'linear-gradient(45deg, #2196F3, #21CBF3)',
                '&:hover': {
                  background: 'linear-gradient(45deg, #1976D2, #0097A7)',
                }
              }}
            >
              Back to Main Site
            </Button>
            <Button
              variant="outlined"
              onClick={() => window.open('https://github.com/respiroai', '_blank')}
              startIcon={<CodeIcon />}
              sx={{ px: 4, py: 1.5 }}
            >
              View on GitHub
            </Button>
          </Box>
        </Paper>
      </Container>

      {/* Footer */}
      <Box sx={{ py: 4, backgroundColor: '#f8f9fa', textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          © 2025 RespiroAI. Open source components licensed under MIT License.
        </Typography>
      </Box>
    </Box>
  );
};

export default MITLicense;
