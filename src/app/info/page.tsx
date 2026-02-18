import Image from "next/image";

const STEPS = [
  "Press Start Round.",
  "Move waiter: arrow keys on desktop, drag on phone.",
  "Enter / Space: near glowing counter dish = pick, near guest table = serve.",
  "Enter / Space near same selected dish at counter = unselect (return to counter).",
  "Move near a glowing counter dish, then press Enter/Space to pick it.",
  "Press Enter/Space near the same selected dish again to unselect it.",
  "Picked dish disappears and refills in the same slot after 3s.",
  "Move near a guest table, then press Enter or Space to serve.",
  "Match speech-bubble orders before timers hit zero.",
];

export default function InfoPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full flex-col items-center px-[5vw] py-4">
      <section className="relative w-full max-w-[1200px] overflow-hidden rounded-[30px] bg-[linear-gradient(150deg,rgba(255,244,228,0.96)_0%,rgba(255,223,196,0.92)_48%,rgba(255,240,219,0.96)_100%)] p-5 shadow-[0_18px_34px_rgba(110,66,24,0.24)] md:p-8">
        <span className="pointer-events-none absolute -left-10 top-6 h-32 w-32 rounded-full bg-[color:var(--gold)]/20 blur-2xl" />
        <span className="pointer-events-none absolute -right-8 bottom-4 h-36 w-36 rounded-full bg-[color:var(--turquoise)]/18 blur-2xl" />

        <div className="relative text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-amber-900/70">
            Player Guide
          </p>
          <h1 className="mt-1 font-[var(--font-baloo)] text-4xl text-amber-950 md:text-5xl">
            How To Play
          </h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-amber-950/80 md:text-base">
            Master the counter-to-table flow and serve every guest before their timer runs out.
          </p>
        </div>

        <div className="relative mt-6 rounded-[26px] bg-white/70 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.92),0_10px_22px_rgba(119,77,30,0.16)] md:p-6">
          <ol className="grid gap-3 md:grid-cols-2">
            {STEPS.map((step, index) => (
              <li
                key={step}
                className="flex items-start gap-3 rounded-2xl bg-[linear-gradient(145deg,rgba(255,255,255,0.94),rgba(255,244,229,0.9))] px-3 py-3 shadow-[0_8px_14px_rgba(115,73,28,0.14)] md:px-4"
              >
                <span className="mt-0.5 inline-flex h-7 w-7 flex-none items-center justify-center rounded-full bg-[color:var(--saffron)] text-sm font-bold text-amber-50 shadow-[0_4px_10px_rgba(145,76,17,0.34)]">
                  {index + 1}
                </span>
                <span className="text-sm font-semibold leading-snug text-amber-950 md:text-base">
                  {step}
                </span>
              </li>
            ))}
          </ol>
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
