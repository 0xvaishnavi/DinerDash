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
    difficulty: "⭐ Easy",
    storyText:
      "Welcome to your first day at Chai & Chaat Café! Start slow and learn the basics. Serve customers their favorite dishes and keep them happy. Remember - speed matters!",
    levelDescription:
      "Your training shift. Only 4 tables to manage, and you can carry one plate at a time. Customers arrive slowly, giving you plenty of time to get comfortable with the controls. Focus on matching the right dish to each order!",
    completionMessage: "Great job! You're getting the hang of it. Let's add more tables!",
  },
  2: {
    id: 2,
    title: "INTERMEDIATE",
    subtitle: '"Rush Hour Begins"',
    difficulty: "⭐⭐ Medium",
    storyText:
      "The lunch rush is here! You can now carry two plates at once - use this to serve faster. Customers are arriving more frequently, so stay sharp!",
    levelDescription:
      "Same number of tables, but now you're multitasking! Carry two dishes at once to speed up service. Customers arrive faster, so you'll need to plan your moves. Some customers might even order two dishes!",
    completionMessage: "Excellent! The manager is impressed. Ready for more tables?",
  },
  3: {
    id: 3,
    title: "ADVANCED",
    subtitle: '"Dinner Service"',
    difficulty: "⭐⭐⭐ Hard",
    storyText:
      "Dinner time at the busiest restaurant in town! You're managing 6 tables now with three plates. Keep your cool and watch those timers!",
    levelDescription:
      "More tables, more chaos! Six hungry customers can be waiting at once, and they're arriving quickly. You can juggle three plates now, but you'll need strategy. Prioritize customers who've been waiting longest!",
    completionMessage:
      "Incredible! Word is spreading about your skills. One final challenge awaits...",
  },
  4: {
    id: 4,
    title: "EXPERT",
    subtitle: '"Sumptuous Banquet"',
    difficulty: "⭐⭐⭐⭐ Expert",
    storyText:
      "The grand festival celebration! Eight VIP tables, constant new arrivals, and everyone wants to be served NOW. This is the ultimate test of your skills!",
    levelDescription:
      "Maximum chaos! Eight tables filled with demanding customers, and they're arriving every 2.5 seconds. You'll need perfect plate management, lightning-fast reflexes, and strategic thinking. Can you handle the pressure?",
    completionMessage:
      "LEGENDARY! You are now the best waiter in all of India! The restaurant is yours!",
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
