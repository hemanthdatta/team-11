import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal
from app.models.models import User as UserModel

def check_users():
    db = SessionLocal()
    try:
        users = db.query(UserModel).all()
        print(f"Found {len(users)} users in the database:")
        for user in users:
            print(f"  - ID: {user.id}, User ID: {user.user_id}, Name: {user.name}")
    finally:
        db.close()

if __name__ == "__main__":
    check_users()
