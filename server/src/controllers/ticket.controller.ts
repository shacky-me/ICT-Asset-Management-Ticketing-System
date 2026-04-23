import type { Response } from "express";
import type { AuthRequest } from "../types/auth.types.js";
import {
  createTicket,
  getTicketStats,
  listTickets,
} from "../services/ticket.service.js";
import type { CreateTicketBody } from "../types/ticket.types.js";

export const createTicketHandler = (
  req: AuthRequest<CreateTicketBody>,
  res: Response,
) => {
  const { title, priority, department } = req.body;

  if (!title || !priority || !department) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  if (!req.user?.id) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const ticket = createTicket(req.body, req.user.id);
  return res.status(201).json({ id: ticket.id });
};

export const listTicketsHandler = (req: AuthRequest, res: Response) => {
  if (!req.user?.id || !req.user?.role) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const filters: { status?: string; search?: string } = {};
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  if (status) filters.status = status;
  if (search) filters.search = search;

  const tickets = listTickets({
    ...filters,
    requesterId: req.user.id,
    requesterRole: req.user.role,
  });

  return res.status(200).json({ tickets });
};

export const ticketStatsHandler = (req: AuthRequest, res: Response) => {
  if (!req.user?.id || !req.user?.role) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json(getTicketStats(req.user.id, req.user.role));
};
