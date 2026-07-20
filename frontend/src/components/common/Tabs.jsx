export default function Tabs({ items, value, onChange, className = "" }) {
  return (
    <div className={`flex gap-5 overflow-x-auto ${className}`}>
      <div className="flex min-w-max gap-1">
        {items.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => onChange(item.id)}
            className={`relative px-2 py-3 text-xs font-medium transition-colors ${
              value === item.id
                ? "text-primary"
                : "text-gray-500 hover:text-gray-800"
            }`}
          >
            {item.label}

            {item.count !== undefined && (
              <span className="ml-1.5 text-[10px] text-gray-400">
                {item.count}
              </span>
            )}

            {value === item.id && (
              <span className="absolute inset-x-1 bottom-0 h-0.5 bg-primary" />
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
