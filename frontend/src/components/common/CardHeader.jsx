import { cn } from "../../lib/cn";

export default function CardHeader({ title, detail, actions, className }) {
  return (
    <div
      className={cn(
        "flex min-h-14 items-center justify-between gap-3",
        "border-b border-gray-100",
        "px-5 py-3",
        className,
      )}
    >
      <div>
        <h2 className="text-sm font-semibold text-gray-900">{title}</h2>

        {detail && <p className="mt-0.5 text-xs text-gray-500">{detail}</p>}
      </div>

      {actions}
    </div>
  );
}
