import {
  BarChart2,
  Users,
  Ticket,
  AlertTriangle,
  Store,
  Download,
} from "lucide-react";
import { Button } from "@/components/ui/button";

type IconType = "chart" | "users" | "ticket" | "warning" | "store";

interface Props {
  title: string;
  description: string;
  formats: string[];
  icon: string;
  color: string;
  bg: string;
  onExportPDF?: () => void;
  onExportCSV?: () => void;
  isExporting?: boolean;
}

const icons: Record<IconType, React.ReactNode> = {
  chart: <BarChart2 className="h-5 w-5" />,
  users: <Users className="h-5 w-5" />,
  ticket: <Ticket className="h-5 w-5" />,
  warning: <AlertTriangle className="h-5 w-5" />,
  store: <Store className="h-5 w-5" />,
};

const ReportCard = ({
  title,
  description,
  formats,
  icon,
  color,
  bg,
  onExportPDF,
  onExportCSV,
  isExporting = false,
}: Props) => {
  return (
    <div className="bg-white border border-gray-200 rounded-xl px-5 py-5 flex flex-col gap-4">
      {/* Top row — icon + title + download buttons */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <div
            className={`h-9 w-9 rounded-lg ${bg} ${color} flex items-center justify-center shrink-0`}
          >
            {icons[icon as IconType]}
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">{title}</p>
            <p className="text-xs text-gray-400 mt-0.5">{description}</p>
          </div>
        </div>

        {/* Download buttons */}
        <div className="flex items-center gap-2 shrink-0 ml-4">
          {formats.includes("PDF") && (
            <Button
              onClick={onExportPDF}
              disabled={isExporting}
              variant="outline"
              className="h-7 gap-1.5 text-xs cursor-pointer text-gray-600 px-3"
            >
              <Download className="h-3 w-3" /> PDF
            </Button>
          )}
          {formats.includes("CSV") && (
            <Button
              onClick={onExportCSV}
              disabled={isExporting}
              variant="outline"
              className="h-7 gap-1.5 text-xs cursor-pointer text-green-600 border-green-200 hover:bg-green-50 px-3"
            >
              <Download className="h-3 w-3" /> CSV
            </Button>
          )}
        </div>
      </div>

      {/* Footer format tags */}
      <div className="flex items-center gap-1">
        {formats.map((f) => (
          <span
            key={f}
            className="text-[10px] font-semibold text-[#235FE7] uppercase tracking-wider"
          >
            {f}
            {formats.indexOf(f) < formats.length - 1 ? "/" : ""}
          </span>
        ))}
      </div>
    </div>
  );
};
export default ReportCard;
