import { Loader2 } from "lucide-react";
import { cn } from "../../lib/cn";

const variants = {
  primary:
    "bg-primary text-white font-semibold hover:bg-[#a80d27] focus:ring-primary/30",
  secondary:
    "border border-gray-200 bg-white text-gray-700 font-medium hover:bg-gray-50 focus:ring-gray-200",
  danger:
    "bg-red-600 text-white font-semibold hover:bg-red-700 focus:ring-red-500/30",
  warning:
    "bg-amber-500 text-white font-semibold hover:bg-amber-600 focus:ring-amber-500/30",
};

const sizes = {
  sm: "h-8 px-3 text-[11px]",
  md: "h-9 px-3 text-xs", // Updated to Figma standard
  lg: "h-10 px-5 text-sm",
};

export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  loading = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  className,
  ...props
}) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex items-center justify-center gap-1.5",
        "rounded-md",
        "transition-colors duration-150",
        "focus:outline-none focus:ring-2",
        "disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
}
