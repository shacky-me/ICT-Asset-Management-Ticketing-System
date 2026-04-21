"use client";

import { useMemo, useState } from "react";
import AssignmentDetailsModal from "@/components/assignments/AssignmentDetailsModal";
import { AssignmentRecord } from "@/lib/assignments";

const statusStyles: Record<AssignmentRecord["status"], string> = {
  Assigned: "bg-white text-blue-500 border border-blue-300",
  Returned: "bg-white text-green-600 border border-green-300",
  Overdue: "bg-white text-red-500 border border-red-300",
};

const getAvatarColor = (initials: string) => {
  const colors = [
    "bg-blue-500",
    "bg-purple-500",
    "bg-green-600",
    "bg-orange-500",
    "bg-pink-500",
    "bg-teal-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-cyan-500",
  ];
  const index =
    (initials.charCodeAt(0) + (initials.charCodeAt(1) || 0)) % colors.length;
  return colors[index];
};

interface Props {
  assignments: AssignmentRecord[];
  activeTab: string;
  search: string;
  department: string;
  onRefresh?: () => void;
  onEditOpen?: (assignment: AssignmentRecord) => void;
}

const PAGE_SIZE = 8;

const AssignmentTable = ({
  assignments,
  activeTab,
  search = "",
  department,
  onRefresh,
  onEditOpen,
}: Props) => {
  const [page, setPage] = useState(1);
  const [selectedAssignment, setSelectedAssignment] =
    useState<AssignmentRecord | null>(null);

  const filtered = useMemo(
    () =>
      assignments
        .filter((a) => activeTab === "All" || a.status === activeTab)
        .filter(
          (a) =>
            department === "All Departments" || a.department === department,
        )
        .filter(
          (a) =>
            search === "" ||
            a.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
            a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
            a.ref.toLowerCase().includes(search.toLowerCase()) ||
            a.assetName.toLowerCase().includes(search.toLowerCase()),
        ),
    [activeTab, assignments, department, search],
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const effectivePage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (effectivePage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [effectivePage, filtered]);

  const startIndex =
    filtered.length === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const endIndex = Math.min(effectivePage * PAGE_SIZE, filtered.length);

  return (
    <>
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[12%]">
              Ref No.
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[12%]">
              Asset Tag
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[14%]">
              Asset Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[14%]">
              Assigned To
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[12%]">
              Dept.
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[12%]">
              Date Issued
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[10%]">
              Status
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[14%]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {paginated.length > 0 ? (
            paginated.map((a) => (
              <tr
                key={a.ref}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
              >
                <td className="px-4 py-4 text-[#235FE7] font-semibold text-xs truncate">
                  {a.ref}
                </td>
                <td className="px-4 py-4 text-[#235FE7] text-xs font-medium truncate">
                  {a.assetTag}
                </td>
                <td className="px-4 py-4 text-gray-900 font-medium text-xs truncate">
                  {a.assetName}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-8 w-8 rounded-full ${getAvatarColor(a.initials)} flex items-center justify-center shrink-0`}
                    >
                      <span className="text-[11px] font-bold text-white">
                        {a.initials}
                      </span>
                    </div>
                    <span className="text-xs text-gray-700 truncate">
                      {a.assignedTo}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-4 text-gray-500 text-xs truncate">
                  {a.department}
                </td>
                <td className="px-4 py-4 text-gray-500 text-xs whitespace-nowrap">
                  {a.dateIssued}
                </td>
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyles[a.status]}`}
                  >
                    {a.status}
                  </span>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setSelectedAssignment(a)}
                      className="text-xs text-[#235FE7] font-semibold hover:underline"
                    >
                      View
                    </button>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={8}
                className="px-4 py-10 text-center text-xs text-gray-400"
              >
                No assignments found for this filter.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
        <p className="text-xs text-[#235FE7] font-medium">
          Showing {startIndex}-{endIndex} of {filtered.length} assignments
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() =>
              setPage((prev) => Math.max(1, Math.min(totalPages, prev - 1)))
            }
            disabled={effectivePage === 1}
            className="h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 disabled:opacity-50"
          >
            Previous
          </button>
          <span className="text-xs text-gray-500">
            Page {effectivePage} of {totalPages}
          </span>
          <button
            onClick={() =>
              setPage((prev) => Math.max(1, Math.min(totalPages, prev + 1)))
            }
            disabled={effectivePage >= totalPages}
            className="h-8 px-3 rounded-lg border border-gray-200 text-xs text-gray-600 disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      <AssignmentDetailsModal
        assignment={selectedAssignment}
        onClose={() => setSelectedAssignment(null)}
        onEdit={(assignment) => {
          setSelectedAssignment(null);
          onEditOpen?.(assignment);
        }}
        onDelete={onRefresh}
      />
    </>
  );
};
export default AssignmentTable;
