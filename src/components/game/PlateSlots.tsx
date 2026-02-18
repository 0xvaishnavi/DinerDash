import Image from "next/image";

import { DISH_ASSETS, EMPTY_PLATE_ICON } from "@/lib/game/assets";
import { cn } from "@/lib/utils/cn";

import type { PlateSlot } from "@/lib/game/types";

interface PlateSlotsProps {
  plateSlots: PlateSlot[];
  selectedPlateSlot: number | null;
  onSelectSlot: (slot: number) => void;
}

export function PlateSlots({
  plateSlots,
  selectedPlateSlot,
  onSelectSlot,
}: PlateSlotsProps) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {plateSlots.map((slot) => {
        const active = slot.index === selectedPlateSlot;

        return (
          <button
            key={slot.index}
            type="button"
            onClick={() => onSelectSlot(slot.index)}
            className={cn(
              "panel min-h-20 border px-2 py-2 text-center",
              "transition hover:border-[color:var(--turquoise)]",
              active && "border-[color:var(--turquoise)]",
            )}
          >
            <p className="text-[10px] uppercase tracking-wide text-amber-950/60">
              Slot {slot.index + 1}
            </p>
            <div className="mt-1 flex items-center justify-center gap-2">
              <Image
                src={slot.dish ? DISH_ASSETS[slot.dish].image : EMPTY_PLATE_ICON}
                alt={slot.dish ? DISH_ASSETS[slot.dish].label : "Empty plate"}
                width={42}
                height={42}
                className="rounded"
              />
              <p className="text-sm font-semibold">
                {slot.dish ? DISH_ASSETS[slot.dish].label : "Empty"}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
