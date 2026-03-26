"use client";

import { useState } from "react";

// ── Types ─────────────────────────────────────────────────────
type AssetStatus = "Assigned" | "In Store" | "Maintenance" | "Flagged";

type Asset = {
  tag: string;
  name: string;
  category: string;
  make: string;
  model: string;
  serial: string;
  status: AssetStatus;
  department: string;
  warranty: string;
};

// ── Mock data ─────────────────────────────────────────────────
// Phase 3: replace this array with an API call →
// const { data, total, page } = await fetch(`/api/assets?page=${page}&limit=${PAGE_SIZE}`)
const assets: Asset[] = [
  {
    tag: "KE-ICT-L-041",
    name: "Dell Latitude 5540",
    category: "Laptop",
    make: "Dell",
    model: "Latitude 5540",
    serial: "DL-20491-KE",
    status: "Assigned",
    department: "Legal",
    warranty: "Expired",
  },
  {
    tag: "KE-ICT-P-040",
    name: "HP LaserJet Pro M404dn",
    category: "Printer",
    make: "HP",
    model: "M404dn",
    serial: "HP-10832-KE",
    status: "In Store",
    department: "—",
    warranty: "Active",
  },
  {
    tag: "KE-ICT-D-039",
    name: "Lenovo ThinkCentre M90q",
    category: "Desktop",
    make: "Lenovo",
    model: "ThinkCentre M90q",
    serial: "LN-38821-KE",
    status: "Assigned",
    department: "Finance",
    warranty: "Active",
  },
  {
    tag: "KE-ICT-N-038",
    name: "Cisco Catalyst 2960-X",
    category: "Networking",
    make: "Cisco",
    model: "Catalyst 2960-X",
    serial: "CS-00291-KE",
    status: "Maintenance",
    department: "ICT",
    warranty: "Expired",
  },
  {
    tag: "KE-ICT-S-037",
    name: "Epson WorkForce DS-530",
    category: "Scanner",
    make: "Epson",
    model: "DS-530",
    serial: "EP-49921-KE",
    status: "Assigned",
    department: "Constitutional",
    warranty: "Active",
  },
  {
    tag: "KE-ICT-U-036",
    name: "APC Smart-UPS 1500VA",
    category: "UPS",
    make: "APC",
    model: "Smart-UPS 1500VA",
    serial: "APC-1001-KE",
    status: "In Store",
    department: "—",
    warranty: "Expired",
  },
  {
    tag: "KE-ICT-L-035",
    name: "HP EliteBook 840 G9",
    category: "Laptop",
    make: "HP",
    model: "EliteBook 840 G9",
    serial: "HP-84091-KE",
    status: "Assigned",
    department: "HR",
    warranty: "Active",
  },
  {
    tag: "KE-ICT-M-034",
    name: 'Samsung 27" Monitor',
    category: "Monitor",
    make: "Samsung",
    model: '27" Monitor',
    serial: "SM-27041-KE",
    status: "Assigned",
    department: "Admin",
    warranty: "Active",
  },
];

// ── Config ────────────────────────────────────────────────────
const PAGE_SIZE = 8;
// Phase 3: this will come from the API response (total records in DB)
const MOCK_TOTAL = 1000;

// ── Style maps ────────────────────────────────────────────────
const statusStyles: Record<AssetStatus, string> = {
  Assigned: "bg-green-100 text-green-700 border border-green-200",
  "In Store": "bg-blue-50 text-blue-600 border border-blue-200",
  Maintenance: "bg-orange-100 text-orange-600 border border-orange-200",
  Flagged: "bg-red-50 text-red-600 border border-red-200",
};
const statusDot: Record<AssetStatus, string> = {
  Assigned: "bg-green-500",
  "In Store": "bg-blue-500",
  Maintenance: "bg-orange-500",
  Flagged: "bg-red-500",
};
const warrantyStyles: Record<string, string> = {
  Active: "text-green-600",
  Expired: "text-red-500",
};

// ── Pagination helper ─────────────────────────────────────────
function getPageNumbers(current: number, total: number): (number | "...")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (current <= 3) return [1, 2, 3, "...", total];
  if (current >= total - 2) return [1, "...", total - 2, total - 1, total];
  return [1, "...", current - 1, current, current + 1, "...", total];
}

// ── Props ─────────────────────────────────────────────────────
interface Props {
  activeTab: string;
}

