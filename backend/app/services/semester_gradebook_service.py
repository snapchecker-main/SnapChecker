class SemesterGradebookService:

    @staticmethod
    def build(
        roster,
        templates,
        scans,
    ):
        scan_lookup = {}

        for scan in scans:
            if scan.needs_review:
                continue

            scan_lookup[
                (
                    scan.detected_student_id,
                    scan.template_id,
                )
            ] = scan

        records = []

        for student in roster:

            row = {
                "student_id": student.student_id,
                "student_name": student.student_name,
                "assessments": {},
            }

            total_score = 0
            total_items = 0

            for template in templates:

                scan = scan_lookup.get(
                    (
                        student.student_id,
                        template.id,
                    )
                )

                if scan:

                    row["assessments"][template.id] = {
                        "score": scan.score,
                        "total_items": scan.total_items,
                    }

                    total_score += scan.score
                    total_items += scan.total_items

                else:

                    row["assessments"][template.id] = None

            row["overall"] = (
                round((total_score / total_items) * 100, 1)
                if total_items
                else None
            )

            records.append(row)

        return {
            "assessments": [
                {
                    "id": t.id,
                    "name": t.name,
                }
                for t in templates
            ],
            "records": records,
        }