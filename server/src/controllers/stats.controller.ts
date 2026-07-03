import { Response } from "express";
import prisma from "../lib/prisma";
import { AuthRequest } from "../middleware/auth.middleware";
import { getAchievementDefinitions, getStreakFromDates, toOptionalInt, toTestMode } from "../utils/typing";

const average = (values: number[]) => {
  if (!values.length) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
};

export const getSummary = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tests = await prisma.test.findMany({
      where: { userId: req.user!.id },
      orderBy: { completedAt: "desc" },
    });

    const summary = {
      testsCompleted: tests.length,
      bestWpm: tests.reduce((max, test) => Math.max(max, test.wpm), 0),
      averageWpm: average(tests.map((test) => test.wpm)),
      bestAccuracy: tests.reduce((max, test) => Math.max(max, test.accuracy), 0),
      averageAccuracy: average(tests.map((test) => test.accuracy)),
      averageConsistency: average(tests.map((test) => test.consistency)),
      streak: getStreakFromDates(tests.map((test) => test.completedAt)),
      latest: tests[0] || null,
    };

    res.status(200).json({ summary });
  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getPersonalBests = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const personalBests = await prisma.personalBest.findMany({
      where: { userId: req.user!.id },
      orderBy: [{ mode: "asc" }, { duration: "asc" }, { wordCount: "asc" }],
    });

    res.status(200).json({ personalBests });
  } catch (error) {
    console.error("Personal bests error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getTrends = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 20, 1), 100);
    const tests = await prisma.test.findMany({
      where: { userId: req.user!.id },
      orderBy: { completedAt: "desc" },
      take: limit,
      select: {
        id: true,
        mode: true,
        wpm: true,
        rawWpm: true,
        accuracy: true,
        consistency: true,
        completedAt: true,
      },
    });

    res.status(200).json({ trends: tests.reverse() });
  } catch (error) {
    console.error("Trends error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getAchievements = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const tests = await prisma.test.findMany({
      where: { userId: req.user!.id },
      select: {
        wpm: true,
        accuracy: true,
        consistency: true,
        completedAt: true,
      },
    });
    const unlocked = await prisma.achievement.findMany({ where: { userId: req.user!.id } });
    const unlockedMap = new Map(unlocked.map((achievement) => [achievement.key, achievement]));

    const stats = {
      testsCompleted: tests.length,
      bestWpm: tests.reduce((max, test) => Math.max(max, test.wpm), 0),
      bestAccuracy: tests.reduce((max, test) => Math.max(max, test.accuracy), 0),
      bestConsistency: tests.reduce((max, test) => Math.max(max, test.consistency), 0),
      streak: getStreakFromDates(tests.map((test) => test.completedAt)),
    };

    const achievements = getAchievementDefinitions(stats).map((definition) => ({
      ...definition,
      unlocked: unlockedMap.has(definition.key),
      unlockedAt: unlockedMap.get(definition.key)?.unlockedAt || null,
    }));

    res.status(200).json({ achievements });
  } catch (error) {
    console.error("Achievements error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};

export const getLeaderboard = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const mode = toTestMode(req.query.mode);
    const duration = toOptionalInt(req.query.duration);
    const wordCount = toOptionalInt(req.query.wordCount);
    const limit = Math.min(Math.max(Number(req.query.limit) || 25, 1), 100);

    const where = {
      ...(mode ? { mode } : {}),
      ...(duration !== null ? { duration } : {}),
      ...(wordCount !== null ? { wordCount } : {}),
    };

    const tests = await prisma.test.findMany({
      where,
      orderBy: [{ wpm: "desc" }, { accuracy: "desc" }, { completedAt: "asc" }],
      take: limit * 3,
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const seen = new Set<string>();
    const leaders = tests
      .filter((test) => {
        if (seen.has(test.userId)) return false;
        seen.add(test.userId);
        return true;
      })
      .slice(0, limit)
      .map((test, index) => ({
        rank: index + 1,
        user: test.user,
        mode: test.mode,
        duration: test.duration,
        wordCount: test.wordCount,
        wpm: test.wpm,
        accuracy: test.accuracy,
        completedAt: test.completedAt,
      }));

    res.status(200).json({ leaders });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({ message: "Internal server error." });
  }
};
