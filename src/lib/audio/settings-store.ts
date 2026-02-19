"use client";

import { create } from "zustand";

const STORAGE_KEY = "diner_dash_settings_v1";

interface PersistedState {
  sfxEnabled: boolean;
  sfxVolume: number;
  bgmEnabled: boolean;
  bgmVolume: number;
}

interface AudioSettings extends PersistedState {
  toggleSfx: () => void;
  setSfxVolume: (v: number) => void;
  toggleBgm: () => void;
  setBgmVolume: (v: number) => void;
}

const DEFAULTS: PersistedState = {
  sfxEnabled: true,
  sfxVolume: 1,
  bgmEnabled: true,
  bgmVolume: 0.25,
};

function loadFromStorage(): PersistedState {
  if (typeof window === "undefined") return DEFAULTS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const p = JSON.parse(raw);
      return {
        sfxEnabled: typeof p.sfxEnabled === "boolean" ? p.sfxEnabled : DEFAULTS.sfxEnabled,
        sfxVolume: typeof p.sfxVolume === "number" ? p.sfxVolume : DEFAULTS.sfxVolume,
        bgmEnabled: typeof p.bgmEnabled === "boolean" ? p.bgmEnabled : DEFAULTS.bgmEnabled,
        bgmVolume: typeof p.bgmVolume === "number" ? p.bgmVolume : DEFAULTS.bgmVolume,
      };
    }
  } catch {}
  return DEFAULTS;
}

function persist(state: PersistedState) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {}
}

function persisted(get: () => AudioSettings): PersistedState {
  const s = get();
  return { sfxEnabled: s.sfxEnabled, sfxVolume: s.sfxVolume, bgmEnabled: s.bgmEnabled, bgmVolume: s.bgmVolume };
}

export const useAudioSettings = create<AudioSettings>((set, get) => ({
  ...loadFromStorage(),
  toggleSfx: () => {
    const next = !get().sfxEnabled;
    set({ sfxEnabled: next });
    persist({ ...persisted(get), sfxEnabled: next });
  },
  setSfxVolume: (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    set({ sfxVolume: clamped });
    persist({ ...persisted(get), sfxVolume: clamped });
  },
  toggleBgm: () => {
    const next = !get().bgmEnabled;
    set({ bgmEnabled: next });
    persist({ ...persisted(get), bgmEnabled: next });
  },
  setBgmVolume: (v: number) => {
    const clamped = Math.max(0, Math.min(1, v));
    set({ bgmVolume: clamped });
    persist({ ...persisted(get), bgmVolume: clamped });
  },
}));
