import type { CreateTicketBody, TicketRecord } from "../types/ticket.types.js";
export declare const createTicket: (payload: CreateTicketBody) => TicketRecord;
export declare const listTickets: (filters?: {
    status?: string;
    search?: string;
}) => TicketRecord[];
export declare const getTicketStats: () => {
    open: number;
    inProgress: number;
    pending: number;
    resolved: number;
};
//# sourceMappingURL=ticket.service.d.ts.map