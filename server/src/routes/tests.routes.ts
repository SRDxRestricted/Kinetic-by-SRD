import { Router } from "express";
import { authenticate } from "../middleware/auth.middleware";
import { createTest, deleteTest, getTest, listTests } from "../controllers/tests.controller";

const router = Router();

router.use(authenticate);

router.get("/", listTests);
router.post("/", createTest);
router.get("/:id", getTest);
router.delete("/:id", deleteTest);

export default router;
