import type { LevelConfig, SpeedTier } from "./types";

export const ROUND_DURATION_SECONDS = 70;
export const ORDER_DURATION_SECONDS = 20;
export const MAX_REPUTATION = 100;
export const MIN_REPUTATION = 0;

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    id: 1,
    label: "Beginner",
    seats: 4,
    plateCapacity: 1,
    spawnIntervalMs: 8_000,
    minScore: 1_300,
    bestScoreTarget: 3_220,
  },
  {
    id: 2,
    label: "Intermediate",
    seats: 4,
    plateCapacity: 2,
    spawnIntervalMs: 6_000,
    minScore: 2_720,
    bestScoreTarget: 6_120,
  },
  {
    id: 3,
    label: "Advanced",
    seats: 6,
    plateCapacity: 3,
    spawnIntervalMs: 4_000,
    minScore: 5_210,
    bestScoreTarget: 8_660,
  },
  {
    id: 4,
    label: "Expert",
    seats: 8,
    plateCapacity: 3,
    spawnIntervalMs: 2_500,
    minScore: 8_660,
    bestScoreTarget: 106_560,
  },
];

export const SCORE_RULES: Record<
  Exclude<SpeedTier, "miss">,
  { maxMs: number; coins: number; reputation: number }
> & {
  miss: { coins: number; reputation: number };
} = {
  green: {
    maxMs: 5_000,
    coins: 200,
    reputation: 10,
  },
  yellow: {
    maxMs: 10_000,
    coins: 100,
    reputation: 5,
  },
  red: {
    maxMs: Number.POSITIVE_INFINITY,
    coins: 20,
    reputation: 1,
  },
  miss: {
    coins: 0,
    reputation: -5,
  },
};

export function getLevelConfig(level: number): LevelConfig {
  return LEVEL_CONFIGS.find((cfg) => cfg.id === level) ?? LEVEL_CONFIGS[0];
}
