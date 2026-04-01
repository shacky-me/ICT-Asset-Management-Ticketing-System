import { jsPDF } from "jspdf";

export function exportSimpleTableToPDF(
  title: string,
  rows: Array<Record<string, string | number>>,
  fileName: string,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 40;
  let y = 50;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(title, margin, y);
  y += 24;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text(`Generated: ${new Date().toLocaleString()}`, margin, y);
  y += 20;

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];
  if (headers.length === 0) {
    doc.text("No data available.", margin, y);
    doc.save(fileName);
    return;
  }

  const colWidth = (pageWidth - margin * 2) / headers.length;

  doc.setFont("helvetica", "bold");
  headers.forEach((header, index) => {
    doc.text(header, margin + index * colWidth, y);
  });
  y += 14;
  doc.line(margin, y, pageWidth - margin, y);
  y += 12;

  doc.setFont("helvetica", "normal");
  rows.slice(0, 60).forEach((row) => {
    if (y > 760) {
      doc.addPage();
      y = 50;
    }

    headers.forEach((header, index) => {
      const value = String(row[header] ?? "");
      const text = doc.splitTextToSize(value, colWidth - 8);
      doc.text(text, margin + index * colWidth, y);
    });
    y += 18;
  });

  doc.save(fileName);
}
