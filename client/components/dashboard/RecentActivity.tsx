import { useMemo } from "react";
import type { AssetRow } from "@/lib/assets";
import type { TicketRow } from "@/lib/tickets";
import type { AssignmentRecord } from "@/lib/assignments";

type Props = {
  assets: AssetRow[];
  tickets: TicketRow[];
  assignments: AssignmentRecord[];
};

type Activity = {
  color: string;
  title: string;
  desc: string;
  time: string;
  sortValue: number;
};

function parseDate(input: string): number {
  const parsed = Date.parse(input);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatRelativeTime(input: string): string {
  const timestamp = parseDate(input);
  if (!timestamp) return "Unknown";

  const diffMs = Date.now() - timestamp;
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

const RecentActivity = ({ assets, tickets, assignments }: Props) => {
  const activities = useMemo<Activity[]>(() => {
    const assetActivities: Activity[] = assets.slice(0, 8).map((asset) => ({
      color: "bg-blue-500",
      title: asset.name || asset.tag,
      desc: `${asset.tag} registered in ${asset.department}`,
      time: formatRelativeTime(asset.createdAt),
      sortValue: parseDate(asset.createdAt),
    }));

    const ticketActivities: Activity[] = tickets.slice(0, 8).map((ticket) => ({
      color: "bg-red-500",
      title: `${ticket.priority} ticket`,
      desc: `${ticket.status} - ${ticket.issue}`,
      time: formatRelativeTime(ticket.created),
      sortValue: parseDate(ticket.created),
    }));

    const assignmentActivities: Activity[] = assignments
      .slice(0, 8)
      .map((assignment) => ({
        color: "bg-green-500",
        title: assignment.assetName,
        desc: `${assignment.status.toLowerCase()} to ${assignment.assignedTo}`,
        time: formatRelativeTime(assignment.dateIssued),
        sortValue: parseDate(assignment.dateIssued),
      }));

    return [...assetActivities, ...ticketActivities, ...assignmentActivities]
      .sort((a, b) => b.sortValue - a.sortValue)
      .slice(0, 6);
  }, [assets, assignments, tickets]);

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
        {activities.length > 0 ? (
          activities.map((a, i) => (
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
          ))
        ) : (
          <p className="text-xs text-gray-400">No activity yet.</p>
        )}
      </div>
    </div>
  );
};
export default RecentActivity;
