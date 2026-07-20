from typing import List


class GradebookService:
    """
    Responsible ONLY for transforming ScanResult records
    into Gradebook statistics.

    No FastAPI.
    No React.
    No HTTP.
    """

    @staticmethod
    def build(
        roster: List,
        scans: List,
    ):
        matched_scans = {}
        review_scans = []

        for scan in scans:
            if scan.needs_review:
                review_scans.append(scan)
                continue
            matched_scans[scan.detected_student_id] = scan

        records = []
        percentages = []

        for student in roster:
            scan = matched_scans.get(student.student_id)
            if scan:
                percentage = round(
                    (scan.score / scan.total_items) * 100
                )
                percentages.append(percentage)
                records.append({
                    "student_id": student.student_id,
                    "student_name": student.student_name,
                    "score": scan.score,
                    "total_items": scan.total_items,
                    "percentage": percentage,
                    "status": "Scanned",
                    "original_image_url": scan.original_image_url,
                    "annotations_json": scan.annotations_json,
                    "created_at": scan.created_at,
                    "scan_id": scan.id,
                })
            else:
                records.append({
                    "student_id": student.student_id,
                    "student_name": student.student_name,
                    "score": None,
                    "total_items": None,
                    "percentage": None,
                    "status": "Not Scanned",
                    "original_image_url": None,
                    "annotations_json": None,
                    "created_at": None,
                    "scan_id": None,
                })

        for scan in review_scans:
            records.append({
                "student_id": scan.detected_student_id or "—",
                "student_name": scan.matched_student_name,
                "score": scan.score,
                "total_items": scan.total_items,
                "percentage": round(
                    (scan.score / scan.total_items) * 100
                ),

                "status": "Needs Review",
                "original_image_url": scan.original_image_url,
                "annotations_json": scan.annotations_json,
                "created_at": scan.created_at,
                "scan_id": scan.id,
            })

        needs_review_count = len(review_scans)

        valid_scans = [
            scan
            for scan in matched_scans.values()
        ]

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

            summary = {
                "total_students": len(roster),
                "scanned_students": len(valid_scans),
                "missing_students": len(roster) - len(valid_scans),
                "needs_review": needs_review_count,

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

            summary = {
                "total_students": len(roster),
                "scanned_students": 0,
                "missing_students": len(roster),
                "needs_review": needs_review_count,

                "average_raw": 0,
                "average_percentage": 0,

                "highest_raw": 0,
                "highest_percentage": 0,

                "lowest_raw": 0,
                "lowest_percentage": 0,
            }
        return {
            "summary": summary,
            "records": records,
        }