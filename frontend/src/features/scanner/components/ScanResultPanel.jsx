import { useState } from "react";
import Input from "../../../components/common/Input";

export default function ScanResultPanel({
  scanResult,
  anomalies,
  manualScore,
  setManualScore,
  handleScoreOverride,
  isUpdatingScore,
  // NEW PROPS FOR IDENTITY RESOLUTION
  assignableStudents = [],
  onAssignStudent,
  isAssigning,
}) {
  const [selectedStudentId, setSelectedStudentId] = useState("");

  if (!scanResult) return null;

  // Determine if this paper is flagged specifically for an identity issue
  const isIdentityIssue =
    scanResult.needs_review &&
    (scanResult.matched_student_name?.startsWith("Unknown") ||
      scanResult.matched_student_name?.startsWith("Unreadable") ||
      scanResult.error_flag === "Duplicate ID");

  if (!isIdentityIssue && anomalies.length === 0) return null;

  return (
    <div className="rounded-md border border-amber-200 bg-amber-50 p-4 mb-5">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-base">⚠️</span>
        <h4 className="text-sm font-bold text-amber-800">
          Manual Review Required
        </h4>
      </div>

      {/* IDENTITY RESOLUTION SECTION */}
      {isIdentityIssue && (
        <div className="mb-4 rounded bg-white p-3 border border-amber-100 shadow-sm">
          <p className="mb-2 text-xs font-semibold text-amber-900">
            Identity Conflict Detected
          </p>
          <p className="mb-3 text-xs text-amber-800/80">
            The scanner could not verify this student's ID, or this ID was
            already used. Check the handwritten name on the paper and assign it
            to the correct student.
          </p>

          <div className="flex items-center gap-3">
            <select
              className="flex-1 rounded-md border border-gray-300 p-1.5 text-xs focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}
            >
              <option value="">-- Select Student from Roster --</option>
              {assignableStudents.map((student) => (
                <option key={student.student_id} value={student.student_id}>
                  {student.student_name} ({student.student_id})
                </option>
              ))}
            </select>

            <button
              onClick={() => onAssignStudent(selectedStudentId)}
              disabled={!selectedStudentId || isAssigning}
              className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-amber-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isAssigning ? "Saving..." : "Assign Student"}
            </button>
          </div>
        </div>
      )}

      {/* GRADING AMBIGUITIES SECTION */}
      {anomalies.length > 0 && (
        <div className="rounded bg-white p-3 border border-amber-100 shadow-sm">
          <p className="mb-2 text-xs font-semibold text-amber-900">
            Unusual Fills ({anomalies.length})
          </p>
          <ul className="mb-4 list-inside list-disc space-y-1 text-xs text-amber-800/90">
            {anomalies.map((item) => (
              <li key={item.number}>
                <strong className="font-medium">Item #{item.number}</strong>
                {" : "}
                {item.detected_answer === ""
                  ? "Left Blank"
                  : "Multiple Answers"}
              </li>
            ))}
          </ul>

          <form
            onSubmit={handleScoreOverride}
            className="flex items-center gap-3 border-t border-gray-100 pt-3"
          >
            <label className="text-xs font-medium text-amber-900">
              Override Score:
            </label>
            <Input
              type="number"
              min="0"
              max={scanResult.total_items}
              value={manualScore}
              onChange={(e) => setManualScore(e.target.value)}
              className="w-20 bg-gray-50 text-center py-1"
            />
            <button
              type="submit"
              disabled={isUpdatingScore}
              className="rounded-md bg-gray-800 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isUpdatingScore ? "Saving..." : "Update Score"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
