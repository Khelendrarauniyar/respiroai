# API Documentation

This document provides comprehensive API documentation for the Unified Respiratory Disease Detection System.

## Base URL

- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Response Format

All API responses follow this standard format:

```json
{
  "success": true,
  "data": {},
  "message": "Operation successful",
  "timestamp": "2025-08-12T10:30:00Z"
}
```

For errors:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-08-12T10:30:00Z"
}
```

## Authentication Endpoints

### Register User

```http
POST /auth/register
```

**Request Body:**
```json
{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "securepassword",
  "full_name": "John Doe",
  "phone": "+1234567890",
  "date_of_birth": "1990-01-01",
  "gender": "male",
  "address": "123 Main St, City, Country"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

### Login

```http
POST /auth/login
```

**Request Body:**
```json
{
  "username": "johndoe",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "role": "patient"
  }
}
```

### Get Profile

```http
GET /auth/profile
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "username": "johndoe",
    "email": "john@example.com",
    "full_name": "John Doe",
    "phone": "+1234567890",
    "address": "123 Main St",
    "medical_history": "No significant history",
    "statistics": {
      "prediction_count": 5,
      "recent_activity": []
    }
  }
}
```

## Prediction Endpoints

### Predict Disease

```http
POST /predict/{disease_type}
```

**Path Parameters:**
- `disease_type`: `pneumonia`, `tuberculosis`, or `lung_cancer`

**Request Body (multipart/form-data):**
```
image: <file>
patient_name: "John Doe"
patient_age: 45
patient_gender: "male"
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "id": 123,
    "disease": "pneumonia",
    "predicted_class": "pneumonia_bacterial",
    "confidence": 0.87,
    "processing_time": 2.3,
    "image_path": "/uploads/image_123.jpg",
    "created_at": "2025-08-12T10:30:00Z",
    "patient_info": {
      "name": "John Doe",
      "age": 45,
      "gender": "male"
    }
  }
}
```

### Get Predictions

```http
GET /predictions
```

**Query Parameters:**
- `limit` (optional): Number of results (default: 10)
- `offset` (optional): Pagination offset (default: 0)
- `disease_type` (optional): Filter by disease type

**Response:**
```json
{
  "success": true,
  "predictions": [
    {
      "id": 123,
      "disease": "pneumonia",
      "predicted_class": "pneumonia_bacterial",
      "confidence": 0.87,
      "created_at": "2025-08-12T10:30:00Z",
      "patient_name": "John Doe"
    }
  ],
  "total": 50,
  "page": 1,
  "per_page": 10
}
```

### Get Prediction Details

```http
GET /predictions/{prediction_id}
```

**Response:**
```json
{
  "success": true,
  "prediction": {
    "id": 123,
    "disease": "pneumonia",
    "predicted_class": "pneumonia_bacterial",
    "confidence": 0.87,
    "processing_time": 2.3,
    "image_path": "/uploads/image_123.jpg",
    "created_at": "2025-08-12T10:30:00Z",
    "patient_info": {
      "name": "John Doe",
      "age": 45,
      "gender": "male"
    },
    "model_info": {
      "version": "1.0.0",
      "accuracy": 0.942
    }
  }
}
```

## Patient Management

### Create Patient

```http
POST /patients
```

**Request Body:**
```json
{
  "name": "Jane Smith",
  "age": 32,
  "gender": "female",
  "contact": "+1234567890",
  "medical_history": "Asthma",
  "address": "456 Oak St"
}
```

### Get Patients

```http
GET /patients
```

**Response:**
```json
{
  "success": true,
  "patients": [
    {
      "id": 1,
      "name": "Jane Smith",
      "age": 32,
      "gender": "female",
      "contact": "+1234567890",
      "created_at": "2025-08-12T10:30:00Z"
    }
  ]
}
```

### Update Patient

```http
PUT /patients/{patient_id}
```

### Delete Patient

```http
DELETE /patients/{patient_id}
```

## Analytics Endpoints

### Dashboard Summary

```http
GET /dashboard/summary
```

**Response:**
```json
{
  "success": true,
  "summary": {
    "total_patients": 150,
    "total_scans": 523,
    "abnormal_cases": 87,
    "normal_cases": 436,
    "today_scans": 12,
    "disease_breakdown": {
      "pneumonia": 45,
      "tuberculosis": 23,
      "lung_cancer": 19
    },
    "recent_alerts": [
      {
        "patient_name": "John Doe",
        "diagnosis": "Pneumonia",
        "confidence": "87%",
        "date": "2025-08-12"
      }
    ]
  }
}
```

### Analytics Data

```http
GET /analytics
```

**Query Parameters:**
- `timeframe`: `7days`, `30days`, `90days`, `1year`

**Response:**
```json
{
  "success": true,
  "analytics": {
    "total_predictions": 523,
    "average_accuracy": 93.16,
    "disease_distribution": {
      "pneumonia": 45,
      "tuberculosis": 23,
      "lung_cancer": 19
    },
    "daily_predictions": [
      {
        "date": "2025-08-11",
        "count": 15
      },
      {
        "date": "2025-08-12",
        "count": 12
      }
    ],
    "model_performance": {
      "pneumonia": {
        "accuracy": 94.2,
        "status": "✅ Operational"
      },
      "tuberculosis": {
        "accuracy": 93.8,
        "status": "✅ Operational"
      },
      "lung_cancer": {
        "accuracy": 91.5,
        "status": "✅ Operational"
      }
    }
  }
}
```

## Admin Endpoints

### Get All Users

```http
GET /admin/users
```

**Headers:**
```
Authorization: Bearer <admin-token>
```

### Update User Role

```http
PUT /admin/users/{user_id}/role
```

**Request Body:**
```json
{
  "role": "admin"
}
```

### System Settings

```http
GET /admin/settings
POST /admin/settings
```

## Report Generation

### Generate PDF Report

```http
GET /report/pdf/{prediction_id}
```

**Response:** PDF file download

### Generate Summary Report

```http
POST /report/summary
```

**Request Body:**
```json
{
  "start_date": "2025-08-01",
  "end_date": "2025-08-12",
  "include_charts": true
}
```

## File Upload

### Upload Image

```http
POST /upload
```

**Request Body (multipart/form-data):**
```
file: <image-file>
type: "xray"
```

**Response:**
```json
{
  "success": true,
  "file_path": "/uploads/xray_20250812_103000.jpg",
  "file_size": 1024567,
  "mime_type": "image/jpeg"
}
```

## Error Codes

| Code | Description |
|------|-------------|
| `AUTH_REQUIRED` | Authentication required |
| `INVALID_TOKEN` | Invalid or expired token |
| `INSUFFICIENT_PERMISSIONS` | User lacks required permissions |
| `VALIDATION_ERROR` | Request validation failed |
| `MODEL_ERROR` | AI model prediction error |
| `FILE_ERROR` | File upload/processing error |
| `DATABASE_ERROR` | Database operation error |
| `RATE_LIMIT_EXCEEDED` | Too many requests |

## Rate Limiting

- **General endpoints**: 100 requests per minute
- **Prediction endpoints**: 20 requests per minute
- **Upload endpoints**: 10 requests per minute

## WebSocket Events

### Real-time Predictions

```javascript
// Connect to WebSocket
const socket = io('http://localhost:5000');

// Listen for prediction updates
socket.on('prediction_complete', (data) => {
  console.log('New prediction:', data);
});

// Listen for system alerts
socket.on('system_alert', (alert) => {
  console.log('System alert:', alert);
});
```

## SDK Examples

### Python SDK

```python
import requests

class RespiratoryAPI:
    def __init__(self, base_url, token):
        self.base_url = base_url
        self.headers = {'Authorization': f'Bearer {token}'}
    
    def predict_pneumonia(self, image_path):
        with open(image_path, 'rb') as f:
            files = {'image': f}
            response = requests.post(
                f'{self.base_url}/predict/pneumonia',
                files=files,
                headers=self.headers
            )
        return response.json()

# Usage
api = RespiratoryAPI('http://localhost:5000/api', 'your-token')
result = api.predict_pneumonia('xray.jpg')
```

### JavaScript SDK

```javascript
class RespiratoryAPI {
  constructor(baseUrl, token) {
    this.baseUrl = baseUrl;
    this.token = token;
  }

  async predictPneumonia(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await fetch(`${this.baseUrl}/predict/pneumonia`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.token}`
      },
      body: formData
    });

    return response.json();
  }
}

// Usage
const api = new RespiratoryAPI('http://localhost:5000/api', 'your-token');
const result = await api.predictPneumonia(imageFile);
```

## Changelog

### v1.0.0 (2025-08-12)
- Initial API release
- Basic disease prediction endpoints
- User authentication and management
- Dashboard analytics
- PDF report generation
