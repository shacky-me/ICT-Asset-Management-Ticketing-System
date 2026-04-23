import type { Response } from "express";
import type { AuthRequest } from "../types/auth.types.js";
import * as assetService from "../services/asset.service.js";

export const createAsset = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const asset = await assetService.createAsset(req.body, req.user.id);

    return res.status(201).json({
      message: "Asset created successfully",
      asset,
    });
  } catch (error: any) {
    return res.status(400).json({
      message: error.message || "Error creating asset",
    });
  }
};

// asset.controller.ts

export const getAssets = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      status: req.query.status,
      search: req.query.search,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };

    const data = await assetService.getAllAssets(filters);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching assets" });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await assetService.getAssetStats();
    return res.status(200).json(stats);
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching asset statistics" });
  }
};

// controllers/asset.controller.ts
export const getAssetById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const asset = await assetService.getAssetById(Number(id));

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    return res.status(200).json(asset);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateAssetStatus = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "ICT_ADMIN" && req.user.role !== "ICT_OFFICER") {
      return res.status(403).json({
        message: "Only ICT Admin and ICT Officer can update asset status",
      });
    }

    const { id } = req.params;
    const { status } = req.body;

    const assetId = Number(id);
    if (!Number.isFinite(assetId) || assetId <= 0) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }

    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "Status is required" });
    }

    const result = await assetService.updateAssetStatus(
      assetId,
      status,
      req.user.id,
    );

    return res.status(200).json({
      message: "Asset status updated successfully",
      ...result,
    });
  } catch (error: any) {
    const message = error?.message || "Error updating asset status";

    if (message === "Asset not found") {
      return res.status(404).json({ message });
    }

    if (message.includes("Invalid status")) {
      return res.status(400).json({ message });
    }

    if (message.includes("already in")) {
      return res.status(400).json({ message });
    }

    return res.status(400).json({ message });
  }
};

export const removeAsset = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (req.user.role !== "ICT_ADMIN" && req.user.role !== "ICT_OFFICER") {
      return res
        .status(403)
        .json({ message: "Only ICT Admin and ICT Officer can remove assets" });
    }

    const id = Number(req.params.id);
    if (!Number.isFinite(id) || id <= 0) {
      return res.status(400).json({ message: "Invalid asset ID" });
    }

    await assetService.removeAsset(id, req.user.id);
    return res.status(200).json({ message: "Asset removed successfully" });
  } catch (error: any) {
    const message = error?.message || "Error removing asset";

    if (message === "Asset not found") {
      return res.status(404).json({ message });
    }

    if (message.includes("active assignment")) {
      return res.status(409).json({ message });
    }

    return res.status(400).json({ message });
  }
};
