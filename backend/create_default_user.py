# backend/create_default_users.py
"""
Script untuk membuat default users untuk testing
Jalankan dengan: python create_default_users.py
"""

import sys
import os

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.user import User

def create_default_users():
    app = create_app()
    
    with app.app_context():
        try:
            print("Creating default users...")
            
            # Delete existing users if they exist
            admin_user = User.query.filter_by(email='admin2@gmail.com').first()
            if admin_user:
                db.session.delete(admin_user)
                print("Deleted existing admin user")

            regular_user = User.query.filter_by(email='user2@gmail.com').first()
            if regular_user:
                db.session.delete(regular_user)
                print("Deleted existing regular user")
            
            db.session.commit()
            
            # Create admin user
            admin = User(
                name='Admin User',
                email='admin2@gmail.com',
                role='admin',
                phone='081234567890'
            )
            admin.set_password('password')
            db.session.add(admin)
            print("Created admin user: admin2@gmail.com / password")
            
            # Create regular user
            user = User(
                name='Regular User',
                email='user2@gmail.com',
                role='user',
                phone='081234567891'
            )
            user.set_password('password')
            db.session.add(user)
            print("Created regular user: user2@gmail.com / password")
            
            # Commit changes
            db.session.commit()
            print("Default users created successfully!")
            
            # Test password verification
            print("\nTesting password verification...")
            admin_test = User.query.filter_by(email='admin2@gmail.com').first()
            if admin_test and admin_test.check_password('password'):
                print("✅ Admin password verification: SUCCESS")
            else:
                print("❌ Admin password verification: FAILED")
            
            user_test = User.query.filter_by(email='user2@gmail.com').first()
            if user_test and user_test.check_password('password'):
                print("✅ Regular user password verification: SUCCESS")
            else:
                print("❌ Regular user password verification: FAILED")
            
            # Test JWT token creation with string identity
            print("\nTesting JWT token creation...")
            from flask_jwt_extended import create_access_token
            
            try:
                # Test token creation with string identity
                admin_token = create_access_token(identity=str(admin_test.user_id))
                print(f"✅ Admin token created successfully: {admin_token[:50]}...")
                
                user_token = create_access_token(identity=str(user_test.user_id))
                print(f"✅ User token created successfully: {user_token[:50]}...")
                
                print("🎉 All JWT tokens now use string identity - this should fix the 'Subject must be a string' error!")
                
            except Exception as token_error:
                print(f"❌ Token creation failed: {str(token_error)}")
                
        except Exception as e:
            print(f"Error creating default users: {str(e)}")
            db.session.rollback()
            raise

if __name__ == '__main__':
    create_default_users()