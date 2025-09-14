from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
import json
import os
import shutil
import uuid
from app.database.database import get_db
from app.models.models import User as UserModel
from app.schemas.schemas import UserCreate, User as UserSchema, UserProfileUpdate
from app.schemas.login import LoginRequest
from app.core.security import get_password_hash, create_access_token, verify_password
from datetime import timedelta
from typing import Dict, Any, Optional

router = APIRouter()

@router.post("/signup", response_model=UserSchema)
def register_user(user: UserCreate, db: Session = Depends(get_db)):
    # Check if user already exists
    db_user = db.query(UserModel).filter(UserModel.user_id == user.user_id).first()
    if db_user:
        raise HTTPException(status_code=400, detail="User ID already registered")
    
    # Check if email is already registered
    if user.email:
        db_user = db.query(UserModel).filter(UserModel.email == user.email).first()
        if db_user:
            raise HTTPException(status_code=400, detail="Email already registered")
    
    # Create new user
    db_user = UserModel(
        name=user.name,
        email=user.email,
        phone=user.phone,
        user_id=user.user_id,
        business_name=user.business_name,
        business_type=user.business_type,
        location=user.location,
        bio=user.bio,
        website=user.website
    )
    db_user.set_password(user.password)
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/login")
def login_user(login_request: LoginRequest, db: Session = Depends(get_db)) -> Dict[str, Any]:
    user_id = login_request.user_id
    password = login_request.password
    
    # Find user by user_id
    db_user = db.query(UserModel).filter(UserModel.user_id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=400, detail="Incorrect user ID or password")
    
    # Verify password
    if not verify_password(password, db_user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect user ID or password")
    
    # Create access token
    access_token_expires = timedelta(minutes=30)
    access_token = create_access_token(
        data={"sub": db_user.user_id}, expires_delta=access_token_expires
    )
    
    # Return user basic info along with token
    return {
        "access_token": access_token, 
        "token_type": "bearer",
        "user_id": db_user.user_id,
        "name": db_user.name,
        "id": db_user.id
    }

@router.get("/profile", response_model=UserSchema)
def get_user_profile(current_user_id: str, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.user_id == current_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user

@router.put("/profile", response_model=UserSchema)
def update_user_profile(current_user_id: str, user_update: UserProfileUpdate, db: Session = Depends(get_db)):
    db_user = db.query(UserModel).filter(UserModel.user_id == current_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Update user fields with values from user_update if they are provided
    if user_update.name is not None:
        db_user.name = user_update.name
    if user_update.email is not None:
        db_user.email = user_update.email
    if user_update.phone is not None:
        db_user.phone = user_update.phone
    if user_update.business_name is not None:
        db_user.business_name = user_update.business_name
    if user_update.business_type is not None:
        db_user.business_type = user_update.business_type
    if user_update.location is not None:
        db_user.location = user_update.location
    if user_update.bio is not None:
        db_user.bio = user_update.bio
    if user_update.website is not None:
        db_user.website = user_update.website
    if user_update.profile_image is not None:
        db_user.profile_image = user_update.profile_image
    
    db.commit()
    db.refresh(db_user)
    
    return db_user

@router.post("/profile/upload-image")
async def upload_profile_image(
    current_user_id: str, 
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Check if user exists
    db_user = db.query(UserModel).filter(UserModel.user_id == current_user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Create uploads directory if it doesn't exist
    upload_dir = os.path.join("uploads", "profile_images")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_extension = os.path.splitext(file.filename)[1] if file.filename else ".jpg"
    unique_filename = f"{uuid.uuid4()}{file_extension}"
    file_path = os.path.join(upload_dir, unique_filename)
    
    # Save uploaded file
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)
    
    # Update user profile with image path
    image_url = f"/uploads/profile_images/{unique_filename}"
    db_user.profile_image = image_url
    db.commit()
    
    return {"profile_image": image_url}

@router.get("/business-types")
def get_business_types():
    # Return a list of common business types for micro-entrepreneurs
    return {
        "business_types": [
            "Retail Store",
            "Restaurant/Food Service",
            "Service Provider",
            "Insurance Agent",
            "Real Estate Agent",
            "Consultant",
            "Freelancer",
            "Online Store",
            "Beauty/Salon",
            "Healthcare",
            "Education",
            "Transportation",
            "Manufacturing",
            "Technology",
            "Arts and Crafts",
            "Agriculture",
            "Other"
        ]
    }