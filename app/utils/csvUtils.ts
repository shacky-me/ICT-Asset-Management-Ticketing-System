import Papa from "papaparse";
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const exportToCSV = (data: any[], fileName: string = "data.csv") => {
  if (!data || data.length === 0) return;

  const csv = Papa.unparse(data);

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();

  URL.revokeObjectURL(url);
};
