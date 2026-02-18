"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Bar, Line } from "react-chartjs-2";

import {
  createFallbackDashboardMetrics,
  type DashboardMetrics,
} from "@/lib/dashboard/types";
import { registerChartJs } from "@/lib/charts/register";

registerChartJs();

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: "#3f2917",
      },
    },
  },
  scales: {
    x: {
      ticks: { color: "#5a3b28" },
      grid: { color: "rgba(63, 41, 23, 0.08)" },
    },
    y: {
      ticks: { color: "#5a3b28" },
      grid: { color: "rgba(63, 41, 23, 0.08)" },
      beginAtZero: true,
    },
  },
};

type MetricsResponse = {
  ok: boolean;
  metrics?: DashboardMetrics;
  warning?: string;
  error?: string;
};

export function DetailedDashboard() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session");

  const [metrics, setMetrics] = useState<DashboardMetrics>(() =>
    createFallbackDashboardMetrics(sessionId),
  );

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        const query = sessionId ? `?session_id=${encodeURIComponent(sessionId)}` : "";
        const response = await fetch(`/api/dashboard/metrics${query}`, {
          method: "GET",
          cache: "no-store",
        });

        if (!active) {
          return;
        }

        const data = (await response.json()) as MetricsResponse;
        if (response.ok && data.ok && data.metrics) {
          setMetrics(data.metrics);
        } else {
          setMetrics(createFallbackDashboardMetrics(sessionId));
        }
      } catch {
        if (!active) {
          return;
        }
        setMetrics(createFallbackDashboardMetrics(sessionId));
      }
    };

    void load();

    return () => {
      active = false;
    };
  }, [sessionId]);

  const funnelData = useMemo(
    () => ({
      labels: metrics.funnel.labels,
      datasets: [
        {
          label: "Orders",
          data: metrics.funnel.values,
          backgroundColor: ["#d4500a", "#00a693", "#c8960c", "#800020"],
          borderRadius: 8,
        },
      ],
    }),
    [metrics.funnel.labels, metrics.funnel.values],
  );

  const speedTierData = useMemo(
    () => ({
      labels: metrics.speedTiers.labels,
      datasets: [
        {
          label: "Fast (Green)",
          data: metrics.speedTiers.green,
          backgroundColor: "#3fb950",
          stack: "speed",
        },
        {
          label: "OK (Yellow)",
          data: metrics.speedTiers.yellow,
          backgroundColor: "#e3b341",
          stack: "speed",
        },
        {
          label: "Slow (Red)",
          data: metrics.speedTiers.red,
          backgroundColor: "#f85149",
          stack: "speed",
        },
      ],
    }),
    [
      metrics.speedTiers.green,
      metrics.speedTiers.labels,
      metrics.speedTiers.red,
      metrics.speedTiers.yellow,
    ],
  );

  const revenueDishData = useMemo(
    () => ({
      labels: metrics.revenuePerDish.labels,
      datasets: [
        {
          label: "Revenue (INR)",
          data: metrics.revenuePerDish.values,
          backgroundColor: ["#d4500a", "#800020", "#c8960c", "#00a693", "#6b3f1d"],
          borderRadius: 8,
        },
      ],
    }),
    [metrics.revenuePerDish.labels, metrics.revenuePerDish.values],
  );

  const utilizationData = useMemo(
    () => ({
      labels: metrics.utilization.labels,
      datasets: [
        {
          label: "Occupied Seats",
          data: metrics.utilization.occupied,
          borderColor: "#00a693",
          backgroundColor: "rgba(0, 166, 147, 0.20)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    }),
    [metrics.utilization.labels, metrics.utilization.occupied],
  );

  const satisfactionData = useMemo(
    () => ({
      labels: metrics.satisfaction.labels,
      datasets: [
        {
          label: "Reputation",
          data: metrics.satisfaction.reputation,
          borderColor: "#800020",
          backgroundColor: "rgba(128, 0, 32, 0.18)",
          fill: true,
          tension: 0.3,
          pointRadius: 3,
        },
      ],
    }),
    [metrics.satisfaction.labels, metrics.satisfaction.reputation],
  );

  const throughputData = useMemo(
    () => ({
      labels: metrics.throughput.labels,
      datasets: [
        {
          label: "Orders Completed",
          data: metrics.throughput.completed,
          borderColor: "#d4500a",
          backgroundColor: "rgba(212, 80, 10, 0.18)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: "Orders Expired",
          data: metrics.throughput.expired,
          borderColor: "#800020",
          backgroundColor: "rgba(128, 0, 32, 0.14)",
          fill: true,
          tension: 0.35,
          pointRadius: 3,
        },
      ],
    }),
    [metrics.throughput.completed, metrics.throughput.expired, metrics.throughput.labels],
  );

  const dishDemandVsServedData = useMemo(
    () => ({
      labels: metrics.demandVsServed.labels,
      datasets: [
        {
          label: "Requested",
          data: metrics.demandVsServed.requested,
          backgroundColor: "rgba(128, 0, 32, 0.62)",
          borderRadius: 8,
        },
        {
          label: "Served",
          data: metrics.demandVsServed.served,
          backgroundColor: "rgba(0, 166, 147, 0.72)",
          borderRadius: 8,
        },
      ],
    }),
    [
      metrics.demandVsServed.labels,
      metrics.demandVsServed.requested,
      metrics.demandVsServed.served,
    ],
  );

  const kpiCards = useMemo(
    () => [
      {
        label: "Orders Served",
        value: metrics.kpis.ordersServed.toString(),
        tone: "text-emerald-700",
        icon: "/sprite/female-customer-1.png",
      },
      {
        label: "Orders Expired",
        value: metrics.kpis.ordersExpired.toString(),
        tone: "text-red-700",
        icon: "/sprite/male-customer-2.png",
      },
      {
        label: "Revenue",
        value: `INR ${metrics.kpis.revenue.toLocaleString("en-IN")}`,
        tone: "text-amber-700",
        icon: "/elements/coin.png",
      },
      {
        label: "Avg Serve Time",
        value: `${metrics.kpis.avgServeTimeSeconds.toFixed(1)}s`,
        tone: "text-cyan-700",
        icon: "/elements/tray.png",
      },
      {
        label: "Peak Utilization",
        value: `${metrics.kpis.peakUtilization} seats`,
        tone: "text-rose-700",
        icon: "/ui/wooden-table.png",
      },
      {
        label: "Final Reputation",
        value: metrics.kpis.finalReputation.toString(),
        tone: "text-fuchsia-700",
        icon: "/sprite/female-customer-2.png",
      },
    ],
    [metrics.kpis],
  );
  return (
    <section className="space-y-4">
      <div className="grid gap-[15px] sm:grid-cols-2 xl:grid-cols-3">
        {kpiCards.map((card, idx) => (
          <motion.article
            key={card.label}
            className="panel border-[color:var(--gold)] bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,245,228,0.88))] p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/75 shadow-[0_6px_14px_rgba(60,37,18,0.18)]">
                <Image src={card.icon} alt="" fill className="object-contain p-1" sizes="56px" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-amber-950/70">{card.label}</p>
                <p className={`mt-0.5 text-2xl font-bold ${card.tone}`}>{card.value}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="grid gap-[15px] xl:grid-cols-2">
        <article className="panel border-[color:var(--turquoise)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--turquoise)]">
            Dashboard 1
          </p>
          <h2 className="font-[var(--font-baloo)] text-2xl">Real-Time Order Funnel</h2>
          <div className="mt-3 h-[220px] sm:h-[260px] lg:h-[300px]">
            <Bar data={funnelData} options={chartOptions} />
          </div>
        </article>

        <article className="panel border-[color:var(--gold)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--gold)]">
            Dashboard 2
          </p>
          <h2 className="font-[var(--font-baloo)] text-2xl">Speed Tier Distribution</h2>
          <div className="mt-3 h-[220px] sm:h-[260px] lg:h-[300px]">
            <Bar
              data={speedTierData}
              options={{
                ...chartOptions,
                scales: {
                  ...chartOptions.scales,
                  x: { ...chartOptions.scales.x, stacked: true },
                  y: { ...chartOptions.scales.y, stacked: true },
                },
              }}
            />
          </div>
        </article>
      </div>

      <div className="grid gap-[15px] xl:grid-cols-2">
        <article className="panel border-[color:var(--maroon)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--maroon)]">
            Dashboard 3
          </p>
          <h2 className="font-[var(--font-baloo)] text-2xl">Customer Satisfaction Trend</h2>
          <div className="mt-3 h-[220px] sm:h-[260px] lg:h-[300px]">
            <Line data={satisfactionData} options={chartOptions} />
          </div>
        </article>

        <article className="panel border-[color:var(--saffron)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--saffron)]">
            Dashboard 4
          </p>
          <h2 className="font-[var(--font-baloo)] text-2xl">Revenue Per Dish</h2>
          <div className="mt-3 h-[220px] sm:h-[260px] lg:h-[300px]">
            <Bar data={revenueDishData} options={chartOptions} />
          </div>
        </article>
      </div>

      <article className="panel border-[color:var(--turquoise)] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--turquoise)]">
          Dashboard 5
        </p>
        <h2 className="font-[var(--font-baloo)] text-2xl">Table Utilization Over Time</h2>
        <div className="mt-3 h-[220px] sm:h-[260px] lg:h-[300px]">
          <Line data={utilizationData} options={chartOptions} />
        </div>
      </article>

      <div className="grid gap-[15px] xl:grid-cols-2">
        <article className="panel border-[color:var(--saffron)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--saffron)]">
            Dashboard 6
          </p>
          <h2 className="font-[var(--font-baloo)] text-2xl">Service Throughput Pressure</h2>
          <p className="mt-1 text-sm text-amber-950/80">
            Completed vs expired orders across the round timeline.
          </p>
          <div className="mt-3 h-[220px] sm:h-[260px] lg:h-[300px]">
            <Line data={throughputData} options={chartOptions} />
          </div>
        </article>

        <article className="panel border-[color:var(--maroon)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--maroon)]">
            Dashboard 7
          </p>
          <h2 className="font-[var(--font-baloo)] text-2xl">Dish Demand vs Fulfillment</h2>
          <p className="mt-1 text-sm text-amber-950/80">
            Fast way to spot menu items with high drop-off risk.
          </p>
          <div className="mt-3 h-[220px] sm:h-[260px] lg:h-[300px]">
            <Bar data={dishDemandVsServedData} options={chartOptions} />
          </div>
        </article>
      </div>
    </section>
  );
}
