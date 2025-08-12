# Backend Dockerfile
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies for OpenCV, TensorFlow, and other packages
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    libgl1-mesa-glx \
    libglib2.0-0 \
    libsm6 \
    libxext6 \
    libxrender-dev \
    libgomp1 \
    libgfortran5 \
    libhdf5-dev \
    pkg-config \
    libfontconfig1-dev \
    libfreetype6-dev \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .

# Upgrade pip and install dependencies with optimizations
RUN pip install --upgrade pip && \
    pip install --no-cache-dir --no-deps \
    numpy==2.1.3 \
    && pip install --no-cache-dir -r requirements.txt

# Copy application code (excluding models)
COPY app.py .
COPY predict.py .
COPY model.py .
COPY auth_system.py .
COPY auth_routes.py .
COPY templates/ templates/
COPY static/ static/

# Create necessary directories
RUN mkdir -p uploads models logs

# Create non-root user for security
RUN useradd --create-home --shell /bin/bash app && \
    chown -R app:app /app
USER app

# Expose port
EXPOSE 5000

# Set environment variables
ENV FLASK_APP=app.py
ENV FLASK_ENV=production

# Run the application
CMD ["gunicorn", "--bind", "0.0.0.0:5000", "app:app"]
