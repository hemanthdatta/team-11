import sys
import os
import requests
import json

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal
from app.models.models import User as UserModel
from app.core.security import verify_password

def test_login(user_id, password):
    # Test using the actual API
    try:
        response = requests.post(
            "http://localhost:8000/auth/login",
            headers={'Content-Type': 'application/json'},
            data=json.dumps({"user_id": user_id, "password": password})
        )
        print(f"API Login Response Status: {response.status_code}")
        print(f"API Login Response: {response.text}")
        
        if response.status_code == 200:
            print("Login successful!")
            return True
        else:
            print("Login failed!")
            return False
    except Exception as e:
        print(f"Error during API login: {e}")
        return False

if __name__ == "__main__":
    # Test with the new test user
    print("Testing login with user 'testuser123' and password 'password123'")
    test_login("testuser123", "password123")
