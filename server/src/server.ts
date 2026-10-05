import "dotenv/config";
import express, { type Express } from "express";
import cors from "cors";
import assignmentRoutes from "./routes/assignment.routes.js";
import authRoutes from "./routes/auth.route.js";
import assetRoutes from "./routes/asset.routes.js";
import accessRequestRoutes from "./routes/accessRequest.routes.js";
import ticketRouter from "./routes/ticket.routes.js";
import documentRoutes from "./routes/document.routes.js";
import fleetRoutes from "./routes/fleet.routes.js";
const app: Express = express();
app.disable("x-powered-by");
const port = process.env.PORT || 5000;

const allowedOrigins = (process.env.FRONTEND_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// The production site is always allowed. Other sites (local dev, previews,
// a custom domain) must be listed in FRONTEND_URL. A wildcard on the Vercel
// project name would also match anyone's project with a similar name.
const PRODUCTION_ORIGIN = "https://sdoj-ict-asset-management-system.vercel.app";

// The frontend running on the same machine as the API, for local work.
const LOCAL_ORIGINS = [
  "http://localhost:3000",
  "http://127.0.0.1:3000",
];

function isAllowedOrigin(origin?: string): boolean {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (LOCAL_ORIGINS.includes(origin)) return true;
  return origin === PRODUCTION_ORIGIN;
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
app.use((_req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("Referrer-Policy", "no-referrer");
  next();
});
app.use(express.json({ limit: "100kb" }));
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok" });
});
app.use("/api", authRoutes);
app.use("/api/access-request", accessRequestRoutes);
app.use("/api/assets", assetRoutes);
app.use("/api/tickets", ticketRouter);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/fleet", fleetRoutes);

// Last-resort error handler: log the details, send the client a generic
// message. Without it Express returns an HTML page with a stack trace
// whenever NODE_ENV is not "production".
app.use(
  (
    err: { type?: string; message?: string; code?: string },
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    if (err?.type === "entity.parse.failed") {
      return res.status(400).json({ message: "Invalid JSON body" });
    }
    if (err?.type === "entity.too.large") {
      return res.status(413).json({ message: "Request body too large" });
    }
    if (err?.code === "LIMIT_FILE_SIZE") {
      return res.status(413).json({ message: "File is larger than 10MB" });
    }
    if (err?.message?.startsWith("Only PDF, Word, Excel")) {
      return res.status(400).json({ message: err.message });
    }
    if (err?.message === "Not allowed by CORS") {
      return res.status(403).json({ message: "Origin not allowed" });
    }
    console.error("[API] Unhandled error:", err);
    return res.status(500).json({ message: "Internal server error" });
  },
);

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
