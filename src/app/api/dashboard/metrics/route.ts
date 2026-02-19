import { NextResponse } from "next/server";

import { getDashboardMetrics, parseSessionId } from "@/lib/snowflake/dashboard";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestedSessionId = searchParams.get("session_id");
    if (!requestedSessionId) {
      return NextResponse.json(
        {
          ok: false,
          error: "session_id_required",
        },
        { status: 400 },
      );
    }

    const sessionId = parseSessionId(requestedSessionId);
    if (!sessionId) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_session_id",
        },
        { status: 400 },
      );
    }

    const metrics = await getDashboardMetrics(sessionId);

    return NextResponse.json({
      ok: true,
      metrics,
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