// ── Component ─────────────────────────────────────────────────
const AssetTable = ({ activeTab }: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  // Filter logic
  // Phase 3: filtering will be a query param → /api/assets?status=Assigned&page=1
  const filtered =
    activeTab === "All" ? assets : assets.filter((a) => a.status === activeTab);

  // Pagination maths
  // Phase 3: these will come from the API response metadata
  const totalRecords = activeTab === "All" ? MOCK_TOTAL : filtered.length;
  const totalPages = Math.ceil(totalRecords / PAGE_SIZE);
  const pageNumbers = getPageNumbers(currentPage, totalPages);

  // For Phase 1 we show all mock rows regardless of page
  // Phase 3: the API will return only PAGE_SIZE rows for the current page
  const visibleRows = filtered;

  const startRecord = (currentPage - 1) * PAGE_SIZE + 1;
  const endRecord = Math.min(currentPage * PAGE_SIZE, totalRecords);

  function goTo(page: number) {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
    // Phase 3: trigger API refetch here with new page number
  }

  return (
    <>
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="border-b border-gray-100">
            {[
              "Asset Tag",
              "Name",
              "Category",
              "Make",
              "Model",
              "Serial No.",
              "Status",
              "Dept.",
              "Warranty",
              "Action",
            ].map((h) => (
              <th
                key={h}
                className="px-3 py-3 text-left text-xs font-semibold text-gray-500
                           uppercase tracking-wider whitespace-nowrap w-[10%]"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {visibleRows.length > 0 ? (
            visibleRows.map((a) => (
              <tr
                key={a.tag}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-3 py-4 text-[#235FE7] font-semibold text-xs truncate">
                  {a.tag}
                </td>
                <td className="px-3 py-4 text-gray-900 font-medium text-xs truncate">
                  {a.name}
                </td>
                <td className="px-3 py-4 text-gray-500 text-xs truncate">
                  {a.category}
                </td>
                <td className="px-3 py-4 text-gray-500 text-xs truncate">
                  {a.make}
                </td>
                <td className="px-3 py-4 text-gray-500 text-xs truncate">
                  {a.model}
                </td>
                <td className="px-3 py-4 text-gray-400 font-mono text-xs truncate">
                  {a.serial}
                </td>
                <td className="px-3 py-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-full
                                    text-xs font-semibold whitespace-nowrap ${statusStyles[a.status]}`}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full shrink-0 ${statusDot[a.status]}`}
                    />
                    {a.status}
                  </span>
                </td>
                <td className="px-3 py-4 text-gray-500 text-xs truncate">
                  {a.department}
                </td>
                <td
                  className={`px-3 py-4 text-xs font-semibold truncate ${warrantyStyles[a.warranty]}`}
                >
                  {a.warranty}
                </td>
                <td className="px-3 py-4">
                  <span
                    className="text-xs text-[#235FE7] font-semibold cursor-pointer
                                   hover:underline whitespace-nowrap"
                  >
                    View/Assign
                  </span>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={10}
                className="px-4 py-10 text-center text-xs text-gray-400"
              >
                No assets found for this filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* ── Pagination — shown on ALL tabs ── */}
      <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
        {/* Record count */}
        <p className="text-xs text-gray-500">
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {startRecord}–{endRecord}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700">
            {totalRecords.toLocaleString()}
          </span>{" "}
          assets
        </p>

        {/* Page buttons */}
        <div className="flex items-center gap-1">
          {/* Prev */}
          <button
            onClick={() => goTo(currentPage - 1)}
            disabled={currentPage === 1}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-sm
                       text-gray-500 hover:bg-gray-100 disabled:opacity-30
                       disabled:cursor-not-allowed transition-colors"
          >
            ‹
          </button>

          {/* Page numbers */}
          {pageNumbers.map((p, i) =>
            p === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="h-8 w-8 flex items-center justify-center
                                                       text-xs text-gray-400"
              >
                …
              </span>
            ) : (
              <button
                key={p}
                onClick={() => goTo(p as number)}
                className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs
                            font-medium transition-colors
                            ${
                              currentPage === p
                                ? "bg-[#235FE7] text-white"
                                : "text-gray-600 hover:bg-gray-100"
                            }`}
              >
                {p}
              </button>
            ),
          )}

          {/* Next */}
          <button
            onClick={() => goTo(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="h-8 w-8 flex items-center justify-center rounded-lg text-sm
                       text-gray-500 hover:bg-gray-100 disabled:opacity-30
                       disabled:cursor-not-allowed transition-colors"
          >
            ›
          </button>
        </div>
      </div>
    </>
  );
};

export default AssetTable;
