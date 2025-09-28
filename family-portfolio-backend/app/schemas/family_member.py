"""Pydantic schemas for family member operations."""

from typing import Optional
from datetime import date, datetime
from pydantic import BaseModel, Field, validator

from app.models.family_member import GenderEnum


class FamilyMemberBase(BaseModel):
    """Base schema for family member data."""
    
    first_name: str = Field(..., min_length=1, max_length=100, description="First name")
    last_name: Optional[str] = Field(None, max_length=100, description="Last name")
    middle_name: Optional[str] = Field(None, max_length=100, description="Middle name")
    maiden_name: Optional[str] = Field(None, max_length=100, description="Maiden name")
    
    birth_date: Optional[date] = Field(None, description="Birth date")
    death_date: Optional[date] = Field(None, description="Death date")
    birth_location: Optional[str] = Field(None, max_length=255, description="Birth location")
    death_location: Optional[str] = Field(None, max_length=255, description="Death location")
    
    gender: Optional[GenderEnum] = Field(GenderEnum.UNKNOWN, description="Gender")
    biography: Optional[str] = Field(None, description="Biography")
    occupation: Optional[str] = Field(None, max_length=255, description="Occupation")
    education: Optional[str] = Field(None, max_length=255, description="Education")
    notes: Optional[str] = Field(None, description="Additional notes")
    
    parent_id: Optional[int] = Field(None, description="Parent ID for family tree")
    privacy_level: str = Field("family", description="Privacy level")

    @validator("death_date")
    def death_date_after_birth_date(cls, v, values):
        """Validate that death date is after birth date."""
        if v and "birth_date" in values and values["birth_date"]:
            if v <= values["birth_date"]:
                raise ValueError("Death date must be after birth date")
        return v

    @validator("privacy_level")
    def validate_privacy_level(cls, v):
        """Validate privacy level values."""
        valid_levels = ["public", "family", "private"]
        if v not in valid_levels:
            raise ValueError(f"Privacy level must be one of: {valid_levels}")
        return v


class FamilyMemberCreate(FamilyMemberBase):
    """Schema for creating a new family member."""
    pass


class FamilyMemberUpdate(BaseModel):
    """Schema for updating an existing family member."""
    
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, max_length=100)
    middle_name: Optional[str] = Field(None, max_length=100)
    maiden_name: Optional[str] = Field(None, max_length=100)
    
    birth_date: Optional[date] = None
    death_date: Optional[date] = None
    birth_location: Optional[str] = Field(None, max_length=255)
    death_location: Optional[str] = Field(None, max_length=255)
    
    gender: Optional[GenderEnum] = None
    biography: Optional[str] = None
    occupation: Optional[str] = Field(None, max_length=255)
    education: Optional[str] = Field(None, max_length=255)
    notes: Optional[str] = None
    
    parent_id: Optional[int] = None
    privacy_level: Optional[str] = None

    @validator("death_date")
    def death_date_after_birth_date(cls, v, values):
        """Validate that death date is after birth date."""
        if v and "birth_date" in values and values["birth_date"]:
            if v <= values["birth_date"]:
                raise ValueError("Death date must be after birth date")
        return v

    @validator("privacy_level")
    def validate_privacy_level(cls, v):
        """Validate privacy level values."""
        if v is not None:
            valid_levels = ["public", "family", "private"]
            if v not in valid_levels:
                raise ValueError(f"Privacy level must be one of: {valid_levels}")
        return v


class FamilyMemberResponse(FamilyMemberBase):
    """Schema for family member response."""
    
    id: int = Field(..., description="Unique identifier")
    full_name: str = Field(..., description="Full name computed property")
    is_deceased: bool = Field(..., description="Whether the person is deceased")
    created_at: datetime = Field(..., description="Creation timestamp")
    updated_at: Optional[datetime] = Field(None, description="Last update timestamp")
    
    class Config:
        from_attributes = True


class FamilyMemberList(BaseModel):
    """Schema for paginated family member list."""
    
    items: list[FamilyMemberResponse] = Field(..., description="List of family members")
    total: int = Field(..., description="Total number of items")
    skip: int = Field(..., description="Number of items skipped")
    limit: int = Field(..., description="Number of items per page")
    has_next: bool = Field(..., description="Whether there are more items")


class FamilyTreeNode(BaseModel):
    """Schema for family tree representation."""
    
    member: FamilyMemberResponse
    children: list["FamilyTreeNode"] = Field(default_factory=list, description="Child nodes")
    
    class Config:
        from_attributes = True


# Update forward references
FamilyTreeNode.model_rebuild()