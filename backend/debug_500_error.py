import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from sqlalchemy import text
import traceback

def check_database_schema():
    """Check current database schema"""
    app = create_app()
    
    with app.app_context():
        try:
            print("🔍 Checking current database schema...")
            
            # Check if orders table exists
            print("\n📋 Checking orders table structure:")
            try:
                columns = db.session.execute(text("DESCRIBE orders")).fetchall()
                print("   ✅ Orders table exists")
                print("   📋 Current columns:")
                for col in columns:
                    print(f"      - {col[0]} ({col[1]})")
                
                # Check for new columns
                column_names = [col[0] for col in columns]
                new_columns = ['payment_submitted_at', 'payment_verified_at', 'admin_notes']
                missing_columns = [col for col in new_columns if col not in column_names]
                
                if missing_columns:
                    print(f"   ❌ Missing columns: {missing_columns}")
                    return False
                else:
                    print("   ✅ All required columns present")
                    
            except Exception as e:
                print(f"   ❌ Error checking orders table: {str(e)}")
                return False
            
            # Check status enum values
            print("\n🎯 Checking status enum values:")
            try:
                # Get current status values from existing orders
                status_values = db.session.execute(text("""
                    SELECT DISTINCT status FROM orders
                """)).fetchall()
                
                existing_statuses = [row[0] for row in status_values]
                print(f"   📊 Current status values in data: {existing_statuses}")
                
                # Try to insert a test record with new status to see if enum supports it
                print("   🧪 Testing if 'payment_submitted' status is supported...")
                try:
                    # This should work if enum is updated
                    db.session.execute(text("""
                        SELECT 'payment_submitted' as test_status 
                        FROM orders 
                        WHERE status IN ('pending', 'payment_submitted', 'paid', 'cancelled')
                        LIMIT 1
                    """))
                    print("   ✅ 'payment_submitted' status is supported")
                    return True
                except Exception as e:
                    print(f"   ❌ 'payment_submitted' status NOT supported: {str(e)}")
                    return False
                    
            except Exception as e:
                print(f"   ❌ Error checking status values: {str(e)}")
                return False
                
        except Exception as e:
            print(f"❌ Database check failed: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            return False

def test_orders_query():
    """Test the exact query that's failing"""
    app = create_app()
    
    with app.app_context():
        try:
            print("\n🧪 Testing orders query that's causing 500 error...")
            
            # Test basic orders query
            print("   Testing basic orders query...")
            orders = db.session.execute(text("SELECT * FROM orders LIMIT 5")).fetchall()
            print(f"   ✅ Basic query works, found {len(orders)} orders")
            
            # Test with status filter
            print("   Testing status-specific queries...")
            for status in ['pending', 'paid', 'cancelled']:
                try:
                    count = db.session.execute(text(f"""
                        SELECT COUNT(*) FROM orders WHERE status = '{status}'
                    """)).scalar()
                    print(f"   ✅ Status '{status}': {count} orders")
                except Exception as e:
                    print(f"   ❌ Status '{status}' failed: {str(e)}")
            
            # Test the new status
            try:
                count = db.session.execute(text("""
                    SELECT COUNT(*) FROM orders WHERE status = 'payment_submitted'
                """)).scalar()
                print(f"   ✅ Status 'payment_submitted': {count} orders")
            except Exception as e:
                print(f"   ❌ Status 'payment_submitted' failed: {str(e)}")
                print("   💡 This confirms the enum needs to be updated!")
                
        except Exception as e:
            print(f"❌ Query test failed: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")

def check_flask_model():
    """Check if Flask model matches database"""
    app = create_app()
    
    with app.app_context():
        try:
            print("\n🔧 Testing Flask model compatibility...")
            
            from app.models.order import Order
            
            # Try to query using the model
            print("   Testing Order.query.all()...")
            orders = Order.query.limit(5).all()
            print(f"   ✅ Model query works, found {len(orders)} orders")
            
            # Test model attributes
            if orders:
                order = orders[0]
                print(f"   📋 Sample order attributes:")
                print(f"      - order_id: {order.order_id}")
                print(f"      - status: {order.status}")
                print(f"      - user_id: {order.user_id}")
                
                # Test new attributes
                try:
                    print(f"      - payment_submitted_at: {order.payment_submitted_at}")
                    print(f"      - payment_verified_at: {order.payment_verified_at}")
                    print(f"      - admin_notes: {order.admin_notes}")
                    print("   ✅ New attributes accessible")
                except Exception as e:
                    print(f"   ❌ New attributes not accessible: {str(e)}")
                    
        except Exception as e:
            print(f"❌ Flask model test failed: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")

def auto_fix_database():
    """Automatically fix the database schema"""
    app = create_app()
    
    with app.app_context():
        try:
            print("\n🔧 Attempting to auto-fix database schema...")
            
            # Add missing columns
            print("   Adding missing columns...")
            
            try:
                db.session.execute(text("""
                    ALTER TABLE orders 
                    ADD COLUMN payment_submitted_at TIMESTAMP NULL
                """))
                print("   ✅ Added payment_submitted_at column")
            except Exception as e:
                if "Duplicate column name" in str(e) or "already exists" in str(e):
                    print("   ℹ️ payment_submitted_at column already exists")
                else:
                    print(f"   ❌ Failed to add payment_submitted_at: {str(e)}")
            
            try:
                db.session.execute(text("""
                    ALTER TABLE orders 
                    ADD COLUMN payment_verified_at TIMESTAMP NULL
                """))
                print("   ✅ Added payment_verified_at column")
            except Exception as e:
                if "Duplicate column name" in str(e) or "already exists" in str(e):
                    print("   ℹ️ payment_verified_at column already exists")
                else:
                    print(f"   ❌ Failed to add payment_verified_at: {str(e)}")
            
            try:
                db.session.execute(text("""
                    ALTER TABLE orders 
                    ADD COLUMN admin_notes TEXT NULL
                """))
                print("   ✅ Added admin_notes column")
            except Exception as e:
                if "Duplicate column name" in str(e) or "already exists" in str(e):
                    print("   ℹ️ admin_notes column already exists")
                else:
                    print(f"   ❌ Failed to add admin_notes: {str(e)}")
            
            # Update enum
            print("   Updating status enum...")
            try:
                db.session.execute(text("""
                    ALTER TABLE orders 
                    MODIFY COLUMN status ENUM('pending', 'payment_submitted', 'paid', 'cancelled') 
                    DEFAULT 'pending'
                """))
                print("   ✅ Updated status enum")
            except Exception as e:
                print(f"   ⚠️ Enum update failed: {str(e)}")
                
                # Try alternative method
                print("   Trying alternative enum update method...")
                try:
                    # Create new column with correct enum
                    db.session.execute(text("""
                        ALTER TABLE orders 
                        ADD COLUMN new_status ENUM('pending', 'payment_submitted', 'paid', 'cancelled') 
                        DEFAULT 'pending'
                    """))
                    
                    # Copy data
                    db.session.execute(text("""
                        UPDATE orders SET new_status = status
                    """))
                    
                    # Drop old and rename
                    db.session.execute(text("ALTER TABLE orders DROP COLUMN status"))
                    db.session.execute(text("""
                        ALTER TABLE orders 
                        CHANGE new_status status ENUM('pending', 'payment_submitted', 'paid', 'cancelled') 
                        DEFAULT 'pending'
                    """))
                    
                    print("   ✅ Updated enum using alternative method")
                except Exception as e2:
                    print(f"   ❌ Alternative enum update also failed: {str(e2)}")
            
            # Commit changes
            db.session.commit()
            print("   💾 Changes committed successfully!")
            
            return True
            
        except Exception as e:
            print(f"❌ Auto-fix failed: {str(e)}")
            print(f"Traceback: {traceback.format_exc()}")
            db.session.rollback()
            return False

def main():
    print("🚀 Database Schema Debug Tool")
    print("=" * 50)
    
    # Step 1: Check current schema
    schema_ok = check_database_schema()
    
    # Step 2: Test queries
    test_orders_query()
    
    # Step 3: Check Flask model
    check_flask_model()
    
    # Step 4: Offer auto-fix if needed
    if not schema_ok:
        print("\n" + "=" * 50)
        print("🔧 SCHEMA ISSUES DETECTED!")
        print("The database schema is not compatible with the updated code.")
        print("This is causing the 500 Internal Server Error.")
        
        fix_choice = input("\nDo you want to auto-fix the database schema? (y/n): ").lower().strip()
        
        if fix_choice == 'y':
            if auto_fix_database():
                print("\n🎉 Database schema fixed successfully!")
                print("Please restart your Flask application and try again.")
            else:
                print("\n❌ Auto-fix failed. Please run the migration manually:")
                print("   python migrate_order_status.py")
        else:
            print("\n📋 Manual fix required:")
            print("   1. Run: python migrate_order_status.py")
            print("   2. Restart Flask application")
            print("   3. Test the endpoints again")
    else:
        print("\n✅ Database schema looks good!")
        print("The 500 error might be caused by other issues.")
        print("Check the Flask application logs for more details.")

if __name__ == '__main__':
    main()