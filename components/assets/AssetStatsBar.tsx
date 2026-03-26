const stats = [
  {
    label: "Total",
    value: "1,000",
    color: "text-[#235FE7]",
    border: "border-t-[#235FE7]",
  },
  {
    label: "Assigned",
    value: "986",
    color: "text-green-500",
    border: "border-t-green-500",
  },
  {
    label: "In Store",
    value: "287",
    color: "text-purple-500",
    border: "border-t-purple-500",
  },
  {
    label: "Maintenance",
    value: "1,000",
    color: "text-orange-500",
    border: "border-t-orange-500",
  },
];

const AssetStatsBar = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`bg-white border border-gray-200 border-t-2 ${s.border} rounded-xl px-5 py-5 space-y-1`}
        >
          <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
            {s.label}
          </p>
        </div>
      ))}
    </div>
  );
};
export default AssetStatsBar;
