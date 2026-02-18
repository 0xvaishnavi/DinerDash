import type { GameEvent } from "@/lib/events/schema";
import { executeQuery } from "./connection";

export async function insertGameEvent(event: GameEvent): Promise<void> {
  const sql = `
    INSERT INTO GAME_EVENTS.RAW_EVENTS (
      EVENT_ID,
      SESSION_ID,
      LEVEL,
      TIMESTAMP,
      EVENT_NAME,
      PAYLOAD
    )
    SELECT ?, ?, ?, ?, ?, PARSE_JSON(?)
  `;

  const binds = [
    event.event_id,
    event.session_id,
    event.level,
    new Date(event.timestamp).toISOString(),
    event.event_name,
    JSON.stringify(event.payload),
  ];

  await executeQuery(sql, binds);
}
