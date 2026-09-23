import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import {
  LETTERHEAD_LINES,
  SYSTEM_NAME,
  generatedLine,
  loadCoatOfArms,
  type ReportMeta,
} from "@/app/utils/reportLetterhead";

const NAVY: [number, number, number] = [30, 58, 110];
const GREY: [number, number, number] = [100, 100, 100];

export async function exportSimpleTableToPDF(
  meta: ReportMeta,
  rows: Array<Record<string, string | number>>,
  fileName: string,
) {
  const orientation =
    rows.length > 0 && Object.keys(rows[0]).length > 6
      ? "landscape"
      : "portrait";
  const doc = new jsPDF({ unit: "pt", format: "a4", orientation });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const centerX = pageWidth / 2;
  const margin = 36;
  const coatOfArms = await loadCoatOfArms();

  // Full letterhead on the first page.
  let y = 36;
  if (coatOfArms) {
    const width = 50;
    const height = width * (236 / 250);
    doc.addImage(coatOfArms, "PNG", centerX - width / 2, y, width, height);
    y += height + 16;
  } else {
    y += 12;
  }

  doc.setTextColor(0, 0, 0);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(LETTERHEAD_LINES[0], centerX, y, { align: "center" });
  y += 14;
  doc.setFontSize(10);
  doc.text(LETTERHEAD_LINES[1], centerX, y, { align: "center" });
  y += 13;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(LETTERHEAD_LINES[2], centerX, y, { align: "center" });
  y += 10;

  doc.setDrawColor(...NAVY);
  doc.setLineWidth(1.5);
  doc.line(margin, y, pageWidth - margin, y);
  doc.setLineWidth(0.5);
  doc.line(margin, y + 3, pageWidth - margin, y + 3);
  y += 24;

  doc.setTextColor(...NAVY);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.text(meta.title.toUpperCase(), centerX, y, { align: "center" });
  y += 16;

  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text(meta.period, centerX, y, { align: "center" });
  y += 13;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(8.5);
  doc.setTextColor(...GREY);
  if (meta.basis) {
    doc.text(meta.basis, centerX, y, { align: "center" });
    y += 12;
  }
  doc.text(generatedLine(meta), centerX, y, { align: "center" });
  y += 16;

  const headers = rows.length > 0 ? Object.keys(rows[0]) : [];

  if (headers.length === 0) {
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text("No records for this period.", centerX, y + 10, {
      align: "center",
    });
  } else {
    const body = rows.map((row) =>
      headers.map((header) => String(row[header] ?? "")),
    );

    autoTable(doc, {
      head: [headers],
      body,
      startY: y,
      margin: { top: 60, right: margin, bottom: 48, left: margin },
      tableWidth: "auto",
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 9,
        cellPadding: { top: 5, right: 7, bottom: 5, left: 7 },
        overflow: "linebreak",
        valign: "middle",
        textColor: [20, 20, 20],
        lineColor: [210, 214, 220],
        lineWidth: 0.6,
      },
      headStyles: {
        fillColor: NAVY,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        halign: "left",
        valign: "middle",
        minCellHeight: 22,
      },
      bodyStyles: {
        minCellHeight: 20,
        halign: "left",
      },
      alternateRowStyles: {
        fillColor: [245, 247, 251],
      },
      didDrawPage: (data) => {
        if (data.pageNumber === 1) return;
        // Running header on continuation pages.
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8.5);
        doc.setTextColor(...NAVY);
        doc.text("SDJHRCA  |  ICT Department", margin, 32);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(...GREY);
        doc.text(`${meta.title}  |  ${meta.period}`, pageWidth - margin, 32, {
          align: "right",
        });
        doc.setDrawColor(...NAVY);
        doc.setLineWidth(0.5);
        doc.line(margin, 40, pageWidth - margin, 40);
      },
    });
  }

  // Footer with page numbers, drawn once the page count is known.
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page++) {
    doc.setPage(page);
    doc.setDrawColor(210, 214, 220);
    doc.setLineWidth(0.5);
    doc.line(margin, pageHeight - 34, pageWidth - margin, pageHeight - 34);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(...GREY);
    doc.text(`${SYSTEM_NAME}  |  Official Report`, margin, pageHeight - 22);
    doc.text(`Page ${page} of ${pageCount}`, pageWidth - margin, pageHeight - 22, {
      align: "right",
    });
  }

  doc.save(fileName);
}
