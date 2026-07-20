import { Routes, Route, Navigate } from "react-router-dom"; // <-- ADDED
import ScannerView from "../scanner/ScannerView";
import Gradebook from "../gradebook/Gradebook";
import ItemAnalysis from "./ItemAnalysis";
import Overview from "./Overview";
import Badge from "../../components/common/Badge";
import { ArrowLeft } from "lucide-react";

export default function AssessmentWorkspace({
  classroom,
  template,
  onBack,
  onQuotaChange,
}) {
  return (
    <div className="mx-auto max-w-7xl space-y-5">
      <div className="mb-4">
        <button
          onClick={onBack}
          className="mb-3 inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-primary"
        >
          <ArrowLeft size={14} /> Back to {classroom.name}
        </button>

        <div className="flex items-center gap-3">
          <h2 className="text-xl font-semibold tracking-tight text-gray-900">
            {template.name}
          </h2>
          <Badge variant="neutral">{template.exam_type}</Badge>
        </div>
      </div>

      <div>
        <Routes>
          <Route path="/" element={<Overview templateId={template.id} />} />

          <Route
            path="scanner"
            element={
              <ScannerView
                templates={[template]}
                onQuotaChange={onQuotaChange}
              />
            }
          />

          <Route
            path="gradebook"
            element={
              <Gradebook
                classroomId={classroom.id}
                onQuotaChange={onQuotaChange}
              />
            }
          />

          <Route
            path="item-analysis"
            element={<ItemAnalysis templateId={template.id} />}
          />

          {/* Fallback to overview if URL is weird */}
          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </div>
    </div>
  );
}
