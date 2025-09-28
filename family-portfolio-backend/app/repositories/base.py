"""Base repository interface and implementation."""

from abc import ABC, abstractmethod
from typing import TypeVar, Generic, List, Optional, Any, Dict
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError

from app.core.database import Base
from app.exceptions import NotFoundError, InternalServerError


ModelType = TypeVar("ModelType", bound=Base)
CreateSchemaType = TypeVar("CreateSchemaType")
UpdateSchemaType = TypeVar("UpdateSchemaType")


class IRepository(ABC, Generic[ModelType]):
    """Repository interface for basic CRUD operations."""
    
    @abstractmethod
    async def get(self, id: Any) -> Optional[ModelType]:
        """Get a single entity by ID."""
        pass
        
    @abstractmethod 
    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ModelType]:
        """Get all entities with optional pagination and filtering."""
        pass
        
    @abstractmethod
    async def create(self, obj_in: CreateSchemaType) -> ModelType:
        """Create a new entity."""
        pass
        
    @abstractmethod
    async def update(self, id: Any, obj_in: UpdateSchemaType) -> ModelType:
        """Update an existing entity."""
        pass
        
    @abstractmethod
    async def delete(self, id: Any) -> bool:
        """Delete an entity by ID."""
        pass
        
    @abstractmethod
    async def exists(self, id: Any) -> bool:
        """Check if an entity exists."""
        pass


class BaseRepository(IRepository[ModelType], Generic[ModelType]):
    """Base repository implementation with common CRUD operations."""
    
    def __init__(self, model: type[ModelType], db: Session):
        self.model = model
        self.db = db
        
    async def get(self, id: Any) -> Optional[ModelType]:
        """Get a single entity by ID."""
        try:
            return self.db.query(self.model).filter(self.model.id == id).first()
        except SQLAlchemyError as e:
            raise InternalServerError(f"Database error: {str(e)}")
            
    async def get_all(
        self, 
        skip: int = 0, 
        limit: int = 100,
        filters: Optional[Dict[str, Any]] = None
    ) -> List[ModelType]:
        """Get all entities with optional pagination and filtering."""
        try:
            query = self.db.query(self.model)
            
            if filters:
                for field, value in filters.items():
                    if hasattr(self.model, field):
                        if isinstance(value, str) and value.startswith('%') and value.endswith('%'):
                            # Handle LIKE queries
                            query = query.filter(getattr(self.model, field).ilike(value))
                        else:
                            query = query.filter(getattr(self.model, field) == value)
                            
            return query.offset(skip).limit(limit).all()
        except SQLAlchemyError as e:
            raise InternalServerError(f"Database error: {str(e)}")
            
    async def create(self, obj_in: CreateSchemaType) -> ModelType:
        """Create a new entity."""
        try:
            obj_data = obj_in.dict() if hasattr(obj_in, 'dict') else obj_in
            db_obj = self.model(**obj_data)
            self.db.add(db_obj)
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            self.db.rollback()
            raise InternalServerError(f"Database error: {str(e)}")
            
    async def update(self, id: Any, obj_in: UpdateSchemaType) -> ModelType:
        """Update an existing entity."""
        try:
            db_obj = await self.get(id)
            if not db_obj:
                raise NotFoundError(self.model.__name__, id)
                
            obj_data = obj_in.dict(exclude_unset=True) if hasattr(obj_in, 'dict') else obj_in
            
            for field, value in obj_data.items():
                setattr(db_obj, field, value)
                
            self.db.commit()
            self.db.refresh(db_obj)
            return db_obj
        except SQLAlchemyError as e:
            self.db.rollback()
            raise InternalServerError(f"Database error: {str(e)}")
            
    async def delete(self, id: Any) -> bool:
        """Delete an entity by ID."""
        try:
            db_obj = await self.get(id)
            if not db_obj:
                raise NotFoundError(self.model.__name__, id)
                
            self.db.delete(db_obj)
            self.db.commit()
            return True
        except SQLAlchemyError as e:
            self.db.rollback()
            raise InternalServerError(f"Database error: {str(e)}")
            
    async def exists(self, id: Any) -> bool:
        """Check if an entity exists."""
        try:
            return self.db.query(self.model).filter(self.model.id == id).first() is not None
        except SQLAlchemyError as e:
            raise InternalServerError(f"Database error: {str(e)}")