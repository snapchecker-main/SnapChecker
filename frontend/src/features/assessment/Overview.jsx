import { useEffect, useState } from "react";
import { scannerApi } from "../../api/services/scannerApi";
import Card from "../../components/common/Card";
import SecondaryButton from "../../components/common/SecondaryButton";
import EmptyState from "../../components/common/EmptyState";
import Modal from "../../components/common/Modal";
import StatCard from "../../components/common/StatCard";

export default function Overview({ templateId }) {
  const [overview, setOverview] = useState(null);
  const [showAnswerKey, setShowAnswerKey] = useState(false);

  async function fetchOverview() {
    try {
      const data = await scannerApi.getOverview(templateId);
      setOverview(data);
    } catch (err) {}
  }

  useEffect(() => {
    if (!templateId) return;
    setOverview(null);
    fetchOverview();
  }, [templateId]);

  if (!overview) {
    return (
      <EmptyState
        icon=""
        title="Loading Assessment"
        description="Fetching assessment overview..."
      />
    );
  }

  const hasScannedPapers = overview.progress.scanned_students > 0;

  // Pulling the exact raw scores from the backend payload
  const avgScore = overview.performance.average_raw ?? 0;
  const highScore = overview.performance.highest_raw ?? 0;
  const lowScore = overview.performance.lowest_raw ?? 0;

  return (
    <>
      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-gray-200 bg-white lg:grid-cols-5">
        <StatCard
          title="Average"
          value={avgScore}
          color="primary"
          subtitle="score / students"
        />
        <StatCard
          title="Highest"
          value={highScore}
          color="neutral"
          subtitle="score"
        />
        <StatCard
          title="Lowest"
          value={lowScore}
          color="neutral"
          subtitle="score"
        />
        <StatCard
          title="Completion"
          value={`${overview.progress.scanned_students} / ${overview.progress.total_students}`}
          subtitle="graded students"
        />
        <StatCard
          title="Need Review"
          value={overview.progress.needs_review}
          subtitle="scan issues"
        />
      </div>

      <Card padding="none" className="mt-5">
        <div className="flex min-h-14 items-center justify-between gap-3 border-b border-gray-100 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Answer key manager
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              {overview.assessment.num_items} items ·{" "}
              {overview.assessment.exam_type}
            </p>
          </div>
        </div>
        <div className="space-y-3 p-5">
          <div className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 px-3 py-2.5">
            <div>
              <p className="text-xs font-semibold text-gray-800">
                {overview.assessment.name}
              </p>
              <p className="mt-0.5 text-[11px] text-gray-500">
                {overview.assessment.num_choices} choices per item
              </p>
            </div>
            <SecondaryButton onClick={() => setShowAnswerKey(true)}>
              Preview Key
            </SecondaryButton>
          </div>
        </div>
      </Card>

      {!hasScannedPapers && (
        <Card padding="none" className="mt-5 p-10">
          <EmptyState
            icon=""
            title="No Graded Papers Yet"
            description="Switch to the Grade Papers tab to start scanning answer sheets."
          />
        </Card>
      )}

      <Modal
        open={showAnswerKey}
        title="Answer Key"
        onClose={() => setShowAnswerKey(false)}
        width="500px"
      >
        <div className="overflow-hidden rounded-md border border-gray-200">
          <table className="w-full border-collapse text-left text-sm">
            <thead className="bg-gray-50/60">
              <tr>
                <th className="border-b border-gray-100 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Item
                </th>
                <th className="border-b border-gray-100 px-4 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                  Answer
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {overview.assessment.answer_key.map((answer, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-4 py-2.5 text-xs font-medium text-gray-600">
                    {index + 1}
                  </td>
                  <td className="px-4 py-2.5 text-sm font-semibold text-gray-900">
                    {answer}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Modal>
    </>
  );
}
