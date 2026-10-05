import fs from "node:fs";
import path from "node:path";
import type { Response } from "express";
import type { AuthRequest } from "../types/auth.types.js";
import { prisma } from "../prisma.js";
import { isIntentionalError, publicErrorMessage } from "../utils/publicError.js";
import {
  addComment,
  allowedAudiences,
  canDecideDocument,
  canDownloadAttachment,
  createDocument,
  decideDocument,
  getDocumentForActor,
  listVisibleDocuments,
  recordEvent,
  shareDocument,
  type Actor,
} from "../services/document.service.js";
import { UPLOAD_DIR } from "../utils/uploads.js";

function actorFrom(req: AuthRequest): Actor | null {
  const id = Number(req.user?.id);
  const role = String(req.user?.role || "");
  const departmentId = Number(req.user?.departmentId);

  if (!Number.isFinite(id) || !role || !Number.isFinite(departmentId)) return null;
  return { id, role, departmentId };
}

export const listDocuments = async (req: AuthRequest, res: Response) => {
  const actor = actorFrom(req);
  if (!actor) return res.status(401).json({ message: "Unauthorized" });

  try {
    const documents = await listVisibleDocuments(
      actor,
      typeof req.query.search === "string" ? req.query.search : undefined,
    );

    return res.status(200).json({
      documents,
      canShareWith: allowedAudiences(actor.role),
      canDecide: canDecideDocument(actor),
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: publicErrorMessage(error, "Error loading documents") });
  }
};

export const getDocument = async (req: AuthRequest, res: Response) => {
  const actor = actorFrom(req);
  if (!actor) return res.status(401).json({ message: "Unauthorized" });

  const id = Number(req.params.id);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ message: "Valid document id is required" });
  }

  const result = await getDocumentForActor(id, actor);

  if (!result.ok) {
    return result.reason === "not_found"
      ? res.status(404).json({ message: "Document not found" })
      : res.status(403).json({ message: "You cannot view this document" });
  }

  return res.status(200).json({
    document: result.document,
    canDecide: canDecideDocument(actor),
    canDownload: canDownloadAttachment(actor, result.document),
    canShareWith: allowedAudiences(actor.role),
  });
};

export const postDocument = async (req: AuthRequest, res: Response) => {
  const actor = actorFrom(req);
  if (!actor) return res.status(401).json({ message: "Unauthorized" });

  const title = String(req.body?.title || "").trim();
  const summary = String(req.body?.summary || "").trim();
  const content = String(req.body?.content || "").trim();

  if (!title || title.length > 200) {
    return res.status(400).json({ message: "A title is required" });
  }

  if (summary.length > 2000) {
    return res.status(400).json({ message: "Summary is too long" });
  }

  if (content.length > 20000) {
    return res.status(400).json({ message: "Document text is too long" });
  }

  try {
    const document = await createDocument(actor, {
      title,
      ...(summary ? { summary } : {}),
      ...(content ? { content } : {}),
      isCritical: Boolean(req.body?.isCritical),
    });

    return res.status(201).json({ message: "Document raised", document });
  } catch (error) {
    return res
      .status(isIntentionalError(error) ? 400 : 500)
      .json({ message: publicErrorMessage(error, "Error raising document") });
  }
};

export const postShare = async (req: AuthRequest, res: Response) => {
  const actor = actorFrom(req);
  if (!actor) return res.status(401).json({ message: "Unauthorized" });

  const id = Number(req.params.id);
  const result = await getDocumentForActor(id, actor);

  if (!result.ok) {
    return result.reason === "not_found"
      ? res.status(404).json({ message: "Document not found" })
      : res.status(403).json({ message: "You cannot view this document" });
  }

  try {
    const share = await shareDocument(id, actor, {
      audience: req.body?.audience,
      ...(req.body?.targetUserId ? { targetUserId: Number(req.body.targetUserId) } : {}),
      ...(req.body?.targetDepartmentId
        ? { targetDepartmentId: Number(req.body.targetDepartmentId) }
        : {}),
      ...(req.body?.note ? { note: String(req.body.note).slice(0, 500) } : {}),
    });

    return res.status(201).json({ message: "Document shared", share });
  } catch (error) {
    return res
      .status(isIntentionalError(error) ? 400 : 500)
      .json({ message: publicErrorMessage(error, "Error sharing document") });
  }
};

