from datetime import datetime, timezone
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)
    
    checklist_items = db.relationship('ChecklistItem', backref='user', cascade='all, delete-orphan', lazy=True)
    events = db.relationship('Event', backref='user', cascade='all, delete-orphan', lazy=True)

class ChecklistItem(db.Model):
    __tablename__ = 'checklist_items'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    is_completed = db.Column(db.Boolean, default=False, nullable=False)
    created_at = db.Column(db.DateTime(timezone=True), server_default=db.func.now(), nullable=False)
    due_date = db.Column(db.DateTime(timezone=True), nullable=True)

    @property
    def age_in_hours(self) -> float:
        if not self.created_at:
            return 0.0
        return (datetime.now(timezone.utc) - self.created_at).total_seconds() / 3600.0

    @property
    def time_to_due_in_hours(self) -> float | None:
        if not self.due_date:
            return None
        return (self.due_date - datetime.now(timezone.utc)).total_seconds() / 3600.0

    def calculate_priority_score(self) -> float:
        age_score = self.age_in_hours
        if self.due_date is None:
            return age_score  # Pure staleness queue
        
        t_due = max(0.1, self.time_to_due_in_hours)
        urgency_multiplier = 1 + (100 / (t_due ** 1.5))
        return age_score + (urgency_multiplier * 1000)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "is_completed": self.is_completed,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "due_date": self.due_date.isoformat() if self.due_date else None,
            "priority_score": self.calculate_priority_score()
        }

class Event(db.Model):
    __tablename__ = 'events'
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    start_time = db.Column(db.DateTime(timezone=True), nullable=False)
    end_time = db.Column(db.DateTime(timezone=True), nullable=False)
    description = db.Column(db.String(500), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "start_time": self.start_time.isoformat() if self.start_time else None,
            "end_time": self.end_time.isoformat() if self.end_time else None,
            "description": self.description
        }