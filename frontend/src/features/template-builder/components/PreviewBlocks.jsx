export const HeaderBlockPreview = ({
  f1,
  f2,
  f3,
  f4,
  l1,
  l2,
  l3,
  l4,
  fontFamily,
  fontSize,
  fontWeight,
}) => (
  <div
    className="flex flex-col gap-4 text-black"
    style={{
      fontFamily: fontFamily || "sans-serif",
      fontSize: fontSize ? `${fontSize}px` : "12px",
      fontWeight: fontWeight || "600",
    }}
  >
    <div className="flex gap-6">
      <div className="flex items-end gap-2">
        <span className="whitespace-nowrap" style={{ fontWeight: "inherit" }}>
          {f1}:
        </span>
        <div
          className="h-4 border-b border-black"
          style={{ width: `${l1}px` }}
        ></div>
      </div>
      <div className="flex items-end gap-2">
        <span className="whitespace-nowrap" style={{ fontWeight: "inherit" }}>
          {f2}:
        </span>
        <div
          className="h-4 border-b border-black"
          style={{ width: `${l2}px` }}
        ></div>
      </div>
    </div>
    <div className="flex gap-6">
      <div className="flex items-end gap-2">
        <span className="whitespace-nowrap" style={{ fontWeight: "inherit" }}>
          {f3}:
        </span>
        <div
          className="h-4 border-b border-black"
          style={{ width: `${l3}px` }}
        ></div>
      </div>
      <div className="flex items-end gap-2">
        <span className="whitespace-nowrap" style={{ fontWeight: "inherit" }}>
          {f4}:
        </span>
        <div
          className="h-4 border-b border-black"
          style={{ width: `${l4}px` }}
        ></div>
      </div>
    </div>
  </div>
);

export const QuestionBlockPreview = ({
  start_q,
  end_q,
  choices,
  columns,
  colGap,
}) => {
  const totalItems = Math.max(1, end_q - start_q + 1);
  const labels = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J"].slice(
    0,
    choices,
  );
  const itemsPerColumn = Math.ceil(totalItems / columns);
  const chunkedColumns = Array.from({ length: columns }, (_, colIndex) => {
    const start = colIndex * itemsPerColumn;
    return Array.from({ length: itemsPerColumn })
      .map((_, i) => start_q + start + i)
      .filter((qNum) => qNum <= end_q);
  });

  return (
    <div className="flex" style={{ gap: `${colGap}px` }}>
      {chunkedColumns.map((col, colIndex) => (
        <div key={colIndex} className="flex flex-col gap-2">
          {col.map((qNum) => (
            <div key={qNum} className="flex items-center gap-2">
              <span className="w-5 text-right text-[10px] font-medium text-gray-700">
                {qNum}.
              </span>
              <div className="flex gap-1">
                {labels.map((label) => (
                  <div
                    key={label}
                    className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-gray-400 bg-white text-[9px] font-medium text-gray-500"
                  >
                    {label}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
};

export const IdGridPreview = ({ digits }) => (
  <div className="flex gap-2">
    {Array.from({ length: digits }).map((_, colIndex) => (
      <div key={colIndex} className="flex flex-col items-center gap-1">
        <div className="mb-1 h-5 w-5 border border-gray-800 bg-white"></div>
        {Array.from({ length: 10 }).map((_, digit) => (
          <div
            key={digit}
            className="flex h-[18px] w-[18px] items-center justify-center rounded-full border border-gray-400 bg-white text-[9px] font-medium text-gray-500"
          >
            {digit}
          </div>
        ))}
      </div>
    ))}
  </div>
);
