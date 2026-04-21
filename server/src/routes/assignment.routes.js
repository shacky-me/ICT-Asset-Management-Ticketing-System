import { Router } from "express";
import * as assignmentCtrl from "../controllers/assignment.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = Router();
router.use(authenticateToken);
router.post("/", assignmentCtrl.createAssignment);
router.put("/:id", assignmentCtrl.updateAssignment);
router.delete("/:id", assignmentCtrl.deleteAssignment);
router.get("/stats", assignmentCtrl.getStats);
router.get("/", assignmentCtrl.getAssignments);
export default router;
//# sourceMappingURL=assignment.routes.js.map