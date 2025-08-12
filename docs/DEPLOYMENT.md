# Deployment Guide

This guide covers various deployment options for the Unified Respiratory Disease Detection System.

## 🚀 Quick Deployment Options

### 1. Docker Compose (Recommended)
### 2. Manual Deployment
### 3. Cloud Deployment (AWS, GCP, Azure)
### 4. Heroku Deployment

---

## 🐳 Docker Deployment

### Prerequisites
- Docker 20.0+
- Docker Compose 2.0+
- 4GB+ RAM
- 10GB+ free disk space

### Quick Start with Docker

```bash
# Clone the repository
git clone https://github.com/yourusername/unified-respiratory-disease-detection.git
cd unified-respiratory-disease-detection

# Build and start services
docker-compose up --build

# Access the application
# Frontend: http://localhost:3000
# Backend API: http://localhost:5000
```

### Docker Compose Configuration

```yaml
# docker-compose.yml
version: '3.8'

services:
  backend:
    build: ./backend
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
      - DATABASE_URL=sqlite:///respiratory_detection.db
    volumes:
      - ./models:/app/models
      - ./uploads:/app/uploads
    restart: unless-stopped

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_API_URL=http://localhost:5000/api
    depends_on:
      - backend
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - frontend
      - backend
    restart: unless-stopped
```

### Production Docker Setup

```dockerfile
# backend/Dockerfile.prod
FROM python:3.9-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app
RUN chown -R app:app /app
USER app

# Expose port
EXPOSE 5000

# Start application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "--workers", "4", "unified_app:app"]
```

---

## 🖥️ Manual Deployment

### Backend Deployment

#### 1. System Requirements
- Ubuntu 20.04+ / CentOS 8+ / Windows Server 2019+
- Python 3.8+
- 4GB+ RAM
- 50GB+ storage

#### 2. Install Dependencies

```bash
# Ubuntu/Debian
sudo apt update
sudo apt install python3 python3-pip python3-venv nginx postgresql

# CentOS/RHEL
sudo yum install python3 python3-pip nginx postgresql-server

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install Python packages
pip install -r requirements.txt
```

#### 3. Configure Environment

```bash
# Create .env file
cat > .env << EOF
FLASK_ENV=production
SECRET_KEY=your-super-secret-key-here
DATABASE_URL=sqlite:///production.db
JWT_SECRET_KEY=your-jwt-secret-key
UPLOAD_FOLDER=/var/www/uploads
MAX_CONTENT_LENGTH=16777216
EOF
```

#### 4. Database Setup

```bash
# Initialize database
python -c "
from unified_app import app
with app.app_context():
    from auth_system import UserAuthSystem
    auth_system = UserAuthSystem(app, 'production.db')
    print('Database initialized successfully')
"
```

#### 5. Create Systemd Service

```ini
# /etc/systemd/system/respiratory-backend.service
[Unit]
Description=Respiratory Disease Detection Backend
After=network.target

[Service]
Type=exec
User=www-data
Group=www-data
WorkingDirectory=/var/www/respiratory-backend
Environment=PATH=/var/www/respiratory-backend/venv/bin
ExecStart=/var/www/respiratory-backend/venv/bin/gunicorn --bind 127.0.0.1:5000 --workers 4 unified_app:app
Restart=always

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable respiratory-backend
sudo systemctl start respiratory-backend
sudo systemctl status respiratory-backend
```

### Frontend Deployment

#### 1. Build React Application

```bash
cd frontend

# Install dependencies
npm install

# Build for production
npm run build

# Copy build files to web server
sudo cp -r build/* /var/www/html/
```

#### 2. Configure Nginx

```nginx
# /etc/nginx/sites-available/respiratory-detection
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:5000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # File uploads
    client_max_body_size 16M;

    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
}
```

```bash
# Enable site
sudo ln -s /etc/nginx/sites-available/respiratory-detection /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## ☁️ Cloud Deployment

### AWS Deployment

#### 1. EC2 Instance Setup

```bash
# Launch EC2 instance (t3.medium or larger)
# Security Group: Allow ports 22, 80, 443, 5000

# Connect to instance
ssh -i your-key.pem ubuntu@your-ec2-ip

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
sudo usermod -aG docker ubuntu
```

#### 2. RDS Database (Optional)

```bash
# Create RDS PostgreSQL instance
# Update environment variables
DATABASE_URL=postgresql://username:password@rds-endpoint:5432/respiratory_db
```

#### 3. S3 Storage (Optional)

```python
# Configure S3 for file storage
import boto3

s3_client = boto3.client('s3')
BUCKET_NAME = 'respiratory-uploads'
```

### Google Cloud Platform

#### 1. Cloud Run Deployment

```yaml
# cloudbuild.yaml
steps:
  # Build backend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/respiratory-backend', './backend']
  
  # Build frontend
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/$PROJECT_ID/respiratory-frontend', './frontend']

  # Push images
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/respiratory-backend']
  
  - name: 'gcr.io/cloud-builders/docker'
    args: ['push', 'gcr.io/$PROJECT_ID/respiratory-frontend']
```

```bash
# Deploy to Cloud Run
gcloud run deploy respiratory-backend \
  --image gcr.io/$PROJECT_ID/respiratory-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated

gcloud run deploy respiratory-frontend \
  --image gcr.io/$PROJECT_ID/respiratory-frontend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated
```

### Azure Deployment

#### 1. Container Instances

```bash
# Create resource group
az group create --name respiratory-rg --location eastus

# Deploy containers
az container create \
  --resource-group respiratory-rg \
  --name respiratory-backend \
  --image your-registry/respiratory-backend \
  --dns-name-label respiratory-api \
  --ports 5000

