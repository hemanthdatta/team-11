#!/usr/bin/env python3

import sys
import os

# Add the current directory to the path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.database.database import engine, Base
from app.models.models import User, SocialAccount, Customer, Referral, Interaction, CustomerInteraction

def init_db():
    """Initialize database tables for production deployment"""
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        print("✅ Database tables created successfully!")
        
        # Create necessary directories
        os.makedirs("uploads/profile_images", exist_ok=True)
        print("✅ Upload directories created successfully!")
        
        return True
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        return False

if __name__ == "__main__":
    success = init_db()
    exit(0 if success else 1)
