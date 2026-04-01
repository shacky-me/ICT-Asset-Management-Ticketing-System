import { AlertTriangle } from "lucide-react";

type Props = {
  overdueCount: number;
  onViewOverdue: () => void;
};

const AssignmentAlert = ({ overdueCount, onViewOverdue }: Props) => {
  return (
    <div className="flex items-center justify-between bg-red-50 border border-red-200 rounded-xl px-5 py-4">
      <div className="flex items-start gap-3">
        <div className="h-8 w-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </div>
        <div>
          <p className="text-sm font-semibold text-red-600">
            {overdueCount} Overdue Asset Returns
          </p>
          <p className="text-xs text-red-400 mt-0.5">
            Assets issued to staff members who have separated or transferred.
            Immediate retrieval action required.
          </p>
        </div>
      </div>
      <button
        onClick={onViewOverdue}
        className="text-xs text-red-500 font-semibold whitespace-nowrap hover:underline cursor-pointer"
      >
        View Overdue →
      </button>
    </div>
  );
};
export default AssignmentAlert;
