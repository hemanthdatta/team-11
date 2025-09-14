from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.models.models import User as UserModel
from typing import Dict, Any, List
import secrets
import string
import httpx
import os
from dotenv import load_dotenv
import json
import re

load_dotenv()

router = APIRouter()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"

async def generate_website_with_gemini(user_data: Dict[str, Any], template_type: str) -> str:
    """Generate HTML/CSS website using Gemini API"""
    
    if not GEMINI_API_KEY:
        return generate_fallback_website(user_data, template_type)
    
    # Prepare user context for Gemini
    user_name = user_data.get("name", "Professional")
    business_name = user_data.get("business_name", f"{user_name}'s Business")
    business_type = user_data.get("business_type", "Insurance Services")
    location = user_data.get("location", "India")
    bio = user_data.get("bio", "Professional insurance consultant providing comprehensive coverage solutions.")
    phone = user_data.get("phone", "+91 XXXXXXXXXX")
    email = user_data.get("email", "contact@business.com")
    website = user_data.get("website", "")
    
    # Template-specific styling instructions
    template_styles = {
        "professional": {
            "colors": "Use professional colors like navy blue (#1e3a8a), white, and light gray",
            "layout": "Clean corporate layout with header, hero section, services, and contact",
            "fonts": "Use professional fonts like Arial, Helvetica, or system fonts",
            "style": "Corporate and trustworthy design"
        },
        "modern": {
            "colors": "Use modern colors like teal (#0d9488), purple accents, and gradients",
            "layout": "Contemporary layout with cards, modern spacing, and visual elements",
            "fonts": "Use modern fonts, good contrast and readability",
            "style": "Contemporary and stylish design with visual appeal"
        },
        "minimal": {
            "colors": "Use minimal colors like black, white, and one accent color",
            "layout": "Simple, clean layout focused on content and whitespace",
            "fonts": "Use simple, readable fonts with good typography",
            "style": "Minimalist and elegant design"
        }
    }
    
    current_style = template_styles.get(template_type, template_styles["professional"])
    
    gemini_prompt = f"""
    Create a complete HTML page with embedded CSS for an individual insurance agent's personal professional website.

    IMPORTANT: This is for an INDIVIDUAL INSURANCE AGENT, not a company. Use personal pronouns and individual agent language.

    Agent Personal Details:
    - Agent Name: {user_name}
    - Professional Title: Licensed Insurance Advisor/Agent
    - Business/Agency Name: {business_name} (if different from agent name)
    - Specialization: {business_type}
    - Location: {location}
    - About Me: {bio}
    - Mobile: {phone}
    - Email: {email}
    - Website/Social: {website}

    Template Style: {template_type.title()}
    - Colors: {current_style['colors']}
    - Layout: {current_style['layout']}
    - Fonts: {current_style['fonts']}
    - Style: {current_style['style']}

    Content Requirements (INDIVIDUAL AGENT FOCUS):
    1. Hero Section: "Hi, I'm {user_name}" - personal introduction as an insurance advisor
    2. About Me: Personal story, experience, why clients choose me personally
    3. My Services: Insurance products I offer as an individual agent
    4. Why Choose Me: Personal credentials, client testimonials, my approach
    5. Contact Me: Direct personal contact methods
    6. My Credentials: Licenses, certifications, years of experience

    Technical Requirements:
    1. Single HTML file with embedded CSS (no external dependencies)
    2. Mobile-responsive using CSS media queries
    3. Professional yet personal tone throughout
    4. Include personal photo placeholder area
    5. WhatsApp and direct call buttons
    6. Trust indicators specific to individual agents
    7. Indian market appropriate design and content

    Content Tone: 
    - Use "I", "me", "my" throughout (not "we", "us", "our")
    - Personal approach: "I help families", "My clients trust me"
    - Individual credentials: "I am licensed", "I have X years experience"
    - Personal availability: "Call me directly", "I'm available on WhatsApp"

    Insurance Services (Individual Agent):
    - Health Insurance: "I help you choose the right health plan for your family"
    - Life Insurance: "I ensure your family's financial security with personalized life insurance"
    - Motor Insurance: "I provide comprehensive vehicle protection with quick claim support"
    - Investment Plans: "I guide you through ULIP and investment-linked insurance products"

    Generate ONLY the complete HTML code with embedded CSS. Focus on the individual agent's personal brand and direct client relationships.
    """
    
    try:
        async with httpx.AsyncClient(timeout=60.0) as client:
            response = await client.post(
                f"{GEMINI_API_URL}?key={GEMINI_API_KEY}",
                json={
                    "contents": [{
                        "parts": [{
                            "text": gemini_prompt
                        }]
                    }]
                },
                headers={
                    "Content-Type": "application/json"
                }
            )
            
            if response.status_code == 200:
                data = response.json()
                if "candidates" in data and len(data["candidates"]) > 0:
                    html_content = data["candidates"][0]["content"]["parts"][0]["text"]
                    
                    # Clean up the response to extract HTML
                    # Remove markdown code blocks if present
                    html_content = re.sub(r'```html\s*', '', html_content)
                    html_content = re.sub(r'```\s*$', '', html_content)
                    html_content = html_content.strip()
                    
                    # Ensure it's proper HTML
                    if not html_content.startswith('<!DOCTYPE') and not html_content.startswith('<html'):
                        # If it doesn't start with proper HTML, try to extract it
                        html_match = re.search(r'<!DOCTYPE.*?</html>', html_content, re.DOTALL | re.IGNORECASE)
                        if html_match:
                            html_content = html_match.group(0)
                        else:
                            return generate_fallback_website(user_data, template_type)
                    
                    return html_content
                else:
                    print("No candidates in Gemini response for website generation")
                    return generate_fallback_website(user_data, template_type)
            else:
                print(f"Gemini API error for website generation: {response.status_code}")
                return generate_fallback_website(user_data, template_type)
                
    except Exception as e:
        print(f"Error calling Gemini API for website generation: {e}")
        return generate_fallback_website(user_data, template_type)