az container create \
  --resource-group respiratory-rg \
  --name respiratory-frontend \
  --image your-registry/respiratory-frontend \
  --dns-name-label respiratory-app \
  --ports 3000
```

---

## 🚢 Heroku Deployment

### Backend Deployment

#### 1. Prepare for Heroku

```bash
# Create Procfile
echo "web: gunicorn unified_app:app" > Procfile

# Create runtime.txt
echo "python-3.9.18" > runtime.txt

# Create heroku.yml (optional)
cat > heroku.yml << EOF
build:
  docker:
    web: Dockerfile
run:
  web: gunicorn unified_app:app --bind 0.0.0.0:$PORT
EOF
```

#### 2. Deploy to Heroku

```bash
# Install Heroku CLI
curl https://cli-assets.heroku.com/install.sh | sh

# Login and create app
heroku login
heroku create respiratory-backend

# Add PostgreSQL addon
heroku addons:create heroku-postgresql:hobby-dev

# Set environment variables
heroku config:set FLASK_ENV=production
heroku config:set SECRET_KEY=your-secret-key
heroku config:set JWT_SECRET_KEY=your-jwt-secret

# Deploy
git push heroku main

# Run database migrations
heroku run python -c "from unified_app import app; app.create_all()"
```

### Frontend Deployment

#### 1. Build Pack Configuration

```bash
# Create app
heroku create respiratory-frontend

# Set buildpack
heroku buildpacks:set https://github.com/mars/create-react-app-buildpack.git

# Set environment variables
heroku config:set REACT_APP_API_URL=https://respiratory-backend.herokuapp.com/api

# Deploy
git push heroku main
```

---

## 🔒 SSL/HTTPS Setup

### Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo crontab -e
# Add: 0 12 * * * /usr/bin/certbot renew --quiet
```

### Nginx SSL Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Your server configuration...
}

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

---

## 📊 Monitoring & Logging

### Application Monitoring

```python
# Add to unified_app.py
import logging
from logging.handlers import RotatingFileHandler

if not app.debug:
    file_handler = RotatingFileHandler('logs/respiratory.log', maxBytes=10240, backupCount=10)
    file_handler.setFormatter(logging.Formatter(
        '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'
    ))
    file_handler.setLevel(logging.INFO)
    app.logger.addHandler(file_handler)
    app.logger.setLevel(logging.INFO)
```

### Health Check Endpoint

```python
@app.route('/health')
def health_check():
    return {
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'version': '1.0.0',
        'models': {
            'pneumonia': 'loaded' if pneumonia_model else 'not_loaded',
            'tuberculosis': 'loaded' if tb_model else 'not_loaded',
            'lung_cancer': 'loaded' if lung_cancer_model else 'not_loaded'
        }
    }
```

### Log Aggregation

```yaml
# docker-compose.yml
services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.14.0
    environment:
      - discovery.type=single-node
  
  logstash:
    image: docker.elastic.co/logstash/logstash:7.14.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
  
  kibana:
    image: docker.elastic.co/kibana/kibana:7.14.0
    ports:
      - "5601:5601"
```

---

## 🔧 Performance Optimization

### Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_predictions_user_id ON predictions(user_id);
CREATE INDEX idx_predictions_created_at ON predictions(created_at);
CREATE INDEX idx_patients_user_id ON patients(user_id);
```

### Caching

```python
# Add Redis caching
from flask_caching import Cache

cache = Cache(app, config={'CACHE_TYPE': 'redis'})

@cache.memoize(timeout=300)
def get_dashboard_summary(user_id):
    # Cached dashboard data
    pass
```

### Load Balancing

```nginx
# nginx.conf
upstream backend {
    server 127.0.0.1:5000;
    server 127.0.0.1:5001;
    server 127.0.0.1:5002;
}

server {
    location /api {
        proxy_pass http://backend;
    }
}
```

---

## 📋 Deployment Checklist

### Pre-deployment
- [ ] Update environment variables
- [ ] Configure database connections
- [ ] Set up SSL certificates
- [ ] Configure logging
- [ ] Set up monitoring
- [ ] Test all endpoints
- [ ] Run security scans

### Post-deployment
- [ ] Verify all services are running
- [ ] Check application logs
- [ ] Test critical user flows
- [ ] Monitor performance metrics
- [ ] Set up automated backups
- [ ] Configure alerts

### Security Checklist
- [ ] HTTPS enabled
- [ ] Security headers configured
- [ ] Rate limiting implemented
- [ ] Input validation enabled
- [ ] SQL injection protection
- [ ] XSS protection
- [ ] CSRF protection
- [ ] File upload restrictions

---

## 🆘 Troubleshooting

### Common Issues

#### "ModuleNotFoundError"
```bash
# Ensure all dependencies are installed
pip install -r requirements.txt
```

#### "Port already in use"
```bash
# Find and kill process using the port
sudo lsof -i :5000
sudo kill -9 <PID>
```

#### "Permission denied"
```bash
# Fix file permissions
sudo chown -R www-data:www-data /var/www/
sudo chmod -R 755 /var/www/
```

#### Database connection errors
```bash
# Check database status
sudo systemctl status postgresql
# Reset database
rm *.db
python -c "from unified_app import create_app; create_app()"
```

### Log Analysis

```bash
# Backend logs
tail -f logs/respiratory.log

# Nginx logs
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log

# System logs
journalctl -u respiratory-backend -f
```

---

## 📞 Support

For deployment support:
- Check the [troubleshooting section](#troubleshooting)
- Create an issue on GitHub
- Contact the development team

---

**Happy Deploying! 🚀**
