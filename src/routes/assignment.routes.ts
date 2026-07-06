import { Router } from "express";
import * as assignmentCtrl from "../controllers/assignment.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.use(authenticateToken);

router.post("/", assignmentCtrl.createAssignment);
router.patch("/:id/status", assignmentCtrl.updateAssignmentStatus);
router.put("/:id", assignmentCtrl.updateAssignment);
router.delete("/:id", assignmentCtrl.deleteAssignment);
router.get("/stats", assignmentCtrl.getStats);
router.get("/", assignmentCtrl.getAssignments);

export default router;
