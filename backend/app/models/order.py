from app import db
from datetime import datetime

class Order(db.Model):
    __tablename__ = 'orders'
    
    order_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.user_id'), nullable=False)
    total_amount = db.Column(db.DECIMAL(10, 2), nullable=False)
    status = db.Column(db.Enum('pending', 'payment_submitted', 'paid', 'cancelled'), default='pending')  # UPDATE: Tambah status baru
    payment_method = db.Column(db.String(50))
    payment_submitted_at = db.Column(db.TIMESTAMP, nullable=True)  # NEW: Track kapan payment disubmit
    payment_verified_at = db.Column(db.TIMESTAMP, nullable=True)   # NEW: Track kapan payment diverify admin
    admin_notes = db.Column(db.Text, nullable=True)               # NEW: Catatan admin
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='order', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'order_id': self.order_id,
            'user_id': self.user_id,
            'total_amount': float(self.total_amount),
            'status': self.status,
            'payment_method': self.payment_method,
            'payment_submitted_at': self.payment_submitted_at.isoformat() if self.payment_submitted_at else None,
            'payment_verified_at': self.payment_verified_at.isoformat() if self.payment_verified_at else None,
            'admin_notes': self.admin_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'order_items': [item.to_dict() for item in self.order_items] if self.order_items else [],
            'user': self.user.to_dict() if self.user else None
        }