from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.database.database import get_db
from app.models.models import Referral as ReferralModel, Customer as CustomerModel
from app.schemas.schemas import ReferralCreate, ReferralUpdate, Referral as ReferralSchema
from typing import List, Dict, Any
import secrets
import string

router = APIRouter()

@router.post("/", response_model=ReferralSchema)
def create_referral(referral: ReferralCreate, db: Session = Depends(get_db)):
    db_referral = ReferralModel(**referral.dict())
    db.add(db_referral)
    db.commit()
    db.refresh(db_referral)
    return db_referral

@router.get("/", response_model=List[ReferralSchema])
def get_referrals(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    referrals = db.query(ReferralModel).filter(ReferralModel.user_id == user_id).offset(skip).limit(limit).all()
    return referrals

@router.get("/stats")
def get_referral_stats(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get referral statistics for a user"""
    total_referrals = db.query(ReferralModel).filter(ReferralModel.user_id == user_id).count()
    completed_referrals = db.query(ReferralModel).filter(
        ReferralModel.user_id == user_id,
        ReferralModel.status == "completed"
    ).count()
    pending_referrals = db.query(ReferralModel).filter(
        ReferralModel.user_id == user_id,
        ReferralModel.status == "pending"
    ).count()
    
    total_earnings = db.query(func.sum(ReferralModel.reward_points)).filter(
        ReferralModel.user_id == user_id,
        ReferralModel.status == "completed"
    ).scalar() or 0
    
    # Calculate tier based on completed referrals
    current_tier = "Bronze"
    next_tier_progress = 0
    
    if completed_referrals >= 50:
        current_tier = "Gold"
        next_tier_progress = 100
    elif completed_referrals >= 20:
        current_tier = "Silver"
        next_tier_progress = (completed_referrals - 20) / 30 * 100
    else:
        current_tier = "Bronze"
        next_tier_progress = completed_referrals / 20 * 100
    
    return {
        "total_referrals": total_referrals,
        "completed_referrals": completed_referrals,
        "pending_referrals": pending_referrals,
        "total_earnings": total_earnings,
        "current_tier": current_tier,
        "next_tier_progress": min(next_tier_progress, 100)
    }

@router.get("/link/{user_id}")
def get_referral_link(user_id: int) -> Dict[str, str]:
    """Generate or get referral link for a user"""
    # In a real app, you might store this in the database
    referral_code = f"ref_{user_id}_{''.join(secrets.choice(string.ascii_lowercase + string.digits) for _ in range(6))}"
    referral_link = f"https://growthpro.app/ref/{referral_code}"
    
    return {
        "referral_link": referral_link,
        "referral_code": referral_code
    }

@router.get("/rewards", response_model=List[ReferralSchema])
def get_rewards(
    user_id: int,
    status: str = "completed",
    db: Session = Depends(get_db)
):
    referrals = db.query(ReferralModel).filter(
        ReferralModel.user_id == user_id,
        ReferralModel.status == status
    ).all()
    return referrals

@router.put("/{referral_id}", response_model=ReferralSchema)
def update_referral(
    referral_id: int,
    referral: ReferralUpdate,
    db: Session = Depends(get_db)
):
    db_referral = db.query(ReferralModel).filter(ReferralModel.id == referral_id).first()
    if not db_referral:
        raise HTTPException(status_code=404, detail="Referral not found")
    
    for key, value in referral.dict().items():
        setattr(db_referral, key, value)
    
    db.commit()
    db.refresh(db_referral)
    return db_referral