const departments = [
  { name: "ICT", count: 30, color: "bg-blue-500" },
  { name: "Legal", count: 20, color: "bg-purple-500" },
  { name: "Constitutional", count: 25, color: "bg-green-500" },
  { name: "Finance", count: 8, color: "bg-orange-400" },
  { name: "HR", count: 6, color: "bg-red-400" },
  { name: "Admin", count: 5, color: "bg-gray-400" },
];

const DepartmentOverview = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-4">
      <div>
        <p className="text-sm font-bold text-gray-900">Department Overview</p>
        <p className="text-xs text-gray-400">Assets and Open Tickets</p>
      </div>
      <div className="space-y-3">
        {departments.map((dept) => (
          <div key={dept.name} className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${dept.color}`} />
              <span className="text-sm text-gray-700">{dept.name}</span>
            </div>
            <span className="text-sm font-semibold text-gray-900">
              {dept.count}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
export default DepartmentOverview;
