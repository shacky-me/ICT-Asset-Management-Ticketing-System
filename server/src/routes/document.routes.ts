import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import { documentUpload } from "../utils/uploads.js";
import {
  downloadAttachment,
  getDocument,
  listDocuments,
  postAttachment,
  postComment,
  postDecision,
  postDocument,
  postShare,
} from "../controllers/document.controller.js";

const router: Router = Router();

router.use(authenticateToken);

router.get("/", listDocuments);
router.post("/", postDocument);
router.get("/:id", getDocument);
router.post("/:id/share", postShare);
router.post("/:id/comments", postComment);
router.patch("/:id/decision", postDecision);
router.post("/:id/attachments", documentUpload.single("file"), postAttachment);
router.get("/:id/attachments/:attachmentId", downloadAttachment);

export default router;
