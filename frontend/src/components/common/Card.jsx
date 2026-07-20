import { cn } from "../../lib/cn";

export default function Card({
  children,
  className,
  style,
  hover = false,
  padding = "md",
  ...props
}) {
  const paddingClasses = {
    none: "p-0",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <div
      style={style}
      className={cn(
        "overflow-hidden",
        "rounded-lg",
        "border border-gray-200",
        "bg-white",
        hover &&
          "transition-all hover:-translate-y-0.5 hover:border-gray-300 hover:shadow-sm",
        paddingClasses[padding],
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
