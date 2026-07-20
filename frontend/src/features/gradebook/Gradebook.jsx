import { useEffect, useState } from "react";
import { gradebookApi } from "../../api/services/gradebookApi";
import api from "../../api/client";
import { downloadCSV } from "../../utils/csvExport";
import toast from "react-hot-toast";

import Card from "../../components/common/Card";
import Modal from "../../components/common/Modal";
import EmptyState from "../../components/common/EmptyState";
import AnnotationViewer from "../scanner/components/AnnotationViewer";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";
import Badge from "../../components/common/Badge";
import PrimaryButton from "../../components/common/PrimaryButton";
import SecondaryButton from "../../components/common/SecondaryButton";
import {
  CheckCircle2,
  Download,
  Search,
  Trash2,
  ImageMinus,
  AlertTriangle,
} from "lucide-react";

export default function Gradebook({ classroomId, onQuotaChange }) {
  const [scans, setScans] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [loading, setLoading] = useState(false);

  // Modals & Assignments
  const [selectedScan, setSelectedScan] = useState(null);
  const [assignableStudents, setAssignableStudents] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState("");
  const [newScore, setNewScore] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [summary, setSummary] = useState({
    total_students: 0,
    scanned_students: 0,
    missing_students: 0,
    highest_score: 0,
    lowest_score: 0,
    average_score: 0,
  });

  async function fetchScans() {
    if (!classroomId) return;
    setLoading(true);
    try {
      const data = await gradebookApi.get(classroomId);
      setSummary(data.summary);
      setScans(data.records);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!classroomId) return;
    fetchScans();
  }, [classroomId]);

  // --- SEAMLESS DELETION METHODS ---
  const handleDeleteRecord = async (scanId) => {
    if (
      !window.confirm(
        "Delete this record permanently? The grade and image will be lost.",
      )
    )
      return;
    try {
      setScans((prev) => prev.filter((s) => s.scan_id !== scanId));
      await api.delete(`/scans/${scanId}`);
      if (onQuotaChange) onQuotaChange();
    } catch (error) {
      fetchScans();
    }
  };

  const handleDeleteImage = async (scanId) => {
    if (!window.confirm("Delete the paper image? The grade will be kept."))
      return;
    try {
      setScans((prev) =>
        prev.map((s) =>
          s.scan_id === scanId ? { ...s, original_image_url: null } : s,
        ),
      );
      await api.delete(`/scans/${scanId}/image`);
      if (onQuotaChange) onQuotaChange();
    } catch (error) {
      fetchScans();
    }
  };

  const handleBulkDeleteImages = async () => {
    if (
      !window.confirm(
        "Are you sure? This will delete all paper images to free up space. Grades will NOT be affected.",
      )
    )
      return;
    setIsDeleting(true);
    try {
      const scansWithImages = scans.filter(
        (s) => s.original_image_url && s.scan_id,
      );
      await Promise.all(
        scansWithImages.map((s) => api.delete(`/scans/${s.scan_id}/image`)),
      );

      setScans((prev) => prev.map((s) => ({ ...s, original_image_url: null })));
      setIsBulkDeleteModalOpen(false);
      if (onQuotaChange) onQuotaChange();
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  const handleBulkDeleteRecords = async () => {
    if (
      !window.confirm(
        "WARNING: This will wipe out EVERY grade and image in this assessment. This cannot be undone.",
      )
    )
      return;
    setIsDeleting(true);
    try {
      const validScans = scans.filter((s) => s.scan_id);
      await Promise.all(
        validScans.map((s) => api.delete(`/scans/${s.scan_id}`)),
      );

      await fetchScans();
      setIsBulkDeleteModalOpen(false);
      if (onQuotaChange) onQuotaChange();
    } catch (error) {
    } finally {
      setIsDeleting(false);
    }
  };

  // --- NEW: SPLIT-PANE WORKSPACE ACTIONS ---
  const handleOpenReview = async (scan) => {
    setSelectedScan(scan);
    setNewScore(scan.score !== null ? scan.score : "");
    setSelectedStudent("");

    // Automatically fetch assignable students if it's flagged for review
    if (scan.status === "Needs Review") {
      try {
        const { data: students } = await api.get(
          `/scans/${scan.scan_id}/assignable-students`,
        );
        setAssignableStudents(students);
      } catch (err) {}
    }
  };

  const handleModalAssignStudent = async () => {
    if (!selectedStudent || !selectedScan) return;
    setIsUpdating(true);
    try {
      await api.put(`/scans/${selectedScan.scan_id}/assign-student`, {
        student_id: selectedStudent,
      });
      await fetchScans(); // Refresh table
      setSelectedScan(null); // Close modal on success
    } catch (error) {
    } finally {
      setIsUpdating(false);
    }
  };

  const handleModalOverrideScore = async () => {
    if (!selectedScan || newScore === "") return;
    setIsUpdating(true);
    try {
      await api.put(`/scans/${selectedScan.scan_id}/override`, {
        score: Number(newScore),
      });
      // Optimistically update the UI so they don't have to wait for fetch
      setScans((prev) =>
        prev.map((s) =>
          s.scan_id === selectedScan.scan_id
            ? { ...s, score: Number(newScore) }
            : s,
        ),
      );
      setSelectedScan((prev) => ({ ...prev, score: Number(newScore) }));
      toast.success("Score updated successfully!");
    } catch (error) {
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExport = () => {
    const headers = ["Student ID", "Student Name", "Raw Score", "Status"];
    const rows = processedScans.map((scan) => [
      scan.student_id || "N/A",
      scan.student_name || "Unknown",
      scan.score !== null ? scan.score : "—",
      scan.status === "Not Scanned" ? "Missing" : scan.status,
    ]);
    downloadCSV("assessment_gradebook", headers, rows);
  };

  if (!classroomId) return <EmptyState icon="" title="No Classroom" />;

  const processedScans = scans
    .filter((scan) => {
      const search = searchTerm.toLowerCase();
      const matchesSearch =
        scan.student_name.toLowerCase().includes(search) ||
        scan.student_id.toLowerCase().includes(search);
      const matchesStatus =
        statusFilter === "all" || scan.status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === "highest") {
        const scoreA = a.score !== null ? a.score : -1;
        const scoreB = b.score !== null ? b.score : -1;
        return scoreB - scoreA;
      }
      if (sortBy === "lowest") {
        const scoreA = a.score !== null ? a.score : 999999;
        const scoreB = b.score !== null ? b.score : 999999;
        return scoreA - scoreB;
      }
      return a.student_name.localeCompare(b.student_name);
    });

  return (
    <div className="space-y-4">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mt-1 text-xs text-gray-500">
            Raw scores by assessment.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <SecondaryButton onClick={() => setIsBulkDeleteModalOpen(true)}>
            <Trash2 size={14} className="text-red-500" /> Bulk Delete
          </SecondaryButton>
          <SecondaryButton onClick={handleExport}>
            <Download size={14} /> Export results
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
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
              placeholder="Search student name or ID"
            />
          </div>

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-9 w-auto text-xs"
          >
            <option value="name">Sort: Name (A-Z)</option>
            <option value="highest">Sort: Highest Score</option>
            <option value="lowest">Sort: Lowest Score</option>
          </Select>

          <div className="flex flex-wrap gap-1">
            {["all", "Scanned", "Not Scanned", "Needs Review"].map((f) => {
              const label =
                f === "all" ? "All" : f === "Not Scanned" ? "Missing" : f;
              return (
                <button
                  key={f}
                  onClick={() => setStatusFilter(f)}
                  className={`h-9 rounded-md px-3 text-xs font-medium transition ${
                    statusFilter === f
                      ? "bg-red-50 text-primary"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead className="bg-gray-50/60">
              <tr>
                {["Student ID", "Student", "Score", "Status", "Actions"].map(
                  (h) => (
                    <th
                      key={h}
                      className="border-b border-gray-100 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-gray-500"
                    >
                      {h}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <EmptyState icon="" title="Loading Gradebook" />
                  </td>
                </tr>
              ) : processedScans.length === 0 ? (
                <tr>
                  <td colSpan="6" className="p-10 text-center">
                    <EmptyState icon="" title="No results found" />
                  </td>
                </tr>
              ) : (
                processedScans.map((scan) => (
                  <tr
                    key={scan.scan_id ?? scan.student_id}
                    className={
                      scan.status === "Needs Review"
                        ? "bg-amber-50/40 hover:bg-amber-50/70"
                        : "hover:bg-gray-50"
                    }
                  >
                    <td className="px-5 py-3 text-xs text-gray-500">
                      {scan.student_id}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">
                      {scan.student_name}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                      {scan.score !== null
                        ? `${scan.score} / ${scan.total_items}`
                        : "—"}
                    </td>
                    <td className="px-5 py-3">
                      <Badge
                        variant={
                          scan.status === "Scanned"
                            ? "success"
                            : scan.status === "Needs Review"
                              ? "warning"
                              : "neutral"
                        }
                      >
                        {scan.status === "Not Scanned"
                          ? "Missing"
                          : scan.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-3">
                      {scan.scan_id ? (
                        <div className="flex flex-wrap items-center gap-3">
                          <button
                            className={`text-xs font-semibold hover:underline ${
                              scan.status === "Needs Review"
                                ? "text-amber-600"
                                : "text-primary"
                            }`}
                            onClick={() => handleOpenReview(scan)}
                          >
                            Review Paper
                          </button>

                          {scan.original_image_url && (
                            <button
                              className="text-xs font-medium text-orange-500 hover:underline"
                              onClick={() => handleDeleteImage(scan.scan_id)}
                            >
                              Del. Image
                            </button>
                          )}
                          <button
                            className="text-xs font-medium text-red-600 hover:underline"
                            onClick={() => handleDeleteRecord(scan.scan_id)}
                          >
                            Delete
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        open={!!selectedScan}
        title={
          selectedScan
            ? `Reviewing: ${selectedScan.student_name}`
            : "Paper Review"
        }
        onClose={() => setSelectedScan(null)}
        width="1100px" // Wider modal to fit both panels comfortably
      >
        {selectedScan && (
          <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-6 mt-2">
            {/* LEFT COLUMN: The Visual Paper */}
            <div className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200">
              {selectedScan.original_image_url ? (
                <AnnotationViewer
                  imageUrl={selectedScan.original_image_url}
                  annotations={selectedScan.annotations_json}
                />
              ) : (
                <div className="p-10 flex items-center justify-center h-full">
                  <EmptyState
                    icon="🖼️"
                    title="No Image Available"
                    description="The image for this paper was deleted to save space."
                  />
                </div>
              )}
            </div>

            {/* RIGHT COLUMN: The Control Panel */}
            <div className="flex flex-col gap-4">
              {/* Identity Resolution Card */}
              {selectedScan.status === "Needs Review" && (
                <Card className="border border-amber-200 bg-amber-50">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle size={16} className="text-amber-600" />
                    <h3 className="text-sm font-bold text-amber-800">
                      Identity Conflict
                    </h3>
                  </div>
                  <p className="text-xs text-amber-900/80 mb-4">
                    The scanner couldn't verify this student, or the ID was a
                    duplicate. Check the handwritten name and select the correct
                    student below.
                  </p>

                  <Select
                    className="w-full mb-3 text-sm"
                    value={selectedStudent}
                    onChange={(e) => setSelectedStudent(e.target.value)}
                  >
                    <option value="">Select correct student...</option>
                    {assignableStudents.map((s) => (
                      <option key={s.student_id} value={s.student_id}>
                        {s.student_name}
                      </option>
                    ))}
                  </Select>

                  <PrimaryButton
                    className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                    onClick={handleModalAssignStudent}
                    disabled={!selectedStudent || isUpdating}
                  >
                    {isUpdating ? "Saving..." : "Assign & Resolve"}
                  </PrimaryButton>
                </Card>
              )}

              {/* Score Override Card */}
              <Card>
                <h3 className="text-sm font-bold text-gray-900 mb-1">
                  Manual Score Override
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  If the system graded a smudge incorrectly, you can override
                  the final score here.
                </p>
                <div className="flex items-center gap-3">
                  <Input
                    className="w-24 text-center"
                    type="number"
                    min="0"
                    max={selectedScan.total_items}
                    value={newScore}
                    onChange={(e) => setNewScore(e.target.value)}
                  />
                  <span className="text-sm font-semibold text-gray-500">
                    / {selectedScan.total_items}
                  </span>
                </div>
                <SecondaryButton
                  className="w-full mt-4"
                  onClick={handleModalOverrideScore}
                  disabled={isUpdating || newScore === ""}
                >
                  {isUpdating ? "Saving..." : "Update Score"}
                </SecondaryButton>
              </Card>

              {/* Status Info */}
              <Card>
                <h3 className="text-sm font-bold text-gray-900 mb-2">
                  Paper Details
                </h3>
                <div className="space-y-2 text-xs text-gray-600">
                  <p>
                    <span className="font-semibold text-gray-900">
                      Student ID:
                    </span>{" "}
                    {selectedScan.student_id}
                  </p>
                  <p>
                    <span className="font-semibold text-gray-900">Status:</span>{" "}
                    {selectedScan.status}
                  </p>
                </div>
              </Card>
            </div>
          </div>
        )}
      </Modal>

      {/* BULK DELETE MODAL */}
      <Modal
        open={isBulkDeleteModalOpen}
        title="Bulk Delete Options"
        onClose={() => !isDeleting && setIsBulkDeleteModalOpen(false)}
        width="500px"
      >
        <div className="space-y-4">
          <div className="rounded-md border border-orange-200 bg-orange-50 p-4">
            <div className="flex items-start gap-3">
              <ImageMinus className="mt-0.5 text-orange-600" size={18} />
              <div>
                <h3 className="text-sm font-semibold text-orange-800">
                  Delete All Images Only
                </h3>
                <p className="mt-1 text-xs text-orange-700 mb-3">
                  Instantly frees up your scan storage quota. Student records,
                  scores, and statistics will be perfectly preserved.
                </p>
                <SecondaryButton
                  onClick={handleBulkDeleteImages}
                  disabled={isDeleting}
                >
                  {isDeleting ? "Processing..." : "Delete Images"}
                </SecondaryButton>
              </div>
            </div>
          </div>

          <div className="rounded-md border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <Trash2 className="mt-0.5 text-red-600" size={18} />
              <div>
                <h3 className="text-sm font-semibold text-red-800">
                  Delete All Records
                </h3>
                <p className="mt-1 text-xs text-red-700 mb-3">
                  Wipes out all grades, images, and data for this specific
                  assessment. This action cannot be undone.
                </p>
                <button
                  onClick={handleBulkDeleteRecords}
                  disabled={isDeleting}
                  className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 disabled:opacity-50"
                >
                  {isDeleting ? "Processing..." : "Nuke Everything"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
