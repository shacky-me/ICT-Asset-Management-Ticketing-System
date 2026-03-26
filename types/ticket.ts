// ─────────────────────────────────────────────────────────────
//  types/ticket.ts
//  Shared types for the tickets module
//  Phase 1 — static mock. Phase 3: wire to API.
// ─────────────────────────────────────────────────────────────

export type TicketPriority = "Low" | "Medium" | "High" | "Critical";
export type TicketStatus = "Open" | "In Progress" | "Resolved" | "Closed";
export type TicketCategory =
  | "Hardware"
  | "Software"
  | "Network"
  | "Access & Accounts"
  | "Printer"
  | "Other";

// ── The form data shape ───────────────────────────────────────
export interface NewTicketFormData {
  title: string;
  description: string;
  category: TicketCategory | "";
  priority: TicketPriority | "";
  department: string;
  affectedAssetTag: string; // linked from asset register
  affectedAssetName: string; // display only — derived from tag
  preferredResolution: string; // date string
  attachments: File[];
}

// ── A created ticket (what the API returns) ───────────────────
export interface Ticket {
  id: string;
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  department: string;
  affectedAssetTag: string;
  affectedAssetName: string;
  preferredResolution: string;
  assignedTo: string | null; // null = unassigned
  raisedBy: string;
  createdAt: string;
}

// ── Empty form state ──────────────────────────────────────────
export const EMPTY_TICKET_FORM: NewTicketFormData = {
  title: "",
  description: "",
  category: "",
  priority: "",
  department: "",
  affectedAssetTag: "",
  affectedAssetName: "",
  preferredResolution: "",
  attachments: [],
};

// ── Priority metadata ─────────────────────────────────────────
export const PRIORITY_META: Record<
  TicketPriority,
  {
    color: string;
    bg: string;
    border: string;
    desc: string;
    sla: string;
  }
> = {
  Low: {
    color: "#4b5563",
    bg: "#f9fafb",
    border: "#e5e7eb",
    desc: "Minor issue, no immediate impact",
    sla: "5 business days",
  },
  Medium: {
    color: "#92400e",
    bg: "#fef3c7",
    border: "#fcd34d",
    desc: "Moderate impact, work can continue",
    sla: "3 business days",
  },
  High: {
    color: "#b45309",
    bg: "#ffedd5",
    border: "#fb923c",
    desc: "Significant impact on productivity",
    sla: "1 business day",
  },
  Critical: {
    color: "#b91c1c",
    bg: "#fee2e2",
    border: "#f87171",
    desc: "System down or data at risk",
    sla: "2 hours",
  },
};

// ── Category metadata ─────────────────────────────────────────
export const CATEGORY_META: Record<
  TicketCategory,
  { icon: string; desc: string }
> = {
  Hardware: { icon: "💻", desc: "Physical device issues" },
  Software: { icon: "⚙️", desc: "App crashes, errors, installs" },
  Network: { icon: "🌐", desc: "Internet, VPN, connectivity" },
  "Access & Accounts": { icon: "🔑", desc: "Login, passwords, permissions" },
  Printer: { icon: "🖨️", desc: "Printing and scanner issues" },
  Other: { icon: "📋", desc: "Any other ICT issue" },
};

// ── Mock asset list (replace with API in Phase 3) ─────────────
export const MOCK_ASSETS = [
  { tag: "KE-ICT-L-041", name: "Dell Latitude 5540", category: "Laptop" },
  { tag: "KE-ICT-L-040", name: "Dell Latitude 5540", category: "Laptop" },
  { tag: "KE-ICT-L-039", name: "Dell Latitude 5540", category: "Laptop" },
  { tag: "KE-ICT-L-038", name: "HP EliteBook 840 G9", category: "Laptop" },
  { tag: "KE-ICT-L-037", name: "Lenovo ThinkPad E14", category: "Laptop" },
  { tag: "KE-ICT-D-030", name: "Dell OptiPlex 7090", category: "Desktop" },
  { tag: "KE-ICT-P-012", name: "HP LaserJet Pro", category: "Printer" },
  {
    tag: "KE-ICT-N-005",
    name: "Cisco Catalyst 2960-X",
    category: "Networking",
  },
];

// ── Mock ICT officers (for auto-assignment) ───────────────────
export const ICT_OFFICERS = [
  { id: "1", name: "Kigen Meshack", speciality: ["Hardware", "Printer"] },
  { id: "2", name: "David Kariuki", speciality: ["Network", "Software"] },
  {
    id: "3",
    name: "Amina Hassan",
    speciality: ["Access & Accounts", "Software"],
  },
];

export const DEPARTMENTS = [
  "ICT",
  "Legal",
  "Finance",
  "HR",
  "Admin",
  "Constitutional",
  "Procurement",
  "Executive",
];

// ── Auto-assignment logic (mock — backend owns this in Phase 3) ─
export function autoAssign(category: TicketCategory): string | null {
  const officer = ICT_OFFICERS.find((o) => o.speciality.includes(category));
  return officer ? officer.name : null;
}

// ── Ticket ID generator (mock) ────────────────────────────────
export function generateTicketId(): string {
  const year = new Date().getFullYear();
  const num = String(Math.floor(Math.random() * 900) + 100);
  return `TKT-${year}-0${num}`;
}
