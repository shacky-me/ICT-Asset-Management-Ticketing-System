import * as assignmentService from "../services/assignment.service.js";
export const createAssignment = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const assignment = await assignmentService.createAssignment(req.body, req.user.id);
        return res.status(201).json({
            message: "Asset assignment recorded successfully",
            assignment,
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
export const getAssignments = async (req, res) => {
    try {
        const filters = {
            status: req.query.status,
            search: req.query.search,
            page: Number(req.query.page) || 1,
            limit: Number(req.query.limit) || 10,
        };
        const data = await assignmentService.getAllAssignments(filters);
        return res.status(200).json(data);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching assignments" });
    }
};
export const getStats = async (req, res) => {
    try {
        const stats = await assignmentService.getAssignmentStats();
        return res.status(200).json(stats);
    }
    catch (error) {
        return res.status(500).json({ message: "Error fetching statistics" });
    }
};
export const updateAssignment = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;
        const assignment = await assignmentService.updateAssignment(Number(id), req.body);
        return res.status(200).json({
            message: "Assignment updated successfully",
            assignment,
        });
    }
    catch (error) {
        if (error.message === "Assignment not found") {
            return res.status(404).json({ message: error.message });
        }
        return res.status(400).json({ message: error.message });
    }
};
export const deleteAssignment = async (req, res) => {
    try {
        if (!req.user)
            return res.status(401).json({ message: "Unauthorized" });
        const { id } = req.params;
        await assignmentService.deleteAssignment(Number(id), req.user.id);
        return res.status(200).json({ message: "Assignment deleted successfully" });
    }
    catch (error) {
        if (error.message === "Assignment not found") {
            return res.status(404).json({ message: error.message });
        }
        return res.status(400).json({ message: error.message });
    }
};
//# sourceMappingURL=assignment.controller.js.map