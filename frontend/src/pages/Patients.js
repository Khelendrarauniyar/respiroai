import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiUser, 
  FiCalendar, 
  FiPhone, 
  FiFileText,
  FiSearch,
  FiFilter,
  FiDownload,
  FiUserPlus
} from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import ApiService from '../services/ApiService';
import './Patients.css';

const Patients = () => {
  const { makeAuthenticatedRequest, isAdmin } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterGender, setFilterGender] = useState('');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    loadPatients();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      // Use the new authenticated endpoint that returns user's own patients or all patients for admin
      const response = await makeAuthenticatedRequest('/patients');
      
      if (response && response.ok) {
        const data = await response.json();
        console.log('🔍 Patients API Response:', data);
        console.log('🔍 First patient data:', data.data?.[0]);
        setPatients(data.data || []);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to load patients');
      }
    } catch (error) {
      console.error('❌ Error loading patients:', error);
      setError(error.message);
      setPatients([]); // Set empty array as fallback
    } finally {
      setLoading(false);
    }
  };

  const filteredAndSortedPatients = () => {
    // Ensure patients is always an array
    const patientsArray = Array.isArray(patients) ? patients : [];
    
    let filtered = patientsArray.filter(patient => {
      const matchesSearch = patient.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           patient.contact?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGender = !filterGender || patient.gender === filterGender;
      return matchesSearch && matchesGender;
    });

    // Sort patients
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'name':
          return a.name.localeCompare(b.name);
        case 'age':
          return (a.age || 0) - (b.age || 0);
        case 'predictions':
          return b.prediction_count - a.prediction_count;
        case 'recent':
        default:
          return new Date(b.created_at) - new Date(a.created_at);
      }
    });

    return filtered;
  };

  if (loading) {
    return (
      <div className="patients-loading">
        <div className="loading-spinner"></div>
        <p>Loading patients...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="patients-error">
        <h3>Failed to load patients</h3>
        <p>{error}</p>
        <button onClick={loadPatients} className="btn btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <motion.div 
      className="patients-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="patients-header">
        <div>
          <h1>{isAdmin() ? 'All Patient Records' : 'My Patient Records'}</h1>
          <p>
            {isAdmin() 
              ? 'Manage and view all patient information and medical history' 
              : 'View your registered patient information and medical history'}
          </p>
        </div>
        <div className="header-stats">
          <div className="stat-item">
            <span className="stat-number">{patients.length}</span>
            <span className="stat-label">{isAdmin() ? 'Total Patients' : 'Your Records'}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="patients-controls">
        <div className="search-box">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by name or contact..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className="filter-controls">
          <select
            value={filterGender}
            onChange={(e) => setFilterGender(e.target.value)}
            className="filter-select"
          >
            <option value="">All Genders</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="filter-select"
          >
            <option value="recent">Most Recent</option>
            <option value="name">Name A-Z</option>
            <option value="age">Age</option>
            <option value="predictions">Most Predictions</option>
          </select>
        </div>
      </div>

      {/* Patients List */}
      {filteredAndSortedPatients().length === 0 ? (
        <div className="no-patients">
          <FiUser className="no-data-icon" />
          <h3>No patient records found</h3>
          <p>
            {searchTerm || filterGender 
              ? 'Try adjusting your search or filters'
              : (isAdmin() 
                  ? 'No patients have registered yet'
                  : 'You haven\'t registered as a patient yet'
                )
            }
          </p>
          {!isAdmin() && !searchTerm && !filterGender && (
            <Link to="/patient/register" className="btn btn-primary">
              <FiUserPlus />
              Register as Patient
            </Link>
          )}
          {(isAdmin() || patients.length > 0) && (
            <Link to="/upload" className="btn btn-secondary">
              Add New Analysis
            </Link>
          )}
        </div>
      ) : (
        <motion.div 
          className="patients-grid"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
          initial="hidden"
          animate="visible"
        >
          {filteredAndSortedPatients().map((patient) => (
            <motion.div
              key={patient.id}
              className="patient-card"
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 }
              }}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.3 }}
            >
              <div className="patient-header">
                <div className="patient-avatar">
                  <FiUser />
                </div>
                <div className="patient-basic-info">
                  <h3>{patient.name}</h3>
                  <div className="patient-details">
                    {patient.age && (
                      <span className="detail-item">
                        <FiCalendar />
                        {patient.age} years
                      </span>
                    )}
                    {patient.gender && String(patient.gender).trim() && (
                      <span className="detail-item">
                        {(() => {
                          try {
                            const genderStr = String(patient.gender);
                            return genderStr.charAt(0).toUpperCase() + genderStr.slice(1);
                          } catch (e) {
                            return patient.gender;
                          }
                        })()}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div className="patient-stats">
                <div className="stat">
                  <FiFileText className="stat-icon" />
                  <span>{patient.prediction_count} prediction{patient.prediction_count !== 1 ? 's' : ''}</span>
                </div>
                {patient.contact && (
                  <div className="stat">
                    <FiPhone className="stat-icon" />
                    <span>{patient.contact}</span>
                  </div>
                )}
              </div>

              <div className="patient-meta">
                <span className="created-date">
                  Added {new Date(patient.created_at).toLocaleDateString()}
                </span>
              </div>

              <div className="patient-actions">
                <Link 
                  to={`/patients/${patient.id}`}
                  className="btn btn-primary btn-sm"
                >
                  View Details
                </Link>
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Export Button */}
      {patients.length > 0 && (
        <div className="patients-footer">
          <button 
            onClick={() => {
              // Export functionality would go here
              console.log('Exporting patient data...');
            }}
            className="btn btn-secondary"
          >
            <FiDownload />
            Export Patient Data
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default Patients;
