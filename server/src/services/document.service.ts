import { prisma } from "../prisma.js";
import type { DocumentAudience, DocumentEventType } from "@prisma/client";

// ─── Roles in the document subsystem ─────────────────────────────────────────
// The PS, Director and Assistant Director oversee documents. The ICT Admin has
// no standing here: in this subsystem they are an ordinary officer.

export const LEADERSHIP_ROLES = ["PS", "DIRECTOR", "ASSISTANT_DIRECTOR"];

export function isLeadership(role: string): boolean {
  return LEADERSHIP_ROLES.includes(role);
}

export function isPs(role: string): boolean {
  return role === "PS";
}

export function isHod(role: string): boolean {
  return role === "HOD";
}

export type Actor = {
  id: number;
  role: string;
  departmentId: number;
};

// ─── Visibility ──────────────────────────────────────────────────────────────

type ShareRow = {
  audience: DocumentAudience;
  targetUserId: number | null;
  targetDepartmentId: number | null;
};

type DocumentForAccess = {
  initiatorId: number;
  departmentId: number;
  initiator: { role: string };
  shares: ShareRow[];
};

// Who may open a document:
//  - the person who raised it;
//  - leadership (PS, Director, Assistant Director), who oversee everything;
//  - anyone it was shared with directly, or through their department, or
//    through an "all HODs" / "all staff" share;
//  - the HOD of the department a staff member raised it from, so they can see
//    what was sent up and how the PS responded. A document a HOD raised is not
//    visible to that department's staff unless the HOD shares it with them.
export function canViewDocument(actor: Actor, document: DocumentForAccess): boolean {
  if (document.initiatorId === actor.id) return true;
  if (isLeadership(actor.role)) return true;

  for (const share of document.shares) {
    if (share.audience === "USER" && share.targetUserId === actor.id) return true;
    if (
      share.audience === "DEPARTMENT_STAFF" &&
      share.targetDepartmentId === actor.departmentId
    ) {
      return true;
    }
    if (share.audience === "ALL_HODS" && isHod(actor.role)) return true;
    if (share.audience === "ALL_STAFF") return true;
  }

  // HOD oversight of their own department's submissions.
  if (
    isHod(actor.role) &&
    document.departmentId === actor.departmentId &&
    !isHod(document.initiator.role) &&
    !isLeadership(document.initiator.role)
  ) {
    return true;
  }

  return false;
}

// Only the PS decides. Leadership may still read and comment.
export function canDecideDocument(actor: Actor): boolean {
  return isPs(actor.role);
}

// A document that is not critical can be previewed, downloaded and printed by
// anyone who can see it.
//
// A critical one is narrower. It stays open to the people who are actually
// handling it — leadership, the person who raised it, anyone it was sent to by
// name, and the HOD overseeing that department — but not to people who merely
// received it through a broad "all staff", "all HODs" or whole-department
// share.
export function canDownloadAttachment(
  actor: Actor,
  document: DocumentForAccess & { isCritical: boolean },
): boolean {
  if (!document.isCritical) return true;
  if (isLeadership(actor.role)) return true;
  if (document.initiatorId === actor.id) return true;

  const sentToThemByName = document.shares.some(
    (share) => share.audience === "USER" && share.targetUserId === actor.id,
  );
  if (sentToThemByName) return true;

  const overseesTheDepartment =
    isHod(actor.role) &&
    document.departmentId === actor.departmentId &&
    !isHod(document.initiator.role) &&
    !isLeadership(document.initiator.role);

  return overseesTheDepartment;
}

// Which audiences a role may share with.
export function allowedAudiences(role: string): DocumentAudience[] {
  if (isPs(role)) return ["USER", "DEPARTMENT_STAFF", "ALL_HODS", "ALL_STAFF"];
  if (isLeadership(role)) return ["USER", "DEPARTMENT_STAFF", "ALL_HODS"];
  // HODs reach any department and its staff.
  if (isHod(role)) return ["USER", "DEPARTMENT_STAFF"];
  // Everyone else shares upward, to a named person only.
  return ["USER"];
}

