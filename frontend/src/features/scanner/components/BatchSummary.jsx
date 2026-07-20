import Card from "../../../components/common/Card";

export default function BatchSummary({ batchSession, overview }) {
  if (batchSession.total <= 1) {
    return null;
  }

  return (
    <Card className="p-5">
      <h3 className="mb-1 text-sm font-semibold text-gray-900">
        Batch Scan Complete
      </h3>

      <p className="mb-5 text-xs text-gray-500">
        Successfully processed{" "}
        <strong className="font-medium text-gray-700">
          {batchSession.total}
        </strong>{" "}
        paper(s).
        {overview?.progress?.needs_review > 0 ? (
          <>
            {" "}
            <strong className="font-medium text-gray-700">
              {overview.progress.needs_review}
            </strong>{" "}
            paper(s) require manual review.
          </>
        ) : (
          <> All papers were graded successfully.</>
        )}
      </p>

      {overview && (
        <div className="grid grid-cols-[1fr_auto] gap-y-3 border-t border-gray-100 pt-4 text-xs">
          <span className="text-gray-500">Students</span>
          <span className="font-medium text-gray-900">
            {overview.progress.total_students}
          </span>

          <span className="text-gray-500">Successfully Graded</span>
          <span className="font-medium text-green-600">
            {overview.progress.scanned_students}
          </span>

          <span className="text-gray-500">Needs Review</span>
          <span className="font-medium text-amber-600">
            {overview.progress.needs_review}
          </span>

          <span className="text-gray-500">Missing</span>
          <span className="font-medium text-red-600">
            {overview.progress.missing_students}
          </span>

          <span className="text-gray-500">Completion</span>
          <span className="font-medium text-gray-900">
            {overview.progress.completion_percentage}%
          </span>
        </div>
      )}

      <div
        className={`mt-5 rounded bg-gray-50 px-3 py-2 text-xs font-semibold ${
          batchSession.failed === 0 ? "text-green-700" : "text-amber-700"
        }`}
      >
        {batchSession.failed === 0
          ? "✓ Batch completed successfully."
          : `⚠ ${batchSession.failed} paper(s) need attention.`}
      </div>
    </Card>
  );
}
