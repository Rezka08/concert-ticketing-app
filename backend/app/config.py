import os
from dotenv import load_dotenv

load_dotenv()

class Config:
    # FIX: Gunakan secret key yang sama untuk kedua konfigurasi
    JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY') or 'jwt-secret-string-dev-only'
    SECRET_KEY = JWT_SECRET_KEY  # Gunakan JWT_SECRET_KEY yang sama
    
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'mysql+pymysql://root:@localhost/concert_app2'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    JWT_ACCESS_TOKEN_EXPIRES = False  # Token tidak expire untuk development