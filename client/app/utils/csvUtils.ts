import Papa from "papaparse";
import {
  LETTERHEAD_LINES,
  generatedLine,
  type ReportMeta,
} from "@/app/utils/reportLetterhead";

export const exportToCSV = (
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any[],
  fileName: string,
  meta: ReportMeta,
) => {
  if (!data || data.length === 0) return;

  // Letterhead rows above the table, one value per row.
  const headerLines = [
    ...LETTERHEAD_LINES,
    "",
    meta.title.toUpperCase(),
    meta.period,
    ...(meta.basis ? [meta.basis] : []),
    generatedLine(meta),
    "",
  ];
  const letterhead = Papa.unparse(headerLines.map((line) => [line]));
  const table = Papa.unparse(data);

  // BOM so Excel reads the file as UTF-8.
  const csv = `﻿${letterhead}\r\n${table}`;

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};
