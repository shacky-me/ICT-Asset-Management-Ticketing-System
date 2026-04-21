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
