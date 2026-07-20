import { Children } from "react";
import { cn } from "../../lib/cn";

export default function FormRow({ children, className }) {
  return (
    <div className={cn("flex gap-3", className)}>
      {Children.map(children, (child) => (
        <div className="flex-1">{child}</div>
      ))}
    </div>
  );
}
