import { LEVEL_CONFIGS } from "@/lib/game/config";

export interface LevelStoryContent {
  id: number;
  title: string;
  subtitle: string;
  difficulty: string;
  storyText: string;
  levelDescription: string;
  completionMessage: string;
}

export type BestScores = Record<number, number>;

export const DEFAULT_BEST_SCORES: BestScores = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
};

export const LEVEL_STORY_CONTENT: Record<number, LevelStoryContent> = {
  1: {
    id: 1,
    title: "BEGINNER",
    subtitle: '"First Day on the Job"',
    difficulty: "⭐",
    storyText:
      "Welcome to your first day at Chai & Chaat Café! Serve customers their favorite dishes and keep them happy.",
    levelDescription:
      "You only have 4 tables to manage, and you can carry one plate at a time. Focus on matching the right dish to each order!",
    completionMessage: "Great job! You're getting the hang of it. Let's add more tables!",
  },
  2: {
    id: 2,
    title: "INTERMEDIATE",
    subtitle: '"Rush Hour Begins"',
    difficulty: "⭐⭐",
    storyText:
      "The lunch rush is here! You can now carry two plates at once to serve faster!",
    levelDescription:
      "Same number of tables, but now you're multitasking! Customers arrive faster, and might even order two dishes!",
    completionMessage: "Excellent! The manager is impressed. Ready for more tables?",
  },
  3: {
    id: 3,
    title: "ADVANCED",
    subtitle: '"Dinner Service"',
    difficulty: "⭐⭐⭐",
    storyText:
      "Dinner time at the busiest restaurant in town! You're managing 6 tables now with three plates.",
    levelDescription:
      "More tables, more chaos! Prioritize customers who've been waiting longest!",
    completionMessage:
      "Incredible! Word is spreading about your skills. One final challenge awaits...",
  },
  4: {
    id: 4,
    title: "EXPERT",
    subtitle: '"Sumptuous Banquet"',
    difficulty: "⭐⭐⭐⭐",
    storyText:
      "The grand festival celebration! Eight VIP tables, constant new arrivals, and everyone wants to be served NOW. ",
    levelDescription:
      "Maximum chaos! You'll need perfect plate management, lightning-fast reflexes, and strategic thinking. Can you handle the pressure?",
    completionMessage:
      "LEGENDARY! You are now the best waiter!",
  },
};

export function isLevelUnlocked(level: number, bestScores: BestScores): boolean {
  if (level === 1) {
    return true;
  }

  if (level === 2) {
    return (bestScores[1] ?? 0) >= LEVEL_CONFIGS[0].minScore;
  }

  if (level === 3) {
    return (bestScores[2] ?? 0) >= LEVEL_CONFIGS[1].minScore;
  }

  if (level === 4) {
    return (bestScores[3] ?? 0) >= LEVEL_CONFIGS[2].minScore;
  }

  return false;
}

export function getLevelUnlockText(level: number): string | null {
  if (level === 2) {
    return "🔒 Unlock: 1,300 coins";
  }
  if (level === 3) {
    return "🔒 Unlock: 3,220 coins";
  }
  if (level === 4) {
    return "🔒 Unlock: Complete Advanced";
  }
  return null;
}
