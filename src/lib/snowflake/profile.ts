import { executeQuery } from "@/lib/snowflake/connection";

interface ExistingProfileRow {
  USERNAME: string;
  SESSION_ID: string;
}

export class UsernameTakenError extends Error {
  constructor() {
    super("username_taken");
  }
}

async function ensureProfilesTable(): Promise<void> {
  const sql = `
    CREATE TABLE IF NOT EXISTS GAME_EVENTS.PLAYER_PROFILES (
      USERNAME STRING NOT NULL,
      SESSION_ID STRING NOT NULL,
      CREATED_AT TIMESTAMP_NTZ DEFAULT CURRENT_TIMESTAMP()
    )
  `;

  await executeQuery(sql);
}

export async function registerPlayerProfile(username: string, sessionId: string): Promise<void> {
  await ensureProfilesTable();

  const existing = await executeQuery<ExistingProfileRow>(
    `
      SELECT USERNAME, SESSION_ID
      FROM GAME_EVENTS.PLAYER_PROFILES
      WHERE USERNAME = ?
      LIMIT 1
    `,
    [username],
  );

  if (existing.length > 0) {
    const row = existing[0];
    if (row.SESSION_ID === sessionId) {
      return;
    }
    throw new UsernameTakenError();
  }

  await executeQuery(
    `
      INSERT INTO GAME_EVENTS.PLAYER_PROFILES (USERNAME, SESSION_ID)
      VALUES (?, ?)
    `,
    [username, sessionId],
  );
}
