#!/usr/bin/env python
"""
Script to create fake customer interaction data for testing.
"""

import sys
import os
import random
from datetime import datetime, timedelta
import json

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.database.database import get_db, engine, Base
from app.models.models import CustomerInteraction, Customer, User
from app.init_db import init_db

# Initialize the database if it doesn't exist
init_db()

# Fake interaction types
INTERACTION_TYPES = [
    "call", 
    "meeting", 
    "email", 
    "whatsapp", 
    "sms", 
    "social_media", 
    "video_call"
]

# Fake interaction titles
INTERACTION_TITLES = [
    "Initial consultation",
    "Follow-up call",
    "Product demonstration",
    "Service inquiry",
    "Pricing discussion",
    "Contract negotiation",
    "Payment reminder",
    "Customer support",
    "Feedback request",
    "Project update",
    "Problem resolution",
    "Feature explanation",
    "Annual review",
    "Renewal discussion"
]

# Fake interaction notes
INTERACTION_NOTE_TEMPLATES = [
    "Customer {name} expressed interest in {product}. They need more information about pricing and availability.",
    "Followed up with {name} regarding their previous inquiry. They are still considering options but leaning towards our solution.",
    "Met with {name} to discuss their needs. They are primarily concerned with {concern} and need solutions that address this.",
    "Quick check-in with {name}. Everything is going well with their current service.",
    "Discussed potential upgrades with {name}. They are interested in {product} but concerned about cost.",
    "Resolved {name}'s issue with {problem}. They were very appreciative of the quick response.",
    "Provided {name} with a quote for {product}. They will get back to us within a week.",
    "Annual review with {name}. They are happy with our services but requested some minor adjustments to {service}.",
    "{name} had some complaints about {problem}. Offered a discount on their next purchase to compensate.",
    "Onboarding call with {name}. Walked through our platform features and helped them set up their account."
]

# Fake products, concerns, problems, and services
PRODUCTS = ["insurance policy", "premium plan", "basic package", "consultation service", "maintenance contract"]
CONCERNS = ["budget constraints", "implementation timeline", "service quality", "technical complexity", "integration"]
PROBLEMS = ["login issues", "service interruption", "billing error", "product malfunction", "delivery delay"]
SERVICES = ["customer support", "maintenance plan", "delivery schedule", "billing frequency", "platform access"]

# Statuses
STATUSES = ["pending", "completed", "follow-up required"]

def create_fake_interaction_note(name):
    """Create a realistic interaction note using templates"""
    template = random.choice(INTERACTION_NOTE_TEMPLATES)
    
    # Substitute placeholders
    note = template.format(
        name=name,
        product=random.choice(PRODUCTS),
        concern=random.choice(CONCERNS),
        problem=random.choice(PROBLEMS),
        service=random.choice(SERVICES)
    )
    
    # Add some random additional details sometimes
    if random.random() > 0.7:
        details = [
            f"Recommended they consider our new {random.choice(PRODUCTS)}.",
            f"Customer requested a call back in {random.randint(1, 7)} days.",
            f"Scheduled a follow-up meeting for next week.",
            f"They mentioned they're also talking to our competitors.",
            f"They referred us to another potential client.",
            f"They have budget approval and are ready to proceed.",
            f"Decision will be made by end of quarter."
        ]
        note += " " + random.choice(details)
    
    return note

def generate_fake_interactions(db: Session, num_interactions=100):
    """Generate fake customer interactions"""
    
    # Get all customers and users
    customers = db.query(Customer).all()
    users = db.query(User).all()
    
    if not customers:
        print("No customers found. Please create customers first.")
        return
    
    if not users:
        print("No users found. Please create users first.")
        return
    
    print(f"Found {len(customers)} customers and {len(users)} users")
    
    # Current time
    now = datetime.now()
    
    # Create interactions
    interactions = []
    for _ in range(num_interactions):
        # Select a random customer
        customer = random.choice(customers)
        user = random.choice(users)
        
        # Random date in the last 90 days
        days_ago = random.randint(0, 90)
        interaction_date = now - timedelta(days=days_ago)
        
        # Sometimes set future follow-up
        follow_up_needed = random.random() < 0.3  # 30% chance of follow-up
        follow_up_date = None
        if follow_up_needed:
            follow_up_days = random.randint(1, 14)  # Follow up in 1-14 days
            follow_up_date = now + timedelta(days=follow_up_days)
        
        # Create the interaction
        interaction = CustomerInteraction(
            customer_id=customer.id,
            user_id=user.id,
            interaction_type=random.choice(INTERACTION_TYPES),
            interaction_date=interaction_date,
            title=random.choice(INTERACTION_TITLES),
            notes=create_fake_interaction_note(customer.name),
            follow_up_needed=follow_up_needed,
            follow_up_date=follow_up_date,
            status=random.choice(STATUSES)
        )
        
        interactions.append(interaction)
    
    # Add to database
    db.add_all(interactions)
    db.commit()
    
    print(f"Created {len(interactions)} fake customer interactions")

if __name__ == "__main__":
    db = next(get_db())
    
    try:
        num_interactions = 200  # Default number
        if len(sys.argv) > 1:
            num_interactions = int(sys.argv[1])
        
        generate_fake_interactions(db, num_interactions)
        print(f"Successfully created {num_interactions} fake customer interactions")
    except Exception as e:
        print(f"Error creating fake interactions: {e}")
        db.rollback()
    finally:
        db.close()
