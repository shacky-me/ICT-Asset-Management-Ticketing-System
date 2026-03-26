import { Ticket } from "lucide-react";

const stats = [
  {
    label: "Open",
    value: 10,
    color: "text-red-500",
    border: "border-t-red-500",
    bg: "bg-red-50",
  },
  {
    label: "In Progress",
    value: 3,
    color: "text-orange-500",
    border: "border-t-orange-500",
    bg: "bg-orange-50",
  },
  {
    label: "Pending",
    value: 2,
    color: "text-blue-500",
    border: "border-t-blue-500",
    bg: "bg-blue-50",
  },
  {
    label: "Resolved",
    value: 8,
    color: "text-green-500",
    border: "border-t-green-500",
    bg: "bg-green-50",
  },
];

const TicketStatsBar = () => {
  return (
    <div className="grid grid-cols-4 gap-4">
      {stats.map((s) => (
        <div
          key={s.label}
          className={`bg-white border border-gray-200 border-t-2 ${s.border} rounded-xl px-5 py-5 flex items-center justify-between`}
        >
          <div className="space-y-1">
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest">
              {s.label}
            </p>
          </div>
          <div
            className={`h-10 w-10 rounded-lg ${s.bg} flex items-center justify-center`}
          >
            <Ticket className={`h-5 w-5 ${s.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
};
export default TicketStatsBar;
