from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User as UserModel
from typing import Dict, Any, List
import secrets
import string

router = APIRouter()

@router.get("/website/{user_id}")
def get_website_info(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get website information for a user"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Generate a website URL based on user info
    website_slug = user.name.lower().replace(" ", "-") if user.name else f"user-{user_id}"
    
    return {
        "website_url": f"growthpro.app/{website_slug}",
        "status": "live",
        "template": "professional",
        "last_updated": "2024-01-15T10:30:00Z",
        "views": 156,
        "leads": 12
    }

@router.get("/templates")
def get_website_templates() -> List[Dict[str, Any]]:
    """Get available website templates"""
    return [
        {
            "id": "professional",
            "name": "Professional",
            "description": "Clean and corporate design",
            "image": "🏢",
            "features": ["Contact Form", "Service List", "Testimonials"],
            "preview_url": "/templates/professional/preview"
        },
        {
            "id": "modern",
            "name": "Modern",
            "description": "Contemporary and stylish",
            "image": "✨",
            "features": ["Portfolio Gallery", "Blog Section", "Social Links"],
            "preview_url": "/templates/modern/preview"
        },
        {
            "id": "minimal",
            "name": "Minimal",
            "description": "Simple and elegant",
            "image": "🎯",
            "features": ["About Section", "Contact Details"],
            "preview_url": "/templates/minimal/preview"
        }
    ]

@router.post("/website/{user_id}/template")
def apply_template(
    user_id: int,
    template_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Apply a template to user's website"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    template_id = template_data.get("template_id")
    if not template_id:
        raise HTTPException(status_code=400, detail="Template ID is required")
    
    # In a real app, you would save this to the database
    return {
        "message": f"Template '{template_id}' applied successfully",
        "website_url": f"growthpro.app/{user.name.lower().replace(' ', '-') if user.name else f'user-{user_id}'}"
    }

@router.get("/social-profiles/{user_id}")
def get_social_profiles(user_id: int, db: Session = Depends(get_db)) -> List[Dict[str, Any]]:
    """Get social media profiles for a user"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mock social profiles data
    return [
        {
            "platform": "WhatsApp Business",
            "status": "active",
            "features": ["Business Profile", "Catalog", "Quick Replies"],
            "engagement": "high",
            "profile_url": f"https://wa.me/{user.phone}" if user.phone else None,
            "last_updated": "2024-01-15T10:30:00Z"
        },
        {
            "platform": "Facebook Page",
            "status": "needs_update",
            "features": ["Business Info", "Reviews", "Messaging"],
            "engagement": "medium",
            "profile_url": f"https://facebook.com/{user.name.lower().replace(' ', '.')}" if user.name else None,
            "last_updated": "2024-01-10T08:15:00Z"
        },
        {
            "platform": "Instagram Business",
            "status": "active",
            "features": ["Bio Link", "Stories Highlights", "Contact Button"],
            "engagement": "high",
            "profile_url": f"https://instagram.com/{user.name.lower().replace(' ', '_')}" if user.name else None,
            "last_updated": "2024-01-14T16:45:00Z"
        }
    ]

@router.post("/social-profiles/{user_id}/update")
def update_social_profile(
    user_id: int,
    profile_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Update a social media profile"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    platform = profile_data.get("platform")
    if not platform:
        raise HTTPException(status_code=400, detail="Platform is required")
    
    # In a real app, you would update the social profile data
    return {
        "message": f"{platform} profile updated successfully",
        "status": "active"
    }

@router.get("/analytics/{user_id}")
def get_digital_presence_analytics(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Get analytics for user's digital presence"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Mock analytics data
    return {
        "website": {
            "total_views": 1250,
            "unique_visitors": 890,
            "bounce_rate": 35.2,
            "avg_session_duration": "2m 45s",
            "top_pages": [
                {"page": "/", "views": 450},
                {"page": "/services", "views": 320},
                {"page": "/contact", "views": 280}
            ]
        },
        "social_media": {
            "total_followers": 2340,
            "total_engagement": 1890,
            "engagement_rate": 8.7,
            "platforms": [
                {"platform": "WhatsApp", "followers": 890, "engagement": 750},
                {"platform": "Facebook", "followers": 1200, "engagement": 840},
                {"platform": "Instagram", "followers": 250, "engagement": 300}
            ]
        },
        "leads": {
            "total_leads": 45,
            "conversion_rate": 12.5,
            "sources": [
                {"source": "Website", "leads": 20},
                {"source": "WhatsApp", "leads": 15},
                {"source": "Facebook", "leads": 10}
            ]
        }
    }
