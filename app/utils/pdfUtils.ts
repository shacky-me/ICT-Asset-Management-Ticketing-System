import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export function exportSimpleTableToPDF(
  title: string,
  rows: Array<Record<string, string | number>>,
  fileName: string,
) {
  const orientation =
    rows.length > 0 && Object.keys(rows[0]).length > 6
      ? "landscape"
      : "portrait";
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation });
  const margin = 28;
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(title, margin, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 18;

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  if (headers.length === 0) {
    doc.text("No data available.", margin, y);
    doc.save(fileName);
    return;
  }

  const body = rows
    .slice(0, 200)
    .map((row) => headers.map((header) => String(row[header] ?? "")));

  autoTable(doc, {
    head: [headers],
    body,
    startY: y,
    margin: { top: 28, right: margin, bottom: 28, left: margin },
    tableWidth: "auto",
    theme: "grid",
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: { top: 6, right: 8, bottom: 6, left: 8 },
      overflow: "linebreak",
      valign: "middle",
      textColor: [20, 20, 20],
      lineColor: [220, 220, 220],
      lineWidth: 0.6,
    },
    headStyles: {
      fillColor: [37, 95, 231],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      halign: "left",
      valign: "middle",
      minCellHeight: 24,
    },
    bodyStyles: {
      minCellHeight: 22,
      halign: "left",
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    didDrawPage: () => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(16);
      doc.text(title, margin, 50);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(`Generated: ${new Date().toLocaleString()}`, margin, 78);
    },
  });

  doc.save(fileName);
}
