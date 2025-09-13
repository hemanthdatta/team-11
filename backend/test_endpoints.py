import requests
import json

BASE_URL = "http://localhost:8000"

def test_dashboard_endpoint():
    """Test the dashboard metrics endpoint"""
    print("Testing Dashboard Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/dashboard/?user_id=1")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Dashboard Data:")
            print(json.dumps(data, indent=2))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")
    print()

def test_customers_endpoint():
    """Test the customers endpoint"""
    print("Testing Customers Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/customers/?user_id=1")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} customers")
            print("Customers Data:")
            print(json.dumps(data[:3], indent=2))  # Show first 3 customers
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")
    print()

def test_referrals_endpoint():
    """Test the referrals endpoint"""
    print("Testing Referrals Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/referrals/?user_id=1")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} referrals")
            print("Referrals Data:")
            print(json.dumps(data[:3], indent=2))  # Show first 3 referrals
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")
    print()

def test_referral_stats_endpoint():
    """Test the referral stats endpoint"""
    print("Testing Referral Stats Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/referrals/stats?user_id=1")
        print(f"Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Referral Stats Data:")
            print(json.dumps(data, indent=2))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception: {e}")
    print()

def test_digital_presence_endpoints():
    """Test the digital presence endpoints"""
    print("Testing Digital Presence Endpoints...")
    
    # Test website info
    try:
        response = requests.get(f"{BASE_URL}/digital-presence/website/1")
        print(f"Website Info Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("Website Info:")
            print(json.dumps(data, indent=2))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception in website info: {e}")
    
    # Test templates
    try:
        response = requests.get(f"{BASE_URL}/digital-presence/templates")
        print(f"Templates Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} templates")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception in templates: {e}")
    print()

def test_messaging_endpoints():
    """Test the messaging endpoints"""
    print("Testing Messaging Endpoints...")
    
    # Test message templates
    try:
        response = requests.get(f"{BASE_URL}/messaging/message-templates")
        print(f"Message Templates Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} message templates")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception in message templates: {e}")
    print()

def test_ai_assistant_endpoints():
    """Test the AI assistant endpoints"""
    print("Testing AI Assistant Endpoints...")
    
    # Test AI assist
    try:
        response = requests.post(
            f"{BASE_URL}/ai/assist",
            json={"prompt": "How can I improve my customer engagement?"}
        )
        print(f"AI Assist Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print("AI Response:")
            print(json.dumps(data, indent=2))
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception in AI assist: {e}")
    
    # Test message templates
    try:
        response = requests.get(f"{BASE_URL}/messaging/message-templates")
        print(f"AI Message Templates Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Found {len(data)} AI message templates")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Exception in AI message templates: {e}")
    print()

if __name__ == "__main__":
    print("Testing all backend endpoints...\n")
    
    test_dashboard_endpoint()
    test_customers_endpoint()
    test_referrals_endpoint()
    test_referral_stats_endpoint()
    test_digital_presence_endpoints()
    test_messaging_endpoints()
    test_ai_assistant_endpoints()
    
    print("All endpoint tests completed!")
