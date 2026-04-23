import "dotenv/config";
import express, { type Express } from "express";
import cors from "cors";
import assignmentRoutes from "./routes/assignment.routes.js";
import authRoutes from "../src/routes/auth.route.js";
import assetRoutes from "../src/routes/asset.routes.js";
import accessRequestRoutes from "../src/routes/accessRequest.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
const app: Express = express();
const port = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

const vercelPreviewOriginPattern =
  /^https:\/\/ictams-sdjhrca-[a-z0-9-]+-meshacks-projects-1df4f9cd\.vercel\.app$/i;

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  return vercelPreviewOriginPattern.test(origin);
}

app.use(
  cors({
    origin: (origin, callback) => {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  }),
);
app.use((req, res, next) => {
  console.log(`>>> REQUEST: ${req.method} ${req.path}`);
  next();
});
app.use(express.json());
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use("/api", authRoutes);
app.use("/api/access-request", accessRequestRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/tickets", ticketRouter);
app.use("/api/assignments", assignmentRoutes);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
