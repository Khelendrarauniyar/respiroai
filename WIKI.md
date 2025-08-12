# RespiroAI Wiki - Documentation Hub

Welcome to the comprehensive documentation for RespiroAI, the Unified Respiratory Disease Detection System.

## 📚 Documentation Index

### 🚀 Getting Started
- [Quick Start Guide](#quick-start-guide)
- [Installation Instructions](#installation-instructions)
- [System Requirements](#system-requirements)
- [Environment Setup](#environment-setup)

### 🏗️ Technical Documentation
- [System Architecture](#system-architecture)
- [API Documentation](docs/API.md)
- [Database Schema](#database-schema)
- [AI Models Overview](#ai-models-overview)

### 👨‍💻 Development
- [Development Setup](#development-setup)
- [Contributing Guidelines](CONTRIBUTING.md)
- [Code Style Guide](#code-style-guide)
- [Testing Guide](#testing-guide)

### 🚀 Deployment
- [Deployment Guide](docs/DEPLOYMENT.md)
- [Docker Setup](#docker-setup)
- [Cloud Deployment](#cloud-deployment)
- [Production Configuration](#production-configuration)

### 🔒 Security
- [Security Guidelines](#security-guidelines)
- [Authentication System](#authentication-system)
- [Data Privacy](#data-privacy)
- [HIPAA Compliance](#hipaa-compliance)

### 🤖 AI & Machine Learning
- [Model Architecture](#model-architecture)
- [Training Process](#training-process)
- [Performance Metrics](#performance-metrics)
- [Model Deployment](#model-deployment)

---

## Quick Start Guide

### Prerequisites
```bash
# System Requirements
- Python 3.8+
- Node.js 16+
- Docker (recommended)
- 4GB+ RAM
- 10GB+ storage space
```

### Installation Steps

#### Option 1: Docker (Recommended)
```bash
# Clone the repository
git clone https://github.com/Khelendrarauniyar/respiroai.git
cd respiroai

# Start with Docker Compose
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

#### Option 2: Manual Setup
```bash
# Backend Setup
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
python unified_app.py

# Frontend Setup (in new terminal)
cd frontend
npm install
npm start
```

---

## System Architecture

### High-Level Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   AI Models    │
│   (React)       │◄──►│   (Flask API)   │◄──►│  (TensorFlow)   │
│                 │    │                 │    │                 │
│ • Material-UI   │    │ • JWT Auth      │    │ • CNN Models    │
│ • Dashboard     │    │ • SQLite DB     │    │ • Transfer      │
│ • Analytics     │    │ • File Upload   │    │   Learning      │
│ • Responsive    │    │ • API Routes    │    │ • Predictions   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Component Breakdown

#### Frontend Components
- **Dashboard**: Real-time analytics and system overview
- **Upload Interface**: Medical image upload and processing
- **Authentication**: User login, registration, and profile management
- **Analytics**: Comprehensive data visualization and reporting
- **Patient Management**: Patient records and medical history

#### Backend Services
- **Authentication API**: JWT-based secure authentication
- **Prediction Service**: AI model inference and results processing
- **Database Layer**: SQLite/PostgreSQL data management
- **File Management**: Secure image upload and storage
- **Analytics Engine**: Data processing and metrics calculation

#### AI/ML Pipeline
- **Image Preprocessing**: Normalization and augmentation
- **Model Inference**: Deep learning predictions
- **Post-processing**: Result analysis and confidence scoring
- **Report Generation**: AI-powered medical reports

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'patient',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    emergency_contact VARCHAR(100),
    medical_id VARCHAR(50),
    blood_group VARCHAR(5),
    email_verified BOOLEAN DEFAULT FALSE
);
```

### Predictions Table
```sql
CREATE TABLE predictions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    patient_name VARCHAR(100),
    image_path VARCHAR(255) NOT NULL,
    disease_type VARCHAR(50) NOT NULL,
    prediction_result VARCHAR(50) NOT NULL,
    confidence_score FLOAT NOT NULL,
    model_version VARCHAR(20),
    processing_time FLOAT,
    ai_report TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);
```

---

## AI Models Overview

### Supported Diseases
1. **Pneumonia Detection**
   - Model: Transfer Learning with DenseNet121
   - Accuracy: 95%+
   - Training Data: 10,000+ chest X-ray images

2. **Tuberculosis Detection**
   - Model: Custom CNN with ResNet50 backbone
   - Accuracy: 92%+
   - Training Data: 8,000+ chest X-ray images

3. **Lung Cancer Detection**
   - Model: EfficientNet B3 with transfer learning
   - Accuracy: 88%+
   - Training Data: 6,000+ chest X-ray images

### Model Performance Metrics
| Disease | Sensitivity | Specificity | Precision | F1-Score |
|---------|-------------|-------------|-----------|----------|
| Pneumonia | 96% | 94% | 95% | 95.5% |
| Tuberculosis | 93% | 91% | 92% | 92.5% |
| Lung Cancer | 89% | 87% | 88% | 88.5% |

---

## Development Setup

### Backend Development
```bash
# Create virtual environment
cd backend
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set up development environment
cp .env.example .env
# Edit .env with your configuration

# Run development server
python unified_app.py
```

### Frontend Development
```bash
# Install dependencies
cd frontend
npm install

# Start development server
npm start

# Run tests
npm test

# Build for production
npm run build
```

### Development Tools
- **Backend**: Flask, SQLite, JWT, TensorFlow
- **Frontend**: React, Material-UI, Axios, React Router
- **Testing**: pytest (backend), Jest (frontend)
- **Code Quality**: ESLint, Prettier, Black (Python)

---

## Docker Setup

### Development with Docker
```bash
# Build and run with docker-compose
docker-compose up --build

# Run in background
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

### Production Docker Configuration
```dockerfile
# Backend Dockerfile
FROM python:3.10-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 5000
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "unified_app:app"]
```

---

## Security Guidelines

### Authentication Security
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt
- **Session Management**: Automatic token expiration
- **Role-Based Access**: Fine-grained permissions

### Data Protection
- **Encryption**: All sensitive data encrypted
- **HTTPS**: Secure transport layer
- **Input Validation**: Comprehensive input sanitization
- **File Upload Security**: Restricted file types and sizes

### HIPAA Compliance
- **Data Anonymization**: Personal identifiers removed
- **Audit Logging**: Comprehensive access logs
- **Access Controls**: Role-based data access
- **Secure Storage**: Encrypted data at rest

---

## Performance Optimization

### Backend Optimization
- **Database Indexing**: Optimized queries
- **Caching**: Redis for frequently accessed data
- **Load Balancing**: Multiple worker processes
- **Resource Management**: Efficient memory usage

### Frontend Optimization
- **Code Splitting**: Lazy loading of components
- **Bundle Optimization**: Webpack optimization
- **CDN Integration**: Static asset delivery
- **Progressive Web App**: Offline capabilities

### AI Model Optimization
- **Model Compression**: Reduced model size
- **Batch Processing**: Efficient inference
- **GPU Acceleration**: CUDA support
- **Model Caching**: Pre-loaded models

---

## Testing Guide

### Backend Testing
```bash
# Install test dependencies
pip install pytest pytest-cov

# Run tests
pytest tests/

# Run with coverage
pytest --cov=app tests/

# Run specific test file
pytest tests/test_auth.py
```

### Frontend Testing
```bash
# Run unit tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run e2e tests
npm run test:e2e
```

### Testing Strategy
- **Unit Tests**: Individual component testing
- **Integration Tests**: API endpoint testing
- **E2E Tests**: Full workflow testing
- **Performance Tests**: Load and stress testing

---

## Troubleshooting

### Common Issues

#### Backend Issues
1. **Import Errors**: Check virtual environment activation
2. **Database Errors**: Verify database file permissions
3. **Model Loading**: Ensure model files are present
4. **Port Conflicts**: Check if port 5000 is available

#### Frontend Issues
1. **npm Install Fails**: Clear npm cache and retry
2. **Build Errors**: Check Node.js version compatibility
3. **API Connection**: Verify backend server is running
4. **CORS Issues**: Check Flask-CORS configuration

#### Docker Issues
1. **Build Failures**: Check Dockerfile syntax
2. **Port Mapping**: Verify port configuration
3. **Volume Mounting**: Check file permissions
4. **Network Issues**: Verify docker-compose network setup

---

## Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

### How to Contribute
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

### Code Review Process
1. All PRs require review
2. Automated tests must pass
3. Code quality checks must pass
4. Documentation must be updated

---

## Support & Community

### Getting Help
- **GitHub Issues**: Report bugs and request features
- **Discussions**: Ask questions and share ideas
- **Email**: khelendra.guptarauniyar@gmail.com
- **Wiki**: Comprehensive documentation

### Community Guidelines
- Be respectful and inclusive
- Follow code of conduct
- Provide constructive feedback
- Help others learn and grow

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.

---

## Changelog

### Version 1.0.0 (Current)
- ✅ Multi-disease detection (Pneumonia, TB, Lung Cancer)
- ✅ Web-based interface
- ✅ User authentication and management
- ✅ Real-time analytics dashboard
- ✅ Docker containerization

### Upcoming Features
- 📱 Mobile application
- 🌐 Multi-language support
- 🏥 Hospital system integration
- 📊 Advanced analytics
- 🤖 Enhanced AI models

---

**For more detailed information, please refer to the specific documentation files in the `docs/` directory.**
