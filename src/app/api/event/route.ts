import { NextResponse } from "next/server";

import { gameEventSchema } from "@/lib/events/schema";

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

    // Kafka publish hook will be added in the next implementation phase.
    if (process.env.NODE_ENV !== "production") {
      console.info("[event]", parsed.data.event_name, parsed.data.event_id);
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
