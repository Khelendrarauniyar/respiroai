import logging
import sqlite3
import hashlib
import json
from datetime import datetime, timedelta
from functools import wraps
from flask import Blueprint, request, jsonify, current_app, Response
import jwt

# Configure logging
logger = logging.getLogger(__name__)

# Create Blueprint
auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

def require_auth(f):
    """Decorator to require authentication for routes"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({'error': 'Authorization token required'}), 401
        
        try:
            # Remove 'Bearer ' prefix
            token = token[7:]
            auth_system = current_app.auth_system
            payload = jwt.decode(token, auth_system.secret_key, algorithms=['HS256'])
            
            # Get user details
            user = auth_system.get_user_by_id(payload['user_id'])
            if not user:
                return jsonify({'error': 'User not found'}), 401
            
            request.current_user = user
            return f(*args, **kwargs)
            
        except jwt.ExpiredSignatureError:
            return jsonify({'error': 'Token has expired'}), 401
        except jwt.InvalidTokenError:
            return jsonify({'error': 'Invalid token'}), 401
    
    return decorated_function

# ========================================
# AUTHENTICATION ENDPOINTS
# ========================================

@auth_bp.route('/login', methods=['POST'])
def login():
    """User login"""
    try:
        data = request.get_json()
        if not data or not data.get('username') or not data.get('password'):
            return jsonify({'error': 'Username and password required'}), 400
        
        auth_system = current_app.auth_system
        
        # Authenticate user
        user = auth_system.authenticate_user(data['username'], data['password'])
        if not user:
            return jsonify({'error': 'Invalid credentials'}), 401
        
        if not user.get('is_active', True):
            return jsonify({'error': 'Account is disabled'}), 401
        
        # Generate token
        token = auth_system.generate_token(user['id'], user['role'])
        
        # Log activity
        auth_system.log_user_activity(
            user['id'], 
            'login', 
            'User logged in successfully'
        )
        
        logger.info(f"User logged in successfully: {data['username']}")
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'role': user['role'],
                'full_name': user.get('full_name', '')
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/register', methods=['POST'])
def register():
    """User registration"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'error': 'Registration data required'}), 400
        
        required_fields = ['username', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field.capitalize()} is required'}), 400
        
        auth_system = current_app.auth_system
        
        # Create user with all provided data
        result = auth_system.create_user(
            username=data['username'],
            email=data['email'],
            password=data['password'],
            full_name=data.get('full_name', ''),
            role=data.get('role', 'patient'),  # Default to patient role
            # Additional personal information
            phone=data.get('phone', ''),
            date_of_birth=data.get('date_of_birth', ''),
            gender=data.get('gender', ''),
            address=data.get('address', ''),
            emergency_contact=data.get('emergency_contact', ''),
            # Medical information
            medical_history=data.get('medical_history', ''),
            allergies=data.get('allergies', ''),
            current_medications=data.get('current_medications', ''),
            chronic_conditions=data.get('chronic_conditions', ''),
            blood_type=data.get('blood_type', ''),
            height_cm=data.get('height_cm', ''),
            weight_kg=data.get('weight_kg', '')
        )
        
        if not result['success']:
            return jsonify({'error': result['message']}), 400
        
        user = result['user']
        
        # Generate token
        token = auth_system.generate_token(user['id'], user['role'])
        
        # Log activity
        auth_system.log_user_activity(
            user['id'], 
            'registration', 
            'User registered successfully'
        )
        
        logger.info(f"User registered successfully: {data['username']}")
        
        return jsonify({
            'success': True,
            'token': token,
            'user': {
                'id': user['id'],
                'username': user['username'],
                'email': user['email'],
                'role': user['role'],
                'full_name': user.get('full_name', '')
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Registration error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    """User logout"""
    try:
        user = request.current_user
        auth_system = current_app.auth_system
        
        # Log activity
        auth_system.log_user_activity(
            user['id'], 
            'logout', 
            'User logged out successfully'
        )
        
        return jsonify({
            'success': True,
            'message': 'Logged out successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Logout error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/profile', methods=['GET', 'PUT'])
@require_auth
def profile():
    """Get or update user profile"""
    if request.method == 'GET':
        try:
            user = request.current_user
            auth_system = current_app.auth_system
            
            conn = sqlite3.connect(auth_system.db_path)
            cursor = conn.cursor()
            
            # Get full user data
            cursor.execute('''
                SELECT id, username, email, full_name, role, is_active, created_at, last_login,
                       phone, date_of_birth, gender, address, emergency_contact, medical_id,
                       profile_picture, subscription_type, subscription_expires
                FROM users WHERE id = ?
            ''', (user['id'],))
            
            user_row = cursor.fetchone()
            if not user_row:
                return jsonify({'error': 'User not found'}), 404
            
            user_data = {
                'id': user_row[0],
                'username': user_row[1],
                'email': user_row[2],
                'full_name': user_row[3],
                'role': user_row[4],
                'is_active': bool(user_row[5]),
                'created_at': user_row[6],
                'last_login': user_row[7],
                'phone': user_row[8],
                'date_of_birth': user_row[9],
                'gender': user_row[10],
                'address': user_row[11],
                'emergency_contact': user_row[12],
                'medical_id': user_row[13],
                'profile_picture': user_row[14],
                'subscription_type': user_row[15],
                'subscription_expires': user_row[16]
            }
            
            # Get medical information from patients_enhanced table if user is a patient
            if user_row[4] == 'patient':  # role is 'patient'
                cursor.execute('''
                    SELECT medical_history, allergies, current_medications, chronic_conditions,
                           blood_type, height_cm, weight_kg
                    FROM patients_enhanced WHERE user_id = ?
                ''', (user['id'],))
                
                medical_row = cursor.fetchone()
                if medical_row:
                    user_data.update({
                        'medical_history': medical_row[0],
                        'allergies': medical_row[1],
                        'current_medications': medical_row[2],
                        'chronic_conditions': medical_row[3],
                        'blood_type': medical_row[4],
                        'height_cm': medical_row[5],
                        'weight_kg': medical_row[6]
                    })
                else:
                    # Add empty medical fields if no record exists
                    user_data.update({
                        'medical_history': '',
                        'allergies': '',
                        'current_medications': '',
                        'chronic_conditions': '',
                        'blood_type': '',
                        'height_cm': '',
                        'weight_kg': ''
                    })
            
            # Get prediction count
            cursor.execute('SELECT COUNT(*) FROM predictions WHERE user_id = ?', (user['id'],))
            prediction_count = cursor.fetchone()[0]
            
            # Get recent activity
            cursor.execute('''
                SELECT activity_type, description, created_at, ip_address 
                FROM user_activity 
                WHERE user_id = ? 
                ORDER BY created_at DESC 
                LIMIT 5
            ''', (user['id'],))
            recent_activity = [
                {
                    'activity': row[0],
                    'description': row[1],
                    'timestamp': row[2],
                    'ip_address': row[3]
                }
                for row in cursor.fetchall()
            ]
            
            conn.close()
            
            profile_data = {
                **user_data,
                'statistics': {
                    'prediction_count': prediction_count,
                    'recent_activity': recent_activity
                }
            }
            
            return jsonify({
                'success': True,
                'user': profile_data
            }), 200
            
        except Exception as e:
            logger.error(f"Get profile error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500
    
    elif request.method == 'PUT':
        try:
            user = request.current_user
            auth_system = current_app.auth_system
            data = request.get_json()
            
            if not data:
                return jsonify({'error': 'No data provided'}), 400
            
            # Fields that can be updated in users table
            updatable_user_fields = ['full_name', 'email', 'phone', 'date_of_birth', 'gender', 
                                   'address', 'emergency_contact', 'medical_id']
            
            # Fields that can be updated in patients_enhanced table
            updatable_medical_fields = ['medical_history', 'allergies', 'current_medications', 
                                      'chronic_conditions', 'blood_type', 'height_cm', 'weight_kg']
            
            user_updates = {}
            medical_updates = {}
            
            for field in updatable_user_fields:
                if field in data:
                    user_updates[field] = data[field]
            
            for field in updatable_medical_fields:
                if field in data:
                    medical_updates[field] = data[field]
            
            if not user_updates and not medical_updates:
                return jsonify({'error': 'No valid fields to update'}), 400
            
            # Validate email if provided
            if 'email' in user_updates:
                email = user_updates['email']
                if not email or '@' not in email:
                    return jsonify({'error': 'Invalid email format'}), 400
                
                # Check if email already exists (for other users)
                conn = sqlite3.connect(auth_system.db_path)
                cursor = conn.cursor()
                cursor.execute('SELECT id FROM users WHERE email = ? AND id != ?', (email, user['id']))
                if cursor.fetchone():
                    conn.close()
                    return jsonify({'error': 'Email already exists'}), 400
                conn.close()
            
            # Validate phone if provided
            if 'phone' in user_updates:
                phone = user_updates['phone']
                if phone and len(phone.strip()) < 10:
                    return jsonify({'error': 'Phone number must be at least 10 digits'}), 400
            
            # Validate numeric fields in medical updates
            if 'height_cm' in medical_updates and medical_updates['height_cm']:
                try:
                    height = int(medical_updates['height_cm'])
                    if height <= 0 or height > 300:
                        return jsonify({'error': 'Height must be between 1-300 cm'}), 400
                    medical_updates['height_cm'] = height
                except ValueError:
                    return jsonify({'error': 'Height must be a valid number'}), 400
            
            if 'weight_kg' in medical_updates and medical_updates['weight_kg']:
                try:
                    weight = float(medical_updates['weight_kg'])
                    if weight <= 0 or weight > 500:
                        return jsonify({'error': 'Weight must be between 1-500 kg'}), 400
                    medical_updates['weight_kg'] = weight
                except ValueError:
                    return jsonify({'error': 'Weight must be a valid number'}), 400
            
            # Update user profile
            conn = sqlite3.connect(auth_system.db_path)
            cursor = conn.cursor()
            
            updated_fields = []
            
            # Update users table if there are user updates
            if user_updates:
                set_clause = ', '.join([f"{field} = ?" for field in user_updates.keys()])
                values = list(user_updates.values()) + [user['id']]
                
                cursor.execute(f'''
                    UPDATE users 
                    SET {set_clause}
                    WHERE id = ?
                ''', values)
                updated_fields.extend(user_updates.keys())
            
            # Update medical information if user is a patient and has medical updates
            if medical_updates and user['role'] == 'patient':
                # Check if patient record exists
                cursor.execute('SELECT id FROM patients_enhanced WHERE user_id = ?', (user['id'],))
                patient_exists = cursor.fetchone()
                
                if patient_exists:
                    # Update existing record
                    set_clause = ', '.join([f"{field} = ?" for field in medical_updates.keys()])
                    values = list(medical_updates.values()) + [user['id']]
                    
                    cursor.execute(f'''
                        UPDATE patients_enhanced 
                        SET {set_clause}
                        WHERE user_id = ?
                    ''', values)
                else:
                    # Create new patient record
                    patient_id = f"PAT-{user['id']:06d}"
                    fields = ['user_id', 'patient_id'] + list(medical_updates.keys())
                    values = [user['id'], patient_id] + list(medical_updates.values())
                    placeholders = ', '.join(['?'] * len(fields))
                    
                    cursor.execute(f'''
                        INSERT INTO patients_enhanced ({', '.join(fields)})
                        VALUES ({placeholders})
                    ''', values)
                
                updated_fields.extend(medical_updates.keys())
            
            # Log activity
            cursor.execute('''
                INSERT INTO user_activity (user_id, activity_type, description, ip_address, created_at)
                VALUES (?, ?, ?, ?, ?)
            ''', (
                user['id'],
                'profile_update',
                f"Updated profile fields: {', '.join(updated_fields)}",
                request.remote_addr,
                datetime.now().isoformat()
            ))
            
            conn.commit()
            conn.close()
            
            return jsonify({
                'success': True,
                'message': 'Profile updated successfully'
            }), 200
            
        except Exception as e:
            logger.error(f"Update profile error: {str(e)}")
            return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/admin/dashboard', methods=['GET'])
@require_auth
def admin_dashboard():
    """Admin dashboard data"""
    try:
        user = request.current_user
        
        if user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        auth_system = current_app.auth_system
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Get user statistics
        cursor.execute('SELECT COUNT(*) FROM users')
        total_users = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM users WHERE is_active = 1')
        active_users = cursor.fetchone()[0]
        
        cursor.execute('SELECT role, COUNT(*) FROM users GROUP BY role')
        role_stats = dict(cursor.fetchall())
        
        # Get system stats
        cursor.execute('SELECT COUNT(*) FROM predictions')
        total_predictions = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM patients')
        total_patients = cursor.fetchone()[0]
        
        conn.close()
        
        dashboard_data = {
            'users': {
                'total': total_users,
                'active': active_users,
                'inactive': total_users - active_users,
                'by_role': role_stats
            },
            'system': {
                'total_predictions': total_predictions,
                'total_patients': total_patients,
                'status': 'healthy'
            }
        }
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        logger.error(f"Admin dashboard error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/admin/users', methods=['GET'])
@require_auth
def admin_get_users():
    """Get users list for admin"""
    try:
        user = request.current_user
        
        if user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        auth_system = current_app.auth_system
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, full_name, role, is_active, created_at, last_login
            FROM users ORDER BY created_at DESC
        ''')
        
        users = []
        for row in cursor.fetchall():
            users.append({
                'id': row[0],
                'username': row[1],
                'email': row[2],
                'full_name': row[3],
                'role': row[4],
                'is_active': bool(row[5]),
                'created_at': row[6],
                'last_login': row[7]
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'users': users
        }), 200
        
    except Exception as e:
        logger.error(f"Admin get users error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/admin/users/<int:user_id>', methods=['GET'])
@require_auth
def admin_get_user_details(user_id):
    """Get specific user details for admin"""
    try:
        user = request.current_user
        
        if user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        auth_system = current_app.auth_system
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, username, email, full_name, role, is_active, 
                   created_at, last_login, phone, date_of_birth, 
                   gender, address, medical_id
            FROM users WHERE id = ?
        ''', (user_id,))
        
        row = cursor.fetchone()
        if not row:
            return jsonify({'error': 'User not found'}), 404
        
        # Get prediction count for this user
        cursor.execute('SELECT COUNT(*) FROM predictions WHERE user_id = ?', (user_id,))
        prediction_count = cursor.fetchone()[0]
        
        user_details = {
            'id': row[0],
            'username': row[1],
            'email': row[2],
            'full_name': row[3],
            'role': row[4],
            'is_active': bool(row[5]),
            'created_at': row[6],
            'last_login': row[7],
            'phone': row[8],
            'date_of_birth': row[9],
            'gender': row[10],
            'address': row[11],
            'medical_id': row[12],
            'statistics': {
                'total_predictions': prediction_count
            }
        }
        
        conn.close()
        
        return jsonify(user_details), 200
        
    except Exception as e:
        logger.error(f"Admin get user details error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/admin/users/<int:user_id>/toggle-status', methods=['POST'])
@require_auth
def admin_toggle_user_status(user_id):
    """Toggle user active status"""
    try:
        user = request.current_user
        
        if user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        # Don't allow disabling own account
        if user['id'] == user_id:
            return jsonify({'error': 'Cannot toggle your own account status'}), 400
        
        auth_system = current_app.auth_system
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Get current status
        cursor.execute('SELECT is_active FROM users WHERE id = ?', (user_id,))
        row = cursor.fetchone()
        if not row:
            return jsonify({'error': 'User not found'}), 404
        
        current_status = bool(row[0])
        new_status = not current_status
        
        # Update status
        cursor.execute('''
            UPDATE users 
            SET is_active = ?, updated_at = CURRENT_TIMESTAMP 
            WHERE id = ?
        ''', (new_status, user_id))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': f'User {"activated" if new_status else "deactivated"} successfully',
            'new_status': new_status
        }), 200
        
    except Exception as e:
        logger.error(f"Admin toggle user status error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# ========================================
# ADMIN SCANS/PREDICTIONS MANAGEMENT
# ========================================

@auth_bp.route('/admin/scans', methods=['GET'])
@require_auth
def admin_get_all_scans():
    """Get all scans/predictions for admin with patient and user details"""
    try:
        user = request.current_user
        
        if user['role'] != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        auth_system = current_app.auth_system
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Get all predictions with patient and user details
        cursor.execute('''
            SELECT 
                p.id, p.predicted_disease, p.confidence, p.image_path, p.created_at,
                pt.name as patient_name, pt.age as patient_age, pt.gender as patient_gender,
                u.username, u.full_name as user_full_name, u.email
            FROM predictions p
            LEFT JOIN patients pt ON p.patient_id = pt.id
            LEFT JOIN users u ON p.user_id = u.id
            ORDER BY p.created_at DESC
        ''')
        
        scans = []
        for row in cursor.fetchall():
            scans.append({
                'id': row[0],
                'predicted_disease': row[1],
                'confidence': row[2],
                'image_path': row[3],
                'created_at': row[4],
                'patient': {
                    'name': row[5],
                    'age': row[6],
                    'gender': row[7]
                },
                'user': {
                    'username': row[8],
                    'full_name': row[9],
                    'email': row[10]
                }
            })
        
        conn.close()
        return jsonify({'success': True, 'scans': scans}), 200
        
    except Exception as e:
        logger.error(f"Admin get all scans error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# ========================================
# PATIENT MANAGEMENT ENDPOINTS
# ========================================

@auth_bp.route('/patient/register', methods=['POST'])
@require_auth
def patient_register():
    """Register a new patient for the current user"""
    try:
        user = request.current_user
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['name', 'age', 'gender']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        auth_system = current_app.auth_system
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Insert new patient record (allow multiple patients per user)
        cursor.execute('''
            INSERT INTO patients (
                user_id, name, age, gender, contact, 
                address, emergency_contact, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
        ''', (
            user['id'],
            data['name'],
            data['age'],
            data['gender'],
            data.get('contact', ''),
            data.get('address', ''),
            data.get('emergency_contact', '')
        ))
        
        conn.commit()
        patient_id = cursor.lastrowid
        
        # Get the created patient record
        cursor.execute('''
            SELECT id, user_id, name, age, gender, contact, 
                   address, emergency_contact, created_at
            FROM patients WHERE id = ?
        ''', (patient_id,))
        
        patient_data = cursor.fetchone()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Patient registered successfully',
            'patient': {
                'id': patient_data[0],
                'user_id': patient_data[1],
                'name': patient_data[2],
                'age': patient_data[3],
                'gender': patient_data[4],
                'contact': patient_data[5],
                'address': patient_data[6],
                'emergency_contact': patient_data[7],
                'created_at': patient_data[8]
            }
        }), 201
        
    except Exception as e:
        logger.error(f"Patient registration error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/patients', methods=['GET'])
@require_auth
def get_user_patients():
    """Get all patients for the current user"""
    try:
        user = request.current_user
        auth_system = current_app.auth_system
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, user_id, name, age, gender, contact, 
                   address, emergency_contact, created_at
            FROM patients WHERE user_id = ?
            ORDER BY created_at DESC
        ''', (user['id'],))
        
        patients = []
        for row in cursor.fetchall():
            patients.append({
                'id': row[0],
                'user_id': row[1],
                'name': row[2],
                'age': row[3],
                'gender': row[4],
                'contact': row[5],
                'address': row[6],
                'emergency_contact': row[7],
                'created_at': row[8]
            })
        
        conn.close()
        return jsonify({'success': True, 'patients': patients}), 200
        
    except Exception as e:
        logger.error(f"Get user patients error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/patient/profile', methods=['GET'])
@require_auth
def get_patient_profile():
    """Get patient profile for the current user"""
    try:
        user = request.current_user
        auth_system = current_app.auth_system
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT id, user_id, name, age, gender, contact, 
                   address, emergency_contact, created_at
            FROM patients WHERE user_id = ?
        ''', (user['id'],))
        
        patient_data = cursor.fetchone()
        conn.close()
        
        if not patient_data:
            return jsonify({'error': 'Patient profile not found'}), 404
        
        return jsonify({
            'id': patient_data[0],
            'user_id': patient_data[1],
            'name': patient_data[2],
            'age': patient_data[3],
            'gender': patient_data[4],
            'contact': patient_data[5],
            'address': patient_data[6],
            'emergency_contact': patient_data[7],
            'created_at': patient_data[8]
        }), 200
        
    except Exception as e:
        logger.error(f"Get patient profile error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/patient/profile', methods=['PUT'])
@require_auth
def update_patient_profile():
    """Update patient profile for the current user"""
    try:
        user = request.current_user
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        auth_system = current_app.auth_system
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Check if patient exists
        cursor.execute('SELECT id FROM patients WHERE user_id = ?', (user['id'],))
        patient = cursor.fetchone()
        
        if not patient:
            return jsonify({'error': 'Patient profile not found'}), 404
        
        # Update patient record
        cursor.execute('''
            UPDATE patients 
            SET name = ?, age = ?, gender = ?, contact = ?, 
                address = ?, emergency_contact = ?, updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ''', (
            data.get('name'),
            data.get('age'),
            data.get('gender'),
            data.get('contact', ''),
            data.get('address', ''),
            data.get('emergency_contact', ''),
            user['id']
        ))
        
        conn.commit()
        
        # Get updated record
        cursor.execute('''
            SELECT id, user_id, name, age, gender, contact, 
                   address, emergency_contact, created_at
            FROM patients WHERE user_id = ?
        ''', (user['id'],))
        
        patient_data = cursor.fetchone()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Patient profile updated successfully',
            'patient': {
                'id': patient_data[0],
                'user_id': patient_data[1],
                'name': patient_data[2],
                'age': patient_data[3],
                'gender': patient_data[4],
                'contact': patient_data[5],
                'address': patient_data[6],
                'emergency_contact': patient_data[7],
                'created_at': patient_data[8]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Update patient profile error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/patient/<int:patient_id>', methods=['PUT'])
@require_auth
def update_patient_by_id(patient_id):
    """Update a specific patient by ID (for multi-patient support)"""
    try:
        user = request.current_user
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        # Validate required fields
        required_fields = ['name', 'age', 'gender']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        auth_system = current_app.auth_system
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Verify patient belongs to current user
        cursor.execute('''
            SELECT id FROM patients 
            WHERE id = ? AND user_id = ?
        ''', (patient_id, user['id']))
        
        patient = cursor.fetchone()
        if not patient:
            conn.close()
            return jsonify({'error': 'Patient not found or access denied'}), 404
        
        # Update patient record
        cursor.execute('''
            UPDATE patients 
            SET name = ?, age = ?, gender = ?, contact = ?, 
                address = ?, emergency_contact = ?, updated_at = CURRENT_TIMESTAMP
            WHERE id = ? AND user_id = ?
        ''', (
            data['name'],
            data['age'],
            data['gender'],
            data.get('contact', ''),
            data.get('address', ''),
            data.get('emergency_contact', ''),
            patient_id,
            user['id']
        ))
        
        conn.commit()
        
        # Get updated record
        cursor.execute('''
            SELECT id, user_id, name, age, gender, contact, 
                   address, emergency_contact, created_at
            FROM patients WHERE id = ?
        ''', (patient_id,))
        
        patient_data = cursor.fetchone()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Patient updated successfully',
            'patient': {
                'id': patient_data[0],
                'user_id': patient_data[1],
                'name': patient_data[2],
                'age': patient_data[3],
                'gender': patient_data[4],
                'contact': patient_data[5],
                'address': patient_data[6],
                'emergency_contact': patient_data[7],
                'created_at': patient_data[8]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Update patient by ID error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/patient/<int:patient_id>', methods=['GET'])
@require_auth
def get_patient_by_id(patient_id):
    """Get a specific patient by ID"""
    try:
        user = request.current_user
        auth_system = current_app.auth_system
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Verify patient belongs to current user
        cursor.execute('''
            SELECT id, user_id, name, age, gender, contact, 
                   address, emergency_contact, created_at
            FROM patients 
            WHERE id = ? AND user_id = ?
        ''', (patient_id, user['id']))
        
        patient_data = cursor.fetchone()
        conn.close()
        
        if not patient_data:
            return jsonify({'error': 'Patient not found or access denied'}), 404
        
        return jsonify({
            'success': True,
            'patient': {
                'id': patient_data[0],
                'user_id': patient_data[1],
                'name': patient_data[2],
                'age': patient_data[3],
                'gender': patient_data[4],
                'contact': patient_data[5],
                'address': patient_data[6],
                'emergency_contact': patient_data[7],
                'created_at': patient_data[8]
            }
        }), 200
        
    except Exception as e:
        logger.error(f"Get patient by ID error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/patient/<int:patient_id>', methods=['DELETE'])
@require_auth
def delete_patient_by_id(patient_id):
    """Delete a specific patient by ID"""
    try:
        user = request.current_user
        auth_system = current_app.auth_system
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Verify patient belongs to current user
        cursor.execute('''
            SELECT id FROM patients 
            WHERE id = ? AND user_id = ?
        ''', (patient_id, user['id']))
        
        patient = cursor.fetchone()
        if not patient:
            conn.close()
            return jsonify({'error': 'Patient not found or access denied'}), 404
        
        # Check if patient has any predictions
        cursor.execute('''
            SELECT COUNT(*) FROM predictions 
            WHERE patient_id = ?
        ''', (patient_id,))
        
        prediction_count = cursor.fetchone()[0]
        
        if prediction_count > 0:
            conn.close()
            return jsonify({
                'error': f'Cannot delete patient. Patient has {prediction_count} associated predictions.'
            }), 400
        
        # Delete patient
        cursor.execute('''
            DELETE FROM patients 
            WHERE id = ? AND user_id = ?
        ''', (patient_id, user['id']))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Patient deleted successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Delete patient by ID error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

# ========================================
# USER SETTINGS ENDPOINTS
# ========================================

@auth_bp.route('/settings', methods=['GET'])
@require_auth
def get_user_settings():
    """Get user settings and preferences"""
    try:
        user = request.current_user
        auth_system = current_app.auth_system
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Get user preferences (create table if not exists)
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS user_settings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER UNIQUE NOT NULL,
                email_notifications BOOLEAN DEFAULT TRUE,
                sms_notifications BOOLEAN DEFAULT FALSE,
                report_format TEXT DEFAULT 'pdf',
                language TEXT DEFAULT 'en',
                timezone TEXT DEFAULT 'UTC',
                theme TEXT DEFAULT 'light',
                auto_save BOOLEAN DEFAULT TRUE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id)
            )
        ''')
        
        # Get or create user settings
        cursor.execute('SELECT * FROM user_settings WHERE user_id = ?', (user['id'],))
        settings_row = cursor.fetchone()
        
        if not settings_row:
            # Create default settings for user
            cursor.execute('''
                INSERT INTO user_settings (user_id) VALUES (?)
            ''', (user['id'],))
            conn.commit()
            
            cursor.execute('SELECT * FROM user_settings WHERE user_id = ?', (user['id'],))
            settings_row = cursor.fetchone()
        
        conn.close()
        
        settings = {
            'emailNotifications': bool(settings_row[2]),
            'smsNotifications': bool(settings_row[3]),
            'reportFormat': settings_row[4],
            'language': settings_row[5],
            'timezone': settings_row[6],
            'theme': settings_row[7],
            'autoSave': bool(settings_row[8])
        }
        
        return jsonify({
            'success': True,
            'settings': settings
        }), 200
        
    except Exception as e:
        logger.error(f"Get user settings error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/settings', methods=['PUT'])
@require_auth
def update_user_settings():
    """Update user settings"""
    try:
        user = request.current_user
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No settings data provided'}), 400
        
        auth_system = current_app.auth_system
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Update settings
        cursor.execute('''
            UPDATE user_settings 
            SET email_notifications = ?, sms_notifications = ?, report_format = ?,
                language = ?, timezone = ?, theme = ?, auto_save = ?,
                updated_at = CURRENT_TIMESTAMP
            WHERE user_id = ?
        ''', (
            data.get('emailNotifications', True),
            data.get('smsNotifications', False),
            data.get('reportFormat', 'pdf'),
            data.get('language', 'en'),
            data.get('timezone', 'UTC'),
            data.get('theme', 'light'),
            data.get('autoSave', True),
            user['id']
        ))
        
        conn.commit()
        conn.close()
        
        return jsonify({
            'success': True,
            'message': 'Settings updated successfully'
        }), 200
        
    except Exception as e:
        logger.error(f"Update user settings error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/storage-info', methods=['GET'])
@require_auth
def get_storage_info():
    """Get storage usage information"""
    try:
        user = request.current_user
        auth_system = current_app.auth_system
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Get user's prediction count 
        cursor.execute('''
            SELECT COUNT(*) as prediction_count
            FROM predictions WHERE user_id = ?
        ''', (user['id'],))
        
        result = cursor.fetchone()
        prediction_count = result[0] if result else 0
        
        # Estimate storage usage based on prediction count (assume ~2MB per image)
        estimated_size_mb = prediction_count * 2  # 2MB per prediction estimate
        
        # Get file count from uploads folder (approximate)
        import os
        upload_folder = current_app.config.get('UPLOAD_FOLDER', 'uploads')
        file_count = 0
        if os.path.exists(upload_folder):
            file_count = len([f for f in os.listdir(upload_folder) if os.path.isfile(os.path.join(upload_folder, f))])
        
        conn.close()
        
        storage_info = {
            'totalUsed': round(estimated_size_mb, 2),  # MB
            'totalLimit': 100,  # 100MB limit per user
            'predictions': prediction_count,
            'files': file_count
        }
        
        return jsonify(storage_info), 200
        
    except Exception as e:
        logger.error(f"Get storage info error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/change-password', methods=['POST'])
@require_auth
def change_password():
    """Change user password"""
    try:
        user = request.current_user
        data = request.get_json()
        
        if not data:
            return jsonify({'error': 'No data provided'}), 400
        
        current_password = data.get('currentPassword')
        new_password = data.get('newPassword')
        
        if not current_password or not new_password:
            return jsonify({'error': 'Current password and new password are required'}), 400
        
        if len(new_password) < 6:
            return jsonify({'error': 'New password must be at least 6 characters long'}), 400
        
        auth_system = current_app.auth_system
        
        # Get user's current password hash
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        cursor.execute('SELECT password_hash FROM users WHERE id = ?', (user['id'],))
        result = cursor.fetchone()
        conn.close()
        
        if not result:
            return jsonify({'error': 'User not found'}), 404
        
        # Verify current password
        if not auth_system.verify_password(current_password, result[0]):
            return jsonify({'error': 'Current password is incorrect'}), 400
        
        # Update password
        success = auth_system.update_password(user['id'], new_password)
        
        if success:
            return jsonify({
                'success': True,
                'message': 'Password changed successfully'
            }), 200
        else:
            return jsonify({'error': 'Failed to update password'}), 500
        
    except Exception as e:
        logger.error(f"Change password error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/activity', methods=['GET'])
@require_auth
def get_user_activity():
    """Get user activity history"""
    try:
        user = request.current_user
        auth_system = current_app.auth_system
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Get recent predictions as activity
        cursor.execute('''
            SELECT p.id, p.predicted_disease, p.confidence, p.created_at, p.image_path
            FROM predictions p
            WHERE p.user_id = ?
            ORDER BY p.created_at DESC
            LIMIT 20
        ''', (user['id'],))
        
        activities = []
        for row in cursor.fetchall():
            activities.append({
                'id': row[0],
                'type': 'prediction',
                'description': f'Prediction: {row[1] or "Unknown"} (Confidence: {row[2]:.1f}%)' if row[2] else f'Prediction: {row[1] or "Unknown"}',
                'timestamp': row[3],
                'image_path': row[4]
            })
        
        # Add login activity (if we track it)
        if user.get('last_login'):
            activities.append({
                'id': 'login',
                'type': 'login',
                'description': 'Logged in to system',
                'timestamp': user.get('last_login')
            })
        
        conn.close()
        
        return jsonify({
            'success': True,
            'activities': activities
        }), 200
        
    except Exception as e:
        logger.error(f"Get user activity error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/export-data', methods=['GET'])
@require_auth
def export_user_data():
    """Export user's personal data"""
    try:
        user = request.current_user
        auth_system = current_app.auth_system
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Get user profile data
        cursor.execute('''
            SELECT id, username, email, full_name, role, phone, date_of_birth, 
                   gender, address, emergency_contact, medical_id, created_at, 
                   last_login, subscription_type, subscription_expires
            FROM users WHERE id = ?
        ''', (user['id'],))
        
        user_row = cursor.fetchone()
        if not user_row:
            return jsonify({'error': 'User not found'}), 404
        
        user_data = {
            'profile': {
                'id': user_row[0],
                'username': user_row[1],
                'email': user_row[2],
                'full_name': user_row[3],
                'role': user_row[4],
                'phone': user_row[5],
                'date_of_birth': user_row[6],
                'gender': user_row[7],
                'address': user_row[8],
                'emergency_contact': user_row[9],
                'medical_id': user_row[10],
                'created_at': user_row[11],
                'last_login': user_row[12],
                'subscription_type': user_row[13],
                'subscription_expires': user_row[14]
            }
        }
        
        # Get user's predictions
        cursor.execute('''
            SELECT p.predicted_disease, p.confidence, p.image_path, p.created_at, 
                   pt.name as patient_name, pt.age as patient_age, 
                   pt.gender as patient_gender, pt.contact as patient_contact
            FROM predictions p
            LEFT JOIN patients pt ON p.patient_id = pt.id
            WHERE p.user_id = ? 
            ORDER BY p.created_at DESC
        ''', (user['id'],))
        
        predictions = []
        for row in cursor.fetchall():
            predictions.append({
                'predicted_disease': row[0],
                'confidence': row[1],
                'image_path': row[2],
                'created_at': row[3],
                'patient_name': row[4],
                'patient_age': row[5],
                'patient_gender': row[6],
                'patient_contact': row[7]
            })
        
        user_data['predictions'] = predictions
        
        # Get user activity
        cursor.execute('''
            SELECT activity_type, description, ip_address, created_at
            FROM user_activity 
            WHERE user_id = ? 
            ORDER BY created_at DESC
        ''', (user['id'],))
        
        activities = []
        for row in cursor.fetchall():
            activities.append({
                'activity_type': row[0],
                'description': row[1],
                'ip_address': row[2],
                'created_at': row[3]
            })
        
        user_data['activity_history'] = activities
        
        # Add metadata
        user_data['export_metadata'] = {
            'exported_at': datetime.now().isoformat(),
            'exported_by': user['username'],
            'data_format_version': '1.0'
        }
        
        conn.close()
        
        # Create JSON response with proper headers for download
        json_data = json.dumps(user_data, indent=2, ensure_ascii=False)
        
        response = Response(
            json_data,
            mimetype='application/json',
            headers={
                'Content-Disposition': f'attachment; filename=user-data-{user["username"]}-{datetime.now().strftime("%Y-%m-%d")}.json',
                'Content-Type': 'application/json; charset=utf-8'
            }
        )
        
        # Log the export activity
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO user_activity (user_id, activity_type, description, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user['id'],
            'data_export',
            'User exported personal data',
            request.remote_addr,
            datetime.now().isoformat()
        ))
        conn.commit()
        conn.close()
        
        return response
        
    except Exception as e:
        logger.error(f"Export user data error: {str(e)}")
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/delete-account', methods=['DELETE'])
@require_auth
def delete_account():
    """Delete user account and all associated data"""
    try:
        user = request.current_user
        auth_system = current_app.auth_system
        
        # Only allow users to delete their own account
        # Admins should use admin panel for account management
        if user['role'] == 'admin':
            return jsonify({'error': 'Admin accounts cannot be deleted via this endpoint'}), 403
        
        conn = sqlite3.connect(auth_system.db_path)
        cursor = conn.cursor()
        
        # Log the account deletion attempt
        cursor.execute('''
            INSERT INTO user_activity (user_id, activity_type, description, ip_address, created_at)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            user['id'],
            'account_deletion',
            'User initiated account deletion',
            request.remote_addr,
            datetime.now().isoformat()
        ))
        
        # Delete associated data in correct order (due to foreign key constraints)
        
        # 1. Delete user activity logs
        cursor.execute('DELETE FROM user_activity WHERE user_id = ?', (user['id'],))
        
        # 2. Delete user sessions
        cursor.execute('DELETE FROM user_sessions WHERE user_id = ?', (user['id'],))
        
        # 3. Delete predictions
        cursor.execute('DELETE FROM predictions WHERE user_id = ?', (user['id'],))
        
        # 4. Delete patients associated with this user
        cursor.execute('DELETE FROM patients WHERE user_id = ?', (user['id'],))
        
        # 5. Delete enhanced patient data
        cursor.execute('DELETE FROM patients_enhanced WHERE user_id = ?', (user['id'],))
        
        # 6. Delete medical history
        cursor.execute('DELETE FROM medical_history WHERE patient_id IN (SELECT id FROM patients WHERE user_id = ?)', (user['id'],))
        
        # 7. Delete user settings
        cursor.execute('DELETE FROM user_settings WHERE user_id = ?', (user['id'],))
        
        # 8. Finally delete the user account
        cursor.execute('DELETE FROM users WHERE id = ?', (user['id'],))
        
        # Check if user was actually deleted
        if cursor.rowcount == 0:
            conn.rollback()
            conn.close()
            return jsonify({'error': 'User account not found'}), 404
        
        conn.commit()
        conn.close()
        
        logger.info(f"✅ Account deleted successfully: {user['username']} (ID: {user['id']})")
        
        return jsonify({
            'success': True,
            'message': 'Account and all associated data have been permanently deleted'
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Account deletion error: {str(e)}")
        return jsonify({'error': 'Failed to delete account. Please try again.'}), 500
