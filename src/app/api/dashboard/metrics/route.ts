import { NextResponse } from "next/server";

import { getDashboardMetrics, parseSessionId } from "@/lib/snowflake/dashboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedSessionId = searchParams.get("session_id");
    const sessionId = parseSessionId(requestedSessionId);
    const metrics = await getDashboardMetrics(sessionId);

    return NextResponse.json({
      ok: true,
      metrics,
      warning:
        requestedSessionId && !sessionId
          ? "invalid_session_id_ignored"
          : undefined,
    });
  } catch (error) {
    console.error("[dashboard] metrics route failed", error);
    return NextResponse.json(
      {
        ok: false,
        error: "dashboard_metrics_failed",
      },
      { status: 500 },
    );
  }
}
