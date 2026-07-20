import PrimaryButton from "../../../components/common/PrimaryButton";
import { Upload, Camera, AlertTriangle } from "lucide-react";

export default function ScannerDropzone({
  selectedTemplateId,
  dragActive,
  previewUrl,
  status,
  fileInputRef,
  handleDrag,
  handleDrop,
  handleChange,
  handleGradeSubmission,
  quotaExceeded = false, // NEW: Quota check prop
}) {
  return (
    <>
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-sm font-semibold text-gray-900">Image Input</h3>
          <p className="mt-0.5 text-xs text-gray-500">
            Select an exam above, then upload the paper here.
          </p>
        </div>
        <Camera size={18} className="text-primary" />
      </div>

      {/* NEW: Quota Exceeded Warning Banner */}
      {quotaExceeded && (
        <div className="mb-3 flex items-center gap-2 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
          <AlertTriangle size={16} className="text-red-600 shrink-0" />
          <span>
            <strong>Storage Limit Reached:</strong> You have hit your maximum
            scan quota. Please bulk delete old images or records to continue
            scanning.
          </span>
        </div>
      )}

      <div
        onDragEnter={!quotaExceeded ? handleDrag : undefined}
        onDragLeave={!quotaExceeded ? handleDrag : undefined}
        onDragOver={!quotaExceeded ? handleDrag : undefined}
        onDrop={!quotaExceeded ? handleDrop : undefined}
        onClick={() => {
          if (!quotaExceeded && selectedTemplateId && !previewUrl) {
            fileInputRef.current?.click();
          }
        }}
        className={`flex min-h-[14rem] w-full flex-col items-center justify-center rounded-md border border-dashed px-5 text-center transition ${
          quotaExceeded
            ? "border-red-300 bg-red-50/20 cursor-not-allowed opacity-75"
            : dragActive
              ? "border-primary/60 bg-red-50/50"
              : "border-gray-300 bg-gray-50"
        } ${
          !quotaExceeded && selectedTemplateId
            ? !previewUrl
              ? "cursor-pointer hover:border-primary/40 hover:bg-red-50/30"
              : ""
            : "pointer-events-none cursor-not-allowed opacity-50"
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleChange}
          disabled={quotaExceeded}
          className="hidden"
        />

        {quotaExceeded ? (
          <>
            <AlertTriangle size={24} className="mb-2 text-red-500" />
            <p className="text-sm font-semibold text-red-800">
              Scanning disabled due to quota limits
            </p>
            <p className="mt-1 text-xs text-red-600">
              Head over to the Gradebook tab to free up storage space.
            </p>
          </>
        ) : !previewUrl ? (
          <>
            <Upload size={20} className="mb-2 text-primary" />
            <p className="text-sm font-medium text-gray-800">
              {selectedTemplateId
                ? "Drop papers here or choose files"
                : "Select an exam above first"}
            </p>
            {selectedTemplateId && (
              <p className="mt-1 text-xs text-gray-500">
                PDF, JPG, or PNG · up to 50 files per batch
              </p>
            )}
          </>
        ) : (
          <div className="w-full" onClick={(e) => e.stopPropagation()}>
            <div className="mb-3 flex items-center justify-between">
              <h4 className="text-xs font-semibold text-gray-700">Preview</h4>
              <button
                type="button"
                className="text-xs text-gray-400 hover:text-gray-700 hover:underline"
                onClick={() => fileInputRef.current?.click()}
              >
                Change file
              </button>
            </div>

            <img
              src={previewUrl}
              alt="Exam Preview"
              className="mb-4 max-h-[300px] w-full rounded border border-gray-200 bg-white object-contain"
            />

            <PrimaryButton
              fullWidth
              onClick={(e) => {
                e.stopPropagation();
                handleGradeSubmission();
              }}
              disabled={status.loading}
            >
              {status.loading ? "Processing..." : "Grade Test"}
            </PrimaryButton>
          </div>
        )}
      </div>
    </>
  );
}
