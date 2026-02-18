"use client";

export type SfxName =
  | "coin"
  | "countdown5432"
  | "countdownComplete"
  | "dishSelect"
  | "dishServed"
  | "dustbinThrow"
  | "levelComplete"
  | "menuTouch"
  | "npcEntry"
  | "success"
  | "angryCustomerLeave";

const SFX_PATHS: Record<SfxName, string> = {
  coin: "/sounds/coin.mp3",
  countdown5432: "/sounds/countdown_5432.wav",
  countdownComplete: "/sounds/countdown_complete.mp3",
  dishSelect: "/sounds/dish_select.mp3",
  dishServed: "/sounds/dish_served.mp3",
  dustbinThrow: "/sounds/dustbin_throw.mp3",
  levelComplete: "/sounds/success.mp3",
  menuTouch: "/sounds/menu_touch.mp3",
  npcEntry: "/sounds/npc_entry.mp3",
  success: "/sounds/success.mp3",
  angryCustomerLeave: "/sounds/angrycustomer leave.wav",
};

export function playSfx(
  name: SfxName,
  options?: { volume?: number; playbackRate?: number },
): void {
  if (typeof window === "undefined") {
    return;
  }

  const src = SFX_PATHS[name];
  const audio = new Audio(src);
  audio.preload = "auto";
  audio.volume = options?.volume ?? 1;
  audio.playbackRate = options?.playbackRate ?? 1;
  void audio.play().catch(() => undefined);
}
