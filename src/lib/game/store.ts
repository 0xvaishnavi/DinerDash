"use client";

import { v4 as uuidv4 } from "uuid";
import { create } from "zustand";

import {
  MAX_REPUTATION,
  MIN_REPUTATION,
  getLevelConfig,
} from "@/lib/game/config";
import type { DishName, PlateSlot } from "@/lib/game/types";

interface GameStore {
  sessionId: string;
  level: number;
  roundSecondsLeft: number;
  revenue: number;
  reputation: number;
  plateSlots: PlateSlot[];
  selectedPlateSlot: number | null;
  setLevel: (level: number) => void;
  resetRound: () => void;
  addDishToFirstEmptySlot: (dish: DishName) => number | null;
  setSelectedPlateSlot: (slot: number | null) => void;
  clearSelectedPlate: () => { slot: number; dish: DishName } | null;
  clearPlateSlot: (slot: number) => { slot: number; dish: DishName } | null;
  applyServeOutcome: (coins: number, reputation: number) => void;
  tickRound: () => void;
  resetSession: () => void;
}

function makePlateSlots(capacity: number): PlateSlot[] {
  return Array.from({ length: capacity }, (_, index) => ({
    index,
    dish: null,
  }));
}

function clampReputation(value: number): number {
  return Math.max(MIN_REPUTATION, Math.min(MAX_REPUTATION, value));
}

export const useGameStore = create<GameStore>((set, get) => ({
  sessionId: uuidv4(),
  level: 1,
  roundSecondsLeft: getLevelConfig(1).roundDurationSeconds,
  revenue: 0,
  reputation: 50,
  plateSlots: makePlateSlots(getLevelConfig(1).plateCapacity),
  selectedPlateSlot: null,

  setLevel: (level) =>
    set(() => {
      const cfg = getLevelConfig(level);

      return {
        level,
        revenue: 0,
        reputation: 50,
        roundSecondsLeft: cfg.roundDurationSeconds,
        plateSlots: makePlateSlots(cfg.plateCapacity),
        selectedPlateSlot: null,
      };
    }),

  resetRound: () =>
    set((state) => {
      const cfg = getLevelConfig(state.level);

      return {
        roundSecondsLeft: cfg.roundDurationSeconds,
        revenue: 0,
        reputation: 50,
        plateSlots: makePlateSlots(cfg.plateCapacity),
        selectedPlateSlot: null,
      };
    }),

  addDishToFirstEmptySlot: (dish) => {
    const currentSlots = get().plateSlots;
    const slotIndex = currentSlots.findIndex((slot) => slot.dish === null);

    if (slotIndex === -1) {
      return null;
    }

    set((state) => ({
      plateSlots: state.plateSlots.map((slot, index) =>
        index === slotIndex ? { ...slot, dish } : slot,
      ),
      selectedPlateSlot: slotIndex,
    }));

    return slotIndex;
  },

  setSelectedPlateSlot: (slot) => set(() => ({ selectedPlateSlot: slot })),

  clearSelectedPlate: () => {
    const state = get();
    const selected = state.selectedPlateSlot;

    if (selected === null) {
      return null;
    }

    const dish = state.plateSlots[selected]?.dish;
    if (!dish) {
      return null;
    }

    set((prev) => ({
      plateSlots: prev.plateSlots.map((slot, index) =>
        index === selected ? { ...slot, dish: null } : slot,
      ),
      selectedPlateSlot: null,
    }));

    return { slot: selected, dish };
  },

  clearPlateSlot: (slotIndex) => {
    const state = get();
    const dish = state.plateSlots[slotIndex]?.dish;
    if (!dish) {
      return null;
    }

    set((prev) => ({
      plateSlots: prev.plateSlots.map((slot, index) =>
        index === slotIndex ? { ...slot, dish: null } : slot,
      ),
      selectedPlateSlot: prev.selectedPlateSlot === slotIndex ? null : prev.selectedPlateSlot,
    }));

    return { slot: slotIndex, dish };
  },

  applyServeOutcome: (coins, reputationDelta) =>
    set((state) => ({
      revenue: state.revenue + coins,
      reputation: clampReputation(state.reputation + reputationDelta),
    })),

  tickRound: () =>
    set((state) => ({
      roundSecondsLeft: Math.max(0, state.roundSecondsLeft - 1),
    })),

  resetSession: () =>
    set((state) => ({
      sessionId: uuidv4(),
      roundSecondsLeft: getLevelConfig(state.level).roundDurationSeconds,
      revenue: 0,
      reputation: 50,
      plateSlots: makePlateSlots(getLevelConfig(state.level).plateCapacity),
      selectedPlateSlot: null,
    })),
}));
