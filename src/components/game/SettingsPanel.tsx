"use client";

import { useState } from "react";
import { Music, Volume2, VolumeX, Trash2 } from "lucide-react";

import { syncBgmVolume } from "@/lib/audio/bgm";
import { useAudioSettings } from "@/lib/audio/settings-store";
import { playSfx } from "@/lib/audio/sfx";

const BEST_SCORES_STORAGE_KEY = "diner_dash_best_scores_v1";

export function SettingsPanel({ onClose }: { onClose: () => void }) {
  const {
    sfxEnabled, sfxVolume, toggleSfx, setSfxVolume,
    bgmEnabled, bgmVolume, toggleBgm, setBgmVolume,
  } = useAudioSettings();
  const [confirmReset, setConfirmReset] = useState(false);

  return (
    <div className="fixed inset-0 z-[160] flex items-end justify-center overflow-y-auto bg-amber-950/35 px-4 py-4 sm:items-center sm:py-6">
      <section className="panel max-h-[88vh] w-full max-w-xl overflow-y-auto border-[color:var(--maroon)] p-4 sm:p-5">
        <h3 className="font-[var(--font-baloo)] text-2xl text-amber-950 sm:text-3xl">
          Settings
        </h3>

        {/* Sound Effects */}
        <div className="mt-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-950/60">
            Sound Effects
          </h4>
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
        <div className="mt-5">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-950/60">
            Background Music
          </h4>
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
        <div className="mt-6">
          <h4 className="text-sm font-semibold uppercase tracking-wide text-amber-950/60">
            Progress
          </h4>
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

        {/* Close */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              playSfx("menuTouch", { volume: 0.7 });
              onClose();
            }}
          >
            Close
          </button>
        </div>
      </section>
    </div>
  );
}
