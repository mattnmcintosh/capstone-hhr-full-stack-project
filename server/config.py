import os
from dotenv import load_dotenv

load_dotenv()
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

class Config:
    SQLALCHEMY_DATABASE_URI = os.getenv("DATABASE_URL", f"sqlite:///{os.path.join(BASE_DIR, 'app.db')}")
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    FLASK_DEBUG = os.getenv("FLASK_DEBUG", "True").lower() == "true"
    CLIENT_ORIGIN = os.getenv("CLIENT_ORIGIN", "http://localhost:5173")
    JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "RZdcofJ+r6yL52JhBHCfZHrFJJvyCzg6zw5vhxBWwK4=")