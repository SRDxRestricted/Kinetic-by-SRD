import { Router } from "express";
import { getAchievements, getLeaderboard, getPersonalBests, getSummary, getTrends } from "../controllers/stats.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/leaderboard", getLeaderboard);

router.use(authenticate);

router.get("/summary", getSummary);
router.get("/personal-bests", getPersonalBests);
router.get("/trends", getTrends);
router.get("/achievements", getAchievements);

export default router;
