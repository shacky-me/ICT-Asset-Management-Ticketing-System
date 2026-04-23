import type {
  CreateTicketBody,
  TicketRecord,
  TicketStatus,
} from "../types/ticket.types.js";

const tickets: TicketRecord[] = [];

function generateTicketId() {
  const year = new Date().getFullYear();
  const seed = Math.floor(Math.random() * 9000 + 1000);
  return `TKT-${year}-${seed}`;
}

function formatRelative(isoDate: string) {
  const created = new Date(isoDate).getTime();
  const diffMinutes = Math.max(1, Math.floor((Date.now() - created) / 60000));
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

export const createTicket = (
  payload: CreateTicketBody,
  raisedByUserId: number,
): TicketRecord => {
  const now = new Date().toISOString();
  const ticket: TicketRecord = {
    id: generateTicketId(),
    issue: payload.title,
    priority: payload.priority,
    department: payload.department,
    assignedTo: payload.assignedTo || "Unassigned",
    assetTag: payload.affectedAssetTag || "N/A",
    status: "Open",
    created: formatRelative(now),
    raisedByUserId,
  };

  tickets.unshift(ticket);
  return ticket;
};

export const listTickets = (filters?: {
  status?: string;
  search?: string;
  requesterId: number;
  requesterRole: string;
}): TicketRecord[] => {
  return tickets.filter((ticket) => {
    const canSeeTicket =
      filters?.requesterRole === "ICT_ADMIN" ||
      ticket.raisedByUserId === filters?.requesterId;

    const statusMatch =
      !filters?.status ||
      filters.status === "All" ||
      ticket.status === filters.status;

    const query = (filters?.search || "").trim().toLowerCase();
    const searchMatch =
      query.length === 0 ||
      [
        ticket.id,
        ticket.issue,
        ticket.priority,
        ticket.department,
        ticket.assignedTo,
        ticket.assetTag,
        ticket.status,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query);

    return canSeeTicket && statusMatch && searchMatch;
  });
};

export const getTicketStats = (requesterId: number, requesterRole: string) => {
  const visibleTickets = tickets.filter(
    (ticket) =>
      requesterRole === "ICT_ADMIN" || ticket.raisedByUserId === requesterId,
  );

  const countByStatus = (status: TicketStatus) =>
    visibleTickets.filter((ticket) => ticket.status === status).length;

  return {
    open: countByStatus("Open"),
    inProgress: countByStatus("In Progress"),
    pending: countByStatus("Pending"),
    resolved: countByStatus("Resolved"),
  };
};
