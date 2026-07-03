import { Router } from "express";
import { getAchievements } from "../controllers/stats.controller";
import { authenticate } from "../middleware/auth.middleware";

const router = Router();

router.get("/", authenticate, getAchievements);

export default router;
