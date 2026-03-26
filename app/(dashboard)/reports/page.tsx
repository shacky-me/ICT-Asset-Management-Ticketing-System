import ReportCard from "@/components/reports/ReportCard";

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
        {reports.map((report) => (
          <ReportCard key={report.title} {...report} />
        ))}
      </div>
    </div>
  );
};

export default ReportsPage;
