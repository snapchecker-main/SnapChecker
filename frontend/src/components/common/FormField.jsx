import SecondaryButton from "./SecondaryButton";
import { cn } from "../../lib/cn";

export default function Modal({
  open,
  title,
  children,
  onClose,
  width = "600px",
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        style={{ maxWidth: width }}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          "w-full",
          "max-h-[80vh]",
          "overflow-y-auto",
          "rounded-lg",
          "bg-white",
          "p-6",
          "shadow-xl",
        )}
      >
        <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-3">
          <h2 className="text-base font-semibold text-gray-900">{title}</h2>

          <SecondaryButton onClick={onClose}>Close</SecondaryButton>
        </div>

        <div className="flex flex-col gap-4">{children}</div>
      </div>
    </div>
  );
}
