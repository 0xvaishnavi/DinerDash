import * as snowflake from "snowflake-sdk";
import type { Bind, Connection, RowStatement } from "snowflake-sdk";

snowflake.configure({ ocspFailOpen: true });

function getConnection(): Promise<Connection> {
  const connection = snowflake.createConnection({
    account: process.env.SNOWFLAKE_ACCOUNT!,
    username: process.env.SNOWFLAKE_USERNAME!,
    password: process.env.SNOWFLAKE_PASSWORD!,
    database: process.env.SNOWFLAKE_DATABASE ?? "DINER_DASH",
    schema: process.env.SNOWFLAKE_SCHEMA ?? "GAME_EVENTS",
    warehouse: process.env.SNOWFLAKE_WAREHOUSE ?? "COMPUTE_WH",
    role: process.env.SNOWFLAKE_ROLE ?? "ACCOUNTADMIN",
  });

  return new Promise((resolve, reject) => {
    connection.connect((err, conn) => {
      if (err) reject(err);
      else resolve(conn);
    });
  });
}

export async function executeQuery<T = Record<string, unknown>>(
  sql: string,
  binds: Bind[] = [],
): Promise<T[]> {
  const connection = await getConnection();

  return new Promise((resolve, reject) => {
    connection.execute({
      sqlText: sql,
      binds,
      complete: (err: Error | undefined, _stmt: RowStatement, rows: unknown[] | undefined) => {
        connection.destroy(() => {});
        if (err) reject(err);
        else resolve((rows ?? []) as T[]);
      },
    });
  });
}
