import { Router } from "express";
import {
  createAsset,
  getAssets,
  getStats,
  getAssetById,
  removeAsset,
  updateAssetStatus,
} from "../controllers/asset.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router: Router = Router();

router.get("/status", authenticateToken, getStats);

router.get("/", authenticateToken, getAssets);

router.post("/", authenticateToken, createAsset);

router.get("/:id", authenticateToken, getAssetById);
router.patch("/:id/status", authenticateToken, updateAssetStatus);
router.delete("/:id", authenticateToken, removeAsset);

export default router;
