from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
import httpx
import os
import base64
from io import BytesIO
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional
from app.database.database import get_db
from app.models.models import Customer as CustomerModel, Interaction as InteractionModel
from app.core.security_utils import limiter
import json
from pydantic import BaseModel
from app.api.ai_image_generator import ImagePromptRequest, ImageGenerationResponse

load_dotenv()

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

@router.post("/assist")
@limiter.limit("5/minute")
async def ai_assist(request: Request, data: Dict[str, Any]) -> Dict[str, Any]:
    prompt = data.get("prompt", "")
    context = data.get("context", {})
    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not configured"}
    
    # Prepare the prompt for Gemini with enhanced marketing assistant capabilities
    full_prompt = f"""
    You are an AI Marketing Assistant helping a micro-entrepreneur in India.
    
    Your role is to generate engaging marketing content for various platforms including:
    1. Social media posts (WhatsApp, Facebook, Instagram, LinkedIn, Twitter)
    2. Email campaigns
    3. Customer outreach messages
    
    Guidelines:
    - Keep content culturally relevant to India
    - Use simple, clear language that resonates with local audiences
    - Focus on value propositions that matter to small businesses and individuals
    - Include appropriate emojis and formatting for social media when relevant
    - Keep content concise but impactful
    
    Context: {context if context else "No specific context provided"}
    
    Request: {prompt}
    
    Please provide a helpful response:
    """
    
    # Make request to Gemini API
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json={
                    "contents": [{
                        "parts": [{
                            "text": full_prompt
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
                    
                    # Try to clean up the JSON response if it contains JSON
                    if '{' in ai_response and '}' in ai_response:
                        # Check if the response is wrapped in quotes or markdown
                        if ai_response.strip().startswith('"""') or ai_response.strip().startswith('```'):
                            # Extract just the JSON part
                            import re
                            json_match = re.search(r'\{[\s\S]*\}', ai_response)
                            if json_match:
                                ai_response = json_match.group(0)
                    
                    return {"response": ai_response}
                else:
                    return {"error": "No response from AI model"}
            else:
                # Get the error details
                error_text = await response.aread()
                return {"error": f"Gemini API error: {response.status_code} - {error_text.decode()}"}
    except Exception as e:
        return {"error": f"Failed to connect to AI service: {str(e)}"}

@router.post("/customer-insights")
async def get_customer_insights(
    customer_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Get AI-powered insights about a customer"""
    customer_id = customer_data.get("customer_id")
    user_id = customer_data.get("user_id")
    
    if not customer_id or not user_id:
        raise HTTPException(status_code=400, detail="customer_id and user_id are required")
    
    # Get customer and interaction data
    customer = db.query(CustomerModel).filter(
        CustomerModel.id == customer_id,
        CustomerModel.user_id == user_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    interactions = db.query(InteractionModel).filter(
        InteractionModel.customer_id == customer_id
    ).order_by(InteractionModel.timestamp.desc()).limit(10).all()
    
    # Prepare context for AI
    context = {
        "customer_name": customer.name,
        "contact_info": customer.contact_info,
        "notes": customer.notes,
        "last_contacted": str(customer.last_contacted) if customer.last_contacted else "Never",
        "recent_interactions": [
            {
                "message": interaction.message,
                "timestamp": str(interaction.timestamp),
                "sent_by": interaction.sent_by
            }
            for interaction in interactions
        ]
    }
    
    # Mock AI insights (in real app, would use actual AI)
    insights = {
        "engagement_level": "High" if len(interactions) > 5 else "Medium" if len(interactions) > 2 else "Low",
        "recommended_actions": [
            "Follow up on recent inquiry",
            "Send personalized offer",
            "Schedule a call"
        ],
        "best_contact_time": "10:00 AM - 12:00 PM",
        "preferred_communication": "WhatsApp",
        "potential_services": ["Life Insurance", "Health Insurance"],
        "risk_assessment": "Low risk customer with good engagement"
    }
    
    return {
        "customer_id": customer_id,
        "insights": insights,
        "context": context
    }

@router.post("/generate-message")
async def generate_personalized_message(
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Generate a personalized message for a customer using AI"""
    customer_id = request_data.get("customer_id")
    user_id = request_data.get("user_id")
    message_type = request_data.get("message_type", "follow_up")
    
    if not customer_id or not user_id:
        raise HTTPException(status_code=400, detail="customer_id and user_id are required")
    
    # Get customer data
    customer = db.query(CustomerModel).filter(
        CustomerModel.id == customer_id,
        CustomerModel.user_id == user_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Generate personalized message templates
    message_templates = {
        "welcome": f"Hi {customer.name}! Welcome to our service. We're excited to help you with your insurance needs. Feel free to reach out if you have any questions!",
        "follow_up": f"Hi {customer.name}, I hope you're doing well! I wanted to follow up on our previous conversation. Do you have any questions about our insurance products?",
        "birthday": f"Happy Birthday {customer.name}! 🎉 As a special gift, we're offering you 15% off on any new policy. Let me know if you're interested!",
        "renewal": f"Hi {customer.name}, your policy is coming up for renewal soon. I'd love to review your coverage and see if we can find you better rates. When would be a good time to chat?",
        "referral": f"Hi {customer.name}, I hope you're happy with our service! If you know anyone who might benefit from our insurance products, we offer great referral rewards. Thanks for thinking of us!"
    }
    
    generated_message = message_templates.get(message_type, f"Hi {customer.name}, I wanted to reach out and see how you're doing!")
    
    return {
        "customer_id": customer_id,
        "message_type": message_type,
        "generated_message": generated_message,
        "suggestions": [
            "Add a personal touch based on recent interactions",
            "Include a specific call-to-action",
            "Mention current promotions or offers"
        ]
    }

@router.post("/auto-responses")
async def setup_auto_responses(
    config_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Configure automatic responses for common customer queries"""
    user_id = config_data.get("user_id")
    responses = config_data.get("responses", {})
    
    if not user_id:
        raise HTTPException(status_code=400, detail="user_id is required")
    
    # Default auto-responses
    default_responses = {
        "greeting": "Hello! Thanks for contacting us. How can I help you today?",
        "business_hours": "Our business hours are Monday-Friday 9 AM to 6 PM, Saturday 9 AM to 2 PM. We're closed on Sundays.",
        "pricing": "I'd be happy to discuss our pricing with you. Could you tell me more about what type of coverage you're looking for?",
        "appointment": "I'd love to schedule a meeting with you. What days and times work best for you?",
        "thank_you": "Thank you for your interest! I'll get back to you shortly with more information."
    }
    
    # Merge with user-provided responses
    final_responses = {**default_responses, **responses}
    
    # In a real app, you would save these to the database
    return {
        "user_id": user_id,
        "auto_responses": final_responses,
        "status": "Auto-responses configured successfully"
    }

@router.get("/analytics/{user_id}")
async def get_ai_analytics(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get AI assistant usage analytics"""
    # Mock analytics data
    return {
        "total_ai_interactions": 45,
        "messages_generated": 32,
        "customer_insights_requested": 18,
        "auto_responses_triggered": 67,
        "top_message_types": [
            {"type": "follow_up", "count": 15},
            {"type": "welcome", "count": 12},
            {"type": "renewal", "count": 8}
        ],
        "engagement_improvement": "23%",
        "response_time_reduction": "45%"
    }

# Image generation endpoint has been moved to ai_image_generator.py

@router.post("/marketing-content")
async def generate_marketing_content(
    request_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Generate marketing content for social media, email, or customer outreach"""
    
    content_type = request_data.get("content_type", "social_media")
    platform = request_data.get("platform", "whatsapp")
    tone = request_data.get("tone", "professional")
    topic = request_data.get("topic", "")
    customer_name = request_data.get("customer_name", "")
    user_id = request_data.get("user_id")
    
    if not GEMINI_API_KEY:
        return {"error": "Gemini API key not configured"}
    
    # Prepare specific prompts based on content type
    if content_type == "social_media":
        prompt = f"""
        Create engaging social media content for a micro-entrepreneur in India.
        
        Content Type: Social Media Post
        Platform: {platform}
        Tone: {tone}
        Topic: {topic}
        
        Requirements:
        - Keep it concise and engaging
        - Use appropriate emojis for the platform
        - Include a clear call-to-action
        - Make it culturally relevant to Indian audiences
        - Format appropriately for {platform}
        """
    elif content_type == "email":
        prompt = f"""
        Create a professional email campaign for a micro-entrepreneur in India.
        
        Content Type: Email Campaign
        Tone: {tone}
        Topic: {topic}
        
        Requirements:
        - Professional subject line
        - Engaging opening
        - Clear value proposition
        - Strong call-to-action
        - Appropriate length for email
        """
    elif content_type == "customer_outreach":
        prompt = f"""
        Create a personalized customer outreach message for a micro-entrepreneur in India.
        
        Content Type: Customer Outreach
        Customer Name: {customer_name or 'Valued Customer'}
        Tone: {tone}
        Topic: {topic}
        
        Requirements:
        - Personalized greeting
        - Friendly and {tone} tone
        - Clear value proposition
        - Appropriate for direct messaging
        - Culturally sensitive to Indian business practices
        """
    else:
        prompt = f"Create marketing content with tone {tone} about {topic}"
    
    # Make request to Gemini API
    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json={
                    "contents": [{
                        "parts": [{
                            "text": prompt
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
                    return {
                        "content": ai_response,
                        "content_type": content_type,
                        "platform": platform if content_type == "social_media" else None,
                        "tone": tone
                    }
                else:
                    return {"error": "No response from AI model"}
            else:
                # Get the error details
                error_text = await response.aread()
                return {"error": f"Gemini API error: {response.status_code} - {error_text.decode()}"}
    except Exception as e:
        return {"error": f"Failed to connect to AI service: {str(e)}"}