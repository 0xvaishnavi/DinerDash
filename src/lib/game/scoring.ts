import { getLevelConfig, SCORE_RULES } from "@/lib/game/config";
import type { SpeedTier } from "@/lib/game/types";

export interface ScoreOutcome {
  speedTier: SpeedTier;
  coins: number;
  reputation: number;
}

export function getSpeedTier(serveTimeMs: number): Exclude<SpeedTier, "miss"> {
  if (serveTimeMs < SCORE_RULES.green.maxMs) {
    return "green";
  }

  if (serveTimeMs <= SCORE_RULES.yellow.maxMs) {
    return "yellow";
  }

  return "red";
}

export function getScoreOutcomeByServeTime(
  serveTimeMs: number,
  expired = false,
): ScoreOutcome {
  if (expired) {
    return {
      speedTier: "miss",
      coins: SCORE_RULES.miss.coins,
      reputation: SCORE_RULES.miss.reputation,
    };
  }

  const tier = getSpeedTier(serveTimeMs);
  const rule = SCORE_RULES[tier];

  return {
    speedTier: tier,
    coins: rule.coins,
    reputation: rule.reputation,
  };
}

export function getStarRating(score: number, level: number): 0 | 1 | 2 | 3 {
  const cfg = getLevelConfig(level);
  const twoStarThreshold = Math.floor(cfg.bestScoreTarget * 0.75);

  if (score >= cfg.bestScoreTarget) {
    return 3;
  }

  if (score >= twoStarThreshold) {
    return 2;
  }

  if (score >= cfg.minScore) {
    return 1;
  }

  return 0;
}
