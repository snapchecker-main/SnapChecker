from typing import List


class OverviewService:
    """
    Responsible ONLY for transforming assessment,
    roster, and ScanResult records into
    overview statistics.

    No FastAPI.
    No React.
    No HTTP.
    """

    @staticmethod
    def build(
        template,
        roster: List,
        scans: List,
    ):
        answer_key = getattr(template, "answer_key", None)
        if answer_key is None:
            answer_key = getattr(template, "answer_key_json", []) or []

        assessment = {
            "name": template.name,
            "exam_type": template.exam_type,
            "num_items": template.num_items,
            "num_choices": template.num_choices,
            "answer_key": answer_key,
            "answer_key_completed": len(answer_key),
        }

        total_students = len(roster)

        # Keep only one valid scan per student
        matched_scans = {}

        for scan in scans:

            if scan.needs_review:
                continue

            matched_scans[scan.detected_student_id] = scan

        valid_scans = list(matched_scans.values())

        needs_review_count = sum(
            1
            for scan in scans
            if scan.needs_review
        )

        scanned_students = len(valid_scans)

        missing_students = max(
            total_students - scanned_students,
            0,
        )

        completion_percentage = (
            round(
                (scanned_students / total_students) * 100,
                1,
            )
            if total_students
            else 0
        )

        progress = {
            "total_students": total_students,
            "scanned_students": scanned_students,
            "missing_students": missing_students,
            "needs_review": needs_review_count,
            "completion_percentage": completion_percentage,
        }

        if valid_scans:

            average_raw = round(
                sum(scan.score for scan in valid_scans)
                / len(valid_scans),
                1,
            )

            highest_raw = max(
                scan.score
                for scan in valid_scans
            )

            lowest_raw = min(
                scan.score
                for scan in valid_scans
            )

            total_items = valid_scans[0].total_items

            performance = {
                "average_raw": average_raw,
                "average_percentage": round(
                    (average_raw / total_items) * 100,
                    1,
                ),
                "highest_raw": highest_raw,
                "highest_percentage": round(
                    (highest_raw / total_items) * 100,
                    1,
                ),
                "lowest_raw": lowest_raw,
                "lowest_percentage": round(
                    (lowest_raw / total_items) * 100,
                    1,
                ),
            }

        else:

            performance = {
                "average_raw": 0,
                "average_percentage": 0,
                "highest_raw": 0,
                "highest_percentage": 0,
                "lowest_raw": 0,
                "lowest_percentage": 0,
            }

        return {
            "assessment": assessment,
            "progress": progress,
            "performance": performance,
        }