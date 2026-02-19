import { NextResponse } from "next/server";

import { registerPlayerProfile, UsernameTakenError } from "@/lib/snowflake/profile";

const USERNAME_REGEX = /^[a-z0-9]+$/;

interface RegisterBody {
  username?: unknown;
  session_id?: unknown;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as RegisterBody;
    const usernameRaw = typeof body.username === "string" ? body.username : "";
    const sessionId = typeof body.session_id === "string" ? body.session_id : "";
    const username = usernameRaw.trim().toLowerCase();

    if (!USERNAME_REGEX.test(username)) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_username",
          message: "username must contain only lowercase letters and numbers",
        },
        { status: 400 },
      );
    }

    if (!sessionId.trim()) {
      return NextResponse.json(
        {
          ok: false,
          error: "invalid_session_id",
        },
        { status: 400 },
      );
    }

    await registerPlayerProfile(username, sessionId);

    return NextResponse.json({
      ok: true,
      username,
      session_id: sessionId,
    });
  } catch (error) {
    if (error instanceof UsernameTakenError) {
      return NextResponse.json(
        {
          ok: false,
          error: "username_taken",
        },
        { status: 409 },
      );
    }

    console.error("[profile] register failed:", error);
    return NextResponse.json(
      {
        ok: false,
        error: "unexpected_server_error",
      },
      { status: 500 },
    );
  }
}
