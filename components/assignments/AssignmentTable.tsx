type AssignmentStatus = "Assigned" | "Returned" | "Overdue";

type Assignment = {
  ref: string;
  assetTag: string;
  assetName: string;
  assignedTo: string;
  initials: string;
  department: string;
  dateIssued: string;
  status: AssignmentStatus;
};

const assignments: Assignment[] = [
  {
    ref: "ASSGN-2026-033",
    assetTag: "KE-ICT-L-033",
    assetName: "HP ProBook 450 G8",
    assignedTo: "Kigen Meshack",
    initials: "KM",
    department: "Legal Room 408",
    dateIssued: "10 Jan, 2026",
    status: "Returned",
  },
  {
    ref: "ASSGN-2026-032",
    assetTag: "KE-ICT-L-032",
    assetName: "Dell Latitude 5540",
    assignedTo: "Jane Mwangi",
    initials: "JM",
    department: "Finance",
    dateIssued: "08 Jan, 2026",
    status: "Assigned",
  },
  {
    ref: "ASSGN-2026-031",
    assetTag: "KE-ICT-D-031",
    assetName: "Lenovo ThinkCentre",
    assignedTo: "Brian Otieno",
    initials: "BO",
    department: "ICT",
    dateIssued: "05 Jan, 2026",
    status: "Assigned",
  },
  {
    ref: "ASSGN-2026-030",
    assetTag: "KE-ICT-L-030",
    assetName: "HP EliteBook 840",
    assignedTo: "Peter Kamau",
    initials: "PK",
    department: "HR",
    dateIssued: "03 Jan, 2026",
    status: "Overdue",
  },
  {
    ref: "ASSGN-2026-029",
    assetTag: "KE-ICT-M-029",
    assetName: 'Samsung 27" Monitor',
    assignedTo: "Sarah Kariuki",
    initials: "SK",
    department: "Admin",
    dateIssued: "28 Dec, 2025",
    status: "Assigned",
  },
  {
    ref: "ASSGN-2026-028",
    assetTag: "KE-ICT-P-028",
    assetName: "HP LaserJet Pro",
    assignedTo: "Mary Njeru",
    initials: "MN",
    department: "Constitutional",
    dateIssued: "20 Dec, 2025",
    status: "Overdue",
  },
  {
    ref: "ASSGN-2026-027",
    assetTag: "KE-ICT-L-027",
    assetName: "Dell Inspiron 15",
    assignedTo: "Tom Odhiambo",
    initials: "TO",
    department: "Legal",
    dateIssued: "15 Dec, 2025",
    status: "Returned",
  },
  {
    ref: "ASSGN-2026-026",
    assetTag: "KE-ICT-U-026",
    assetName: "APC Smart-UPS",
    assignedTo: "Alice Wanjiku",
    initials: "AW",
    department: "Finance",
    dateIssued: "10 Dec, 2025",
    status: "Assigned",
  },
];

const statusStyles: Record<AssignmentStatus, string> = {
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
  activeTab: string;
  search: string;
}

const AssignmentTable = ({ activeTab, search = "" }: Props) => {
  const filtered = assignments
    .filter((a) => activeTab === "All" || a.status === activeTab)
    .filter(
      (a) =>
        search === "" ||
        a.assignedTo.toLowerCase().includes(search.toLowerCase()) ||
        a.assetTag.toLowerCase().includes(search.toLowerCase()) ||
        a.ref.toLowerCase().includes(search.toLowerCase()) ||
        a.assetName.toLowerCase().includes(search.toLowerCase()),
    );

  const showPagination = activeTab !== "All";

  return (
    <>
      <table className="w-full text-sm table-fixed">
        <thead>
          <tr className="border-b border-gray-100">
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[14%]">
              Ref No.
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[12%]">
              Asset Tag
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[16%]">
              Asset Name
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[16%]">
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
            <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider whitespace-nowrap w-[8%]">
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {filtered.length > 0 ? (
            filtered.map((a) => (
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
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#235FE7] font-semibold cursor-pointer hover:underline">
                      View
                    </span>
                    <span className="text-xs text-gray-400 font-semibold cursor-pointer hover:underline">
                      Cert
                    </span>
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

      {/* Pagination — only on filtered tabs */}
      {showPagination && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-gray-100">
          <p className="text-xs text-[#235FE7] font-medium">
            Showing {filtered.length} of {filtered.length} assignments
          </p>
          <div className="flex items-center gap-1">
            <button className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 text-gray-500 text-sm">
              ‹
            </button>
            {[1, 2, 3, "...", 10].map((p, i) => (
              <button
                key={i}
                className={`h-8 w-8 flex items-center justify-center rounded-lg text-xs font-medium ${p === 1 ? "bg-[#235FE7] text-white" : "hover:bg-gray-100 text-gray-600"}`}
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

      {/* Footer for All tab */}
      {!showPagination && (
        <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Showing 1-8 of 1,000 assignments
          </p>
        </div>
      )}
    </>
  );
};
export default AssignmentTable;
