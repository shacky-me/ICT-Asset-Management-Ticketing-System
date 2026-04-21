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

  const ticket = createTicket(req.body);
  return res.status(201).json({ id: ticket.id });
};

export const listTicketsHandler = (req: AuthRequest, res: Response) => {
  const filters: { status?: string; search?: string } = {};
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  if (status) filters.status = status;
  if (search) filters.search = search;

  const tickets = listTickets(filters);

  return res.status(200).json({ tickets });
};

export const ticketStatsHandler = (_req: AuthRequest, res: Response) => {
  return res.status(200).json(getTicketStats());
};
