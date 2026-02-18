import { describe, expect, it } from "vitest";

import {
  getScoreOutcomeByServeTime,
  getSpeedTier,
  getStarRating,
} from "@/lib/game/scoring";

describe("scoring", () => {
  it("classifies serve speed tiers correctly", () => {
    expect(getSpeedTier(4000)).toBe("green");
    expect(getSpeedTier(9000)).toBe("yellow");
    expect(getSpeedTier(11000)).toBe("red");
  });

  it("returns miss outcome for expired orders", () => {
    const result = getScoreOutcomeByServeTime(14000, true);

    expect(result.speedTier).toBe("miss");
    expect(result.coins).toBe(0);
    expect(result.reputation).toBe(-5);
  });

  it("computes star rating from level thresholds", () => {
    expect(getStarRating(1000, 1)).toBe(0);
    expect(getStarRating(1300, 1)).toBe(1);
    expect(getStarRating(2415, 1)).toBe(2);
    expect(getStarRating(3220, 1)).toBe(3);
  });
});
