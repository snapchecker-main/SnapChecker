from typing import List


class ItemAnalysisService:
	"""
	Responsible ONLY for transforming ScanResult records
	into item analysis statistics.

	No FastAPI.
	No React.
	No HTTP.
	"""

	@staticmethod
	def build(scans: List):
		valid_scan_count = 0
		item_totals = {}

		for scan in scans:
			if scan.needs_review:
				continue

			item_results = scan.item_results_json or []
			if not item_results:
				continue

			valid_scan_count += 1

			for item in item_results:
				item_number = item.get("number", item.get("item_number"))
				if item_number is None:
					continue

				item_data = item_totals.setdefault(item_number, {
					"item_number": item_number,
					"correct_answer": item.get("correct_answer"),
					"correct_count": 0,
				})

				if not item_data.get("correct_answer") and item.get("correct_answer"):
					item_data["correct_answer"] = item.get("correct_answer")

				if item.get("is_correct"):
					item_data["correct_count"] += 1

		total_valid_scans = valid_scan_count

		items = []
		for item_number in sorted(item_totals.keys()):
			item_data = item_totals[item_number]
			correct_count = item_data["correct_count"]
			correct_percentage = round(
				(correct_count / total_valid_scans) * 100,
				1,
			) if total_valid_scans else 0

			items.append({
				"item_number": item_data["item_number"],
				"correct_answer": item_data["correct_answer"],
				"correct_count": correct_count,
				"correct_percentage": correct_percentage,
			})

		return {
			"summary": {
				"valid_scans": total_valid_scans,
			},
			"items": items,
		}
