const stats = [
  {
    value: "986",
    label: "Active Assignments",
    sub: "Currently Issued",
    subColor: "text-green-500",
    border: "border-t-green-500",
  },
  {
    value: "143",
    label: "Assigned This Month",
    sub: "March 2026",
    subColor: "text-[#235FE7]",
    border: "border-t-[#235FE7]",
  },
  {
    value: "38",
    label: "Returned",
    sub: "This financial year",
    subColor: "text-green-500",
    border: "border-t-green-500",
  },
  {
    value: "986",
    label: "Overdue Returns",
    sub: "Require immediate action",
    subColor: "text-red-500",
    border: "border-t-red-500",
  },
];

const AssignmentStatsBar = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`bg-white border border-gray-200 border-t-2 ${s.border} rounded-xl px-5 py-5 space-y-1`}
        >
          <p className="text-2xl font-bold text-gray-900">{s.value}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {s.label}
          </p>
          <p className={`text-xs font-medium ${s.subColor}`}>{s.sub}</p>
        </div>
      ))}
    </div>
  );
};
export default AssignmentStatsBar;
