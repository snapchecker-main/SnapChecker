import { cn } from "../../lib/cn";

export default function EmptyState({
  title,
  description,
  icon = "",
  action,
  className,
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center",
        "rounded-lg border border-dashed border-gray-300",
        "bg-gray-50",
        "px-6 py-16",
        "text-center",
        className,
      )}
    >
      <div className="mb-4 text-[40px] opacity-80">{icon}</div>

      <h3 className="text-sm font-semibold text-gray-900">{title}</h3>

      {description && (
        <p className="mt-1 max-w-md text-xs leading-5 text-gray-500">
          {description}
        </p>
      )}

      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
