from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.services.grading_service import GradingService
from app.security.dependencies import get_current_user


from app.database import get_db
from app.models.schema import (
    User,
    Classroom,
    AnswerSheetTemplate,
    Masterlist,
    ScanResult,
)
from app.models.schemas import (
    TemplateCreate,
    TemplateResponse,
    AnswerKeyUpdate,
)

router = APIRouter(
    prefix="/templates",
    tags=["Templates"]
)

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

@router.get("/", response_model=List[TemplateResponse])
def get_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    templates = (
        db.query(AnswerSheetTemplate)
        .join(
            Classroom,
            AnswerSheetTemplate.classroom_id == Classroom.id,
        )
        .filter(
            AnswerSheetTemplate.is_active == True,
            Classroom.owner_id == current_user.id,
        )
        .all()
    )

    for template in templates:
        template.answer_key = (
            template.answer_key_json
            if template.answer_key_json
            else []
        )

    return templates


@router.post("/", response_model=TemplateResponse)
def create_template(
    template: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    classroom = (
        db.query(Classroom)
        .filter(
            Classroom.id == template.classroom_id,
            Classroom.owner_id == current_user.id,
        )
        .first()
    )

    if not classroom:
        raise HTTPException(
            status_code=404,
            detail="Classroom not found.",
        )
    
    db_template = AnswerSheetTemplate(
        classroom_id=template.classroom_id,
        name=template.name,
        exam_type=template.examType,
        num_items=template.numItems,
        num_choices=template.numChoices,
        layout_data=template.layout_data, # NEW
        answer_key_json=[],
    )

    db.add(db_template)
    db.commit()
    db.refresh(db_template)

    db_template.answer_key = []
    return db_template


@router.put("/{template_id}", response_model=TemplateResponse)
def update_template(
    template_id: int,
    template_data: TemplateCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = get_owned_template(template_id, current_user, db)

    template.name = template_data.name
    template.exam_type = template_data.examType
    template.num_items = template_data.numItems
    template.num_choices = template_data.numChoices
    
    if template_data.layout_data is not None:
        template.layout_data = template_data.layout_data

    db.commit()
    db.refresh(template)

    template.answer_key = (
        template.answer_key_json if template.answer_key_json else []
    )
    return template


@router.put("/{template_id}/answer_key")
def update_answer_key(
    template_id: int,
    key_data: AnswerKeyUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = get_owned_template(
        template_id,
        current_user,
        db,
    )

    scans = (
        db.query(ScanResult)
        .filter(ScanResult.template_id == template_id)
        .all()
    )

    if scans and not key_data.confirmed:
        return {
            "requires_confirmation": True,
            "scan_count": len(scans),
        }

    template.answer_key_json = key_data.answer_key

    if key_data.regrade:

        for scan in scans:

            grading = GradingService.grade(
                scan.student_answers_json,
                key_data.answer_key,
            )

            scan.score = grading["score"]
            scan.item_results_json = grading["item_results"]

    db.commit()

    return {
        "message": "Answer key saved successfully!"
    }


@router.delete("/{template_id}")
def delete_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = get_owned_template(
        template_id,
        current_user,
        db,
    )

    template.is_active = False

    db.commit()

    return {
        "message": "Template archived successfully."
    }

@router.get("/{template_id}/missing")
def get_missing_students(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = get_owned_template(
        template_id,
        current_user,
        db,
    )
    roster = (
        db.query(Masterlist)
        .filter(
            Masterlist.classroom_id == template.classroom_id
        )
        .all()
    )

    scanned_ids = {
        scan.detected_student_id
        for scan in db.query(ScanResult)
        .filter(
            ScanResult.template_id == template_id
        )
        .all()
        if scan.detected_student_id
    }

    missing = [
        {
            "student_id": student.student_id,
            "student_name": student.student_name,
        }
        for student in roster
        if student.student_id not in scanned_ids
    ]

    return {
        "total_students": len(roster),
        "scanned_students": len(roster) - len(missing),
        "missing_students": len(missing),
        "students": missing,
    }

@router.get("/{template_id}/summary")
def get_assessment_summary(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = get_owned_template(
        template_id,
        current_user,
        db,
    )

    scans = (
        db.query(ScanResult)
        .filter(ScanResult.template_id == template_id)
        .all()
    )

    if not scans:
        return {
            "assessment": template.name,
            "average": 0,
            "highest": 0,
            "lowest": 0,
            "total_scans": 0,
        }

    scores = [scan.score for scan in scans]

    return {
        "assessment": template.name,
        "average": round(sum(scores) / len(scores), 2),
        "highest": max(scores),
        "lowest": min(scores),
        "total_scans": len(scans),
    }