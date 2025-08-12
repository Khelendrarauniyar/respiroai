import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiActivity, 
  FiUsers, 
  FiCpu, 
  FiDatabase,
  FiGithub,
  FiMail,
  FiGlobe,
  FiAward,
  FiShield,
  FiZap
} from 'react-icons/fi';
import ApiService from '../services/ApiService';
import './About.css';

const About = () => {
  const modelInfo = ApiService.getModelInfo();
  const diseaseInfo = ApiService.getDiseaseInfo();

  const features = [
    {
      icon: <FiCpu />,
      title: 'Advanced AI Models',
      description: 'State-of-the-art deep learning models using transfer learning with VGG16, ResNet50 and EfficientNetB0 architectures.'
    },
    {
      icon: <FiActivity />,
      title: 'Multi-Disease Detection',
      description: 'Comprehensive detection of Pneumonia, Tuberculosis, and Lung Cancer from chest X-rays and CT scans.'
    },
    {
      icon: <FiZap />,
      title: 'Real-time Analysis',
      description: 'Fast and accurate predictions with confidence scores and detailed medical reports.'
    },
    {
      icon: <FiDatabase />,
      title: 'Patient Management',
      description: 'Complete patient record system with medical history tracking and analytics.'
    },
    {
      icon: <FiShield />,
      title: 'Secure & Private',
      description: 'HIPAA-compliant security measures to protect sensitive medical information.'
    },
    {
      icon: <FiAward />,
      title: 'High Accuracy',
      description: 'Validated models with over 90% accuracy across all disease categories.'
    }
  ];

  const stats = [
    { number: '94.2%', label: 'Pneumonia Detection Accuracy' },
    { number: '91.8%', label: 'Tuberculosis Detection Accuracy' },
    { number: '89.5%', label: 'Lung Cancer Detection Accuracy' },
    { number: '25K+', label: 'Training Images Used' },
    { number: '5', label: 'Supported Image Formats' },
    { number: '16MB', label: 'Maximum File Size' }
  ];

  return (
    <motion.div 
      className="about-page"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <motion.div
            className="hero-text"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <h1 style={{ textAlign: 'center' }}>Unified Respiratory Disease Detection System</h1>
            <br />
            <br />
            <p>
              Revolutionizing healthcare with AI-powered medical image analysis for early 
              detection of respiratory diseases. Our advanced deep learning models provide 
              accurate, fast, and reliable diagnosis assistance.
            </p>
          </motion.div>
          <motion.div
            className="hero-stats"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <div className="stats-grid">
              {stats.map((stat, index) => (
                <div key={index} className="stat-item">
                  <span className="stat-number">{stat.number}</span>
                  <span className="stat-label">{stat.label}</span>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="section-header">
          <h2>Key Features</h2>
          <p>Comprehensive solution for respiratory disease detection and management</p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="feature-card"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              whileHover={{ y: -5 }}
            >
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Technology Stack */}
      <section className="technology-section">
        <div className="section-header">
          <h2>Technology Stack</h2>
          <p>Built with cutting-edge technologies for optimal performance</p>
        </div>
        <div className="tech-grid">
          <div className="tech-category">
            <h3>Frontend</h3>
            <ul>
              <li>React.js</li>
              <li>Framer Motion</li>
              <li>Chart.js</li>
              <li>Styled Components</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>Backend</h3>
            <ul>
              <li>Flask (Python)</li>
              <li>SQLite Database</li>
              <li>RESTful APIs</li>
              <li>CORS Support</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>AI/ML</h3>
            <ul>
              <li>TensorFlow</li>
              <li>Keras</li>
              <li>OpenCV</li>
              <li>Transfer Learning</li>
            </ul>
          </div>
          <div className="tech-category">
            <h3>AI Integration</h3>
            <ul>
              <li>Gemini AI</li>
              <li>Medical Report Generation</li>
              <li>Natural Language Processing</li>
              <li>Clinical Documentation</li>
            </ul>
          </div>
        </div>
      </section>

      {/* Model Information */}
      <section className="models-section">
        <div className="section-header">
          <h2>AI Models</h2>
          <p>Advanced deep learning models trained on comprehensive medical datasets</p>
        </div>
        <div className="models-grid">
          {Object.entries(modelInfo).map(([key, model]) => (
            <motion.div
              key={key}
              className="model-card"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1 * Object.keys(modelInfo).indexOf(key) }}
            >
              <div className="model-header">
                <h3>{model.name}</h3>
                <div className="accuracy-badge">{model.accuracy}</div>
              </div>
              <div className="model-details">
                <div className="detail-item">
                  <strong>Architecture:</strong> {model.architecture}
                </div>
                <div className="detail-item">
                  <strong>Training Data:</strong> {model.training_data}
                </div>
                <div className="detail-item">
                  <strong>Classes:</strong> {model.classes.join(', ')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Disease Information */}
      <section className="diseases-section">
        <div className="section-header">
          <h2>Supported Diseases</h2>
          <br />
          <p>Comprehensive detection and information for major respiratory conditions</p>
        </div>
        <div className="diseases-grid">
          {Object.entries(diseaseInfo).filter(([key]) => key !== 'normal').map(([key, disease]) => (
            <motion.div
              key={key}
              className="disease-card"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * Object.keys(diseaseInfo).indexOf(key) }}
            >
              <div className="disease-header">
                <h3>{disease.name}</h3>
                <br />
              </div>
              <div className="disease-description">
                <p>{disease.description}</p>
                <br />
              </div>
              <div className="disease-details">
                {disease.symptoms.length > 0 && (
                  <div className="detail-section">
                    <h4>Key Symptoms</h4>
                    <br />
                    <ul>
                      {disease.symptoms.slice(0, 3).map((symptom, index) => (
                        <li key={index}>{symptom}</li>
                      ))}
                    </ul>
                  </div>
                  
                )}
              </div>
              <br />
            </motion.div>
          ))}
        </div>
      </section>

      {/* Contact Section */}
      <section className="contact-section">
        <div className="section-header">
          <h2>Get in Touch</h2>
          <p>Questions, feedback, or collaboration opportunities</p>
        </div>
        <div className="contact-grid">
          <div className="contact-item">
            <FiMail className="contact-icon" />
            <h3>Email</h3>
            <p>khelendra.guptarauniyar@gmail.com</p>
          </div>
          <div className="contact-item">
            <FiGithub className="contact-icon" />
            <h3>GitHub</h3>
            <p>github.com/respirai</p>
          </div>
          <div className="contact-item">
            <FiGlobe className="contact-icon" />
            <h3>Website</h3>
            <p>www.respirai.com</p>
          </div>
        </div>
      </section>

      {/* Disclaimer */}
      <section className="disclaimer-section">
        <div className="disclaimer-content">
          <h3>⚠️ Important Medical Disclaimer</h3>
          <p>
            This system is designed for educational and research purposes only. 
            It should not be used as a substitute for professional medical diagnosis, 
            treatment, or advice. Always consult qualified healthcare professionals 
            for medical decisions and proper diagnosis of any health conditions.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="about-footer">
        <div className="footer-content">
          
          <div className="footer-links">
            <Link to="/privacy-policy">Privacy Policy</Link>
            <Link to="/terms-of-service">Terms of Service</Link>
            <Link to="/mit-license">MIT License</Link>
          </div>
          
        </div>
      </footer>
      <div className="footer-text">
            <p>© 2025 RespirAI - Unified Respiratory Disease Detection System</p>
            <p>Made with ❤️ for better healthcare</p>
          </div>
    </motion.div>
    
  );
};

export default About;
