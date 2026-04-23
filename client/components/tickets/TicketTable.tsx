import { useEffect, useMemo, useState } from "react";

type Priority = "Critical" | "High" | "Medium" | "Low";
type TicketStatus = "Open" | "In Progress" | "Pending" | "Resolved";

type TicketStatusAction = {
  label: string;
  status: TicketStatus;
};

type Ticket = {
  id: string;
  issue: string;
  priority: Priority;
  department: string;
  assignedTo: string;
  assetTag: string;
  status: TicketStatus;
  created: string;
};

const priorityStyles: Record<Priority, string> = {
  Critical: "bg-red-50 text-red-600 border border-red-200",
  High: "bg-orange-50 text-orange-600 border border-orange-200",
  Medium: "bg-yellow-50 text-yellow-600 border border-yellow-200",
  Low: "bg-gray-50 text-gray-500 border border-gray-200",
};

const statusStyles: Record<TicketStatus, string> = {
  Open: "bg-red-50 text-red-500 border border-red-200",
  "In Progress": "bg-orange-50 text-orange-500 border border-orange-200",
  Pending: "bg-blue-50 text-blue-500 border border-blue-200",
  Resolved: "bg-green-50 text-green-600 border border-green-200",
};

const statusActions: Record<TicketStatus, TicketStatusAction[]> = {
  Open: [
    { label: "Start", status: "In Progress" },
    { label: "Pending", status: "Pending" },
    { label: "Resolve", status: "Resolved" },
  ],
  "In Progress": [
    { label: "Pending", status: "Pending" },
    { label: "Resolve", status: "Resolved" },
  ],
  Pending: [
    { label: "Resume", status: "In Progress" },
    { label: "Resolve", status: "Resolved" },
  ],
  Resolved: [],
};

const PAGE_SIZE = 5;

function getPageItems(currentPage: number, totalPages: number) {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1);
  }

  if (currentPage <= 4) {
    return [1, 2, 3, 4, 5, "...", totalPages];
  }

  if (currentPage >= totalPages - 3) {
    return [
      1,
      "...",
      totalPages - 4,
      totalPages - 3,
      totalPages - 2,
      totalPages - 1,
      totalPages,
    ];
  }

  return [
    1,
    "...",
    currentPage - 1,
    currentPage,
    currentPage + 1,
    "...",
    totalPages,
  ];
}

interface Props {
  tickets: Ticket[];
  activeTab: string;
  search?: string;
  onUpdateTicketStatus?: (
    ticketId: string,
    status: TicketStatus,
  ) => Promise<void> | void;
  updatingTicketId?: string | null;
  canManageTicket?: boolean;
}

const TicketTable = ({
  tickets,
  activeTab,
  search = "",
  onUpdateTicketStatus,
  updatingTicketId,
  canManageTicket = false,
}: Props) => {
  const [currentPage, setCurrentPage] = useState(1);

  const tabFiltered =
    activeTab === "All"
      ? tickets
      : tickets.filter((t) => t.status === activeTab);

  const normalizedQuery = search.trim().toLowerCase();

  const filtered =
    normalizedQuery.length === 0
      ? tabFiltered
      : tabFiltered.filter((t) =>
          [
            t.id,
            t.issue,
            t.priority,
            t.department,
            t.assignedTo,
            t.assetTag,
            t.status,
          ]
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery),
        );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, totalPages);
  const pageItems = useMemo(
    () => getPageItems(effectivePage, totalPages),
    [effectivePage, totalPages],
  );
  const visibleRows = useMemo(() => {
    const start = (effectivePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [effectivePage, filtered]);

  const startRow =
    filtered.length === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(effectivePage * PAGE_SIZE, filtered.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, search, tickets.length]);

  const showPagination = filtered.length > PAGE_SIZE;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[14%]">
              Ticket ID
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[17%]">
              Issue Title
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[9%]">
              Priority
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[9%]">
              Dept.
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[11%]">
              Assigned To
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[12%]">
              Asset Tag
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[11%]">
              Status
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[9%]">
              Created
            </th>
            <th className="px-3 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[8%]">
              Action
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((t) => (
            <tr
              key={t.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-3 py-4 text-[#235FE7] font-semibold text-xs truncate">
                {t.id}
              </td>
              <td className="px-3 py-4 text-gray-900 font-medium text-xs truncate">
                {t.issue}
              </td>
              <td className="px-3 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${priorityStyles[t.priority]}`}
                >
                  {t.priority}
                </span>
              </td>
              <td className="px-3 py-4 text-gray-500 text-xs truncate">
                {t.department}
              </td>
              <td className="px-3 py-4 text-gray-700 text-xs truncate">
                {t.assignedTo}
              </td>
              <td className="px-3 py-4 text-[#235FE7] text-xs font-medium truncate">
                {t.assetTag}
              </td>
              <td className="px-3 py-4">
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyles[t.status]}`}
                >
                  {t.status}
                </span>
              </td>
              <td className="px-3 py-4 text-gray-400 text-xs whitespace-nowrap">
                {t.created}
              </td>
              <td className="px-3 py-4">
                {t.status === "Resolved" ? (
                  <span className="text-xs text-green-600 font-semibold">
                    Resolved
                  </span>
                ) : !canManageTicket ? (
                  <span className="text-xs text-gray-400 font-medium">-</span>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {statusActions[t.status].map((action) => (
                      <button
                        key={action.status}
                        onClick={() =>
                          onUpdateTicketStatus?.(t.id, action.status)
                        }
                        disabled={Boolean(updatingTicketId === t.id)}
                        className="text-xs text-[#235FE7] font-semibold hover:underline disabled:opacity-40 disabled:no-underline"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-[#235FE7] font-medium">
            Showing {startRow}-{endRow} of {filtered.length} tickets
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={effectivePage === 1}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-sm disabled:opacity-40"
            >
              ‹
            </button>
            <span className="text-xs text-gray-500 px-2">
              Page {effectivePage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(totalPages, prev + 1))
              }
              disabled={effectivePage === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-sm disabled:opacity-40"
            >
              ›
            </button>
            {pageItems.map((item, index) =>
              item === "..." ? (
                <span
                  key={`ellipsis-${index}`}
                  className="h-8 w-8 flex items-center justify-center text-xs text-gray-400"
                >
                  ...
                </span>
              ) : (
                <button
                  key={item}
                  onClick={() => {
                    if (typeof item === "number") {
                      setCurrentPage(item as number);
                    }
                  }}
                  className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-medium ${
                    item === effectivePage
                      ? "bg-[#235FE7] text-white"
                      : "hover:bg-gray-100 text-gray-600"
                  }`}
                >
                  {item}
                </button>
              ),
            )}
          </div>
        </div>
      )}
    </div>
  );
};
export default TicketTable;