export const postComment = async (req: AuthRequest, res: Response) => {
  const actor = actorFrom(req);
  if (!actor) return res.status(401).json({ message: "Unauthorized" });

  const id = Number(req.params.id);
  const body = String(req.body?.body || "").trim();

  if (!body || body.length > 2000) {
    return res.status(400).json({ message: "A comment is required" });
  }

  const result = await getDocumentForActor(id, actor);
  if (!result.ok) {
    return result.reason === "not_found"
      ? res.status(404).json({ message: "Document not found" })
      : res.status(403).json({ message: "You cannot comment on this document" });
  }

  const comment = await addComment(id, actor, body);
  return res.status(201).json({ message: "Comment added", comment });
};

export const postDecision = async (req: AuthRequest, res: Response) => {
  const actor = actorFrom(req);
  if (!actor) return res.status(401).json({ message: "Unauthorized" });

  if (!canDecideDocument(actor)) {
    return res
      .status(403)
      .json({ message: "Only the PS can approve or reject a document" });
  }

  const id = Number(req.params.id);
  const decision = String(req.body?.decision || "").toUpperCase();

  if (decision !== "APPROVED" && decision !== "REJECTED") {
    return res.status(400).json({ message: "Decision must be APPROVED or REJECTED" });
  }

  const comment = String(req.body?.comment || "").trim();

  if (decision === "REJECTED" && !comment) {
    return res
      .status(400)
      .json({ message: "A reason is required when rejecting a document" });
  }

  const result = await getDocumentForActor(id, actor);
  if (!result.ok) {
    return res.status(404).json({ message: "Document not found" });
  }

  const document = await decideDocument(id, actor, decision, comment || undefined);
  return res.status(200).json({ message: `Document ${decision.toLowerCase()}`, document });
};

export const postAttachment = async (req: AuthRequest, res: Response) => {
  const actor = actorFrom(req);
  const file = (req as AuthRequest & { file?: Express.Multer.File }).file;

  if (!actor) {
    if (file) fs.promises.unlink(file.path).catch(() => {});
    return res.status(401).json({ message: "Unauthorized" });
  }

  if (!file) {
    return res.status(400).json({ message: "A file is required" });
  }

  const id = Number(req.params.id);
  const result = await getDocumentForActor(id, actor);

  if (!result.ok) {
    await fs.promises.unlink(file.path).catch(() => {});
    return result.reason === "not_found"
      ? res.status(404).json({ message: "Document not found" })
      : res.status(403).json({ message: "You cannot attach files to this document" });
  }

  const attachment = await prisma.documentAttachment.create({
    data: {
      documentId: id,
      uploaderId: actor.id,
      fileName: file.originalname,
      storedName: file.filename,
      mimeType: file.mimetype,
      size: file.size,
    },
  });

  await recordEvent(id, actor.id, "ATTACHED", file.originalname);
  return res.status(201).json({ message: "File attached", attachment });
};

export const downloadAttachment = async (req: AuthRequest, res: Response) => {
  const actor = actorFrom(req);
  if (!actor) return res.status(401).json({ message: "Unauthorized" });

  const id = Number(req.params.id);
  const attachmentId = Number(req.params.attachmentId);

  const result = await getDocumentForActor(id, actor);
  if (!result.ok) {
    return result.reason === "not_found"
      ? res.status(404).json({ message: "Document not found" })
      : res.status(403).json({ message: "You cannot view this document" });
  }

  if (!canDownloadAttachment(actor, result.document)) {
    return res.status(403).json({
      message:
        "This document is marked critical: only the PS, Director, Assistant Director or the initiator may download it",
    });
  }

  const attachment = await prisma.documentAttachment.findFirst({
    where: { id: attachmentId, documentId: id },
  });

  if (!attachment) {
    return res.status(404).json({ message: "Attachment not found" });
  }

  // storedName is generated by the server, never taken from the upload.
  const filePath = path.join(UPLOAD_DIR, path.basename(attachment.storedName));

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ message: "File is missing from the server" });
  }

  // Streamed rather than res.download(): sendFile resolves paths differently
  // across platforms, and the file name comes from the database, not the URL.
  const safeName = attachment.fileName.replace(/["\\\r\n]/g, "_");
  // ?inline=1 is used by the on-screen preview; the download rules are the same.
  const disposition = req.query.inline === "1" ? "inline" : "attachment";
  res.setHeader("Content-Type", attachment.mimeType);
  res.setHeader("Content-Length", String(attachment.size));
  res.setHeader(
    "Content-Disposition",
    `${disposition}; filename="${safeName}"; filename*=UTF-8''${encodeURIComponent(attachment.fileName)}`,
  );

  const stream = fs.createReadStream(filePath);
  stream.on("error", () => {
    if (!res.headersSent) {
      res.status(500).json({ message: "Unable to read the file" });
    } else {
      res.end();
    }
  });

  return stream.pipe(res);
};
