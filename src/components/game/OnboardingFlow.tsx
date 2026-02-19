"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

import { playSfx } from "@/lib/audio/sfx";
import {
  isValidUsername,
  normalizeUsername,
  writeOnboardingDone,
  writeSessionProfile,
} from "@/lib/profile/session-profile";

type OnboardingStep = "welcome" | "name" | "rules";

interface OnboardingFlowProps {
  sessionId: string;
  onComplete: () => void;
}

const RULES = [
  "Press Start Round.",
  "Move waiter with arrow keys on desktop, drag on phone.",
  "Go near a glowing dish at the counter and press Enter/Space to pick it.",
  "Press Enter/Space near the same selected dish again to unselect it.",
  "Move near a guest table, then press Enter/Space to serve.",
  "Match bubble orders before timers run out.",
];

export function OnboardingFlow({ sessionId, onComplete }: OnboardingFlowProps) {
  const [step, setStep] = useState<OnboardingStep>("welcome");
  const [showDeviceTip, setShowDeviceTip] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const username = useMemo(() => normalizeUsername(nameInput), [nameInput]);

  const handleSaveName = async () => {
    const finalUsername = normalizeUsername(nameInput);
    if (!isValidUsername(finalUsername)) {
      setError("Use only lowercase letters and numbers, without spaces.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/profile/register", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          username: finalUsername,
          session_id: sessionId,
        }),
      });

      if (response.status === 409) {
        setError("This name is already taken. Try another one.");
        return;
      }

      if (!response.ok) {
        setError("Could not create profile right now. Please retry.");
        return;
      }

      writeSessionProfile({ username: finalUsername });
      playSfx("clickButton", { volume: 0.75 });
      setStep("rules");
    } catch {
      setError("Could not create profile right now. Please retry.");
    } finally {
      setSubmitting(false);
    }
  };

  if (step === "welcome") {
    return (
      <section className="panel mx-auto flex w-full max-w-[980px] flex-col items-center border-[color:var(--maroon)] px-5 py-8 text-center sm:px-8 sm:py-10">
        <Image src="/logo.png" alt="Diner Dash logo" width={136} height={136} priority />
        <h1 className="mt-4 font-[var(--font-baloo)] text-4xl text-amber-950 sm:text-5xl">
          Welcome to Diner Dash
        </h1>
        <p className="mt-2 text-base font-semibold text-amber-950/85 sm:text-lg">
          Serve fast, match orders, and rise from rookie to cafe legend.
        </p>
        <button
          type="button"
          className="btn-primary mt-6 min-w-40 text-base"
          onClick={() => {
            playSfx("clickButton", { volume: 0.75 });
            setStep("name");
          }}
        >
          Get started
        </button>
      </section>
    );
  }

  if (step === "name") {
    return (
      <section className="panel mx-auto w-full max-w-[760px] border-[color:var(--maroon)] px-5 py-7 sm:px-7 sm:py-8">
        <h2 className="text-center font-[var(--font-baloo)] text-3xl text-amber-950 sm:text-4xl">
          What should we call you?
        </h2>
        <p className="mt-2 text-center text-sm font-semibold text-amber-950/80 sm:text-base">
          Username must be unique and use lowercase letters and numbers only.
        </p>

        <label className="sr-only" htmlFor="username">
          Username
        </label>
        <input
          id="username"
          type="text"
          autoCapitalize="none"
          autoComplete="off"
          autoCorrect="off"
          value={username}
          onChange={(event) => setNameInput(event.currentTarget.value)}
          className="mt-5 h-12 w-full rounded-xl border border-amber-900/30 bg-white px-4 text-lg font-semibold text-amber-950 outline-none transition focus:border-[color:var(--saffron)] focus:ring-2 focus:ring-[color:var(--saffron)]/20"
          placeholder="yourname123"
          maxLength={24}
        />

        {error && <p className="mt-2 text-sm font-semibold text-red-700">{error}</p>}

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            className="btn-primary min-w-36 text-base disabled:cursor-not-allowed disabled:opacity-65"
            disabled={!username || submitting}
            onClick={handleSaveName}
          >
            {submitting ? "Creating..." : "Continue"}
          </button>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="panel mx-auto w-full max-w-[980px] border-[color:var(--gold)] px-5 py-7 sm:px-7 sm:py-8"
    >
      <div className="text-center">
        <h2 className="font-[var(--font-baloo)] text-3xl text-amber-950 sm:text-4xl">How To Play</h2>
      </div>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2">
        {RULES.map((rule, index) => (
          <li
            key={rule}
            className="flex items-start gap-3 rounded-xl bg-[linear-gradient(145deg,rgba(255,255,255,0.92),rgba(255,244,228,0.94))] px-3 py-3 shadow-[0_8px_16px_rgba(117,74,24,0.14)]"
          >
            <span className="mt-0.5 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[color:var(--saffron)] text-xs font-bold text-amber-50">
              {index + 1}
            </span>
            <span className="text-sm font-semibold text-amber-950 sm:text-base">{rule}</span>
          </li>
        ))}
      </ol>
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          className="btn-primary min-w-52 text-base"
          onClick={() => {
            playSfx("clickButton", { volume: 0.75 });
            setShowDeviceTip(true);
          }}
        >
          Next
        </button>
      </div>

      {showDeviceTip && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-amber-950/35 px-4">
          <motion.section
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="panel w-full max-w-xl border-[color:var(--maroon)] px-5 py-6 text-center sm:px-7"
          >
            <h3 className="font-[var(--font-baloo)] text-3xl text-amber-950 sm:text-4xl">
              Pro Tip Before You Start
            </h3>
            <p className="mt-3 text-base font-semibold leading-relaxed text-amber-950/90 sm:text-lg">
              For the smoothest shift and fastest serves, play on PC with keyboard controls.
              Arrow keys + Enter/Space gives you the best timing precision.
            </p>
            <div className="mt-5 flex justify-center gap-3">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  playSfx("clickButton", { volume: 0.75 });
                  setShowDeviceTip(false);
                }}
              >
                Back
              </button>
              <button
                type="button"
                className="btn-primary min-w-44 text-base"
                onClick={() => {
                  playSfx("clickButton", { volume: 0.75 });
                  writeOnboardingDone(true);
                  onComplete();
                }}
              >
                Ready to Play
              </button>
            </div>
          </motion.section>
        </div>
      )}
    </motion.section>
  );
}
