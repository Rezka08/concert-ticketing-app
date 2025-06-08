from app import db
from datetime import datetime

class Concert(db.Model):
    __tablename__ = 'concerts'
    
    concert_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    title = db.Column(db.String(255), nullable=False)
    description = db.Column(db.Text)
    venue = db.Column(db.String(255), nullable=False)
    date = db.Column(db.Date, nullable=False)
    time = db.Column(db.Time, nullable=False)
    banner_image = db.Column(db.String(255))
    status = db.Column(db.Enum('upcoming', 'ongoing', 'completed'), default='upcoming')
    created_at = db.Column(db.TIMESTAMP, default=datetime.utcnow)
    updated_at = db.Column(db.TIMESTAMP, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    ticket_types = db.relationship('TicketType', backref='concert', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'concert_id': self.concert_id,
            'title': self.title,
            'description': self.description,
            'venue': self.venue,
            'date': self.date.isoformat() if self.date else None,
            'time': self.time.strftime('%H:%M:%S') if self.time else None,
            'banner_image': self.banner_image,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None,
            'ticket_types': [ticket.to_dict() for ticket in self.ticket_types] if self.ticket_types else []
        }