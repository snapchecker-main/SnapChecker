from sqlalchemy import select, func
from sqlalchemy.orm import Session
from app.models.schema import ScanResult, AnswerSheetTemplate, Classroom
from app.config import settings

def get_image_usage_count(db: Session, user_id: int) -> int:
    """
    Returns the count of scan images currently stored in Cloudinary for the user.
    """
    query = (
        select(func.count(ScanResult.id))
        .join(AnswerSheetTemplate, ScanResult.template_id == AnswerSheetTemplate.id)
        .join(Classroom, AnswerSheetTemplate.classroom_id == Classroom.id)
        .where(
            Classroom.owner_id == user_id,
            ScanResult.cloudinary_public_id.isnot(None)
        )
    )
    result = db.execute(query)
    return result.scalar() or 0

def get_record_usage_count(db: Session, user_id: int) -> int:
    """
    Returns the total count of academic grade records processed by the user.
    """
    query = (
        select(func.count(ScanResult.id))
        .join(AnswerSheetTemplate, ScanResult.template_id == AnswerSheetTemplate.id)
        .join(Classroom, AnswerSheetTemplate.classroom_id == Classroom.id)
        .where(Classroom.owner_id == user_id)
    )
    result = db.execute(query)
    return result.scalar() or 0

def get_storage_usage(db: Session, user_id: int) -> dict:
    """
    Aggregates image storage and academic record totals, calculating derived quota metrics.
    """
    current_scans = get_image_usage_count(db, user_id)
    current_records = get_record_usage_count(db, user_id)
    
    scan_limit = settings.STORAGE_SCAN_IMAGE_LIMIT
    record_limit = settings.STORAGE_GRADE_RECORD_LIMIT

    return {
        "scans": {
            "current": current_scans,
            "limit": scan_limit,
            "remaining": max(0, scan_limit - current_scans),
            "percent_used": round((current_scans / scan_limit) * 100, 2) if scan_limit > 0 else 0.0
        },
        "records": {
            "current": current_records,
            "limit": record_limit,
            "remaining": max(0, record_limit - current_records),
            "percent_used": round((current_records / record_limit) * 100, 2) if record_limit > 0 else 0.0
        }
    }