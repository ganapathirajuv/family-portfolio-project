"""Family member API endpoints using service layer pattern."""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
import logging

from app.core.database import get_db
from app.core.container import container
from app.services.family_member import FamilyMemberService
from app.repositories.family_member import FamilyMemberRepository
from app.schemas.family_member import (
    FamilyMemberCreate,
    FamilyMemberUpdate,
    FamilyMemberResponse,
    FamilyMemberList,
    FamilyTreeNode
)
from app.exceptions import (
    FamilyPortfolioException,
    NotFoundError,
    ValidationError
)

router = APIRouter()
logger = logging.getLogger(__name__)


def get_family_member_service(db: Session = Depends(get_db)) -> FamilyMemberService:
    """Get family member service with dependency injection."""
    repository = FamilyMemberRepository(db)
    return FamilyMemberService(repository)


@router.get("/", response_model=FamilyMemberList)
async def get_family_members(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(20, ge=1, le=100, description="Number of items to return"),
    search: Optional[str] = Query(None, description="Search term for name or biography"),
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """
    Get paginated list of family members with optional search.
    
    Returns a paginated list of family members. Use the search parameter
    to filter by name, biography, or other text fields.
    """
    try:
        logger.info(f"Getting family members: skip={skip}, limit={limit}, search={search}")
        result = await service.get_paginated(skip=skip, limit=limit, search=search)
        return result
    except FamilyPortfolioException:
        raise
    except Exception as e:
        logger.error(f"Error getting family members: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/search", response_model=List[FamilyMemberResponse])
async def search_family_members(
    q: str = Query(..., min_length=2, description="Search query"),
    skip: int = Query(0, ge=0),
    limit: int = Query(20, ge=1, le=100),
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """
    Search family members by name, biography, or other text fields.
    
    The search is case-insensitive and searches across multiple fields
    including names, biography, occupation, etc.
    """
    try:
        members = await service.search(q, skip=skip, limit=limit)
        return members
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except FamilyPortfolioException:
        raise
    except Exception as e:
        logger.error(f"Error searching family members: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/tree", response_model=List[FamilyTreeNode])
async def get_family_tree(
    root_id: Optional[int] = Query(None, description="Root member ID. If not provided, returns all root members"),
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """
    Get family tree structure starting from a root member.
    
    If root_id is provided, returns the tree starting from that member.
    Otherwise, returns all root members (those without parents) and their descendants.
    """
    try:
        tree = await service.get_family_tree(root_id)
        return tree
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except FamilyPortfolioException:
        raise
    except Exception as e:
        logger.error(f"Error getting family tree: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/living", response_model=List[FamilyMemberResponse])
async def get_living_members(
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """Get all living family members (those without a death date)."""
    try:
        members = await service.get_living_members()
        return members
    except FamilyPortfolioException:
        raise
    except Exception as e:
        logger.error(f"Error getting living members: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/deceased", response_model=List[FamilyMemberResponse])
async def get_deceased_members(
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """Get all deceased family members (those with a death date)."""
    try:
        members = await service.get_deceased_members()
        return members
    except FamilyPortfolioException:
        raise
    except Exception as e:
        logger.error(f"Error getting deceased members: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/{member_id}", response_model=FamilyMemberResponse)
async def get_family_member(
    member_id: int,
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """Get a specific family member by ID."""
    try:
        member = await service.get(member_id)
        if not member:
            raise NotFoundError("FamilyMember", member_id)
        return member
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except FamilyPortfolioException:
        raise
    except Exception as e:
        logger.error(f"Error getting family member {member_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/{member_id}/ancestors", response_model=List[FamilyMemberResponse])
async def get_ancestors(
    member_id: int,
    max_generations: int = Query(10, ge=1, le=20, description="Maximum generations to retrieve"),
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """Get all ancestors of a family member up to the specified number of generations."""
    try:
        ancestors = await service.get_ancestors(member_id, max_generations)
        return ancestors
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except FamilyPortfolioException:
        raise
    except Exception as e:
        logger.error(f"Error getting ancestors for member {member_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/{member_id}/descendants", response_model=List[FamilyMemberResponse])
async def get_descendants(
    member_id: int,
    max_generations: int = Query(10, ge=1, le=20, description="Maximum generations to retrieve"),
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """Get all descendants of a family member up to the specified number of generations."""
    try:
        descendants = await service.get_descendants(member_id, max_generations)
        return descendants
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except FamilyPortfolioException:
        raise
    except Exception as e:
        logger.error(f"Error getting descendants for member {member_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.get("/{member_id}/siblings", response_model=List[FamilyMemberResponse])
async def get_siblings(
    member_id: int,
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """Get all siblings of a family member (those with the same parent)."""
    try:
        siblings = await service.get_siblings(member_id)
        return siblings
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except FamilyPortfolioException:
        raise
    except Exception as e:
        logger.error(f"Error getting siblings for member {member_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.post("/", response_model=FamilyMemberResponse, status_code=status.HTTP_201_CREATED)
async def create_family_member(
    member_data: FamilyMemberCreate,
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """
    Create a new family member.
    
    All validation rules are applied, including:
    - Parent existence validation
    - Date consistency checks
    - Required field validation
    """
    try:
        member = await service.create(member_data)
        logger.info(f"Created family member: {member.full_name} (ID: {member.id})")
        return member
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except FamilyPortfolioException:
        raise
    except Exception as e:
        logger.error(f"Error creating family member: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.put("/{member_id}", response_model=FamilyMemberResponse)
async def update_family_member(
    member_id: int,
    member_data: FamilyMemberUpdate,
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """
    Update an existing family member.
    
    Only provided fields will be updated. Validation rules are applied
    including circular reference prevention for parent assignments.
    """
    try:
        member = await service.update(member_id, member_data)
        logger.info(f"Updated family member: {member.full_name} (ID: {member.id})")
        return member
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except FamilyPortfolioException:
        raise
    except Exception as e:
        logger.error(f"Error updating family member {member_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)


@router.delete("/{member_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_family_member(
    member_id: int,
    service: FamilyMemberService = Depends(get_family_member_service)
):
    """
    Delete a family member.
    
    Deletion is prevented if the member has children. Children must be
    reassigned or deleted first to maintain data integrity.
    """
    try:
        await service.delete(member_id)
        logger.info(f"Deleted family member with ID: {member_id}")
        return
    except NotFoundError as e:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=e.message)
    except ValidationError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=e.message)
    except FamilyPortfolioException:
        raise
    except Exception as e:
        logger.error(f"Error deleting family member {member_id}: {e}", exc_info=True)
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR)
