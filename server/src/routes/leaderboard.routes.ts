import { Router } from "express";
import { getLeaderboard } from "../controllers/stats.controller";

const router = Router();

router.get("/", getLeaderboard);

export default router;
