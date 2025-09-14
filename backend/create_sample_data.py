#!/usr/bin/env python3

"""
Create sample customer interaction data for testing AI insights
"""

import sys
import os

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.database import get_db
from app.models.models import Customer, CustomerInteraction, User
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
import random

def create_sample_interactions():
    """Create sample customer interactions for testing"""
    
    db = next(get_db())
    
    try:
        # Get test user
        test_user = db.query(User).filter(User.user_id == "testuser123").first()
        if not test_user:
            print("❌ Test user not found. Please run reset_and_migrate_db.py first")
            return False
        
        # Create sample customers if they don't exist
        customers_data = [
            {
                "name": "Rajesh Sharma", 
                "contact_info": "rajesh@gmail.com, +91 9876543210",
                "notes": "Interested in family health insurance, has 2 children"
            },
            {
                "name": "Priya Patel", 
                "contact_info": "priya.patel@yahoo.com, +91 8765432109",
                "notes": "Looking for term life insurance, recently married"
            },
            {
                "name": "Amit Kumar", 
                "contact_info": "amit.kumar@hotmail.com, +91 7654321098",
                "notes": "Owns small business, needs comprehensive coverage"
            }
        ]
        
        # Create or get customers
        customers = []
        for customer_data in customers_data:
            existing_customer = db.query(Customer).filter(
                Customer.name == customer_data["name"],
                Customer.user_id == test_user.id
            ).first()
            
            if not existing_customer:
                customer = Customer(
                    user_id=test_user.id,
                    name=customer_data["name"],
                    contact_info=customer_data["contact_info"],
                    notes=customer_data["notes"],
                    last_contacted=datetime.now() - timedelta(days=random.randint(1, 5))
                )
                db.add(customer)
                db.commit()
                db.refresh(customer)
                customers.append(customer)
                print(f"✅ Created customer: {customer.name}")
            else:
                customers.append(existing_customer)
                print(f"📄 Using existing customer: {existing_customer.name}")
        
        # Create sample interactions for each customer
        interaction_templates = [
            {
                "type": "call",
                "titles": [
                    "Initial inquiry call",
                    "Follow-up call on premium details",
                    "Clarification call on policy terms",
                    "Final discussion before purchase"
                ],
                "notes": [
                    "Customer called asking about health insurance options for family. Explained basic plans and benefits.",
                    "Discussed premium amounts and payment options. Customer seems interested but wants to compare.",
                    "Customer had questions about claim process and coverage limits. Provided detailed explanations.",
                    "Customer is ready to proceed. Need to schedule meeting to complete paperwork."
                ]
            },
            {
                "type": "whatsapp",
                "titles": [
                    "Sent brochure via WhatsApp",
                    "Follow-up message with offers",
                    "Reminder about pending decision",
                    "Shared success story"
                ],
                "notes": [
                    "Sent detailed brochure of family health plans via WhatsApp. Customer confirmed receipt.",
                    "Shared current promotional offers available this month. Customer asked for more time to decide.",
                    "Gentle reminder about the inquiry from last week. Customer appreciates the follow-up.",
                    "Shared a success story of similar customer who benefited from our health plan."
                ]
            },
            {
                "type": "email",
                "titles": [
                    "Welcome email sent",
                    "Detailed quotation shared",
                    "Policy comparison document",
                    "Thank you and next steps"
                ],
                "notes": [
                    "Sent welcome email with company introduction and initial information about our services.",
                    "Prepared and sent detailed quotation with multiple plan options and premium calculations.",
                    "Sent comparison document showing benefits of different plans to help customer decide.",
                    "Thanked customer for their interest and outlined next steps for policy purchase."
                ]
            },
            {
                "type": "meeting",
                "titles": [
                    "Initial consultation meeting",
                    "Home visit for documentation",
                    "Office meeting for policy review",
                    "Policy delivery meeting"
                ],
                "notes": [
                    "Met customer at their office to understand insurance needs and explain available options.",
                    "Visited customer's home to collect documents and complete application forms.",
                    "Customer visited our office to review policy terms and make final decision.",
                    "Met customer to deliver policy documents and explain claim process."
                ]
            }
        ]
        
        # Create interactions for each customer
        for customer in customers:
            # Delete existing interactions for clean test
            existing_interactions = db.query(CustomerInteraction).filter(
                CustomerInteraction.customer_id == customer.id
            ).all()
            for interaction in existing_interactions:
                db.delete(interaction)
            
            num_interactions = random.randint(3, 8)  # 3-8 interactions per customer
            
            for i in range(num_interactions):
                # Choose random interaction type
                interaction_template = random.choice(interaction_templates)
                interaction_type = interaction_template["type"]
                
                # Choose random title and notes
                title = random.choice(interaction_template["titles"])
                notes = random.choice(interaction_template["notes"])
                
                # Generate realistic dates (spread over last 30 days)
                days_ago = random.randint(1, 30)
                interaction_date = datetime.now() - timedelta(days=days_ago)
                
                # Determine status and follow-up needs
                statuses = ["completed", "pending", "follow-up required"]
                status = random.choices(statuses, weights=[0.7, 0.2, 0.1])[0]  # Most are completed
                
                follow_up_needed = status == "follow-up required" or random.choice([True, False])
                follow_up_date = None
                if follow_up_needed:
                    follow_up_date = datetime.now() + timedelta(days=random.randint(1, 14))
                
                interaction = CustomerInteraction(
                    customer_id=customer.id,
                    user_id=test_user.id,
                    interaction_type=interaction_type,
                    interaction_date=interaction_date,
                    title=title,
                    notes=notes,
                    follow_up_needed=follow_up_needed,
                    follow_up_date=follow_up_date,
                    status=status,
                    created_at=interaction_date,
                    updated_at=interaction_date
                )
                
                db.add(interaction)
            
            print(f"✅ Created {num_interactions} interactions for {customer.name}")
        
        db.commit()
        print(f"\n🎉 Successfully created sample data!")
        print(f"📊 Total customers: {len(customers)}")
        
        # Show summary
        for customer in customers:
            interaction_count = db.query(CustomerInteraction).filter(
                CustomerInteraction.customer_id == customer.id
            ).count()
            print(f"   - {customer.name}: {interaction_count} interactions")
        
        print(f"\n💡 You can now test AI insights in the frontend!")
        print(f"🌐 Frontend: http://localhost:3001")
        print(f"🔧 Backend: http://localhost:8000")
        
        return True
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
        return False
    finally:
        db.close()

if __name__ == "__main__":
    print("🚀 Creating Sample Customer Interaction Data")
    print("=" * 50)
    
    success = create_sample_interactions()
    
    if success:
        print("\n✅ Sample data creation completed successfully!")
    else:
        print("\n❌ Failed to create sample data. Please check the error messages above.")
