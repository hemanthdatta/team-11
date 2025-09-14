#!/usr/bin/env python3

"""
Test script to verify Gemini API integration for customer insights
"""

import os
import sys
import httpx
import json
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

async def test_gemini_api():
    """Test the Gemini API with a sample customer insights request"""
    
    if not GEMINI_API_KEY:
        print("❌ GEMINI_API_KEY not found in environment variables")
        print("Please set your Gemini API key in the .env file")
        return False
    
    test_prompt = """
    You are an AI assistant helping an insurance agent in India analyze customer data. Please provide insights about this customer based on their interaction history.

    Customer Profile:
    - Name: Test Customer
    - Contact: +91 9876543210
    - Notes: Interested in health insurance for family
    - Last contacted: 2025-09-10
    - Total interactions: 3
    - Engagement level: Medium

    Recent interactions (3 total):
    1. Call on 2025-09-10: Initial inquiry about health insurance
       Notes: Customer asked about family health plans, has 2 children...
       Follow-up needed: Yes
    2. WhatsApp on 2025-09-08: Sent brochure
       Notes: Customer requested more information about premiums...
    3. Email on 2025-09-05: Welcome message
       Notes: New lead from website form...

    Based on this data, please provide a JSON response with the following structure:
    {
        "engagement_level": "High/Medium/Low",
        "recommended_actions": ["action1", "action2", "action3"],
        "best_contact_time": "suggested time with reason",
        "preferred_communication": "Call/WhatsApp/Email/Meeting based on history",
        "potential_services": ["service1", "service2", "service3"],
        "risk_assessment": "assessment with reasoning",
        "insights_summary": "2-3 sentence summary of key insights"
    }

    Provide only the JSON response without any markdown formatting.
    """
    
    try:
        print("🔄 Testing Gemini API connection...")
        
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json={
                    "contents": [{
                        "parts": [{
                            "text": test_prompt
                        }]
                    }]
                },
                headers={
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if "candidates" in data and len(data["candidates"]) > 0:
                    ai_response = data["candidates"][0]["content"]["parts"][0]["text"]
                    
                    print("✅ Gemini API connection successful!")
                    print("📄 Raw AI Response:")
                    print(ai_response)
                    print("\n" + "="*50 + "\n")
                    
                    # Try to parse as JSON
                    try:
                        import re
                        json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', ai_response)
                        if json_match:
                            json_str = json_match.group(0)
                            parsed_insights = json.loads(json_str)
                            
                            print("✅ Successfully parsed AI insights:")
                            print(json.dumps(parsed_insights, indent=2))
                            return True
                        else:
                            print("⚠️  Could not extract JSON from AI response")
                            return False
                            
                    except json.JSONDecodeError as e:
                        print(f"❌ Failed to parse JSON: {e}")
                        return False
                else:
                    print("❌ No candidates in Gemini response")
                    return False
            else:
                print(f"❌ Gemini API error: {response.status_code}")
                print(f"Response: {response.text}")
                return False
                
    except Exception as e:
        print(f"❌ Error calling Gemini API: {e}")
        return False

if __name__ == "__main__":
    import asyncio
    
    print("🚀 Testing Gemini API Integration for Customer Insights")
    print("=" * 50)
    
    result = asyncio.run(test_gemini_api())
    
    if result:
        print("\n✅ All tests passed! Gemini API integration is working correctly.")
    else:
        print("\n❌ Tests failed. Please check your API key and try again.")
        print("💡 Make sure to set GEMINI_API_KEY in your .env file")
