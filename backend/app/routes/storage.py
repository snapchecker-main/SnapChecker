from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db  
from app.security.dependencies import get_current_user  
from app.models.schemas import StorageUsageResponse
from app.services import storage_service

router = APIRouter(prefix="/storage", tags=["Storage"])

@router.get("/usage", response_model=StorageUsageResponse)
def get_user_storage_usage(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Securely fetches the authenticated user's current image storage and academic record quotas.
    """
    return storage_service.get_storage_usage(db, current_user.id)