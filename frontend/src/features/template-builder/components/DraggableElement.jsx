import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GripHorizontal } from "lucide-react";

export default function DraggableElement({
  id,
  type,
  left,
  top,
  isSelected,
  isConflicting,
  onClick,
  isPreviewMode,
  children,
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: id,
      data: { type },
    });

  const style = {
    position: "absolute",
    left: `${left}px`,
    top: `${top}px`,
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0 : 1,
  };

  // Preview Mode: Pure black and white, zero UI overhead
  if (isPreviewMode) {
    return (
      <div style={style} className="absolute flex flex-col bg-transparent">
        <div className="p-1">{children}</div>
      </div>
    );
  }

  return (
    <div
      id={id}
      ref={setNodeRef}
      style={style}
      onClick={onClick}
      className={`absolute flex flex-col group transition-all duration-200 ${
        isConflicting
          ? "ring-2 ring-red-500 bg-red-50/40 rounded shadow-sm"
          : ""
      } ${
        isSelected && !isConflicting
          ? "ring-1 ring-blue-300 bg-blue-50/10 rounded"
          : ""
      }`}
    >
      {/* The invisible, floating grip handle */}
      <div
        {...listeners}
        {...attributes}
        className="absolute -top-4 left-1/2 -translate-x-1/2 cursor-move opacity-0 transition-opacity group-hover:opacity-100 bg-white rounded shadow-sm border px-1"
      >
        <GripHorizontal size={14} className="text-gray-500" />
      </div>

      <div className="p-1 bg-transparent">{children}</div>
    </div>
  );
}
