import { createTicket, getTicketStats, listTickets, } from "../services/ticket.service.js";
export const createTicketHandler = (req, res) => {
    const { title, priority, department } = req.body;
    if (!title || !priority || !department) {
        return res.status(400).json({ message: "Missing required fields" });
    }
    const ticket = createTicket(req.body);
    return res.status(201).json({ id: ticket.id });
};
export const listTicketsHandler = (req, res) => {
    const filters = {};
    const status = req.query.status;
    const search = req.query.search;
    if (status)
        filters.status = status;
    if (search)
        filters.search = search;
    const tickets = listTickets(filters);
    return res.status(200).json({ tickets });
};
export const ticketStatsHandler = (_req, res) => {
    return res.status(200).json(getTicketStats());
};
//# sourceMappingURL=ticket.controller.js.map