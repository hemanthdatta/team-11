from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from typing import List, Optional
from datetime import datetime, timedelta

from app.database.database import get_db
from app.models.models import CustomerInteraction as CustomerInteractionModel
from app.schemas.schemas import (
    CustomerInteractionCreate,
    CustomerInteractionUpdate,
    CustomerInteraction as CustomerInteractionSchema
)

router = APIRouter()

@router.post("/", response_model=CustomerInteractionSchema)
def create_customer_interaction(
    interaction: CustomerInteractionCreate,
    db: Session = Depends(get_db)
):
    """Create a new customer interaction record"""
    db_interaction = CustomerInteractionModel(**interaction.dict())
    
    db.add(db_interaction)
    db.commit()
    db.refresh(db_interaction)
    
    return db_interaction

@router.get("/", response_model=List[CustomerInteractionSchema])
def get_customer_interactions(
    customer_id: int,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    """Get all interactions for a specific customer"""
    query = db.query(CustomerInteractionModel).filter(
        CustomerInteractionModel.customer_id == customer_id
    )
    
    if user_id:
        query = query.filter(CustomerInteractionModel.user_id == user_id)
    
    interactions = query.order_by(desc(CustomerInteractionModel.interaction_date)).offset(skip).limit(limit).all()
    
    return interactions

@router.get("/upcoming-followups", response_model=List[CustomerInteractionSchema])
def get_upcoming_followups(
    user_id: int,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get all interactions that require follow-up in the next X days"""
    today = datetime.now()
    end_date = today + timedelta(days=days)
    
    followups = db.query(CustomerInteractionModel).filter(
        and_(
            CustomerInteractionModel.user_id == user_id,
            CustomerInteractionModel.follow_up_needed == True,
            CustomerInteractionModel.follow_up_date >= today,
            CustomerInteractionModel.follow_up_date <= end_date,
            CustomerInteractionModel.status != "completed"
        )
    ).order_by(CustomerInteractionModel.follow_up_date).all()
    
    return followups

@router.get("/recent", response_model=List[CustomerInteractionSchema])
def get_recent_interactions(
    user_id: int,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """Get all recent interactions in the last X days"""
    start_date = datetime.now() - timedelta(days=days)
    
    interactions = db.query(CustomerInteractionModel).filter(
        and_(
            CustomerInteractionModel.user_id == user_id,
            CustomerInteractionModel.interaction_date >= start_date
        )
    ).order_by(desc(CustomerInteractionModel.interaction_date)).all()
    
    return interactions

@router.get("/{interaction_id}", response_model=CustomerInteractionSchema)
def get_interaction(
    interaction_id: int,
    db: Session = Depends(get_db)
):
    """Get a specific interaction by ID"""
    interaction = db.query(CustomerInteractionModel).filter(
        CustomerInteractionModel.id == interaction_id
    ).first()
    
    if not interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    return interaction

@router.put("/{interaction_id}", response_model=CustomerInteractionSchema)
def update_interaction(
    interaction_id: int,
    interaction_update: CustomerInteractionUpdate,
    db: Session = Depends(get_db)
):
    """Update an existing interaction"""
    db_interaction = db.query(CustomerInteractionModel).filter(
        CustomerInteractionModel.id == interaction_id
    ).first()
    
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    # Update only the fields that are provided
    update_data = interaction_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_interaction, key, value)
    
    db.commit()
    db.refresh(db_interaction)
    
    return db_interaction

@router.delete("/{interaction_id}")
def delete_interaction(
    interaction_id: int,
    db: Session = Depends(get_db)
):
    """Delete an interaction"""
    db_interaction = db.query(CustomerInteractionModel).filter(
        CustomerInteractionModel.id == interaction_id
    ).first()
    
    if not db_interaction:
        raise HTTPException(status_code=404, detail="Interaction not found")
    
    db.delete(db_interaction)
    db.commit()
    
    return {"message": "Interaction deleted successfully"}
