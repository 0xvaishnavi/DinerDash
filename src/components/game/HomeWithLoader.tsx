"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";

import { GameShell } from "@/components/game/GameShell";
import { LevelSelectScreen } from "@/components/game/LevelSelectScreen";
import { OnboardingFlow } from "@/components/game/OnboardingFlow";
import {
  DEFAULT_BEST_SCORES,
  type BestScores,
} from "@/lib/game/level-content";
import { useGameStore } from "@/lib/game/store";
import { readOnboardingDone, readSessionProfile } from "@/lib/profile/session-profile";

const LOADER_DURATION_MS = 2000;
const LOADER_TICK_MS = 60;
const BEST_SCORES_STORAGE_KEY = "diner_dash_best_scores_v1";

export function HomeWithLoader() {
  const setLevel = useGameStore((state) => state.setLevel);
  const resetSession = useGameStore((state) => state.resetSession);
  const sessionId = useGameStore((state) => state.sessionId);

  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [selectedLevel, setSelectedLevel] = useState<number | null>(null);
  const [onboardingResolved, setOnboardingResolved] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  const [bestScores, setBestScores] = useState<BestScores>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_BEST_SCORES;
    }

    try {
      const saved = window.localStorage.getItem(BEST_SCORES_STORAGE_KEY);
      if (!saved) {
        return DEFAULT_BEST_SCORES;
      }

      const parsed = JSON.parse(saved) as Partial<BestScores>;
      return {
        1: Math.max(0, Number(parsed[1] ?? 0)),
        2: Math.max(0, Number(parsed[2] ?? 0)),
        3: Math.max(0, Number(parsed[3] ?? 0)),
        4: Math.max(0, Number(parsed[4] ?? 0)),
      };
    } catch {
      return DEFAULT_BEST_SCORES;
    }
  });

  const handleSelectLevel = useCallback(
    (level: number) => {
      setLevel(level);
      resetSession();
      setSelectedLevel(level);
    },
    [resetSession, setLevel],
  );

  const handleRoundComplete = useCallback(
    (summary: {
      level: number;
      revenue: number;
    }) => {
      setBestScores((prev) => {
        const currentBest = prev[summary.level] ?? 0;
        if (summary.revenue <= currentBest) {
          return prev;
        }

        const nextScores: BestScores = {
          ...prev,
          [summary.level]: summary.revenue,
        };
        window.localStorage.setItem(BEST_SCORES_STORAGE_KEY, JSON.stringify(nextScores));
        return nextScores;
      });
    },
    [],
  );

  useEffect(() => {
    const hasProfile = !!readSessionProfile();
    const isDone = readOnboardingDone();
    setOnboardingComplete(Boolean(hasProfile && isDone));
    setOnboardingResolved(true);
  }, []);

  useEffect(() => {
    const start = performance.now();

    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const nextProgress = Math.min(100, Math.round((elapsed / LOADER_DURATION_MS) * 100));
      setProgress(nextProgress);

      if (elapsed >= LOADER_DURATION_MS) {
        window.clearInterval(timer);
        setLoading(false);
      }
    }, LOADER_TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[linear-gradient(145deg,#fff4de_0%,#ffe6c9_45%,#f7e6cf_100%)] px-6">
          <section className="panel w-full max-w-md border-[color:var(--maroon)] p-5 text-center sm:p-6">
            <Image
              src="/logo.png"
              alt="Diner Dash Logo"
              width={200}
              height={200}
              className="mx-auto h-32 w-32 rounded-xl object-cover"
              priority
            />
            <p className="mt-4 font-[var(--font-baloo)] text-2xl text-amber-950">
              Loading Game Resources
            </p>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-amber-100">
              <div
                className="h-full rounded-full bg-[color:var(--saffron)] transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-amber-950/70">{progress}%</p>
          </section>
        </div>
      )}

      <main className="mx-auto flex min-h-screen w-full flex-col gap-3 px-[5%] py-3 sm:gap-4 sm:py-4">
        {!onboardingResolved ? null : selectedLevel === null && !onboardingComplete ? (
          <OnboardingFlow
            sessionId={sessionId}
            onComplete={() => {
              setOnboardingComplete(true);
            }}
          />
        ) : selectedLevel === null ? (
          <LevelSelectScreen bestScores={bestScores} onSelectLevel={handleSelectLevel} />
        ) : (
          <>
            <GameShell onRoundComplete={handleRoundComplete} />
          </>
        )}
      </main>
    </>
  );
}
