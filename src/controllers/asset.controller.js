import * as assetService from "../services/asset.service.js";
export const createAsset = async (req, res) => {
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
    }
    catch (error) {
        return res.status(400).json({
            message: error.message || "Error creating asset",
        });
    }
};
// asset.controller.ts
export const getAssets = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            search: req.query.search,
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10,
        };
        const data = await assetService.getAllAssets(filters);
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching assets" });
    }
};
export const getStats = async (req, res) => {
    try {
        const stats = await assetService.getAssetStats();
        return res.status(200).json(stats);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching asset statistics" });
    }
};
// controllers/asset.controller.ts
export const getAssetById = async (req, res) => {
    try {
        const { id } = req.params;
        const asset = await assetService.getAssetById(Number(id));
        if (!asset) {
            return res.status(404).json({ message: "Asset not found" });
        }
        return res.status(200).json(asset);
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const removeAsset = async (req, res) => {
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
    }
    catch (error) {
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
//# sourceMappingURL=asset.controller.js.map