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
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 xl:grid-cols-5">
        {dishes.map((dish) => (
          <button
            key={dish}
            type="button"
            className={cn(
              "btn-secondary h-20 border-[color:var(--maroon)] bg-white px-2 text-sm",
            )}
            onClick={() => onPickDish(dish)}
          >
            <span className="flex items-center gap-2">
              <Image
                src={DISH_ASSETS[dish].image}
                alt={DISH_ASSETS[dish].label}
                width={48}
                height={48}
                className="rounded"
              />
              <span className="text-left font-semibold leading-tight">
                {DISH_ASSETS[dish].label}
              </span>
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
