const categories = [
  { label: "Peripherals", count: 500, color: "bg-gray-700", max: 500 },
  { label: "Laptops", count: 350, color: "bg-blue-500", max: 500 },
  { label: "Desktops", count: 120, color: "bg-green-500", max: 500 },
  { label: "Printers", count: 150, color: "bg-orange-400", max: 500 },
  { label: "Networking", count: 80, color: "bg-purple-500", max: 500 },
  { label: "UPS/Power", count: 70, color: "bg-red-400", max: 500 },
];

const AssetsByCategory = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-4">
      <div>
        <p className="text-sm font-bold text-gray-900">Assets by Category</p>
        <p className="text-xs text-gray-400">6 equipment types</p>
      </div>
      <div className="space-y-3">
        {categories.map((cat) => (
          <div key={cat.label} className="space-y-1">
            <div className="flex justify-between text-xs text-gray-600">
              <span>{cat.label}</span>
              <span>{cat.count}</span>
            </div>
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${cat.color}`}
                style={{ width: `${(cat.count / cat.max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default AssetsByCategory;
