import { DetailedDashboard } from "@/components/dashboard/DetailedDashboard";

export default function DashboardPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full flex-col gap-4 px-[5vw] py-4">
      <section className="panel border-[color:var(--turquoise)] px-5 py-4">
        <div>
          <h1 className="font-[var(--font-baloo)] text-4xl leading-tight text-amber-950 md:text-5xl">
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
