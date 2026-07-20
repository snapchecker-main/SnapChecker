from typing import List, Optional


class GradingService:
    """
    Responsible ONLY for grading detected answers.

    No OpenCV.
    No FastAPI.
    No database.
    """

    @staticmethod
    def grade(
        detected_answers: List[Optional[str]],
        answer_key: List[str],
    ):
        score = 0
        item_results = []

        for index, (answer, correct) in enumerate(
            zip(detected_answers, answer_key)
        ):

            is_correct = answer == correct

            if is_correct:
                score += 1

            item_results.append({
                "number": index + 1,
                "detected_answer": answer if answer else "",
                "correct_answer": correct,
                "is_correct": is_correct,
            })

        return {
            "score": score,
            "item_results": item_results,
        }