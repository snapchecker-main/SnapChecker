import { cn } from "../../lib/cn";

export default function Select({ className, children, ...props }) {
  return (
    <select
      className={cn(
        "h-9 w-full",
        "rounded-md",
        "border border-gray-200",
        "bg-white",
        "px-3",
        "text-xs text-gray-700",
        "outline-none",
        "transition-colors",
        "focus:border-primary/60 focus:ring-2 focus:ring-primary/15",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </select>
  );
}
