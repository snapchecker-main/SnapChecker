import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  Routes,
  Route,
  useNavigate,
  Navigate,
  useParams,
} from "react-router-dom";
import AssessmentWorkspace from "../../features/assessment/AssessmentWorkspace";
import TemplateBuilder from "../../features/template-builder/TemplateBuilder";
import TemplateLibrary from "../../features/template-builder/TemplateLibrary";
import AnswerKeyGrid from "../../features/template-builder/AnswerKeyGrid";
import RosterManager from "../../features/template-builder/RosterManager";
import ClassroomOverview from "../../features/classroom/ClassroomOverview";
import SemesterGradebook from "../../features/classroom/SemesterGradebook";
import ScannerView from "../../features/scanner/ScannerView";
import useAppStore from "../../store/useAppStore";
import { templateApi } from "../../api/services/templateApi";
import { getStorageUsage } from "../../api/services/storageApi";
import { AlertTriangle, ArrowLeft, CheckCircle, XCircle } from "lucide-react";
import Card from "../../components/common/Card";
import PrimaryButton from "../../components/common/PrimaryButton";
import SecondaryButton from "../../components/common/SecondaryButton";

export default function Workspace({
  activeClassroom,
  refreshClassroom,
  onQuotaChange,
}) {
  const navigate = useNavigate();
  const selectedTemplateId = useAppStore((state) => state.selectedTemplateId);
  const draftTemplate = useAppStore((state) => state.draftTemplate);

  // WIZARD STATES
  const [isSaving, setIsSaving] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [newlySavedTemplate, setNewlySavedTemplate] = useState(null);

  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [examName, setExamName] = useState("");
  const [examType, setExamType] = useState("Quiz");

  const [storageUsage, setStorageUsage] = useState(null);

  const fetchUsage = async () => {
    try {
      const data = await getStorageUsage();
      setStorageUsage(data.scans);
    } catch {
      // Error toast handled globally by Axios interceptor.
    }
  };

  useEffect(() => {
    fetchUsage();
  }, []);

  const handleQuotaChange = () => {
    fetchUsage();
    if (onQuotaChange) onQuotaChange();
  };

  useEffect(() => {
    if (activeClassroom && activeClassroom.exams === undefined) {
      refreshClassroom(activeClassroom.id);
    }
  }, [activeClassroom?.id]);

  if (!activeClassroom || activeClassroom.exams === undefined) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-gray-50">
        <div className="text-sm text-gray-500">
          Loading classroom workspace...
        </div>
      </div>
    );
  }

  const handleSaveBlueprint = async (blueprint) => {
    setIsSaving(true);
    try {
      let maxQuestions = 0;
      let maxChoices = 0;

      blueprint.elements.forEach((el) => {
        if (el.type === "question_block") {
          if (el.end_q > maxQuestions) maxQuestions = el.end_q;
          if (el.choices > maxChoices) maxChoices = el.choices;
        }
      });

      const payload = {
        name: draftTemplate?.name || "Untitled Assessment",
        examType: draftTemplate?.examType || "Quiz",
        numItems: maxQuestions,
        numChoices: maxChoices,
        layout_data: blueprint,
        classroom_id: activeClassroom.id,
      };

      let savedTemplate;

      if (selectedTemplateId) {
        savedTemplate = await templateApi.update(selectedTemplateId, payload);
      } else {
        savedTemplate = await templateApi.create(payload);
        useAppStore.getState().setSelectedTemplateId(savedTemplate.id);
      }

      useAppStore.getState().updateDraftTemplate({
        name: payload.name,
        examType: payload.examType,
        numItems: maxQuestions,
        numChoices: maxChoices,
        layout_data: blueprint,
      });

      await refreshClassroom();

      setNewlySavedTemplate(savedTemplate);
      setWizardStep(2);
    } catch (error) {
    } finally {
      setIsSaving(false);
    }
  };

  const handleOpenSettingsModal = () => {
    setExamName("");
    setExamType("Quiz");
    setShowSettingsModal(true);
  };

  const handleConfirmSettings = () => {
    useAppStore.getState().setSelectedTemplateId(null);
    useAppStore.getState().updateDraftTemplate({
      name: examName || "Untitled Assessment",
      examType: examType,
      layout_data: null,
    });
    setShowSettingsModal(false);
    setWizardStep(1);
    navigate(`/classrooms/${activeClassroom.id}/templates/builder`);
  };

  const handleWizardComplete = () => {
    setWizardStep(1);
    setNewlySavedTemplate(null);
    useAppStore.getState().setSelectedTemplateId(null);
    navigate(`/classrooms/${activeClassroom.id}/templates`);
  };

  const handleCancelWizard = async () => {
    if (wizardStep === 2) {
      const confirmDelete = window.confirm(
        "Your layout is already saved. Do you want to DELETE this unfinished template?\n\n• Click OK to permanently delete it.\n• Click Cancel to keep it in your library.",
      );

      if (!confirmDelete) {
        setWizardStep(1);
        setNewlySavedTemplate(null);
        useAppStore.getState().setSelectedTemplateId(null);
        navigate(`/classrooms/${activeClassroom.id}/templates`);
        return;
      }

      try {
        const targetId = newlySavedTemplate?.id || selectedTemplateId;
        await templateApi.remove(targetId);
        await refreshClassroom();
      } catch (error) {
        return;
      }
    }

    setWizardStep(1);
    setNewlySavedTemplate(null);
    useAppStore.getState().setSelectedTemplateId(null);
    navigate(`/classrooms/${activeClassroom.id}/templates`);
  };

  const AssessmentWrapper = () => {
    const { templateId } = useParams();
    const template = activeClassroom?.exams?.find(
      (t) => t.id === parseInt(templateId),
    );

    if (!template) return <Navigate to="../" replace />;

    return (
      <AssessmentWorkspace
        classroom={activeClassroom}
        template={template}
        onBack={() => navigate(`/classrooms/${activeClassroom.id}/templates`)}
        onQuotaChange={handleQuotaChange}
      />
    );
  };

  return (
    <main className="flex-1 overflow-y-auto bg-gray-50 p-5 md:p-7 relative">
      {storageUsage && storageUsage.percent_used >= 90 && (
        <div
          className={`mb-5 flex items-center gap-3 rounded-lg border p-4 text-sm font-medium shadow-sm transition-all ${
            storageUsage.percent_used >= 100
              ? "border-red-200 bg-red-50 text-red-800"
              : "border-amber-200 bg-amber-50 text-amber-800"
          }`}
        >
          <div className="shrink-0">
            {storageUsage.percent_used >= 100 ? (
              <XCircle size={20} className="text-red-600" />
            ) : (
              <AlertTriangle size={20} className="text-amber-600" />
            )}
          </div>
          <div className="flex-1">
            {storageUsage.percent_used >= 100
              ? "Scan limit reached. You cannot process any more papers until you free up space."
              : `You are approaching your scan limit (${storageUsage.percent_used}% used). Please free up space soon.`}
          </div>
        </div>
      )}

      {/* EXAM SETTINGS POPUP MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50 p-4">
          <Card className="w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900">
              Assessment Settings
            </h3>
            <div className="mt-5 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assessment Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Midterm Exam"
                  value={examName}
                  onChange={(e) => setExamName(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Exam Type
                </label>
                <select
                  value={examType}
                  onChange={(e) => setExamType(e.target.value)}
                  className="w-full rounded-md border border-gray-300 p-2 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="Quiz">Quiz</option>
                  <option value="Exam">Exam</option>
                  <option value="Midterm">Midterm</option>
                  <option value="Final">Final</option>
                </select>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <SecondaryButton onClick={() => setShowSettingsModal(false)}>
                Cancel
              </SecondaryButton>
              <PrimaryButton onClick={handleConfirmSettings}>
                Open Builder
              </PrimaryButton>
            </div>
          </Card>
        </div>
      )}

      <Routes>
        <Route
          path="/"
          element={<ClassroomOverview classroom={activeClassroom} />}
        />

        <Route
          path="roster"
          element={
            <div className="flex flex-col gap-5">
              <RosterManager classroomId={activeClassroom.id} />
            </div>
          }
        />

        <Route
          path="gradebook"
          element={<SemesterGradebook classroomId={activeClassroom.id} />}
        />

        <Route
          path="scanner"
          element={
            <ScannerView
              templates={activeClassroom.exams || []}
              onQuotaChange={handleQuotaChange}
              quotaExceeded={storageUsage?.percent_used >= 100}
            />
          }
        />

        <Route
          path="templates"
          element={
            <TemplateLibrary
              templates={activeClassroom.exams || []}
              refreshClassroom={refreshClassroom}
              onStartCreate={handleOpenSettingsModal}
              onEdit={(template) => {
                useAppStore.getState().setSelectedTemplateId(template.id);
                useAppStore.getState().updateDraftTemplate({
                  name: template.name,
                  examType: template.exam_type,
                  numItems: template.num_items,
                  numChoices: template.num_choices,
                  layout_data: template.layout_data,
                });
                setWizardStep(1);
                navigate(`/classrooms/${activeClassroom.id}/templates/builder`);
              }}
            />
          }
        />

        <Route
          path="templates/builder"
          element={
            <div className="flex flex-col gap-5">
              <div className="flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm mb-2">
                <div className="flex items-center gap-6">
                  <h2 className="text-base font-bold text-gray-900">
                    {draftTemplate?.name || "Untitled Assessment"}
                  </h2>
                  <div className="flex items-center gap-2 text-sm">
                    <span
                      className={`flex items-center gap-1 ${wizardStep >= 1 ? "text-primary font-semibold" : "text-gray-400"}`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-xs text-white ${wizardStep >= 1 ? "bg-primary" : "bg-gray-300"}`}
                      >
                        1
                      </div>
                      Design Layout
                    </span>
                    <div className="w-8 h-px bg-gray-300"></div>
                    <span
                      className={`flex items-center gap-1 ${wizardStep >= 2 ? "text-primary font-semibold" : "text-gray-400"}`}
                    >
                      <div
                        className={`h-5 w-5 rounded-full flex items-center justify-center text-xs text-white ${wizardStep >= 2 ? "bg-primary" : "bg-gray-300"}`}
                      >
                        2
                      </div>
                      Answer Key
                    </span>
                  </div>
                </div>

                <button
                  className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 transition-colors hover:text-red-600"
                  onClick={handleCancelWizard}
                  disabled={isSaving}
                >
                  {wizardStep === 1 ? "Cancel & Exit" : "Cancel Setup"}
                </button>
              </div>

              <div className={isSaving ? "opacity-50 pointer-events-none" : ""}>
                {wizardStep === 1 ? (
                  <TemplateBuilder onSave={handleSaveBlueprint} />
                ) : (
                  <div className="max-w-3xl mx-auto mt-8">
                    <div className="mb-4 text-center">
                      <h3 className="text-xl font-bold text-gray-900">
                        Set Your Answer Key
                      </h3>
                      <p className="text-sm text-gray-500">
                        Provide the correct answers so the scanner can grade
                        automatically.
                      </p>
                    </div>
                    <AnswerKeyGrid
                      template={newlySavedTemplate}
                      refreshClassroom={refreshClassroom}
                      onComplete={handleWizardComplete}
                      onBack={() => setWizardStep(1)}
                    />
                  </div>
                )}
              </div>
            </div>
          }
        />

        <Route path="templates/:templateId/*" element={<AssessmentWrapper />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
  );
}
