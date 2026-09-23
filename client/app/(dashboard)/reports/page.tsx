"use client";

import ReportCard from "@/components/reports/ReportCard";
import { exportToCSV } from "@/app/utils/csvUtils";
import { exportSimpleTableToPDF } from "@/app/utils/pdfUtils";
import type { ReportMeta } from "@/app/utils/reportLetterhead";
import {
  fetchAllAssignments,
  useAssignments,
  type AssignmentRecord,
} from "@/lib/assignments";
import { fetchAllAssets, useAssets, type AssetRow } from "@/lib/assets";
import { useTickets, type TicketRow } from "@/lib/tickets";
import { useDashboardSearch } from "@/lib/dashboardSearch";
import { readCurrentUser } from "@/lib/session";
import {
  currentFinancialYear,
  financialYearOptions,
  formatLongDate,
  fyEndLabel,
  fyLabel,
  fyRangeLabel,
  isOnOrBeforeFinancialYearEnd,
  isWithinFinancialYear,
  type FinancialYear,
} from "@/lib/financialYear";
import { useMemo, useState } from "react";

const ALL_YEARS = "all";

type ReportKind = "assets" | "assignments" | "tickets";

const REPORT_KIND: Record<string, ReportKind> = {
  "Full Asset Register": "assets",
  "Assignment History": "assignments",
  "Assets by Status": "assets",
  "Ticket Summary Report": "tickets",
  "Warranty Expiry Report": "assets",
  "Unassigned Assets": "assets",
  "Depreciation Summary": "assets",
  "Lost/Stolen Assets": "assets",
};

function filterAssets(assets: AssetRow[], fy: FinancialYear | null) {
  if (!fy) return assets;
  return assets.filter((item) => isOnOrBeforeFinancialYearEnd(item.acquiredAt, fy));
}

function filterAssignments(
  assignments: AssignmentRecord[],
  fy: FinancialYear | null,
) {
  if (!fy) return assignments;
  return assignments.filter((item) => isWithinFinancialYear(item.dateIssued, fy));
}

function filterTickets(tickets: TicketRow[], fy: FinancialYear | null) {
  if (!fy) return tickets;
  return tickets.filter((item) => isWithinFinancialYear(item.createdAt, fy));
}

function countByStatus(assets: AssetRow[], status: AssetRow["status"]) {
  return assets.filter((item) => item.status === status).length;
}

