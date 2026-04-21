"use client";

import { useEffect, useMemo, useState } from "react";
import { getInitials } from "@/lib/session";
import {
  getAssignments,
  getAssignmentStats,
  type ApiAssignment,
} from "@/lib/apiClient";

export type AssignmentStatus = "Assigned" | "Returned" | "Overdue";

export type AssignmentRecord = {
  ref: string;
  assetTag: string;
  assetName: string;
  assignedTo: string;
  initials: string;
  department: string;
  dateIssued: string;
  status: AssignmentStatus;
};

function mapStatus(input: ApiAssignment): AssignmentStatus {
  if (input.isOverdue || input.status === "OVERDUE") return "Overdue";
  if (input.status === "RETURNED") return "Returned";
  return "Assigned";
}

function mapAssignment(input: ApiAssignment): AssignmentRecord {
  return {
    ref: input.refNo,
    assetTag: input.asset?.tagNo || "N/A",
    assetName: input.asset?.model || input.asset?.category || "Unknown Asset",
    assignedTo: input.assignedTo,
    initials: getInitials(input.assignedTo),
    department: input.department?.name || "Unassigned",
    dateIssued: input.assignedAt.slice(0, 10),
    status: mapStatus(input),
  };
}

export function useAssignments() {
  const [items, setItems] = useState<AssignmentRecord[]>([]);
  const [apiStats, setApiStats] = useState({
    active: 0,
    returned: 0,
    overdue: 0,
  });

  useEffect(() => {
    let cancelled = false;

    const loadAssignments = async () => {
      try {
        const [assignmentResponse, statsResponse] = await Promise.all([
          getAssignments({ limit: 100 }),
          getAssignmentStats(),
        ]);

        if (cancelled) return;
        setItems(assignmentResponse.assignments.map(mapAssignment));
        setApiStats({
          active: statsResponse.active,
          returned: statsResponse.returned,
          overdue: statsResponse.overdue,
        });
      } catch {
        if (!cancelled) {
          setItems([]);
          setApiStats({ active: 0, returned: 0, overdue: 0 });
        }
      }
    };

    loadAssignments();

    return () => {
      cancelled = true;
    };
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const assigned = apiStats.active;
    const returned = apiStats.returned;
    const overdue = apiStats.overdue;
    return { total, assigned, returned, overdue };
  }, [apiStats.active, apiStats.overdue, apiStats.returned, items.length]);

  return { items, stats };
}
