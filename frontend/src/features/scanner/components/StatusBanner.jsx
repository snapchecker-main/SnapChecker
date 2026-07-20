export default function StatusBanner({ status }) {
  if (!status.message) {
    return null;
  }

  return (
    <div
      className={`mt-4 flex items-center justify-center rounded-md border px-3 py-2 text-xs font-medium ${
        status.error
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {status.message}
    </div>
  );
}
