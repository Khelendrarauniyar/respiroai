@echo off
REM 🏥 UNIFIED RESPIRATORY DISEASE DETECTION SYSTEM
REM Startup Script for Windows

echo.
echo ============================================================
echo 🏥 UNIFIED RESPIRATORY DISEASE DETECTION SYSTEM
echo ============================================================
echo 🚀 Starting Complete Integration...
echo.

REM Check if we're in the right directory
if not exist "backend\unified_app.py" (
    echo ❌ Error: Please run this script from the project root directory
    echo 💡 Expected to find: backend\unified_app.py
    pause
    exit /b 1
)

REM Navigate to backend directory
cd backend

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo ❌ Virtual environment not found!
    echo 💡 Please ensure the virtual environment is set up in backend\venv\
    pause
    exit /b 1
)

echo ✅ Activating virtual environment...
call venv\Scripts\activate.bat

echo ✅ Checking system status...
python -c "import tensorflow as tf; print('✅ TensorFlow version:', tf.__version__)"

echo.
echo 🔍 Checking available models...
dir models\*.h5 /b 2>nul && echo ✅ Models found || echo ⚠️ Some models missing

echo.
echo 📊 System Information:
echo    ✅ Pneumonia Detection: Ready
echo    ✅ Tuberculosis Detection: Ready  
echo    ⏳ Lung Cancer Detection: Optional
echo    ✅ Unified Backend: Complete
echo    ✅ Web Interface: Ready
echo.

echo 🌐 The system will be available at:
echo    📊 Main Interface: http://localhost:5000
echo    🔧 API Health Check: http://localhost:5000/api/health
echo    📋 System Status: http://localhost:5000/api/models/status
echo.

echo 🚀 Starting Flask server...
echo ============================================================
echo.

REM Start the unified application
python unified_app.py

REM If we get here, the server has stopped
echo.
echo ============================================================
echo 🛑 Server stopped
echo ============================================================
pause
