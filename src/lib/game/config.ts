import type { LevelConfig, SpeedTier } from "./types";

export const BASE_ROUND_DURATION_SECONDS = 60;
export const ORDER_DURATION_SECONDS = 15;
export const MAX_REPUTATION = 100;
export const MIN_REPUTATION = 0;

export const LEVEL_CONFIGS: LevelConfig[] = [
  {
    id: 1,
    label: "Beginner",
    seats: 4,
    plateCapacity: 1,
    roundDurationSeconds: 60,
    spawnIntervalMs: 8_000,
    minScore: 800,
    bestScoreTarget: 3_220,
  },
  {
    id: 2,
    label: "Intermediate",
    seats: 4,
    plateCapacity: 2,
    roundDurationSeconds: 70,
    spawnIntervalMs: 6_000,
    minScore: 1_400,
    bestScoreTarget: 6_120,
  },
  {
    id: 3,
    label: "Advanced",
    seats: 6,
    plateCapacity: 3,
    roundDurationSeconds: 80,
    spawnIntervalMs: 4_000,
    minScore: 2_100,
    bestScoreTarget: 8_660,
  },
  {
    id: 4,
    label: "Expert",
    seats: 8,
    plateCapacity: 3,
    roundDurationSeconds: 90,
    spawnIntervalMs: 2_500,
    minScore: 3_200,
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
    coins: 150,
    reputation: 10,
  },
  yellow: {
    maxMs: 10_000,
    coins: 80,
    reputation: 5,
  },
  red: {
    maxMs: Number.POSITIVE_INFINITY,
    coins: 30,
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
