from app import db
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime

class User(db.Model):
    __tablename__ = 'users'
    
    user_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), nullable=False, unique=True)
    password = db.Column(db.String(255), nullable=False)
    role = db.Column(db.Enum('user', 'admin'), default='user')
    phone = db.Column(db.String(20))
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    orders = db.relationship('Order', backref='user', lazy=True, cascade='all, delete-orphan')
    
    def set_password(self, password):
        """Set password with proper hashing"""
        try:
            # Use pbkdf2:sha256 method for better compatibility
            self.password = generate_password_hash(password, method='pbkdf2:sha256')
            print(f"Password hashed successfully for user: {self.email}")
        except Exception as e:
            print(f"Error hashing password for user {self.email}: {str(e)}")
            # Fallback to default method
            self.password = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        try:
            result = check_password_hash(self.password, password)
            print(f"Password check for {self.email}: {'SUCCESS' if result else 'FAILED'}")
            return result
        except Exception as e:
            print(f"Error checking password for user {self.email}: {str(e)}")
            return False
    
    def to_dict(self):
        return {
            'user_id': self.user_id,
            'name': self.name,
            'email': self.email,
            'role': self.role,
            'phone': self.phone,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }