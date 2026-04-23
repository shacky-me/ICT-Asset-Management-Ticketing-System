"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import RaiseTicketModal from "../modals/RaiseTicketModal";
import type { ApiTicket } from "@/lib/apiClient";

type Priority = "Critical" | "High" | "Medium" | "Low";
type Status = "Open" | "In Progress" | "Pending" | "Resolved";

type Ticket = ApiTicket;

const priorityStyles: Record<Priority, string> = {
  Critical: "bg-red-50 text-red-600 border border-red-200",
  High: "bg-orange-50 text-orange-600 border border-orange-200",
  Medium: "bg-yellow-50 text-yellow-600 border border-yellow-200",
  Low: "bg-gray-50 text-gray-500 border border-gray-200",
};

const statusStyles: Record<Status, string> = {
  Open: "bg-red-50 text-red-500 border border-red-200",
  "In Progress": "bg-orange-50 text-orange-500 border border-orange-200",
  Pending: "bg-blue-50 text-blue-500 border border-blue-200",
  Resolved: "bg-green-50 text-green-600 border border-green-200",
};

const PAGE_SIZE = 5;

const OpenTicketsTable = ({
  search = "",
  tickets,
}: {
  search?: string;
  tickets: Ticket[];
}) => {
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const activeTickets = useMemo(
    () => tickets.filter((ticket) => ticket.status !== "Resolved"),
    [tickets],
  );
  const filteredTickets = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return activeTickets;

    return activeTickets.filter(
      (ticket) =>
        ticket.id.toLowerCase().includes(query) ||
        ticket.issue.toLowerCase().includes(query) ||
        ticket.department.toLowerCase().includes(query) ||
        ticket.assignedTo.toLowerCase().includes(query) ||
        ticket.status.toLowerCase().includes(query),
    );
  }, [search, tickets]);

  const totalPages = Math.max(1, Math.ceil(filteredTickets.length / PAGE_SIZE));
  const effectivePage = Math.min(currentPage, totalPages);
  const visibleRows = useMemo(() => {
    const start = (effectivePage - 1) * PAGE_SIZE;
    return filteredTickets.slice(start, start + PAGE_SIZE);
  }, [effectivePage, filteredTickets]);

  const startRow =
    filteredTickets.length === 0 ? 0 : (effectivePage - 1) * PAGE_SIZE + 1;
  const endRow = Math.min(effectivePage * PAGE_SIZE, filteredTickets.length);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, tickets.length]);

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
        <div>
          <p className="text-sm font-bold text-gray-900">Open Tickets</p>
          <p className="text-xs text-gray-400">Active ICT support requests</p>
        </div>
        <Button
          onClick={() => setIsTicketOpen(true)}
          variant="outline"
          className="gap-2 text-sm cursor-pointer text-[#235FE7] border-[#235FE7] hover:bg-blue-50"
        >
          <Plus className="h-4 w-4" /> New Ticket
        </Button>
        <RaiseTicketModal
          isOpen={isTicketOpen}
          onClose={() => setIsTicketOpen(false)}
        />
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-100">
            {[
              { label: "Ticket ID", cls: "w-36" },
              { label: "Issue", cls: "w-56" },
              { label: "Priority", cls: "w-28" },
              { label: "Dept.", cls: "w-28" },
              { label: "Assigned", cls: "w-28" },
              { label: "Status", cls: "w-28" },
              { label: "Created", cls: "w-24" },
            ].map((h) => (
              <th
                key={h.label}
                className={`px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${h.cls}`}
              >
                {h.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {visibleRows.map((t) => (
            <tr
              key={t.id}
              className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
            >
              <td className="px-6 py-4 text-[#235FE7] font-semibold">{t.id}</td>
              <td className="px-6 py-4 text-gray-900 font-medium">{t.issue}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${priorityStyles[t.priority]}`}
                >
                  {t.priority}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-400">{t.department}</td>
              <td className="px-6 py-4 text-gray-700">{t.assignedTo}</td>
              <td className="px-6 py-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyles[t.status]}`}
                >
                  {t.status}
                </span>
              </td>
              <td className="px-6 py-4 text-gray-400">{t.created}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
        <p className="text-xs text-gray-400">
          Showing {startRow}-{endRow} of {filteredTickets.length} tickets
        </p>
        <div className="flex items-center gap-2">
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
          <Link
            href="/tickets"
            className="ml-2 text-xs text-[#235FE7] font-semibold hover:underline flex items-center gap-1"
          >
            View all tickets →
          </Link>
        </div>
      </div>
    </div>
  );
};
export default OpenTicketsTable;
