import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from app.api import auth, customers, referrals, dashboard, social, ai_assistant, digital_presence, messaging, ai_image_generator, customer_interactions
from app.core.security_utils import SecurityHeadersMiddleware, limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

def create_app():
    app = FastAPI(
        title="Micro-Entrepreneur Growth App",
        description="Backend API for Micro-Entrepreneur Growth App",
        version="0.1.0"
    )
    
    # Add security middleware
    app.add_middleware(SecurityHeadersMiddleware)
    
    # Configure CORS for production
    allowed_origins = [
        "http://localhost:3000",
        "http://localhost:3001", 
        "https://your-frontend-domain.vercel.app",  # Update with your Vercel domain
        "https://*.vercel.app",  # Allow all Vercel preview deployments
    ]
    
    # In development, allow all origins
    if os.getenv("ENVIRONMENT") == "development":
        allowed_origins = ["*"]
    
    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["*"],
    )
    
    # Create uploads directory if it doesn't exist
    os.makedirs("uploads/profile_images", exist_ok=True)
    
    # Mount static files directory for serving uploaded files
    app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")
    
    # Add rate limiter
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    
    # Include routers
    app.include_router(auth.router, prefix="/auth", tags=["auth"])
    app.include_router(customers.router, prefix="/customers", tags=["customers"])
    app.include_router(referrals.router, prefix="/referrals", tags=["referrals"])
    app.include_router(dashboard.router, prefix="/dashboard", tags=["dashboard"])
    app.include_router(social.router, prefix="/social", tags=["social"])
    app.include_router(ai_assistant.router, prefix="/ai", tags=["ai"])
    app.include_router(ai_image_generator.router, prefix="/ai", tags=["ai"])
    app.include_router(digital_presence.router, prefix="/digital-presence", tags=["digital-presence"])
    app.include_router(messaging.router, prefix="/messaging", tags=["messaging"])
    app.include_router(customer_interactions.router, prefix="/interactions", tags=["interactions"])
    
    @app.get("/")
    async def root():
        return {"message": "Micro-Entrepreneur Growth App API"}
    
    return app

app = create_app()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)