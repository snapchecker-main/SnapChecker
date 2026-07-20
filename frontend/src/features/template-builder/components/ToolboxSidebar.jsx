import PrimaryButton from "../../../components/common/PrimaryButton";
import Card from "../../../components/common/Card";
import Select from "../../../components/common/Select";

export default function ToolboxSidebar({
  paperType,
  setPaperType,
  zoom,
  setZoom,
  isPreviewMode,
  setIsPreviewMode,
  undo,
  redo,
  canUndo,
  canRedo,
  addElement,
  onSave,
  layout,
  elements,
}) {
  return (
    <Card className="flex w-64 flex-col gap-3 p-4">
      <h3 className="text-sm font-bold text-gray-900">Workspace</h3>

      <div className="flex gap-2">
        <button
          onClick={undo}
          disabled={!canUndo}
          className="flex-1 rounded border bg-white p-1 text-xs disabled:opacity-50"
        >
          Undo
        </button>
        <button
          onClick={redo}
          disabled={!canRedo}
          className="flex-1 rounded border bg-white p-1 text-xs disabled:opacity-50"
        >
          Redo
        </button>
      </div>

      <div className="flex items-center gap-2 rounded border bg-gray-50 p-1">
        <button
          onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
          className="px-2 text-lg font-bold"
        >
          -
        </button>
        <span className="flex-1 text-center text-xs font-medium">
          {Math.round(zoom * 100)}%
        </span>
        <button
          onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
          className="px-2 text-lg font-bold"
        >
          +
        </button>
      </div>

      <button
        onClick={() => setIsPreviewMode(!isPreviewMode)}
        className={`rounded border p-2 text-xs font-medium transition-colors ${isPreviewMode ? "bg-primary text-white border-primary" : "bg-white hover:bg-gray-50"}`}
      >
        {isPreviewMode ? "Exit Preview" : "Print Preview"}
      </button>

      <Select
        value={paperType}
        onChange={(e) => setPaperType(e.target.value)}
        className="mt-2"
      >
        <option value="A4">A4 (Standard)</option>
        <option value="LETTER">Letter (Short)</option>
        <option value="LEGAL">Legal (Long)</option>
      </Select>

      <hr className="my-2 border-gray-200" />

      <h3 className="text-sm font-bold text-gray-900">Add Blocks</h3>
      <button
        onClick={() => addElement("header_block")}
        className="rounded border bg-white p-2 text-xs font-medium hover:bg-gray-50 shadow-sm"
      >
        + Student Info Header
      </button>
      <button
        onClick={() => addElement("text_field")}
        className="rounded border bg-white p-2 text-xs hover:bg-gray-50 shadow-sm"
      >
        + Custom Text
      </button>
      <button
        onClick={() => addElement("id_grid")}
        className="rounded border bg-white p-2 text-xs hover:bg-gray-50 shadow-sm"
      >
        + Student ID Grid
      </button>
      <button
        onClick={() => addElement("question_block")}
        className="rounded border bg-white p-2 text-xs hover:bg-gray-50 shadow-sm"
      >
        + Question Block
      </button>

      <div className="mt-auto flex flex-col gap-2 pt-4">
        <PrimaryButton
          fullWidth
          onClick={() =>
            onSave({ layout: { ...layout, type: paperType }, elements })
          }
        >
          Next: Answer Key
        </PrimaryButton>
      </div>
    </Card>
  );
}
