import { DetailedDashboard } from "@/components/dashboard/DetailedDashboard";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full flex-col gap-3 px-[5vw] py-3 sm:gap-4 sm:py-4">
      <section className="panel border-[color:var(--turquoise)] px-4 py-4 sm:px-5">
        <div>
          <h1 className="font-[var(--font-baloo)] text-3xl leading-tight text-amber-950 sm:text-4xl md:text-5xl">
            Gameplay Analytics
          </h1>
          <p className="mt-1 text-sm text-amber-950/80 md:text-base">
            Live-style operational metrics from gameplay events.
          </p>
        </div>
      </section>

      <DetailedDashboard />
    </main>
  );
}
