"use client";

import { v4 as uuidv4 } from "uuid";

import {
  gameEventSchema,
  type GameEvent,
  type GameEventName,
  type GameEventPayload,
} from "@/lib/events/schema";

const EVENT_ENDPOINT = process.env.NEXT_PUBLIC_EVENT_ENDPOINT ?? "/api/event";

interface EmitGameEventInput<TName extends GameEventName> {
  eventName: TName;
  sessionId: string;
  level: number;
  payload: GameEventPayload<TName>;
}

export function buildGameEvent<TName extends GameEventName>({
  eventName,
  sessionId,
  level,
  payload,
}: EmitGameEventInput<TName>): GameEvent {
  return {
    event_id: uuidv4(),
    event_name: eventName,
    session_id: sessionId,
    level,
    timestamp: Date.now(),
    payload,
  } as GameEvent;
}

export async function emitGameEvent<TName extends GameEventName>(
  input: EmitGameEventInput<TName>,
): Promise<{ ok: boolean; status?: number; error?: string }> {
  const event = buildGameEvent(input);
  const parsed = gameEventSchema.safeParse(event);

  if (!parsed.success) {
    if (process.env.NODE_ENV !== "production") {
      console.warn("Event validation failed", parsed.error.flatten());
    }
    return { ok: false, error: "validation_failed" };
  }

  try {
    const response = await fetch(EVENT_ENDPOINT, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(parsed.data),
      keepalive: true,
    });

    return { ok: response.ok, status: response.status };
  } catch {
    return { ok: false, error: "network_error" };
  }
}
