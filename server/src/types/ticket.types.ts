export type TicketPriority = "Critical" | "High" | "Medium" | "Low";

export type TicketStatus = "Open" | "In Progress" | "Pending" | "Resolved";

export type TicketRecord = {
  id: string;
  issue: string;
  priority: TicketPriority;
  department: string;
  assignedTo: string;
  assetTag: string;
  status: TicketStatus;
  created: string;
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
