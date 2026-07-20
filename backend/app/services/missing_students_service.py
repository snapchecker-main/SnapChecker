from sqlalchemy.orm import Session

from app.models.schema import (
    Masterlist,
    ScanResult,
    AnswerSheetTemplate,
)


class MissingStudentsService:
    """
    Determines which students in the roster
    have not yet submitted a scan
    for a particular assessment.
    """

    @staticmethod
    def build(
        db: Session,
        template_id: int,
    ):

        template = (
            db.query(AnswerSheetTemplate)
            .filter(
                AnswerSheetTemplate.id == template_id
            )
            .first()
        )

        if not template:
            return []

        roster = (
            db.query(Masterlist)
            .filter(
                Masterlist.classroom_id == template.classroom_id
            )
            .all()
        )

        scanned_ids = {
            scan.detected_student_id
            for scan in (
                db.query(ScanResult)
                .filter(
                    ScanResult.template_id == template_id
                )
                .all()
            )
            if scan.detected_student_id
        }

        missing = [
            student
            for student in roster
            if student.student_id not in scanned_ids
        ]

        return {
            "total_students": len(roster),
            "scanned_students": len(scanned_ids),
            "missing_students": len(missing),
            "students": [
                {
                    "student_id": student.student_id,
                    "student_name": student.student_name,
                }
                for student in missing
            ],
        }