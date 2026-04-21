import { Router } from "express";
import * as assignmentCtrl from "../controllers/assignment.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.use(authenticateToken);

router.post("/", assignmentCtrl.createAssignment);

router.get("/stats", assignmentCtrl.getStats);

router.get("/", assignmentCtrl.getAssignments);

export default router;
