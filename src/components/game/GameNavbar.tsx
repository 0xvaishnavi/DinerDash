"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { playSfx } from "@/lib/audio/sfx";

interface GameNavbarProps {
  onGameClick: () => void;
  onInfoClick: () => void;
  onSettingsClick: () => void;
  onProfileClick: () => void;
}

const NAV_ICON_CLASS =
  "inline-flex h-12 w-12 items-center justify-center rounded-2xl border-0 bg-transparent shadow-none transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 sm:h-14 sm:w-14";

const ICON_MOTION = {
  whileHover: { y: -4, scale: 1.2 },
  whileTap: { y: 0, scale: 0.95 },
  transition: { duration: 0.28, ease: "easeOut" },
} as const;

function IconButton({
  icon,
  label,
  onClick,
}: {
  icon: string;
  label: string;
  onClick: () => void;
}) {
  return (
    <motion.button
      type="button"
      title={label}
      aria-label={label}
      onClick={() => {
        playSfx("menuTouch", { volume: 0.7 });
        onClick();
      }}
      className={NAV_ICON_CLASS}
      {...ICON_MOTION}
    >
      <Image
        src={icon}
        alt=""
        aria-hidden
        width={56}
        height={56}
        className="drop-shadow-[0_6px_10px_rgba(63,41,23,0.32)]"
      />
      <span className="sr-only">{label}</span>
    </motion.button>
  );
}

export function GameNavbar({
  onGameClick,
  onInfoClick,
  onSettingsClick,
  onProfileClick,
}: GameNavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const closeMobileMenu = () => setMobileOpen(false);

  return (
    <motion.nav
      className="relative w-full overflow-visible rounded-[28px] border-0 bg-[color:var(--background)] px-3 py-2 shadow-none sm:px-4 sm:py-3"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="relative flex items-center justify-between gap-3">
        <motion.div
          className="flex items-center gap-2 sm:gap-3"
          whileHover={{ y: -2, scale: 1.04 }}
          transition={{ type: "spring", stiffness: 340, damping: 22 }}
        >
          <Image src="/logo.png" alt="Diner Dash" width={88} height={88} className="h-14 w-14 sm:h-16 sm:w-16" />
          <span className="font-[var(--font-baloo)] text-2xl font-bold text-amber-950 sm:text-3xl">
            Diner Dash
          </span>
        </motion.div>
        <div className="hidden items-center gap-1 md:flex">
          <motion.div {...ICON_MOTION}>
            <Link
              href="/dashboard"
              title="Dashboard"
              aria-label="Dashboard"
              className={NAV_ICON_CLASS}
              onClick={() => {
                playSfx("menuTouch", { volume: 0.7 });
                closeMobileMenu();
              }}
            >
              <Image
                src="/icons/dashboard.png"
                alt=""
                aria-hidden
                width={56}
                height={56}
                className="drop-shadow-[0_6px_10px_rgba(63,41,23,0.32)]"
              />
              <span className="sr-only">Dashboard</span>
            </Link>
          </motion.div>
          <IconButton
            icon="/icons/play.png"
            label="Game"
            onClick={() => {
              closeMobileMenu();
              onGameClick();
            }}
          />
          <IconButton
            icon="/icons/info.png"
            label="Info"
            onClick={() => {
              closeMobileMenu();
              onInfoClick();
            }}
          />
          <IconButton
            icon="/icons/settings.png"
            label="Settings"
            onClick={() => {
              closeMobileMenu();
              onSettingsClick();
            }}
          />
          <IconButton
            icon="/icons/profile.png"
            label="Profile"
            onClick={() => {
              closeMobileMenu();
              onProfileClick();
            }}
          />
        </div>
        <motion.button
          type="button"
          className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-transparent text-amber-950 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-900/35 md:hidden"
          onClick={() => {
            playSfx("menuTouch", { volume: 0.7 });
            setMobileOpen((prev) => !prev);
          }}
          whileTap={{ scale: 0.92 }}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
          title={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={28} strokeWidth={2.2} /> : <Menu size={28} strokeWidth={2.2} />}
        </motion.button>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="absolute right-3 top-[calc(100%+0.4rem)] z-30 flex w-[84px] flex-col items-center gap-2 rounded-2xl border border-amber-900/15 bg-[color:var(--surface)]/95 p-2 backdrop-blur-sm md:hidden"
            initial={{ opacity: 0, y: -8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -8, scale: 0.98 }}
            transition={{ duration: 0.16, ease: "easeOut" }}
          >
            <motion.div {...ICON_MOTION}>
              <Link
                href="/dashboard"
                title="Dashboard"
                aria-label="Dashboard"
                className={NAV_ICON_CLASS}
                onClick={() => {
                  playSfx("menuTouch", { volume: 0.7 });
                  closeMobileMenu();
                }}
              >
                <Image
                  src="/icons/dashboard.png"
                  alt=""
                  aria-hidden
                  width={54}
                  height={54}
                  className="drop-shadow-[0_6px_10px_rgba(63,41,23,0.32)]"
                />
                <span className="sr-only">Dashboard</span>
              </Link>
            </motion.div>
            <IconButton
              icon="/icons/play.png"
              label="Game"
              onClick={() => {
                closeMobileMenu();
                onGameClick();
              }}
            />
            <IconButton
              icon="/icons/info.png"
              label="Info"
              onClick={() => {
                closeMobileMenu();
                onInfoClick();
              }}
            />
            <IconButton
              icon="/icons/settings.png"
              label="Settings"
              onClick={() => {
                closeMobileMenu();
                onSettingsClick();
              }}
            />
            <IconButton
              icon="/icons/profile.png"
              label="Profile"
              onClick={() => {
                closeMobileMenu();
                onProfileClick();
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}
