import type { Response } from "express";
import type { AuthRequest } from "../types/auth.types.js";
import {
  createTicket,
  getTicketStats,
  listTickets,
  resolveTicket,
  updateTicketStatus,
} from "../services/ticket.service.js";
import {
  isTicketStatus,
  type CreateTicketBody,
} from "../types/ticket.types.js";
import { prisma } from "../prisma.js";
import { sendTicketAcknowledgementEmail } from "../services/emailService.js";

export const createTicketHandler = async (
  req: AuthRequest<CreateTicketBody>,
  res: Response,
) => {
  const { title, priority, department } = req.body;

  if (!title || !priority || !department) {
    return res.status(400).json({ message: "Missing required fields" });
  }

  const requesterId = Number(req.user?.id);

  if (!Number.isFinite(requesterId)) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const ticket = await createTicket(req.body, requesterId);

  const requester = await prisma.user.findUnique({
    where: { id: requesterId },
    select: { email: true, fullName: true },
  });

  if (requester?.email) {
    await sendTicketAcknowledgementEmail({
      to: requester.email,
      name: requester.fullName,
      ticketId: ticket.id,
      issue: ticket.issue,
      department: ticket.department,
      assignedTo: ticket.assignedTo,
    });
  }

  return res.status(201).json({ id: ticket.id });
};

export const listTicketsHandler = async (req: AuthRequest, res: Response) => {
  const requesterId = Number(req.user?.id);
  const requesterRole = String(req.user?.role || "");

  if (!Number.isFinite(requesterId) || !requesterRole) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const filters: { status?: string; search?: string } = {};
  const status = req.query.status as string | undefined;
  const search = req.query.search as string | undefined;

  if (status) filters.status = status;
  if (search) filters.search = search;

  const tickets = await listTickets({
    ...filters,
    requesterId,
    requesterRole,
  });

  return res.status(200).json({ tickets });
};

export const ticketStatsHandler = async (req: AuthRequest, res: Response) => {
  const requesterId = Number(req.user?.id);
  const requesterRole = String(req.user?.role || "");

  if (!Number.isFinite(requesterId) || !requesterRole) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  return res.status(200).json(await getTicketStats(requesterId, requesterRole));
};

export const resolveTicketHandler = async (req: AuthRequest, res: Response) => {
  const requesterId = Number(req.user?.id);
  const requesterRole = String(req.user?.role || "");

  if (!Number.isFinite(requesterId) || !requesterRole) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const ticketId = String(req.params.ticketId || "").trim();
  if (!ticketId) {
    return res.status(400).json({ message: "Ticket ID is required" });
  }

  const result = await resolveTicket(ticketId, requesterId, requesterRole);

  if (!result.ok) {
    if (result.reason === "not_found") {
      return res.status(404).json({ message: "Ticket not found" });
    }
    return res
      .status(403)
      .json({ message: "Not allowed to resolve this ticket" });
  }

  return res.status(200).json({
    message: "Ticket resolved successfully",
    ticket: result.ticket,
  });
};

export const updateTicketStatusHandler = async (
  req: AuthRequest<{ status?: string }>,
  res: Response,
) => {
  const requesterId = Number(req.user?.id);
  const requesterRole = String(req.user?.role || "");

  if (!Number.isFinite(requesterId) || !requesterRole) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const ticketId = String(req.params.ticketId || "").trim();
  if (!ticketId) {
    return res.status(400).json({ message: "Ticket ID is required" });
  }

  const nextStatus = req.body?.status;
  if (!isTicketStatus(nextStatus)) {
    return res.status(400).json({ message: "Valid status is required" });
  }

  const result = await updateTicketStatus(
    ticketId,
    nextStatus,
    requesterId,
    requesterRole,
  );

  if (!result.ok) {
    if (result.reason === "not_found") {
      return res.status(404).json({ message: "Ticket not found" });
    }

    if (result.reason === "forbidden") {
      return res
        .status(403)
        .json({ message: "Not allowed to update this ticket" });
    }

    return res
      .status(400)
      .json({ message: "Invalid ticket status transition" });
  }

  return res.status(200).json({
    message: `Ticket status updated to ${result.ticket.status}`,
    ticket: result.ticket,
  });
};
