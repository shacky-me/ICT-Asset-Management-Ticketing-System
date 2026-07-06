import { Router } from "express";
import { changeTemporaryPassword, forgotPassword, login, logout, me, resetPasswordWithToken, } from "../controllers/login.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";
const router = Router();
router.post("/auth/login", login);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPasswordWithToken);
router.post("/auth/logout", logout);
router.get("/auth/me", authenticateToken, me);
router.post("/auth/change-temporary-password", authenticateToken, changeTemporaryPassword);
export default router;
//# sourceMappingURL=auth.route.js.map