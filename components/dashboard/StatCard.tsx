import { type LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: number;
  sub: string;
  subColor: string;
  icon: LucideIcon;
  iconColor: string;
}

const StatCard = ({
  label,
  value,
  sub,
  subColor,
  icon: Icon,
  iconColor,
}: StatCardProps) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-4 space-y-2">
      <Icon className={`h-5 w-5 ${iconColor}`} />
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
      <p className={`text-xs font-medium ${subColor}`}>{sub}</p>
    </div>
  );
};
export default StatCard;
