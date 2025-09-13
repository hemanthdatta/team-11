from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import SocialAccount
from app.schemas.schemas import SocialAccountCreate, SocialAccountUpdate, SocialAccount
from typing import List
from app.core.celery_app import process_social_media_post

router = APIRouter()

@router.post("/connect", response_model=SocialAccount)
def connect_social_account(account: SocialAccountCreate, db: Session = Depends(get_db)):
    # In a real implementation, you would:
    # 1. Redirect user to the social platform's OAuth flow
    # 2. Receive the authorization code
    # 3. Exchange it for access/refresh tokens
    # 4. Store the tokens securely
    
    # For now, we'll just store the provided account info
    db_account = SocialAccount(**account.dict())
    db.add(db_account)
    db.commit()
    db.refresh(db_account)
    return db_account

@router.get("/accounts", response_model=List[SocialAccount])
def get_social_accounts(user_id: int, db: Session = Depends(get_db)):
    accounts = db.query(SocialAccount).filter(SocialAccount.user_id == user_id).all()
    return accounts

@router.post("/refresh/{account_id}")
def refresh_token(account_id: int, db: Session = Depends(get_db)):
    # In a real implementation, you would:
    # 1. Use the refresh token to get a new access token
    # 2. Update the stored tokens
    
    db_account = db.query(SocialAccount).filter(SocialAccount.id == account_id).first()
    if not db_account:
        raise HTTPException(status_code=404, detail="Social account not found")
    
    # This is a placeholder - in reality, you would implement the refresh logic
    return {"message": "Token refresh logic would be implemented here"}

@router.post("/post/{user_id}/{platform}")
def schedule_social_post(user_id: int, platform: str, content: str):
    # Schedule social media post as a background task
    process_social_media_post.delay(user_id, platform, content)
    
    return {
        "message": f"Post scheduled for {platform}",
        "status": "Task queued for background processing"
    }

@router.delete("/disconnect/{account_id}")
def disconnect_social_account(account_id: int, db: Session = Depends(get_db)):
    db_account = db.query(SocialAccount).filter(SocialAccount.id == account_id).first()
    if not db_account:
        raise HTTPException(status_code=404, detail="Social account not found")
    
    db.delete(db_account)
    db.commit()
    return {"message": "Social account disconnected successfully"}