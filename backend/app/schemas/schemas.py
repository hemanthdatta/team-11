from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    user_id: str
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    website: Optional[str] = None

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None

class UserProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    business_name: Optional[str] = None
    business_type: Optional[str] = None
    location: Optional[str] = None
    bio: Optional[str] = None
    profile_image: Optional[str] = None
    website: Optional[str] = None

class User(UserBase):
    id: int
    profile_image: Optional[str] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Social Account schemas
class SocialAccountBase(BaseModel):
    platform_name: str
    access_token: str
    refresh_token: Optional[str] = None
    expiry_date: Optional[datetime] = None

class SocialAccountCreate(SocialAccountBase):
    user_id: int

class SocialAccountUpdate(SocialAccountBase):
    pass

class SocialAccount(SocialAccountBase):
    id: int
    
    class Config:
        from_attributes = True

# Customer schemas
class CustomerBase(BaseModel):
    name: str
    contact_info: str
    notes: Optional[str] = None

class CustomerCreate(CustomerBase):
    user_id: int

class CustomerUpdate(CustomerBase):
    pass

class Customer(CustomerBase):
    id: int
    last_contacted: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# Referral schemas
class ReferralBase(BaseModel):
    customer_id: int
    referred_by: str
    status: str
    reward_points: int

class ReferralCreate(ReferralBase):
    user_id: int

class ReferralUpdate(ReferralBase):
    pass

class Referral(ReferralBase):
    id: int
    
    class Config:
        from_attributes = True

# Interaction schemas
class InteractionBase(BaseModel):
    message: str
    sent_by: str

class InteractionCreate(InteractionBase):
    customer_id: int

class InteractionUpdate(InteractionBase):
    pass

class Interaction(InteractionBase):
    id: int
    timestamp: datetime
    
    class Config:
        from_attributes = True

# Customer Interaction schemas
class CustomerInteractionBase(BaseModel):
    interaction_type: str
    interaction_date: datetime
    title: str
    notes: str
    follow_up_needed: bool = False
    follow_up_date: Optional[datetime] = None
    status: str = "completed"

class CustomerInteractionCreate(CustomerInteractionBase):
    customer_id: int
    user_id: int

class CustomerInteractionUpdate(CustomerInteractionBase):
    interaction_type: Optional[str] = None
    interaction_date: Optional[datetime] = None
    title: Optional[str] = None
    notes: Optional[str] = None
    follow_up_needed: Optional[bool] = None
    follow_up_date: Optional[datetime] = None
    status: Optional[str] = None

class CustomerInteraction(CustomerInteractionBase):
    id: int
    customer_id: int
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True