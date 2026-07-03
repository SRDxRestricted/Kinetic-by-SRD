import "dotenv/config";
import express from "express";
import cors from "cors";
import { config } from "./config";
import authRoutes from "./routes/auth.routes";
import testsRoutes from "./routes/tests.routes";
import statsRoutes from "./routes/stats.routes";
import leaderboardRoutes from "./routes/leaderboard.routes";
import achievementsRoutes from "./routes/achievements.routes";

const app = express();

// ── Middleware ──
app.use(cors({ origin: config.clientUrl, credentials: true }));
app.use(express.json());

// ── Health Check ──
app.get("/api/health", (_req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// ── Routes ──
app.use("/api/auth", authRoutes);
app.use("/api/tests", testsRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/achievements", achievementsRoutes);

// ── Start Server ──
app.listen(config.port, () => {
  console.log(`🚀 Server running on http://localhost:${config.port}`);
  console.log(`📦 Environment: ${config.nodeEnv}`);
});

export default app;
