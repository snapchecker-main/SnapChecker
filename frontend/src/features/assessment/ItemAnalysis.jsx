import { useEffect, useState } from "react";
import { scannerApi } from "../../api/services/scannerApi";
import { downloadCSV } from "../../utils/csvExport";

import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import { Download } from "lucide-react";
import SecondaryButton from "../../components/common/SecondaryButton";
import StatCard from "../../components/common/StatCard";

export default function ItemAnalysis({ templateId }) {
  const [analysis, setAnalysis] = useState(null);
  const [sortBy, setSortBy] = useState("item");

  async function fetchAnalysis() {
    try {
      const data = await scannerApi.getItemAnalysis(templateId);
      setAnalysis(data);
    } catch (err) {}
  }

  useEffect(() => {
    if (!templateId) return;
    fetchAnalysis();
  }, [templateId]);

  // --- EXPORT FUNCTION ---
  const handleExport = () => {
    if (!analysis) return;
    const headers = [
      "Item Number",
      "Correct Answer",
      "Number Correct",
      "Number Wrong",
      "Success Rate (%)",
      "Difficulty",
    ];

    const rows = sortedItems.map((item) => {
      const isHard = item.correct_percentage < 50;
      const isEasy = item.correct_percentage >= 90;
      let difficulty = "Moderate";
      if (isHard) difficulty = "Difficult";
      if (isEasy) difficulty = "Easy";

      return [
        item.item_number,
        item.correct_answer,
        item.correct_count,
        analysis.summary.valid_scans - item.correct_count,
        `${item.correct_percentage}%`,
        difficulty,
      ];
    });

    downloadCSV("item_analysis", headers, rows);
  };

  if (!analysis) {
    return (
      <EmptyState
        title="Loading Item Analysis"
        description="Analyzing assessment statistics..."
      />
    );
  }

  if (analysis.summary.valid_scans === 0) {
    return (
      <Card className="flex min-h-[300px] items-center justify-center p-10">
        <EmptyState
          title="No Item Analysis Available"
          description="Grade at least one paper to generate item statistics."
        />
      </Card>
    );
  }

  const sortedItems = [...analysis.items];

  switch (sortBy) {
    case "highest":
      sortedItems.sort((a, b) => b.correct_percentage - a.correct_percentage);
      break;
    case "lowest":
      sortedItems.sort((a, b) => a.correct_percentage - b.correct_percentage);
      break;
    default:
      sortedItems.sort((a, b) => a.item_number - b.item_number);
  }

  // Calculate summary stats
  const highMasteryCount = sortedItems.filter(
    (i) => i.correct_percentage >= 90,
  ).length;
  const needsReviewCount = sortedItems.filter(
    (i) => i.correct_percentage < 50,
  ).length;

  // Mathematically correct total success rate
  const totalCorrectAnswers = sortedItems.reduce(
    (acc, curr) => acc + curr.correct_count,
    0,
  );
  const totalPossibleAnswers =
    sortedItems.length * analysis.summary.valid_scans;
  const avgSuccess =
    Math.round((totalCorrectAnswers / totalPossibleAnswers) * 100) || 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-base font-semibold text-gray-900">
            Item analysis
          </h2>
          <p className="mt-1 text-xs text-gray-500">
            Based on {analysis.summary.valid_scans} valid scans.
          </p>
        </div>
        <SecondaryButton onClick={handleExport}>
          <Download size={14} /> Export results
        </SecondaryButton>
      </div>

      <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-gray-200 bg-white lg:grid-cols-4">
        {/* Changed 'label' to 'title' to fix the missing text issue */}
        <StatCard title="Items" value={sortedItems.length} color="primary" />
        <StatCard title="High mastery" value={highMasteryCount} />
        <StatCard title="Need review" value={needsReviewCount} />
        <StatCard title="Avg. success" value={`${avgSuccess}%`} />
      </div>

      <Card padding="none">
        <div className="flex items-center justify-between border-b border-gray-100 px-5 py-3">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">
              Per-item results
            </h2>
            <p className="mt-0.5 text-xs text-gray-500">
              Difficulty is based on the share of correct responses.
            </p>
          </div>
          <Select
            className="w-auto h-8"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="item">Sort: Item number</option>
            <option value="lowest">Sort: Success rate</option>
          </Select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left">
            <thead className="bg-gray-50/60">
              <tr>
                {[
                  "Item number",
                  "Correct answer",
                  "Number correct",
                  "Number wrong",
                  "Success rate",
                  "Difficulty",
                  "Insight",
                ].map((h) => (
                  <th
                    key={h}
                    className="border-b border-gray-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedItems.map((item) => {
                const isHard = item.correct_percentage < 50;
                const isEasy = item.correct_percentage >= 90;

                let difficulty = "Moderate";
                if (isHard) difficulty = "Difficult";
                if (isEasy) difficulty = "Easy";

                return (
                  <tr key={item.item_number} className="hover:bg-gray-50">
                    <td className="px-5 py-3 text-sm font-semibold text-gray-800">
                      {item.item_number}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                      {item.correct_answer}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      {item.correct_count}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-700">
                      {analysis.summary.valid_scans - item.correct_count}
                    </td>
                    <td
                      className={`px-5 py-3 text-sm font-semibold ${
                        isHard ? "text-red-600" : "text-gray-900"
                      }`}
                    >
                      {item.correct_percentage}%
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={
                          difficulty === "Easy"
                            ? "success"
                            : difficulty === "Difficult"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {difficulty}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {isHard ? (
                        <Badge variant="danger">Needs Review</Badge>
                      ) : isEasy ? (
                        <Badge variant="success">High Mastery</Badge>
                      ) : (
                        <span className="text-sm text-gray-300">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
