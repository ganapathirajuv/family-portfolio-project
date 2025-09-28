"""Health and system endpoints."""

from fastapi import APIRouter, HTTPException, status, Depends
from sqlalchemy.orm import Session
import logging

from app.core.config import settings
from app.core.database import get_db, test_connection


router = APIRouter()
logger = logging.getLogger(__name__)


@router.get("/")
async def root():
    """Root endpoint with application information."""
    return {
        "message": settings.app_name,
        "version": settings.version,
        "environment": settings.environment,
        "docs": "/api/docs" if not settings.is_production() else None,
        "health": "/api/v1/health"
    }


@router.get("/health")
async def health_check(db: Session = Depends(get_db)):
    """
    Health check endpoint for monitoring and load balancers.
    
    Returns:
        dict: Health status information including database connectivity
    """
    try:
        # Test database connection
        db_status = test_connection()
        
        # Basic service checks
        checks = {
            "database": "connected" if db_status else "disconnected",
            "api": "operational"
        }
        
        # Overall status
        is_healthy = all(
            status in ["connected", "operational"] 
            for status in checks.values()
        )
        
        response = {
            "status": "healthy" if is_healthy else "unhealthy",
            "version": settings.app_version,
            "environment": settings.environment,
            "service": settings.app_name,
            "checks": checks,
            "timestamp": __import__('datetime').datetime.utcnow().isoformat() + "Z"
        }
        
        status_code = status.HTTP_200_OK if is_healthy else status.HTTP_503_SERVICE_UNAVAILABLE
        
        return response
        
    except Exception as e:
        logger.error(f"Health check error: {e}", exc_info=True)
        
        return {
            "status": "unhealthy",
            "version": settings.app_version,
            "environment": settings.environment,
            "service": settings.app_name,
            "error": "Health check failed",
            "timestamp": __import__('datetime').datetime.utcnow().isoformat() + "Z"
        }


@router.get("/metrics")
async def metrics():
    """
    Basic metrics endpoint for monitoring.
    
    Note: In production, you might want to use proper metrics
    libraries like Prometheus client.
    """
    if not settings.enable_metrics:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Metrics endpoint is disabled"
        )
    
    # Basic metrics - extend as needed
    return {
        "service": settings.app_name,
        "version": settings.app_version,
        "environment": settings.environment,
        "uptime_seconds": 0,  # Would need to track actual uptime
        "requests_total": 0,  # Would need request counter
        "timestamp": __import__('datetime').datetime.utcnow().isoformat() + "Z"
    }