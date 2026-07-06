import type {
  CreateTicketBody,
  TicketRecord,
  TicketStatus,
} from "../types/ticket.types.js";
import { prisma } from "../prisma.js";

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

type TicketRow = {
  id: string;
  issue: string;
  priority: string;
  department: string;
  assigned_to: string;
  asset_tag: string;
  status: string;
  created_at: Date;
  raised_by_user_id: number;
};

function normalizeRole(role: string) {
  return String(role || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "_");
}

const allowedStatusTransitions: Record<TicketStatus, TicketStatus[]> = {
  Open: ["In Progress", "Pending", "Resolved"],
  "In Progress": ["Pending", "Resolved"],
  Pending: ["In Progress", "Resolved"],
  Resolved: [],
};

function canTransitionTicketStatus(
  currentStatus: TicketStatus,
  nextStatus: TicketStatus,
) {
  return allowedStatusTransitions[currentStatus].includes(nextStatus);
}

let ticketTableEnsured = false;

async function ensureTicketTable() {
  if (ticketTableEnsured) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Ticket" (
      id TEXT PRIMARY KEY,
      issue TEXT NOT NULL,
      priority TEXT NOT NULL,
      department TEXT NOT NULL,
      assigned_to TEXT NOT NULL,
      asset_tag TEXT NOT NULL,
      status TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      raised_by_user_id INTEGER NOT NULL
    );
  `);

  ticketTableEnsured = true;
}

function mapRowToTicket(row: TicketRow): TicketRecord {
  return {
    id: row.id,
    issue: row.issue,
    priority: row.priority as TicketRecord["priority"],
    department: row.department,
    assignedTo: row.assigned_to,
    assetTag: row.asset_tag,
    status: row.status as TicketStatus,
    created: formatRelative(new Date(row.created_at).toISOString()),
    raisedByUserId: row.raised_by_user_id,
  };
}

export const createTicket = async (
  payload: CreateTicketBody,
  raisedByUserId: number,
): Promise<TicketRecord> => {
  await ensureTicketTable();

  const ticketId = generateTicketId();

  const rows = await prisma.$queryRawUnsafe<TicketRow[]>(
    `
      INSERT INTO "Ticket" (id, issue, priority, department, assigned_to, asset_tag, status, raised_by_user_id)
      VALUES ($1, $2, $3, $4, $5, $6, 'Open', $7)
      RETURNING id, issue, priority, department, assigned_to, asset_tag, status, created_at, raised_by_user_id;
    `,
    ticketId,
    payload.title,
    payload.priority,
    payload.department,
    payload.assignedTo || "Unassigned",
    payload.affectedAssetTag || "N/A",
    raisedByUserId,
  );

  const created = rows[0];
  if (!created) {
    throw new Error("Ticket creation failed");
  }

  return mapRowToTicket(created);
};

export const updateTicketStatus = (
  ticketId: string,
  nextStatus: TicketStatus,
  requesterId: number,
  requesterRole: string,
): Promise<
  | { ok: true; ticket: TicketRecord }
  | { ok: false; reason: "not_found" | "forbidden" | "invalid_transition" }
> =>
  (async () => {
    await ensureTicketTable();

    const normalizedRole = normalizeRole(requesterRole);
    const rows = await prisma.$queryRawUnsafe<TicketRow[]>(
      `
        SELECT id, issue, priority, department, assigned_to, asset_tag, status, created_at, raised_by_user_id
        FROM "Ticket"
        WHERE id = $1
        LIMIT 1;
      `,
      ticketId,
    );

    const target = rows[0];
    if (!target) {
      return { ok: false, reason: "not_found" };
    }

    const canManageTicket =
      normalizedRole === "ICT_ADMIN" || normalizedRole === "ICT_OFFICER";

    if (!canManageTicket) {
      return { ok: false, reason: "forbidden" };
    }

    const currentStatus = target.status as TicketStatus;
    if (currentStatus === nextStatus) {
      return { ok: true, ticket: mapRowToTicket(target) };
    }

    if (!canTransitionTicketStatus(currentStatus, nextStatus)) {
      return { ok: false, reason: "invalid_transition" };
    }

    const updatedRows = await prisma.$queryRawUnsafe<TicketRow[]>(
      `
        UPDATE "Ticket"
        SET status = $2
        WHERE id = $1
        RETURNING id, issue, priority, department, assigned_to, asset_tag, status, created_at, raised_by_user_id;
      `,
      ticketId,
      nextStatus,
    );

    const updated = updatedRows[0];
    if (!updated) {
      return { ok: false, reason: "not_found" };
    }

    return { ok: true, ticket: mapRowToTicket(updated) };
  })();

export const listTickets = async (filters?: {
  status?: string;
  search?: string;
  requesterId: number;
  requesterRole: string;
}): Promise<TicketRecord[]> => {
  await ensureTicketTable();

  const rows = await prisma.$queryRawUnsafe<TicketRow[]>(
    `
      SELECT id, issue, priority, department, assigned_to, asset_tag, status, created_at, raised_by_user_id
      FROM "Ticket"
      ORDER BY created_at DESC;
    `,
  );

  const tickets = rows.map(mapRowToTicket);
  const requesterId = Number(filters?.requesterId);
  const requesterRole = normalizeRole(filters?.requesterRole || "");

  return tickets.filter((ticket) => {
    const canSeeTicket =
      requesterRole === "ICT_ADMIN" || ticket.raisedByUserId === requesterId;

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

export const getTicketStats = async (
  requesterId: number,
  requesterRole: string,
) => {
  const visibleTickets = await listTickets({
    requesterId,
    requesterRole,
  });

  const countByStatus = (status: TicketStatus) =>
    visibleTickets.filter((ticket) => ticket.status === status).length;

  return {
    open: countByStatus("Open"),
    inProgress: countByStatus("In Progress"),
    pending: countByStatus("Pending"),
    resolved: countByStatus("Resolved"),
  };
};

export const resolveTicket = (
  ticketId: string,
  requesterId: number,
  requesterRole: string,
): Promise<
  | { ok: true; ticket: TicketRecord }
  | { ok: false; reason: "not_found" | "forbidden" | "invalid_transition" }
> =>
  (async () => {
    await ensureTicketTable();

    const result = await updateTicketStatus(
      ticketId,
      "Resolved",
      requesterId,
      requesterRole,
    );
    return result;
  })();
