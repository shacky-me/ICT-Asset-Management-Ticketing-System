import { Router } from "express";
import { createAccessRequest, approveAccessRequest, getPendingAccessRequests, rejectAccessRequest, } from "../controllers/access.controller.js";
import { authenticateToken, requireAdmin, } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/", createAccessRequest);
router.get("/pending", authenticateToken, requireAdmin, getPendingAccessRequests);
router.post("/:requestId/approve", authenticateToken, requireAdmin, approveAccessRequest);
router.post("/:requestId/reject", authenticateToken, requireAdmin, rejectAccessRequest);
export default router;
//# sourceMappingURL=accessRequest.routes.js.map