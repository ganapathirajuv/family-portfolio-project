"""Error handling middleware for FastAPI applications."""

import logging
import traceback
from typing import Callable, Union

from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp

from app.exceptions.base import FamilyPortfolioException, map_to_http_exception
from app.core.config import settings


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware for centralized error handling and response formatting."""
    
    def __init__(self, app: ASGIApp, logger: logging.Logger = None):
        super().__init__(app)
        self.logger = logger or logging.getLogger(__name__)
        
    async def dispatch(self, request: Request, call_next: Callable) -> Union[JSONResponse, Exception]:
        """Handle errors and format responses consistently."""
        
        try:
            response = await call_next(request)
            return response
            
        except FamilyPortfolioException as exc:
            # Handle custom application exceptions
            return await self._handle_family_portfolio_exception(request, exc)
            
        except HTTPException as exc:
            # Handle FastAPI HTTP exceptions
            return await self._handle_http_exception(request, exc)
            
        except ValueError as exc:
            # Handle validation errors
            return await self._handle_validation_error(request, exc)
            
        except Exception as exc:
            # Handle unexpected exceptions
            return await self._handle_unexpected_exception(request, exc)
    
    async def _handle_family_portfolio_exception(
        self, 
        request: Request, 
        exc: FamilyPortfolioException
    ) -> JSONResponse:
        """Handle custom Family Portfolio exceptions."""
        
        request_id = getattr(request.state, 'request_id', 'unknown')
        
        self.logger.warning(
            f"Business logic error in {request.method} {request.url.path}: {exc.message}",
            extra={
                "request_id": request_id,
                "error_code": exc.error_code,
                "details": exc.details,
                "exception_type": type(exc).__name__
            }
        )
        
        # Map to HTTP exception
        http_exc = map_to_http_exception(exc)
        
        error_response = {
            "error": True,
            "message": exc.message,
            "error_code": exc.error_code,
            "details": exc.details,
            "request_id": request_id,
            "timestamp": self._get_timestamp()
        }
        
        return JSONResponse(
            status_code=http_exc.status_code,
            content=error_response
        )
    
    async def _handle_http_exception(
        self, 
        request: Request, 
        exc: HTTPException
    ) -> JSONResponse:
        """Handle FastAPI HTTP exceptions."""
        
        request_id = getattr(request.state, 'request_id', 'unknown')
        
        self.logger.warning(
            f"HTTP error in {request.method} {request.url.path}: {exc.detail}",
            extra={
                "request_id": request_id,
                "status_code": exc.status_code,
                "exception_type": type(exc).__name__
            }
        )
        
        error_response = {
            "error": True,
            "message": exc.detail,
            "error_code": f"HTTP_{exc.status_code}",
            "details": {},
            "request_id": request_id,
            "timestamp": self._get_timestamp()
        }
        
        return JSONResponse(
            status_code=exc.status_code,
            content=error_response
        )
    
    async def _handle_validation_error(
        self, 
        request: Request, 
        exc: ValueError
    ) -> JSONResponse:
        """Handle validation errors."""
        
        request_id = getattr(request.state, 'request_id', 'unknown')
        
        self.logger.warning(
            f"Validation error in {request.method} {request.url.path}: {str(exc)}",
            extra={
                "request_id": request_id,
                "exception_type": type(exc).__name__
            }
        )
        
        error_response = {
            "error": True,
            "message": "Validation failed",
            "error_code": "VALIDATION_ERROR",
            "details": {"validation_error": str(exc)},
            "request_id": request_id,
            "timestamp": self._get_timestamp()
        }
        
        return JSONResponse(
            status_code=status.HTTP_400_BAD_REQUEST,
            content=error_response
        )
    
    async def _handle_unexpected_exception(
        self, 
        request: Request, 
        exc: Exception
    ) -> JSONResponse:
        """Handle unexpected exceptions."""
        
        request_id = getattr(request.state, 'request_id', 'unknown')
        
        # Log full traceback for unexpected errors
        self.logger.error(
            f"Unexpected error in {request.method} {request.url.path}: {str(exc)}",
            extra={
                "request_id": request_id,
                "exception_type": type(exc).__name__,
                "traceback": traceback.format_exc()
            },
            exc_info=True
        )
        
        # In production, don't expose internal error details
        if settings.DEBUG:
            error_response = {
                "error": True,
                "message": "Internal server error",
                "error_code": "INTERNAL_ERROR",
                "details": {
                    "exception_type": type(exc).__name__,
                    "exception_message": str(exc),
                    "traceback": traceback.format_exc().split('\n')
                },
                "request_id": request_id,
                "timestamp": self._get_timestamp()
            }
        else:
            error_response = {
                "error": True,
                "message": "Internal server error",
                "error_code": "INTERNAL_ERROR",
                "details": {},
                "request_id": request_id,
                "timestamp": self._get_timestamp()
            }
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=error_response
        )
    
    def _get_timestamp(self) -> str:
        """Get current timestamp in ISO format."""
        from datetime import datetime
        return datetime.utcnow().isoformat() + "Z"


# Global exception handlers for FastAPI app
def create_exception_handlers():
    """Create FastAPI exception handlers."""
    
    exception_handlers = {}
    
    @exception_handlers.setdefault(FamilyPortfolioException)
    async def family_portfolio_exception_handler(request: Request, exc: FamilyPortfolioException):
        """Handle Family Portfolio custom exceptions."""
        request_id = getattr(request.state, 'request_id', 'unknown')
        
        http_exc = map_to_http_exception(exc)
        
        return JSONResponse(
            status_code=http_exc.status_code,
            content={
                "error": True,
                "message": exc.message,
                "error_code": exc.error_code,
                "details": exc.details,
                "request_id": request_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        )
    
    @exception_handlers.setdefault(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        """Handle FastAPI HTTP exceptions."""
        request_id = getattr(request.state, 'request_id', 'unknown')
        
        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": True,
                "message": exc.detail,
                "error_code": f"HTTP_{exc.status_code}",
                "details": {},
                "request_id": request_id,
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        )
    
    @exception_handlers.setdefault(Exception)
    async def general_exception_handler(request: Request, exc: Exception):
        """Handle unexpected exceptions."""
        request_id = getattr(request.state, 'request_id', 'unknown')
        
        logger = logging.getLogger(__name__)
        logger.error(
            f"Unexpected error: {str(exc)}",
            extra={"request_id": request_id},
            exc_info=True
        )
        
        content = {
            "error": True,
            "message": "Internal server error",
            "error_code": "INTERNAL_ERROR", 
            "details": {},
            "request_id": request_id,
            "timestamp": datetime.utcnow().isoformat() + "Z"
        }
        
        if settings.DEBUG:
            content["details"] = {
                "exception_type": type(exc).__name__,
                "exception_message": str(exc)
            }
        
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=content
        )
    
    return exception_handlers