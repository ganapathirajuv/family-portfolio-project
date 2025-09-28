from fastapi import APIRouter

router = APIRouter()


@router.get("/")
async def get_photos():
    """Get list of photos"""
    return {
        "message": "Photos endpoint",
        "photos": [
            {"id": 1, "title": "Family Reunion 2023", "date": "2023-07-15"},
            {"id": 2, "title": "Wedding Day", "date": "1995-06-20"}
        ]
    }


@router.post("/")
async def upload_photo():
    """Upload new photo"""
    return {"message": "Photo upload endpoint - Coming soon!"}
