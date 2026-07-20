import { QRCodeSVG } from "qrcode.react";
import {
  HeaderBlockPreview,
  QuestionBlockPreview,
  IdGridPreview,
} from "./PreviewBlocks";

export default function HiddenCanvas({ template, canvasId }) {
  const blueprint = template?.layout_data;

  if (!template || !blueprint || !blueprint.layout || !blueprint.elements) {
    return null;
  }

  const qrPayload = JSON.stringify({ template_id: template.id });

  return (
    <div
      style={{
        position: "absolute",
        top: "-9999px",
        left: "-9999px",
        zIndex: -9999,
      }}
    >
      <div
        id={canvasId}
        className="relative bg-white"
        style={{
          width: blueprint.layout.width,
          height: blueprint.layout.height,
        }}
      >
        <div className="absolute left-8 top-8 h-5 w-5 bg-black" />
        <div className="absolute right-8 top-8 h-5 w-5 bg-black" />
        <div className="absolute bottom-8 left-8 h-5 w-5 bg-black" />
        <div className="absolute bottom-8 right-8 h-5 w-5 bg-black" />

        <div className="absolute right-16 top-16 flex h-20 w-20 flex-col items-center justify-center">
          <QRCodeSVG value={qrPayload} size={80} level="M" />
        </div>

        {/* Render Saved Elements using blueprint instead of template */}
        {blueprint.elements.map((el) => (
          <div
            key={el.id}
            style={{
              position: "absolute",
              left: `${el.x}px`,
              top: `${el.y}px`,
            }}
            className="p-1"
          >
            {el.type === "header_block" && <HeaderBlockPreview {...el} />}
            {el.type === "text_field" && (
              <div
                style={{
                  fontSize: `${el.fontSize}px`,
                  fontWeight: el.fontWeight,
                  whiteSpace: "pre-wrap",
                  color: "#000",
                }}
              >
                {el.text}
              </div>
            )}
            {el.type === "question_block" && <QuestionBlockPreview {...el} />}
            {el.type === "id_grid" && <IdGridPreview digits={el.digits} />}
          </div>
        ))}
      </div>
    </div>
  );
}
