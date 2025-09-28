"""Base exception classes for the Family Portfolio API."""

from typing import Optional, Dict, Any
from fastapi import HTTPException, status


class FamilyPortfolioException(Exception):
    """Base exception class for all Family Portfolio specific exceptions."""
    
    def __init__(
        self,
        message: str,
        error_code: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None
    ):
        self.message = message
        self.error_code = error_code
        self.details = details or {}
        super().__init__(self.message)


class ValidationError(FamilyPortfolioException):
    """Raised when input validation fails."""
    
    def __init__(self, message: str, field: Optional[str] = None, **kwargs):
        super().__init__(message, error_code="VALIDATION_ERROR", **kwargs)
        self.field = field


class NotFoundError(FamilyPortfolioException):
    """Raised when a requested resource is not found."""
    
    def __init__(self, resource: str, identifier: Any, **kwargs):
        message = f"{resource} with identifier '{identifier}' not found"
        super().__init__(message, error_code="RESOURCE_NOT_FOUND", **kwargs)
        self.resource = resource
        self.identifier = identifier


class ConflictError(FamilyPortfolioException):
    """Raised when there's a conflict with the current state of a resource."""
    
    def __init__(self, message: str, **kwargs):
        super().__init__(message, error_code="CONFLICT", **kwargs)


class UnauthorizedError(FamilyPortfolioException):
    """Raised when authentication is required but not provided."""
    
    def __init__(self, message: str = "Authentication required", **kwargs):
        super().__init__(message, error_code="UNAUTHORIZED", **kwargs)


class ForbiddenError(FamilyPortfolioException):
    """Raised when the user doesn't have permission to access a resource."""
    
    def __init__(self, message: str = "Access forbidden", **kwargs):
        super().__init__(message, error_code="FORBIDDEN", **kwargs)


class InternalServerError(FamilyPortfolioException):
    """Raised when an internal server error occurs."""
    
    def __init__(self, message: str = "Internal server error", **kwargs):
        super().__init__(message, error_code="INTERNAL_ERROR", **kwargs)


# HTTP Exception mappers
def map_to_http_exception(exc: FamilyPortfolioException) -> HTTPException:
    """Map custom exceptions to HTTP exceptions."""
    
    status_mapping = {
        ValidationError: status.HTTP_400_BAD_REQUEST,
        NotFoundError: status.HTTP_404_NOT_FOUND,
        ConflictError: status.HTTP_409_CONFLICT,
        UnauthorizedError: status.HTTP_401_UNAUTHORIZED,
        ForbiddenError: status.HTTP_403_FORBIDDEN,
        InternalServerError: status.HTTP_500_INTERNAL_SERVER_ERROR,
    }
    
    status_code = status_mapping.get(type(exc), status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    detail = {
        "message": exc.message,
        "error_code": exc.error_code,
        "details": exc.details
    }
    
    return HTTPException(status_code=status_code, detail=detail)