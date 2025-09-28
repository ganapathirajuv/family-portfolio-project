"""Base service interface and implementation."""

from abc import ABC, abstractmethod
from typing import TypeVar, Generic, List, Optional, Any, Dict
import logging

from app.repositories.base import IRepository


ModelType = TypeVar("ModelType")
CreateSchemaType = TypeVar("CreateSchemaType") 
UpdateSchemaType = TypeVar("UpdateSchemaType")
ResponseSchemaType = TypeVar("ResponseSchemaType")


class IService(ABC, Generic[ModelType, CreateSchemaType, UpdateSchemaType, ResponseSchemaType]):
    """Service interface for business logic operations."""
    
    @abstractmethod
    async def get(self, id: Any) -> Optional[ResponseSchemaType]:
        """Get a single entity by ID."""
        pass
        
    @abstractmethod
    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ResponseSchemaType]:
        """Get all entities with optional pagination and filtering."""
        pass
        
    @abstractmethod
    async def create(self, obj_in: CreateSchemaType) -> ResponseSchemaType:
        """Create a new entity."""
        pass
        
    @abstractmethod
    async def update(self, id: Any, obj_in: UpdateSchemaType) -> ResponseSchemaType:
        """Update an existing entity."""
        pass
        
    @abstractmethod
    async def delete(self, id: Any) -> bool:
        """Delete an entity by ID."""
        pass


class BaseService(IService[ModelType, CreateSchemaType, UpdateSchemaType, ResponseSchemaType]):
    """Base service implementation with common business logic."""
    
    def __init__(
        self, 
        repository: IRepository[ModelType],
        response_schema: type[ResponseSchemaType]
    ):
        self.repository = repository
        self.response_schema = response_schema
        self.logger = logging.getLogger(self.__class__.__name__)
        
    async def get(self, id: Any) -> Optional[ResponseSchemaType]:
        """Get a single entity by ID."""
        self.logger.info(f"Getting entity with ID: {id}")
        
        entity = await self.repository.get(id)
        if not entity:
            return None
            
        return self.response_schema.from_orm(entity)
        
    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ResponseSchemaType]:
        """Get all entities with optional pagination and filtering."""
        self.logger.info(f"Getting entities with skip={skip}, limit={limit}, filters={filters}")
        
        entities = await self.repository.get_all(skip=skip, limit=limit, filters=filters)
        return [self.response_schema.from_orm(entity) for entity in entities]
        
    async def create(self, obj_in: CreateSchemaType) -> ResponseSchemaType:
        """Create a new entity."""
        self.logger.info(f"Creating new entity: {obj_in}")
        
        # Validate business rules before creation
        await self._validate_create(obj_in)
        
        entity = await self.repository.create(obj_in)
        
        # Execute post-creation hooks
        await self._post_create(entity)
        
        return self.response_schema.from_orm(entity)
        
    async def update(self, id: Any, obj_in: UpdateSchemaType) -> ResponseSchemaType:
        """Update an existing entity."""
        self.logger.info(f"Updating entity with ID: {id}")
        
        # Validate business rules before update
        await self._validate_update(id, obj_in)
        
        entity = await self.repository.update(id, obj_in)
        
        # Execute post-update hooks
        await self._post_update(entity)
        
        return self.response_schema.from_orm(entity)
        
    async def delete(self, id: Any) -> bool:
        """Delete an entity by ID."""
        self.logger.info(f"Deleting entity with ID: {id}")
        
        # Validate business rules before deletion
        await self._validate_delete(id)
        
        result = await self.repository.delete(id)
        
        # Execute post-deletion hooks
        if result:
            await self._post_delete(id)
            
        return result
        
    async def exists(self, id: Any) -> bool:
        """Check if an entity exists."""
        return await self.repository.exists(id)
        
    # Hook methods for business logic validation and side effects
    async def _validate_create(self, obj_in: CreateSchemaType) -> None:
        """Validate business rules before entity creation."""
        pass
        
    async def _validate_update(self, id: Any, obj_in: UpdateSchemaType) -> None:
        """Validate business rules before entity update."""
        pass
        
    async def _validate_delete(self, id: Any) -> None:
        """Validate business rules before entity deletion."""
        pass
        
    async def _post_create(self, entity: ModelType) -> None:
        """Execute actions after entity creation."""
        pass
        
    async def _post_update(self, entity: ModelType) -> None:
        """Execute actions after entity update."""
        pass
        
    async def _post_delete(self, id: Any) -> None:
        """Execute actions after entity deletion."""
        pass