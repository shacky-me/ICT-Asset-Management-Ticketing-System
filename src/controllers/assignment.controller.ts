import type { Response } from "express";
import type { AuthRequest } from "../types/auth.types.js";
import * as assignmentService from "../services/assignment.service.js";

export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const assignment = await assignmentService.createAssignment(
      req.body,
      req.user.id,
    );

    return res.status(201).json({
      message: "Asset assignment recorded successfully",
      assignment,
    });
  } catch (error: any) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      search: req.query.search as string,
      page: Number(req.query.page) || 1,
      limit: Number(req.query.limit) || 10,
    };
    const data = await assignmentService.getAllAssignments(filters);
    return res.status(200).json(data);
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching assignments" });
  }
};

export const getStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await assignmentService.getAssignmentStats();
    return res.status(200).json(stats);
  } catch (error: any) {
    return res.status(500).json({ message: "Error fetching statistics" });
  }
};

export const updateAssignment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const assignment = await assignmentService.updateAssignment(
      Number(id),
      req.body,
    );

    return res.status(200).json({
      message: "Assignment updated successfully",
      assignment,
    });
  } catch (error: any) {
    if (error.message === "Assignment not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(400).json({ message: error.message });
  }
};

export const updateAssignmentStatus = async (
  req: AuthRequest,
  res: Response,
) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    const { status } = req.body;

    if (!status || typeof status !== "string") {
      return res.status(400).json({ message: "Status is required" });
    }

    const assignmentId = Number(id);
    if (!Number.isFinite(assignmentId) || assignmentId <= 0) {
      return res.status(400).json({ message: "Invalid assignment ID" });
    }

    const result = await assignmentService.updateAssignmentStatus(
      assignmentId,
      status,
      req.user.id,
    );

    return res.status(200).json({
      message: "Assignment status updated successfully",
      ...result,
    });
  } catch (error: any) {
    const message = error?.message || "Error updating assignment status";

    if (message === "Assignment not found") {
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

export const deleteAssignment = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const { id } = req.params;
    await assignmentService.deleteAssignment(Number(id), req.user.id);

    return res.status(200).json({ message: "Assignment deleted successfully" });
  } catch (error: any) {
    if (error.message === "Assignment not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(400).json({ message: error.message });
  }
};
