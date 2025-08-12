"""
Admin Routes
Handles admin functionality for user management, system monitoring, analytics
"""

from flask import Blueprint, request, jsonify, current_app
import sqlite3
import logging
from datetime import datetime, timedelta
from functools import wraps

logger = logging.getLogger(__name__)

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def require_admin(f):
    """Decorator to require admin authentication"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        token = request.headers.get('Authorization')
        if not token or not token.startswith('Bearer '):
            return jsonify({'error': 'Token is missing'}), 401
        
        token = token[7:]
        auth_system = current_app.auth_system
        payload = auth_system.verify_token(token)
        
        if not payload:
            return jsonify({'error': 'Invalid token'}), 401
        
        if payload.get('role') != 'admin':
            return jsonify({'error': 'Admin access required'}), 403
        
        request.admin_user = payload
        return f(*args, **kwargs)
    
    return decorated_function

@admin_bp.route('/dashboard', methods=['GET'])
@require_admin
def admin_dashboard():
    """Get admin dashboard data"""
    try:
        conn = sqlite3.connect(current_app.config['DATABASE'])
        cursor = conn.cursor()
        
        # User statistics
        cursor.execute('SELECT COUNT(*) FROM users WHERE is_active = TRUE')
        total_users = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM users WHERE role = "admin"')
        admin_count = cursor.fetchone()[0]
        
        cursor.execute('SELECT COUNT(*) FROM users WHERE role = "patient"')
        patient_count = cursor.fetchone()[0]
        
        # Registration trends (last 30 days)
        cursor.execute('''
            SELECT DATE(created_at) as date, COUNT(*) as count
            FROM users 
            WHERE created_at >= DATE('now', '-30 days')
            GROUP BY DATE(created_at)
            ORDER BY date
        ''')
        registration_trends = cursor.fetchall()
        
        # Active users (last 7 days)
        try:
            cursor.execute('''
                SELECT COUNT(DISTINCT user_id) 
                FROM user_activity 
                WHERE created_at >= DATE('now', '-7 days')
            ''')
            active_users = cursor.fetchone()[0]
        except:
            active_users = 0
        
        # Prediction statistics
        try:
            cursor.execute('SELECT COUNT(*) FROM predictions')
            total_predictions = cursor.fetchone()[0]
        except:
            total_predictions = 0
        
        try:
            cursor.execute('''
                SELECT predicted_disease, COUNT(*) as count
                FROM predictions 
                GROUP BY predicted_disease
                ORDER BY count DESC
            ''')
            disease_distribution = cursor.fetchall()
        except:
            disease_distribution = []
        
        # Recent predictions (last 24 hours)
        try:
            cursor.execute('''
                SELECT COUNT(*) FROM predictions 
                WHERE created_at >= DATE('now', '-1 day')
            ''')
            recent_predictions = cursor.fetchone()[0]
        except:
            recent_predictions = 0
        
        # System performance
        try:
            cursor.execute('''
                SELECT AVG(confidence) as avg_confidence
                FROM predictions 
                WHERE created_at >= DATE('now', '-30 days')
            ''')
            avg_confidence = cursor.fetchone()[0] or 0
        except:
            avg_confidence = 0
        
        # Recent user activity
        try:
            cursor.execute('''
                SELECT ua.activity_type, ua.description, ua.created_at, u.username
                FROM user_activity ua
                JOIN users u ON ua.user_id = u.id
                ORDER BY ua.created_at DESC
                LIMIT 20
            ''')
            recent_activity = cursor.fetchall()
        except:
            recent_activity = []
        
        conn.close()
        
        dashboard_data = {
            'users': {
                'total': total_users,
                'admins': admin_count,
                'patients': patient_count,
                'active_7_days': active_users
            },
            'predictions': {
                'total': total_predictions,
                'recent_24h': recent_predictions,
                'avg_confidence': round(avg_confidence, 2),
                'disease_distribution': [
                    {'disease': row[0], 'count': row[1]} 
                    for row in disease_distribution
                ]
            },
            'trends': {
                'registrations': [
                    {'date': row[0], 'count': row[1]} 
                    for row in registration_trends
                ]
            },
            'recent_activity': [
                {
                    'action': row[0],
                    'description': row[1],
                    'timestamp': row[2],
                    'username': row[3]
                }
                for row in recent_activity
            ]
        }
        
        return jsonify(dashboard_data), 200
        
    except Exception as e:
        logger.error(f"❌ Admin dashboard error: {str(e)}")
        return jsonify({'error': 'Failed to fetch dashboard data'}), 500

@admin_bp.route('/users', methods=['GET'])
@require_admin
def get_users():
    """Get all users with pagination"""
    try:
        page = int(request.args.get('page', 1))
        per_page = int(request.args.get('per_page', 20))
        search = request.args.get('search', '')
        role_filter = request.args.get('role', '')
        
        offset = (page - 1) * per_page
        
        conn = sqlite3.connect(current_app.config['DATABASE'])
        cursor = conn.cursor()
        
        # Build query
        where_conditions = ['1=1']
        params = []
        
        if search:
            where_conditions.append('(username LIKE ? OR email LIKE ? OR full_name LIKE ?)')
            search_param = f'%{search}%'
            params.extend([search_param, search_param, search_param])
        
        if role_filter:
            where_conditions.append('role = ?')
            params.append(role_filter)
        
        where_clause = ' AND '.join(where_conditions)
        
        # Get total count
        cursor.execute(f'SELECT COUNT(*) FROM users WHERE {where_clause}', params)
        total_count = cursor.fetchone()[0]
        
        # Get users
        cursor.execute(f'''
            SELECT id, username, email, full_name, role, is_active, 
                   created_at, last_login, medical_id
            FROM users 
            WHERE {where_clause}
            ORDER BY created_at DESC
            LIMIT ? OFFSET ?
        ''', params + [per_page, offset])
        
        users = cursor.fetchall()
        
        # Get prediction counts for each user
        user_data = []
        for user in users:
            cursor.execute('SELECT COUNT(*) FROM predictions WHERE user_id = ?', (user[0],))
            prediction_count = cursor.fetchone()[0]
            
            user_data.append({
                'id': user[0],
                'username': user[1],
                'email': user[2],
                'full_name': user[3],
                'role': user[4],
                'is_active': bool(user[5]),
                'created_at': user[6],
                'last_login': user[7],
                'medical_id': user[8],
                'prediction_count': prediction_count
            })
        
        conn.close()
        
        return jsonify({
            'users': user_data,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': total_count,
                'pages': (total_count + per_page - 1) // per_page
            }
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Get users error: {str(e)}")
        return jsonify({'error': 'Failed to fetch users'}), 500

@admin_bp.route('/users/<int:user_id>', methods=['GET'])
@require_admin
def get_user_details(user_id):
    """Get detailed user information"""
    try:
        conn = sqlite3.connect(current_app.config['DATABASE'])
        cursor = conn.cursor()
        
        # Get user details
        cursor.execute('''
            SELECT u.*, p.medical_history, p.allergies, p.current_medications,
                   p.chronic_conditions, p.blood_type, p.height_cm, p.weight_kg
            FROM users u
            LEFT JOIN patients_enhanced p ON u.id = p.user_id
            WHERE u.id = ?
        ''', (user_id,))
        
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Get user's predictions
        cursor.execute('''
            SELECT id, predicted_disease, confidence, created_at
            FROM predictions 
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 10
        ''', (user_id,))
        predictions = cursor.fetchall()
        
        # Get user's activity
        cursor.execute('''
            SELECT action, description, created_at
            FROM user_activity
            WHERE user_id = ?
            ORDER BY created_at DESC
            LIMIT 20
        ''', (user_id,))
        activity = cursor.fetchall()
        
        conn.close()
        
        user_details = {
            'id': user[0],
            'username': user[1],
            'email': user[2],
            'password_hash': '***',  # Don't expose password hash
            'full_name': user[4],
            'phone': user[5],
            'date_of_birth': user[6],
            'gender': user[7],
            'address': user[8],
            'emergency_contact': user[9],
            'role': user[10],
            'is_active': bool(user[11]),
            'medical_id': user[12],
            'created_at': user[13],
            'updated_at': user[14],
            'last_login': user[15],
            'subscription_type': user[16],
            'medical_profile': {
                'medical_history': user[17],
                'allergies': user[18],
                'current_medications': user[19],
                'chronic_conditions': user[20],
                'blood_type': user[21],
                'height_cm': user[22],
                'weight_kg': user[23]
            },
            'recent_predictions': [
                {
                    'id': pred[0],
                    'disease': pred[1],
                    'confidence': pred[2],
                    'date': pred[3]
                }
                for pred in predictions
            ],
            'recent_activity': [
                {
                    'action': act[0],
                    'description': act[1],
                    'timestamp': act[2]
                }
                for act in activity
            ]
        }
        
        return jsonify(user_details), 200
        
    except Exception as e:
        logger.error(f"❌ Get user details error: {str(e)}")
        return jsonify({'error': 'Failed to fetch user details'}), 500

@admin_bp.route('/users/<int:user_id>/toggle-status', methods=['POST'])
@require_admin
def toggle_user_status(user_id):
    """Toggle user active/inactive status"""
    try:
        conn = sqlite3.connect(current_app.config['DATABASE'])
        cursor = conn.cursor()
        
        # Get current status
        cursor.execute('SELECT is_active, username FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Toggle status
        new_status = not user[0]
        cursor.execute('UPDATE users SET is_active = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
                      (new_status, user_id))
        
        conn.commit()
        conn.close()
        
        # Log activity
        auth_system = current_app.auth_system
        action = 'USER_ACTIVATED' if new_status else 'USER_DEACTIVATED'
        auth_system.log_user_activity(
            request.admin_user['user_id'], 
            action, 
            f"User {user[1]} {'activated' if new_status else 'deactivated'} by admin"
        )
        
        return jsonify({
            'message': f"User {'activated' if new_status else 'deactivated'} successfully",
            'is_active': new_status
        }), 200
        
    except Exception as e:
        logger.error(f"❌ Toggle user status error: {str(e)}")
        return jsonify({'error': 'Failed to toggle user status'}), 500

@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@require_admin
def update_user_role(user_id):
    """Update user role"""
    try:
        data = request.get_json()
        new_role = data.get('role')
        
        if new_role not in ['admin', 'patient']:
            return jsonify({'error': 'Invalid role'}), 400
        
        conn = sqlite3.connect(current_app.config['DATABASE'])
        cursor = conn.cursor()
        
        # Get user
        cursor.execute('SELECT username FROM users WHERE id = ?', (user_id,))
        user = cursor.fetchone()
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        # Update role
        cursor.execute('UPDATE users SET role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', 
                      (new_role, user_id))
        
        conn.commit()
        conn.close()
        
        # Log activity
        auth_system = current_app.auth_system
        auth_system.log_user_activity(
            request.admin_user['user_id'], 
            'ROLE_CHANGE', 
            f"User {user[0]} role changed to {new_role} by admin"
        )
        
        return jsonify({'message': 'User role updated successfully'}), 200
        
    except Exception as e:
        logger.error(f"❌ Update user role error: {str(e)}")
        return jsonify({'error': 'Failed to update user role'}), 500

@admin_bp.route('/system/stats', methods=['GET'])
@require_admin
def system_statistics():
    """Get comprehensive system statistics"""
    try:
        conn = sqlite3.connect(current_app.config['DATABASE'])
        cursor = conn.cursor()
        
        # Model performance stats
        cursor.execute('''
            SELECT predicted_disease, 
                   COUNT(*) as total,
                   AVG(confidence) as avg_confidence,
                   MAX(confidence) as max_confidence,
                   MIN(confidence) as min_confidence
            FROM predictions 
            GROUP BY predicted_disease
        ''')
        model_stats = cursor.fetchall()
        
        # Daily prediction trends (last 30 days)
        cursor.execute('''
            SELECT DATE(created_at) as date, 
                   COUNT(*) as total,
                   COUNT(CASE WHEN predicted_disease = 'pneumonia' THEN 1 END) as pneumonia,
                   COUNT(CASE WHEN predicted_disease = 'tuberculosis' THEN 1 END) as tuberculosis,
                   COUNT(CASE WHEN predicted_disease = 'lung_cancer' THEN 1 END) as lung_cancer
            FROM predictions 
            WHERE created_at >= DATE('now', '-30 days')
            GROUP BY DATE(created_at)
            ORDER BY date
        ''')
        daily_trends = cursor.fetchall()
        
        # User engagement stats
        cursor.execute('''
            SELECT action, COUNT(*) as count
            FROM user_activity
            WHERE created_at >= DATE('now', '-30 days')
            GROUP BY action
            ORDER BY count DESC
        ''')
        user_engagement = cursor.fetchall()
        
        conn.close()
        
        stats = {
            'model_performance': [
                {
                    'disease': row[0],
                    'total_predictions': row[1],
                    'avg_confidence': round(row[2], 3),
                    'max_confidence': round(row[3], 3),
                    'min_confidence': round(row[4], 3)
                }
                for row in model_stats
            ],
            'daily_trends': [
                {
                    'date': row[0],
                    'total': row[1],
                    'pneumonia': row[2],
                    'tuberculosis': row[3],
                    'lung_cancer': row[4]
                }
                for row in daily_trends
            ],
            'user_engagement': [
                {
                    'action': row[0],
                    'count': row[1]
                }
                for row in user_engagement
            ]
        }
        
        return jsonify(stats), 200
        
    except Exception as e:
        logger.error(f"❌ System statistics error: {str(e)}")
        return jsonify({'error': 'Failed to fetch system statistics'}), 500

@admin_bp.route('/notifications', methods=['POST'])
@require_admin
def create_notification():
    """Create system-wide notification"""
    try:
        data = request.get_json()
        
        required_fields = ['title', 'message', 'type']
        for field in required_fields:
            if not data.get(field):
                return jsonify({'error': f'{field} is required'}), 400
        
        conn = sqlite3.connect(current_app.config['DATABASE'])
        cursor = conn.cursor()
        
        # Insert notification
        cursor.execute('''
            INSERT INTO notifications (title, message, type, created_by)
            VALUES (?, ?, ?, ?)
        ''', (data['title'], data['message'], data['type'], request.admin_user['user_id']))
        
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Notification created successfully'}), 201
        
    except Exception as e:
        logger.error(f"❌ Create notification error: {str(e)}")
        return jsonify({'error': 'Failed to create notification'}), 500
