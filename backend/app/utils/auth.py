from functools import wraps
from flask import jsonify
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User

def user_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)
            
            if not current_user:
                return jsonify({'error': 'User not found'}), 404
            
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Token is invalid'}), 401
    
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            current_user = User.query.get(current_user_id)
            
            if not current_user:
                return jsonify({'error': 'User not found'}), 404
            
            if current_user.role != 'admin':
                return jsonify({'error': 'Admin access required'}), 403
            
            return f(current_user, *args, **kwargs)
        except Exception as e:
            return jsonify({'error': 'Token is invalid'}), 401
    
    return decorated_function