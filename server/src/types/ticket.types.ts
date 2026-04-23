export type TicketPriority = "Critical" | "High" | "Medium" | "Low";

export type TicketStatus = "Open" | "In Progress" | "Pending" | "Resolved";

export const TICKET_STATUS_VALUES = [
  "Open",
  "In Progress",
  "Pending",
  "Resolved",
] as const;

export function isTicketStatus(value: unknown): value is TicketStatus {
  return (
    typeof value === "string" &&
    (TICKET_STATUS_VALUES as readonly string[]).includes(value)
  );
}

export type TicketRecord = {
  id: string;
  issue: string;
  priority: TicketPriority;
  department: string;
  assignedTo: string;
  assetTag: string;
  status: TicketStatus;
  created: string;
  raisedByUserId: number;
};

export type CreateTicketBody = {
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  department: string;
  affectedAssetTag?: string;
  assignedTo?: string | null;
};
