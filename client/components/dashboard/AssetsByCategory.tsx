import type { AssetRow } from "@/lib/assets";

type Props = {
  assets: AssetRow[];
};

const palette = [
  "bg-blue-500",
  "bg-green-500",
  "bg-orange-400",
  "bg-purple-500",
  "bg-red-400",
  "bg-cyan-500",
  "bg-slate-600",
];

const AssetsByCategory = ({ assets }: Props) => {
  const categories = Object.entries(
    assets.reduce<Record<string, number>>((acc, asset) => {
      acc[asset.category] = (acc[asset.category] || 0) + 1;
      return acc;
    }, {}),
  ).map(([label, count], index) => ({
    label,
    count,
    color: palette[index % palette.length],
  }));

  const max = Math.max(1, ...categories.map((item) => item.count));

  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-4">
      <div>
        <p className="text-sm font-bold text-gray-900">Assets by Category</p>
        <p className="text-xs text-gray-400">
          {categories.length} equipment types
        </p>
      </div>
      <div className="space-y-3">
        {categories.length > 0 ? (
          categories.map((cat) => (
            <div key={cat.label} className="space-y-1">
              <div className="flex justify-between text-xs text-gray-600">
                <span>{cat.label}</span>
                <span>{cat.count}</span>
              </div>
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${cat.color}`}
                  style={{ width: `${(cat.count / max) * 100}%` }}
                />
              </div>
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
export default AssetsByCategory;
