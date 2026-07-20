import { useEffect, useState } from "react";
import { gradebookApi } from "../../api/services/gradebookApi";
import { downloadCSV } from "../../utils/csvExport";

import Card from "../../components/common/Card";
import EmptyState from "../../components/common/EmptyState";
import SecondaryButton from "../../components/common/SecondaryButton";
import { Download } from "lucide-react";

export default function SemesterGradebook({ classroomId }) {
  const [gradebook, setGradebook] = useState(null);

  async function fetchGradebook() {
    try {
      const data = await gradebookApi.getSemester(classroomId);
      setGradebook(data);
    } catch (err) {}
  }

  useEffect(() => {
    if (!classroomId) return;
    fetchGradebook();
  }, [classroomId]);

  const handleExport = () => {
    if (!gradebook) return;

    const headers = [
      "Student ID",
      "Student Name",
      ...gradebook.assessments.map((a) => a.name),
    ];

    const rows = gradebook.records.map((student) => {
      const row = [student.student_id || "N/A", student.student_name];

      gradebook.assessments.forEach((a) => {
        const assessmentRecord = student.assessments[a.id];
        if (assessmentRecord) {
          row.push(assessmentRecord.score); // <--- Just the raw number
        } else {
          row.push("—");
        }
      });
      return row;
    });

    downloadCSV("semester_gradebook", headers, rows);
  };

  if (!classroomId) {
    return (
      <EmptyState
        icon=""
        title="No Classroom Selected"
        description="Select a classroom to view the semester gradebook."
      />
    );
  }

  if (!gradebook) {
    return (
      <EmptyState
        icon=""
        title="Loading Semester Gradebook"
        description="Fetching semester records..."
      />
    );
  }

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mt-1 text-xs text-gray-500">
            Raw scores of all created assessments by class.
          </p>
        </div>
        <SecondaryButton onClick={handleExport}>
          <Download size={14} /> Export results
        </SecondaryButton>
      </div>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left">
            <thead className="border-b border-gray-100 bg-gray-50/60">
              <tr>
                <th className="sticky left-0 bg-gray-50/60 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 shadow-[1px_0_0_0_#f3f4f6]">
                  Student
                </th>
                {gradebook.assessments.map((assessment) => (
                  <th
                    key={assessment.id}
                    className="px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                  >
                    {assessment.name}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {gradebook.records.map((student) => (
                <tr key={student.student_id} className="hover:bg-gray-50">
                  <td className="sticky left-0 bg-white px-5 py-3 shadow-[1px_0_0_0_#f3f4f6]">
                    <p className="text-sm font-medium text-gray-900">
                      {student.student_name}
                    </p>
                    <p className="mt-0.5 text-[11px] text-gray-500">
                      {student.student_id}
                    </p>
                  </td>

                  {gradebook.assessments.map((assessment) => (
                    <td key={assessment.id} className="px-5 py-3">
                      {student.assessments[assessment.id] ? (
                        <p className="text-sm font-semibold text-gray-900">
                          {student.assessments[assessment.id].score} /{" "}
                          {student.assessments[assessment.id].total_items}
                        </p>
                      ) : (
                        <>
                          <p className="text-sm font-medium text-gray-400">
                            Pending
                          </p>
                          <p className="mt-0.5 text-[11px] text-gray-400">—</p>
                        </>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
