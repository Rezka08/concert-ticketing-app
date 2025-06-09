from functools import wraps
from flask import jsonify, request
from flask_jwt_extended import verify_jwt_in_request, get_jwt_identity
from app.models.user import User
import traceback

def user_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            print("=== AUTH VERIFICATION DEBUG ===")
            
            # Check if Authorization header exists
            auth_header = request.headers.get('Authorization')
            print(f"Authorization header: {auth_header}")
            
            if not auth_header:
                print("No Authorization header found")
                return jsonify({'error': 'No authorization header'}), 401
            
            if not auth_header.startswith('Bearer '):
                print("Authorization header doesn't start with Bearer")
                return jsonify({'error': 'Invalid authorization header format'}), 401
            
            token = auth_header.split(' ')[1] if len(auth_header.split(' ')) > 1 else None
            print(f"Extracted token: {token[:50] if token else 'None'}...")
            
            # Verify JWT
            print("Verifying JWT...")
            verify_jwt_in_request()
            print("JWT verification successful")
            
            # Get user identity from token (now it's a string)
            current_user_id_str = get_jwt_identity()
            print(f"Current user ID from token (string): '{current_user_id_str}'")
            
            if not current_user_id_str:
                print("No user ID found in token")
                return jsonify({'error': 'Invalid token: no user identity'}), 401
            
            # FIXED: Convert string identity back to integer
            try:
                current_user_id = int(current_user_id_str)
                print(f"Converted user ID to integer: {current_user_id}")
            except (ValueError, TypeError) as e:
                print(f"Failed to convert user ID '{current_user_id_str}' to integer: {e}")
                return jsonify({'error': 'Invalid user ID in token'}), 401
            
            # Get user from database
            print(f"Fetching user with ID: {current_user_id}")
            current_user = User.query.get(current_user_id)
            
            if not current_user:
                print(f"User with ID {current_user_id} not found in database")
                return jsonify({'error': 'User not found'}), 404
            
            print(f"User found: {current_user.name} ({current_user.email})")
            print("=== AUTH VERIFICATION SUCCESS ===")
            
            return f(current_user, *args, **kwargs)
            
        except Exception as e:
            print("=== AUTH VERIFICATION ERROR ===")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            
            # Return more specific error messages based on exception type
            error_message = str(e)
            if 'expired' in error_message.lower():
                return jsonify({'error': 'Token has expired'}), 401
            elif 'invalid' in error_message.lower() or 'decode' in error_message.lower():
                return jsonify({'error': 'Invalid token format'}), 401
            elif 'signature' in error_message.lower():
                return jsonify({'error': 'Invalid token signature'}), 401
            elif 'subject must be a string' in error_message.lower():
                return jsonify({'error': 'Token format incompatible - please login again'}), 401
            else:
                return jsonify({'error': 'Token verification failed'}), 401
    
    return decorated_function

def admin_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        try:
            print("=== ADMIN AUTH VERIFICATION DEBUG ===")
            
            # Check if Authorization header exists
            auth_header = request.headers.get('Authorization')
            print(f"Authorization header: {auth_header}")
            
            if not auth_header:
                print("No Authorization header found")
                return jsonify({'error': 'No authorization header'}), 401
            
            # Verify JWT
            print("Verifying JWT...")
            verify_jwt_in_request()
            print("JWT verification successful")
            
            # Get user identity from token (now it's a string)
            current_user_id_str = get_jwt_identity()
            print(f"Current user ID from token (string): '{current_user_id_str}'")
            
            if not current_user_id_str:
                print("No user ID found in token")
                return jsonify({'error': 'Invalid token: no user identity'}), 401
            
            # FIXED: Convert string identity back to integer
            try:
                current_user_id = int(current_user_id_str)
                print(f"Converted user ID to integer: {current_user_id}")
            except (ValueError, TypeError) as e:
                print(f"Failed to convert user ID '{current_user_id_str}' to integer: {e}")
                return jsonify({'error': 'Invalid user ID in token'}), 401
            
            # Get user from database
            print(f"Fetching user with ID: {current_user_id}")
            current_user = User.query.get(current_user_id)
            
            if not current_user:
                print(f"User with ID {current_user_id} not found in database")
                return jsonify({'error': 'User not found'}), 404
            
            print(f"User found: {current_user.name} ({current_user.email}) - Role: {current_user.role}")
            
            # Check admin role
            if current_user.role != 'admin':
                print(f"User {current_user.name} is not an admin (role: {current_user.role})")
                return jsonify({'error': 'Admin access required'}), 403
            
            print("=== ADMIN AUTH VERIFICATION SUCCESS ===")
            
            return f(current_user, *args, **kwargs)
            
        except Exception as e:
            print("=== ADMIN AUTH VERIFICATION ERROR ===")
            print(f"Error type: {type(e).__name__}")
            print(f"Error message: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            
            # Return more specific error messages based on exception type
            error_message = str(e)
            if 'expired' in error_message.lower():
                return jsonify({'error': 'Token has expired'}), 401
            elif 'invalid' in error_message.lower() or 'decode' in error_message.lower():
                return jsonify({'error': 'Invalid token format'}), 401
            elif 'signature' in error_message.lower():
                return jsonify({'error': 'Invalid token signature'}), 401
            elif 'subject must be a string' in error_message.lower():
                return jsonify({'error': 'Token format incompatible - please login again'}), 401
            else:
                return jsonify({'error': 'Token verification failed'}), 401
    
    return decorated_function