def generate_fallback_website(user_data: Dict[str, Any], template_type: str) -> str:
    """Generate a fallback website when Gemini API is not available"""
    
    user_name = user_data.get("name", "Professional")
    business_name = user_data.get("business_name", f"{user_name}'s Business")
    business_type = user_data.get("business_type", "Insurance Services")
    location = user_data.get("location", "India")
    bio = user_data.get("bio", "Professional insurance consultant providing comprehensive coverage solutions.")
    phone = user_data.get("phone", "+91 XXXXXXXXXX")
    email = user_data.get("email", "contact@business.com")
    
    # Template-specific colors
    colors = {
        "professional": {"primary": "#1e3a8a", "secondary": "#f8fafc", "accent": "#3b82f6"},
        "modern": {"primary": "#0d9488", "secondary": "#f0fdfa", "accent": "#14b8a6"},
        "minimal": {"primary": "#1f2937", "secondary": "#f9fafb", "accent": "#6b7280"}
    }
    
    current_colors = colors.get(template_type, colors["professional"])
    
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{business_name} - {business_type}</title>
    <style>
        * {{
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }}
        
        body {{
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #333;
        }}
        
        .container {{
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }}
        
        header {{
            background: {current_colors['primary']};
            color: white;
            padding: 1rem 0;
            position: fixed;
            width: 100%;
            top: 0;
            z-index: 1000;
        }}
        
        nav {{
            display: flex;
            justify-content: space-between;
            align-items: center;
        }}
        
        .logo {{
            font-size: 1.5rem;
            font-weight: bold;
        }}
        
        .nav-links {{
            display: flex;
            list-style: none;
            gap: 2rem;
        }}
        
        .nav-links a {{
            color: white;
            text-decoration: none;
            transition: opacity 0.3s;
        }}
        
        .nav-links a:hover {{
            opacity: 0.8;
        }}
        
        main {{
            margin-top: 80px;
        }}
        
        .hero {{
            background: linear-gradient(135deg, {current_colors['primary']}, {current_colors['accent']});
            color: white;
            padding: 4rem 0;
            text-align: center;
        }}
        
        .hero h1 {{
            font-size: 3rem;
            margin-bottom: 1rem;
        }}
        
        .hero p {{
            font-size: 1.2rem;
            margin-bottom: 2rem;
            max-width: 600px;
            margin-left: auto;
            margin-right: auto;
        }}
        
        .cta-buttons {{
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
        }}
        
        .btn {{
            padding: 12px 24px;
            border: none;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            transition: transform 0.3s, box-shadow 0.3s;
            font-weight: 500;
        }}
        
        .btn:hover {{
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        }}
        
        .btn-primary {{
            background: white;
            color: {current_colors['primary']};
        }}
        
        .btn-secondary {{
            background: transparent;
            color: white;
            border: 2px solid white;
        }}
        
        .services {{
            padding: 4rem 0;
            background: {current_colors['secondary']};
        }}
        
        .services h2 {{
            text-align: center;
            margin-bottom: 3rem;
            font-size: 2.5rem;
            color: {current_colors['primary']};
        }}
        
        .service-grid {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 2rem;
        }}
        
        .service-card {{
            background: white;
            padding: 2rem;
            border-radius: 10px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            transition: transform 0.3s;
        }}
        
        .service-card:hover {{
            transform: translateY(-5px);
        }}
        
        .service-card h3 {{
            color: {current_colors['primary']};
            margin-bottom: 1rem;
        }}
        
        .contact {{
            padding: 4rem 0;
            background: {current_colors['primary']};
            color: white;
        }}
        
        .contact h2 {{
            text-align: center;
            margin-bottom: 3rem;
            font-size: 2.5rem;
        }}
        
        .contact-info {{
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 2rem;
            text-align: center;
        }}
        
        .contact-item {{
            background: rgba(255,255,255,0.1);
            padding: 2rem;
            border-radius: 10px;
        }}
        
        .contact-item h3 {{
            margin-bottom: 1rem;
        }}
        
        .whatsapp-btn {{
            background: #25D366;
            color: white;
            padding: 12px 24px;
            border-radius: 25px;
            text-decoration: none;
            display: inline-block;
            margin-top: 1rem;
            transition: background 0.3s;
        }}
        
        .whatsapp-btn:hover {{
            background: #128C7E;
        }}
        
        footer {{
            background: #1a1a1a;
            color: white;
            text-align: center;
            padding: 2rem 0;
        }}
        
        @media (max-width: 768px) {{
            .hero h1 {{
                font-size: 2rem;
            }}
            
            .nav-links {{
                display: none;
            }}
            
            .cta-buttons {{
                flex-direction: column;
                align-items: center;
            }}
        }}
    </style>
