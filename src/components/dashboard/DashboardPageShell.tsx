"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";

import { DetailedDashboard } from "@/components/dashboard/DetailedDashboard";

const LOADER_DURATION_MS = 2000;
const LOADER_TICK_MS = 60;

export function DashboardPageShell() {
  const searchParams = useSearchParams();
  const loaderKey = searchParams.toString();

  return <DashboardPageContent key={loaderKey} />;
}

function DashboardPageContent() {
  const [minLoaderDone, setMinLoaderDone] = useState(false);
  const [dashboardReady, setDashboardReady] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const timer = window.setInterval(() => {
      const elapsed = performance.now() - start;
      const nextProgress = Math.min(100, Math.round((elapsed / LOADER_DURATION_MS) * 100));
      setProgress(nextProgress);

      if (elapsed >= LOADER_DURATION_MS) {
        window.clearInterval(timer);
        setMinLoaderDone(true);
      }
    }, LOADER_TICK_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  const loading = !(minLoaderDone && dashboardReady);

  return (
    <>
      {loading && (
        <div className="fixed inset-0 z-[180] flex items-center justify-center bg-[linear-gradient(145deg,#fff4de_0%,#ffe6c9_45%,#f7e6cf_100%)] px-6">
          <section className="panel w-full max-w-md border-[color:var(--maroon)] p-5 text-center sm:p-6">
            <Image
              src="/logo.png"
              alt="Diner Dash Logo"
              width={200}
              height={200}
              className="mx-auto h-32 w-32 object-cover"
              priority
            />
            <p className="mt-4 font-[var(--font-baloo)] text-2xl text-amber-950">
              Loading Analytics Dashboard
            </p>
            <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-amber-100">
              <div
                className="h-full rounded-full bg-[color:var(--saffron)] transition-all duration-75"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="mt-2 text-sm text-amber-950/70">
              {Math.max(progress, minLoaderDone ? 100 : progress)}%
            </p>
          </section>
        </div>
      )}

      <main className="mx-auto flex min-h-screen w-full flex-col gap-3 px-[5%] py-3 sm:gap-4 sm:py-4">
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

      <DetailedDashboard onResolved={() => setDashboardReady(true)} />
      </main>
    </>
  );
}
