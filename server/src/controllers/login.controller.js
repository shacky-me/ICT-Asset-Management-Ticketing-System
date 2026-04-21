import bcrypt from "bcrypt";
import jwt, {} from "jsonwebtoken";
import { prisma } from "../prisma.js";
import { sendPasswordResetEmail } from "../services/emailService.js";
export const login = async (req, res) => {
    try {
        const { identifier, email, password } = req.body;
        const normalizedIdentifier = String(identifier || email || "")
            .trim()
            .toLowerCase();
        if (!normalizedIdentifier || !password) {
            return res.status(400).json({
                message: "Identifier and password are required",
            });
        }
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { email: normalizedIdentifier },
                    { staffNo: normalizedIdentifier },
                ],
            },
            include: { department: true },
        });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        if (!user.isActive) {
            return res.status(403).json({
                message: "Account not yet authorized. Contact administrator.",
            });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({
                message: "Invalid email or password",
            });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }
        const tokenTtl = (process.env.JWT_EXPIRES_IN?.trim() ||
            "7d");
        const options = {
            expiresIn: tokenTtl,
        };
        const token = jwt.sign({
            id: user.id,
            role: user.role,
            departmentId: user.departmentId,
        }, secret, options);
        const mappedRole = user.role === "ICT_ADMIN" ? "ICT Administrator" : "ICT Officer";
        return res.status(200).json({
            message: "Login successful",
            token,
            user: {
                id: user.id,
                name: user.fullName,
                email: user.email,
                role: mappedRole,
                department: user.department.name,
                staffNumber: user.staffNo,
                mustChangePassword: user.mustChangePassword,
            },
        });
    }
    catch (error) {
        console.error("LOGIN ERROR:", error);
        return res.status(500).json({
            message: "Internal server error",
        });
    }
};
export const logout = async (_req, res) => {
    return res.status(200).json({ message: "Logout successful" });
};
export const me = async (req, res) => {
    try {
        const userId = req.user?.id;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { department: true },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const mappedRole = user.role === "ICT_ADMIN" ? "ICT Administrator" : "ICT Officer";
        return res.status(200).json({
            user: {
                id: user.id,
                name: user.fullName,
                email: user.email,
                role: mappedRole,
                department: user.department.name,
                staffNumber: user.staffNo,
                mustChangePassword: user.mustChangePassword,
            },
        });
    }
    catch (error) {
        console.error("ME ERROR:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const changeTemporaryPassword = async (req, res) => {
    try {
        const userId = req.user?.id;
        const { currentPassword, newPassword } = req.body;
        if (!userId) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        if (!currentPassword || !newPassword) {
            return res.status(400).json({
                message: "Current password and new password are required",
            });
        }
        if (String(newPassword).trim().length < 8) {
            return res.status(400).json({
                message: "New password must be at least 8 characters",
            });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { department: true },
        });
        if (!user || !user.isActive) {
            return res.status(401).json({ message: "Unauthorized" });
        }
        const passwordMatch = await bcrypt.compare(currentPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: "Current password is incorrect" });
        }
        const sameAsCurrent = await bcrypt.compare(newPassword, user.password);
        if (sameAsCurrent) {
            return res.status(400).json({
                message: "New password must be different from current password",
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                mustChangePassword: false,
            },
            include: { department: true },
        });
        const mappedRole = updatedUser.role === "ICT_ADMIN" ? "ICT Administrator" : "ICT Officer";
        return res.status(200).json({
            message: "Password updated successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.fullName,
                email: updatedUser.email,
                role: mappedRole,
                department: updatedUser.department.name,
                staffNumber: updatedUser.staffNo,
                mustChangePassword: updatedUser.mustChangePassword,
            },
        });
    }
    catch (error) {
        console.error("CHANGE TEMP PASSWORD ERROR:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const forgotPassword = async (req, res) => {
    try {
        const email = String(req.body?.email || "")
            .trim()
            .toLowerCase();
        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }
        const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, fullName: true, email: true, isActive: true },
        });
        if (user?.isActive) {
            const resetSecret = process.env.JWT_SECRET;
            if (!resetSecret) {
                throw new Error("JWT_SECRET is not defined");
            }
            const resetToken = jwt.sign({ id: user.id, email: user.email, purpose: "password-reset" }, resetSecret, { expiresIn: "30m" });
            const frontendUrl = process.env.FRONTEND_URL?.trim() || "http://localhost:3000";
            const resetUrl = `${frontendUrl}/reset-password?token=${encodeURIComponent(resetToken)}`;
            await sendPasswordResetEmail({
                to: user.email,
                name: user.fullName,
                resetUrl,
            });
        }
        return res.status(200).json({
            message: "If an account exists for this email, a reset link has been sent.",
        });
    }
    catch (error) {
        console.error("FORGOT PASSWORD ERROR:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const resetPasswordWithToken = async (req, res) => {
    try {
        const token = String(req.body?.token || "").trim();
        const newPassword = String(req.body?.newPassword || "").trim();
        if (!token || !newPassword) {
            return res
                .status(400)
                .json({ message: "Token and new password are required" });
        }
        if (newPassword.length < 8) {
            return res
                .status(400)
                .json({ message: "New password must be at least 8 characters" });
        }
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            throw new Error("JWT_SECRET is not defined");
        }
        const decoded = jwt.verify(token, secret);
        if (decoded.purpose !== "password-reset" || !decoded.id) {
            return res.status(400).json({ message: "Invalid reset token" });
        }
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
            select: { id: true, password: true, isActive: true },
        });
        if (!user || !user.isActive) {
            return res.status(400).json({ message: "Invalid reset token" });
        }
        const sameAsCurrent = await bcrypt.compare(newPassword, user.password);
        if (sameAsCurrent) {
            return res.status(400).json({
                message: "New password must be different from current password",
            });
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                mustChangePassword: false,
            },
        });
        return res.status(200).json({ message: "Password updated successfully" });
    }
    catch (error) {
        if (error instanceof jwt.TokenExpiredError) {
            return res.status(400).json({ message: "Reset link has expired" });
        }
        if (error instanceof jwt.JsonWebTokenError) {
            return res.status(400).json({ message: "Invalid reset token" });
        }
        console.error("RESET PASSWORD ERROR:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
//# sourceMappingURL=login.controller.js.map