import { useState, useRef, useEffect } from "react";
import api from "../../api/client";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ScannerDropzone from "./components/ScannerDropzone";
import TemplateSelector from "./components/TemplateSelector";
import StatusBanner from "./components/StatusBanner";
import BatchSummary from "./components/BatchSummary";
import PrimaryButton from "../../components/common/PrimaryButton";
import SecondaryButton from "../../components/common/SecondaryButton";
import Card from "../../components/common/Card";
import Modal from "../../components/common/Modal";
import { RefreshCw, XCircle } from "lucide-react";

export default function ScannerView({
  templates = [],
  onQuotaChange,
  quotaExceeded = false,
}) {
  const navigate = useNavigate();
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [dragActive, setDragActive] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [scanQueue, setScanQueue] = useState([]);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [overview, setOverview] = useState(null);

  const [batchSession, setBatchSession] = useState({
    results: [],
    successful: 0,
    needsReview: 0,
    failed: 0,
    total: 0,
    averageScore: 0,
  });

  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: false,
  });

  const fileInputRef = useRef(null);

  const resetScanner = () => {
    setSelectedImage(null);
    setPreviewUrl(null);
    setScanQueue([]);
    setBatchSession({
      results: [],
      successful: 0,
      needsReview: 0,
      failed: 0,
      total: 0,
      averageScore: 0,
    });
    setStatus({
      loading: false,
      message: "",
      error: false,
    });
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    if (onQuotaChange) onQuotaChange();
  };

  useEffect(() => {
    if (templates.length === 1) {
      setSelectedTemplateId(String(templates[0].id));
    }
  }, [templates]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quotaExceeded) return;
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (quotaExceeded) return;
    setDragActive(false);
    const files = Array.from(e.dataTransfer.files || []);
    if (files.length === 0) return;
    setScanQueue(files);
    handleFile(files[0]);
  };

  const handleChange = (e) => {
    e.preventDefault();
    if (quotaExceeded) return;
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setScanQueue(files);
    handleFile(files[0]);
  };

  const handleFile = (file) => {
    if (quotaExceeded) return;
    if (!file.type.match("image.*")) {
      setStatus({
        loading: false,
        error: true,
        message: "Please upload a PNG or JPG image.",
      });
      return;
    }
    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setStatus({ loading: false, message: "", error: false });
  };

  const scanSingleImage = async (imageFile, activeTemplate) => {
    const formData = new FormData();
    formData.append("file", imageFile);
    formData.append(
      "test_info",
      JSON.stringify({
        template_id: activeTemplate.id,
        num_items: activeTemplate.num_items,
        num_choices: activeTemplate.num_choices,
        scan_sensitivity: "pencil",
      }),
    );
    formData.append("answer_key", JSON.stringify(activeTemplate.answer_key));
    const { data } = await api.post("/scans/", formData);
    return data;
  };

  const processQueue = async (activeTemplate) => {
    const results = [];
    for (let i = 0; i < scanQueue.length; i++) {
      const file = scanQueue[i];
      setStatus({
        loading: true,
        error: false,
        message: `Scanning ${i + 1} of ${scanQueue.length}...`,
      });
      try {
        const result = await scanSingleImage(file, activeTemplate);
        results.push(result);
      } catch (error) {
        results.push({
          failed: true,
          fileName: file.name,
          error: error.message,
        });
      }
    }
    return results;
  };

  const handleRegrade = async () => {
    if (!window.confirm("Regrade every scanned paper in this assessment?")) {
      return;
    }
    try {
      const activeTemplate = templates.find(
        (t) => t.id === parseInt(selectedTemplateId),
      );
      const { data: response } = await api.post(
        `/scans/template/${activeTemplate.id}/regrade`,
      );
      setStatus({
        loading: false,
        error: false,
        message: response.message,
      });
      toast.success("Regrade successful!");
    } catch (err) {
      // Handled by global interceptor
    }
  };

  const fetchOverview = async (templateId) => {
    try {
      const { data } = await api.get(`/scans/template/${templateId}/overview`);
      setOverview(data);
    } catch (err) {
      // Handled by global interceptor
    }
  };

  const handleGradeSubmission = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (quotaExceeded || !selectedImage) return;

    const activeTemplate = templates.find(
      (t) => t.id === parseInt(selectedTemplateId),
    );

    if (
      !activeTemplate ||
      !activeTemplate.answer_key ||
      activeTemplate.answer_key.length === 0
    ) {
      setStatus({
        loading: false,
        message:
          "Please select a valid exam with a saved answer key from the dropdown above!",
        error: true,
      });
      return;
    }

    setStatus({
      loading: true,
      message: "Reading answer sheet...",
      error: false,
    });

    try {
      const results = await processQueue(activeTemplate);
      const successful = results.filter((r) => !r.failed && !r.needs_review);
      const needsReview = results.filter((r) => !r.failed && r.needs_review);
      const failed = results.filter((r) => r.failed);

      const averageScore =
        successful.length > 0
          ? (
              successful.reduce((sum, scan) => sum + scan.score, 0) /
              successful.length
            ).toFixed(1)
          : 0;

      setBatchSession({
        results,
        successful: successful.length,
        needsReview: needsReview.length,
        failed: failed.length,
        total: results.length,
        averageScore,
      });

      await fetchOverview(activeTemplate.id);

      const data = successful[successful.length - 1];
      if (!data && results.length > 0) {
        throw new Error("All scans failed.");
      }

      setStatus({
        loading: false,
        message: data
          ? `Success! Scored ${data.score}/${data.total_items} for ${data.matched_student_name}`
          : "Processing complete.",
        error: false,
      });
    } catch (error) {
      setStatus({ loading: false, message: error.message, error: true });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mt-1 text-xs text-gray-500">
            Upload scans individually or in a batch. SnapChecker will match
            students and score responses.
          </p>
        </div>
        <SecondaryButton onClick={handleRegrade}>
          <RefreshCw size={14} /> Regrade Assessment
        </SecondaryButton>
      </div>

      <TemplateSelector
        templates={templates}
        selectedTemplateId={selectedTemplateId}
        setSelectedTemplateId={setSelectedTemplateId}
      />

      {/*  Tightly Constrained Dropzone Area */}
      <div className="mx-auto max-w-2xl">
        <Card padding="none">
          <div className="p-6 sm:p-8">
            {quotaExceeded ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border-2 border-dashed border-red-200 bg-red-50 p-6 text-center transition-all">
                <div className="mb-3 grid h-12 w-12 place-items-center rounded-full bg-red-100 text-red-600 shadow-sm">
                  <XCircle size={24} />
                </div>
                <h3 className="text-sm font-bold text-red-900">
                  Scan Limit Reached
                </h3>
                <p className="mt-1 max-w-[280px] text-xs font-medium text-red-700/80">
                  You have reached the maximum storage quota for scanned papers.
                  Delete old classrooms or scans to continue.
                </p>
              </div>
            ) : (
              <ScannerDropzone
                selectedTemplateId={selectedTemplateId}
                dragActive={dragActive}
                previewUrl={previewUrl}
                status={status}
                fileInputRef={fileInputRef}
                handleDrag={handleDrag}
                handleDrop={handleDrop}
                handleChange={handleChange}
                handleGradeSubmission={handleGradeSubmission}
                quotaExceeded={quotaExceeded}
              />
            )}

            <div className="mt-4">
              <StatusBanner status={status} />
            </div>
          </div>
        </Card>
      </div>

      {/* Pop-up Modal for Batch Summary & Success Prompt */}
      <Modal
        open={batchSession.total > 0}
        title="Processing Complete"
        onClose={resetScanner}
        width="600px"
      >
        <div className="space-y-6 pb-2 mt-2">
          <BatchSummary batchSession={batchSession} overview={overview} />

          <div className="flex flex-col items-center justify-center rounded-lg border border-green-200 bg-green-50 p-6 text-center shadow-sm">
            <h3 className="text-base font-semibold text-green-900">
              ✓ Papers Saved Successfully
            </h3>
            <p className="mt-2 text-sm text-green-700 max-w-md">
              Your results have been logged in the gradebook and item analysis
              has been updated.
            </p>
            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <SecondaryButton onClick={resetScanner}>
                Scan More Papers
              </SecondaryButton>
              <PrimaryButton
                onClick={() => {
                  if (onQuotaChange) onQuotaChange();
                  navigate("../gradebook");
                }}
              >
                Go to Gradebook
              </PrimaryButton>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  );
}
