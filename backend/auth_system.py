"""
Advanced User Authentication and Role Management System
Features: JWT-based auth, role-based access, user tracking, admin controls
"""

import jwt
import bcrypt
import sqlite3
import os
from datetime import datetime, timedelta
from functools import wraps
from flask import request, jsonify, current_app
import secrets
import hashlib
import logging
import traceback

logger = logging.getLogger(__name__)

class UserAuthSystem:
    def __init__(self, app, db_path):
        self.app = app
        self.db_path = db_path
        self.secret_key = app.config.get('JWT_SECRET_KEY', secrets.token_hex(32))
        self.init_auth_tables()
    
    def init_auth_tables(self):
        """Initialize authentication tables"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Enhanced Users table
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username VARCHAR(50) UNIQUE NOT NULL,
                    email VARCHAR(100) UNIQUE NOT NULL,
                    password_hash VARCHAR(255) NOT NULL,
                    full_name VARCHAR(100) NOT NULL,
                    role VARCHAR(20) DEFAULT 'patient',
                    phone VARCHAR(20),
                    date_of_birth DATE,
                    gender VARCHAR(10),
                    address TEXT,
                    emergency_contact VARCHAR(100),
                    medical_id VARCHAR(50) UNIQUE,
                    is_active BOOLEAN DEFAULT TRUE,
                    email_verified BOOLEAN DEFAULT FALSE,
                    last_login TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    profile_picture VARCHAR(255),
                    subscription_type VARCHAR(20) DEFAULT 'basic',
                    subscription_expires DATE
                )
            ''')
            
            # User Sessions table for JWT tracking
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_sessions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    token_hash VARCHAR(255) NOT NULL,
                    device_info TEXT,
                    ip_address VARCHAR(45),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    expires_at TIMESTAMP,
                    is_active BOOLEAN DEFAULT TRUE,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # User Activity Logs
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS user_activity (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER NOT NULL,
                    activity_type VARCHAR(50) NOT NULL,
                    description TEXT,
                    ip_address VARCHAR(45),
                    user_agent TEXT,
                    additional_data JSON,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Enhanced Patients table (linked to users)
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS patients_enhanced (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER UNIQUE,
                    patient_id VARCHAR(50) UNIQUE NOT NULL,
                    medical_history TEXT,
                    allergies TEXT,
                    current_medications TEXT,
                    chronic_conditions TEXT,
                    insurance_info TEXT,
                    primary_physician VARCHAR(100),
                    blood_type VARCHAR(5),
                    height_cm INTEGER,
                    weight_kg REAL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # Admin Settings
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS admin_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    setting_key VARCHAR(100) UNIQUE NOT NULL,
                    setting_value TEXT,
                    description TEXT,
                    updated_by INTEGER,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (updated_by) REFERENCES users (id)
                )
            ''')
            
            # System Notifications
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS notifications (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    user_id INTEGER,
                    title VARCHAR(200) NOT NULL,
                    message TEXT NOT NULL,
                    type VARCHAR(50) DEFAULT 'info',
                    is_read BOOLEAN DEFAULT FALSE,
                    action_url VARCHAR(255),
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (user_id) REFERENCES users (id)
                )
            ''')
            
            # NOTE: Predictions table is created by unified_app.py init_db()
            # to avoid schema conflicts
            
            # Create default admin user if not exists
            cursor.execute("SELECT COUNT(*) FROM users WHERE role = 'admin'")
            admin_count = cursor.fetchone()[0]
            
            if admin_count == 0:
                self.create_default_admin(cursor)
            
            # Create demo patient if not exists
            cursor.execute("SELECT COUNT(*) FROM users WHERE username = 'demo_patient'")
            demo_count = cursor.fetchone()[0]
            
            if demo_count == 0:
                self.create_demo_patient(cursor)
            
            conn.commit()
            conn.close()
            logger.info("✅ Authentication tables initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Error initializing auth tables: {str(e)}")
    
    def create_default_admin(self, cursor):
        """Create default admin user"""
        admin_password = "admin123"  # Change this in production
        password_hash = bcrypt.hashpw(admin_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, full_name, role, is_active, email_verified)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', ('admin', 'admin@hospital.com', password_hash, 'System Administrator', 'admin', True, True))
        
        logger.info("✅ Default admin user created (username: admin, password: admin123)")
    
    def create_demo_patient(self, cursor):
        """Create demo patient user for testing"""
        patient_password = "patient123"  # Demo password
        password_hash = bcrypt.hashpw(patient_password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
        
        cursor.execute('''
            INSERT INTO users (username, email, password_hash, full_name, role, is_active, email_verified)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', ('demo_patient', 'demo@patient.com', password_hash, 'Demo Patient', 'patient', True, True))
        
        logger.info("✅ Demo patient user created (username: demo_patient, password: patient123)")
    
    def hash_password(self, password):
        """Hash password using bcrypt"""
        return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    def verify_password(self, password, hash_password):
        """Verify password against hash"""
        return bcrypt.checkpw(password.encode('utf-8'), hash_password.encode('utf-8'))
    
    def authenticate_user(self, username, password):
        """Authenticate user with username and password"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get user by username or email
            cursor.execute('''
                SELECT id, username, email, password_hash, full_name, role, is_active 
                FROM users 
                WHERE (username = ? OR email = ?) AND is_active = TRUE
            ''', (username, username))
            
            user_row = cursor.fetchone()
            conn.close()
            
            if not user_row:
                logger.warning(f"Authentication failed: User '{username}' not found")
                return None
            
            # Verify password
            if not self.verify_password(password, user_row[3]):
                logger.warning(f"Authentication failed: Invalid password for user '{username}'")
                return None
            
            # Update last login
            self.update_last_login(user_row[0])
            
            # Return user data
            user_data = {
                'id': user_row[0],
                'username': user_row[1],
                'email': user_row[2],
                'full_name': user_row[4],
                'role': user_row[5],
                'is_active': user_row[6]
            }
            
            logger.info(f"✅ User authenticated successfully: {username}")
            return user_data
            
        except Exception as e:
            logger.error(f"❌ Authentication error: {str(e)}")
            return None
    
    def update_last_login(self, user_id):
        """Update user's last login timestamp"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                UPDATE users 
                SET last_login = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ''', (user_id,))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Error updating last login: {str(e)}")
    
    def generate_token(self, user_id, role, remember_me=False):
        """Generate JWT token"""
        try:
            expiry_hours = 24 * 7 if remember_me else 24  # 7 days if remember me, else 24 hours
            payload = {
                'user_id': int(user_id),  # Ensure user_id is an integer
                'role': str(role),        # Ensure role is a string
                'exp': datetime.utcnow() + timedelta(hours=expiry_hours),
                'iat': datetime.utcnow()
            }
            
            # Generate token
            token = jwt.encode(payload, str(self.secret_key), algorithm='HS256')
            
            # Ensure token is a string (for compatibility with different PyJWT versions)
            if isinstance(token, bytes):
                token = token.decode('utf-8')
            
            # Store token session
            self.store_token_session(user_id, token, expiry_hours)
            
            logger.info(f"✅ Token generated successfully for user {user_id}")
            return token
        except Exception as e:
            logger.error(f"❌ Error generating token: {str(e)}")
            import traceback
            logger.error(f"❌ Full traceback: {traceback.format_exc()}")
            return None
    
    def store_token_session(self, user_id, token, expiry_hours):
        """Store token session in database"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            expires_at = datetime.utcnow() + timedelta(hours=expiry_hours)
            
            cursor.execute('''
                INSERT INTO user_sessions (user_id, token_hash, expires_at, device_info, ip_address)
                VALUES (?, ?, ?, ?, ?)
            ''', (user_id, token_hash, expires_at, 
                  request.headers.get('User-Agent', ''), 
                  request.remote_addr))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"❌ Error storing token session: {str(e)}")
    
    def verify_token(self, token):
        """Verify JWT token"""
        try:
            # Ensure token is a string
            if isinstance(token, bytes):
                token = token.decode('utf-8')
                
            payload = jwt.decode(token, str(self.secret_key), algorithms=['HS256'])
            
            # Check if token session is still active
            if self.is_token_session_active(payload['user_id'], token):
                return payload
            else:
                return None
                
        except jwt.ExpiredSignatureError:
            logger.warning("Token has expired")
            return None
        except jwt.InvalidTokenError as e:
            logger.warning(f"Invalid token: {str(e)}")
            return None
        except Exception as e:
            logger.error(f"❌ Error verifying token: {str(e)}")
            return None
    
    def is_token_session_active(self, user_id, token):
        """Check if token session is active"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            cursor.execute('''
                SELECT is_active FROM user_sessions 
                WHERE user_id = ? AND token_hash = ? AND expires_at > CURRENT_TIMESTAMP
            ''', (user_id, token_hash))
            
            result = cursor.fetchone()
            conn.close()
            
            return result and result[0]
        except Exception as e:
            logger.error(f"❌ Error checking token session: {str(e)}")
            return False
    
    def invalidate_token(self, token):
        """Invalidate token session"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            token_hash = hashlib.sha256(token.encode()).hexdigest()
            cursor.execute('''
                UPDATE user_sessions SET is_active = FALSE 
                WHERE token_hash = ?
            ''', (token_hash,))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"❌ Error invalidating token: {str(e)}")
    
    def log_user_activity(self, user_id, activity_type, description, additional_data=None):
        """Log user activity"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO user_activity (user_id, activity_type, description, ip_address, user_agent, additional_data)
                VALUES (?, ?, ?, ?, ?, ?)
            ''', (user_id, activity_type, description, 
                  request.remote_addr, request.headers.get('User-Agent', ''),
                  additional_data))
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"❌ Error logging user activity: {str(e)}")
    
    def user_exists(self, username, email):
        """Check if user exists by username or email"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT COUNT(*) FROM users 
                WHERE username = ? OR email = ?
            ''', (username, email))
            
            count = cursor.fetchone()[0]
            conn.close()
            
            return count > 0
        except Exception as e:
            logger.error(f"❌ Error checking user existence: {str(e)}")
            return False
    
    def create_user(self, username, email, password, full_name, role='patient', 
                    phone='', date_of_birth='', gender='', address='', emergency_contact='',
                    medical_history='', allergies='', current_medications='', chronic_conditions='',
                    blood_type='', height_cm='', weight_kg=''):
        """Create a new user with complete profile information"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Check if username already exists
            cursor.execute('SELECT id FROM users WHERE username = ?', (username,))
            if cursor.fetchone():
                conn.close()
                return {'success': False, 'message': 'Username already exists'}
            
            # Check if email already exists
            cursor.execute('SELECT id FROM users WHERE email = ?', (email,))
            if cursor.fetchone():
                conn.close()
                return {'success': False, 'message': 'Email already exists'}
            
            # Hash password
            password_hash = self.hash_password(password)
            
            # Convert empty strings to None for database
            def empty_to_none(value):
                return value if value and value.strip() else None
            
            # Insert user with all personal information
            cursor.execute('''
                INSERT INTO users (username, email, password_hash, full_name, role, is_active, email_verified,
                                 phone, date_of_birth, gender, address, emergency_contact)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (username, email, password_hash, full_name, role, True, False,
                  empty_to_none(phone), empty_to_none(date_of_birth), empty_to_none(gender), 
                  empty_to_none(address), empty_to_none(emergency_contact)))
            
            user_id = cursor.lastrowid
            
            # If this is a patient and medical information is provided, create enhanced patient record
            if role == 'patient' and any([medical_history, allergies, current_medications, chronic_conditions, blood_type, height_cm, weight_kg]):
                # Generate patient ID
                patient_id = f"PAT-{user_id:06d}"
                
                # Convert numeric fields
                height_val = int(height_cm) if height_cm and height_cm.strip().isdigit() else None
                weight_val = float(weight_kg) if weight_kg and weight_kg.strip().replace('.', '').isdigit() else None
                
                cursor.execute('''
                    INSERT INTO patients_enhanced (user_id, patient_id, medical_history, allergies, 
                                                 current_medications, chronic_conditions, blood_type, 
                                                 height_cm, weight_kg)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                ''', (user_id, patient_id, 
                      empty_to_none(medical_history), empty_to_none(allergies),
                      empty_to_none(current_medications), empty_to_none(chronic_conditions),
                      empty_to_none(blood_type), height_val, weight_val))
            
            conn.commit()
            conn.close()
            
            # Get the created user
            user = self.get_user_by_id(user_id)
            
            logger.info(f"✅ User created successfully: {username} (ID: {user_id}) with complete profile")
            return {'success': True, 'user': user}
            
        except Exception as e:
            logger.error(f"❌ Error creating user: {str(e)}")
            return {'success': False, 'message': f'Registration failed: {str(e)}'}
    
    def get_user_by_id(self, user_id):
        """Get user by ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('''
                SELECT id, username, email, full_name, role, is_active, created_at, last_login
                FROM users 
                WHERE id = ?
            ''', (user_id,))
            
            user_row = cursor.fetchone()
            conn.close()
            
            if user_row:
                return {
                    'id': user_row[0],
                    'username': user_row[1],
                    'email': user_row[2],
                    'full_name': user_row[3],
                    'role': user_row[4],
                    'is_active': user_row[5],
                    'created_at': user_row[6],
                    'last_login': user_row[7]
                }
            return None
        except Exception as e:
            logger.error(f"❌ Error getting user by ID: {str(e)}")
            return None
    
    def update_user_profile(self, user_id, updates):
        """Update user profile"""
        try:
            if not updates:
                return False
                
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Build dynamic query
            set_clauses = []
            values = []
            
            for field, value in updates.items():
                if field in ['full_name', 'email', 'phone', 'address']:
                    set_clauses.append(f"{field} = ?")
                    values.append(value)
            
            if not set_clauses:
                return False
            
            set_clauses.append("updated_at = CURRENT_TIMESTAMP")
            values.append(user_id)
            
            query = f"UPDATE users SET {', '.join(set_clauses)} WHERE id = ?"
            cursor.execute(query, values)
            
            conn.commit()
            conn.close()
            
            return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"❌ Error updating user profile: {str(e)}")
            return False
    
    def verify_user_password(self, user_id, password):
        """Verify password for a specific user ID"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute('SELECT password_hash FROM users WHERE id = ?', (user_id,))
            result = cursor.fetchone()
            conn.close()
            
            if result:
                return bcrypt.checkpw(password.encode('utf-8'), result[0].encode('utf-8'))
            return False
        except Exception as e:
            logger.error(f"❌ Error verifying password: {str(e)}")
            return False
    
    def update_password(self, user_id, new_password):
        """Update user password"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            password_hash = self.hash_password(new_password)
            
            cursor.execute('''
                UPDATE users 
                SET password_hash = ?, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ''', (password_hash, user_id))
            
            conn.commit()
            conn.close()
            
            return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"❌ Error updating password: {str(e)}")
            return False
    
    def delete_user(self, user_id):
        """Delete user account"""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Soft delete - set is_active to False
            cursor.execute('''
                UPDATE users 
                SET is_active = FALSE, updated_at = CURRENT_TIMESTAMP 
                WHERE id = ?
            ''', (user_id,))
            
            # Also deactivate all user sessions
            cursor.execute('''
                UPDATE user_sessions 
                SET is_active = FALSE 
                WHERE user_id = ?
            ''', (user_id,))
            
            conn.commit()
            conn.close()
            
            return cursor.rowcount > 0
        except Exception as e:
            logger.error(f"❌ Error deleting user: {str(e)}")
            return False

# Decorators for authentication and authorization
def require_auth(f):
    """Decorator to require authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({'error': 'Token is missing'}), 401
        
        if token.startswith('Bearer '):
            token = token[7:]
        
        auth_system = current_app.auth_system
        payload = auth_system.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Token is invalid or expired'}), 401
        
        request.current_user = payload
        return f(*args, **kwargs)
    
    return decorated_function

def require_role(required_role):
    """Decorator to require specific role"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            if not hasattr(request, 'current_user') or request.current_user['role'] != required_role:
                return jsonify({'error': 'Insufficient permissions'}), 403
            return f(*args, **kwargs)
        return decorated_function
    return decorator

def require_admin(f):
    """Decorator to require admin role"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if not hasattr(request, 'current_user') or request.current_user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        return f(*args, **kwargs)
    
    return decorated_function
