"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getTicketStats,
  getTickets,
  resolveTicket,
  type ApiTicket,
} from "@/lib/apiClient";

export type TicketRow = ApiTicket;

export type TicketStats = {
  open: number;
  inProgress: number;
  pending: number;
  resolved: number;
};

export function useTickets() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [resolvingTicketId, setResolvingTicketId] = useState<string | null>(
    null,
  );
  const [stats, setStats] = useState<TicketStats>({
    open: 0,
    inProgress: 0,
    pending: 0,
    resolved: 0,
  });

  useEffect(() => {
    let cancelled = false;
    const TICKETS_CHANGED_EVENT = "ictams:tickets-changed";

    const load = async () => {
      try {
        const [ticketResponse, statsResponse] = await Promise.all([
          getTickets(),
          getTicketStats(),
        ]);

        if (cancelled) return;
        setTickets(ticketResponse.tickets);
        setStats(statsResponse);
      } catch (error) {
        // Keep current values to avoid blanking the UI during temporary backend restarts.
        if (!cancelled) {
          console.error("Failed to load tickets", error);
        }
      }
    };

    load();
    const handleTicketsChanged = () => {
      load();
    };

    const intervalId = window.setInterval(() => {
      load();
    }, 15000);

    window.addEventListener(TICKETS_CHANGED_EVENT, handleTicketsChanged);

    return () => {
      cancelled = true;
      window.removeEventListener(TICKETS_CHANGED_EVENT, handleTicketsChanged);
      window.clearInterval(intervalId);
    };
  }, []);

  const resolveTicketById = async (ticketId: string) => {
    setResolvingTicketId(ticketId);
    try {
      await resolveTicket(ticketId);

      const [ticketResponse, statsResponse] = await Promise.all([
        getTickets(),
        getTicketStats(),
      ]);

      setTickets(ticketResponse.tickets);
      setStats(statsResponse);
    } finally {
      setResolvingTicketId(null);
    }
  };

  const openOrInProgress = useMemo(
    () =>
      tickets.filter(
        (ticket) => ticket.status === "Open" || ticket.status === "In Progress",
      ).length,
    [tickets],
  );

  return {
    tickets,
    stats,
    openOrInProgress,
    resolveTicketById,
    resolvingTicketId,
  };
}
