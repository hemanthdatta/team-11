from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Boolean, Float
from sqlalchemy.sql import func
from app.database.database import Base
from passlib.hash import bcrypt

class User(Base):
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    phone = Column(String, unique=True, index=True)
    user_id = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    def set_password(self, password):
        self.password_hash = bcrypt.hash(password)
    
    def check_password(self, password):
        return bcrypt.verify(password, self.password_hash)

class SocialAccount(Base):
    __tablename__ = "social_accounts"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    platform_name = Column(String)
    access_token = Column(String)
    refresh_token = Column(String)
    expiry_date = Column(DateTime(timezone=True))

class Customer(Base):
    __tablename__ = "customers"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String, index=True)
    contact_info = Column(String)
    last_contacted = Column(DateTime(timezone=True))
    notes = Column(String)

class Referral(Base):
    __tablename__ = "referrals"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    customer_id = Column(Integer, ForeignKey("customers.id"))
    referred_by = Column(String)  # Could be user_id or customer_id
    status = Column(String)  # pending, accepted, completed
    reward_points = Column(Integer)

class Interaction(Base):
    __tablename__ = "interactions"
    
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("customers.id"))
    message = Column(String)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    sent_by = Column(String)  # user_id or system