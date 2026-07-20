from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from pydantic import BaseModel
from app.database import get_db
from app.models.schema import (
    User,
    Classroom,
    Masterlist,
    AnswerSheetTemplate,
    ScanResult,
)
from app.models.schemas import TemplateCreate
from app.security.dependencies import get_current_user

router = APIRouter(prefix="/roster", tags=["Roster"])

def get_owned_classroom(
    classroom_id: int,
    current_user: User,
    db: Session,
) -> Classroom:

    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == classroom_id,
            Classroom.owner_id == current_user.id,
        )
        .first()
    )

    if classroom is None:
        raise HTTPException(
            status_code=404,
            detail="Classroom not found.",
        )

    return classroom

def get_owned_template(
    template_id: int,
    current_user: User,
    db: Session,
) -> AnswerSheetTemplate:

    template = (
        db.query(AnswerSheetTemplate)
        .join(
            Classroom,
            AnswerSheetTemplate.classroom_id == Classroom.id,
        )
        .filter(
            AnswerSheetTemplate.id == template_id,
            Classroom.owner_id == current_user.id,
        )
        .first()
    )

    if template is None:
        raise HTTPException(
            status_code=404,
            detail="Template not found.",
        )

    return template

def get_owned_student(
    student_id: int,
    current_user: User,
    db: Session,
) -> Masterlist:

    student = (
        db.query(Masterlist)
        .join(
            Classroom,
            Masterlist.classroom_id == Classroom.id,
        )
        .filter(
            Masterlist.id == student_id,
            Classroom.owner_id == current_user.id,
        )
        .first()
    )

    if student is None:
        raise HTTPException(
            status_code=404,
            detail="Student not found.",
        )

    return student

class StudentCreate(BaseModel):
    student_name: str
    student_id: str = ""

# ROSTER MANAGEMENT 
@router.get("/class/{classroom_id}")
def get_roster(
    classroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    get_owned_classroom(
        classroom_id,
        current_user,
        db,
    )
    students = db.query(Masterlist).filter(Masterlist.classroom_id == classroom_id).all()
    return [{"id": s.id, "name": s.student_name, "student_id": s.student_id} for s in students]

@router.post("/class/{classroom_id}")
def add_student(classroom_id: int, student: StudentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user),):
    """Adds a single student to a classroom's masterlist."""
    # Verify the classroom exists
    get_owned_classroom(
        classroom_id,
        current_user,
        db,
    )

    new_student = Masterlist(
        classroom_id=classroom_id,
        student_name=student.student_name,
        student_id=student.student_id,
    )
    db.add(new_student)
    db.commit()
    db.refresh(new_student)
    
    return {"id": new_student.id, "message": "Student added successfully!"}

@router.post("/bulk/class/{classroom_id}")
def add_bulk_students(classroom_id: int, students: List[StudentCreate], db: Session = Depends(get_db), current_user: User = Depends(get_current_user),):
    """Quickly injects a large list of students into a classroom."""
    
    get_owned_classroom(
        classroom_id,
        current_user,
        db,
    )

    new_records = []
    for student in students:
        new_student = Masterlist(
            classroom_id=classroom_id,
            student_name=student.student_name,
            student_id=student.student_id,
        )   
        new_records.append(new_student)
    
    db.add_all(new_records)
    db.commit()
    
    return {"message": f"Successfully added {len(new_records)} students!"}

@router.delete("/class/{classroom_id}")
def clear_roster(
    classroom_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Deletes every student in a classroom roster."""

    get_owned_classroom(
        classroom_id,
        current_user,
        db,
    )

    (
        db.query(Masterlist)
        .filter(Masterlist.classroom_id == classroom_id)
        .delete(synchronize_session=False)
    )

    db.commit()

    return {
        "message": "Roster cleared successfully."
    }

@router.delete("/student/{student_id}")
def delete_student(student_id: int, db: Session = Depends(get_db),current_user: User = Depends(get_current_user),):
    """Removes a student from the database."""
    student = get_owned_student(
        student_id,
        current_user,
        db,
    )
    
    db.delete(student)
    db.commit()
    return {"message": "Student removed successfully"}

@router.put("/student/{student_id}")
def update_student(student_id: int, student_data: StudentCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user),):
    """Updates a student's name or roster number."""
    student = get_owned_student(
        student_id,
        current_user,
        db,
    )
    
    student.student_name = student_data.student_name
    student.student_id = student_data.student_id
    
    db.commit()
    return {"message": "Student updated successfully"}

# TEMPLATE & SCAN UTILITIES

@router.get("/template/{template_id}")
def get_template_scans(template_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user),):
    get_owned_template(
        template_id,
        current_user,
        db,
    )
    scans = db.query(ScanResult).filter(ScanResult.template_id == template_id).order_by(ScanResult.created_at.desc()).all()
    
    return [
        {
            "id": scan.id,
            "score": scan.score,
            "total_items": scan.total_items,
            "created_at": scan.created_at,
            "matched_student_name": scan.matched_student_name or "Anonymous Upload"
        }
        for scan in scans
    ]

@router.put("/template/{template_id}")
def update_template(template_id: int, template_data: TemplateCreate, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    """Updates the core settings of a specific template."""
    template = get_owned_template(
        template_id,
        current_user,
        db,
    )
    
    # Update the fields
    template.name = template_data.name
    template.exam_type = template_data.examType
    template.num_items = template_data.numItems
    template.num_choices = template_data.numChoices
    
    db.commit()
    return {"message": "Template updated successfully", "id": template.id}