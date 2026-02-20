import Image from "next/image";

import { DISH_ASSETS } from "@/lib/game/assets";
import type { DishName } from "@/lib/game/types";
import { cn } from "@/lib/utils/cn";

interface DishPanelProps {
  dishes: readonly DishName[];
  onPickDish: (dish: DishName) => void;
}

export function DishPanel({ dishes, onPickDish }: DishPanelProps) {
  return (
    <div className="panel border-[color:var(--maroon)] p-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--maroon)]">
        Dish Panel
      </p>
      <div className="grid grid-cols-3 gap-1.5 sm:grid-cols-6 sm:gap-2">
        {dishes.map((dish) => (
          <button
            key={dish}
            type="button"
            className={cn(
              "btn-secondary h-14 border-[color:var(--maroon)] bg-white px-1 text-xs sm:h-20 sm:px-2 sm:text-sm",
            )}
            onClick={() => onPickDish(dish)}
          >
            <span className="flex flex-col items-center gap-1 sm:flex-row sm:gap-2">
              <Image
                src={DISH_ASSETS[dish].image}
                alt={DISH_ASSETS[dish].label}
                width={48}
                height={48}
                className="h-[34px] w-[34px] rounded sm:h-[48px] sm:w-[48px]"
              />
              <span className="text-center font-semibold leading-tight sm:text-left">
                {DISH_ASSETS[dish].label}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
