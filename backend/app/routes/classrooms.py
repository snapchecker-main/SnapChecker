from app.models.schema import User
from app.security.dependencies import get_current_user
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.schema import Classroom, AnswerSheetTemplate, Masterlist, ScanResult
from app.services.gradebook_service import GradebookService
from app.services.semester_gradebook_service import SemesterGradebookService
from app.services.cloudinary_service import CloudinaryService

router = APIRouter(prefix="/api/classrooms", tags=["Classrooms"])

class ClassroomCreate(BaseModel):
    name: str
    subject_name: str
    academic_term: str = ""
    
class ClassroomUpdate(BaseModel):
    name: str
    subject_name: str
    academic_term: str = ""

@router.post("/")
def create_classroom(
    classroom: ClassroomCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    new_class = Classroom(
        owner_id=current_user.id,
        name=classroom.name,
        subject_name=classroom.subject_name,
        academic_term=classroom.academic_term,
    )
    db.add(new_class)
    db.commit()
    db.refresh(new_class)
    return new_class

@router.get("/")
def get_all_classrooms(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classrooms = (
        db.query(Classroom)
        .filter(Classroom.owner_id == current_user.id)
        .order_by(Classroom.created_at.desc())
        .all()
    )

    for classroom in classrooms:
        classroom.student_count = (
            db.query(Masterlist)
            .filter(Masterlist.classroom_id == classroom.id)
            .count()
        )

        classroom.assessment_count = (
            db.query(AnswerSheetTemplate)
            .filter(
                AnswerSheetTemplate.classroom_id == classroom.id,
                AnswerSheetTemplate.is_active == True,
            )
            .count()
        )

    return classrooms

@router.get("/{classroom_id}")
def get_classroom_dashboard(
    classroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.owner_id == current_user.id,
        )
        .first()
    )
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")

    templates = (
        db.query(AnswerSheetTemplate)
        .filter(
            AnswerSheetTemplate.classroom_id == classroom_id,
            AnswerSheetTemplate.is_active == True,
        )
        .all()
    )

    for template in templates:
        template.answer_key = (
            template.answer_key_json
            if template.answer_key_json
            else []
        )

    roster = db.query(Masterlist).filter(Masterlist.classroom_id == classroom_id).all()

    recent_assessments = []
    completed_assessments = 0
    total_review_papers = 0

    for template in sorted(
        templates,
        key=lambda t: t.created_at,
        reverse=True,
    )[:5]:

        scans = (
            db.query(ScanResult)
            .filter(
                ScanResult.template_id == template.id
            )
            .all()
        )

        graded = sum(
            1
            for scan in scans
            if not scan.needs_review
        )

        review = sum(
            1
            for scan in scans
            if scan.needs_review
        )

        total_review_papers += review
        if graded == len(roster) and review == 0:
            completed_assessments += 1

        recent_assessments.append({
            "id": template.id,
            "name": template.name,
            "graded": graded,
            "review": review,
            "total_students": len(roster),
        })

    if templates:

        latest = max(
            templates,
            key=lambda t: t.created_at,
        )

        latest_assessment = {
            "id": latest.id,
            "name": latest.name,
        }

        needs_review = (
            db.query(ScanResult)
            .filter(
                ScanResult.template_id == latest.id,
                ScanResult.needs_review == True,
            )
            .count()
        )

    completion_percentage = (
        round((completed_assessments / len(templates)) * 100)
        if templates
        else 0
    )

    return {
        "id": classroom.id,
        "name": classroom.name,
        "subject_name": classroom.subject_name,
        "academic_term": classroom.academic_term,
        "total_students": len(roster),
        "total_exams": len(templates),
        "roster": roster, 
        "exams": templates,  
        "exam_count": len(templates),
        "roster_count": len(roster),
        "recent_assessments": recent_assessments,

        "dashboard_stats": {
            "total_review_papers": total_review_papers,
            "completed_assessments": completed_assessments,
            "completion_percentage": completion_percentage,
        },
    }

@router.get("/{classroom_id}/semester-gradebook")
def semester_gradebook(
    classroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.owner_id == current_user.id,
        )
        .first()
    )

    if not classroom:
        raise HTTPException(
            status_code=404,
            detail="Classroom not found",
        )

    roster = (
        db.query(Masterlist)
        .filter(
            Masterlist.classroom_id == classroom_id
        )
        .all()
    )

    templates = (
        db.query(AnswerSheetTemplate)
        .filter(
            AnswerSheetTemplate.classroom_id == classroom_id,
            AnswerSheetTemplate.is_active == True,
        )
        .all()
    )

    scans = (
        db.query(ScanResult)
        .join(
            AnswerSheetTemplate,
            ScanResult.template_id == AnswerSheetTemplate.id,
        )
        .filter(
            AnswerSheetTemplate.classroom_id == classroom_id,
        )
        .all()
    )

    return SemesterGradebookService.build(
        roster,
        templates,
        scans,
    )

@router.get("/{classroom_id}/gradebook")
def gradebook(
    classroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.owner_id == current_user.id,
        )
        .first()
    )

    if not classroom:
        raise HTTPException(
            status_code=404,
            detail="Classroom not found",
        )

    roster = (
        db.query(Masterlist)
        .filter(
            Masterlist.classroom_id == classroom_id
        )
        .order_by(Masterlist.student_name)
        .all()
    )

    scans = (
        db.query(ScanResult)
        .join(
            AnswerSheetTemplate,
            ScanResult.template_id == AnswerSheetTemplate.id,
        )
        .filter(
            AnswerSheetTemplate.classroom_id == classroom_id,
        )
        .order_by(ScanResult.created_at.desc())
        .all()
    )

    return GradebookService.build(
        roster,
        scans,
    )

@router.put("/{classroom_id}")
def update_classroom(
    classroom_id: int,
    classroom_data: ClassroomUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.owner_id == current_user.id,
        )
        .first()
    )

    if not classroom:
        raise HTTPException(
            status_code=404,
            detail="Classroom not found",
        )

    classroom.name = classroom_data.name
    classroom.subject_name = classroom_data.subject_name
    classroom.academic_term = classroom_data.academic_term

    db.commit()
    db.refresh(classroom)

    return classroom

@router.delete("/{classroom_id}")
def delete_classroom(
    classroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deletes a class and cascades to delete all its exams, students, and scans."""
    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.owner_id == current_user.id,
        )
        .first()
    )
    if not classroom:
        raise HTTPException(status_code=404, detail="Classroom not found")
    
    scans = (
        db.query(ScanResult)
        .join(
            AnswerSheetTemplate,
            ScanResult.template_id == AnswerSheetTemplate.id,
        )
        .filter(
            AnswerSheetTemplate.classroom_id == classroom_id,
        )
        .all()
    )

    for scan in scans:
        if scan.cloudinary_public_id:
            CloudinaryService.delete_image(
                scan.cloudinary_public_id,
            )

    db.delete(classroom)
    db.commit()
    return {"message": "Classroom and all associated data deleted permanently."}