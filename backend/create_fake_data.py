import sys
import os
from datetime import datetime, timedelta

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal
from app.models.models import User, Customer, Referral, Interaction

def create_fake_data():
    db = SessionLocal()
    try:
        # Get the existing test user
        user = db.query(User).filter(User.user_id == "testuser123").first()
        if not user:
            print("Test user not found. Please run create_test_user.py first.")
            return
        
        print(f"Creating fake data for user: {user.name} (ID: {user.id})")
        
        # Create fake customers
        customers_data = [
            {"name": "Rajesh Kumar", "contact_info": "rajesh.kumar@email.com, +91 98765 43210", "notes": "Interested in premium products"},
            {"name": "Priya Sharma", "contact_info": "priya.sharma@email.com, +91 98765 43211", "notes": "Regular customer, prefers eco-friendly options"},
            {"name": "Amit Patel", "contact_info": "amit.patel@email.com, +91 98765 43212", "notes": "Price conscious customer"},
            {"name": "Sunita Verma", "contact_info": "sunita.verma@email.com, +91 98765 43213", "notes": "Frequently asks for discounts"},
            {"name": "Vikram Singh", "contact_info": "vikram.singh@email.com, +91 98765 43214", "notes": "High-value customer, interested in new products"},
            {"name": "Anjali Mehta", "contact_info": "anjali.mehta@email.com, +91 98765 43215", "notes": "Seasonal buyer"},
            {"name": "Sanjay Gupta", "contact_info": "sanjay.gupta@email.com, +91 98765 43216", "notes": "B2B customer, large orders"},
            {"name": "Neha Reddy", "contact_info": "neha.reddy@email.com, +91 98765 43217", "notes": "Social media influencer"},
            {"name": "Deepak Nair", "contact_info": "deepak.nair@email.com, +91 98765 43218", "notes": "Tech-savvy customer"},
            {"name": "Kavita Joshi", "contact_info": "kavita.joshi@email.com, +91 98765 43219", "notes": "Customer service advocate"}
        ]
        
        customers = []
        for i, customer_data in enumerate(customers_data):
            customer = Customer(
                user_id=user.id,
                name=customer_data["name"],
                contact_info=customer_data["contact_info"],
                notes=customer_data["notes"],
                last_contacted=datetime.now() - timedelta(days=i*2)
            )
            db.add(customer)
            customers.append(customer)
        
        db.commit()
        
        # Refresh customers to get their IDs
        for customer in customers:
            db.refresh(customer)
        
        print(f"Created {len(customers)} fake customers")
        
        # Create fake referrals
        referrals_data = [
            {"customer_id": customers[0].id, "referred_by": "existing_customer", "status": "accepted", "reward_points": 50},
            {"customer_id": customers[1].id, "referred_by": "social_media", "status": "completed", "reward_points": 100},
            {"customer_id": customers[2].id, "referred_by": "existing_customer", "status": "pending", "reward_points": 0},
            {"customer_id": customers[3].id, "referred_by": "website", "status": "accepted", "reward_points": 50},
            {"customer_id": customers[4].id, "referred_by": "existing_customer", "status": "completed", "reward_points": 100}
        ]
        
        referrals = []
        for referral_data in referrals_data:
            referral = Referral(
                user_id=user.id,
                customer_id=referral_data["customer_id"],
                referred_by=referral_data["referred_by"],
                status=referral_data["status"],
                reward_points=referral_data["reward_points"]
            )
            db.add(referral)
            referrals.append(referral)
        
        db.commit()
        
        # Create fake interactions
        interactions_data = [
            {"customer_id": customers[0].id, "message": "Customer inquired about new product line", "sent_by": "user"},
            {"customer_id": customers[0].id, "message": "Sent product catalog and pricing information", "sent_by": "user"},
            {"customer_id": customers[1].id, "message": "Customer placed order for eco-friendly products", "sent_by": "user"},
            {"customer_id": customers[2].id, "message": "Customer asked for discount on bulk order", "sent_by": "customer"},
            {"customer_id": customers[3].id, "message": "Followed up on previous inquiry", "sent_by": "user"},
            {"customer_id": customers[4].id, "message": "Customer completed referral process", "sent_by": "system"},
            {"customer_id": customers[5].id, "message": "Customer interested in seasonal products", "sent_by": "customer"},
            {"customer_id": customers[6].id, "message": "Sent B2B pricing and terms", "sent_by": "user"}
        ]
        
        interactions = []
        for interaction_data in interactions_data:
            interaction = Interaction(
                customer_id=interaction_data["customer_id"],
                message=interaction_data["message"],
                sent_by=interaction_data["sent_by"]
            )
            db.add(interaction)
            interactions.append(interaction)
        
        db.commit()
        
        print(f"Created {len(interactions)} fake interactions")
        print(f"Created {len(referrals)} fake referrals")
        print("Fake data creation completed successfully!")
        
    except Exception as e:
        print(f"Error creating fake data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    create_fake_data()