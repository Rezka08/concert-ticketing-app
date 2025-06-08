from app import db

def save_to_db(obj):
    """Helper function to save object to database"""
    try:
        db.session.add(obj)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        return False

def delete_from_db(obj):
    """Helper function to delete object from database"""
    try:
        db.session.delete(obj)
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        return False

def commit_changes():
    """Helper function to commit changes to database"""
    try:
        db.session.commit()
        return True
    except Exception as e:
        db.session.rollback()
        return False