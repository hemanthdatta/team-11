from fastapi import HTTPException, status
from pydantic import BaseModel, validator
import re
from typing import Optional

# Validation functions
def validate_email(email: str) -> str:
    """Validate email format"""
    email_regex = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    if not re.match(email_regex, email):
        raise ValueError("Invalid email format")
    return email

def validate_phone(phone: str) -> str:
    """Validate phone number format (Indian format)"""
    # Indian phone numbers: 10 digits, optionally with +91 prefix
    phone_regex = r'^(\+91)?[6-9]\d{9}$'
    if not re.match(phone_regex, phone):
        raise ValueError("Invalid Indian phone number format")
    return phone

def validate_password(password: str) -> str:
    """Validate password strength"""
    if len(password) < 8:
        raise ValueError("Password must be at least 8 characters long")
    
    # Check for at least one uppercase, one lowercase, and one digit
    if not re.search(r'[A-Z]', password):
        raise ValueError("Password must contain at least one uppercase letter")
    
    if not re.search(r'[a-z]', password):
        raise ValueError("Password must contain at least one lowercase letter")
    
    if not re.search(r'\d', password):
        raise ValueError("Password must contain at least one digit")
    
    return password

# Enhanced schemas with validation
class UserCreateSecure(BaseModel):
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    user_id: str
    password: str
    
    @validator('email')
    def email_validator(cls, v):
        if v is not None:
            return validate_email(v)
        return v
    
    @validator('phone')
    def phone_validator(cls, v):
        if v is not None:
            return validate_phone(v)
        return v
    
    @validator('password')
    def password_validator(cls, v):
        return validate_password(v)
    
    @validator('user_id')
    def user_id_validator(cls, v):
        if len(v) < 3:
            raise ValueError("User ID must be at least 3 characters long")
        if not re.match(r'^[a-zA-Z0-9_]+$', v):
            raise ValueError("User ID can only contain letters, numbers, and underscores")
        return v

class CustomerCreateSecure(BaseModel):
    name: str
    contact_info: str
    notes: Optional[str] = None
    user_id: int
    
    @validator('name')
    def name_validator(cls, v):
        if len(v.strip()) < 1:
            raise ValueError("Name cannot be empty")
        return v.strip()
    
    @validator('contact_info')
    def contact_info_validator(cls, v):
        # Contact info can be email or phone
        if '@' in v:
            return validate_email(v)
        else:
            return validate_phone(v)

# Security middleware
from fastapi import Request
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded

# Initialize rate limiter
limiter = Limiter(key_func=get_remote_address)

# Input sanitization
import html
import bleach

def sanitize_input(text: str) -> str:
    """Sanitize user input to prevent XSS"""
    # Remove HTML tags and escape special characters
    cleaned = bleach.clean(text, tags=[], attributes={}, strip=True)
    return html.escape(cleaned)

# Security headers middleware
from starlette.middleware.base import BaseHTTPMiddleware

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        return response