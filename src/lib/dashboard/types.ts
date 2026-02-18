export const DASHBOARD_DISHES = [
  "dosa",
  "chole_bhature",
  "parathe",
  "pani_puri",
  "vada_pav",
] as const;

export type DashboardDishKey = (typeof DASHBOARD_DISHES)[number];

export const DISH_LABELS: Record<DashboardDishKey, string> = {
  dosa: "Dosa",
  chole_bhature: "Chole Bhature",
  parathe: "Parathe",
  pani_puri: "Pani Puri",
  vada_pav: "Vada Pav",
};

export const EXPECTED_EVENT_TYPES = [
  "session_start",
  "customer_arrived",
  "customer_seated",
  "order_placed",
  "dish_selected",
  "dish_discarded",
  "order_served",
  "order_completed",
  "order_expired",
  "customer_left",
  "level_completed",
  "session_end",
] as const;

export interface DashboardMetrics {
  source: "snowflake" | "fallback";
  generatedAt: string;
  sessionId: string | null;
  kpis: {
    ordersServed: number;
    ordersExpired: number;
    revenue: number;
    avgServeTimeSeconds: number;
    peakUtilization: number;
    finalReputation: number;
  };
  funnel: {
    labels: string[];
    values: number[];
  };
  speedTiers: {
    labels: string[];
    green: number[];
    yellow: number[];
    red: number[];
  };
  revenuePerDish: {
    labels: string[];
    values: number[];
  };
  utilization: {
    labels: string[];
    occupied: number[];
  };
  satisfaction: {
    labels: string[];
    reputation: number[];
  };
  throughput: {
    labels: string[];
    completed: number[];
    expired: number[];
  };
  demandVsServed: {
    labels: string[];
    requested: number[];
    served: number[];
  };
  validation: {
    totalEvents: number;
    distinctEventTypes: number;
    lastEventAt: string | null;
    missingEventTypes: string[];
    eventCounts: Record<string, number>;
  };
}

export function createFallbackDashboardMetrics(sessionId: string | null): DashboardMetrics {
  return {
    source: "fallback",
    generatedAt: new Date().toISOString(),
    sessionId,
    kpis: {
      ordersServed: 81,
      ordersExpired: 11,
      revenue: 4750,
      avgServeTimeSeconds: 6.9,
      peakUtilization: 4,
      finalReputation: 81,
    },
    funnel: {
      labels: ["Order Placed", "Dish Selected", "Order Served", "Order Completed"],
      values: [124, 108, 92, 81],
    },
    speedTiers: {
      labels: ["Minute 1", "Minute 2", "Minute 3", "Minute 4", "Minute 5"],
      green: [5, 7, 8, 9, 10],
      yellow: [8, 7, 6, 5, 4],
      red: [3, 3, 2, 2, 1],
    },
    revenuePerDish: {
      labels: ["Dosa", "Chole Bhature", "Parathe", "Pani Puri", "Vada Pav"],
      values: [1220, 940, 860, 990, 740],
    },
    utilization: {
      labels: ["0s", "10s", "20s", "30s", "40s", "50s", "60s"],
      occupied: [0, 2, 4, 4, 3, 4, 2],
    },
    satisfaction: {
      labels: ["0s", "10s", "20s", "30s", "40s", "50s", "60s"],
      reputation: [50, 56, 61, 67, 72, 76, 81],
    },
    throughput: {
      labels: ["0-10s", "10-20s", "20-30s", "30-40s", "40-50s", "50-60s"],
      completed: [4, 9, 15, 18, 20, 15],
      expired: [0, 1, 2, 3, 3, 2],
    },
    demandVsServed: {
      labels: ["Dosa", "Chole Bhature", "Parathe", "Pani Puri", "Vada Pav"],
      requested: [29, 24, 20, 23, 18],
      served: [26, 22, 18, 21, 16],
    },
    validation: {
      totalEvents: 0,
      distinctEventTypes: 0,
      lastEventAt: null,
      missingEventTypes: [...EXPECTED_EVENT_TYPES],
      eventCounts: {},
    },
  };
}
