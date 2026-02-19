"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { GameNavbar } from "@/components/game/GameNavbar";
import { playSfx } from "@/lib/audio/sfx";
import { readSessionProfile } from "@/lib/profile/session-profile";

type QuickPanel = "profile" | null;

export function GlobalNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [quickPanel, setQuickPanel] = useState<QuickPanel>(null);
  const [username, setUsername] = useState<string | null>(null);

  useEffect(() => {
    const profile = readSessionProfile();
    setUsername(profile?.username ?? null);
  }, [pathname]);

  const quickPanelContent = useMemo(() => {
    if (quickPanel === "profile") {
      return {
        title: "Profile",
        body: username
          ? `Logged in as @${username}`
          : "Start a new session from home to create your player profile.",
      };
    }
    return null;
  }, [quickPanel, username]);

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-[140] px-[5%] py-2 sm:py-3 md:py-4">
        <GameNavbar
          onGameClick={() => {
            if (pathname !== "/") {
              router.push("/");
            }
          }}
          onInfoClick={() => {
            if (pathname !== "/info") {
              router.push("/info");
            }
          }}
          onSettingsClick={() => {
            if (pathname !== "/settings") {
              router.push("/settings");
            }
          }}
          onProfileClick={() => setQuickPanel("profile")}
        />
      </div>

      {quickPanelContent && (
        <div className="fixed inset-0 z-[160] flex items-end justify-center overflow-y-auto bg-amber-950/35 px-4 py-4 sm:items-center sm:py-6">
          <section className="panel max-h-[88vh] w-full max-w-xl overflow-y-auto border-[color:var(--maroon)] p-4 sm:p-5">
            <h3 className="font-[var(--font-baloo)] text-2xl text-amber-950 sm:text-3xl">
              {quickPanelContent.title}
            </h3>
            <p className="mt-2 text-sm text-amber-950/80 sm:text-base">{quickPanelContent.body}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  playSfx("clickButton", { volume: 0.7 });
                  setQuickPanel(null);
                }}
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
