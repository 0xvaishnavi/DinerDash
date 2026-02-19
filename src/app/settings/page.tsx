"use client";

import { useState } from "react";
import { Music, Volume2, VolumeX, Trash2 } from "lucide-react";
import Image from "next/image";

import { syncBgmVolume } from "@/lib/audio/bgm";
import { useAudioSettings } from "@/lib/audio/settings-store";
import { playSfx } from "@/lib/audio/sfx";

const BEST_SCORES_STORAGE_KEY = "diner_dash_best_scores_v1";

export default function SettingsPage() {
  const {
    sfxEnabled, sfxVolume, toggleSfx, setSfxVolume,
    bgmEnabled, bgmVolume, toggleBgm, setBgmVolume,
  } = useAudioSettings();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <main className="mx-auto flex min-h-screen w-full flex-col items-center px-[5%] py-3 sm:py-4">
      <section className="relative w-full max-w-[1200px] overflow-hidden rounded-[26px] bg-[linear-gradient(150deg,rgba(255,244,228,0.96)_0%,rgba(255,223,196,0.92)_48%,rgba(255,240,219,0.96)_100%)] p-4 shadow-[0_18px_34px_rgba(110,66,24,0.24)] sm:rounded-[30px] sm:p-5 md:p-8">
        <span className="pointer-events-none absolute -left-10 top-6 h-32 w-32 rounded-full bg-[color:var(--gold)]/20 blur-2xl" />
        <span className="pointer-events-none absolute -right-8 bottom-4 h-36 w-36 rounded-full bg-[color:var(--turquoise)]/18 blur-2xl" />

        <div className="relative text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-900/70">
            Preferences
          </p>
          <h1 className="mt-1 font-[var(--font-baloo)] text-3xl text-amber-950 sm:text-4xl md:text-5xl">
            Settings
          </h1>
        </div>

        <div className="relative mt-6 space-y-5 rounded-[26px] bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_10px_22px_rgba(119,77,30,0.16)] md:p-6">
          {/* Sound Effects */}
          <div className="rounded-2xl bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,244,229,0.9))] px-4 py-4 shadow-[0_8px_14px_rgba(115,73,28,0.14)]">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-950/60">
              Sound Effects
            </h2>
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  toggleSfx();
                  if (!sfxEnabled) playSfx("menuTouch", { volume: 0.5 });
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-950 transition hover:bg-amber-200"
                aria-label={sfxEnabled ? "Mute sound effects" : "Unmute sound effects"}
              >
                {sfxEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(sfxVolume * 100)}
                onChange={(e) => setSfxVolume(Number(e.target.value) / 100)}
                onMouseUp={() => playSfx("menuTouch", { volume: 0.5 })}
                onTouchEnd={() => playSfx("menuTouch", { volume: 0.5 })}
                disabled={!sfxEnabled}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-amber-200 accent-[var(--saffron)] disabled:cursor-not-allowed disabled:opacity-40"
              />
              <span className="w-10 text-right text-sm font-semibold text-amber-950/70">
                {sfxEnabled ? `${Math.round(sfxVolume * 100)}%` : "Off"}
              </span>
            </div>
          </div>

          {/* Background Music */}
          <div className="rounded-2xl bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,244,229,0.9))] px-4 py-4 shadow-[0_8px_14px_rgba(115,73,28,0.14)]">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-950/60">
              Background Music
            </h2>
            <div className="mt-3 flex items-center gap-4">
              <button
                type="button"
                onClick={() => {
                  toggleBgm();
                  syncBgmVolume();
                }}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-950 transition hover:bg-amber-200"
                aria-label={bgmEnabled ? "Mute background music" : "Unmute background music"}
              >
                {bgmEnabled ? <Music size={20} /> : <VolumeX size={20} />}
              </button>
              <input
                type="range"
                min={0}
                max={100}
                value={Math.round(bgmVolume * 100)}
                onChange={(e) => {
                  setBgmVolume(Number(e.target.value) / 100);
                  syncBgmVolume();
                }}
                disabled={!bgmEnabled}
                className="h-2 flex-1 cursor-pointer appearance-none rounded-full bg-amber-200 accent-[var(--saffron)] disabled:cursor-not-allowed disabled:opacity-40"
              />
              <span className="w-10 text-right text-sm font-semibold text-amber-950/70">
                {bgmEnabled ? `${Math.round(bgmVolume * 100)}%` : "Off"}
              </span>
            </div>
          </div>

          {/* Reset Progress */}
          <div className="rounded-2xl bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,244,229,0.9))] px-4 py-4 shadow-[0_8px_14px_rgba(115,73,28,0.14)]">
            <h2 className="text-sm font-semibold uppercase tracking-wide text-amber-950/60">
              Progress
            </h2>
            <div className="mt-3">
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="inline-flex items-center gap-2 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 transition hover:bg-red-100"
                >
                  <Trash2 size={16} />
                  Reset All Progress
                </button>
              ) : (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-red-700">Clear all best scores?</span>
                  <button
                    type="button"
                    onClick={() => {
                      try {
                        localStorage.removeItem(BEST_SCORES_STORAGE_KEY);
                      } catch {}
                      setConfirmReset(false);
                      playSfx("dustbinThrow", { volume: 0.6 });
                    }}
                    className="rounded-lg bg-red-600 px-3 py-1.5 text-sm font-semibold text-white transition hover:bg-red-700"
                  >
                    Confirm
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="rounded-lg border border-amber-300 px-3 py-1.5 text-sm font-medium text-amber-950 transition hover:bg-amber-50"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="relative mt-5 flex items-center justify-center gap-3 rounded-2xl bg-amber-50/75 px-4 py-3 text-center shadow-[0_8px_16px_rgba(119,77,30,0.14)]">
          <Image src="/icons/settings.png" alt="" aria-hidden width={26} height={26} />
          <p className="text-sm font-semibold text-amber-950 md:text-base">
            Settings are saved automatically and persist across sessions.
          </p>
        </div>
      </section>
    </main>
  );
}
