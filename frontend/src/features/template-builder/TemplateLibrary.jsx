import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import useAppStore from "../../store/useAppStore";
import { generatePDF } from "../../utils/pdfGenerator";
import { templateApi } from "../../api/services/templateApi";
import Card from "../../components/common/Card";
import PrimaryButton from "../../components/common/PrimaryButton";
import SecondaryButton from "../../components/common/SecondaryButton";
import DangerButton from "../../components/common/DangerButton";
import EmptyState from "../../components/common/EmptyState";
import HiddenCanvas from "./components/HiddenCanvas";

export default function TemplateLibrary({
  templates,
  refreshClassroom,
  onStartCreate,
  onEdit,
}) {
  const navigate = useNavigate();
  const selectedTemplateId = useAppStore((state) => state.selectedTemplateId);
  const setSelectedTemplateId = useAppStore(
    (state) => state.setSelectedTemplateId,
  );
  const [isDeleting, setIsDeleting] = useState(null);
  const [printingTemplate, setPrintingTemplate] = useState(null);
  const HIDDEN_CANVAS_ID = "library-hidden-print-canvas";

  useEffect(() => {
    let timeoutId;
    if (printingTemplate) {
      const checkAndPrint = () => {
        const canvasEl = document.getElementById(HIDDEN_CANVAS_ID);
        if (canvasEl) {
          timeoutId = setTimeout(async () => {
            try {
              await generatePDF(
                HIDDEN_CANVAS_ID,
                printingTemplate.layout?.type || "A4",
              );
            } catch (err) {
            } finally {
              setPrintingTemplate(null);
            }
          }, 300);
        } else {
          timeoutId = setTimeout(checkAndPrint, 50);
        }
      };
      checkAndPrint();
    }
    return () => clearTimeout(timeoutId);
  }, [printingTemplate]);

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    const confirmed = window.confirm(
      "Delete this template?\n\nThis will also delete:\n• Answer Key\n• Scan Results\n\nThis action cannot be undone.",
    );

    if (!confirmed) return;

    setIsDeleting(id);
    try {
      await templateApi.remove(id);
      if (selectedTemplateId === id) {
        setSelectedTemplateId(null);
      }
      await refreshClassroom();
    } catch (error) {
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-5 relative">
      {printingTemplate && (
        <HiddenCanvas template={printingTemplate} canvasId={HIDDEN_CANVAS_ID} />
      )}

      <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <p className="mt-1 text-xs text-gray-500">
            Manage your classroom assessments and templates.
          </p>
        </div>
        <PrimaryButton onClick={onStartCreate}>+ New assessment</PrimaryButton>
      </div>

      {!templates || templates.length === 0 ? (
        <Card padding="none" className="p-10">
          <EmptyState
            icon=""
            title="No Assessments Yet"
            description="Create your first assessment to begin scanning papers."
            action={
              <PrimaryButton onClick={onStartCreate}>
                Create Assessment
              </PrimaryButton>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {templates.map((template) => (
            <div
              key={template.id}
              className={`flex min-h-64 cursor-pointer flex-col rounded-lg border bg-white p-5 transition ${
                selectedTemplateId === template.id
                  ? "border-primary shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:shadow-sm"
              }`}
              onClick={() => setSelectedTemplateId(template.id)}
            >
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-gray-500">
                  {template.exam_type}
                </p>
                <h3 className="mt-1 text-base font-semibold text-gray-900">
                  {template.name}
                </h3>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-y-2 text-xs text-gray-500">
                <p>ID: {template.id}</p>
                <p>{template.num_items || 0} items</p>
                <p>{template.num_choices || 0} choices</p>
              </div>

              <div className="mt-auto flex flex-wrap items-center justify-end gap-2 pt-5">
                <PrimaryButton
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(template.id.toString());
                  }}
                >
                  Open
                </PrimaryButton>

                <SecondaryButton
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(template);
                  }}
                >
                  Edit
                </SecondaryButton>

                <SecondaryButton
                  onClick={(e) => {
                    e.stopPropagation();
                    setPrintingTemplate(template);
                  }}
                  disabled={printingTemplate?.id === template.id}
                >
                  {printingTemplate?.id === template.id
                    ? "Printing..."
                    : "Print"}
                </SecondaryButton>

                <DangerButton
                  onClick={(e) => handleDelete(e, template.id)}
                  disabled={isDeleting === template.id}
                >
                  {isDeleting === template.id ? "..." : "Delete"}
                </DangerButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
