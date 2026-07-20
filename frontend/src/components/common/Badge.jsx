import { cn } from "../../lib/cn";

const variants = {
  primary: "bg-blue-50 text-blue-700 ring-blue-200",
  success: "bg-green-50 text-green-700 ring-green-200",
  warning: "bg-amber-50 text-amber-700 ring-amber-200",
  danger: "bg-red-50 text-primary ring-red-200",
  neutral: "bg-gray-100 text-gray-600 ring-gray-200",
};

export default function Badge({
  children,
  variant = "primary",
  className,
  ...props
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center",
        "rounded px-2 py-0.5",
        "text-[11px] font-medium ring-1 ring-inset",
        variants[variant] ?? variants.primary,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
