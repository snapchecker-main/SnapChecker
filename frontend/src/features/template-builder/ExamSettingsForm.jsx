import { useState } from "react";
import useAppStore from "../../store/useAppStore";
import PrimaryButton from "../../components/common/PrimaryButton";
import Card from "../../components/common/Card";
import Input from "../../components/common/Input";
import Select from "../../components/common/Select";

export default function ExamSettingsForm({ classroomId, refreshClassroom }) {
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: false,
  });

  const draftTemplate = useAppStore((state) => state.draftTemplate);
  const updateDraftTemplate = useAppStore((state) => state.updateDraftTemplate);
  const saveExamSettings = useAppStore((state) => state.saveExamSettings);
  const selectedTemplateId = useAppStore((state) => state.selectedTemplateId);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({
      loading: true,
      message: selectedTemplateId
        ? "Updating template..."
        : "Saving template...",
      error: false,
    });

    try {
      const template = await saveExamSettings(classroomId);
      await refreshClassroom();
      setStatus({
        loading: false,
        message: "Template saved successfully!",
        error: false,
      });

      if (!selectedTemplateId) {
        updateDraftTemplate({
          name: template.name,
          examType: template.exam_type,
          numItems: template.num_items,
          numChoices: template.num_choices,
        });
      }
    } catch (error) {
      setStatus({
        loading: false,
        message: error.message || "Failed to save template.",
        error: true,
      });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    updateDraftTemplate({
      [name]: name.startsWith("num")
        ? value === ""
          ? ""
          : Number(value)
        : value,
    });
  };

  return (
    <Card className="max-w-[500px] p-5">
      <h3 className="mb-4 text-sm font-semibold text-gray-900">
        Exam Settings
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-gray-700">
            Exam Name
          </span>
          <Input
            type="text"
            name="name"
            value={draftTemplate.name}
            onChange={handleChange}
            required
          />
        </label>

        <label className="block">
          <span className="mb-1.5 block text-xs font-medium text-gray-700">
            Exam Type
          </span>
          <Select
            name="examType"
            value={draftTemplate.examType}
            onChange={handleChange}
          >
            <option value="Quiz">Quiz</option>
            <option value="Activity">Activity</option>
            <option value="Midterm">Midterm</option>
            <option value="Final">Final</option>
          </Select>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-700">
              Items
            </span>
            <Input
              type="number"
              name="numItems"
              placeholder="50"
              value={draftTemplate.numItems ?? ""}
              onChange={handleChange}
              min="1"
              max="100"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-medium text-gray-700">
              Choices
            </span>
            <Input
              type="number"
              name="numChoices"
              placeholder="4"
              value={draftTemplate.numChoices ?? ""}
              onChange={handleChange}
              min="2"
              max="6"
            />
          </label>
        </div>

        <PrimaryButton type="submit" disabled={status.loading} fullWidth>
          {status.loading
            ? selectedTemplateId
              ? "Updating..."
              : "Saving..."
            : selectedTemplateId
              ? "Update Template"
              : "Save & Continue"}
        </PrimaryButton>
      </form>

      {status.message && (
        <div
          className={`mt-4 rounded-md px-3 py-2 text-center text-xs font-medium ${
            status.error
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {status.message}
        </div>
      )}
    </Card>
  );
}
