import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  FiUpload, 
  FiUsers, 
  FiBarChart2, 
  FiActivity,
  FiTrendingUp,
  FiAlertCircle,
  FiCheckCircle,
  FiClock
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Dashboard: Loading stats for user:', user);
      
      // Fetch both dashboard summary and analytics data
      const [summaryResponse, analyticsResponse] = await Promise.all([
        ApiService.getDashboardSummary().catch(() => null),
        ApiService.getAnalytics().catch(() => null)
      ]);
      
      // Combine data from both endpoints
      const combinedStats = {
        // From dashboard summary
        ...(summaryResponse?.data || {}),
        // From analytics (for disease distribution and other details)
        ...(analyticsResponse?.data || {}),
        // Merge disease distribution if available
        disease_distribution: analyticsResponse?.data?.disease_distribution || summaryResponse?.data?.disease_breakdown || {},
        // Model status from either endpoint
        models_status: analyticsResponse?.data?.model_performance || summaryResponse?.data?.system_status?.models_status || {},
        // Recent activity
        recent_activity: analyticsResponse?.data?.recent_activity || summaryResponse?.data?.recent_alerts || []
      };
      
      console.log('✅ Dashboard: Combined stats:', combinedStats);
      
      setStats(combinedStats);
      
    } catch (error) {
      console.error('Dashboard loading error:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <FiAlertCircle className="error-icon" />
        <h3>Failed to load dashboard</h3>
        <p>{error}</p>
        <button onClick={loadStats} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="dashboard"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <motion.div className="dashboard-header" variants={itemVariants}>
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to the Respiratory Disease Detection System</p>
        </div>
        <div className="header-actions">
          <Link to="/upload" className="btn btn-primary">
            <FiUpload />
            New Analysis
          </Link>
        </div>
      </motion.div>

      {/* Stats Cards */}
      <motion.div className="stats-grid" variants={itemVariants}>
        <div className="stat-card">
          <div className="stat-icon patients">
            <FiUsers />
          </div>
          <div className="stat-content">
            <h3>{stats?.total_patients || 0}</h3>
            <p>Total Patients</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon predictions">
            <FiActivity />
          </div>
          <div className="stat-content">
            <h3>{stats?.total_scans || stats?.total_predictions || 0}</h3>
            <p>Total Scans</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon normal">
            <FiCheckCircle />
          </div>
          <div className="stat-content">
            <h3>{stats?.normal_cases || 0}</h3>
            <p>Normal Cases</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon abnormal">
            <FiAlertCircle />
          </div>
          <div className="stat-content">
            <h3>{stats?.abnormal_cases || 0}</h3>
            <p>Abnormal Cases</p>
          </div>
        </div>
      </motion.div>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        {/* Disease Distribution */}
        <motion.div className="dashboard-card" variants={itemVariants}>
          <div className="card-header">
            <h3>Disease Distribution</h3>
            <FiBarChart2 />
          </div>
          <div className="disease-distribution">
            {stats?.disease_distribution ? (
              Object.entries(stats.disease_distribution).map(([disease, count]) => (
                <div key={disease} className="disease-item">
                  <div className="disease-info">
                    <span className="disease-name">{disease.replace('_', ' ').toUpperCase()}</span>
                    <span className="disease-count">{count} cases</span>
                  </div>
                  <div className="disease-bar">
                    <div 
                      className={`disease-progress ${disease}`}
                      style={{
                        width: `${(count / Math.max(...Object.values(stats.disease_distribution))) * 100}%`
                      }}
                    ></div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No prediction data available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div className="dashboard-card" variants={itemVariants}>
          <div className="card-header">
            <h3>Recent Activity</h3>
            <FiTrendingUp />
          </div>
          <div className="recent-activity">
            {stats?.recent_activity && stats.recent_activity.length > 0 ? (
              stats.recent_activity.slice(0, 7).map((activity, index) => (
                <div key={index} className="activity-item">
                  <div className="activity-info">
                    <div className="activity-date">
                      {activity.date ? new Date(activity.date).toLocaleDateString() : 
                       activity.timestamp ? new Date(activity.timestamp).toLocaleDateString() : 'Recent'}
                    </div>
                    <div className="activity-details">
                      {activity.patient_name ? (
                        <span className="patient-name">{activity.patient_name}</span>
                      ) : null}
                      {activity.diagnosis ? (
                        <span className="diagnosis">{activity.diagnosis}</span>
                      ) : activity.count ? (
                        <span className="count">{activity.count} prediction{activity.count !== 1 ? 's' : ''}</span>
                      ) : null}
                      {activity.confidence && (
                        <span className="confidence">{activity.confidence}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : stats?.recent_alerts && stats.recent_alerts.length > 0 ? (
              stats.recent_alerts.slice(0, 5).map((alert, index) => (
                <div key={index} className="activity-item alert">
                  <div className="activity-info">
                    <div className="activity-date">
                      {new Date(alert.date).toLocaleDateString()}
                    </div>
                    <div className="activity-details">
                      <span className="patient-name">{alert.patient_name}</span>
                      <span className="diagnosis alert">{alert.diagnosis}</span>
                      <span className="confidence">{alert.confidence}</span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-data">
                <p>No recent activity</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Model Status */}
        <motion.div className="dashboard-card" variants={itemVariants}>
          <div className="card-header">
            <h3>Model Status</h3>
            <FiActivity />
          </div>
          <div className="model-status">
            {stats?.models_status || stats?.model_performance ? (
              Object.entries(stats.models_status || stats.model_performance || {}).map(([model, statusInfo]) => {
                // Handle different data structures
                const status = typeof statusInfo === 'string' ? statusInfo : statusInfo?.status || 'Unknown';
                const accuracy = typeof statusInfo === 'object' ? statusInfo?.accuracy : null;
                const isReady = status.includes('Ready') || status.includes('loaded');
                
                return (
                  <div key={model} className="model-item">
                    <div className="model-info">
                      <span className="model-name">{model.replace('_', ' ').toUpperCase()}</span>
                      <span className={`model-status-badge ${isReady ? 'ready' : 'error'}`}>
                        {isReady ? <FiCheckCircle /> : <FiAlertCircle />}
                        {isReady ? 'Ready' : 'Error'}
                      </span>
                    </div>
                    {accuracy && (
                      <div className="model-accuracy">
                        <span>{accuracy}% accuracy</span>
                      </div>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="no-data">
                <p>Model status unavailable</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div className="dashboard-card quick-actions" variants={itemVariants}>
          <div className="card-header">
            <h3>Quick Actions</h3>
          </div>
          <div className="action-buttons">
            <Link to="/upload" className="action-btn">
              <FiUpload />
              <span>Upload Image</span>
              <p>Analyze chest X-ray or CT scan</p>
            </Link>
            <Link to="/patients" className="action-btn">
              <FiUsers />
              <span>View Patients</span>
              <p>Manage patient records</p>
            </Link>
            <Link to="/analytics" className="action-btn">
              <FiBarChart2 />
              <span>Analytics</span>
              <p>View detailed statistics</p>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* System Information */}
      <motion.div className="system-info" variants={itemVariants}>
        <div className="info-grid">
          <div className="info-item">
            <h4>Supported Diseases</h4>
            <ul>
              <li>Pneumonia</li>
              <li>Tuberculosis</li>
              <li>Lung Cancer</li>
            </ul>
          </div>
          <div className="info-item">
            <h4>Supported Formats</h4>
            <ul>
              <li>JPEG, PNG, BMP</li>
              <li>TIFF, DICOM</li>
              <li>Max size: 16MB</li>
            </ul>
          </div>
          <div className="info-item">
            <h4>AI Models</h4>
            <ul>
              <li>Transfer Learning</li>
              <li>ResNet50, EfficientNet</li>
              <li>Gemini AI Reports</li>
            </ul>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default Dashboard;
