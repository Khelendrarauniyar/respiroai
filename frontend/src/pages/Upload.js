import React, { useState, useCallback, useEffect } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { 
  FiUpload, 
  FiX, 
  FiUser, 
  FiCalendar, 
  FiPhone,
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiDownload,
  FiPlus
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';
import './Upload.css';

const Upload = () => {
  const navigate = useNavigate();
  const { makeAuthenticatedRequest } = useAuth();
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [results, setResults] = useState(null);
  const [patients, setPatients] = useState([]);
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [loadingPatients, setLoadingPatients] = useState(true);

  useEffect(() => {
    loadUserPatients();
  }, []);

  const loadUserPatients = async () => {
    try {
      setLoadingPatients(true);
      const response = await makeAuthenticatedRequest('/auth/patients');
      
      if (response && response.ok) {
        const data = await response.json();
        if (data.success) {
          setPatients(data.patients);
          if (data.patients.length === 1) {
            // Auto-select if only one patient
            setSelectedPatientId(data.patients[0].id.toString());
          }
        } else {
          console.error('Failed to load patients:', data.error);
        }
      }
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Failed to load patients');
    } finally {
      setLoadingPatients(false);
    }
  };

  const onDrop = useCallback((acceptedFiles, rejectedFiles) => {
    // Handle rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach(rejection => {
        const { file, errors } = rejection;
        errors.forEach(error => {
          if (error.code === 'file-too-large') {
            toast.error(`File ${file.name} is too large. Maximum size is 16MB.`);
          } else if (error.code === 'file-invalid-type') {
            toast.error(`File ${file.name} has an invalid type. Only images are allowed.`);
          } else {
            toast.error(`Error with file ${file.name}: ${error.message}`);
          }
        });
      });
    }

    // Handle accepted files
    const newFiles = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      preview: URL.createObjectURL(file)
    }));

    setFiles(prev => [...prev, ...newFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.bmp', '.tiff', '.dcm']
    },
    maxSize: 16 * 1024 * 1024, // 16MB
    multiple: false
  });

  const removeFile = (fileId) => {
    setFiles(prev => {
      const updatedFiles = prev.filter(f => f.id !== fileId);
      // Clean up object URLs
      const fileToRemove = prev.find(f => f.id === fileId);
      if (fileToRemove) {
        URL.revokeObjectURL(fileToRemove.preview);
      }
      return updatedFiles;
    });
  };

  const handleAnalyze = async () => {
    if (files.length === 0) {
      toast.error('Please select an image to analyze');
      return;
    }

    if (!selectedPatientId) {
      toast.error('Please select a patient for this analysis');
      return;
    }

    const file = files[0];

    try {
      setUploading(true);
      setResults(null);

      // Create FormData with file and patient_id
      const formData = new FormData();
      formData.append('file', file.file);
      formData.append('patient_id', selectedPatientId);

      const response = await ApiService.uploadFileWithPatient(formData);

      console.log('🔍 API Response:', response);
      console.log('🔍 Response Data:', response.data);
      // Backend returns { success: true, data: { prediction: {...}, medical_report: {...} } }
      // So we need to access response.data.data for the actual data
      setResults(response.data.data);
      console.log('🔬 Results after setting:', response.data.data);
      console.log('🔬 Prediction object:', response.data.data?.prediction);
      toast.success('Image analyzed successfully!');
      
      // Clear files after successful analysis
      files.forEach(f => URL.revokeObjectURL(f.preview));
      setFiles([]);
      
    } catch (error) {
      toast.error(error.message || 'Failed to analyze image');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadPdfReport = async () => {
    if (!results) return;
    
    try {
      setDownloading(true);
      
      const reportData = {
        prediction: results.prediction,
        medical_report: results.medical_report,
        patient: results.patient
      };
      
      const response = await ApiService.generateLatestPdfReport(reportData);
      
      if (response.data.success) {
        // Convert base64 to blob and download
        const byteCharacters = atob(response.data.pdf_data);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
          byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/pdf' });
        
        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = response.data.filename;
        document.body.appendChild(link);
        link.click();
        
        // Cleanup
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
        
        toast.success('PDF report downloaded successfully!');
      } else {
        throw new Error('Failed to generate PDF report');
      }
    } catch (error) {
      console.error('PDF download error:', error);
      toast.error('Failed to download PDF report. Please try again.');
    } finally {
      setDownloading(false);
    }
  };

  const getPredictionSeverity = (disease, confidence) => {
    if (disease === 'normal') return 'healthy';
    if (confidence > 0.8) return 'high';
    if (confidence > 0.6) return 'medium';
    return 'low';
  };

  const getDiseaseColor = (disease) => {
    const colors = {
      normal: '#10b981',
      pneumonia: '#f59e0b',
      tuberculosis: '#ef4444',
      lung_cancer: '#8b5cf6',
      lung_cancer_benign: '#fbbf24', // Amber for benign
      lung_cancer_malignant: '#dc2626', // Red for malignant
      // Legacy support
      'lung cancer': '#8b5cf6',
      'lung cancer benign': '#fbbf24',
      'lung cancer malignant': '#dc2626'
    };
    return colors[disease] || '#6b7280';
  };

  const getDiseaseDisplayName = (disease) => {
    if (!disease) return 'Unknown';
    if (disease === 'normal') return 'Normal (Healthy)';
    
    const displayNames = {
      pneumonia: 'Pneumonia',
      tuberculosis: 'Tuberculosis',
      lung_cancer: 'Lung Cancer',
      lung_cancer_benign: 'Lung Cancer (Benign)',
      lung_cancer_malignant: 'Lung Cancer (Malignant)',
      // Legacy support
      'lung cancer': 'Lung Cancer',
      'lung cancer benign': 'Lung Cancer (Benign)',
      'lung cancer malignant': 'Lung Cancer (Malignant)'
    };
    
    return displayNames[disease] || disease.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getConfidencePercentage = (confidence) => {
    return confidence ? (confidence * 100).toFixed(1) : '0.0';
  };

  return (
    <div className="upload-page">
      <div className="upload-container">
        {/* Header */}
        <div className="upload-header">
          <h1>Medical Image Analysis</h1>
          <p>Upload chest X-ray or CT scan images for AI-powered disease detection</p>
        </div>

        {!results ? (
          <motion.div 
            className="upload-form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* File Upload Area */}
            <div className="upload-section">
              <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''} ${files.length > 0 ? 'has-files' : ''}`}
              >
                <input {...getInputProps()} />
                <div className="dropzone-content">
                  <FiUpload className="upload-icon" />
                  {isDragActive ? (
                    <p>Drop the image here...</p>
                  ) : (
                    <>
                      <p>Drag and drop an image here, or <span>click to browse</span></p>
                      <div className="file-info">
                        <span>Supported formats: JPEG, PNG, BMP, TIFF, DICOM</span>
                        <span>Maximum file size: 16MB</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* File Preview */}
              <AnimatePresence>
                {files.map(fileObj => (
                  <motion.div
                    key={fileObj.id}
                    className="file-preview"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.8 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="preview-image">
                      <img src={fileObj.preview} alt="Preview" />
                    </div>
                    <div className="file-details">
                      <h4>{fileObj.file.name}</h4>
                      <p>Size: {(fileObj.file.size / 1024 / 1024).toFixed(2)} MB</p>
                      <p>Type: {fileObj.file.type}</p>
                    </div>
                    <button
                      onClick={() => removeFile(fileObj.id)}
                      className="remove-file"
                    >
                      <FiX />
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Patient Selection */}
            <div className="patient-section">
              <div className="section-header">
                <h3>Select Patient</h3>
                <p>Choose which patient this scan is for (required)</p>
              </div>

              {loadingPatients ? (
                <div className="loading-patients">
                  <div className="loading-spinner small"></div>
                  Loading patients...
                </div>
              ) : patients.length === 0 ? (
                <div className="no-patients">
                  <p>No patients found. Please register a patient first.</p>
                  <button 
                    className="btn btn-primary"
                    onClick={() => navigate('/patient-registration')}
                  >
                    <FiPlus />
                    Register Patient
                  </button>
                </div>
              ) : (
                <div className="patient-selection">
                  <select
                    value={selectedPatientId}
                    onChange={(e) => setSelectedPatientId(e.target.value)}
                    className="patient-select"
                    required
                  >
                    <option value="">Select a patient...</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} - {patient.age} years, {patient.gender}
                      </option>
                    ))}
                  </select>
                  
                  {selectedPatientId && (
                    <div className="selected-patient-info">
                      {(() => {
                        const patient = patients.find(p => p.id.toString() === selectedPatientId);
                        return patient ? (
                          <div className="patient-details">
                            <FiUser />
                            <span>{patient.name}, {patient.age} years, {patient.gender}</span>
                            {patient.contact && <span>Contact: {patient.contact}</span>}
                          </div>
                        ) : null;
                      })()}
                    </div>
                  )}
                  
                  <button 
                    className="btn btn-secondary add-patient-btn"
                    onClick={() => navigate('/patient-registration')}
                  >
                    <FiPlus />
                    Add New Patient
                  </button>
                </div>
              )}
            </div>

            {/* Analyze Button */}
            <div className="analyze-section">
              <button
                onClick={handleAnalyze}
                disabled={files.length === 0 || uploading || !selectedPatientId}
                className={`analyze-btn ${uploading ? 'loading' : ''} ${!selectedPatientId ? 'disabled' : ''}`}
              >
                {uploading ? (
                  <>
                    <div className="loading-spinner small"></div>
                    Analyzing...
                  </>
                ) : (
                  <>
                    <FiFileText />
                    {!selectedPatientId ? 'Select Patient to Analyze' : 'Analyze Image'}
                  </>
                )}
              </button>
              
              {!selectedPatientId && files.length > 0 && (
                <p className="validation-message">
                  Please select a patient before analyzing the image
                </p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            className="results-section"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Results Header */}
            <div className="results-header">
              <div className="result-status">
                {results.prediction?.primary_diagnosis === 'normal' ? (
                  <FiCheckCircle className="status-icon healthy" />
                ) : (
                  <FiAlertCircle className="status-icon warning" />
                )}
                <div className="status-text">
                  <h2>Analysis Complete</h2>
                  <p>
                    {results.prediction?.primary_diagnosis === 'normal' 
                      ? 'No concerning findings detected - Chest appears healthy'
                      : `${getDiseaseDisplayName(results.prediction?.primary_diagnosis)} detected`
                    }
                  </p>
                </div>
              </div>
              <div className="result-confidence">
                <div className="confidence-score">
                  <span className="score">{getConfidencePercentage(results.prediction?.confidence)}%</span>
                  <span className="label">Confidence</span>
                </div>
              </div>
            </div>

            {/* Primary Prediction */}
            <div className="primary-prediction">
              <div className="prediction-card main">
                <div className="prediction-header">
                  <h3>Primary Diagnosis</h3>
                  <div 
                    className={`severity-badge ${getPredictionSeverity(results.prediction?.primary_diagnosis, results.prediction?.confidence)}`}
                  >
                    {results.prediction?.primary_diagnosis === 'normal' ? 'Healthy' : 'Detected'}
                  </div>
                </div>
                <div className="prediction-content">
                  <div className="disease-name">
                    {results.prediction?.primary_diagnosis === 'normal' 
                      ? 'Normal Chest X-ray' 
                      : (results.medical_report?.diagnosis || getDiseaseDisplayName(results.prediction?.primary_diagnosis))
                    }
                  </div>
                  <div className="confidence-bar">
                    <div 
                      className="confidence-fill"
                      style={{ 
                        width: `${getConfidencePercentage(results.prediction?.confidence)}%`,
                        backgroundColor: getDiseaseColor(results.prediction?.primary_diagnosis)
                      }}
                    ></div>
                  </div>
                  <div className="confidence-text">
                    {getConfidencePercentage(results.prediction?.confidence)}% confidence
                  </div>
                  
                  {/* Additional info for normal cases */}
                  {results.prediction?.primary_diagnosis === 'normal' && (
                    <div className="normal-info">
                      <p>✅ No signs of pneumonia, tuberculosis, or lung cancer detected</p>
                      <p>📊 All disease models show normal results</p>
                      <p>🔍 Image quality: {results.prediction?.image_quality?.toFixed(1) || 'Good'}/100</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* All Predictions */}
            {results.prediction?.all_predictions && (
              <div className="all-predictions">
                <h3>Detailed Analysis</h3>
                <div className="predictions-grid">
                  {Object.entries(results.prediction.all_predictions).map(([disease, prediction]) => {
                    // Determine if disease is detected and get proper confidence
                    const isDetected = prediction !== 'normal' && prediction !== 'error';
                    const confidence = results.prediction.confidence_scores?.[disease] || 0;
                    const displayText = isDetected ? 'DETECTED' : 'NORMAL';
                    const displayColor = isDetected ? getDiseaseColor(disease) : '#4ade80'; // Green for normal
                    
                    return (
                      <div key={disease} className="prediction-item">
                        <div className="prediction-name">{disease.replace('_', ' ').toUpperCase()}</div>
                        <div className="prediction-status">
                          <span className={`status-badge ${isDetected ? 'detected' : 'normal'}`}>
                            {displayText}
                          </span>
                        </div>
                        <div className="prediction-bar">
                          <div 
                            className="prediction-fill"
                            style={{ 
                              width: `${confidence * 100}%`,
                              backgroundColor: displayColor
                            }}
                          ></div>
                        </div>
                        <div className="prediction-score">
                          {(confidence * 100).toFixed(1)}%
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* AI Report */}
            {results.medical_report && (
              <div className="ai-report">
                <h3>Medical Analysis Report</h3>
                <div className="report-content">
                  <div className="report-summary">
                    <h4>Summary</h4>
                    <p>{results.medical_report.summary}</p>
                  </div>
                  
                  {results.medical_report.description && (
                    <div className="report-description">
                      <h4>Condition Description</h4>
                      <p>{results.medical_report.description}</p>
                    </div>
                  )}
                  
                  {results.medical_report.recommendation && (
                    <div className="report-recommendation">
                      <h4>Recommendation</h4>
                      <p>{results.medical_report.recommendation}</p>
                      <div className={`urgency-badge ${results.medical_report.urgency?.toLowerCase()}`}>
                        {results.medical_report.urgency} Priority
                      </div>
                    </div>
                  )}
                  
                  {results.medical_report.quality_note && (
                    <div className="quality-note">
                      <h4>Image Quality Note</h4>
                      <p>{results.medical_report.quality_note}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Disease Information */}
            {results.medical_report?.symptoms && (
              <div className="disease-info">
                <h3>Disease Information</h3>
                <div className="info-grid">
                  {results.medical_report.symptoms && results.medical_report.symptoms.length > 0 && (
                    <div className="info-section">
                      <h4>Common Symptoms</h4>
                      <ul>
                        {results.medical_report.symptoms.map((symptom, index) => (
                          <li key={index}>{symptom}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {results.medical_report.treatments && results.medical_report.treatments.length > 0 && (
                    <div className="info-section">
                      <h4>Treatment Options</h4>
                      <ul>
                        {results.medical_report.treatments.map((treatment, index) => (
                          <li key={index}>{treatment}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="result-actions">
              <button 
                onClick={() => {
                  setResults(null);
                }}
                className="btn btn-secondary"
              >
                Analyze Another Image
              </button>
              <button 
                onClick={handleDownloadPdfReport}
                className="btn btn-primary"
                disabled={downloading}
              >
                <FiDownload />
                {downloading ? 'Generating...' : 'Download PDF Report'}
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Upload;