</head>
<body>
    <header>
        <nav class="container">
            <div class="logo">{business_name}</div>
            <ul class="nav-links">
                <li><a href="#home">Home</a></li>
                <li><a href="#services">Services</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </nav>
    </header>
    
    <main>
        <section class="hero" id="home">
            <div class="container">
                <h1>Hi, I'm {user_name}</h1>
                <p>Your trusted insurance advisor in {location}. {bio}</p>
                <div class="cta-buttons">
                    <a href="#contact" class="btn btn-primary">Get My Quote</a>
                    <a href="tel:{phone}" class="btn btn-secondary">Call Me Now</a>
                </div>
            </div>
        </section>
        
        <section class="services" id="services">
            <div class="container">
                <h2>How I Can Help You</h2>
                <div class="service-grid">
                    <div class="service-card">
                        <h3>🏥 Health Insurance</h3>
                        <p>I help you choose the perfect health coverage for your family. With my guidance, protect against medical emergencies with plans that fit your budget and needs.</p>
                    </div>
                    <div class="service-card">
                        <h3>💼 Life Insurance</h3>
                        <p>I ensure your family's financial security with personalized life insurance solutions. Term plans, endowment plans, and investment options tailored just for you.</p>
                    </div>
                    <div class="service-card">
                        <h3>🚗 Motor Insurance</h3>
                        <p>I provide comprehensive vehicle protection with my personal support for quick claim settlements. Car, bike, and commercial vehicle insurance made simple.</p>
                    </div>
                </div>
            </div>
        </section>
        
        <section class="contact" id="contact">
            <div class="container">
                <h2>Get In Touch With Me</h2>
                <div class="contact-info">
                    <div class="contact-item">
                        <h3>📞 Call Me Directly</h3>
                        <p>{phone}</p>
                        <a href="tel:{phone}" class="btn btn-primary">Call Now</a>
                    </div>
                    <div class="contact-item">
                        <h3>✉️ Email Me</h3>
                        <p>{email}</p>
                        <a href="mailto:{email}" class="btn btn-primary">Send Email</a>
                    </div>
                    <div class="contact-item">
                        <h3>💬 WhatsApp Me</h3>
                        <p>I'm available for quick consultation</p>
                        <a href="https://wa.me/{phone.replace('+', '').replace(' ', '')}" class="whatsapp-btn">Message Me on WhatsApp</a>
                    </div>
                </div>
            </div>
        </section>
    </main>
    
    <footer>
        <div class="container">
            <p>&copy; 2025 {user_name}. Licensed Insurance Advisor serving {location}. Your trusted partner for insurance solutions.</p>
        </div>
    </footer>
