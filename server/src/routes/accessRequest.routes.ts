import { Router } from "express";
import {
  createAccessRequest,
  approveAccessRequest,
  getPendingAccessRequests,
} from "../controllers/access.controller.js";
import {
  authenticateToken,
  requireAdmin,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.post("/", createAccessRequest);
router.get(
  "/pending",
  authenticateToken,
  requireAdmin,
  getPendingAccessRequests,
);
router.post(
  "/:requestId/approve",
  authenticateToken,
  requireAdmin,
  approveAccessRequest,
);

export default router;
