import cv2
from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends, Request
from sqlalchemy.orm import Session
import json
from app.services.coordinate_generator import CoordinateGenerator
from app.services.vision import VisionEngine
from app.database import get_db
from app.models.schema import ScanResult, AnswerSheetTemplate, Masterlist
from app.services.grading_service import GradingService
from app.services.student_matching_service import StudentMatchingService
from app.services.gradebook_service import GradebookService
from app.services.missing_students_service import MissingStudentsService
from app.services.item_analysis_service import ItemAnalysisService
from app.services.overview_service import OverviewService
from app.models.schema import User, Classroom
from app.security.dependencies import get_current_user
from app.services.cloudinary_service import CloudinaryService
from app.security.limiter import limiter

router = APIRouter(prefix="/api/scans", tags=["Scanner"])

def get_owned_scan(
    scan_id: int,
    current_user: User,
    db: Session,
) -> ScanResult:

    scan = (
        db.query(ScanResult)
        .join(
            AnswerSheetTemplate,
            ScanResult.template_id == AnswerSheetTemplate.id,
        )
        .join(
            Classroom,
            AnswerSheetTemplate.classroom_id == Classroom.id,
        )
        .filter(
            ScanResult.id == scan_id,
            Classroom.owner_id == current_user.id,
        )
        .first()
    )

    if scan is None:
        raise HTTPException(
            status_code=404,
            detail="Scan not found.",
        )

    return scan


