import { Router } from "express";
import {
  changeTemporaryPassword,
  forgotPassword,
  login,
  logout,
  me,
  resetPasswordWithToken,
  getAllUsers,
  updateUserRole,
} from "../controllers/login.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.post("/auth/login", login);
router.post("/auth/forgot-password", forgotPassword);
router.post("/auth/reset-password", resetPasswordWithToken);
router.post("/auth/logout", logout);
router.get("/auth/me", authenticateToken, me);
router.post(
  "/auth/change-temporary-password",
  authenticateToken,
  changeTemporaryPassword,
);
router.get("/auth/users", authenticateToken, getAllUsers);
router.patch("/auth/users/:userId/role", authenticateToken, updateUserRole);

export default router;
