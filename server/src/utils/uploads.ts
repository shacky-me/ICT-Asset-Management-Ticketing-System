import fs from "node:fs";
import path from "node:path";
import { randomBytes } from "node:crypto";
import multer from "multer";

// Document attachments live on the server's disk, outside the database.
// Set UPLOAD_DIR in .env to keep them somewhere that gets backed up.
export const UPLOAD_DIR = path.resolve(
  process.env.UPLOAD_DIR?.trim() || "uploads/documents",
);

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "image/jpeg",
  "image/png",
  "image/webp",
]);

export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: (_req, _file, done) => done(null, UPLOAD_DIR),
  // The stored name is generated here, so an uploaded name can never steer
  // where the file lands or what it is called on disk.
  filename: (_req, file, done) => {
    const extension = path.extname(file.originalname).toLowerCase().slice(0, 10);
    const safeExtension = /^\.[a-z0-9]+$/.test(extension) ? extension : "";
    done(null, `${Date.now()}-${randomBytes(8).toString("hex")}${safeExtension}`);
  },
});

export const documentUpload = multer({
  storage,
  limits: { fileSize: MAX_ATTACHMENT_BYTES, files: 1 },
  fileFilter: (_req, file, done) => {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      done(new Error("Only PDF, Word, Excel and image files are allowed"));
      return;
    }
    done(null, true);
  },
});
