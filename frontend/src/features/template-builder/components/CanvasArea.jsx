import { useDroppable } from "@dnd-kit/core";
import { QRCodeSVG } from "qrcode.react";
import DraggableElement from "./DraggableElement";
import {
  HeaderBlockPreview,
  QuestionBlockPreview,
  IdGridPreview,
} from "./PreviewBlocks";

export default function CanvasArea({
  layout,
  elements,
  selectedId,
  setSelectedId,
  conflicts,
  zoom,
  isPreviewMode,
}) {
  const { setNodeRef: setCanvasRef } = useDroppable({ id: "canvas-droppable" });

  const gridBackground = isPreviewMode
    ? {}
    : {
        backgroundImage: `radial-gradient(#cbd5e1 1px, transparent 0)`,
        backgroundSize: `20px 20px`,
      };

  return (
    <div
      className="flex-1 overflow-hidden rounded-lg bg-gray-300 p-8 shadow-inner grid place-items-center"
      onClick={() => setSelectedId(null)}
    >
      <div
        className="relative flex-1 overflow-hidden rounded-lg bg-gray-300 shadow-inner flex items-center justify-center"
        onClick={() => setSelectedId(null)}
      >
        <div
          style={{
            transform: `scale(${zoom * 0.9})`,
            transformOrigin: "center",
            transition: "transform 0.2s ease-in-out",
          }}
        >
          <div
            id="export-canvas"
            ref={setCanvasRef}
            className={`relative shadow-xl transition-all duration-300 ${isPreviewMode ? "bg-white" : "bg-white/95"}`}
            style={{
              width: layout.width,
              height: layout.height,
              ...gridBackground,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {!isPreviewMode && (
              <>
                <div className="pointer-events-none absolute left-0 top-1/2 h-px w-full bg-blue-300/40" />
                <div className="pointer-events-none absolute left-1/2 top-0 h-full w-px bg-blue-300/40" />
                <div className="pointer-events-none absolute bottom-8 left-8 right-8 top-8 border-2 border-dashed border-blue-400/40">
                  <span className="absolute -top-5 left-0 text-[10px] font-bold text-blue-400/60 tracking-wider">
                    SCANNER SAFE ZONE (DO NOT PLACE BLOCKS OUTSIDE THIS BOX)
                  </span>
                </div>
              </>
            )}

            <div className="absolute right-16 top-16 flex h-20 w-20 flex-col items-center justify-center">
              {isPreviewMode ? (
                <QRCodeSVG
                  value={JSON.stringify({ template_id: "UNSAVED_PREVIEW" })}
                  size={80}
                  level="M"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center border-2 border-dashed border-red-300 bg-red-50/50 text-center">
                  <span className="text-[10px] font-bold text-red-400">
                    QR CODE
                    <br />
                    ZONE
                  </span>
                </div>
              )}
            </div>

            <div className="absolute left-8 top-8 h-5 w-5 bg-black" />
            <div className="absolute right-8 top-8 h-5 w-5 bg-black" />
            <div className="absolute bottom-8 left-8 h-5 w-5 bg-black" />
            <div className="absolute bottom-8 right-8 h-5 w-5 bg-black" />

            {elements.map((el) => (
              <DraggableElement
                key={el.id}
                id={el.id}
                type={el.type}
                left={el.x}
                top={el.y}
                isSelected={selectedId === el.id}
                isConflicting={conflicts.includes(el.id)}
                isPreviewMode={isPreviewMode}
                onClick={() => setSelectedId(el.id)}
              >
                {el.type === "header_block" && <HeaderBlockPreview {...el} />}
                {el.type === "text_field" && (
                  <div
                    style={{
                      fontFamily: el.fontFamily || "sans-serif",
                      fontSize: `${el.fontSize}px`,
                      fontWeight: el.fontWeight,
                      whiteSpace: "pre-wrap",
                      color: "#000",
                    }}
                  >
                    {el.text}
                  </div>
                )}
                {el.type === "question_block" && (
                  <QuestionBlockPreview {...el} />
                )}
                {el.type === "id_grid" && <IdGridPreview digits={el.digits} />}
              </DraggableElement>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
