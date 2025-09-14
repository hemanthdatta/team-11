from fastapi import APIRouter, Depends, Request, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc
import httpx
import os
import base64
from io import BytesIO
from dotenv import load_dotenv
from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
from collections import Counter
import re
from app.database.database import get_db
from app.models.models import Customer as CustomerModel, Interaction as InteractionModel, CustomerInteraction as CustomerInteractionModel
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
    """Get AI-powered insights about a customer using interaction data"""
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
    
    # Get regular interactions
    interactions = db.query(InteractionModel).filter(
        InteractionModel.customer_id == customer_id
    ).order_by(InteractionModel.timestamp.desc()).limit(20).all()
    
    # Get detailed customer interactions
    
    detailed_interactions = db.query(CustomerInteractionModel).filter(
        CustomerInteractionModel.customer_id == customer_id
    ).order_by(desc(CustomerInteractionModel.interaction_date)).all()
    
    # If there are no interactions at all, we can't generate insights
    if not interactions and not detailed_interactions:
        # Return basic placeholder insights with a clear note to add interactions
        return {
            "customer_id": customer_id,
            "insights": {
                "engagement_level": "New",
                "recommended_actions": [
                    "Schedule an introductory call",
                    "Send a welcome message",
                    "Add notes from your initial contact"
                ],
                "best_contact_time": "Business hours (10:00 AM - 5:00 PM)",
                "preferred_communication": "Call",
                "potential_services": ["Initial Assessment Required"],
                "risk_assessment": "Not enough data to assess",
                "suggested_follow_up_date": (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d %H:%M:%S"),
                "follow_up_suggestion_reason": "New customer, immediate follow-up recommended"
            },
            "context": {
                "customer_name": customer.name,
                "contact_info": customer.contact_info,
                "notes": customer.notes,
                "last_contacted": "Never",
                "recent_interactions": []
            }
        }
    
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
        ],
        "detailed_interactions": [
            {
                "type": interaction.interaction_type,
                "date": str(interaction.interaction_date),
                "title": interaction.title,
                "notes": interaction.notes,
                "status": interaction.status,
                "follow_up_needed": interaction.follow_up_needed,
                "follow_up_date": str(interaction.follow_up_date) if interaction.follow_up_date else None
            }
            for interaction in detailed_interactions
        ]
    }
    
    # Extract information from detailed interactions
    
    now = datetime.now()
    interaction_types = [interaction.interaction_type for interaction in detailed_interactions if interaction.interaction_type]
    interaction_notes = [interaction.notes for interaction in detailed_interactions if interaction.notes]
    has_follow_up_needed = any(interaction.follow_up_needed for interaction in detailed_interactions)
    
    # Calculate engagement metrics
    total_interactions = len(detailed_interactions)
    recent_interactions = [i for i in detailed_interactions if (now - i.interaction_date).days <= 30]
    recent_count = len(recent_interactions)
    
    # Determine engagement level based on interaction frequency and recency
    if total_interactions > 10 or recent_count > 5:
        engagement_level = "High"
    elif total_interactions > 5 or recent_count > 2:
        engagement_level = "Medium"
    elif total_interactions > 0:
        engagement_level = "Low"
    else:
        engagement_level = "New"
    
    # Calculate response time patterns
    response_times = []
    if len(detailed_interactions) >= 2:
        sorted_interactions = sorted(detailed_interactions, key=lambda x: x.interaction_date)
        for i in range(1, len(sorted_interactions)):
            delta = sorted_interactions[i].interaction_date - sorted_interactions[i-1].interaction_date
            days = delta.days
            if 0 <= days <= 60:  # Filter out unrealistic gaps
                response_times.append(days)
    
    avg_response_time = sum(response_times) / len(response_times) if response_times else 14
    
    # Determine most common interaction type and preferred contact method
    most_common_type = "call"
    if interaction_types:
        interaction_counts = Counter(interaction_types)
        most_common_type = interaction_counts.most_common(1)[0][0]
    
    # Extract potential interest areas from notes
    interest_areas = []
    common_products = ["health insurance", "life insurance", "car insurance", "vehicle insurance", 
                      "home insurance", "term plan", "investment plan", "medical insurance",
                      "two-wheeler", "four-wheeler", "family plan", "retirement plan", "pension plan",
                      "child plan", "education plan", "savings plan", "ulip"]
    
    for note in interaction_notes:
        if not note:
            continue
        note_lower = note.lower()
        for product in common_products:
            if product in note_lower:
                interest_areas.append(product)
    
    # Get unique interests
    unique_interests = list(set([interest.title() for interest in interest_areas]))
    
    if not unique_interests and detailed_interactions:
        # If no specific interests found, make educated guess based on interaction count
        if total_interactions < 3:
            unique_interests = ["Life Insurance", "Health Insurance"]  # Default starting products
        else:
            unique_interests = ["Term Life Insurance", "Family Health Plan", "Investment Plans"]
    
    # Calculate follow-up recommendations
    upcoming_follow_ups = [
        interaction for interaction in detailed_interactions 
        if interaction.follow_up_needed and interaction.follow_up_date and interaction.follow_up_date > now
    ]
    
    # Generate suggested follow-up date and reason
    suggested_follow_up_date = None
    follow_up_suggestion_reason = ""
    
    if upcoming_follow_ups:
        # Use the earliest upcoming follow-up
        next_follow_up = min(upcoming_follow_ups, key=lambda x: x.follow_up_date)
        suggested_follow_up_date = next_follow_up.follow_up_date
        follow_up_suggestion_reason = f"Already scheduled follow-up for {next_follow_up.title}"
    else:
        # Calculate based on engagement and response patterns
        if engagement_level == "High":
            days_to_add = min(7, max(int(avg_response_time / 2), 3))
            follow_up_suggestion_reason = "High engagement customer, regular follow-up recommended"
        elif engagement_level == "Medium":
            days_to_add = min(14, max(int(avg_response_time * 0.7), 7))
            follow_up_suggestion_reason = "Medium engagement customer, timely follow-up recommended"
        else:
            days_to_add = min(30, max(int(avg_response_time), 14))
            follow_up_suggestion_reason = "Re-engagement attempt recommended"
        
        # Adjust based on last interaction date
        last_interaction_date = now
        if detailed_interactions:
            last_interaction_date = max(i.interaction_date for i in detailed_interactions)
            
            # If the last interaction was recent (less than 3 days ago), extend follow-up time
            days_since_last_interaction = (now - last_interaction_date).days
            if days_since_last_interaction < 3:
                days_to_add += 3
                follow_up_suggestion_reason += " (adjusted for recent interaction)"
        
        suggested_follow_up_date = now + timedelta(days=days_to_add)
    
    # Format the suggested date
    suggested_follow_up_date_str = suggested_follow_up_date.strftime("%Y-%m-%d %H:%M:%S") if suggested_follow_up_date else None
    
    # Analyze best contact time patterns from successful interactions
    successful_interactions = [i for i in detailed_interactions if i.status.lower() == "completed"]
    
    contact_hours = []
    for interaction in successful_interactions:
        hour = interaction.interaction_date.hour
        if 7 <= hour <= 22:  # Filter out unusual hours
            contact_hours.append(hour)
    
    if contact_hours:
        hour_counter = Counter(contact_hours)
        best_hours = hour_counter.most_common(2)
        
        # Define time blocks
        time_blocks = {
            "morning": (7, 12),
            "afternoon": (12, 16),
            "evening": (16, 19),
            "night": (19, 22)
        }
        
        # Count interactions by time block
        block_counts = {block: 0 for block in time_blocks}
        for hour in contact_hours:
            for block, (start, end) in time_blocks.items():
                if start <= hour < end:
                    block_counts[block] += 1
        
        # Get the most common time block
        best_block = max(block_counts.items(), key=lambda x: x[1])[0] if block_counts else "afternoon"
        
        # Format specific time suggestion based on best hours
        if best_hours:
            best_time = f"{best_block.title()} ({best_hours[0][0]}:00"
            if len(best_hours) > 1:
                best_time += f" or {best_hours[1][0]}:00"
            best_time += ")"
        else:
            best_time = f"{best_block.title()} hours"
    else:
        best_time = "Business hours (10:00 AM - 5:00 PM)"
    
    # Generate recommended actions based on interaction history and patterns
    recommended_actions = []
    
    # Check if there are any pending follow-ups
    pending_interactions = [i for i in detailed_interactions if i.status.lower() == "pending"]
    if pending_interactions:
        recommended_actions.append(f"Complete pending interaction: {pending_interactions[0].title}")
    
    # Follow-up recommendation based on notes content
    interest_keywords = ["interested", "thinking", "considering", "want", "need", "looking", "information"]
    if any(any(keyword in (note or "").lower() for keyword in interest_keywords) for note in interaction_notes):
        recommended_actions.append("Send personalized offer based on expressed interest")
    
    # Channel-specific recommendations
    if most_common_type:
        if most_common_type == "call":
            recommended_actions.append("Schedule a follow-up call")
        elif most_common_type == "meeting":
            recommended_actions.append("Schedule an in-person meeting")
        elif most_common_type == "email":
            recommended_actions.append("Send a detailed email with personalized information")
        elif most_common_type == "whatsapp":
            recommended_actions.append("Send a follow-up WhatsApp message with latest offers")
        elif most_common_type == "sms":
            recommended_actions.append("Send an SMS with a brief update")
    
    # Add general recommendations if needed
    if len(recommended_actions) < 3:
        general_actions = [
            "Share new policy benefits relevant to their needs",
            "Check if any family members need coverage",
            "Review current policies for potential upgrades",
            "Share success stories from similar customers",
            "Offer a free insurance portfolio review"
        ]
        
        # Add general actions that aren't already in the list
        for action in general_actions:
            if action not in recommended_actions and len(recommended_actions) < 3:
                recommended_actions.append(action)
    
    # Assess customer risk level
    if engagement_level == "High":
        risk_assessment = "Loyal customer with strong engagement"
    elif engagement_level == "Medium":
        if any("renewal" in (note or "").lower() for note in interaction_notes):
            risk_assessment = "Stable customer approaching renewal decision"
        else:
            risk_assessment = "Engaged customer, moderate retention risk"
    else:
        if total_interactions <= 1:
            risk_assessment = "New customer, needs nurturing"
        else:
            risk_assessment = "At-risk customer, needs re-engagement"
    
    # Use Gemini API to generate enhanced AI insights if available
    ai_enhanced_insights = None
    if GEMINI_API_KEY:
        try:
            # Prepare detailed context for Gemini AI
            interaction_summary = ""
            if detailed_interactions:
                interaction_summary = f"Recent interactions ({len(detailed_interactions)} total):\n"
                for i, interaction in enumerate(detailed_interactions[:5], 1):
                    interaction_summary += f"{i}. {interaction.interaction_type.title()} on {interaction.interaction_date.strftime('%Y-%m-%d')}: {interaction.title}\n"
                    if interaction.notes:
                        interaction_summary += f"   Notes: {interaction.notes[:100]}...\n"
                    if interaction.follow_up_needed:
                        interaction_summary += f"   Follow-up needed: {'Yes' if interaction.follow_up_needed else 'No'}\n"
            
            gemini_prompt = f"""
            You are an AI assistant helping an insurance agent in India analyze customer data. Please provide insights about this customer based on their interaction history.

            Customer Profile:
            - Name: {customer.name}
            - Contact: {customer.contact_info}
            - Notes: {customer.notes or "No additional notes"}
            - Last contacted: {customer.last_contacted or "Never"}
            - Total interactions: {total_interactions}
            - Engagement level: {engagement_level}

            {interaction_summary}

            Based on this data, please provide a JSON response with the following structure:
            {{
                "engagement_level": "High/Medium/Low",
                "recommended_actions": ["action1", "action2", "action3"],
                "best_contact_time": "suggested time with reason",
                "preferred_communication": "Call/WhatsApp/Email/Meeting based on history",
                "potential_services": ["service1", "service2", "service3"],
                "risk_assessment": "assessment with reasoning",
                "insights_summary": "2-3 sentence summary of key insights"
            }}

            Consider:
            1. Interaction frequency and recency for engagement level
            2. Communication preferences based on interaction types
            3. Potential insurance needs for Indian customers
            4. Risk factors for customer retention
            5. Actionable next steps for the insurance agent

            Provide only the JSON response without any markdown formatting.
            """

            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                    json={
                        "contents": [{
                            "parts": [{
                                "text": gemini_prompt
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
                        
                        # Try to parse the JSON response
                        try:
                            import re
                            # Clean up the response to extract JSON
                            json_match = re.search(r'\{[^{}]*(?:\{[^{}]*\}[^{}]*)*\}', ai_response)
                            if json_match:
                                json_str = json_match.group(0)
                                ai_enhanced_insights = json.loads(json_str)
                                print(f"Successfully parsed AI insights: {ai_enhanced_insights}")
                        except (json.JSONDecodeError, AttributeError) as e:
                            print(f"Failed to parse AI response as JSON: {e}")
                            print(f"Raw AI response: {ai_response}")
                            ai_enhanced_insights = None
                    else:
                        print("No candidates in Gemini response")
                else:
                    print(f"Gemini API error: {response.status_code}")
        except Exception as e:
            print(f"Error calling Gemini API for insights: {e}")
            ai_enhanced_insights = None
    
    # Merge AI insights with calculated insights
    if ai_enhanced_insights:
        # Use AI insights as primary, fall back to calculated insights
        insights = {
            "engagement_level": ai_enhanced_insights.get("engagement_level", engagement_level),
            "recommended_actions": ai_enhanced_insights.get("recommended_actions", recommended_actions[:3]),
            "best_contact_time": ai_enhanced_insights.get("best_contact_time", best_time),
            "preferred_communication": ai_enhanced_insights.get("preferred_communication", most_common_type.capitalize() if most_common_type else "Call"),
            "potential_services": ai_enhanced_insights.get("potential_services", unique_interests[:3] if unique_interests else ["Life Insurance", "Health Insurance"]),
            "risk_assessment": ai_enhanced_insights.get("risk_assessment", risk_assessment),
            "suggested_follow_up_date": suggested_follow_up_date_str,
            "follow_up_suggestion_reason": follow_up_suggestion_reason,
            "insights_summary": ai_enhanced_insights.get("insights_summary", "AI-powered analysis based on customer interaction patterns")
        }
    else:
        # Use calculated insights as fallback
        insights = {
            "engagement_level": engagement_level,
            "recommended_actions": recommended_actions[:3],
            "best_contact_time": best_time,
            "preferred_communication": most_common_type.capitalize() if most_common_type else "Call",
            "potential_services": unique_interests[:3] if unique_interests else ["Life Insurance", "Health Insurance"],
            "risk_assessment": risk_assessment,
            "suggested_follow_up_date": suggested_follow_up_date_str,
            "follow_up_suggestion_reason": follow_up_suggestion_reason,
            "insights_summary": f"Analysis based on {total_interactions} interactions showing {engagement_level.lower()} engagement level"
        }
    
    return {
        "customer_id": customer_id,
        "insights": insights,
        "context": context,
        "ai_powered": ai_enhanced_insights is not None
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
        Create engaging social media content for the customers of a microentrepreneur/insurance agent in India.
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
        Create a professional email campaign for the customers of a micro-entrepreneur/insurance agent in India.

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
        Create a personalized customer outreach message for the customers of a micro-entrepreneur/insurance agent in India.

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