"use client";

import { useEffect, useMemo, useState } from "react";
import { getTicketStats, getTickets, type ApiTicket } from "@/lib/apiClient";

export type TicketRow = ApiTicket;

export type TicketStats = {
  open: number;
  inProgress: number;
  pending: number;
  resolved: number;
};

export function useTickets() {
  const [tickets, setTickets] = useState<TicketRow[]>([]);
  const [stats, setStats] = useState<TicketStats>({
    open: 0,
    inProgress: 0,
    pending: 0,
    resolved: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const [ticketResponse, statsResponse] = await Promise.all([
          getTickets(),
          getTicketStats(),
        ]);

        if (cancelled) return;
        setTickets(ticketResponse.tickets);
        setStats(statsResponse);
      } catch {
        if (!cancelled) {
          setTickets([]);
          setStats({ open: 0, inProgress: 0, pending: 0, resolved: 0 });
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, []);

  const openOrInProgress = useMemo(
    () =>
      tickets.filter(
        (ticket) => ticket.status === "Open" || ticket.status === "In Progress",
      ).length,
    [tickets],
  );

  return { tickets, stats, openOrInProgress };
}
