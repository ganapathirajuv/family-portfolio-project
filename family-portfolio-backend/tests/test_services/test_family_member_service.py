"""Unit tests for family member service layer."""

import pytest
from unittest.mock import Mock, AsyncMock
from datetime import date

from app.services.family_member import FamilyMemberService
from app.repositories.family_member import FamilyMemberRepository
from app.models.family_member import FamilyMember, GenderEnum
from app.schemas.family_member import FamilyMemberCreate, FamilyMemberUpdate
from app.exceptions import ValidationError, ConflictError, NotFoundError


class TestFamilyMemberService:
    """Test suite for FamilyMemberService."""
    
    def setup_method(self):
        """Set up test fixtures."""
        self.mock_repository = Mock(spec=FamilyMemberRepository)
        self.service = FamilyMemberService(self.mock_repository)
    
    @pytest.mark.asyncio
    async def test_create_family_member_success(self):
        """Test successful family member creation."""
        # Arrange
        create_data = FamilyMemberCreate(
            first_name="John",
            last_name="Doe",
            birth_date=date(1980, 1, 1),
            gender=GenderEnum.MALE
        )
        
        created_member = FamilyMember(
            id=1,
            first_name="John",
            last_name="Doe",
            birth_date=date(1980, 1, 1),
            gender=GenderEnum.MALE
        )
        
        self.mock_repository.create = AsyncMock(return_value=created_member)
        
        # Act
        result = await self.service.create(create_data)
        
        # Assert
        assert result.first_name == "John"
        assert result.last_name == "Doe"
        self.mock_repository.create.assert_called_once_with(create_data)
    
    @pytest.mark.asyncio
    async def test_create_with_invalid_parent_fails(self):
        """Test that creating a member with non-existent parent fails."""
        # Arrange
        create_data = FamilyMemberCreate(
            first_name="Jane",
            last_name="Doe",
            parent_id=999
        )
        
        self.mock_repository.exists = AsyncMock(return_value=False)
        
        # Act & Assert
        with pytest.raises(ValidationError) as exc_info:
            await self.service.create(create_data)
        
        assert "Parent member does not exist" in str(exc_info.value.message)
    
    @pytest.mark.asyncio
    async def test_update_prevents_circular_reference(self):
        """Test that updating a member's parent prevents circular references."""
        # Arrange
        member_id = 1
        update_data = FamilyMemberUpdate(parent_id=2)
        
        # Mock descendants to include the potential parent
        mock_descendants = [
            Mock(id=2),  # The proposed parent is a descendant
            Mock(id=3)
        ]
        
        self.mock_repository.exists = AsyncMock(return_value=True)
        self.mock_repository.get_descendants = AsyncMock(return_value=mock_descendants)
        
        # Act & Assert
        with pytest.raises(ValidationError) as exc_info:
            await self.service.update(member_id, update_data)
        
        assert "circular reference" in str(exc_info.value.message)
    
    @pytest.mark.asyncio
    async def test_delete_with_children_fails(self):
        """Test that deleting a member with children fails."""
        # Arrange
        member_id = 1
        mock_children = [Mock(id=2), Mock(id=3)]
        
        self.mock_repository.get_by_parent = AsyncMock(return_value=mock_children)
        
        # Act & Assert
        with pytest.raises(ConflictError) as exc_info:
            await self.service.delete(member_id)
        
        assert "Cannot delete family member with" in str(exc_info.value.message)
    
    @pytest.mark.asyncio
    async def test_search_with_short_term_fails(self):
        """Test that search with short term fails validation."""
        # Act & Assert
        with pytest.raises(ValidationError) as exc_info:
            await self.service.search("a")
        
        assert "at least 2 characters" in str(exc_info.value.message)
    
    @pytest.mark.asyncio
    async def test_get_family_tree_with_invalid_root_fails(self):
        """Test that getting family tree with invalid root ID fails."""
        # Arrange
        root_id = 999
        self.mock_repository.get = AsyncMock(return_value=None)
        
        # Act & Assert
        with pytest.raises(NotFoundError):
            await self.service.get_family_tree(root_id)
    
    @pytest.mark.asyncio
    async def test_get_ancestors_success(self):
        """Test successful retrieval of ancestors."""
        # Arrange
        member_id = 3
        mock_ancestors = [
            Mock(id=1, first_name="Grandparent"),
            Mock(id=2, first_name="Parent")
        ]
        
        self.mock_repository.exists = AsyncMock(return_value=True)
        self.mock_repository.get_ancestors = AsyncMock(return_value=mock_ancestors)
        
        # Act
        result = await self.service.get_ancestors(member_id)
        
        # Assert
        assert len(result) == 2
        self.mock_repository.get_ancestors.assert_called_once_with(member_id, 10)


@pytest.fixture
def sample_family_member():
    """Sample family member for testing."""
    return FamilyMember(
        id=1,
        first_name="John",
        last_name="Doe", 
        birth_date=date(1980, 1, 1),
        gender=GenderEnum.MALE
    )