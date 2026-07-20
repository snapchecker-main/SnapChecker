import { cn } from "../../lib/cn";

export default function Input({ className, type = "text", ...props }) {
  return (
    <input
      type={type}
      className={cn(
        "h-9 w-full",
        "rounded-md",
        "border border-gray-200",
        "bg-white",
        "px-3",
        "text-xs text-gray-700",
        "placeholder:text-gray-400",
        "transition-all duration-200", // Smoother focus animation
        "outline-none",
        "focus:border-primary/60",
        "focus:ring-2 focus:ring-primary/15",
        "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50",
        className,
      )}
      {...props}
    />
  );
}
