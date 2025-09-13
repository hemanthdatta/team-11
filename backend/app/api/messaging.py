from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import Customer as CustomerModel, Interaction as InteractionModel
from typing import Dict, Any, List
from datetime import datetime
import json

router = APIRouter()

@router.post("/send")
def send_message(
    message_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Send a message to a customer"""
    customer_id = message_data.get("customer_id")
    message = message_data.get("message")
    platform = message_data.get("platform", "whatsapp")
    user_id = message_data.get("user_id")
    
    if not all([customer_id, message, user_id]):
        raise HTTPException(status_code=400, detail="customer_id, message, and user_id are required")
    
    # Verify customer exists and belongs to user
    customer = db.query(CustomerModel).filter(
        CustomerModel.id == customer_id,
        CustomerModel.user_id == user_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Create interaction record
    interaction = InteractionModel(
        customer_id=customer_id,
        message=f"[{platform.upper()}] {message}",
        sent_by=f"user_{user_id}"
    )
    
    # Update customer's last contacted time
    customer.last_contacted = datetime.utcnow()
    
    db.add(interaction)
    db.commit()
    db.refresh(interaction)
    
    # In a real app, you would integrate with WhatsApp Business API, SMS gateway, etc.
    return {
        "message": "Message sent successfully",
        "interaction_id": interaction.id,
        "platform": platform,
        "timestamp": interaction.timestamp,
        "status": "delivered"
    }

@router.get("/conversations/{customer_id}")
def get_conversation(
    customer_id: int,
    user_id: int,
    db: Session = Depends(get_db)
) -> List[Dict[str, Any]]:
    """Get conversation history with a customer"""
    # Verify customer belongs to user
    customer = db.query(CustomerModel).filter(
        CustomerModel.id == customer_id,
        CustomerModel.user_id == user_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    interactions = db.query(InteractionModel).filter(
        InteractionModel.customer_id == customer_id
    ).order_by(InteractionModel.timestamp.asc()).all()
    
    return [
        {
            "id": interaction.id,
            "message": interaction.message,
            "sent_by": interaction.sent_by,
            "timestamp": interaction.timestamp,
            "is_from_user": interaction.sent_by.startswith("user_")
        }
        for interaction in interactions
    ]

@router.post("/bulk-message")
def send_bulk_message(
    bulk_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Send bulk messages to multiple customers"""
    customer_ids = bulk_data.get("customer_ids", [])
    message = bulk_data.get("message")
    platform = bulk_data.get("platform", "whatsapp")
    user_id = bulk_data.get("user_id")
    
    if not all([customer_ids, message, user_id]):
        raise HTTPException(status_code=400, detail="customer_ids, message, and user_id are required")
    
    # Verify all customers belong to user
    customers = db.query(CustomerModel).filter(
        CustomerModel.id.in_(customer_ids),
        CustomerModel.user_id == user_id
    ).all()
    
    if len(customers) != len(customer_ids):
        raise HTTPException(status_code=400, detail="Some customers not found or don't belong to user")
    
    sent_count = 0
    failed_count = 0
    interactions = []
    
    for customer in customers:
        try:
            # Create interaction record
            interaction = InteractionModel(
                customer_id=customer.id,
                message=f"[BULK-{platform.upper()}] {message}",
                sent_by=f"user_{user_id}"
            )
            
            # Update customer's last contacted time
            customer.last_contacted = datetime.utcnow()
            
            db.add(interaction)
            interactions.append(interaction)
            sent_count += 1
            
        except Exception as e:
            failed_count += 1
            continue
    
    db.commit()
    
    return {
        "message": f"Bulk message sent to {sent_count} customers",
        "sent_count": sent_count,
        "failed_count": failed_count,
        "platform": platform,
        "timestamp": datetime.utcnow()
    }

@router.get("/message-templates")
def get_message_templates() -> List[Dict[str, Any]]:
    """Get predefined message templates"""
    return [
        {
            "id": "welcome",
            "name": "Welcome Message",
            "content": "Welcome to our service! We're excited to help you grow your business.",
            "category": "onboarding"
        },
        {
            "id": "follow_up",
            "name": "Follow Up",
            "content": "Hi {customer_name}, just checking in to see how things are going. Let me know if you need any assistance!",
            "category": "follow_up"
        },
        {
            "id": "promotion",
            "name": "Special Offer",
            "content": "🎉 Special offer just for you! Get 20% off on our premium services. Valid until {date}.",
            "category": "promotion"
        },
        {
            "id": "referral_request",
            "name": "Referral Request",
            "content": "Hi {customer_name}, if you're happy with our service, would you mind referring us to your friends? You'll earn rewards for each successful referral!",
            "category": "referral"
        },
        {
            "id": "appointment_reminder",
            "name": "Appointment Reminder",
            "content": "Reminder: You have an appointment scheduled for {date} at {time}. Looking forward to meeting you!",
            "category": "reminder"
        }
    ]

@router.post("/schedule-message")
def schedule_message(
    schedule_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """Schedule a message to be sent later"""
    customer_id = schedule_data.get("customer_id")
    message = schedule_data.get("message")
    scheduled_time = schedule_data.get("scheduled_time")
    platform = schedule_data.get("platform", "whatsapp")
    user_id = schedule_data.get("user_id")
    
    if not all([customer_id, message, scheduled_time, user_id]):
        raise HTTPException(status_code=400, detail="customer_id, message, scheduled_time, and user_id are required")
    
    # Verify customer exists and belongs to user
    customer = db.query(CustomerModel).filter(
        CustomerModel.id == customer_id,
        CustomerModel.user_id == user_id
    ).first()
    
    if not customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # In a real app, you would store this in a scheduled messages table
    # and use a background task scheduler like Celery to send it
    
    return {
        "message": "Message scheduled successfully",
        "customer_id": customer_id,
        "scheduled_time": scheduled_time,
        "platform": platform,
        "status": "scheduled"
    }

@router.get("/analytics/{user_id}")
def get_messaging_analytics(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get messaging analytics for a user"""
    # Get total messages sent
    total_messages = db.query(InteractionModel).join(CustomerModel).filter(
        CustomerModel.user_id == user_id,
        InteractionModel.sent_by.like(f"user_{user_id}%")
    ).count()
    
    # Get messages by platform
    whatsapp_messages = db.query(InteractionModel).join(CustomerModel).filter(
        CustomerModel.user_id == user_id,
        InteractionModel.message.like("[WHATSAPP]%")
    ).count()
    
    sms_messages = db.query(InteractionModel).join(CustomerModel).filter(
        CustomerModel.user_id == user_id,
        InteractionModel.message.like("[SMS]%")
    ).count()
    
    email_messages = db.query(InteractionModel).join(CustomerModel).filter(
        CustomerModel.user_id == user_id,
        InteractionModel.message.like("[EMAIL]%")
    ).count()
    
    # Get customers contacted
    customers_contacted = db.query(CustomerModel).filter(
        CustomerModel.user_id == user_id,
        CustomerModel.last_contacted.isnot(None)
    ).count()
    
    return {
        "total_messages": total_messages,
        "customers_contacted": customers_contacted,
        "platforms": {
            "whatsapp": whatsapp_messages,
            "sms": sms_messages,
            "email": email_messages
        },
        "response_rate": 85.2,  # Mock data
        "avg_response_time": "2h 15m"  # Mock data
    }
