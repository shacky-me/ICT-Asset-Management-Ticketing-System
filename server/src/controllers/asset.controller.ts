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
    // Extract the ID as a number, DON'T pass req to the service
    const asset = await assetService.getAssetById(Number(id));

    if (!asset) {
      return res.status(404).json({ message: "Asset not found" });
    }

    return res.status(200).json(asset);
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};
