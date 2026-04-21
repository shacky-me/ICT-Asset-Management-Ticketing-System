import { Router } from "express";
import { changeTemporaryPassword, login, logout, me, } from "../controllers/login.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/auth/login", login);
router.post("/auth/logout", logout);
router.get("/auth/me", authenticateToken, me);
router.post("/auth/change-temporary-password", authenticateToken, changeTemporaryPassword);
export default router;
//# sourceMappingURL=auth.route.js.map