import { Mail, CheckCircle } from "lucide-react";

export default function SuccessState({
  title,
  message,
  action,
  actionText,
  icon = "mail",
}) {
  return (
    <div className="text-center py-6">
      <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon === "mail" ? (
          <Mail size={32} strokeWidth={1.5} />
        ) : (
          <CheckCircle size={32} strokeWidth={1.5} />
        )}
      </div>
      <h2 className="text-2xl font-bold text-gray-900 tracking-tight">
        {title}
      </h2>
      <p className="mt-3 text-sm text-gray-500 leading-relaxed max-w-sm mx-auto">
        {message}
      </p>

      {action && actionText && (
        <button
          onClick={action}
          className="mt-8 text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
