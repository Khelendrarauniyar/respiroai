@echo off
REM Quick Docker Setup Script for Unified Respiratory Disease Detection (Windows)

echo 🚀 Starting Unified Respiratory Disease Detection System...

REM Check if Docker is installed
docker --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker is not installed. Please install Docker Desktop first.
    pause
    exit /b 1
)

REM Check if Docker Compose is installed
docker-compose --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Docker Compose is not installed. Please install Docker Compose first.
    pause
    exit /b 1
)

REM Create .env file if it doesn't exist
if not exist .env (
    echo 📝 Creating .env file...
    (
        echo # Environment Configuration
        echo FLASK_ENV=production
        echo GEMINI_API_KEY=your_gemini_api_key_here
        echo.
        echo # Database Configuration
        echo DATABASE_URL=sqlite:///respiratory_detection.db
        echo.
        echo # Security Keys ^(Change these in production!^)
        echo SECRET_KEY=your_secret_key_here_change_in_production
        echo JWT_SECRET_KEY=your_jwt_secret_key_here_change_in_production
        echo.
        echo # File Upload Settings
        echo MAX_CONTENT_LENGTH=16777216
        echo UPLOAD_FOLDER=uploads
    ) > .env
    echo ✅ Created .env file. Please update GEMINI_API_KEY if needed.
)

REM Create models directory if it doesn't exist
if not exist models (
    echo 📁 Creating models directory...
    mkdir models
    echo ⚠️  Please add your trained model files ^(.h5^) to the models\ directory
)

REM Build and start services
echo 🔨 Building Docker images...
docker-compose build

echo 🚀 Starting services...
docker-compose up -d

REM Wait for services to be ready
echo ⏳ Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check if services are running
docker-compose ps | findstr "Up" >nul
if %errorlevel% equ 0 (
    echo ✅ Services are running!
    echo.
    echo 🌐 Access the application:
    echo    Frontend: http://localhost:3000
    echo    Backend API: http://localhost:5000
    echo.
    echo 📋 Useful commands:
    echo    View logs: docker-compose logs -f
    echo    Stop services: docker-compose down
    echo    Restart: docker-compose restart
    echo.
) else (
    echo ❌ Some services failed to start. Check logs with: docker-compose logs
)

pause
