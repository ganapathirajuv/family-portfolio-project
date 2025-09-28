"""Family member repository implementation."""

from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.repositories.base import BaseRepository
from app.models.family_member import FamilyMember
from app.schemas.family_member import FamilyMemberCreate, FamilyMemberUpdate


class FamilyMemberRepository(BaseRepository[FamilyMember]):
    """Repository for family member operations."""
    
    def __init__(self, db: Session):
        super().__init__(FamilyMember, db)
        
    async def search(self, search_term: str, skip: int = 0, limit: int = 100) -> List[FamilyMember]:
        """Search family members by name or biography."""
        search_pattern = f"%{search_term}%"
        
        return self.db.query(FamilyMember).filter(
            or_(
                FamilyMember.first_name.ilike(search_pattern),
                FamilyMember.last_name.ilike(search_pattern),
                FamilyMember.middle_name.ilike(search_pattern),
                FamilyMember.maiden_name.ilike(search_pattern),
                FamilyMember.biography.ilike(search_pattern),
                FamilyMember.occupation.ilike(search_pattern)
            )
        ).offset(skip).limit(limit).all()
        
    async def get_by_parent(self, parent_id: int) -> List[FamilyMember]:
        """Get all children of a family member."""
        return self.db.query(FamilyMember).filter(FamilyMember.parent_id == parent_id).all()
        
    async def get_ancestors(self, member_id: int, max_generations: int = 10) -> List[FamilyMember]:
        """Get all ancestors of a family member up to max_generations."""
        ancestors = []
        current_member = await self.get(member_id)
        
        generation = 0
        while current_member and current_member.parent_id and generation < max_generations:
            parent = await self.get(current_member.parent_id)
            if parent:
                ancestors.append(parent)
                current_member = parent
                generation += 1
            else:
                break
                
        return ancestors
        
    async def get_descendants(self, member_id: int, max_generations: int = 10) -> List[FamilyMember]:
        """Get all descendants of a family member up to max_generations."""
        descendants = []
        
        def _get_children_recursive(parent_id: int, current_generation: int):
            if current_generation >= max_generations:
                return
                
            children = self.db.query(FamilyMember).filter(FamilyMember.parent_id == parent_id).all()
            for child in children:
                descendants.append(child)
                _get_children_recursive(child.id, current_generation + 1)
                
        _get_children_recursive(member_id, 0)
        return descendants
        
    async def get_siblings(self, member_id: int) -> List[FamilyMember]:
        """Get all siblings of a family member."""
        member = await self.get(member_id)
        if not member or not member.parent_id:
            return []
            
        return self.db.query(FamilyMember).filter(
            FamilyMember.parent_id == member.parent_id,
            FamilyMember.id != member_id
        ).all()
        
    async def get_living_members(self) -> List[FamilyMember]:
        """Get all living family members."""
        return self.db.query(FamilyMember).filter(FamilyMember.death_date.is_(None)).all()
        
    async def get_deceased_members(self) -> List[FamilyMember]:
        """Get all deceased family members."""
        return self.db.query(FamilyMember).filter(FamilyMember.death_date.isnot(None)).all()