// Staff may only send a document to the PS or to a HOD.
export function canShareWithUser(
  actorRole: string,
  targetRole: string,
): boolean {
  if (isLeadership(actorRole) || isHod(actorRole)) return true;
  return isPs(targetRole) || isHod(targetRole);
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const documentInclude = {
  initiator: {
    select: { id: true, fullName: true, role: true, department: { select: { name: true } } },
  },
  department: { select: { id: true, name: true } },
  decidedBy: { select: { id: true, fullName: true } },
  shares: {
    include: {
      targetUser: { select: { id: true, fullName: true, role: true } },
      targetDepartment: { select: { id: true, name: true } },
      sharedBy: { select: { id: true, fullName: true } },
    },
    orderBy: { createdAt: "asc" },
  },
  comments: {
    include: { author: { select: { id: true, fullName: true, role: true } } },
    orderBy: { createdAt: "asc" },
  },
  attachments: {
    include: { uploader: { select: { id: true, fullName: true } } },
    orderBy: { createdAt: "asc" },
  },
  events: {
    include: { actor: { select: { id: true, fullName: true, role: true } } },
    orderBy: { createdAt: "asc" },
  },
} as const;

async function generateRefNo(): Promise<string> {
  const year = new Date().getFullYear();
  const count = await prisma.document.count();
  const serial = String(count + 1).padStart(4, "0");
  return `DOC-${year}-${serial}`;
}

export async function recordEvent(
  documentId: number,
  actorId: number,
  type: DocumentEventType,
  detail?: string,
) {
  await prisma.documentEvent.create({
    data: { documentId, actorId, type, ...(detail ? { detail } : {}) },
  });
}

// ─── Reads ───────────────────────────────────────────────────────────────────

export async function listVisibleDocuments(actor: Actor, search?: string) {
  const documents = await prisma.document.findMany({
    include: documentInclude,
    orderBy: { createdAt: "desc" },
  });

  const query = (search || "").trim().toLowerCase();

  return documents
    .filter((document) => canViewDocument(actor, document))
    .filter((document) => {
      if (!query) return true;
      return [document.refNo, document.title, document.summary || "", document.initiator.fullName]
        .join(" ")
        .toLowerCase()
        .includes(query);
    });
}

export async function getDocumentForActor(id: number, actor: Actor) {
  const document = await prisma.document.findUnique({
    where: { id },
    include: documentInclude,
  });

  if (!document) return { ok: false as const, reason: "not_found" as const };
  if (!canViewDocument(actor, document)) {
    return { ok: false as const, reason: "forbidden" as const };
  }

  return { ok: true as const, document };
}

// ─── Writes ──────────────────────────────────────────────────────────────────

export async function createDocument(
  actor: Actor,
  payload: {
    title: string;
    summary?: string;
    content?: string;
    isCritical?: boolean;
  },
) {
  const refNo = await generateRefNo();

  const document = await prisma.document.create({
    data: {
      refNo,
      title: payload.title,
      ...(payload.summary ? { summary: payload.summary } : {}),
      ...(payload.content ? { content: payload.content } : {}),
      isCritical: Boolean(payload.isCritical),
      initiatorId: actor.id,
      departmentId: actor.departmentId,
    },
  });

  await recordEvent(document.id, actor.id, "INITIATED", `Raised ${refNo}`);
  return document;
}

export async function shareDocument(
  documentId: number,
  actor: Actor,
  payload: {
    audience: DocumentAudience;
    targetUserId?: number;
    targetDepartmentId?: number;
    note?: string;
  },
) {
  if (!allowedAudiences(actor.role).includes(payload.audience)) {
    throw new Error("You cannot share a document with that audience");
  }

  let detail = "";

  if (payload.audience === "USER") {
    const targetUserId = Number(payload.targetUserId);

    if (!Number.isFinite(targetUserId)) {
      throw new Error("Recipient is required");
    }

    const target = await prisma.user.findFirst({
      where: { id: targetUserId, isActive: true },
      select: { id: true, fullName: true, role: true },
    });

    if (!target) throw new Error("Recipient not found");

    if (!canShareWithUser(actor.role, target.role)) {
      throw new Error("You can only share a document with the PS or a HOD");
    }

    detail = `Shared with ${target.fullName}`;
  }

  if (payload.audience === "DEPARTMENT_STAFF") {
    const targetDepartmentId = Number(payload.targetDepartmentId);

    if (!Number.isFinite(targetDepartmentId)) {
      throw new Error("Department is required");
    }

    const department = await prisma.department.findUnique({
      where: { id: targetDepartmentId },
      select: { id: true, name: true },
    });

    if (!department) throw new Error("Department not found");
    detail = `Shared with all staff in ${department.name}`;
  }

  if (payload.audience === "ALL_HODS") detail = "Shared with all HODs";
  if (payload.audience === "ALL_STAFF") detail = "Shared with all staff";

  const share = await prisma.documentShare.create({
    data: {
      documentId,
      audience: payload.audience,
      ...(payload.audience === "USER" ? { targetUserId: payload.targetUserId } : {}),
      ...(payload.audience === "DEPARTMENT_STAFF"
        ? { targetDepartmentId: payload.targetDepartmentId }
        : {}),
      sharedById: actor.id,
      ...(payload.note ? { note: payload.note } : {}),
    },
  });

  await recordEvent(documentId, actor.id, "SHARED", detail);
  return share;
}

export async function addComment(documentId: number, actor: Actor, body: string) {
  const comment = await prisma.documentComment.create({
    data: { documentId, authorId: actor.id, body },
    include: { author: { select: { id: true, fullName: true, role: true } } },
  });

  await recordEvent(documentId, actor.id, "COMMENTED", body.slice(0, 120));
  return comment;
}

export async function decideDocument(
  documentId: number,
  actor: Actor,
  decision: "APPROVED" | "REJECTED",
  comment?: string,
) {
  const document = await prisma.document.update({
    where: { id: documentId },
    data: { status: decision, decidedById: actor.id, decidedAt: new Date() },
  });

  // A rejection reason must reach the initiator and their HOD, so it is stored
  // as a comment on the document, which both can already see.
  if (comment) {
    await prisma.documentComment.create({
      data: { documentId, authorId: actor.id, body: comment },
    });
  }

  await recordEvent(
    documentId,
    actor.id,
    decision === "APPROVED" ? "APPROVED" : "REJECTED",
    comment || undefined,
  );

  return document;
}
