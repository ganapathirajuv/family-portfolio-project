"""API v1 router configuration."""

from fastapi import APIRouter
from app.api.v1.endpoints import system, auth, family_members, photos

api_router = APIRouter()

# Include system endpoints (health, metrics, etc.)
api_router.include_router(system.router, tags=["system"])

# Include feature endpoint routers
api_router.include_router(auth.router, prefix="/auth", tags=["authentication"])
api_router.include_router(family_members.router, prefix="/family-members", tags=["family-members"])
api_router.include_router(photos.router, prefix="/photos", tags=["photos"])
