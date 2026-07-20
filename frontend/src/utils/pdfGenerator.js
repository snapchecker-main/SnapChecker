import html2canvas from "html2canvas-pro"; // The upgraded library to fix the oklch crash!
import { jsPDF } from "jspdf";
import QRCode from "qrcode";
import toast from "react-hot-toast";

export const generatePDF = async (canvasElementId, paperType = "A4") => {
  const element = document.getElementById(canvasElementId);
  if (!element) {
    toast.error("Unable to generate preview.");
    return;
  }

  try {
    const canvas = await html2canvas(element, {
      scale: 2, // High resolution
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
    });

    const imgData = canvas.toDataURL("image/jpeg", 1.0);

    let pdfFormat;
    switch (paperType) {
      case "LETTER":
        pdfFormat = "letter";
        break;
      case "LEGAL":
        pdfFormat = "legal";
        break;
      case "A4":
      default:
        pdfFormat = "a4";
        break;
    }

    const pdf = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: pdfFormat,
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, "JPEG", 0, 0, pdfWidth, pdfHeight);
    pdf.save(`exam_template_${Date.now()}.pdf`);
  } catch {
    toast.error("Failed to generate PDF.");
  }
};

export const generateAnswerSheet = async (template) => {
  const doc = new jsPDF({ format: "a4", unit: "pt" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const markerSize = 20;
  const margin = 30;
  doc.setFillColor(0, 0, 0);
  doc.rect(margin, margin, markerSize, markerSize, "F");
  doc.rect(
    pageWidth - margin - markerSize,
    margin,
    markerSize,
    markerSize,
    "F",
  );
  doc.rect(
    margin,
    pageHeight - margin - markerSize,
    markerSize,
    markerSize,
    "F",
  );
  doc.rect(
    pageWidth - margin - markerSize,
    pageHeight - margin - markerSize,
    markerSize,
    markerSize,
    "F",
  );

  // 2. Generate and Add the QR Code
  try {
    const qrDataUrl = await QRCode.toDataURL(
      JSON.stringify({ template_id: template.id }),
      { margin: 0 },
    );
    doc.addImage(
      qrDataUrl,
      "PNG",
      pageWidth - margin - 70,
      margin + 30,
      60,
      60,
    );
  } catch {
    toast.error("Failed to generate QR code.");
  }

  // 3. Draw Header Information
  doc.setFontSize(18);
  doc.text(template.name, margin + 40, margin + 40);
  doc.setFontSize(12);
  doc.setTextColor(100, 100, 100);
  doc.text(
    `${template.exam_type}  |  ${template.num_items} Items  |  ${template.num_choices} Choices`,
    margin + 40,
    margin + 55,
  );

  doc.setTextColor(0, 0, 0);

  // Student Name Line (Left side)
  doc.text(
    "Student Name: _________________________________",
    margin + 40,
    margin + 95,
  );
  doc.text("Section: _____________", margin + 40, margin + 130);

  // 4. Draw the 2-Digit Roster Number Grid (Right side)
  doc.setFontSize(10);
  doc.text("Roster #", pageWidth - margin - 150, margin + 95);

  const rosterGridX = pageWidth - margin - 150;
  const rosterGridY = margin + 110;

  for (let col = 0; col < 2; col++) {
    for (let num = 0; num <= 9; num++) {
      const bubbleX = rosterGridX + col * 20;
      const bubbleY = rosterGridY + num * 18;

      doc.setDrawColor(150);
      doc.circle(bubbleX, bubbleY, 6, "S");
      doc.setFontSize(7);
      doc.text(num.toString(), bubbleX, bubbleY + 2.5, { align: "center" });
    }
  }

  // 5. Draw the Main Answer Bubble Grid
  const startY = 320;
  const numCols = 4;
  const itemsPerCol = Math.ceil(template.num_items / numCols);
  const colWidth = (pageWidth - margin * 2) / numCols;
  const rowHeight = 24;
  const choiceLabels = ["A", "B", "C", "D", "E", "F"];

  doc.setFontSize(10);
  for (let i = 0; i < template.num_items; i++) {
    const col = Math.floor(i / itemsPerCol);
    const row = i % itemsPerCol;

    const x = margin + col * colWidth;
    const y = startY + row * rowHeight;

    doc.text(`${i + 1}.`, x + 10, y, { align: "right" });

    for (let c = 0; c < template.num_choices; c++) {
      const bubbleX = x + 25 + c * 18;
      const bubbleY = y - 3;

      doc.setDrawColor(150);
      doc.circle(bubbleX, bubbleY, 6, "S");

      doc.setFontSize(7);
      doc.text(choiceLabels[c], bubbleX, bubbleY + 2.5, { align: "center" });
      doc.setFontSize(10);
    }
  }

  // 6. Trigger the automatic download
  doc.save(`${template.name.replace(/\s+/g, "_")}_Answer_Sheet.pdf`);
};
