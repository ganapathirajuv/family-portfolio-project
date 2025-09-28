from sqlalchemy import Column, Integer, String, Date, Text, DateTime, Enum as SQLEnum, ForeignKey
from sqlalchemy.sql import func
from enum import Enum

from app.core.database import Base


class GenderEnum(str, Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    UNKNOWN = "unknown"


class FamilyMember(Base):
    __tablename__ = "family_members"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(100), nullable=False)
    last_name = Column(String(100))
    middle_name = Column(String(100))
    maiden_name = Column(String(100))
    
    # Life dates
    birth_date = Column(Date)
    death_date = Column(Date)
    birth_location = Column(String(255))
    death_location = Column(String(255))
    
    # Personal info
    gender = Column(SQLEnum(GenderEnum))
    biography = Column(Text)
    occupation = Column(String(255))
    education = Column(String(255))
    # Free-form notes field (optional)
    notes = Column(Text)
    # Parent relationship (self-referential FK)
    parent_id = Column(Integer, ForeignKey('family_members.id'), nullable=True)
    
    # Photo and privacy
    profile_photo_id = Column(Integer)
    privacy_level = Column(String(20), default='family')
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    @property
    def full_name(self):
        """Get full name"""
        parts = [self.first_name]
        if self.middle_name:
            parts.append(self.middle_name)
        if self.last_name:
            parts.append(self.last_name)
        return " ".join(parts)

    @property
    def is_deceased(self) -> bool:
        """Return True when death_date is set"""
        return self.death_date is not None