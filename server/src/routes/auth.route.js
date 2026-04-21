import { Router } from "express";
import { login, logout, me } from "../controllers/login.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/me", authenticateToken, me);
export default router;
//# sourceMappingURL=auth.route.js.map