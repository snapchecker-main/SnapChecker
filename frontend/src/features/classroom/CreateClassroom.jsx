import Card from "../../components/common/Card";
import PrimaryButton from "../../components/common/PrimaryButton";
import Input from "../../components/common/Input";

export default function CreateClassroom({
  newClassData,
  setNewClassData,
  handleCreateClass,
  onCancel,
}) {
  return (
    <div className="flex h-full items-center justify-center p-5">
      <div className="w-full max-w-[400px]">
        <div className="mb-8 text-center">
          <h2 className="mb-1 text-xl font-semibold tracking-tight text-gray-900">
            Create New Classroom
          </h2>
          <p className="text-xs text-gray-500">
            Set up a new space to manage your students and assessments.
          </p>
        </div>

        <Card className="p-5">
          <form onSubmit={handleCreateClass} className="flex flex-col gap-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-700">
                Class Name <span className="text-red-500">*</span>
              </span>
              <Input
                placeholder="e.g. Section A"
                value={newClassData.name}
                onChange={(e) =>
                  setNewClassData((prev) => ({
                    ...prev,
                    name: e.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-700">
                Subject <span className="text-red-500">*</span>
              </span>
              <Input
                placeholder="e.g. Math 101"
                value={newClassData.subject_name}
                onChange={(e) =>
                  setNewClassData((prev) => ({
                    ...prev,
                    subject_name: e.target.value,
                  }))
                }
                required
              />
            </label>

            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-gray-700">
                Academic Term
              </span>
              <Input
                placeholder="e.g. AY 2026–2027"
                value={newClassData.academic_term}
                onChange={(e) =>
                  setNewClassData((prev) => ({
                    ...prev,
                    academic_term: e.target.value,
                  }))
                }
              />
            </label>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onCancel}
                className="w-full rounded-md border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-600 transition-colors hover:bg-gray-50"
              >
                Cancel
              </button>
              <PrimaryButton type="submit" fullWidth>
                Create
              </PrimaryButton>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
