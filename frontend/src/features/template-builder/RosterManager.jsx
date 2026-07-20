import { useState, useEffect, useCallback, useRef } from "react";
import api from "../../api/client";
import { downloadCSV } from "../../utils/csvExport";
import toast from "react-hot-toast";
import Papa from "papaparse";

import Card from "../../components/common/Card";
import PrimaryButton from "../../components/common/PrimaryButton";
import SecondaryButton from "../../components/common/SecondaryButton";
import Input from "../../components/common/Input";
import EmptyState from "../../components/common/EmptyState";
import { Download, Search, Upload, UserPlus } from "lucide-react";
import Select from "../../components/common/Select";

export default function RosterManager({ classroomId }) {
  const [students, setStudents] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("Alphabetical (A–Z)");
  const [formData, setFormData] = useState({
    student_name: "",
    student_id: "",
  });
  const [isAdding, setIsAdding] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    student_name: "",
    student_id: "",
  });

  const fetchRoster = useCallback(async () => {
    if (!classroomId) return;
    try {
      const { data } = await api.get(`/roster/class/${classroomId}`);
      setStudents(data);
    } catch {
      // Error toast handled globally by Axios interceptor.
    }
  }, [classroomId]);

  useEffect(() => {
    fetchRoster();
  }, [fetchRoster]);

  const handleExport = () => {
    const headers = ["Student ID", "Name"];
    const rows = filteredAndSorted.map((s) => [s.student_id || "—", s.name]);
    downloadCSV("class_roster", headers, rows);
  };

  async function handleAddStudent(e) {
    e.preventDefault();
    setIsAdding(true);
    try {
      await api.post(`/roster/class/${classroomId}`, formData);
      setFormData({ student_name: "", student_id: "" });
      await fetchRoster();
      toast.success("Student added successfully!"); // Optional: Success feedback
    } catch (error) {
    } finally {
      setIsAdding(false);
    }
  }

  const normalizeStudentId = (id) => (id || "").replace(/\D/g, "");

  function handleFileUpload(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,

      complete: async ({ data }) => {
        const bulkData = [];

        let imported = 0;
        let duplicateIds = 0;
        let missingIds = 0;
        let missingNames = 0;

        const seenIds = new Set();

        for (const row of data) {
          // Normalize all CSV headers (trim + lowercase)
          const normalizedRow = {};

          Object.entries(row).forEach(([key, value]) => {
            normalizedRow[key.trim().toLowerCase()] = value;
          });

          const studentName = (
            normalizedRow["student name"] ??
            normalizedRow["name"] ??
            normalizedRow["full name"] ??
            ""
          ).trim();

          const studentId = normalizeStudentId(
            normalizedRow["student id"] ??
              normalizedRow["id"] ??
              normalizedRow["student number"] ??
              "",
          );

          if (!studentName) {
            missingNames++;
            continue;
          }

          if (!studentId) {
            missingIds++;
          }

          if (studentId && seenIds.has(studentId)) {
            duplicateIds++;
          }

          if (studentId) {
            seenIds.add(studentId);
          }

          bulkData.push({
            student_name: studentName,
            student_id: studentId,
          });

          imported++;
        }

        if (bulkData.length === 0) {
          toast.error("No valid CSV data found.");
          setIsUploading(false);
          return;
        }

        try {
          await api.post(`/roster/bulk/class/${classroomId}`, bulkData);
          await fetchRoster();

          let message = `Imported ${imported} students.`;

          const warnings = [];

          if (duplicateIds)
            warnings.push(`• ${duplicateIds} duplicate Student ID(s).`);

          if (missingIds)
            warnings.push(`• ${missingIds} student(s) without a Student ID.`);

          if (missingNames)
            warnings.push(
              `• ${missingNames} row(s) skipped because no student name was found.`,
            );

          if (warnings.length) {
            message += "\n\nWarnings:\n" + warnings.join("\n");
          }

          toast.success(message);
        } finally {
          setIsUploading(false);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        }
      },

      error() {
        toast.error("Unable to read CSV file.");
        setIsUploading(false);
      },
    });
  }

  async function handleDelete(studentId) {
    if (!window.confirm("Remove this student?")) return;
    try {
      await api.delete(`/roster/student/${studentId}`);
      await fetchRoster();
      toast.success("Student removed.");
    } catch (error) {
      // Handle error
    }
  }

  async function handleClearRoster() {
    if (
      !window.confirm(
        "Delete the entire roster?\n\nThis will permanently remove every student in this classroom.",
      )
    )
      return;

    try {
      await api.delete(`/roster/class/${classroomId}`);
      await fetchRoster();
      toast.success("Roster cleared.");
    } catch {
      // Error toast handled globally by Axios interceptor.
    }
  }

  function startEditing(student) {
    setEditingId(student.id);
    setEditForm({
      student_name: student.name,
      student_id: student.student_id || "",
    });
  }

  async function saveEdit(studentId) {
    try {
      await api.put(`/roster/student/${studentId}`, editForm);
      setEditingId(null);
      await fetchRoster();
      toast.success("Student updated.");
    } catch (error) {
      // Handle error
    }
  }

  if (!classroomId) return null;

  const filteredAndSorted = students
    .filter((s) =>
      `${s.name} ${s.student_id}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) => {
      if (sort.includes("Z–A")) return b.name.localeCompare(a.name);
      return a.name.localeCompare(b.name);
    });

  return (
    <div className="mx-auto max-w-7xl space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mt-1 text-xs text-gray-500">
            {students.length} enrolled students
          </p>
        </div>
        <div className="flex gap-2">
          <SecondaryButton onClick={handleExport}>
            <Download size={14} /> Export
          </SecondaryButton>
          <input
            type="file"
            accept=".csv"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
          />

          <SecondaryButton
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
          >
            <Upload size={14} /> {isUploading ? "..." : "Upload CSV"}
          </SecondaryButton>
          <SecondaryButton
            onClick={handleClearRoster}
            disabled={students.length === 0}
            className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
          >
            Clear Roster
          </SecondaryButton>
        </div>
      </div>

      <Card padding="none">
        <div className="flex flex-col gap-2 border-b border-gray-100 p-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-8"
              placeholder="Search name or student ID"
            />
          </div>
          <Select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full lg:w-48"
          >
            <option>Alphabetical (A–Z)</option>
            <option>Alphabetical (Z–A)</option>
          </Select>

          <div className="h-px w-full bg-gray-200 lg:h-9 lg:w-px" />

          <form onSubmit={handleAddStudent} className="flex flex-1 gap-2">
            <Input
              required
              placeholder="New student name"
              value={formData.student_name}
              onChange={(e) =>
                setFormData({ ...formData, student_name: e.target.value })
              }
            />
            <Input
              placeholder="ID (e.g. 01)"
              value={formData.student_id}
              onChange={(e) =>
                setFormData({ ...formData, student_id: e.target.value })
              }
            />
            <PrimaryButton type="submit" disabled={isAdding}>
              <UserPlus size={14} /> Add
            </PrimaryButton>
          </form>
        </div>

        <div className="overflow-x-auto">
          {students.length === 0 ? (
            <div className="p-10">
              <EmptyState
                icon=""
                title="No Students Yet"
                description="Add students manually or import a CSV roster above."
              />
            </div>
          ) : (
            <table className="w-full min-w-[1200px] text-left">
              <thead className="bg-gray-50/60">
                <tr>
                  <th className="border-b border-gray-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Student ID
                  </th>
                  <th className="border-b border-gray-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500">
                    Name
                  </th>
                  <th className="border-b border-gray-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredAndSorted.map((student) => (
                  <tr key={student.id} className="hover:bg-gray-50">
                    {editingId === student.id ? (
                      <>
                        <td className="px-5 py-2">
                          <Input
                            value={editForm.student_id}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                student_id: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="px-5 py-2">
                          <Input
                            value={editForm.student_name}
                            onChange={(e) =>
                              setEditForm({
                                ...editForm,
                                student_name: e.target.value,
                              })
                            }
                          />
                        </td>
                        <td className="px-5 py-2 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => saveEdit(student.id)}
                              className="text-xs font-semibold text-primary hover:underline"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="text-xs font-medium text-gray-500 hover:underline"
                            >
                              Cancel
                            </button>
                          </div>
                        </td>
                      </>
                    ) : (
                      <>
                        <td className="px-5 py-3 text-xs font-medium text-gray-600">
                          {student.student_id || "—"}
                        </td>
                        <td className="px-5 py-3 text-sm font-medium text-gray-900">
                          {student.name}
                        </td>
                        <td className="px-5 py-3 text-right">
                          <div className="flex justify-end gap-3">
                            <button
                              onClick={() => startEditing(student)}
                              className="text-xs font-semibold text-primary hover:underline"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDelete(student.id)}
                              className="text-xs font-medium text-red-600 hover:underline"
                            >
                              Remove
                            </button>
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Card>
    </div>
  );
}
