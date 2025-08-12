import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

class ApiService {
  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      timeout: 30000, // 30 seconds timeout for file uploads
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.api.interceptors.request.use(
      (config) => {
        console.log(`Making ${config.method?.toUpperCase()} request to ${config.url}`);
        
        // Add auth token if available
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Response interceptor
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('API Error:', error);
        
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout. Please try again.');
        }
        
        if (error.response) {
          // Server responded with error status
          const message = error.response.data?.error || error.response.data?.message || 'Server error';
          throw new Error(message);
        } else if (error.request) {
          // Request was made but no response received
          throw new Error('Unable to connect to server. Please check your connection.');
        } else {
          // Something else happened
          throw new Error('An unexpected error occurred.');
        }
      }
    );
  }

  // Generic HTTP methods
  get(url, config = {}) {
    return this.api.get(url, config);
  }

  post(url, data = {}, config = {}) {
    return this.api.post(url, data, config);
  }

  put(url, data = {}, config = {}) {
    return this.api.put(url, data, config);
  }

  delete(url, config = {}) {
    return this.api.delete(url, config);
  }

  // Health check
  checkHealth() {
    return this.api.get('/health');
  }

  // File upload and prediction
  uploadFile(file, patientData = null) {
    const formData = new FormData();
    formData.append('file', file);
    
    if (patientData) {
      formData.append('patient_data', JSON.stringify(patientData));
    }

    return this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
  }

  // File upload with patient ID (new method for patient selection)
  uploadFileWithPatient(formData) {
    return this.api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        console.log(`Upload progress: ${percentCompleted}%`);
      },
    });
  }

  // Patient management
  getPatients() {
    return this.api.get('/auth/patients');
  }

  registerPatient(patientData) {
    return this.api.post('/auth/patient/register', patientData);
  }

  getPatientById(patientId) {
    return this.api.get(`/auth/patient/${patientId}`);
  }

  updatePatient(patientId, patientData) {
    return this.api.put(`/auth/patient/${patientId}`, patientData);
  }

  deletePatient(patientId) {
    return this.api.delete(`/auth/patient/${patientId}`);
  }

  getPatient(patientId) {
    return this.api.get(`/patients/${patientId}`);
  }

  getPatientHistory(patientId) {
    return this.api.get(`/patients/${patientId}/history`);
  }

  getPatientPredictions(patientId) {
    return this.api.get(`/patients/${patientId}/predictions`);
  }

  deletePrediction(predictionId) {
    return this.api.delete(`/predictions/${predictionId}`);
  }

  // Dashboard and analytics
  getDashboardSummary() {
    return this.api.get('/dashboard/summary');
  }

  getRecentPredictions(limit = 10) {
    return this.api.get(`/predictions/recent?limit=${limit}`);
  }

  // PDF report generation
  generatePdfReport(predictionId) {
    return this.api.get(`/report/pdf/${predictionId}`, {
      responseType: 'blob'
    });
  }

  generateLatestPdfReport(reportData) {
    return this.api.post('/report/pdf/latest', reportData);
  }

  // Analytics
  getAnalytics(timeframe = '7days') {
    return this.api.get(`/analytics?timeframe=${timeframe}`);
  }

  // Statistics
  getStats() {
    return this.api.get('/stats');
  }

  // Get uploaded file
  getUploadedFile(filename) {
    return `${API_BASE_URL}/uploads/${filename}`;
  }

  // Disease information
  getDiseaseInfo() {
    return {
      pneumonia: {
        name: 'Pneumonia',
        description: 'An infection that inflames air sacs in one or both lungs. The air sacs may fill with fluid or pus (purulent material), causing cough with phlegm or pus, fever, chills, and difficulty breathing.',
        symptoms: [
          'Chest pain when breathing or coughing',
          'Confusion or changes in mental awareness',
          'Cough with phlegm or pus',
          'Fatigue',
          'Fever, sweating and shaking chills',
          'Lower than normal body temperature',
          'Nausea, vomiting or diarrhea',
          'Shortness of breath'
        ],
        causes: [
          'Bacteria (most common)',
          'Viruses',
          'Fungi',
          'Other organisms'
        ],
        treatments: [
          'Antibiotics (for bacterial pneumonia)',
          'Antiviral medications (for viral pneumonia)',
          'Antifungal medications (for fungal pneumonia)',
          'Rest and fluids',
          'Over-the-counter medications for fever and pain'
        ],
        prevention: [
          'Get vaccinated',
          'Practice good hygiene',
          'Don\'t smoke',
          'Keep your immune system strong'
        ]
      },
      tuberculosis: {
        name: 'Tuberculosis (TB)',
        description: 'A potentially serious infectious disease that mainly affects the lungs. TB is caused by bacteria that spread from person to person through microscopic droplets released into the air.',
        symptoms: [
          'Coughing for three or more weeks',
          'Coughing up blood or mucus',
          'Chest pain, or pain with breathing or coughing',
          'Unintentional weight loss',
          'Fatigue',
          'Fever',
          'Night sweats',
          'Chills',
          'Loss of appetite'
        ],
        causes: [
          'Mycobacterium tuberculosis bacteria',
          'Spread through airborne droplets',
          'Close contact with infected individuals',
          'Weakened immune system increases risk'
        ],
        treatments: [
          'First-line anti-TB drugs (6-9 months)',
          'Isoniazid, Rifampin, Ethambutol, Pyrazinamide',
          'Directly Observed Treatment (DOT)',
          'Regular monitoring for drug resistance'
        ],
        prevention: [
          'Avoid close contact with TB patients',
          'Good ventilation in living spaces',
          'BCG vaccination (in some countries)',
          'Treatment of latent TB infection'
        ]
      },
      lung_cancer: {
        name: 'Lung Cancer',
        description: 'Cancer that begins in the lungs. It\'s the leading cause of cancer deaths worldwide. Smoking is the primary risk factor, but non-smokers can also develop lung cancer.',
        symptoms: [
          'A new cough that doesn\'t go away',
          'Coughing up blood, even a small amount',
          'Shortness of breath',
          'Chest pain',
          'Hoarseness',
          'Losing weight without trying',
          'Bone pain',
          'Headache'
        ],
        causes: [
          'Smoking (primary cause)',
          'Exposure to secondhand smoke',
          'Exposure to radon gas',
          'Exposure to asbestos and other carcinogens',
          'Family history of lung cancer'
        ],
        treatments: [
          'Surgery (lobectomy, pneumonectomy)',
          'Radiation therapy',
          'Chemotherapy',
          'Targeted drug therapy',
          'Immunotherapy',
          'Palliative care'
        ],
        prevention: [
          'Don\'t smoke or quit smoking',
          'Avoid secondhand smoke',
          'Test home for radon',
          'Avoid carcinogens at work',
          'Eat a diet full of fruits and vegetables',
          'Exercise regularly'
        ]
      },
      normal: {
        name: 'Normal/Healthy',
        description: 'No signs of respiratory disease detected. The chest X-ray or CT scan appears normal without evidence of pneumonia, tuberculosis, or lung cancer.',
        symptoms: [],
        causes: [],
        treatments: [
          'Continue regular health checkups',
          'Maintain healthy lifestyle',
          'Follow preventive measures'
        ],
        prevention: [
          'Regular exercise',
          'Healthy diet',
          'Avoid smoking',
          'Regular health screenings',
          'Good hygiene practices'
        ]
      }
    };
  }

  // Model information
  getModelInfo() {
    return {
      pneumonia: {
        name: 'Pneumonia Detection Model',
        architecture: 'Transfer Learning with VGG16',
        accuracy: '94.2%',
        training_data: '5,863 chest X-ray images',
        classes: ['Normal', 'Pneumonia']
      },
      tuberculosis: {
        name: 'Tuberculosis Detection Model',
        architecture: 'Transfer Learning with ResNet50',
        accuracy: '91.8%',
        training_data: '7,000 chest X-ray images',
        classes: ['Normal', 'Tuberculosis']
      },
      lung_cancer: {
        name: 'Lung Cancer Detection Model',
        architecture: 'Transfer Learning with EfficientNetB0',
        accuracy: '89.5%',
        training_data: '15,000 CT scan images',
        classes: ['Normal', 'Lung Cancer']
      },
      unified: {
        name: 'Unified Disease Detection Model',
        architecture: 'Multi-class EfficientNetB0',
        accuracy: '88.7%',
        training_data: '25,000+ medical images',
        classes: ['Normal', 'Pneumonia', 'Tuberculosis', 'Lung Cancer']
      }
    };
  }
}

export default new ApiService();
