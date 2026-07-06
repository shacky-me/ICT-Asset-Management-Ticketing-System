import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
let connectionString = process.env.DATABASE_URL;
if (!connectionString) {
    throw new Error("❌ DATABASE_URL is missing in .env");
}
console.log("[Prisma] Initializing with connection string (masked):", connectionString.substring(0, 50) + "...");
// Ensure connection pooling is enabled for Render
if (!connectionString.includes("?")) {
    connectionString += "?schema=public&sslmode=require";
}
else if (!connectionString.includes("schema=")) {
    connectionString += "&schema=public&sslmode=require";
}
else if (!connectionString.includes("sslmode")) {
    connectionString += "&sslmode=require";
}
console.log("[Prisma] ✓ Connection string prepared (schema + SSL enabled)");
// 1. Create a connection pool using the 'pg' library
const pool = new Pool({
    connectionString,
    max: 5, // Allow multiple connections
    min: 1, // Keep 1 idle connection ready
    idleTimeoutMillis: 60000, // 60s idle timeout (Render closes after ~900s)
    connectionTimeoutMillis: 20000, // 20s connection timeout
    application_name: "assettracking_server",
});
console.log("[Prisma] ✓ PostgreSQL connection pool created");
// Log pool events for debugging
pool.on("error", (err) => {
    console.error("❌ Pool error:", err.message);
});
pool.on("connect", () => {
    console.log("✓ New pool connection established");
});
// 2. Initialize the adapter
const adapter = new PrismaPg(pool);
console.log("[Prisma] ✓ PrismaPg adapter initialized");
console.log("[Prisma] ✓ Prisma Client will be created now...");
// 3. Pass the adapter to the constructor
export const prisma = global.prisma ??
    new PrismaClient({
        adapter,
    });
if (process.env.NODE_ENV !== "production") {
    global.prisma = prisma;
}
// Graceful shutdown
process.on("SIGINT", async () => {
    console.log("\nShutting down...");
    await prisma.$disconnect();
    await pool.end();
    process.exit(0);
});
//# sourceMappingURL=prisma.js.map