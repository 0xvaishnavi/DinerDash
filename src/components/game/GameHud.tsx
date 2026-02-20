import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";

import { COIN_ICON, DISH_ASSETS, EMPTY_PLATE_ICON } from "@/lib/game/assets";
import type { DishName } from "@/lib/game/types";

interface GameHudProps {
  level: number;
  roundSecondsLeft: number;
  revenue: number;
  reputation: number;
  targetRevenue: number;
  selectedDish: DishName | null;
}

function formatRoundTime(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function GameHud({
  level,
  roundSecondsLeft,
  revenue,
  reputation,
  targetRevenue,
  selectedDish,
}: GameHudProps) {
  const selectedDishLabel = selectedDish ? DISH_ASSETS[selectedDish].label : "None";

  return (
    <header className="panel border-[color:var(--gold)] p-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-950/65">Level</p>
          <p className="text-lg font-semibold">{level}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-950/65">Timer</p>
          <p className="text-lg font-semibold">{formatRoundTime(roundSecondsLeft)}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-950/65">Revenue</p>
          <p className="flex items-center gap-1 text-lg font-semibold">
            <Image src={COIN_ICON} alt="Coin" width={18} height={18} />
            <span>${revenue}</span>
          </p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-950/65">Reputation</p>
          <p className="text-lg font-semibold">{reputation}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-amber-950/65">Selected Dish</p>
          <div className="mt-1 text-sm font-semibold">
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={selectedDish ?? "none"}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="flex items-center gap-2"
              >
                <Image
                  src={selectedDish ? DISH_ASSETS[selectedDish].image : EMPTY_PLATE_ICON}
                  alt={selectedDishLabel}
                  width={24}
                  height={24}
                />
                <span>{selectedDishLabel}</span>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
      <p className="mt-3 rounded-lg bg-amber-50/80 px-3 py-2 text-sm font-semibold text-amber-950">
        To get promoted, your target revenue is <span className="text-[color:var(--saffron)]">${targetRevenue}</span>.
      </p>
    </header>
  );
}
