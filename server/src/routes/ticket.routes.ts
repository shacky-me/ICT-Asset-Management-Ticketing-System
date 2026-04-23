import { Router } from "express";
import { authenticateToken } from "../middlewares/auth.middleware.js";
import {
  createTicketHandler,
  listTicketsHandler,
  ticketStatsHandler,
} from "../controllers/ticket.controller.js";

const router: Router = Router();

router.use(authenticateToken);
router.get("/", listTicketsHandler);
router.get("/stats", ticketStatsHandler);
router.post("/", createTicketHandler);

export default router;
