from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, get_jwt_identity
from app import db
from app.models.user import User
from app.utils.auth import user_required
from app.utils.helpers import success_response, error_response
import re

auth_bp = Blueprint('auth', __name__)

def validate_email(email):
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None

def validate_password(password):
    return len(password) >= 6

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        
        # Validasi input
        required_fields = ['name', 'email', 'password']
        for field in required_fields:
            if not data.get(field):
                return error_response(f'{field} is required', 400)
        
        name = data.get('name').strip()
        email = data.get('email').strip().lower()
        password = data.get('password')
        phone = data.get('phone', '').strip()
        role = data.get('role', 'user')
        
        # Validasi email format
        if not validate_email(email):
            return error_response('Invalid email format', 400)
        
        # Validasi password
        if not validate_password(password):
            return error_response('Password must be at least 6 characters', 400)
        
        # Validasi role
        if role not in ['user', 'admin']:
            role = 'user'
        
        # Cek apakah email sudah terdaftar
        if User.query.filter_by(email=email).first():
            return error_response('Email already registered', 400)
        
        # Buat user baru
        user = User(
            name=name,
            email=email,
            phone=phone,
            role=role
        )
        user.set_password(password)
        
        db.session.add(user)
        db.session.commit()
        
        # Buat access token
        access_token = create_access_token(identity=user.user_id)
        
        return success_response({
            'user': user.to_dict(),
            'access_token': access_token
        }, 'User registered successfully', 201)
        
    except Exception as e:
        db.session.rollback()
        return error_response('Registration failed', 500)

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')
        
        if not email or not password:
            return error_response('Email and password are required', 400)
        
        # Cari user berdasarkan email
        user = User.query.filter_by(email=email).first()
        
        if not user or not user.check_password(password):
            return error_response('Invalid email or password', 401)
        
        # Buat access token
        access_token = create_access_token(identity=user.user_id)
        
        return success_response({
            'user': user.to_dict(),
            'access_token': access_token
        }, 'Login successful')
        
    except Exception as e:
        return error_response('Login failed', 500)

@auth_bp.route('/profile', methods=['GET'])
@user_required
def get_profile(current_user):
    try:
        return success_response(current_user.to_dict(), 'Profile retrieved successfully')
    except Exception as e:
        return error_response('Failed to get profile', 500)

@auth_bp.route('/profile', methods=['PUT'])
@user_required
def update_profile(current_user):
    try:
        data = request.get_json()
        
        # Update fields yang diizinkan
        if 'name' in data:
            name = data['name'].strip()
            if name:
                current_user.name = name
        
        if 'phone' in data:
            current_user.phone = data['phone'].strip()
        
        # Update password jika disediakan
        if 'current_password' in data and 'new_password' in data:
            current_password = data['current_password']
            new_password = data['new_password']
            
            if not current_user.check_password(current_password):
                return error_response('Current password is incorrect', 400)
            
            if not validate_password(new_password):
                return error_response('New password must be at least 6 characters', 400)
            
            current_user.set_password(new_password)
        
        db.session.commit()
        
        return success_response(current_user.to_dict(), 'Profile updated successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Failed to update profile', 500)

@auth_bp.route('/change-password', methods=['PUT'])
@user_required
def change_password(current_user):
    try:
        data = request.get_json()
        
        current_password = data.get('current_password', '')
        new_password = data.get('new_password', '')
        confirm_password = data.get('confirm_password', '')
        
        if not all([current_password, new_password, confirm_password]):
            return error_response('All password fields are required', 400)
        
        if not current_user.check_password(current_password):
            return error_response('Current password is incorrect', 400)
        
        if new_password != confirm_password:
            return error_response('New passwords do not match', 400)
        
        if not validate_password(new_password):
            return error_response('New password must be at least 6 characters', 400)
        
        current_user.set_password(new_password)
        db.session.commit()
        
        return success_response(None, 'Password changed successfully')
        
    except Exception as e:
        db.session.rollback()
        return error_response('Failed to change password', 500)