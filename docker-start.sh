#!/bin/bash

# Quick Docker Setup Script for Unified Respiratory Disease Detection

echo "🚀 Starting Unified Respiratory Disease Detection System..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Environment Configuration
FLASK_ENV=production
GEMINI_API_KEY=your_gemini_api_key_here

# Database Configuration
DATABASE_URL=sqlite:///respiratory_detection.db

# Security Keys (Change these in production!)
SECRET_KEY=$(openssl rand -hex 32)
JWT_SECRET_KEY=$(openssl rand -hex 32)

# File Upload Settings
MAX_CONTENT_LENGTH=16777216
UPLOAD_FOLDER=uploads
EOF
    echo "✅ Created .env file. Please update GEMINI_API_KEY if needed."
fi

# Create models directory if it doesn't exist
if [ ! -d "models" ]; then
    echo "📁 Creating models directory..."
    mkdir -p models
    echo "⚠️  Please add your trained model files (.h5) to the models/ directory"
fi

# Build and start services
echo "🔨 Building Docker images..."
docker-compose build

echo "🚀 Starting services..."
docker-compose up -d

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 10

# Check if services are running
if docker-compose ps | grep -q "Up"; then
    echo "✅ Services are running!"
    echo ""
    echo "🌐 Access the application:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend API: http://localhost:5000"
    echo ""
    echo "📋 Useful commands:"
    echo "   View logs: docker-compose logs -f"
    echo "   Stop services: docker-compose down"
    echo "   Restart: docker-compose restart"
    echo ""
else
    echo "❌ Some services failed to start. Check logs with: docker-compose logs"
fi
