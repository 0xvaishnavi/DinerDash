import { NextResponse } from "next/server";

import { gameEventSchema } from "@/lib/events/schema";
import { insertGameEvent } from "@/lib/snowflake/insert";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = gameEventSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_event_payload",
          issues: parsed.error.flatten(),
        },
        { status: 400 },
      );
    }

    if (process.env.NODE_ENV !== "production") {
      console.info("[event]", parsed.data.event_name, parsed.data.event_id);
    }

    // Insert event into Snowflake
    try {
      await insertGameEvent(parsed.data);
    } catch (sfErr) {
      console.error("[snowflake] insert failed:", sfErr);
      // Return success to the client but log the Snowflake error.
      // Game events should not fail due to analytics pipeline issues.
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json(
      {
        ok: false,
        error: "unexpected_server_error",
      },
      { status: 500 },
    );
  }
}
