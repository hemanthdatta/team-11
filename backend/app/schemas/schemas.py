from pydantic import BaseModel
from typing import Optional
from datetime import datetime

# User schemas
class UserBase(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    user_id: str

class UserCreate(UserBase):
    password: str

class UserUpdate(UserBase):
    pass

class User(UserBase):
    id: int
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