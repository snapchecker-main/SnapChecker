from sqlalchemy.orm import Session

from app.models.schema import (
    Masterlist,
    AnswerSheetTemplate,
)


class StudentMatchingService:
    """
    Responsible for matching a bubbled student ID
    to a student inside a classroom.
    """

    @staticmethod
    def match_student(
        db: Session,
        template_id: int,
        roster_number: str,
    ):

        if not roster_number:
            return {
                "student_name": "Unknown Student",
                "student_id": None,
            }

        try:

            parsed_id = str(int(roster_number))

            template = (
                db.query(AnswerSheetTemplate)
                .filter(
                    AnswerSheetTemplate.id == template_id
                )
                .first()
            )

            if not template:
                return {
                    "student_name": f"Template {template_id} Not Found",
                    "student_id": None,
                }

            student = (
                db.query(Masterlist)
                .filter(
                    Masterlist.classroom_id == template.classroom_id,
                    Masterlist.student_id == parsed_id,
                )
                .first()
            )

            if student:
                return {
                    "student_name": student.student_name,
                    "student_id": student.student_id,
                }

            return {
                "student_name": f"Unknown (Bubbled ID: {parsed_id})",
                "student_id": parsed_id,
            }

        except Exception:
            return {
                "student_name": f"Unreadable ID: {roster_number}",
                "student_id": None,
            }