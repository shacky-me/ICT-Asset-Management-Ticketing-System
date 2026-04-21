"use client";

import ReportCard from "@/components/reports/ReportCard";
import { exportToCSV } from "@/app/utils/csvUtils";
import { exportSimpleTableToPDF } from "@/app/utils/pdfUtils";
import { useAssignments } from "@/lib/assignments";
import { useAssets } from "@/lib/assets";
import { useTickets } from "@/lib/tickets";
import { useDashboardSearch } from "@/lib/dashboardSearch";
import { useMemo, useState } from "react";

const reports = [
  {
    title: "Full Asset Register",
    description: "Complete list of all 1000 assets with all fields",
    formats: ["PDF", "CSV"],
    icon: "chart",
    color: "text-blue-500",
    bg: "bg-blue-50",
  },
  {
    title: "Assignment History",
    description: "All active and historical asset assignments",
    formats: ["PDF", "CSV"],
    icon: "users",
    color: "text-green-500",
    bg: "bg-green-50",
  },
  {
    title: "Assets by Status",
    description: "Assigned, In Store, Maintenance, Flagged breakdown",
    formats: ["PDF", "CSV"],
    icon: "chart",
    color: "text-purple-500",
    bg: "bg-purple-50",
  },
  {
    title: "Ticket Summary Report",
    description: "All tickets by status, priority, and department",
    formats: ["PDF", "CSV"],
    icon: "ticket",
    color: "text-orange-500",
    bg: "bg-orange-50",
  },
  {
    title: "Warranty Expiry Report",
    description: "19 assets with warranties expiring in 30 days",
    formats: ["PDF"],
    icon: "warning",
    color: "text-red-500",
    bg: "bg-red-50",
  },
  {
    title: "Unassigned Assets",
    description: "287 assets in store and available for deployment",
    formats: ["PDF", "CSV"],
    icon: "store",
    color: "text-teal-500",
    bg: "bg-teal-50",
  },
  {
    title: "Depreciation Summary",
    description: "Asset value and depreciation schedule by category",
    formats: ["PDF", "CSV"],
    icon: "chart",
    color: "text-indigo-500",
    bg: "bg-indigo-50",
  },
  {
    title: "Lost/Stolen Assets",
    description: "8 flagged assets with incident reference numbers",
    formats: ["PDF", "CSV"],
    icon: "warning",
    color: "text-red-500",
    bg: "bg-red-50",
  },
];

const ReportsPage = () => {
  const [exporting, setExporting] = useState<string | null>(null);
  const { items: assignments } = useAssignments();
  const { assets: assetRecords } = useAssets();
  const { stats: ticketStats } = useTickets();
  const query = useDashboardSearch().trim().toLowerCase();

  const filteredReports = useMemo(() => {
    if (!query) return reports;
    return reports.filter(
      (report) =>
        report.title.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query),
    );
  }, [query]);

  const handleExport = (title: string, format: "PDF" | "CSV") => {
    setExporting(`${title}:${format}`);

    const assignmentRows = assignments.map((item) => ({
      Ref: item.ref,
      "Asset Tag": item.assetTag,
      Asset: item.assetName,
      "Assigned To": item.assignedTo,
      Department: item.department,
      Status: item.status,
      "Date Issued": item.dateIssued,
    }));

    const assetRows = assetRecords.map((item) => ({
      "Asset Tag": item.tag,
      Name: item.name,
      Category: item.category,
      Make: item.make,
      Model: item.model,
      Status: item.status,
      Department: item.department,
      Warranty: item.warranty,
    }));

    const statusBreakdown = [
      {
        Status: "Assigned",
        Count: assetRecords.filter((item) => item.status === "Assigned").length,
      },
      {
        Status: "In Store",
        Count: assetRecords.filter((item) => item.status === "In Store").length,
      },
      {
        Status: "Maintenance",
        Count: assetRecords.filter((item) => item.status === "Maintenance")
          .length,
      },
      {
        Status: "Flagged",
        Count: assetRecords.filter((item) => item.status === "Flagged").length,
      },
    ];

    const depreciationByCategory = Object.entries(
      assetRecords.reduce<Record<string, number>>((acc, item) => {
        acc[item.category] = (acc[item.category] || 0) + 1;
        return acc;
      }, {}),
    ).map(([category, count]) => ({ Category: category, Assets: count }));

    const flaggedAssets = assetRows
      .filter((item) => item.Status === "Flagged")
      .map((item, index) => ({
        "Asset Tag": item["Asset Tag"],
        Status: item.Status,
        IncidentRef: `INC-${new Date().getFullYear()}-${String(index + 1).padStart(3, "0")}`,
      }));

    const reportMap: Record<string, Array<Record<string, string | number>>> = {
      "Full Asset Register": assetRows,
      "Assignment History": assignmentRows,
      "Assets by Status": statusBreakdown,
      "Ticket Summary Report": [
        { Type: "Open", Count: ticketStats.open },
        { Type: "In Progress", Count: ticketStats.inProgress },
        { Type: "Pending", Count: ticketStats.pending },
        { Type: "Resolved", Count: ticketStats.resolved },
      ],
      "Warranty Expiry Report": assetRows.filter(
        (item) =>
          item.Warranty !== "Unknown" && Date.parse(item.Warranty) < Date.now(),
      ),
      "Unassigned Assets": assetRows.filter(
        (item) => item.Status === "In Store",
      ),
      "Depreciation Summary": depreciationByCategory,
      "Lost/Stolen Assets": flaggedAssets,
    };

    const rows = reportMap[title] || [];
    const fileBase = title.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    if (format === "CSV") {
      exportToCSV(rows, `${fileBase}.csv`);
    } else {
      exportSimpleTableToPDF(title, rows, `${fileBase}.pdf`);
    }

    setExporting(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-base font-bold text-gray-900">Reports & Exports</h1>
        <p className="text-xs text-gray-400">
          Generate and download official ICT reports
        </p>
      </div>

      {/* Report cards grid */}
      <div className="grid grid-cols-2 gap-4">
        {filteredReports.map((report) => (
          <ReportCard
            key={report.title}
            {...report}
            isExporting={exporting?.startsWith(report.title) || false}
            onExportPDF={
              report.formats.includes("PDF")
                ? () => handleExport(report.title, "PDF")
                : undefined
            }
            onExportCSV={
              report.formats.includes("CSV")
                ? () => handleExport(report.title, "CSV")
                : undefined
            }
          />
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
