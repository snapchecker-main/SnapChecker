import { cn } from "../../lib/cn";

const accents = {
  neutral: "border-l-gray-200",
  primary: "border-l-primary",
  success: "border-l-green-500",
  warning: "border-l-amber-500",
  danger: "border-l-red-500",
};

export default function StatCard({
  title,
  value,
  subtitle,
  color = "neutral",
  className,
}) {
  return (
    <div
      className={cn(
        "border-l-4",
        "px-4 py-3",
        accents[color] ?? accents.neutral,
        className,
      )}
    >
      <p className="text-[11px] font-medium uppercase tracking-wide text-gray-500">
        {title}
      </p>

      <p className="mt-1 text-2xl font-semibold leading-none text-gray-900">
        {value}
      </p>

      {subtitle && <p className="mt-1.5 text-xs text-gray-500">{subtitle}</p>}
    </div>
  );
}
