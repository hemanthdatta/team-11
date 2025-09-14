import os
import sys
import subprocess

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import engine, Base
from app.models.models import User, SocialAccount, Customer, Referral, Interaction, CustomerInteraction

def reset_and_migrate_db():
    # Check if database file exists and remove it
    db_file = "app.db"
    if os.path.exists(db_file):
        os.remove(db_file)
        print(f"Removed existing database: {db_file}")
    
    # Create all tables based on the models
    Base.metadata.create_all(bind=engine)
    print("Created database tables based on models")
    
    # Create a test user for testing purposes
    from app.models.models import User
    from sqlalchemy.orm import Session
    from app.database.database import get_db
    
    db = next(get_db())
    
    test_user = User(
        name="Test User",
        email="test@example.com",
        phone="1234567890",
        user_id="testuser123",
        business_name="Test Business",
        business_type="Service",
        location="City, Country",
        bio="This is a test user account.",
        profile_image="default.jpg",
        website="https://example.com"
    )
    test_user.set_password("password123")
    
    db.add(test_user)
    db.commit()
    print("Created test user: testuser123 / password123")
    
    print("Database reset and migrations completed successfully!")

if __name__ == "__main__":
    reset_and_migrate_db()
