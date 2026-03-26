const activities = [
  {
    color: "bg-green-500",
    title: "Dell Latitude 5540",
    desc: "assigned to J.Mwangi",
    time: "2 min ago",
  },
  {
    color: "bg-red-500",
    title: "Critical ticketing",
    desc: "raised - Network Switch port failure",
    time: "1h ago",
  },
  {
    color: "bg-blue-500",
    title: "HP EliteBook 840",
    desc: "G9 registered to system",
    time: "3h ago",
  },
  {
    color: "bg-orange-400",
    title: "Cisco Catalyst",
    desc: "2960-X sent for maintenance",
    time: "1d ago",
  },
];

const RecentActivity = () => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-bold text-gray-900">Recent Activity</p>
          <p className="text-xs text-gray-400">Live audit trail</p>
        </div>
        <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
      </div>
      <div className="space-y-4">
        {activities.map((a, i) => (
          <div key={i} className="flex gap-3">
            <span
              className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${a.color}`}
            />
            <div>
              <p className="text-sm font-medium text-gray-900">{a.title}</p>
              <p className="text-xs text-gray-500">{a.desc}</p>
              <p className="text-xs text-gray-400 mt-0.5">{a.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
export default RecentActivity;
