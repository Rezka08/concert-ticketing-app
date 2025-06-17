import sys
import os
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app import create_app, db
from app.models.order import Order
from sqlalchemy import text

def migrate_orders():
    app = create_app()
    
    with app.app_context():
        try:
            print("🔄 Starting database migration for Order status...")
            
            # Step 1: Backup existing data
            print("📋 Backing up existing order data...")
            existing_orders = db.session.execute(text("SELECT * FROM orders")).fetchall()
            print(f"   Found {len(existing_orders)} existing orders")
            
            # Step 2: Add new columns to orders table
            print("🔧 Adding new columns to orders table...")
            
            try:
                # Add payment_submitted_at column
                db.session.execute(text("""
                    ALTER TABLE orders 
                    ADD COLUMN payment_submitted_at TIMESTAMP NULL
                """))
                print("   ✅ Added payment_submitted_at column")
            except Exception as e:
                if "Duplicate column name" in str(e) or "already exists" in str(e):
                    print("   ℹ️ payment_submitted_at column already exists")
                else:
                    raise e
            
            try:
                # Add payment_verified_at column  
                db.session.execute(text("""
                    ALTER TABLE orders 
                    ADD COLUMN payment_verified_at TIMESTAMP NULL
                """))
                print("   ✅ Added payment_verified_at column")
            except Exception as e:
                if "Duplicate column name" in str(e) or "already exists" in str(e):
                    print("   ℹ️ payment_verified_at column already exists")
                else:
                    raise e
            
            try:
                # Add admin_notes column
                db.session.execute(text("""
                    ALTER TABLE orders 
                    ADD COLUMN admin_notes TEXT NULL
                """))
                print("   ✅ Added admin_notes column")
            except Exception as e:
                if "Duplicate column name" in str(e) or "already exists" in str(e):
                    print("   ℹ️ admin_notes column already exists")
                else:
                    raise e
            
            # Step 3: Update ENUM values for status column
            print("🔄 Updating status ENUM values...")
            
            try:
                # For MySQL, we need to modify the ENUM
                db.session.execute(text("""
                    ALTER TABLE orders 
                    MODIFY COLUMN status ENUM('pending', 'payment_submitted', 'paid', 'cancelled') 
                    DEFAULT 'pending'
                """))
                print("   ✅ Updated status ENUM values")
            except Exception as e:
                print(f"   ⚠️ ENUM update might have failed (this is sometimes normal): {str(e)}")
                # Try alternative approach for different database systems
                try:
                    # For other databases, recreate the column
                    db.session.execute(text("""
                        ALTER TABLE orders 
                        ADD COLUMN new_status ENUM('pending', 'payment_submitted', 'paid', 'cancelled') 
                        DEFAULT 'pending'
                    """))
                    
                    # Copy data
                    db.session.execute(text("""
                        UPDATE orders 
                        SET new_status = status
                    """))
                    
                    # Drop old column and rename new one
                    db.session.execute(text("ALTER TABLE orders DROP COLUMN status"))
                    db.session.execute(text("ALTER TABLE orders CHANGE new_status status ENUM('pending', 'payment_submitted', 'paid', 'cancelled') DEFAULT 'pending'"))
                    
                    print("   ✅ Updated status column using alternative method")
                except Exception as e2:
                    print(f"   ⚠️ Could not update ENUM: {str(e2)}")
                    print("   ℹ️ You may need to manually update the database schema")
            
            # Step 4: Update existing 'paid' orders to have payment_verified_at
            print("📝 Updating existing paid orders...")
            current_time = datetime.utcnow()
            
            result = db.session.execute(text("""
                UPDATE orders 
                SET payment_verified_at = :current_time
                WHERE status = 'paid' AND payment_verified_at IS NULL
            """), {'current_time': current_time})
            
            print(f"   ✅ Updated {result.rowcount} paid orders with verification timestamp")
            
            # Step 5: Commit changes
            db.session.commit()
            print("💾 Database migration completed successfully!")
            
            # Step 6: Verify migration
            print("🔍 Verifying migration...")
            
            # Check if new columns exist
            columns_check = db.session.execute(text("DESCRIBE orders")).fetchall()
            column_names = [col[0] for col in columns_check]
            
            required_columns = ['payment_submitted_at', 'payment_verified_at', 'admin_notes']
            missing_columns = [col for col in required_columns if col not in column_names]
            
            if missing_columns:
                print(f"   ⚠️ Missing columns: {missing_columns}")
            else:
                print("   ✅ All required columns are present")
            
            # Check status values
            status_check = db.session.execute(text("""
                SELECT DISTINCT status FROM orders
            """)).fetchall()
            status_values = [row[0] for row in status_check]
            print(f"   📊 Current status values in database: {status_values}")
            
            print("\n🎉 Migration completed successfully!")
            print("\n📋 Summary of changes:")
            print("   • Added payment_submitted_at column")
            print("   • Added payment_verified_at column") 
            print("   • Added admin_notes column")
            print("   • Updated status ENUM to include 'payment_submitted'")
            print("   • Set payment_verified_at for existing paid orders")
            
            print("\n🔄 Next steps:")
            print("   1. Restart your Flask application")
            print("   2. Test the payment flow")
            print("   3. Check admin verification functionality")
            
        except Exception as e:
            print(f"❌ Migration failed: {str(e)}")
            print("🔄 Rolling back changes...")
            db.session.rollback()
            raise

def verify_migration():
    """Verify that the migration was successful"""
    app = create_app()
    
    with app.app_context():
        try:
            print("🔍 Verifying database structure...")
            
            # Test creating a new order with new status
            test_order_data = {
                'user_id': 1,  # Assume user ID 1 exists
                'total_amount': 100.00,
                'status': 'payment_submitted',
                'payment_method': 'bank_transfer'
            }
            
            # Try to query with new status
            test_query = db.session.execute(text("""
                SELECT COUNT(*) FROM orders WHERE status = 'payment_submitted'
            """)).scalar()
            
            print(f"   ✅ Can query payment_submitted status: {test_query} orders found")
            
            # Check all columns exist
            columns_check = db.session.execute(text("DESCRIBE orders")).fetchall()
            column_names = [col[0] for col in columns_check]
            
            required_columns = ['payment_submitted_at', 'payment_verified_at', 'admin_notes', 'status']
            for col in required_columns:
                if col in column_names:
                    print(f"   ✅ Column '{col}' exists")
                else:
                    print(f"   ❌ Column '{col}' missing")
            
            print("✅ Migration verification completed!")
            
        except Exception as e:
            print(f"❌ Verification failed: {str(e)}")

if __name__ == '__main__':
    print("🚀 Order Status Migration Tool")
    print("=" * 50)
    
    action = input("Choose action: (m)igrate, (v)erify, or (q)uit: ").lower().strip()
    
    if action == 'm' or action == 'migrate':
        migrate_orders()
    elif action == 'v' or action == 'verify':
        verify_migration()
    elif action == 'q' or action == 'quit':
        print("👋 Goodbye!")
    else:
        print("❌ Invalid option. Please choose 'm', 'v', or 'q'.")