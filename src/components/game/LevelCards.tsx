"use client";

import { motion } from "framer-motion";

import { LEVEL_CONFIGS } from "@/lib/game/config";
import { cn } from "@/lib/utils/cn";

interface LevelCardsProps {
  currentLevel: number;
  onSelectLevel: (level: number) => void;
}

export function LevelCards({ currentLevel, onSelectLevel }: LevelCardsProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {LEVEL_CONFIGS.map((level, index) => {
        const selected = currentLevel === level.id;

        return (
          <motion.button
            key={level.id}
            type="button"
            className={cn(
              "panel cursor-pointer border p-3 text-left transition",
              selected ? "border-[color:var(--saffron)]" : "border-transparent",
            )}
            onClick={() => onSelectLevel(level.id)}
            whileHover={{ translateY: -2 }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04 }}
          >
            <p className="text-xs uppercase tracking-wide text-amber-950/65">
              Level {level.id}
            </p>
            <p className="font-[var(--font-space-grotesk)] text-lg font-semibold">
              {level.label}
            </p>
            <p className="mt-1 text-xs text-amber-950/70">
              Seats {level.seats} | Plates {level.plateCapacity}
            </p>
          </motion.button>
        );
      })}
    </div>
  );
}
