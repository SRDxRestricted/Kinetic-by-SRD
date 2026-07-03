export const TestMode = {
  TIME: "TIME",
  WORDS: "WORDS",
  QUOTE: "QUOTE",
  ZEN: "ZEN",
} as const;

export type TestMode = (typeof TestMode)[keyof typeof TestMode];

export const Difficulty = {
  EASY: "EASY",
  MEDIUM: "MEDIUM",
  HARD: "HARD",
} as const;

export type Difficulty = (typeof Difficulty)[keyof typeof Difficulty];

export const testModes = Object.values(TestMode);
export const difficulties = Object.values(Difficulty);

export interface AchievementDefinition {
  key: string;
  title: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export const toTestMode = (value: unknown): TestMode | null => {
  if (typeof value !== "string") return null;
  const normalized = value.toUpperCase();
  return testModes.includes(normalized as TestMode) ? normalized as TestMode : null;
};

export const toDifficulty = (value: unknown): Difficulty => {
  if (typeof value !== "string") return Difficulty.MEDIUM;
  const normalized = value.toUpperCase();
  return difficulties.includes(normalized as Difficulty) ? normalized as Difficulty : Difficulty.MEDIUM;
};

export const toNumber = (value: unknown, fallback = 0): number => {
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? numberValue : fallback;
};

export const toOptionalInt = (value: unknown): number | null => {
  if (value === undefined || value === null || value === "") return null;
  const numberValue = Number(value);
  return Number.isFinite(numberValue) ? Math.trunc(numberValue) : null;
};

export const getAchievementDefinitions = (stats: {
  testsCompleted: number;
  bestWpm: number;
  bestAccuracy: number;
  bestConsistency: number;
  streak: number;
}): AchievementDefinition[] => [
  {
    key: "first_test",
    title: "First Flight",
    description: "Complete your first typing test.",
    icon: "play",
    unlocked: stats.testsCompleted >= 1,
  },
  {
    key: "clean_hands",
    title: "Clean Hands",
    description: "Reach 95% accuracy.",
    icon: "target",
    unlocked: stats.bestAccuracy >= 95,
  },
  {
    key: "fast_lane",
    title: "Fast Lane",
    description: "Reach 80 WPM.",
    icon: "zap",
    unlocked: stats.bestWpm >= 80,
  },
  {
    key: "century_mark",
    title: "Century Mark",
    description: "Reach 100 WPM.",
    icon: "trophy",
    unlocked: stats.bestWpm >= 100,
  },
  {
    key: "consistent",
    title: "Consistent",
    description: "Reach 90% consistency.",
    icon: "gauge",
    unlocked: stats.bestConsistency >= 90,
  },
  {
    key: "ten_pack",
    title: "Ten Pack",
    description: "Complete 10 tests.",
    icon: "calendar",
    unlocked: stats.testsCompleted >= 10,
  },
  {
    key: "week_streak",
    title: "Seven Day Signal",
    description: "Practice seven days in a row.",
    icon: "flame",
    unlocked: stats.streak >= 7,
  },
];

export const getStreakFromDates = (dates: Date[]): number => {
  const days = new Set(dates.map((date) => date.toISOString().slice(0, 10)));
  let streak = 0;
  const cursor = new Date();

  while (days.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
};
