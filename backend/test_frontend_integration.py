import requests
import json

BASE_URL = "http://localhost:8000"

def test_all_endpoints():
    """Test all backend endpoints that are used by the frontend"""
    print("Testing all backend endpoints for frontend integration...\n")
    
    # Test 1: Dashboard metrics
    print("1. Testing Dashboard Metrics Endpoint...")
    try:
        response = requests.get(f"{BASE_URL}/dashboard/?user_id=1")
        print(f"   Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success - Total customers: {data.get('total_customers', 0)}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    print()
    
    # Test 2: Customers endpoints
    print("2. Testing Customers Endpoints...")
    try:
        # Get customers
        response = requests.get(f"{BASE_URL}/customers/?user_id=1")
        print(f"   Get Customers Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success - Found {len(data)} customers")
        else:
            print(f"   Error: {response.text}")
            
        # Search customers
        response = requests.get(f"{BASE_URL}/customers/search?user_id=1&query=John")
        print(f"   Search Customers Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success - Search found {len(data)} results")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    print()
    
    # Test 3: Referrals endpoints
    print("3. Testing Referrals Endpoints...")
    try:
        # Get referrals
        response = requests.get(f"{BASE_URL}/referrals/?user_id=1")
        print(f"   Get Referrals Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success - Found {len(data)} referrals")
        else:
            print(f"   Error: {response.text}")
            
        # Get referral stats
        response = requests.get(f"{BASE_URL}/referrals/stats?user_id=1")
        print(f"   Get Referral Stats Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success - Current tier: {data.get('current_tier', 'Unknown')}")
        else:
            print(f"   Error: {response.text}")
            
        # Get rewards
        response = requests.get(f"{BASE_URL}/referrals/rewards?user_id=1")
        print(f"   Get Rewards Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success - Found {len(data)} rewards")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    print()
    
    # Test 4: Messaging endpoints
    print("4. Testing Messaging Endpoints...")
    try:
        # Get message templates
        response = requests.get(f"{BASE_URL}/messaging/message-templates")
        print(f"   Get Message Templates Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Success - Found {len(data)} message templates")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    print()
    
    # Test 5: AI Assistant endpoints
    print("5. Testing AI Assistant Endpoints...")
    try:
        # Get AI assist
        response = requests.post(
            f"{BASE_URL}/ai/assist",
            json={"prompt": "How can I improve my customer engagement?"}
        )
        print(f"   AI Assist Status Code: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            if "error" in data:
                print(f"   API Error: {data['error']}")
            else:
                print("   Success - AI response received")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Exception: {e}")
    print()
    
    print("All frontend integration tests completed!")

if __name__ == "__main__":
    test_all_endpoints()
