"""Family member service implementation."""

from typing import List, Optional, Dict, Any
import logging

from app.services.base import BaseService
from app.repositories.family_member import FamilyMemberRepository
from app.models.family_member import FamilyMember
from app.schemas.family_member import (
    FamilyMemberCreate, 
    FamilyMemberUpdate, 
    FamilyMemberResponse,
    FamilyMemberList,
    FamilyTreeNode
)
from app.exceptions import ValidationError, ConflictError, NotFoundError


class FamilyMemberService(BaseService[FamilyMember, FamilyMemberCreate, FamilyMemberUpdate, FamilyMemberResponse]):
    """Service for family member business logic operations."""
    
    def __init__(self, repository: FamilyMemberRepository):
        super().__init__(repository, FamilyMemberResponse)
        self.logger = logging.getLogger(__name__)
        
    async def search(self, search_term: str, skip: int = 0, limit: int = 100) -> List[FamilyMemberResponse]:
        """Search family members by name or biography."""
        self.logger.info(f"Searching family members with term: {search_term}")
        
        if not search_term or len(search_term.strip()) < 2:
            raise ValidationError("Search term must be at least 2 characters long")
            
        members = await self.repository.search(search_term.strip(), skip, limit)
        return [FamilyMemberResponse.from_orm(member) for member in members]
        
    async def get_paginated(self, skip: int = 0, limit: int = 20, search: Optional[str] = None) -> FamilyMemberList:
        """Get paginated list of family members."""
        self.logger.info(f"Getting paginated family members: skip={skip}, limit={limit}, search={search}")
        
        if search:
            members = await self.search(search, skip, limit)
            # For simplicity, we'll estimate total count
            total = len(members) + skip
        else:
            members = await self.get_all(skip=skip, limit=limit)
            # For accurate count, we'd need a count method in repository
            total = len(members) + skip
            
        return FamilyMemberList(
            items=members,
            total=total,
            skip=skip,
            limit=limit,
            has_next=len(members) == limit
        )
        
    async def get_family_tree(self, root_id: Optional[int] = None) -> List[FamilyTreeNode]:
        """Get family tree structure starting from root member(s)."""
        self.logger.info(f"Building family tree from root: {root_id}")
        
        if root_id:
            root_member = await self.repository.get(root_id)
            if not root_member:
                raise NotFoundError("FamilyMember", root_id)
            return [await self._build_tree_node(root_member)]
        else:
            # Get all root members (those without parents)
            root_members = await self.repository.get_all(filters={"parent_id": None})
            return [await self._build_tree_node(member) for member in root_members]
            
    async def _build_tree_node(self, member: FamilyMember) -> FamilyTreeNode:
        """Recursively build family tree node."""
        children = await self.repository.get_by_parent(member.id)
        child_nodes = [await self._build_tree_node(child) for child in children]
        
        return FamilyTreeNode(
            member=FamilyMemberResponse.from_orm(member),
            children=child_nodes
        )
        
    async def get_ancestors(self, member_id: int, max_generations: int = 10) -> List[FamilyMemberResponse]:
        """Get all ancestors of a family member."""
        self.logger.info(f"Getting ancestors for member: {member_id}")
        
        if not await self.repository.exists(member_id):
            raise NotFoundError("FamilyMember", member_id)
            
        ancestors = await self.repository.get_ancestors(member_id, max_generations)
        return [FamilyMemberResponse.from_orm(ancestor) for ancestor in ancestors]
        
    async def get_descendants(self, member_id: int, max_generations: int = 10) -> List[FamilyMemberResponse]:
        """Get all descendants of a family member."""
        self.logger.info(f"Getting descendants for member: {member_id}")
        
        if not await self.repository.exists(member_id):
            raise NotFoundError("FamilyMember", member_id)
            
        descendants = await self.repository.get_descendants(member_id, max_generations)
        return [FamilyMemberResponse.from_orm(descendant) for descendant in descendants]
        
    async def get_siblings(self, member_id: int) -> List[FamilyMemberResponse]:
        """Get all siblings of a family member."""
        self.logger.info(f"Getting siblings for member: {member_id}")
        
        if not await self.repository.exists(member_id):
            raise NotFoundError("FamilyMember", member_id)
            
        siblings = await self.repository.get_siblings(member_id)
        return [FamilyMemberResponse.from_orm(sibling) for sibling in siblings]
        
    async def get_living_members(self) -> List[FamilyMemberResponse]:
        """Get all living family members."""
        self.logger.info("Getting all living family members")
        
        members = await self.repository.get_living_members()
        return [FamilyMemberResponse.from_orm(member) for member in members]
        
    async def get_deceased_members(self) -> List[FamilyMemberResponse]:
        """Get all deceased family members."""
        self.logger.info("Getting all deceased family members")
        
        members = await self.repository.get_deceased_members()
        return [FamilyMemberResponse.from_orm(member) for member in members]
        
    # Business logic validation hooks
    async def _validate_create(self, obj_in: FamilyMemberCreate) -> None:
        """Validate business rules before creating a family member."""
        await super()._validate_create(obj_in)
        
        # Check for circular parent relationship
        if obj_in.parent_id:
            if not await self.repository.exists(obj_in.parent_id):
                raise ValidationError("Parent member does not exist", field="parent_id")
                
        # Additional business rules can be added here
        # e.g., unique name combinations, valid date ranges, etc.
        
    async def _validate_update(self, id: Any, obj_in: FamilyMemberUpdate) -> None:
        """Validate business rules before updating a family member.""" 
        await super()._validate_update(id, obj_in)
        
        # Check for circular parent relationship
        if obj_in.parent_id is not None:
            if obj_in.parent_id == id:
                raise ValidationError("A member cannot be their own parent", field="parent_id")
                
            if obj_in.parent_id and not await self.repository.exists(obj_in.parent_id):
                raise ValidationError("Parent member does not exist", field="parent_id")
                
            # Check if the new parent would create a circular reference
            if await self._would_create_circular_reference(id, obj_in.parent_id):
                raise ValidationError("This parent assignment would create a circular reference", field="parent_id")
                
    async def _validate_delete(self, id: Any) -> None:
        """Validate business rules before deleting a family member."""
        await super()._validate_delete(id)
        
        # Check if member has children - might want to prevent deletion or reassign
        children = await self.repository.get_by_parent(id)
        if children:
            raise ConflictError(f"Cannot delete family member with {len(children)} children. Please reassign or remove children first.")
            
    async def _would_create_circular_reference(self, member_id: int, new_parent_id: int) -> bool:
        """Check if assigning new_parent_id as parent of member_id would create a circular reference."""
        # Get all descendants of the member
        descendants = await self.repository.get_descendants(member_id)
        
        # Check if the new parent is among the descendants
        return any(desc.id == new_parent_id for desc in descendants)
        
    async def _post_create(self, entity: FamilyMember) -> None:
        """Execute actions after family member creation."""
        await super()._post_create(entity)
        self.logger.info(f"Created family member: {entity.full_name} (ID: {entity.id})")
        
    async def _post_update(self, entity: FamilyMember) -> None:
        """Execute actions after family member update."""
        await super()._post_update(entity)
        self.logger.info(f"Updated family member: {entity.full_name} (ID: {entity.id})")
        
    async def _post_delete(self, id: Any) -> None:
        """Execute actions after family member deletion."""
        await super()._post_delete(id)
        self.logger.info(f"Deleted family member with ID: {id}")