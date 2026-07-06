import "dotenv/config";
import express, {} from "express";
import cors from "cors";
import assignmentRoutes from "./routes/assignment.routes.js";
import authRoutes from "../src/routes/auth.route.js";
import assetRoutes from "../src/routes/asset.routes.js";
import accessRequestRoutes from "../src/routes/accessRequest.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
const app = express();
const port = process.env.PORT || 5000;
app.use(cors({
    origin: process.env.FRONTEND_URL?.split(",") ?? true,
    credentials: true,
}));
app.use((req, res, next) => {
    console.log(`>>> REQUEST: ${req.method} ${req.path}`);
    next();
});
app.use(express.json());
app.use("/api", authRoutes);
app.use("/api/access-request", accessRequestRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/tickets", ticketRouter);
app.use("/api/assignments", assignmentRoutes);
app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
});
//# sourceMappingURL=server.js.map