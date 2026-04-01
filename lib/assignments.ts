"use client";

import { useEffect, useMemo, useState } from "react";
import { getInitials } from "@/lib/session";

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

export const ASSIGNABLE_ASSETS = [
  { tag: "KE-ICT-L-041", name: "Dell Latitude 5540", category: "Laptop" },
  { tag: "KE-ICT-L-042", name: "HP EliteBook 840 G9", category: "Laptop" },
  { tag: "KE-ICT-M-034", name: 'Samsung 27" Monitor', category: "Monitor" },
  { tag: "KE-ICT-M-035", name: 'LG 24" Monitor', category: "Monitor" },
  { tag: "KE-ICT-D-039", name: "Lenovo ThinkCentre M90q", category: "Desktop" },
  { tag: "KE-ICT-P-040", name: "HP LaserJet Pro M404dn", category: "Printer" },
];

export const ASSIGNABLE_USERS = [
  { name: "Sarah Kariuki", id: "SK-001", department: "ICT Department" },
  { name: "John Mwangi", id: "JM-001", department: "Finance Department" },
  { name: "Peter Odhiambo", id: "PO-001", department: "Legal Affairs" },
  { name: "Mary Njeru", id: "MN-001", department: "Administration" },
  { name: "Tom Kipchoge", id: "TK-001", department: "ICT Department" },
];

const ASSIGNMENTS_KEY = "ictams.assignments";
const ASSIGNMENTS_EVENT = "ictams:assignments-changed";

const DEFAULT_ASSIGNMENTS: AssignmentRecord[] = [
  {
    ref: "ASSGN-2026-033",
    assetTag: "KE-ICT-L-033",
    assetName: "HP ProBook 450 G8",
    assignedTo: "Kigen Meshack",
    initials: "KM",
    department: "Legal Affairs",
    dateIssued: "2026-01-10",
    status: "Returned",
  },
  {
    ref: "ASSGN-2026-032",
    assetTag: "KE-ICT-L-032",
    assetName: "Dell Latitude 5540",
    assignedTo: "Jane Mwangi",
    initials: "JM",
    department: "Finance Department",
    dateIssued: "2026-01-08",
    status: "Assigned",
  },
  {
    ref: "ASSGN-2026-031",
    assetTag: "KE-ICT-M-034",
    assetName: 'Samsung 27" Monitor',
    assignedTo: "Peter Odhiambo",
    initials: "PO",
    department: "ICT Department",
    dateIssued: "2026-01-05",
    status: "Overdue",
  },
];

function canUseBrowserStorage() {
  return typeof window !== "undefined";
}

function dispatchAssignmentsChanged() {
  if (!canUseBrowserStorage()) return;
  window.dispatchEvent(new Event(ASSIGNMENTS_EVENT));
}

function readAssignmentsFromStorage(): AssignmentRecord[] {
  if (!canUseBrowserStorage()) return [];

  const raw = window.localStorage.getItem(ASSIGNMENTS_KEY);
  if (!raw) {
    window.localStorage.setItem(
      ASSIGNMENTS_KEY,
      JSON.stringify(DEFAULT_ASSIGNMENTS),
    );
    return DEFAULT_ASSIGNMENTS;
  }

  try {
    const parsed = JSON.parse(raw) as AssignmentRecord[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeAssignmentsToStorage(items: AssignmentRecord[]) {
  if (!canUseBrowserStorage()) return;
  window.localStorage.setItem(ASSIGNMENTS_KEY, JSON.stringify(items));
  dispatchAssignmentsChanged();
}

function generateAssignmentRef(existing: AssignmentRecord[]) {
  const year = new Date().getFullYear();
  const maxForYear = existing
    .map((item) => {
      const match = item.ref.match(new RegExp(`ASSGN-${year}-(\\d{3,4})`));
      return match ? Number(match[1]) : 0;
    })
    .reduce((max, current) => (current > max ? current : max), 0);

  return `ASSGN-${year}-${String(maxForYear + 1).padStart(3, "0")}`;
}

export function addAssignment(input: {
  assetTag: string;
  assetName: string;
  assignedTo: string;
  department: string;
}) {
  const existing = readAssignmentsFromStorage();
  const next: AssignmentRecord = {
    ref: generateAssignmentRef(existing),
    assetTag: input.assetTag,
    assetName: input.assetName,
    assignedTo: input.assignedTo,
    initials: getInitials(input.assignedTo),
    department: input.department,
    dateIssued: new Date().toISOString().slice(0, 10),
    status: "Assigned",
  };

  writeAssignmentsToStorage([next, ...existing]);
  return next;
}

export function useAssignments() {
  const [items, setItems] = useState<AssignmentRecord[]>([]);

  useEffect(() => {
    if (!canUseBrowserStorage()) return;

    const sync = () => setItems(readAssignmentsFromStorage());
    queueMicrotask(sync);

    window.addEventListener("storage", sync);
    window.addEventListener(ASSIGNMENTS_EVENT, sync);

    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(ASSIGNMENTS_EVENT, sync);
    };
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const assigned = items.filter((item) => item.status === "Assigned").length;
    const returned = items.filter((item) => item.status === "Returned").length;
    const overdue = items.filter((item) => item.status === "Overdue").length;
    return { total, assigned, returned, overdue };
  }, [items]);

  return { items, stats };
}
