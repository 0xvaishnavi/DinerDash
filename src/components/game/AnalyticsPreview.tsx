"use client";

import { motion } from "framer-motion";
import { Bar } from "react-chartjs-2";

import { registerChartJs } from "@/lib/charts/register";

registerChartJs();

const previewData = {
  labels: ["Dosa", "Chole Bhature", "Parathe", "Pani Puri", "Vada Pav"],
  datasets: [
    {
      label: "Coins per Dish",
      data: [320, 260, 200, 240, 180],
      backgroundColor: ["#d4500a", "#800020", "#00a693", "#c8960c", "#3f2917"],
      borderRadius: 6,
    },
  ],
};

const previewOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
  },
};

export function AnalyticsPreview() {
  return (
    <motion.aside
      className="panel border-[color:var(--turquoise)] p-4"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.24 }}
    >
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[color:var(--turquoise)]">
        Dashboard Preview
      </p>
      <h2 className="font-[var(--font-baloo)] text-2xl font-semibold">
        Revenue Per Dish
      </h2>
      <p className="mt-1 text-sm text-amber-950/75">
        Starter Chart.js module wired for live Snowflake-backed metrics.
      </p>

      <div className="mt-4 h-[280px]">
        <Bar data={previewData} options={previewOptions} />
      </div>
    </motion.aside>
  );
}
