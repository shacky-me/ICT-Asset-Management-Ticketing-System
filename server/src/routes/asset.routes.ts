import { Router } from "express";
import {
  createAsset,
  getAssets,
  getStats,
  getAssetById,
} from "../controllers/asset.controller.js";
import { authenticateToken } from "../middlewares/auth.middleware.js";

const router = Router();

router.get("/status", authenticateToken, getStats);

router.get("/", authenticateToken, getAssets);

router.post("/", authenticateToken, createAsset);

router.get("/:id", authenticateToken, getAssetById);

export default router;
