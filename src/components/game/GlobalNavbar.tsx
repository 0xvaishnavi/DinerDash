"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";

import { GameNavbar } from "@/components/game/GameNavbar";
import { playSfx } from "@/lib/audio/sfx";

type QuickPanel = "settings" | "profile" | null;

export function GlobalNavbar() {
  const router = useRouter();
  const pathname = usePathname();
  const [quickPanel, setQuickPanel] = useState<QuickPanel>(null);

  const quickPanelContent = useMemo(() => {
    if (quickPanel === "settings") {
      return {
        title: "Settings",
        body: "Settings panel is ready for controls, audio, and accessibility options.",
      };
    }
    if (quickPanel === "profile") {
      return {
        title: "Profile",
        body: "Profile panel is ready for player stats, badges, and progress tracking.",
      };
    }
    return null;
  }, [quickPanel]);

  return (
    <>
      <div className="fixed left-0 right-0 top-0 z-[140] px-[5vw] py-4">
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
          onSettingsClick={() => setQuickPanel("settings")}
          onProfileClick={() => setQuickPanel("profile")}
        />
      </div>

      {quickPanelContent && (
        <div className="fixed inset-0 z-[160] flex items-center justify-center bg-amber-950/35 px-4">
          <section className="panel w-full max-w-xl border-[color:var(--maroon)] p-5">
            <h3 className="font-[var(--font-baloo)] text-3xl text-amber-950">
              {quickPanelContent.title}
            </h3>
            <p className="mt-2 text-sm text-amber-950/80">{quickPanelContent.body}</p>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  playSfx("menuTouch", { volume: 0.7 });
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
