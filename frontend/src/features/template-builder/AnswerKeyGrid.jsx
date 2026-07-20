import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import api from "../../api/client";
import PrimaryButton from "../../components/common/PrimaryButton";
import Card from "../../components/common/Card";

export default function AnswerKeyGrid({
  template,
  refreshClassroom,
  onComplete,
  onBack,
}) {
  const [answers, setAnswers] = useState([]);
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: false,
  });

  const choiceLabels = ["A", "B", "C", "D", "E", "F"];

  useEffect(() => {
    if (!template) return;
    const initialAnswers = template.answer_key?.length
      ? template.answer_key
      : Array(template.num_items).fill("");
    setAnswers(initialAnswers);
    setStatus({ loading: false, message: "", error: false });
  }, [template]);

  const handleBubbleClick = (itemIndex, choice) => {
    setAnswers((prev) => {
      const updated = [...prev];
      updated[itemIndex] = choice;
      return updated;
    });
  };

  const handleSave = async () => {
    const missingItems = answers
      .map((answer, index) => (answer === "" ? index + 1 : null))
      .filter(Boolean);

    if (missingItems.length > 0) {
      toast.error(
        `Please answer the following item(s):\n\n${missingItems.join(", ")}`,
      );
      return;
    }

    setStatus({ loading: true, message: "Saving answer key...", error: false });

    try {
      const { data: response } = await api.put(
        `/templates/${template.id}/answer_key`,
        { answer_key: answers },
      );

      if (response.requires_confirmation) {
        const shouldRegrade = window.confirm(
          `${response.scan_count} graded papers already exist.\n\n` +
            `Press OK to Save & Regrade.\n` +
            `Press Cancel to Save Only.`,
        );

        await api.put(`/templates/${template.id}/answer_key`, {
          answer_key: answers,
          confirmed: true,
          regrade: shouldRegrade,
        });
      }

      await refreshClassroom();
      setStatus({
        loading: false,
        message: "Answer Key saved successfully!",
        error: false,
      });

      if (onComplete) {
        setTimeout(() => {
          onComplete();
        }, 1000);
      }
    } catch (error) {
      setStatus({
        loading: false,
        message: error.response?.data?.detail ?? error.message,
        error: true,
      });
    }
  };

  if (!template) return null;

  const numColumns = 4;
  const numRows = Math.ceil(template.num_items / numColumns);

  return (
    <Card className="mt-5 p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          {/* 2. Add the Back Button here */}
          {onBack && (
            <button
              onClick={onBack}
              className="flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-gray-800 mb-2 transition-colors"
            >
              ← Back to Layout Editor
            </button>
          )}
          <h3 className="text-sm font-semibold text-gray-900">
            Answer Key Manager
          </h3>
          <p className="mt-0.5 text-xs text-gray-500">
            {template.num_items} items · {template.name}
          </p>
        </div>

        <PrimaryButton onClick={handleSave} disabled={status.loading}>
          {status.loading
            ? "Saving..."
            : onComplete
              ? "Finish & Save"
              : "Save key"}
        </PrimaryButton>
      </div>

      {status.message && (
        <div
          className={`mb-4 rounded-md px-3 py-2 text-xs font-medium ${
            status.error
              ? "bg-red-50 text-red-600 border border-red-200"
              : "bg-green-50 text-green-700 border border-green-200"
          }`}
        >
          {status.message}
        </div>
      )}

      <div
        className="grid auto-cols-max auto-flow-col gap-x-8 gap-y-3 overflow-x-auto rounded-md border border-gray-200 bg-gray-50 p-4"
        style={{
          gridTemplateRows: `repeat(${numRows}, auto)`,
          maxHeight: "400px",
        }}
      >
        {answers.map((answer, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="w-5 text-right text-xs font-semibold text-gray-600">
              {index + 1}.
            </span>

            <div className="flex gap-1.5">
              {choiceLabels.slice(0, template.num_choices).map((choice) => {
                const isSelected = answer === choice;
                return (
                  <div
                    key={choice}
                    onClick={() => handleBubbleClick(index, choice)}
                    className={`flex h-6 w-6 cursor-pointer items-center justify-center rounded border text-[10px] font-semibold transition-colors ${
                      isSelected
                        ? "border-primary bg-red-50 text-primary"
                        : "border-gray-200 bg-white text-gray-500 hover:border-primary/40 hover:bg-gray-50"
                    }`}
                  >
                    {choice}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
