"""
Family Portfolio API - Main application entry point.

This module sets up the FastAPI application with proper middleware,
dependency injection, error handling, and routing using enterprise
middleware service patterns.
"""

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.core.database import init_db, test_connection
from app.core.container import container
from app.middleware.logging import LoggingMiddleware, setup_logging
from app.middleware.error_handler import ErrorHandlerMiddleware
from app.middleware.request_tracing import RequestTracingMiddleware
from app.exceptions import FamilyPortfolioException
from app.repositories import FamilyMemberRepository
from app.services import FamilyMemberService
from app.api.v1.api import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context manager for startup and shutdown events."""
    
    # Startup
    logger = setup_logging(settings.log_level, settings.log_format)
    logger.info(f"🚀 Starting {settings.app_name} v{settings.app_version}")
    logger.info(f"Environment: {settings.environment}")
    logger.info(f"Debug mode: {settings.debug}")
    
    try:
        # Test database connection
        if not test_connection():
            raise Exception("Failed to connect to database")
        logger.info("✅ Database connection successful")
        
        # Initialize database tables
        await init_db()
        logger.info("✅ Database tables initialized")
        
        # Setup dependency injection
        setup_dependencies()
        logger.info("✅ Dependency injection configured")
        
        logger.info("🎉 Application started successfully!")
        
    except Exception as e:
        logger.error(f"❌ Startup failed: {e}")
        raise
    
    yield
    
    # Shutdown
    logger.info("🛑 Application shutting down...")
    logger.info("👋 Goodbye!")


def setup_dependencies():
    """Configure dependency injection container."""
    
    # Register repositories
    container.register_transient(FamilyMemberRepository, FamilyMemberRepository)
    
    # Register services
    container.register_transient(FamilyMemberService, FamilyMemberService)


def create_application() -> FastAPI:
    """Create and configure FastAPI application."""
    
    app = FastAPI(
        title=settings.app_name,
        description="A comprehensive family heritage management system built with enterprise middleware patterns",
        version=settings.app_version,
        docs_url="/api/docs" if not settings.is_production() else None,
        redoc_url="/api/redoc" if not settings.is_production() else None,
        lifespan=lifespan
    )
    
    # Setup logging
    logger = setup_logging(settings.log_level, settings.log_format)
    
    # Add middleware (order matters - first added = outermost)
    if settings.enable_tracing:
        app.add_middleware(RequestTracingMiddleware)
    
    app.add_middleware(LoggingMiddleware, logger=logger)
    app.add_middleware(ErrorHandlerMiddleware, logger=logger)
    
    # CORS middleware
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=settings.cors_allow_credentials,
        allow_methods=settings.cors_methods_list,
        allow_headers=settings.cors_headers_list,
    )
    
    # Mount static files
    app.mount("/uploads", StaticFiles(directory=settings.upload_path), name="uploads")
    
    # Include API routers
    app.include_router(api_router, prefix="/api/v1", tags=["API v1"])
    
    return app


# Create application instance
app = create_application()


# Health check and root endpoints are moved to the API router