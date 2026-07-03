import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  getAchievementDefinitions,
  getStreakFromDates,
  toDifficulty,
  toNumber,
  toOptionalInt,
  toTestMode,
} from "../utils/typing";

const calculateStats = async (userId: string) => {
  const tests = await prisma.test.findMany({
    where: { userId },
    orderBy: { completedAt: "desc" },
    select: {
      wpm: true,
      accuracy: true,
      consistency: true,
      completedAt: true,
    },
  });

  return {
    testsCompleted: tests.length,
    bestWpm: tests.reduce((max, test) => Math.max(max, test.wpm), 0),
    bestAccuracy: tests.reduce((max, test) => Math.max(max, test.accuracy), 0),
    bestConsistency: tests.reduce((max, test) => Math.max(max, test.consistency), 0),
    streak: getStreakFromDates(tests.map((test) => test.completedAt)),
  };
};

const unlockAchievements = async (userId: string) => {
  const stats = await calculateStats(userId);
  const unlocked = getAchievementDefinitions(stats).filter((achievement) => achievement.unlocked);

  await Promise.all(unlocked.map((achievement) => prisma.achievement.upsert({
    where: { userId_key: { userId, key: achievement.key } },
    update: {
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
    },
    create: {
      userId,
      key: achievement.key,
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
    },
  })));
};

const updatePersonalBest = async (userId: string, test: { id: string; mode: any; duration: number | null; wordCount: number | null; wpm: number; accuracy: number }) => {
  const existingBest = await prisma.personalBest.findFirst({
    where: {
      userId,
      mode: test.mode,
      duration: test.duration,
      wordCount: test.wordCount,
    },
  });

  const isBetter = !existingBest || test.wpm > existingBest.wpm || (test.wpm === existingBest.wpm && test.accuracy > existingBest.accuracy);

  if (!isBetter) return false;

  if (existingBest) {
    await prisma.personalBest.update({
      where: { id: existingBest.id },
      data: {
        wpm: test.wpm,
        accuracy: test.accuracy,
        testId: test.id,
      },
    });
  } else {
    await prisma.personalBest.create({
      data: {
        userId,
        mode: test.mode,
        duration: test.duration,
        wordCount: test.wordCount,
        wpm: test.wpm,
        accuracy: test.accuracy,
        testId: test.id,
      },
    });
  }

  await prisma.test.update({
    where: { id: test.id },
    data: { isPersonalBest: true },
  });

  return true;
};

export const createTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mode = toTestMode(req.body.mode);

    if (!mode) {
      res.status(400).json({ message: "A valid test mode is required." });
      return;
    }

    const wpm = toNumber(req.body.wpm, -1);
    const rawWpm = toNumber(req.body.rawWpm, wpm);
    const accuracy = toNumber(req.body.accuracy, -1);
    const consistency = toNumber(req.body.consistency, 0);

    if (wpm < 0 || rawWpm < 0 || accuracy < 0 || accuracy > 100 || consistency < 0 || consistency > 100) {
      res.status(400).json({ message: "Typing metrics are outside the accepted range." });
      return;
    }

    const startedAt = req.body.startedAt ? new Date(req.body.startedAt) : new Date(Date.now() - toNumber(req.body.timeTaken, 0) * 1000);
    const completedAt = req.body.completedAt ? new Date(req.body.completedAt) : new Date();

    const test = await prisma.test.create({
      data: {
        userId: req.user!.id,
        mode,
        duration: toOptionalInt(req.body.duration),
        wordCount: toOptionalInt(req.body.wordCount),
        difficulty: toDifficulty(req.body.difficulty),
        language: typeof req.body.language === "string" ? req.body.language : "english",
        wpm,
        rawWpm,
        accuracy,
        consistency,
        correctChars: Math.max(0, Math.trunc(toNumber(req.body.correctChars))),
        incorrectChars: Math.max(0, Math.trunc(toNumber(req.body.incorrectChars))),
        extraChars: Math.max(0, Math.trunc(toNumber(req.body.extraChars))),
        missedChars: Math.max(0, Math.trunc(toNumber(req.body.missedChars))),
        totalChars: Math.max(0, Math.trunc(toNumber(req.body.totalChars))),
        timeTaken: Math.max(0, toNumber(req.body.timeTaken)),
        startedAt,
        completedAt,
      },
    });

    const isPersonalBest = await updatePersonalBest(req.user!.id, test);
    await unlockAchievements(req.user!.id);

    const savedTest = isPersonalBest ? { ...test, isPersonalBest: true } : test;
    res.status(201).json({ test: savedTest });
  } catch (error) {
    console.error("Create test error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const listTests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);
    const tests = await prisma.test.findMany({
      where: { userId: req.user!.id },
      orderBy: { completedAt: "desc" },
      take: limit,
    });

    res.status(200).json({ tests });
  } catch (error) {
    console.error("List tests error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const test = await prisma.test.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!test) {
      res.status(404).json({ message: "Test not found." });
      return;
    }

    res.status(200).json({ test });
  } catch (error) {
    console.error("Get test error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const deleteTest = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = String(req.params.id);
    const test = await prisma.test.findFirst({
      where: {
        id,
        userId: req.user!.id,
      },
    });

    if (!test) {
      res.status(404).json({ message: "Test not found." });
      return;
    }

    await prisma.test.delete({ where: { id: test.id } });
    res.status(200).json({ message: "Test deleted." });
  } catch (error) {
    console.error("Delete test error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
