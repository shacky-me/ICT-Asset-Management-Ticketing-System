type Priority = "Critical" | "High" | "Medium" | "Low";
type TicketStatus = "Open" | "In Progress" | "Pending" | "Resolved";

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

const tickets: Ticket[] = [
  {
    id: "TKT-2025-0189",
    issue: "Laptop Screen Flickering",
    priority: "High",
    department: "Legal",
    assignedTo: "T. Kamau",
    assetTag: "KE-ICT-L-041",
    status: "Open",
    created: "2h ago",
  },
  {
    id: "TKT-2025-0188",
    issue: "Cannot print from Finance PC",
    priority: "Medium",
    department: "Finance",
    assignedTo: "P. Odhiambo",
    assetTag: "KE-ICT-P-040",
    status: "In Progress",
    created: "5h ago",
  },
  {
    id: "TKT-2025-0187",
    issue: "Network switch port failure",
    priority: "Critical",
    department: "ICT",
    assignedTo: "T. Kamau",
    assetTag: "KE-ICT-N-038",
    status: "In Progress",
    created: "1d ago",
  },
  {
    id: "TKT-2025-0186",
    issue: "New laptop setup request",
    priority: "Low",
    department: "HR",
    assignedTo: "—",
    assetTag: "—",
    status: "Pending",
    created: "1d ago",
  },
  {
    id: "TKT-2025-0185",
    issue: "UPS battery replacement",
    priority: "Medium",
    department: "ICT",
    assignedTo: "B. Otieno",
    assetTag: "KE-ICT-U-036",
    status: "Resolved",
    created: "3d ago",
  },
  {
    id: "TKT-2025-0184",
    issue: "Email access issue",
    priority: "High",
    department: "Constitutional",
    assignedTo: "P. Odhiambo",
    assetTag: "—",
    status: "Open",
    created: "3d ago",
  },
  {
    id: "TKT-2025-0183",
    issue: "Monitor display flickering",
    priority: "Medium",
    department: "Admin",
    assignedTo: "S. Kariuki",
    assetTag: "KE-ICT-M-034",
    status: "Pending",
    created: "4d ago",
  },
  {
    id: "TKT-2025-0182",
    issue: "Keyboard not responding",
    priority: "Low",
    department: "Legal",
    assignedTo: "J. Mwangi",
    assetTag: "KE-ICT-L-041",
    status: "Resolved",
    created: "5d ago",
  },
];

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

interface Props {
  activeTab: string;
}

const TicketTable = ({ activeTab }: Props) => {
  const filtered =
    activeTab === "All"
      ? tickets
      : tickets.filter((t) => t.status === activeTab);

  const showPagination = activeTab !== "All";

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
          {filtered.map((t) => (
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
                <span className="text-xs text-[#235FE7] font-semibold cursor-pointer hover:underline">
                  View
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination — only on filtered tabs */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-[#235FE7] font-medium">
            Showing {filtered.length} of {filtered.length} tickets
          </p>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-sm">
              ‹
            </button>
            {[1, 2, 3, "...", 10].map((p, i) => (
              <button
                key={i}
                className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-medium ${
                  p === 1
                    ? "bg-[#235FE7] text-white"
                    : "hover:bg-gray-100 text-gray-600"
                }`}
              >
                {p}
              </button>
            ))}
            <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-sm">
              ›
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
export default TicketTable;
