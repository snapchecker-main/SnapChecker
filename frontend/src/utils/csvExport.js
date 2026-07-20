export function downloadCSV(filename, headers, rows) {
  const escapeCell = (cell) => {
    let stringified = String(cell ?? "");

    if (/^\d+\/\d+$/.test(stringified.trim())) {
      return `="${stringified.trim()}"`;
    }

    if (
      stringified.includes(",") ||
      stringified.includes('"') ||
      stringified.includes("\n")
    ) {
      return `"${stringified.replace(/"/g, '""')}"`;
    }

    return stringified;
  };

  const csvContent = [
    headers.map(escapeCell).join(","),
    ...rows.map((row) => row.map(escapeCell).join(",")),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
