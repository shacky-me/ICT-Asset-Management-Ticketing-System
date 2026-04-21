import type { AssetRow } from "@/lib/assets";

type Props = {
  assets: AssetRow[];
};

const palette = [
  "bg-blue-500",
  "bg-purple-500",
  "bg-green-500",
  "bg-orange-400",
  "bg-red-400",
  "bg-gray-400",
];

const DepartmentOverview = ({ assets }: Props) => {
  const departments = Object.entries(
    assets.reduce<Record<string, number>>((acc, asset) => {
      acc[asset.department] = (acc[asset.department] || 0) + 1;
      return acc;
    }, {}),
  )
    .map(([name, count], index) => ({
      name,
      count,
      color: palette[index % palette.length],
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-4">
      <div>
        <p className="text-sm font-bold text-gray-900">Department Overview</p>
        <p className="text-xs text-gray-400">Assets by department</p>
      </div>
      <div className="space-y-3">
        {departments.length > 0 ? (
          departments.map((dept) => (
            <div key={dept.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`h-2.5 w-2.5 rounded-full ${dept.color}`} />
                <span className="text-sm text-gray-700">{dept.name}</span>
              </div>
              <span className="text-sm font-semibold text-gray-900">
                {dept.count}
              </span>
            </div>
          ))
        ) : (
          <p className="text-xs text-gray-400">
            No assets have been registered yet.
          </p>
        )}
      </div>
    </div>
  );
};
export default DepartmentOverview;