</body>
</html>"""

@router.get("/website/{user_id}")
async def get_website_info(user_id: int, db: Session = Depends(get_db)) -> Dict[str, Any]:
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
        "last_updated": "2025-09-14T10:30:00Z",
        "views": 156,
        "leads": 12,
        "user_data": {
            "name": user.name,
            "business_name": user.business_name,
            "business_type": user.business_type,
            "location": user.location,
            "bio": user.bio,
            "phone": user.phone,
            "email": user.email,
            "website": user.website
        }
    }

@router.get("/website/{user_id}/preview/{template_id}")
async def preview_website(user_id: int, template_id: str, db: Session = Depends(get_db)):
    """Generate and return a preview of the website with the selected template"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prepare user data
    user_data = {
        "name": user.name or "Professional",
        "business_name": user.business_name or f"{user.name}'s Business" if user.name else "Your Business",
        "business_type": user.business_type or "Insurance Services",
        "location": user.location or "India",
        "bio": user.bio or "Professional insurance consultant providing comprehensive coverage solutions.",
        "phone": user.phone or "+91 XXXXXXXXXX",
        "email": user.email or "contact@business.com",
        "website": user.website or ""
    }
    
    # Generate HTML content using Gemini API
    html_content = await generate_website_with_gemini(user_data, template_id)
    
    # Return HTML content as response
    return Response(content=html_content, media_type="text/html")

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
async def apply_template(
    user_id: int,
    template_data: Dict[str, Any],
    db: Session = Depends(get_db)
) -> Dict[str, str]:
    """Apply a template to user's website and generate the actual HTML"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    template_id = template_data.get("template_id")
    if not template_id:
        raise HTTPException(status_code=400, detail="Template ID is required")
    
    # Prepare user data
    user_data = {
        "name": user.name or "Professional",
        "business_name": user.business_name or f"{user.name}'s Business" if user.name else "Your Business",
        "business_type": user.business_type or "Insurance Services",
        "location": user.location or "India",
        "bio": user.bio or "Professional insurance consultant providing comprehensive coverage solutions.",
        "phone": user.phone or "+91 XXXXXXXXXX",
        "email": user.email or "contact@business.com",
        "website": user.website or ""
    }
    
    # Generate the website HTML using Gemini API
    html_content = await generate_website_with_gemini(user_data, template_id)
    
    # In a real app, you would save the generated HTML to a file or database
    # For now, we'll return success with the preview URL
    website_slug = user.name.lower().replace(" ", "-") if user.name else f"user-{user_id}"
    
    return {
        "message": f"Template '{template_id}' applied successfully with AI-generated content",
        "website_url": f"growthpro.app/{website_slug}",
        "preview_url": f"/digital-presence/website/{user_id}/preview/{template_id}",
        "generated_with_ai": "true" if GEMINI_API_KEY is not None else "false"
    }

@router.get("/website/{user_id}/generate/{template_id}")
async def generate_website_html(user_id: int, template_id: str, db: Session = Depends(get_db)) -> Dict[str, Any]:
    """Generate website HTML content and return as JSON for frontend"""
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prepare user data
    user_data = {
        "name": user.name or "Professional",
        "business_name": user.business_name or f"{user.name}'s Business" if user.name else "Your Business",
        "business_type": user.business_type or "Insurance Services",
        "location": user.location or "India",
        "bio": user.bio or "Professional insurance consultant providing comprehensive coverage solutions.",
        "phone": user.phone or "+91 XXXXXXXXXX",
        "email": user.email or "contact@business.com",
        "website": user.website or ""
    }
    
    # Generate HTML content using Gemini API
    html_content = await generate_website_with_gemini(user_data, template_id)
    
    return {
        "html_content": html_content,
        "template_id": template_id,
        "user_data": user_data,
        "generated_with_ai": GEMINI_API_KEY is not None,
        "preview_url": f"/digital-presence/website/{user_id}/preview/{template_id}"
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
