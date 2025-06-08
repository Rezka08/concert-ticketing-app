from app import db
from datetime import datetime

class TicketType(db.Model):
    __tablename__ = 'ticket_types'
    
    ticket_type_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    concert_id = db.Column(db.Integer, db.ForeignKey('concerts.concert_id'), nullable=False)
    name = db.Column(db.String(100), nullable=False)
    price = db.Column(db.DECIMAL(10, 2), nullable=False)
    quantity_total = db.Column(db.Integer, nullable=False)
    quantity_available = db.Column(db.Integer, nullable=False)
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order_items = db.relationship('OrderItem', backref='ticket_type', lazy=True)
    
    def to_dict(self):
        return {
            'ticket_type_id': self.ticket_type_id,
            'concert_id': self.concert_id,
            'name': self.name,
            'price': float(self.price),
            'quantity_total': self.quantity_total,
            'quantity_available': self.quantity_available,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }