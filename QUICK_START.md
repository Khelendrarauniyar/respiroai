# 🚀 QUICK START GUIDE

This guide will get your Unified Respiratory Disease Detection System running in under 5 minutes!

## Prerequisites ✅

- Python 3.8+ installed
- Node.js 16+ installed
- Git (optional)

## 1️⃣ Instant Setup (Automated)

### Windows:
```bash
# Navigate to project directory
cd unified-respiratory-disease-detection

# Run automated setup
start_all.bat
```

### Linux/Mac:
```bash
# Navigate to project directory
cd unified-respiratory-disease-detection

# Make executable and run
chmod +x start_all.sh
./start_all.sh
```

## 2️⃣ Manual Setup (If automated fails)

### Backend Setup:
```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate environment
# Windows:
venv\Scripts\activate
# Linux/Mac:
source venv/bin/activate

# Install dependencies
pip install flask flask-cors sqlite3 pillow numpy tensorflow>=2.13.0 requests python-dotenv google-generativeai

# Start backend
python app.py
```

### Frontend Setup (In new terminal):
```bash
cd frontend

# Install dependencies
npm install

# Start frontend
npm start
```

## 3️⃣ Create Demo Data

```bash
cd backend
python demo.py
```

## 4️⃣ Access Your System

🌐 **Frontend**: http://localhost:3000
🔧 **Backend API**: http://localhost:5000
📊 **Health Check**: http://localhost:5000/api/health

## 5️⃣ First Steps

1. **Dashboard**: View analytics and system overview
2. **Upload**: Try uploading a chest X-ray image
3. **Patients**: Browse patient records
4. **About**: Learn about the technology

## 🎯 Key Features to Test

- **Multi-Disease Detection**: Upload images to detect pneumonia, TB, lung cancer
- **AI Reports**: Get detailed medical analysis with Gemini AI
- **Patient Management**: Add and track patients
- **Real-time Analytics**: View statistics and trends
- **Modern Interface**: Responsive design with drag-and-drop upload

## 🔧 Configuration

### Gemini AI (Optional but Recommended):
1. Get API key from Google AI Studio
2. Add to `backend/.env`:
```
GEMINI_API_KEY=your_api_key_here
```

### Custom Models:
- Place trained models in `backend/models/`
- Supported formats: `.h5`, `.keras`

## 📱 Mobile Ready

The interface is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🆘 Troubleshooting

### Port Already in Use:
```bash
# Change frontend port
cd frontend
npm start -- --port 3001

# Change backend port
cd backend
# Edit app.py, change: app.run(debug=True, port=5001)
```

### TensorFlow Issues:
```bash
# Install CPU-only version
pip install tensorflow-cpu

# Or use conda
conda install tensorflow
```

### Missing Dependencies:
```bash
# Reinstall all requirements
pip install -r requirements.txt
```

## 🎉 You're Ready!

Your advanced medical AI system is now running. Start by exploring the dashboard and uploading sample medical images to see the AI in action!

## 📞 Need Help?

- Check the main README.md for detailed documentation
- View PROJECT_SUMMARY.md for technical details
- All configuration files are commented with instructions
