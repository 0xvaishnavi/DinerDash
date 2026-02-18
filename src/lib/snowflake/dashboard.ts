import {
  DASHBOARD_DISHES,
  DISH_LABELS,
  EXPECTED_EVENT_TYPES,
  createFallbackDashboardMetrics,
  type DashboardMetrics,
} from "@/lib/dashboard/types";
import { executeQuery } from "@/lib/snowflake/connection";

type Row = Record<string, unknown>;

function readValue(row: Row, key: string): unknown {
  return row[key] ?? row[key.toUpperCase()] ?? row[key.toLowerCase()];
}

function asNumber(row: Row, key: string): number {
  const value = readValue(row, key);
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : 0;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function asString(row: Row, key: string): string {
  const value = readValue(row, key);
  if (typeof value === "string") {
    return value;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value === null || value === undefined) {
    return "";
  }
  return String(value);
}

function toMap(rows: Row[], keyField: string, valueField: string): Record<string, number> {
  return rows.reduce<Record<string, number>>((acc, row) => {
    const key = asString(row, keyField);
    if (!key) {
      return acc;
    }
    acc[key] = asNumber(row, valueField);
    return acc;
  }, {});
}

function isSnowflakeConfigured(): boolean {
  return Boolean(
    process.env.SNOWFLAKE_ACCOUNT &&
      process.env.SNOWFLAKE_USERNAME &&
      process.env.SNOWFLAKE_PASSWORD,
  );
}

function baseFilterSql(): string {
  return `
    WITH base AS (
      SELECT
        EVENT_NAME,
        SESSION_ID,
        TRY_TO_TIMESTAMP_NTZ("TIMESTAMP") AS EVENT_TS,
        PAYLOAD
      FROM GAME_EVENTS.RAW_EVENTS
      WHERE (? IS NULL OR SESSION_ID = ?)
    )
  `;
}

function sessionBinds(sessionId: string | null): [string | null, string | null] {
  return [sessionId, sessionId];
}

export async function getDashboardMetrics(
  sessionId: string | null,
): Promise<DashboardMetrics> {
  if (!isSnowflakeConfigured()) {
    return createFallbackDashboardMetrics(sessionId);
  }

  try {
    const binds = sessionBinds(sessionId);

    const [kpiRow = {} as Row] = await executeQuery<Row>(
      `
      ${baseFilterSql()}
      SELECT
        COUNT_IF(EVENT_NAME = 'order_completed') AS ORDERS_SERVED,
        COUNT_IF(EVENT_NAME = 'order_expired') AS ORDERS_EXPIRED,
        COALESCE(SUM(IFF(EVENT_NAME = 'order_served', PAYLOAD:coins::NUMBER, 0)), 0) AS REVENUE,
        COALESCE(AVG(IFF(EVENT_NAME = 'order_served', PAYLOAD:serve_time_ms::FLOAT, NULL)) / 1000, 0) AS AVG_SERVE_TIME_SECONDS,
        COALESCE(
          (
            SELECT PAYLOAD:total_reputation::NUMBER
            FROM base
            WHERE EVENT_NAME = 'level_completed'
            ORDER BY EVENT_TS DESC
            LIMIT 1
          ),
          50
        ) AS FINAL_REPUTATION;
      `,
      binds,
    );

    const [funnelRow = {} as Row] = await executeQuery<Row>(
      `
      ${baseFilterSql()}
      SELECT
        COUNT_IF(EVENT_NAME = 'order_placed') AS ORDER_PLACED,
        COUNT_IF(EVENT_NAME = 'dish_selected') AS DISH_SELECTED,
        COUNT_IF(EVENT_NAME = 'order_served') AS ORDER_SERVED,
        COUNT_IF(EVENT_NAME = 'order_completed') AS ORDER_COMPLETED;
      `,
      binds,
    );

    const speedRows = await executeQuery<Row>(
      `
      ${baseFilterSql()},
      session_ref AS (
        SELECT
          SESSION_ID,
          COALESCE(
            MIN(IFF(EVENT_NAME = 'session_start', EVENT_TS, NULL)),
            MIN(EVENT_TS)
          ) AS SESSION_START_TS
        FROM base
        GROUP BY SESSION_ID
      ),
      served AS (
        SELECT
          COALESCE(
            FLOOR(DATEDIFF('second', r.SESSION_START_TS, b.EVENT_TS) / 60),
            0
          ) + 1 AS MINUTE_BIN,
          LOWER(COALESCE(b.PAYLOAD:speed_tier::STRING, 'red')) AS SPEED_TIER
        FROM base b
        LEFT JOIN session_ref r ON b.SESSION_ID = r.SESSION_ID
        WHERE b.EVENT_NAME = 'order_served' AND b.EVENT_TS IS NOT NULL
      )
      SELECT
        'Minute ' || MINUTE_BIN AS LABEL,
        COUNT_IF(SPEED_TIER = 'green') AS GREEN,
        COUNT_IF(SPEED_TIER = 'yellow') AS YELLOW,
        COUNT_IF(SPEED_TIER = 'red') AS RED
      FROM served
      GROUP BY MINUTE_BIN
      ORDER BY MINUTE_BIN
      LIMIT 8;
      `,
      binds,
    );

    const revenueRows = await executeQuery<Row>(
      `
      ${baseFilterSql()}
      SELECT
        LOWER(COALESCE(PAYLOAD:dish_name::STRING, '')) AS DISH_KEY,
        COALESCE(SUM(COALESCE(PAYLOAD:coins::NUMBER, 0)), 0) AS REVENUE
      FROM base
      WHERE EVENT_NAME = 'order_served'
      GROUP BY DISH_KEY;
      `,
      binds,
    );

    const utilizationRows = await executeQuery<Row>(
      `
      ${baseFilterSql()},
      seat_deltas AS (
        SELECT
          DATE_TRUNC('second', EVENT_TS) AS TS_SECOND,
          SUM(
            CASE
              WHEN EVENT_NAME = 'customer_seated' THEN 1
              WHEN EVENT_NAME = 'customer_left' THEN -1
              ELSE 0
            END
          ) AS DELTA
        FROM base
        WHERE EVENT_NAME IN ('customer_seated', 'customer_left') AND EVENT_TS IS NOT NULL
        GROUP BY TS_SECOND
      ),
      occupancy AS (
        SELECT
          TS_SECOND,
          GREATEST(
            SUM(DELTA) OVER (ORDER BY TS_SECOND ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW),
            0
          ) AS OCCUPIED
        FROM seat_deltas
      ),
      windowed AS (
        SELECT * FROM occupancy ORDER BY TS_SECOND DESC LIMIT 70
      )
      SELECT
        TO_VARCHAR(TS_SECOND, 'HH24:MI:SS') AS LABEL,
        OCCUPIED
      FROM windowed
      ORDER BY TS_SECOND;
      `,
      binds,
    );

    const satisfactionRows = await executeQuery<Row>(
      `
      ${baseFilterSql()},
      rep_deltas AS (
        SELECT
          DATE_TRUNC('second', EVENT_TS) AS TS_SECOND,
          SUM(
            CASE
              WHEN EVENT_NAME = 'order_served' THEN COALESCE(PAYLOAD:reputation::NUMBER, 0)
              WHEN EVENT_NAME = 'order_expired' THEN -COALESCE(PAYLOAD:reputation_lost::NUMBER, 0)
              ELSE 0
            END
          ) AS DELTA
        FROM base
        WHERE EVENT_NAME IN ('order_served', 'order_expired') AND EVENT_TS IS NOT NULL
        GROUP BY TS_SECOND
      ),
      reputation AS (
        SELECT
          TS_SECOND,
          50 + SUM(DELTA) OVER (ORDER BY TS_SECOND ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS REPUTATION
        FROM rep_deltas
      ),
      windowed AS (
        SELECT * FROM reputation ORDER BY TS_SECOND DESC LIMIT 70
      )
      SELECT
        TO_VARCHAR(TS_SECOND, 'HH24:MI:SS') AS LABEL,
        REPUTATION
      FROM windowed
      ORDER BY TS_SECOND;
      `,
      binds,
    );

    const throughputRows = await executeQuery<Row>(
      `
      ${baseFilterSql()},
      session_ref AS (
        SELECT
          SESSION_ID,
          COALESCE(
            MIN(IFF(EVENT_NAME = 'session_start', EVENT_TS, NULL)),
            MIN(EVENT_TS)
          ) AS SESSION_START_TS
        FROM base
        GROUP BY SESSION_ID
      ),
      pressure AS (
        SELECT
          COALESCE(
            FLOOR(DATEDIFF('second', r.SESSION_START_TS, b.EVENT_TS) / 10),
            0
          ) AS BIN_10S,
          b.EVENT_NAME
        FROM base b
        LEFT JOIN session_ref r ON b.SESSION_ID = r.SESSION_ID
        WHERE b.EVENT_NAME IN ('order_completed', 'order_expired') AND b.EVENT_TS IS NOT NULL
      )
      SELECT
        (BIN_10S * 10)::STRING || '-' || ((BIN_10S * 10) + 10)::STRING || 's' AS LABEL,
        COUNT_IF(EVENT_NAME = 'order_completed') AS COMPLETED,
        COUNT_IF(EVENT_NAME = 'order_expired') AS EXPIRED
      FROM pressure
      GROUP BY BIN_10S
      ORDER BY BIN_10S
      LIMIT 12;
      `,
      binds,
    );

    const demandRows = await executeQuery<Row>(
      `
      ${baseFilterSql()},
      requested AS (
        SELECT LOWER(PAYLOAD:dish_1::STRING) AS DISH_KEY
        FROM base
        WHERE EVENT_NAME = 'order_placed'
        UNION ALL
        SELECT LOWER(PAYLOAD:dish_2::STRING) AS DISH_KEY
        FROM base
        WHERE EVENT_NAME = 'order_placed' AND PAYLOAD:dish_2 IS NOT NULL
      ),
      served AS (
        SELECT LOWER(PAYLOAD:dish_name::STRING) AS DISH_KEY
        FROM base
        WHERE EVENT_NAME = 'order_served'
      ),
      all_dishes AS (
        SELECT DISH_KEY FROM requested
        UNION
        SELECT DISH_KEY FROM served
      )
      SELECT
        d.DISH_KEY,
        COALESCE((SELECT COUNT(*) FROM requested r WHERE r.DISH_KEY = d.DISH_KEY), 0) AS REQUESTED,
        COALESCE((SELECT COUNT(*) FROM served s WHERE s.DISH_KEY = d.DISH_KEY), 0) AS SERVED
      FROM all_dishes d;
      `,
      binds,
    );

    const [validationSummary = {} as Row] = await executeQuery<Row>(
      `
      ${baseFilterSql()}
      SELECT
        COUNT(*) AS TOTAL_EVENTS,
        COUNT(DISTINCT EVENT_NAME) AS DISTINCT_EVENT_TYPES,
        MAX(EVENT_TS) AS LAST_EVENT_AT
      FROM base;
      `,
      binds,
    );

    const validationCountRows = await executeQuery<Row>(
      `
      ${baseFilterSql()}
      SELECT EVENT_NAME, COUNT(*) AS CNT
      FROM base
      GROUP BY EVENT_NAME;
      `,
      binds,
    );

    const speedFallback = createFallbackDashboardMetrics(sessionId).speedTiers;
    const speedByLabel = speedRows.reduce<
      Record<string, { green: number; yellow: number; red: number }>
    >((acc, row) => {
      const label = asString(row, "LABEL");
      acc[label] = {
        green: asNumber(row, "GREEN"),
        yellow: asNumber(row, "YELLOW"),
        red: asNumber(row, "RED"),
      };
      return acc;
    }, {});

    const speedLabels =
      speedRows.length > 0 ? speedRows.map((row) => asString(row, "LABEL")) : speedFallback.labels;

    const revenueByDish = toMap(revenueRows, "DISH_KEY", "REVENUE");
    const demandRequestedByDish = toMap(demandRows, "DISH_KEY", "REQUESTED");
    const demandServedByDish = toMap(demandRows, "DISH_KEY", "SERVED");

    const eventCounts = validationCountRows.reduce<Record<string, number>>((acc, row) => {
      const eventName = asString(row, "EVENT_NAME");
      if (eventName) {
        acc[eventName] = asNumber(row, "CNT");
      }
      return acc;
    }, {});

    const missingEventTypes = EXPECTED_EVENT_TYPES.filter((eventName) => !eventCounts[eventName]);

    const peakUtilization =
      utilizationRows.length > 0
        ? Math.max(...utilizationRows.map((row) => asNumber(row, "OCCUPIED")))
        : 0;

    return {
      source: "snowflake",
      generatedAt: new Date().toISOString(),
      sessionId,
      kpis: {
        ordersServed: asNumber(kpiRow, "ORDERS_SERVED"),
        ordersExpired: asNumber(kpiRow, "ORDERS_EXPIRED"),
        revenue: asNumber(kpiRow, "REVENUE"),
        avgServeTimeSeconds: Number(asNumber(kpiRow, "AVG_SERVE_TIME_SECONDS").toFixed(2)),
        peakUtilization,
        finalReputation: asNumber(kpiRow, "FINAL_REPUTATION"),
      },
      funnel: {
        labels: ["Order Placed", "Dish Selected", "Order Served", "Order Completed"],
        values: [
          asNumber(funnelRow, "ORDER_PLACED"),
          asNumber(funnelRow, "DISH_SELECTED"),
          asNumber(funnelRow, "ORDER_SERVED"),
          asNumber(funnelRow, "ORDER_COMPLETED"),
        ],
      },
      speedTiers: {
        labels: speedLabels,
        green: speedLabels.map((label, index) => speedByLabel[label]?.green ?? speedFallback.green[index] ?? 0),
        yellow: speedLabels.map((label, index) => speedByLabel[label]?.yellow ?? speedFallback.yellow[index] ?? 0),
        red: speedLabels.map((label, index) => speedByLabel[label]?.red ?? speedFallback.red[index] ?? 0),
      },
      revenuePerDish: {
        labels: DASHBOARD_DISHES.map((dish) => DISH_LABELS[dish]),
        values: DASHBOARD_DISHES.map((dish) => revenueByDish[dish] ?? 0),
      },
      utilization: {
        labels: utilizationRows.map((row) => asString(row, "LABEL")),
        occupied: utilizationRows.map((row) => asNumber(row, "OCCUPIED")),
      },
      satisfaction: {
        labels: satisfactionRows.map((row) => asString(row, "LABEL")),
        reputation: satisfactionRows.map((row) => asNumber(row, "REPUTATION")),
      },
      throughput: {
        labels: throughputRows.map((row) => asString(row, "LABEL")),
        completed: throughputRows.map((row) => asNumber(row, "COMPLETED")),
        expired: throughputRows.map((row) => asNumber(row, "EXPIRED")),
      },
      demandVsServed: {
        labels: DASHBOARD_DISHES.map((dish) => DISH_LABELS[dish]),
        requested: DASHBOARD_DISHES.map((dish) => demandRequestedByDish[dish] ?? 0),
        served: DASHBOARD_DISHES.map((dish) => demandServedByDish[dish] ?? 0),
      },
      validation: {
        totalEvents: asNumber(validationSummary, "TOTAL_EVENTS"),
        distinctEventTypes: asNumber(validationSummary, "DISTINCT_EVENT_TYPES"),
        lastEventAt: asString(validationSummary, "LAST_EVENT_AT") || null,
        missingEventTypes,
        eventCounts,
      },
    };
  } catch (error) {
    console.error("[dashboard] metrics query failed", error);
    return createFallbackDashboardMetrics(sessionId);
  }
}

export function parseSessionId(raw: string | null): string | null {
  if (!raw) {
    return null;
  }

  const value = raw.trim();
  const uuidPattern =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidPattern.test(value) ? value : null;
}
