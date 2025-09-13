import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import SessionLocal
from app.models.models import User, Customer, Referral, Interaction

def verify_data():
    db = SessionLocal()
    try:
        # Get the test user
        user = db.query(User).filter(User.user_id == "testuser123").first()
        if not user:
            print("Test user not found!")
            return
        
        print(f"User: {user.name} (ID: {user.id})")
        
        # Get all customers for this user
        customers = db.query(Customer).filter(Customer.user_id == user.id).all()
        print(f"\nCustomers ({len(customers)}):")
        for customer in customers:
            print(f"  - {customer.name} (ID: {customer.id}) - {customer.contact_info}")
        
        # Get all referrals for this user
        referrals = db.query(Referral).filter(Referral.user_id == user.id).all()
        print(f"\nReferrals ({len(referrals)}):")
        for referral in referrals:
            customer = db.query(Customer).filter(Customer.id == referral.customer_id).first()
            print(f"  - Customer: {customer.name if customer else 'Unknown'} | Status: {referral.status} | Points: {referral.reward_points}")
        
        # Get all interactions
        interactions = db.query(Interaction).all()
        print(f"\nInteractions ({len(interactions)}):")
        for interaction in interactions:
            customer = db.query(Customer).filter(Customer.id == interaction.customer_id).first()
            print(f"  - Customer: {customer.name if customer else 'Unknown'} | Message: {interaction.message[:50]}...")
        
        print("\nData verification completed!")
        
    except Exception as e:
        print(f"Error verifying data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    verify_data()