"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import { playSfx } from "@/lib/audio/sfx";
import { LEVEL_CONFIGS } from "@/lib/game/config";
import {
  type BestScores,
  LEVEL_STORY_CONTENT,
  getLevelUnlockText,
  isLevelUnlocked,
} from "@/lib/game/level-content";
import { cn } from "@/lib/utils/cn";

interface LevelSelectScreenProps {
  bestScores: BestScores;
  onSelectLevel: (level: number) => void;
}

const SHOW_LEVEL_INTRO_MODAL = true;
const getDifficultyStars = (difficulty: string) => difficulty.match(/⭐+/)?.[0] ?? "";

export function LevelSelectScreen({ bestScores, onSelectLevel }: LevelSelectScreenProps) {
  const [introLevelId, setIntroLevelId] = useState<number | null>(null);
  const introStory = introLevelId === null ? null : LEVEL_STORY_CONTENT[introLevelId];

  const handleChooseLevel = (level: number, unlocked: boolean) => {
    if (!unlocked) {
      return;
    }
    playSfx("menuTouch", { volume: 0.7 });
    if (SHOW_LEVEL_INTRO_MODAL) {
      setIntroLevelId(level);
      return;
    }
    onSelectLevel(level);
  };

  return (
    <section className="panel relative border-[color:var(--gold)] p-4 md:-mx-[2vw] md:w-[calc(100%+4vw)]">
      <div>
          <div className="px-2 py-1 text-center">
            <h2 className="font-[var(--font-baloo)] text-3xl leading-none tracking-tight text-amber-950 md:text-4xl">
              Level Select
            </h2>
            <p className="mt-3 text-lg font-semibold text-amber-950 md:text-2xl">
              Pick your shift. The game page opens as soon as you select a level.
            </p>
          </div>
          <div className="mt-4 lg:hidden">
            <div className="relative mx-auto max-w-[360px] px-2 pb-4 pt-3">
              <div className="absolute bottom-3 left-1/2 top-3 w-[2px] -translate-x-1/2 bg-gradient-to-b from-[color:var(--saffron)] via-[color:var(--gold)] to-[color:var(--turquoise)]" />
              <div className="space-y-6">
                {LEVEL_CONFIGS.map((cfg, index) => {
                  const story = LEVEL_STORY_CONTENT[cfg.id];
                  const unlocked = isLevelUnlocked(cfg.id, bestScores);
                  const unlockText = getLevelUnlockText(cfg.id);

                  return (
                    <div key={cfg.id} className="relative flex justify-center">
                      <motion.div
                        className={cn(
                          "absolute left-1/2 top-[144px] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2",
                          unlocked
                            ? "border-[color:var(--saffron)] bg-[color:var(--gold)]"
                            : "border-amber-900/30 bg-amber-100",
                        )}
                        animate={{
                          boxShadow: unlocked
                            ? [
                                "0 0 0 0 rgba(212,80,10,0.35)",
                                "0 0 0 8px rgba(212,80,10,0)",
                                "0 0 0 0 rgba(212,80,10,0.35)",
                              ]
                            : "none",
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeOut",
                          delay: index * 0.18,
                        }}
                      />
                      <motion.button
                        type="button"
                        disabled={!unlocked}
                        onClick={() => handleChooseLevel(cfg.id, unlocked)}
                        className={cn(
                          "relative h-[286px] w-[286px] bg-no-repeat",
                          unlocked ? "cursor-pointer" : "cursor-not-allowed opacity-80",
                        )}
                        style={{
                          backgroundImage: "url('/ui/level-card.png')",
                          backgroundSize: "100% 100%",
                          backgroundPosition: "center",
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: [0, -7, 0, 5, 0] }}
                        transition={{
                          opacity: { duration: 0.3, delay: index * 0.06 },
                          y: {
                            duration: 4 + index * 0.35,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          },
                        }}
                        whileHover={unlocked ? { scale: 1.015 } : undefined}
                      >
                        <div className="absolute inset-x-6 bottom-6 top-6 flex flex-col items-center justify-center px-2 py-3 text-center text-amber-950">
                          <p className="text-base tracking-[0.14em] text-amber-950">
                            {getDifficultyStars(story.difficulty)}
                          </p>
                          <p className="mt-0.5 text-lg font-extrabold tracking-wide text-amber-950">
                            {story.title}
                          </p>
                          <p className="mt-0.5 text-base font-semibold text-amber-950">{story.subtitle}</p>
                          <p className="mt-2 text-sm font-semibold text-amber-950">
                            Seats: {cfg.seats} | Plates: {cfg.plateCapacity}
                          </p>
                          <p className="mt-1 text-base font-medium text-amber-950">
                            ★★★ Best: {bestScores[cfg.id] ?? 0}
                          </p>
                          {!unlocked && unlockText && (
                            <p className="mt-0.5 text-sm font-bold text-amber-950">{unlockText}</p>
                          )}
                        </div>
                      </motion.button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
          <div className="mt-4 hidden pb-2 lg:block">
            <div className="relative mx-auto max-w-[1240px] px-4 py-3">
              <div className="absolute left-[12.5%] right-[12.5%] top-[346px] h-[2px] bg-gradient-to-r from-[color:var(--saffron)] via-[color:var(--gold)] to-[color:var(--turquoise)]" />
              <div className="grid grid-cols-4 justify-items-center gap-6 xl:gap-8">
                {LEVEL_CONFIGS.map((cfg, index) => {
                  const story = LEVEL_STORY_CONTENT[cfg.id];
                  const unlocked = isLevelUnlocked(cfg.id, bestScores);
                  const unlockText = getLevelUnlockText(cfg.id);
                  const cardTopClass = index % 2 === 0 ? "top-0" : "top-[62px]";

                  return (
                    <div key={cfg.id} className="relative h-[404px]">
                      <motion.button
                        type="button"
                        disabled={!unlocked}
                        onClick={() => handleChooseLevel(cfg.id, unlocked)}
                        className={cn(
                          "absolute left-1/2 h-[286px] w-[286px] -translate-x-1/2 bg-no-repeat",
                          cardTopClass,
                          unlocked ? "cursor-pointer" : "cursor-not-allowed opacity-80",
                        )}
                        style={{
                          backgroundImage: "url('/ui/level-card.png')",
                          backgroundSize: "100% 100%",
                          backgroundPosition: "center",
                        }}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{
                          opacity: 1,
                          y: index % 2 === 0 ? [0, -8, 0, 4, 0] : [0, -4, 0, 8, 0],
                        }}
                        transition={{
                          opacity: { duration: 0.3, delay: index * 0.06 },
                          y: {
                            duration: 4 + index * 0.35,
                            repeat: Number.POSITIVE_INFINITY,
                            ease: "easeInOut",
                          },
                        }}
                        whileHover={unlocked ? { scale: 1.015 } : undefined}
                      >
                        <div className="absolute inset-x-6 bottom-6 top-6 flex flex-col items-center justify-center px-2 py-3 text-center text-amber-950">
                          <p className="text-base tracking-[0.14em] text-amber-950">
                            {getDifficultyStars(story.difficulty)}
                          </p>
                          <p className="mt-0.5 text-lg font-extrabold tracking-wide text-amber-950">
                            {story.title}
                          </p>
                          <p className="mt-0.5 text-base font-semibold text-amber-950">{story.subtitle}</p>
                          <p className="mt-2 text-sm font-semibold text-amber-950">
                            Seats: {cfg.seats} | Plates: {cfg.plateCapacity}
                          </p>
                          <p className="mt-1 text-base font-medium text-amber-950">
                            ★★★ Best: {bestScores[cfg.id] ?? 0}
                          </p>
                          {!unlocked && unlockText && (
                            <p className="mt-0.5 text-sm font-bold text-amber-950">{unlockText}</p>
                          )}
                        </div>
                      </motion.button>

                      <motion.div
                        className={cn(
                          "absolute left-1/2 top-[346px] h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2",
                          unlocked
                            ? "border-[color:var(--saffron)] bg-[color:var(--gold)]"
                            : "border-amber-900/30 bg-amber-100",
                        )}
                        animate={{
                          boxShadow: unlocked
                            ? [
                                "0 0 0 0 rgba(212,80,10,0.35)",
                                "0 0 0 8px rgba(212,80,10,0)",
                                "0 0 0 0 rgba(212,80,10,0.35)",
                              ]
                            : "none",
                        }}
                        transition={{
                          duration: 2.2,
                          repeat: Number.POSITIVE_INFINITY,
                          ease: "easeOut",
                          delay: index * 0.18,
                        }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
      </div>

      {SHOW_LEVEL_INTRO_MODAL && introStory && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center overflow-x-hidden overflow-y-auto bg-amber-950/35 px-4 py-4 sm:items-center sm:py-6">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="panel relative max-h-[90vh] w-full max-w-3xl overflow-x-hidden overflow-y-auto border-[color:var(--maroon)] p-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden sm:p-5 md:max-h-none md:overflow-hidden md:p-6"
          >
            <motion.span
              className="pointer-events-none absolute -left-24 -top-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(212,80,10,0.24),rgba(212,80,10,0))]"
              animate={{ x: [0, 24, 0], y: [0, 18, 0], opacity: [0.65, 0.95, 0.65] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.span
              className="pointer-events-none absolute -bottom-28 -right-20 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(0,166,147,0.2),rgba(0,166,147,0))]"
              animate={{ x: [0, -20, 0], y: [0, -16, 0], opacity: [0.6, 0.9, 0.6] }}
              transition={{ duration: 6.4, repeat: Infinity, ease: "easeInOut" }}
            />

            <div className="relative grid gap-4 md:grid-cols-[minmax(0,1fr)_190px] md:items-center">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-amber-950/70">
                  Level {introStory.id}
                </p>
                <h3 className="mt-1 font-[var(--font-baloo)] text-2xl text-amber-950 sm:text-3xl">
                  {introStory.subtitle}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-amber-950/90">{introStory.storyText}</p>
                <p className="mt-3 text-sm leading-relaxed text-amber-950/80">
                  {introStory.levelDescription}
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-end gap-2">
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      playSfx("menuTouch", { volume: 0.7 });
                      setIntroLevelId(null);
                    }}
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => {
                      playSfx("menuTouch", { volume: 0.7 });
                      const level = introStory.id;
                      setIntroLevelId(null);
                      onSelectLevel(level);
                    }}
                  >
                    Start Level
                  </button>
                </div>
              </div>

              <motion.aside
                className="relative hidden md:flex md:items-end md:justify-center"
                animate={{
                  boxShadow: [
                    "0 0 0 rgba(255,176,76,0.14)",
                    "0 0 28px rgba(255,176,76,0.28)",
                    "0 0 0 rgba(255,176,76,0.14)",
                  ],
                }}
                transition={{ duration: 2.8, repeat: Infinity, ease: "easeInOut" }}
              >
                <Image
                  src="/sprite/waiter.png"
                  alt="Waiter"
                  width={180}
                  height={240}
                  className="h-[240px] w-auto object-contain object-bottom"
                  priority
                />
              </motion.aside>
            </div>
          </motion.div>
        </div>
      )}
    </section>
  );
}
