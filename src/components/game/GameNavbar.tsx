"use client";

import { motion } from "framer-motion";
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
  "inline-flex h-28 w-28 items-center justify-center rounded-2xl border-0 bg-transparent shadow-none transition duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80";

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
        width={68}
        height={68}
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
  return (
    <motion.nav
      className="relative w-full overflow-hidden rounded-[28px] border-0 bg-[color:var(--background)] px-4 py-3 shadow-none"
      initial={{ opacity: 0, y: -14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="relative flex items-center justify-between gap-3">
        <motion.div
          className="flex items-center gap-3"
          whileHover={{ y: -2, scale: 1.04 }}
          transition={{ type: "spring", stiffness: 340, damping: 22 }}
        >
          <Image src="/logo.png" alt="Diner Dash" width={88} height={88} className="h-16 w-16" />
          <span className="font-[var(--font-baloo)] text-3xl font-bold text-amber-950">
            Diner Dash
          </span>
        </motion.div>
        <div className="flex items-center gap-1">
          <motion.div {...ICON_MOTION}>
            <Link
              href="/dashboard"
              title="Dashboard"
              aria-label="Dashboard"
              className={NAV_ICON_CLASS}
              onClick={() => playSfx("menuTouch", { volume: 0.7 })}
            >
              <Image
                src="/icons/dashboard.png"
                alt=""
                aria-hidden
                width={68}
                height={68}
                className="drop-shadow-[0_6px_10px_rgba(63,41,23,0.32)]"
              />
              <span className="sr-only">Dashboard</span>
            </Link>
          </motion.div>
          <IconButton icon="/icons/play.png" label="Game" onClick={onGameClick} />
          <IconButton icon="/icons/info.png" label="Info" onClick={onInfoClick} />
          <IconButton icon="/icons/settings.png" label="Settings" onClick={onSettingsClick} />
          <IconButton icon="/icons/profile.png" label="Profile" onClick={onProfileClick} />
        </div>
      </div>
    </motion.nav>
  );
}
