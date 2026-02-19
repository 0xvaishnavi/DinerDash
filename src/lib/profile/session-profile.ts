"use client";

export interface SessionProfile {
  username: string;
}

export const SESSION_PROFILE_STORAGE_KEY = "diner_dash_profile_v1";
export const SESSION_ONBOARDING_DONE_KEY = "diner_dash_onboarding_done_v1";

export function normalizeUsername(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function isValidUsername(value: string): boolean {
  return /^[a-z0-9]+$/.test(value);
}

export function readSessionProfile(): SessionProfile | null {
  if (typeof window === "undefined") {
    return null;
  }

  try {
    const raw = window.sessionStorage.getItem(SESSION_PROFILE_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw) as Partial<SessionProfile>;
    if (!parsed.username || !isValidUsername(parsed.username)) {
      return null;
    }

    return { username: parsed.username };
  } catch {
    return null;
  }
}

export function writeSessionProfile(profile: SessionProfile): void {
  if (typeof window === "undefined") {
    return;
  }

  window.sessionStorage.setItem(SESSION_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function readOnboardingDone(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.sessionStorage.getItem(SESSION_ONBOARDING_DONE_KEY) === "1";
}

export function writeOnboardingDone(done: boolean): void {
  if (typeof window === "undefined") {
    return;
  }

  if (done) {
    window.sessionStorage.setItem(SESSION_ONBOARDING_DONE_KEY, "1");
    return;
  }

  window.sessionStorage.removeItem(SESSION_ONBOARDING_DONE_KEY);
}
