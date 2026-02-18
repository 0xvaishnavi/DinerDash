"use client";

import { motion } from "framer-motion";
import { Bar, Line } from "react-chartjs-2";
import Image from "next/image";

import { registerChartJs } from "@/lib/charts/register";

registerChartJs();

const funnelData = {
  labels: ["Order Placed", "Dish Selected", "Order Served", "Order Completed"],
  datasets: [
    {
      label: "Orders",
      data: [124, 108, 92, 81],
      backgroundColor: ["#d4500a", "#00a693", "#c8960c", "#800020"],
      borderRadius: 8,
    },
  ],
};

const speedTierData = {
  labels: ["Minute 1", "Minute 2", "Minute 3", "Minute 4", "Minute 5"],
  datasets: [
    {
      label: "Fast (Green)",
      data: [5, 7, 8, 9, 10],
      backgroundColor: "#3fb950",
      stack: "speed",
    },
    {
      label: "OK (Yellow)",
      data: [8, 7, 6, 5, 4],
      backgroundColor: "#e3b341",
      stack: "speed",
    },
    {
      label: "Slow (Red)",
      data: [3, 3, 2, 2, 1],
      backgroundColor: "#f85149",
      stack: "speed",
    },
  ],
};

const revenueDishData = {
  labels: ["Dosa", "Chole Bhature", "Parathe", "Pani Puri", "Vada Pav"],
  datasets: [
    {
      label: "Revenue (INR)",
      data: [1220, 940, 860, 990, 740],
      backgroundColor: ["#d4500a", "#800020", "#c8960c", "#00a693", "#6b3f1d"],
      borderRadius: 8,
    },
  ],
};

const utilizationData = {
  labels: ["0s", "10s", "20s", "30s", "40s", "50s", "60s"],
  datasets: [
    {
      label: "Occupied Seats",
      data: [0, 2, 4, 4, 3, 4, 2],
      borderColor: "#00a693",
      backgroundColor: "rgba(0, 166, 147, 0.20)",
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
  ],
};

const satisfactionData = {
  labels: ["0s", "10s", "20s", "30s", "40s", "50s", "60s"],
  datasets: [
    {
      label: "Reputation",
      data: [50, 56, 61, 67, 72, 76, 81],
      borderColor: "#800020",
      backgroundColor: "rgba(128, 0, 32, 0.18)",
      fill: true,
      tension: 0.3,
      pointRadius: 3,
    },
  ],
};

const throughputData = {
  labels: ["0-10s", "10-20s", "20-30s", "30-40s", "40-50s", "50-60s"],
  datasets: [
    {
      label: "Orders Completed",
      data: [4, 9, 15, 18, 20, 15],
      borderColor: "#d4500a",
      backgroundColor: "rgba(212, 80, 10, 0.18)",
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
    {
      label: "Orders Expired",
      data: [0, 1, 2, 3, 3, 2],
      borderColor: "#800020",
      backgroundColor: "rgba(128, 0, 32, 0.14)",
      fill: true,
      tension: 0.35,
      pointRadius: 3,
    },
  ],
};

const dishDemandVsServedData = {
  labels: ["Dosa", "Chole Bhature", "Parathe", "Pani Puri", "Vada Pav"],
  datasets: [
    {
      label: "Requested",
      data: [29, 24, 20, 23, 18],
      backgroundColor: "rgba(128, 0, 32, 0.62)",
      borderRadius: 8,
    },
    {
      label: "Served",
      data: [26, 22, 18, 21, 16],
      backgroundColor: "rgba(0, 166, 147, 0.72)",
      borderRadius: 8,
    },
  ],
};

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

const KPI_CARDS = [
  {
    label: "Orders Served",
    value: "81",
    tone: "text-emerald-700",
    icon: "/sprite/female-customer-1.png",
  },
  {
    label: "Orders Expired",
    value: "11",
    tone: "text-red-700",
    icon: "/sprite/male-customer-2.png",
  },
  {
    label: "Revenue",
    value: "INR 4,750",
    tone: "text-amber-700",
    icon: "/elements/coin.png",
  },
  {
    label: "Avg Serve Time",
    value: "6.9s",
    tone: "text-cyan-700",
    icon: "/elements/tray.png",
  },
  {
    label: "Peak Utilization",
    value: "4 / 4 seats",
    tone: "text-rose-700",
    icon: "/ui/wooden-table.png",
  },
  {
    label: "Final Reputation",
    value: "81",
    tone: "text-fuchsia-700",
    icon: "/sprite/female-customer-2.png",
  },
];

export function DetailedDashboard() {
  return (
    <section className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {KPI_CARDS.map((card, idx) => (
          <motion.article
            key={card.label}
            className="panel border-[color:var(--gold)] bg-[linear-gradient(145deg,rgba(255,255,255,0.9),rgba(255,245,228,0.88))] p-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.04 }}
          >
            <div className="flex items-center gap-3">
              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white/75 shadow-[0_6px_14px_rgba(60,37,18,0.18)]">
                <Image
                  src={card.icon}
                  alt=""
                  fill
                  className="object-contain p-1"
                  sizes="56px"
                />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-amber-950/70">
                  {card.label}
                </p>
                <p className={`mt-0.5 text-2xl font-bold ${card.tone}`}>{card.value}</p>
              </div>
            </div>
          </motion.article>
        ))}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="panel border-[color:var(--turquoise)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--turquoise)]">
            Dashboard 1
          </p>
          <h2 className="font-[var(--font-baloo)] text-2xl">Real-Time Order Funnel</h2>
          <div className="mt-3 h-[300px]">
            <Bar data={funnelData} options={chartOptions} />
          </div>
        </article>

        <article className="panel border-[color:var(--gold)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--gold)]">
            Dashboard 2
          </p>
          <h2 className="font-[var(--font-baloo)] text-2xl">Speed Tier Distribution</h2>
          <div className="mt-3 h-[300px]">
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

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="panel border-[color:var(--maroon)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--maroon)]">
            Dashboard 3
          </p>
          <h2 className="font-[var(--font-baloo)] text-2xl">Customer Satisfaction Trend</h2>
          <div className="mt-3 h-[300px]">
            <Line data={satisfactionData} options={chartOptions} />
          </div>
        </article>

        <article className="panel border-[color:var(--saffron)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--saffron)]">
            Dashboard 4
          </p>
          <h2 className="font-[var(--font-baloo)] text-2xl">Revenue Per Dish</h2>
          <div className="mt-3 h-[300px]">
            <Bar data={revenueDishData} options={chartOptions} />
          </div>
        </article>
      </div>

      <article className="panel border-[color:var(--turquoise)] p-4">
        <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--turquoise)]">
          Dashboard 5
        </p>
        <h2 className="font-[var(--font-baloo)] text-2xl">Table Utilization Over Time</h2>
        <div className="mt-3 h-[300px]">
          <Line data={utilizationData} options={chartOptions} />
        </div>
      </article>

      <div className="grid gap-4 xl:grid-cols-2">
        <article className="panel border-[color:var(--saffron)] p-4">
          <p className="text-xs uppercase tracking-[0.16em] text-[color:var(--saffron)]">
            Dashboard 6
          </p>
          <h2 className="font-[var(--font-baloo)] text-2xl">Service Throughput Pressure</h2>
          <p className="mt-1 text-sm text-amber-950/80">
            Completed vs expired orders across the round timeline.
          </p>
          <div className="mt-3 h-[300px]">
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
          <div className="mt-3 h-[300px]">
            <Bar data={dishDemandVsServedData} options={chartOptions} />
          </div>
        </article>
      </div>
    </section>
  );
}
