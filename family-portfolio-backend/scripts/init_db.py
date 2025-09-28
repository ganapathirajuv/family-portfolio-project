#!/usr/bin/env python3
"""
Initialize the database with default data
"""
import sys
import os
from datetime import date

# Add the parent directory to the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from app.core.database import SessionLocal, engine
from app.models import Base, User, FamilyMember


def create_tables():
    """Create all database tables"""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✅ Database tables created successfully!")


def create_admin_user():
    """Create default admin user"""
    db = SessionLocal()
    try:
        # Check if admin user already exists
        admin_user = db.query(User).filter(User.email == "admin@familyportfolio.com").first()
        if admin_user:
            print("⚠️  Admin user already exists")
            return
        
        # Create admin user
        admin_user = User(
            email="admin@familyportfolio.com",
            username="admin",
            full_name="Family Portfolio Administrator",
            role="admin",
            is_active=True,
            is_verified=True
        )
        admin_user.set_password("admin123")
        
        db.add(admin_user)
        db.commit()
        
        print("✅ Admin user created successfully!")
        print("   Email: admin@familyportfolio.com")
        print("   Password: admin123")
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
    finally:
        db.close()


def create_sample_data():
    """Create sample family data"""
    db = SessionLocal()
    try:
        # Check if sample data already exists
        existing_member = db.query(FamilyMember).first()
        if existing_member:
            print("⚠️  Sample data already exists")
            return
        
        # Create sample family members
        sample_members = [
            FamilyMember(
                first_name="John",
                last_name="Doe",
                birth_date=date(1950, 5, 15),
                birth_location="New York, NY",
                gender="male",
                biography="Loving father and grandfather",
                occupation="Engineer"
            ),
            FamilyMember(
                first_name="Jane",
                last_name="Doe",
                maiden_name="Smith",
                birth_date=date(1952, 8, 22),
                birth_location="Boston, MA",
                gender="female",
                biography="Devoted mother and teacher",
                occupation="Teacher"
            ),
            FamilyMember(
                first_name="Michael",
                last_name="Doe",
                birth_date=date(1975, 3, 10),
                birth_location="Chicago, IL",
                gender="male",
                biography="Software developer and father",
                occupation="Software Developer"
            )
        ]
        
        for member in sample_members:
            db.add(member)
        
        db.commit()
        print("✅ Sample family data created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating sample data: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """Main initialization function"""
    print("🚀 Initializing Family Portfolio Database...")
    print("=" * 50)
    
    try:
        create_tables()
        create_admin_user()
        create_sample_data()
        
        print("=" * 50)
        print("🎉 Database initialization completed successfully!")
        print("💡 You can now start the server with: python run.py")
        
    except Exception as e:
        print(f"❌ Database initialization failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
