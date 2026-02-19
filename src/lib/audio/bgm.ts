"use client";

import { useAudioSettings } from "@/lib/audio/settings-store";

let audio: HTMLAudioElement | null = null;

function getAudio(): HTMLAudioElement {
  if (!audio) {
    audio = new Audio("/sounds/cafe_lofi_bgm.mp3");
    audio.loop = true;
    audio.preload = "auto";
  }
  return audio;
}

export function startBgm() {
  if (typeof window === "undefined") return;
  const { bgmEnabled, bgmVolume } = useAudioSettings.getState();
  const el = getAudio();
  el.volume = bgmEnabled ? bgmVolume : 0;
  if (el.paused) {
    void el.play().catch(() => undefined);
  }
}

export function stopBgm() {
  if (!audio) return;
  audio.pause();
  audio.currentTime = 0;
}

export function syncBgmVolume() {
  if (!audio || audio.paused) return;
  const { bgmEnabled, bgmVolume } = useAudioSettings.getState();
  audio.volume = bgmEnabled ? bgmVolume : 0;
}