@router.post("/")
@limiter.limit("200/minute")
async def scan_sheet(
    request: Request,
    file: UploadFile = File(...),
    test_info: str = Form(...),
    answer_key: str = Form(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        # 1. Parse the incoming JSON data from React
        parsed_test_info = json.loads(test_info)
        parsed_answer_key = json.loads(answer_key)
        template_id = parsed_test_info.get("template_id")
        
        template = (
            db.query(AnswerSheetTemplate)
            .join(Classroom, AnswerSheetTemplate.classroom_id == Classroom.id)
            .filter(AnswerSheetTemplate.id == template_id, Classroom.owner_id == current_user.id)
            .first()
        )

        if template is None:
            raise HTTPException(status_code=404, detail="Template not found.")
            
        layout_info = template.layout_data.get("layout", {})
        paper_w = int(layout_info.get("width", 595)) 
        paper_h = int(layout_info.get("height", 842))
        
        num_items = int(parsed_test_info.get("num_items", 0))
        num_choices = int(parsed_test_info.get("num_choices", 0))
        sensitivity = parsed_test_info.get("scan_sensitivity", "pencil")

    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid payload: {str(e)}")

    # 2. Read the raw image bytes
    image_bytes = await file.read()

    try:
        # 3. Run the Vision Engine FIRST to flatten and crop the image
        img = VisionEngine.preprocess_image(image_bytes, paper_w, paper_h)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    # 4. Save the CROPPED, flat image to a temporary file
    import tempfile
    with tempfile.NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        cv2.imwrite(temp_file.name, img)
        temp_path = temp_file.name
    
    upload = None

    try:
        # 5. Upload the CROPPED image to Cloudinary
        upload = CloudinaryService.upload_image(temp_path)
        original_image_url = upload["url"]
        cloudinary_public_id = upload["public_id"]

        # 6. Roster Grid Extraction (2 columns, 10 rows for 0-9)
        roster_coords = CoordinateGenerator.roster_grid(template.layout_data)

        # Detect roster digits using custom numeric labels 0-9
        roster_digits = VisionEngine.detect_bubbles(
            img, roster_coords, 10, sensitivity, custom_labels=[str(d) for d in range(10)]
        )
        
        # Process the extracted digit tokens into a coherent identifier string
        roster_num_str = "".join([str(d) for d in roster_digits if d is not None])
        student = StudentMatchingService.match_student(
            db=db,
            template_id=template_id,
            roster_number=roster_num_str,
        )
        matched_student_name = student["student_name"]
        matched_student_id = student["student_id"]
                
        # 7. Main Answer Grid Coordinates
        bubble_coords = CoordinateGenerator.answer_grid(
            template.layout_data,
            num_items,
            num_choices,
        )

        # 8. Execute OMR Engine & Grade Test
        answers = VisionEngine.detect_bubbles(img, bubble_coords, num_choices, sensitivity)

        grading = GradingService.grade(
            answers,
            parsed_answer_key,
        )

        score = grading["score"]
        item_results = grading["item_results"]

        annotations = VisionEngine.annotate_image(
            img,
            bubble_coords,
            answers,
            parsed_answer_key,
        )

        needs_review = (
            matched_student_name.startswith("Unknown")
            or matched_student_name.startswith("Unreadable")
        )

        if matched_student_id and not needs_review:
            existing_scan = (
                db.query(ScanResult)
                .filter(
                    ScanResult.template_id == template_id,
                    ScanResult.detected_student_id == matched_student_id
                )
                .first()
            )
            
            if existing_scan:
                existing_scan.needs_review = True
                needs_review = True

        db_scan = ScanResult(
            template_id=template_id,
            detected_student_id=matched_student_id,
            matched_student_name=matched_student_name,
            score=score,
            total_items=num_items,
            student_answers_json=answers,
            item_results_json=item_results,
            original_image_url=original_image_url,
            cloudinary_public_id=cloudinary_public_id,
            annotations_json=annotations,
            needs_review=needs_review,
        )
        
        if hasattr(db_scan, 'matched_student_name'):
            setattr(db_scan, 'matched_student_name', matched_student_name)

        db.add(db_scan)
        db.commit()

    except Exception as e:
        db.rollback()

        if upload is not None:
            CloudinaryService.delete_image(
                upload["public_id"],
            )
        raise
    finally:
        import os

        if os.path.exists(temp_path):
            os.remove(temp_path)

    db.refresh(db_scan)

    # 10. Return payload matching frontend data models exactly
    return {
        "scan_id": db_scan.id,
        "file_name": file.filename,
        "score": score,
        "total_items": num_items,
        "item_results": item_results,
        "matched_student_name": matched_student_name,
        "original_image_url": original_image_url,
        "annotations_json": annotations,
        "status": "success",
    }


@router.get("/classroom/{classroom_id}")
def get_classroom_scans(
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

    if classroom is None:
        raise HTTPException(
            status_code=404,
            detail="Classroom not found.",
        )
    
    scans = db.query(ScanResult)\
        .join(AnswerSheetTemplate)\
        .filter(AnswerSheetTemplate.classroom_id == classroom_id)\
        .order_by(ScanResult.created_at.desc())\
        .all()
    roster = (
        db.query(Masterlist)
        .filter(
            Masterlist.classroom_id == classroom_id
        )
        .order_by(Masterlist.student_name)
        .all()
    )
    return GradebookService.build(
        roster,
        scans,
    )


@router.get("/template/{template_id}")
def get_scans_for_template(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    
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
    
    scans = db.query(ScanResult).filter(ScanResult.template_id == template_id).all()
    return scans

@router.get("/template/{template_id}/missing")
def get_missing_students(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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
    
    return MissingStudentsService.build(
        db=db,
        template_id=template_id,
    )


@router.get("/{scan_id}/assignable-students")
def get_assignable_students(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = get_owned_scan(
        scan_id,
        current_user,
        db,
    )

    template = (
        db.query(AnswerSheetTemplate)
        .filter(
            AnswerSheetTemplate.id == scan.template_id
        )
        .first()
    )

    students = (
        db.query(Masterlist)
        .filter(
            Masterlist.classroom_id == template.classroom_id
        )
        .order_by(Masterlist.student_name)
        .all()
    )

    return [
        {
            "student_id": student.student_id,
            "student_name": student.student_name,
        }
        for student in students
    ]

@router.put("/{scan_id}/assign-student")
def assign_student(
    scan_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = get_owned_scan(
        scan_id,
        current_user,
        db,
    )

    template = (
        db.query(AnswerSheetTemplate)
        .filter(
            AnswerSheetTemplate.id == scan.template_id
        )
        .first()
    )

    student = (
        db.query(Masterlist)
        .filter(
            Masterlist.classroom_id == template.classroom_id,
            Masterlist.student_id == payload["student_id"],
        )
        .first()
    )

    if not student:
        raise HTTPException(
            status_code=404,
            detail="Student not found",
        )

    scan.detected_student_id = student.student_id
    scan.matched_student_name = student.student_name
    scan.needs_review = False

    db.commit()
    db.refresh(scan)

    return {
        "status": "success",
        "message": "Student assigned successfully.",
    }


@router.get("/template/{template_id}/item-analysis")
def get_item_analysis(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    scans = (
        db.query(ScanResult)
        .filter(
            ScanResult.template_id == template_id
        )
        .all()
    )

    return ItemAnalysisService.build(scans)

@router.get("/template/{template_id}/overview")
def get_assessment_overview(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    roster = (
        db.query(Masterlist)
        .filter(
            Masterlist.classroom_id == template.classroom_id
        )
        .all()
    )

    scans = (
        db.query(ScanResult)
        .filter(
            ScanResult.template_id == template_id
        )
        .all()
    )

    return OverviewService.build(
        template,
        roster,
        scans,
    )


@router.post("/template/{template_id}/regrade")
@limiter.limit("200/minute")
def regrade_assessment(
    request: Request,
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
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

    scans = (
        db.query(ScanResult)
        .filter(
            ScanResult.template_id == template_id
        )
        .all()
    )

    updated = 0

    for scan in scans:

        if scan.needs_review:
            continue
        
        if not scan.student_answers_json:
            continue

        grading = GradingService.grade(
            scan.student_answers_json,
            template.answer_key_json,
        )

        scan.score = grading["score"]
        scan.item_results_json = grading["item_results"]

        updated += 1

    db.commit()

    return {
        "message": f"Successfully regraded {updated} assessments using the latest answer key."
    }

@router.delete("/{scan_id}")
def delete_scan(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = get_owned_scan(
        scan_id,
        current_user,
        db,
    )
    
    if scan.cloudinary_public_id:
        CloudinaryService.delete_image(
            scan.cloudinary_public_id,
        )
        
    db.delete(scan)
    db.commit()
    return {"status": "success", "message": "Scan deleted permanently."}

@router.put("/{scan_id}/override")
def override_scan_score(
    scan_id: int,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = get_owned_scan(
        scan_id,
        current_user,
        db,
    )
    
    new_score = payload.get("score")
    if new_score is None:
        raise HTTPException(status_code=400, detail="Missing score in payload")
        
    try:
        new_score_int = int(new_score)
        if new_score_int < 0 or new_score_int > scan.total_items:
            raise ValueError()
    except ValueError:
        raise HTTPException(status_code=400, detail=f"Score must be an integer between 0 and {scan.total_items}")

    scan.score = new_score_int
    db.commit()
    db.refresh(scan)
    
    return {
        "status": "success", 
        "message": f"Score manually updated to {scan.score}/{scan.total_items}"
    }


@router.delete("/{scan_id}/image")
def delete_scan_image_only(
    scan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    scan = get_owned_scan(scan_id, current_user, db)
    
    if not scan.cloudinary_public_id:
        raise HTTPException(status_code=400, detail="No image file attached to this record.")
        
    CloudinaryService.delete_image(scan.cloudinary_public_id)
    
    scan.original_image_url = None
    scan.cloudinary_public_id = None
    scan.annotations_json = None
    
    db.commit()
    db.refresh(scan)
    return {"status": "success", "message": "Paper image deleted. Grade records preserved."}

@router.delete("/template/{template_id}/all")
def clear_all_assessment_records(
    template_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    template = (
        db.query(AnswerSheetTemplate)
        .join(Classroom, AnswerSheetTemplate.classroom_id == Classroom.id)
        .filter(AnswerSheetTemplate.id == template_id, Classroom.owner_id == current_user.id)
        .first()
    )
    if not template:
        raise HTTPException(status_code=404, detail="Assessment container not found.")

    scans = db.query(ScanResult).filter(ScanResult.template_id == template_id).all()
    
    deleted_images_count = 0
    for scan in scans:
        if scan.cloudinary_public_id:
            try:
                CloudinaryService.delete_image(scan.cloudinary_public_id)
                deleted_images_count += 1
            except Exception as e:
                print(f"Skipped Cloudinary delete for {scan.cloudinary_public_id}: {e}")
            
        db.delete(scan)
        
    db.commit()
    return {
        "status": "success",
        "message": f"Wiped assessment clean. Purged {len(scans)} grade records and {deleted_images_count} cloud images."
    }