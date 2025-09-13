from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.database.database import get_db
from app.models.models import Customer as CustomerModel, Interaction as InteractionModel
from app.schemas.schemas import CustomerCreate, CustomerUpdate, Customer as CustomerSchema
from typing import List, Dict, Any
from datetime import datetime

router = APIRouter()

@router.post("/", response_model=CustomerSchema)
def create_customer(customer: CustomerCreate, db: Session = Depends(get_db)):
    db_customer = CustomerModel(**customer.dict())
    db.add(db_customer)
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.get("/", response_model=List[CustomerSchema])
def get_customers(
    user_id: int,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db)
):
    customers = db.query(CustomerModel).filter(CustomerModel.user_id == user_id).offset(skip).limit(limit).all()
    return customers

@router.get("/search", response_model=List[CustomerSchema])
def search_customers(
    user_id: int,
    query: str,
    db: Session = Depends(get_db)
):
    customers = db.query(CustomerModel).filter(
        CustomerModel.user_id == user_id,
        or_(
            CustomerModel.name.contains(query),
            CustomerModel.contact_info.contains(query),
            CustomerModel.notes.contains(query)
        )
    ).all()
    return customers

@router.post("/{customer_id}/contact")
def contact_customer(
    customer_id: int,
    contact_data: Dict[str, Any],
    db: Session = Depends(get_db)
):
    """Record a contact interaction with a customer"""
    db_customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    # Update last contacted time
    db_customer.last_contacted = datetime.utcnow()
    
    # Create interaction record
    interaction = InteractionModel(
        customer_id=customer_id,
        message=contact_data.get("message", "Contact made"),
        sent_by=contact_data.get("sent_by", "user")
    )
    
    db.add(interaction)
    db.commit()
    db.refresh(db_customer)
    
    return {"message": "Contact recorded successfully", "customer": db_customer}

@router.get("/{customer_id}/interactions")
def get_customer_interactions(
    customer_id: int,
    db: Session = Depends(get_db)
):
    """Get all interactions for a specific customer"""
    interactions = db.query(InteractionModel).filter(
        InteractionModel.customer_id == customer_id
    ).order_by(InteractionModel.timestamp.desc()).all()
    
    return interactions

@router.get("/{customer_id}", response_model=CustomerSchema)
def get_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    return db_customer

@router.put("/{customer_id}", response_model=CustomerSchema)
def update_customer(
    customer_id: int,
    customer: CustomerUpdate,
    db: Session = Depends(get_db)
):
    db_customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    for key, value in customer.dict().items():
        setattr(db_customer, key, value)
    
    db.commit()
    db.refresh(db_customer)
    return db_customer

@router.delete("/{customer_id}")
def delete_customer(customer_id: int, db: Session = Depends(get_db)):
    db_customer = db.query(CustomerModel).filter(CustomerModel.id == customer_id).first()
    if not db_customer:
        raise HTTPException(status_code=404, detail="Customer not found")
    
    db.delete(db_customer)
    db.commit()
    return {"message": "Customer deleted successfully"}