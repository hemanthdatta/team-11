from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func, desc
from app.database.database import get_db
from app.models.models import Customer as CustomerModel, Referral as ReferralModel, Interaction as InteractionModel
from typing import Dict, Any, List
from datetime import datetime, timedelta

router = APIRouter()

@router.get("/")
def get_dashboard_metrics(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    # Get total customers
    total_customers = db.query(CustomerModel).filter(CustomerModel.user_id == user_id).count()
    
    # Get total referrals
    total_referrals = db.query(ReferralModel).filter(ReferralModel.user_id == user_id).count()
    
    # Get completed referrals (rewards)
    completed_referrals = db.query(ReferralModel).filter(
        ReferralModel.user_id == user_id,
        ReferralModel.status == "completed"
    ).count()
    
    # Get total interactions (engagements)
    total_engagements = db.query(InteractionModel).join(CustomerModel).filter(
        CustomerModel.user_id == user_id
    ).count()
    
    # Calculate engagement rate
    engagement_rate = (total_engagements / (total_customers + 1)) * 100 if total_customers > 0 else 0
    
    # Get recent activities
    recent_activities = get_recent_activities(user_id, db)
    
    return {
        "total_customers": total_customers,
        "total_referrals": total_referrals,
        "completed_referrals": completed_referrals,
        "engagement_rate": round(engagement_rate, 2),
        "total_engagements": total_engagements,
        "recent_activities": recent_activities
    }

def get_recent_activities(user_id: int, db: Session) -> List[Dict[str, Any]]:
    """Get recent activities for the dashboard"""
    activities = []
    
    # Recent customer additions
    recent_customers = db.query(CustomerModel).filter(
        CustomerModel.user_id == user_id
    ).order_by(desc(CustomerModel.id)).limit(3).all()
    
    for customer in recent_customers:
        activities.append({
            "action": f"New customer added: {customer.name}",
            "time": "Recently",
            "type": "customer"
        })
    
    # Recent referrals
    recent_referrals = db.query(ReferralModel).filter(
        ReferralModel.user_id == user_id,
        ReferralModel.status == "completed"
    ).order_by(desc(ReferralModel.id)).limit(2).all()
    
    for referral in recent_referrals:
        activities.append({
            "action": f"Referral reward earned: ₹{referral.reward_points}",
            "time": "Recently",
            "type": "reward"
        })
    
    # Recent interactions
    recent_interactions = db.query(InteractionModel).join(CustomerModel).filter(
        CustomerModel.user_id == user_id
    ).order_by(desc(InteractionModel.timestamp)).limit(2).all()
    
    for interaction in recent_interactions:
        activities.append({
            "action": f"Customer interaction: {interaction.message[:50]}...",
            "time": "Recently",
            "type": "interaction"
        })
    
    return activities[:6]  # Return max 6 activities

@router.get("/reports")
def get_reports(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    # This is a simplified report
    # In a real application, you would generate more detailed reports
    
    customers = db.query(CustomerModel).filter(CustomerModel.user_id == user_id).all()
    referrals = db.query(ReferralModel).filter(ReferralModel.user_id == user_id).all()
    
    return {
        "customers": [
            {
                "id": c.id,
                "name": c.name,
                "contact_info": c.contact_info,
                "last_contacted": c.last_contacted
            }
            for c in customers
        ],
        "referrals": [
            {
                "id": r.id,
                "customer_id": r.customer_id,
                "referred_by": r.referred_by,
                "status": r.status,
                "reward_points": r.reward_points
            }
            for r in referrals
        ]
    }