const ReportsPage = () => {
  const [exporting, setExporting] = useState<string | null>(null);
  const { items: assignments } = useAssignments();
  const { assets: assetRecords } = useAssets();
  const { tickets } = useTickets();
  const query = useDashboardSearch().trim().toLowerCase();
  const [fyValue, setFyValue] = useState<string>(
    String(currentFinancialYear().startYear),
  );

  const fyOptions = useMemo(
    () =>
      financialYearOptions([
        ...assetRecords.map((item) => item.acquiredAt),
        ...assignments.map((item) => item.dateIssued),
        ...tickets.map((item) => item.createdAt),
      ]),
    [assetRecords, assignments, tickets],
  );

  const selectedFy = useMemo<FinancialYear | null>(
    () => (fyValue === ALL_YEARS ? null : { startYear: Number(fyValue) }),
    [fyValue],
  );

  const reports = useMemo(() => {
    const assetsInScope = filterAssets(assetRecords, selectedFy);
    const assignmentsInScope = filterAssignments(assignments, selectedFy);
    const ticketsInScope = filterTickets(tickets, selectedFy);
    const expiredWarranties = assetsInScope.filter(
      (item) => item.warranty === "Expired",
    ).length;

    return [
      {
        title: "Full Asset Register",
        description: `Complete list of all ${assetsInScope.length} assets with all fields`,
        formats: ["PDF", "CSV"],
        icon: "chart",
        color: "text-blue-500",
        bg: "bg-blue-50",
      },
      {
        title: "Assignment History",
        description: `All ${assignmentsInScope.length} asset assignments issued in the period`,
        formats: ["PDF", "CSV"],
        icon: "users",
        color: "text-green-500",
        bg: "bg-green-50",
      },
      {
        title: "Assets by Status",
        description: `Assigned ${countByStatus(assetsInScope, "Assigned")}, In Store ${countByStatus(assetsInScope, "In Store")}, Maintenance ${countByStatus(assetsInScope, "Maintenance")}, Flagged ${countByStatus(assetsInScope, "Flagged")} breakdown`,
        formats: ["PDF", "CSV"],
        icon: "chart",
        color: "text-purple-500",
        bg: "bg-purple-50",
      },
      {
        title: "Ticket Summary Report",
        description: `All ${ticketsInScope.length} tickets raised in the period, by status`,
        formats: ["PDF", "CSV"],
        icon: "ticket",
        color: "text-orange-500",
        bg: "bg-orange-50",
      },
      {
        title: "Warranty Expiry Report",
        description: `${expiredWarranties} assets with expired warranties`,
        formats: ["PDF"],
        icon: "warning",
        color: "text-red-500",
        bg: "bg-red-50",
      },
      {
        title: "Unassigned Assets",
        description: `${countByStatus(assetsInScope, "In Store")} assets in store and available for deployment`,
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
        description: `${countByStatus(assetsInScope, "Flagged")} flagged assets with incident reference numbers`,
        formats: ["PDF", "CSV"],
        icon: "warning",
        color: "text-red-500",
        bg: "bg-red-50",
      },
    ];
  }, [assetRecords, assignments, tickets, selectedFy]);

  const filteredReports = useMemo(() => {
    if (!query) return reports;
    return reports.filter(
      (report) =>
        report.title.toLowerCase().includes(query) ||
        report.description.toLowerCase().includes(query),
    );
  }, [query, reports]);

  const buildMeta = (title: string): ReportMeta => {
    const kind = REPORT_KIND[title];
    const preparedBy = readCurrentUser()?.name;

    if (!selectedFy) {
      return {
        title,
        period: `All Records as at ${formatLongDate(new Date())}`,
        preparedBy,
      };
    }

    const period = `Financial Year ${selectedFy.startYear}/${selectedFy.startYear + 1} (${fyRangeLabel(selectedFy)})`;
    const basis =
      kind === "assets"
        ? `Assets held as at ${fyEndLabel(selectedFy)} (acquired on or before that date). Status and warranty are shown as currently recorded.`
        : kind === "assignments"
          ? `Assignments issued from ${fyRangeLabel(selectedFy)}.`
          : `Tickets raised from ${fyRangeLabel(selectedFy)}.`;

    return { title, period, basis, preparedBy };
  };

  const handleExport = async (title: string, format: "PDF" | "CSV") => {
    const kind = REPORT_KIND[title];

    if (
      kind === "tickets" &&
      selectedFy &&
      tickets.length > 0 &&
      tickets.every((item) => !item.createdAt)
    ) {
      window.alert(
        "Ticket dates are not available from the server yet, so tickets cannot be filtered by financial year. Update and restart the backend, or choose \"All years\".",
      );
      return;
    }

    setExporting(`${title}:${format}`);

    try {
      // Load every record so a full-year report is not cut off at the list limit.
      const [allAssets, allAssignments] = await Promise.all([
        kind === "assets" ? fetchAllAssets() : Promise.resolve(assetRecords),
        kind === "assignments"
          ? fetchAllAssignments()
          : Promise.resolve(assignments),
      ]);

      const assetsInScope = filterAssets(allAssets, selectedFy);
      const assignmentsInScope = filterAssignments(allAssignments, selectedFy);
      const ticketsInScope = filterTickets(tickets, selectedFy);

      const assignmentRows = assignmentsInScope.map((item) => ({
        Ref: item.ref,
        "Asset Tag": item.assetTag,
        Asset: item.assetName,
        "Assigned To": item.assignedTo,
        Department: item.department,
        Status: item.status,
        "Date Issued": item.dateIssued,
      }));

      const assetRows = assetsInScope.map((item) => ({
        "Asset Tag": item.tag,
        Name: item.name,
        Category: item.category,
        Make: item.make,
        Model: item.model,
        Status: item.status,
        Department: item.department,
        Warranty: item.warranty,
        "Acquired On": item.acquiredAt ? item.acquiredAt.slice(0, 10) : "",
      }));

      const statusBreakdown = (
        ["Assigned", "In Store", "Maintenance", "Flagged"] as const
      ).map((status) => ({
        Status: status,
        Count: countByStatus(assetsInScope, status),
      }));

      const depreciationByCategory = Object.entries(
        assetsInScope.reduce<Record<string, number>>((acc, item) => {
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

      const ticketSummary = (
        ["Open", "In Progress", "Pending", "Resolved"] as const
      ).map((status) => ({
        Type: status,
        Count: ticketsInScope.filter((item) => item.status === status).length,
      }));

      const reportMap: Record<string, Array<Record<string, string | number>>> =
        {
          "Full Asset Register": assetRows,
          "Assignment History": assignmentRows,
          "Assets by Status": statusBreakdown,
          "Ticket Summary Report": ticketSummary,
          "Warranty Expiry Report": assetRows.filter(
            (item) => item.Warranty === "Expired",
          ),
          "Unassigned Assets": assetRows.filter(
            (item) => item.Status === "In Store",
          ),
          "Depreciation Summary": depreciationByCategory,
          "Lost/Stolen Assets": flaggedAssets,
        };

      const rows = reportMap[title] || [];
      const periodSlug = selectedFy
        ? `fy-${selectedFy.startYear}-${selectedFy.startYear + 1}`
        : "all-records";
      const fileBase = `${title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${periodSlug}`;
      const meta = buildMeta(title);

      if (format === "CSV") {
        if (rows.length === 0) {
          window.alert("There are no records for this report in the selected period.");
          return;
        }
        exportToCSV(rows, `${fileBase}.csv`, meta);
      } else {
        await exportSimpleTableToPDF(meta, rows, `${fileBase}.pdf`);
      }
    } catch (error) {
      console.error("Report export failed", error);
      window.alert("The report could not be generated. Please try again.");
    } finally {
      setExporting(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-base font-bold text-gray-900">Reports & Exports</h1>
          <p className="text-xs text-gray-400">
            Generate and download official ICT reports
          </p>
        </div>

        <label className="flex flex-col gap-1 text-xs text-gray-500">
          Financial year
          <select
            value={fyValue}
            onChange={(event) => setFyValue(event.target.value)}
            className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm font-medium text-gray-900 focus:border-[#1E3A6E] focus:outline-none"
          >
            {fyOptions.map((fy) => (
              <option key={fy.startYear} value={fy.startYear}>
                {fyLabel(fy)} ({fyRangeLabel(fy)})
              </option>
            ))}
            <option value={ALL_YEARS}>All years</option>
          </select>
        </label>
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
