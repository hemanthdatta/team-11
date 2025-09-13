import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal
from app.models.models import User as UserModel

def create_test_user():
    db = SessionLocal()
    try:
        # Check if test user already exists
        existing_user = db.query(UserModel).filter(UserModel.user_id == "testuser123").first()
        if existing_user:
            print(f"Test user already exists with ID: {existing_user.id}")
            return
        
        # Create new test user
        test_user = UserModel(
            name="Test User 123",
            user_id="testuser123"
        )
        test_user.set_password("password123")
        
        db.add(test_user)
        db.commit()
        db.refresh(test_user)
        
        print(f"Created test user with ID: {test_user.id}, User ID: {test_user.user_id}")
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()
