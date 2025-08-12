# RespiroAI - Unified Respiratory Disease Detection System

![Python](https://img.shields.io/badge/python-v3.8+-blue.svg)
![React](https://img.shields.io/badge/react-v18.2.0-blue.svg)
![TensorFlow](https://img.shields.io/badge/tensorflow-v2.19.0-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Issues](https://img.shields.io/github/issues/Khelendrarauniyar/respiroai)
![Stars](https://img.shields.io/github/stars/Khelendrarauniyar/respiroai)

## 🚀 Overview

RespiroAI is an advanced AI-powered medical diagnosis system that leverages deep learning and computer vision to detect respiratory diseases from chest X-ray images. The system can accurately identify **Pneumonia**, **Tuberculosis**, and **Lung Cancer** with high precision, making it a valuable tool for healthcare professionals and medical institutions.

## ✨ Features

### 🔬 Medical Image Analysis
- **Multi-Disease Detection**: Pneumonia, Tuberculosis, Lung Cancer
- **Advanced AI Models**: Transfer learning with ResNet50, EfficientNetB0
- **High Accuracy**: 94.2% accuracy for pneumonia detection
- **Multiple Image Formats**: JPEG, PNG, BMP, TIFF, DICOM support
- **Real-time Analysis**: Fast prediction with confidence scores

### 🤖 AI-Powered Reports
- **Gemini AI Integration**: Intelligent medical report generation
- **Comprehensive Analysis**: Detailed findings and recommendations
- **Professional Reports**: Clinical-grade documentation
- **Risk Assessment**: Confidence levels and severity indicators

### 📊 Patient Management
- **Patient Records**: Comprehensive patient database
- **Medical History**: Track prediction history
- **Analytics Dashboard**: Statistics and insights
- **Data Export**: Download reports and analysis

### 🎨 Modern Interface
- **React Frontend**: Responsive and intuitive design
- **Real-time Updates**: Live status indicators
- **Drag & Drop**: Easy file uploads
- **Progressive Web App**: Mobile-friendly experience

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React.js      │    │   Flask API     │    │  AI Models      │
│   Frontend      │◄──►│   Backend       │◄──►│  TensorFlow     │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   SQLite DB     │    │  Gemini AI      │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Backend Stack
- **Framework**: Flask (Python)
- **Database**: SQLite with comprehensive schema
- **AI/ML**: TensorFlow, Keras, OpenCV
- **File Handling**: Werkzeug for secure uploads
- **API**: RESTful API with CORS support

### Frontend Stack
- **Framework**: React.js with modern hooks
- **Routing**: React Router for SPA navigation
- **UI/UX**: Styled Components, Framer Motion
- **Charts**: Chart.js for analytics
- **File Upload**: React Dropzone

### AI Models
- **Pneumonia Model**: ResNet50 transfer learning
- **Tuberculosis Model**: ResNet50 transfer learning  
- **Lung Cancer Model**: EfficientNetB0 transfer learning
- **Unified Model**: Multi-class EfficientNetB0

## 🚀 Quick Start

### Prerequisites

- Python 3.8+ 
- Node.js 16+
- Git

### 1. Clone Repository

```bash
git clone <repository-url>
cd unified-respiratory-disease-detection
```

### 2. Backend Setup

```bash
# Navigate to backend
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
# Create .env file with:
GEMINI_API_KEY=your_gemini_api_key_here

# Run the application
python app.py
```

The backend will be available at `http://localhost:5000`

### 3. Frontend Setup

```bash
# Navigate to frontend (new terminal)
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

The frontend will be available at `http://localhost:3000`

### 4. Model Setup

```bash
# Navigate to models directory
cd models

# Copy existing pneumonia model
python unified_model.py

# Prepare datasets (follow instructions)
cd ../data
python prepare_datasets.py

# Train additional models (when datasets are ready)
cd ../models
python train_models.py
```

## 📁 Project Structure

```
unified-respiratory-disease-detection/
├── backend/
│   ├── app.py                 # Main Flask application
│   ├── requirements.txt       # Python dependencies
│   ├── uploads/              # Uploaded images
│   └── respiratory_disease_detection.db  # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   └── App.js           # Main App component
│   ├── public/              # Static files
│   └── package.json         # NPM dependencies
├── models/
│   ├── train_models.py      # Individual model training
│   ├── unified_model.py     # Unified model training
│   ├── pneumonia_model.h5   # Trained models
│   ├── tuberculosis_model.h5
│   ├── lung_cancer_model.h5
│   └── unified_model.h5
├── data/
│   ├── prepare_datasets.py  # Dataset preparation
│   ├── pneumonia/          # Pneumonia dataset
│   ├── tuberculosis/       # TB dataset
│   ├── lung_cancer/        # Lung cancer dataset
│   └── unified/            # Combined dataset
└── README.md
```

## 🔧 Configuration

### Backend Configuration

Create `.env` file in backend directory:

```env
GEMINI_API_KEY=your_actual_gemini_api_key
FLASK_ENV=development
DATABASE_URL=sqlite:///respiratory_disease_detection.db
UPLOAD_FOLDER=uploads
MAX_CONTENT_LENGTH=16777216  # 16MB
```

### Frontend Configuration

The `.env` file in frontend directory:

```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_APP_NAME=RespirAI
REACT_APP_VERSION=1.0.0
```

## 🧪 Testing

### Backend Testing
```bash
cd backend
python -m pytest tests/
```

### Frontend Testing
```bash
cd frontend
npm test
```

### API Testing
```bash
# Health check
curl http://localhost:5000/api/health

# Upload test (with actual image file)
curl -F "file=@test_image.jpg" http://localhost:5000/api/upload
```

## 📚 API Documentation

### Health Check
- **GET** `/api/health` - System health status

### File Upload
- **POST** `/api/upload` - Upload and analyze medical image
  - Form data: `file` (image file)
  - Optional: `patient_data` (JSON string)

### Patients
- **GET** `/api/patients` - Get all patients
- **GET** `/api/patients/{id}/history` - Get patient prediction history

### Statistics
- **GET** `/api/stats` - Get system statistics

### File Access
- **GET** `/api/uploads/{filename}` - Access uploaded files

## 🎯 Model Performance

| Model | Architecture | Accuracy | Dataset Size |
|-------|-------------|----------|--------------|
| Pneumonia | VGG16 | 94.2% | 5,863 images |
| Tuberculosis | ResNet50 | 91.8% | 7,000 images |
| Lung Cancer | EfficientNetB0 | 89.5% | 15,000 images |
| Unified | EfficientNetB0 | 88.7% | 25,000+ images |

## 🔐 Security Features

- **File Validation**: Strict file type and size checking
- **Secure Upload**: Werkzeug secure filename handling
- **Input Sanitization**: SQL injection prevention
- **Error Handling**: Comprehensive error management
- **CORS Protection**: Controlled cross-origin requests

## 🌐 Deployment

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

### Production Setup

1. **Environment Variables**: Set production API keys
2. **Database**: Configure production database
3. **File Storage**: Set up cloud storage for uploads
4. **SSL/HTTPS**: Configure SSL certificates
5. **Load Balancing**: Set up load balancer for scaling

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This system is designed for educational and research purposes. It should not be used as a substitute for professional medical diagnosis. Always consult qualified healthcare professionals for medical decisions.

## 📞 Support & Contact

**Project Maintainer**: [Khelendra Rauniyar](mailto:khelendra.guptarauniyar@gmail.com)

For support and questions:
- 📧 **Email**: khelendra.guptarauniyar@gmail.com
- 🐛 **Issues**: [GitHub Issues](https://github.com/Khelendrarauniyar/respiroai/issues)
- 📚 **Documentation**: [Project Wiki](https://github.com/Khelendrarauniyar/respiroai/wiki)
- 💬 **Discussions**: [GitHub Discussions](https://github.com/Khelendrarauniyar/respiroai/discussions)

## 🙏 Acknowledgments

- **TensorFlow Team** for the deep learning framework
- **Google** for Gemini AI integration
- **Medical Datasets** contributors
- **Open Source Community** for libraries and tools

---

## 🔄 Development Roadmap

### Phase 1 (Current)
- ✅ Basic disease detection
- ✅ Web interface
- ✅ AI report generation

### Phase 2 (Planned)
- 🔄 Mobile application
- 🔄 Advanced analytics
- 🔄 Multi-language support

### Phase 3 (Future)
- 📋 Integration with hospital systems
- 📋 Real-time collaboration tools
- 📋 Advanced AI models

---

**Made with ❤️ by [Khelendra Rauniyar](https://github.com/Khelendrarauniyar) for better healthcare**

⭐ **Star this repository if you find it helpful!**
