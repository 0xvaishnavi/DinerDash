import Image from "next/image";

const DESKTOP_CONTROLS = [
  "Press Start Round.",
  "Move waiter with Arrow Keys.",
  "Press Enter/Space near a glowing counter dish to pick it.",
  "Press Enter/Space near the same selected dish to unselect it.",
  "Press Enter/Space near a guest table to serve.",
];

const PHONE_CONTROLS = [
  "Press Start Round.",
  "Drag anywhere on the arena to move the waiter.",
  "Tap a dish on the counter to pick it.",
  "Tap the same selected dish again to unselect it.",
  "Tap a guest table to serve when waiter is nearby.",
];

const GAMEPLAY_NOTES = [
  "Picked dishes refill on the counter after a short delay.",
  "Serve correct dishes before customer timers run out.",
];

export default function InfoPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full flex-col items-center px-[5%] py-3 sm:py-4">
      <section className="relative w-full max-w-[1200px] overflow-hidden rounded-[26px] bg-[linear-gradient(150deg,rgba(255,244,228,0.96)_0%,rgba(255,223,196,0.92)_48%,rgba(255,240,219,0.96)_100%)] p-4 shadow-[0_18px_34px_rgba(110,66,24,0.24)] sm:rounded-[30px] sm:p-5 md:p-8">
        <span className="pointer-events-none absolute -left-10 top-6 h-32 w-32 rounded-full bg-[color:var(--gold)]/20 blur-2xl" />
        <span className="pointer-events-none absolute -right-8 bottom-4 h-36 w-36 rounded-full bg-[color:var(--turquoise)]/18 blur-2xl" />

        <div className="relative text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-900/70">
            Player Guide
          </p>
          <h1 className="mt-1 font-[var(--font-baloo)] text-3xl text-amber-950 sm:text-4xl md:text-5xl">
            How To Play
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-amber-950/80 md:text-base">
            Master the counter-to-table flow and serve every guest before their timer runs out.
          </p>
        </div>

        <div className="relative mt-6 rounded-[26px] bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_10px_22px_rgba(119,77,30,0.16)] md:p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <section className="rounded-2xl bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,244,229,0.9))] px-3 py-3 shadow-[0_8px_14px_rgba(115,73,28,0.14)] md:px-4">
              <h2 className="text-base font-bold text-amber-950 md:text-lg">Desktop / Keyboard</h2>
              <ol className="mt-2 space-y-2">
                {DESKTOP_CONTROLS.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[color:var(--saffron)] text-sm font-bold text-amber-50 shadow-[0_4px_10px_rgba(145,76,17,0.34)]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold leading-snug text-amber-950 md:text-base">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
            <section className="rounded-2xl bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,244,229,0.9))] px-3 py-3 shadow-[0_8px_14px_rgba(115,73,28,0.14)] md:px-4">
              <h2 className="text-base font-bold text-amber-950 md:text-lg">Phone / Touch</h2>
              <ol className="mt-2 space-y-2">
                {PHONE_CONTROLS.map((step, index) => (
                  <li key={step} className="flex items-start gap-3">
                    <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[color:var(--turquoise)] text-sm font-bold text-white shadow-[0_4px_10px_rgba(0,102,90,0.24)]">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold leading-snug text-amber-950 md:text-base">
                      {step}
                    </span>
                  </li>
                ))}
              </ol>
            </section>
          </div>
          <section className="mt-3 rounded-2xl bg-white/85 px-3 py-3 shadow-[0_8px_14px_rgba(115,73,28,0.1)] md:px-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-amber-950/70">Gameplay Notes</h2>
            <ul className="mt-2 space-y-1">
              {GAMEPLAY_NOTES.map((note) => (
                <li key={note} className="text-sm font-semibold text-amber-950 md:text-base">
                  • {note}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="relative mt-5 flex items-center justify-center gap-3 rounded-2xl bg-amber-50/75 px-4 py-3 text-center shadow-[0_8px_16px_rgba(119,77,30,0.14)]">
          <Image src="/icons/info.png" alt="" aria-hidden width={26} height={26} />
          <p className="text-sm font-semibold text-amber-950 md:text-base">
            Tip: Use the dashboard icon in navbar to review your round analytics after each run.
          </p>
        </div>
      </section>
    </main>
  );
}
