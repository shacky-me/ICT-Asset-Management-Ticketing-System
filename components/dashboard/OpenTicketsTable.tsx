"use client";

import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import RaiseTicketModal from "../modals/RaiseTicketModal";

type Priority = "Critical" | "High" | "Medium" | "Low";
type Status = "Open" | "In Progress" | "Pending" | "Resolved";

type Ticket = {
  id: string;
  issue: string;
  priority: Priority;
  department: string;
  assignedTo: string;
  status: Status;
  created: string;
};

const tickets: Ticket[] = [
  {
    id: "TKT-2025-0189",
    issue: "Laptop screen flickering",
    priority: "High",
    department: "Legal",
    assignedTo: "T. Kamau",
    status: "Open",
    created: "2h ago",
  },
  {
    id: "TKT-2025-0188",
    issue: "Cannot print from Finance PC",
    priority: "Medium",
    department: "Finance",
    assignedTo: "P. Odhiambo",
    status: "In Progress",
    created: "5h ago",
  },
  {
    id: "TKT-2025-0187",
    issue: "Network switch port failure",
    priority: "Critical",
    department: "ICT",
    assignedTo: "T. Kamau",
    status: "In Progress",
    created: "1d ago",
  },
  {
    id: "TKT-2025-0186",
    issue: "New laptop setup request",
    priority: "Low",
    department: "HR",
    assignedTo: "—",
    status: "Pending",
    created: "1d ago",
  },
  {
    id: "TKT-2025-0185",
    issue: "UPS battery replacement",
    priority: "Medium",
    department: "ICT",
    assignedTo: "B. Otieno",
    status: "Resolved",
    created: "3d ago",
  },
  {
    id: "TKT-2025-0184",
    issue: "Email access issue",
    priority: "High",
    department: "Constitutional",
    assignedTo: "P. Odhiambo",
    status: "Open",
    created: "3d ago",
  },
];

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

const OpenTicketsTable = () => {
  const [isTicketOpen, setIsTicketOpen] = useState(false);
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
          {tickets.map((t) => (
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
        <p className="text-xs text-gray-400">Showing 6 of 42 tickets</p>
        <Link
          href="/tickets"
          className="text-xs text-[#235FE7] font-semibold hover:underline flex items-center gap-1"
        >
          View all tickets →
        </Link>
      </div>
    </div>
  );
};
export default OpenTicketsTable;
