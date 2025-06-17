import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.order import Order
from sqlalchemy import text

def debug_payment_approval():
    app = create_app()
    
    with app.app_context():
        try:
            print("🔍 Debugging Payment Approval Error 400...")
            
            # Check orders that might be approved
            print("\n📋 Checking orders that can be approved:")
            
            orders = db.session.execute(text("""
                SELECT order_id, status, payment_method, created_at, user_id
                FROM orders 
                ORDER BY created_at DESC 
                LIMIT 10
            """)).fetchall()
            
            print("Current orders:")
            for order in orders:
                print(f"   Order #{order[0]}: {order[1]} - {order[2]} - User {order[4]}")
            
            # Check specific order that failed
            print(f"\n🎯 Checking order #8 (from error log):")
            try:
                order_8 = db.session.execute(text("""
                    SELECT * FROM orders WHERE order_id = 8
                """)).fetchone()
                
                if order_8:
                    print(f"   ✅ Order #8 exists")
                    print(f"   Status: {order_8[3]}")  # status is usually 4th column
                    print(f"   User ID: {order_8[1]}")
                    print(f"   Amount: {order_8[2]}")
                else:
                    print("   ❌ Order #8 not found!")
                    
            except Exception as e:
                print(f"   ❌ Error checking order #8: {str(e)}")
            
            # Test status transitions
            print(f"\n🔄 Testing valid status transitions:")
            valid_transitions = {
                'pending': ['payment_submitted', 'cancelled'],
                'payment_submitted': ['paid', 'cancelled'],
                'paid': ['cancelled'],
                'cancelled': []
            }
            
            for current_status, allowed_next in valid_transitions.items():
                print(f"   {current_status} → {allowed_next}")
            
            # Check enum values
            print(f"\n📊 Checking available status enum values:")
            try:
                # Try to see what status values are actually allowed
                test_statuses = ['pending', 'payment_submitted', 'paid', 'cancelled']
                for status in test_statuses:
                    try:
                        count = db.session.execute(text(f"""
                            SELECT COUNT(*) FROM orders WHERE status = '{status}'
                        """)).scalar()
                        print(f"   ✅ '{status}': {count} orders (supported)")
                    except Exception as e:
                        print(f"   ❌ '{status}': Not supported - {str(e)}")
                        
            except Exception as e:
                print(f"   ❌ Error checking enum values: {str(e)}")
                
        except Exception as e:
            print(f"❌ Debug failed: {str(e)}")

if __name__ == '__main__':
    debug_payment_approval()