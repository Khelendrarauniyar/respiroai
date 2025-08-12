import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import ApiService from '../services/ApiService';
import './PatientDetails.css';

function PatientDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [patient, setPatient] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPrediction, setSelectedPrediction] = useState(null);

  useEffect(() => {
    fetchPatientDetails();
  }, [id]);

  const fetchPatientDetails = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching patient details for ID:', id);
      
      const [patientResponse, predictionsResponse] = await Promise.all([
        ApiService.getPatient(id),
        ApiService.getPatientPredictions(id)
      ]);
      
      console.log('👤 Patient response:', patientResponse);
      console.log('📊 Predictions response:', predictionsResponse);
      
      // Extract patient data correctly - backend returns {data: patientObject}
      const patientData = patientResponse.data?.data || patientResponse.data;
      console.log('👤 Extracted patient data:', patientData);
      
      setPatient(patientData);
      
      // Handle predictions response structure safely
      const predictionsData = predictionsResponse.data?.data || predictionsResponse.data || [];
      const predictionsArray = Array.isArray(predictionsData) ? predictionsData : [];
      setPredictions(predictionsArray);
      
      console.log('✅ Final patient state:', patientData);
      console.log('✅ Final predictions state:', predictionsArray);
      
    } catch (error) {
      console.error('❌ Failed to fetch patient details:', error);
      toast.error('Failed to load patient details');
      navigate('/patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePrediction = async (predictionId) => {
    if (!window.confirm('Are you sure you want to delete this prediction?')) {
      return;
    }

    try {
      await ApiService.deletePrediction(predictionId);
      
      // Safely filter predictions array
      if (Array.isArray(predictions)) {
        setPredictions(predictions.filter(p => p.id !== predictionId));
      }
      
      toast.success('Prediction deleted successfully');
    } catch (error) {
      console.error('Failed to delete prediction:', error);
      toast.error('Failed to delete prediction');
    }
  };

  const getStatusIcon = (prediction) => {
    if (!prediction || typeof prediction !== 'string') {
      return '❓';
    }
    
    switch(prediction.toLowerCase()) {
      case 'normal': return '✅';
      case 'pneumonia': return '🫁';
      case 'tuberculosis': return '🦠';
      case 'lung_cancer': return '⚠️';
      case 'lung_cancer_benign': return '🔶';
      case 'lung_cancer_malignant': return '🔴';
      default: return '❓';
    }
  };

  const getStatusColor = (prediction) => {
    if (!prediction || typeof prediction !== 'string') {
      return '#757575';
    }
    
    switch(prediction.toLowerCase()) {
      case 'normal': return '#4CAF50';
      case 'pneumonia': return '#FF9800';
      case 'tuberculosis': return '#F44336';
      case 'lung_cancer': return '#9C27B0';
      case 'lung_cancer_benign': return '#FFC107';
      case 'lung_cancer_malignant': return '#D32F2F';
      default: return '#757575';
    }
  };

  const getDisplayName = (prediction) => {
    if (!prediction || typeof prediction !== 'string') {
      return 'UNKNOWN';
    }
    
    switch(prediction.toLowerCase()) {
      case 'normal': return 'NORMAL';
      case 'pneumonia': return 'PNEUMONIA';
      case 'tuberculosis': return 'TUBERCULOSIS';
      case 'lung_cancer': return 'LUNG CANCER';
      case 'lung_cancer_benign': return 'LUNG CANCER (BENIGN)';
      case 'lung_cancer_malignant': return 'LUNG CANCER (MALIGNANT)';
      default: return prediction.toUpperCase().replace('_', ' ');
    }
  };

  if (loading) {
    return (
      <div className="patient-details-loading">
        <div className="loading-spinner"></div>
        <p>Loading patient details...</p>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="patient-not-found">
        <h2>Patient not found</h2>
        <p>Patient with ID {id} could not be found.</p>
        <button onClick={() => navigate('/patients')} className="back-button">
          Back to Patients
        </button>
      </div>
    );
  }

  console.log('🎯 Rendering PatientDetails with:', { patient, predictions });

  return (
    <motion.div 
      className="patient-details-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="patient-details-header">
        <button onClick={() => navigate('/patients')} className="back-button">
          ← Back to Patients
        </button>
        <h1>Patient Details</h1>
      </div>

      <div className="patient-details-grid">
        {/* Patient Info Card */}
        <motion.div 
          className="patient-info-card"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="card-header">
            <h2>👤 Patient Information</h2>
          </div>
          <div className="patient-info">
            <div className="info-item">
              <label>Name:</label>
              <span>{patient.name || 'Unknown'}</span>
            </div>
            <div className="info-item">
              <label>Age:</label>
              <span>{patient.age || 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Gender:</label>
              <span>{patient.gender ? patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1) : 'Not provided'}</span>
            </div>
            <div className="info-item">
              <label>Contact:</label>
              <span>{patient.contact || 'Not provided'}</span>
            </div>
            {patient.address && (
              <div className="info-item">
                <label>Address:</label>
                <span>{patient.address}</span>
              </div>
            )}
            {patient.emergency_contact && (
              <div className="info-item">
                <label>Emergency Contact:</label>
                <span>{patient.emergency_contact}</span>
              </div>
            )}
            <div className="info-item">
              <label>Registered:</label>
              <span>{patient.created_at ? new Date(patient.created_at).toLocaleDateString() : 'Unknown'}</span>
            </div>
            <div className="info-item">
              <label>Total Predictions:</label>
              <span>{Array.isArray(predictions) ? predictions.length : 0}</span>
            </div>
          </div>
        </motion.div>

        {/* Predictions History */}
        <motion.div 
          className="predictions-card"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="card-header">
            <h2>📊 Prediction History</h2>
            <span className="prediction-count">{Array.isArray(predictions) ? predictions.length : 0} predictions</span>
          </div>
          
          {!Array.isArray(predictions) || predictions.length === 0 ? (
            <div className="no-predictions">
              <p>No predictions available for this patient.</p>
            </div>
          ) : (
            <div className="predictions-list">
              {predictions.map((prediction) => {
                console.log('🔍 Processing prediction:', prediction);
                console.log('🖼️ Image path type and value:', typeof prediction.image_path, prediction.image_path);
                return (
                <motion.div
                  key={prediction.id}
                  className="prediction-item"
                  whileHover={{ scale: 1.02 }}
                  onClick={() => setSelectedPrediction(prediction)}
                >
                  <div className="prediction-header">
                    <div className="prediction-status">
                      <span className="status-icon">
                        {getStatusIcon(prediction.predicted_disease)}
                      </span>
                      <span 
                        className="status-text"
                        style={{ color: getStatusColor(prediction.predicted_disease) }}
                      >
                        {getDisplayName(prediction.predicted_disease)}
                      </span>
                    </div>
                    <div className="prediction-confidence">
                      {(() => {
                        let confidence = prediction.confidence;
                        if (confidence && !isNaN(confidence)) {
                          // If confidence is already a percentage (> 1), use as is
                          // If confidence is a decimal (0-1), convert to percentage
                          const confValue = confidence > 1 ? confidence : confidence * 100;
                          return confValue.toFixed(1);
                        }
                        return '0.0';
                      })()}%
                    </div>
                  </div>
                  
                  <div className="prediction-details">
                    <p><strong>Date:</strong> {(() => {
                      const date = prediction.created_at || prediction.timestamp || prediction.date;
                      if (date) {
                        try {
                          return new Date(date).toLocaleString();
                        } catch (e) {
                          return date; // Return as-is if it's already formatted
                        }
                      }
                      return 'Unknown';
                    })()}</p>
                    <p><strong>Image:</strong> {prediction.image_path && typeof prediction.image_path === 'string' ? prediction.image_path.split(/[\\\/]/).pop() : 'No image'}</p>
                    {(() => {
                      // Try to get AI report from either ai_report or radiologist_notes
                      let reportData = prediction.ai_report || prediction.radiologist_notes;
                      if (reportData && typeof reportData === 'string') {
                        try {
                          const report = JSON.parse(reportData);
                          return (
                            <>
                              {report.findings_count > 1 && (
                                <p><strong>Multiple findings:</strong> {report.findings_count} conditions detected</p>
                              )}
                              {report.urgency && (
                                <p><strong>Urgency:</strong> <span style={{color: report.urgency === 'High' ? '#f44336' : '#ff9800'}}>{report.urgency}</span></p>
                              )}
                              {report.diagnosis && (
                                <p><strong>Primary Diagnosis:</strong> {report.diagnosis}</p>
                              )}
                              {report.confidence && (
                                <p><strong>AI Confidence:</strong> {report.confidence}</p>
                              )}
                            </>
                          );
                        } catch (e) {
                          // If it's not JSON, display as plain text
                          return (
                            <p><strong>Notes:</strong> {reportData}</p>
                          );
                        }
                      }
                      return null;
                    })()}
                  </div>
                  
                  <div className="prediction-actions">
                    <button 
                      className="view-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedPrediction(prediction);
                      }}
                    >
                      View Details
                    </button>
                    <button 
                      className="delete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePrediction(prediction.id);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </motion.div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>

      {/* Prediction Detail Modal */}
      {selectedPrediction && (
        <motion.div 
          className="prediction-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => setSelectedPrediction(null)}
        >
          <motion.div 
            className="prediction-modal"
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Prediction Details</h3>
              <button 
                className="close-button"
                onClick={() => setSelectedPrediction(null)}
              >
                ×
              </button>
            </div>
            
            <div className="modal-content">
              {selectedPrediction.image_path && typeof selectedPrediction.image_path === 'string' && (
                <div className="prediction-image">
                  <img 
                    src={`http://localhost:5000/uploads/${selectedPrediction.image_path.split(/[\\\/]/).pop()}`}
                    alt="Medical scan"
                    className="modal-image"
                    onError={(e) => {
                      console.error('Failed to load image:', selectedPrediction.image_path);
                      e.target.style.display = 'none';
                      // Try alternative path
                      const altSrc = `http://localhost:5000/${selectedPrediction.image_path}`;
                      if (e.target.src !== altSrc) {
                        e.target.src = altSrc;
                        e.target.style.display = 'block';
                      }
                    }}
                    onLoad={() => console.log('Image loaded successfully')}
                  />
                </div>
              )}
              
              <div className="prediction-info">
                <div className="info-row">
                  <label>Prediction:</label>
                  <span 
                    className="prediction-value"
                    style={{ color: getStatusColor(selectedPrediction.predicted_disease) }}
                  >
                    {getStatusIcon(selectedPrediction.predicted_disease)} {getDisplayName(selectedPrediction.predicted_disease)}
                  </span>
                </div>
                
                <div className="info-row">
                  <label>Confidence:</label>
                  <span className="confidence-value">
                    {selectedPrediction.confidence ? (selectedPrediction.confidence * 100).toFixed(2) : '0.00'}%
                  </span>
                </div>
                
                <div className="info-row">
                  <label>Date:</label>
                  <span>{selectedPrediction.created_at ? new Date(selectedPrediction.created_at).toLocaleString() : 'Unknown'}</span>
                </div>
                
                <div className="info-row">
                  <label>Image:</label>
                  <span>{selectedPrediction.image_path && typeof selectedPrediction.image_path === 'string' ? selectedPrediction.image_path.split('/').pop() : 'No image'}</span>
                </div>
                
                {selectedPrediction.treatment_recommendations && (
                  <div className="info-row">
                    <label>Treatment Recommendations:</label>
                    <span className="recommendations-text">
                      {selectedPrediction.treatment_recommendations}
                    </span>
                  </div>
                )}
                
                {selectedPrediction.ai_report && (() => {
                  try {
                    const report = JSON.parse(selectedPrediction.ai_report);
                    return (
                      <>
                        {report.urgency && (
                          <div className="info-row">
                            <label>Urgency Level:</label>
                            <span style={{
                              color: report.urgency === 'High' ? '#f44336' : 
                                     report.urgency === 'Medium' ? '#ff9800' : '#4caf50',
                              fontWeight: 'bold'
                            }}>
                              {report.urgency}
                            </span>
                          </div>
                        )}
                        {report.findings_count > 1 && (
                          <div className="info-row">
                            <label>Multiple Findings:</label>
                            <span>{report.findings_count} conditions detected</span>
                          </div>
                        )}
                        {report.recommendation && (
                          <div className="info-row">
                            <label>AI Recommendation:</label>
                            <span>{report.recommendation}</span>
                          </div>
                        )}
                      </>
                    );
                  } catch (e) {
                    return null;
                  }
                })()}
                
                {selectedPrediction.radiologist_notes && (
                  <div className="info-row">
                    <label>Radiologist Notes:</label>
                    <span>{selectedPrediction.radiologist_notes}</span>
                  </div>
                )}
                
                {selectedPrediction.severity_level && (
                  <div className="info-row">
                    <label>Severity Level:</label>
                    <span>{selectedPrediction.severity_level}</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default PatientDetails;
