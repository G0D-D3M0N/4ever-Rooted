import "dotenv/config";
import { drizzle } from "drizzle-orm/libsql";
import { createClient } from "@libsql/client";
import * as schema from "@shared/schema";

// All credentials come from Replit Secrets / Vercel Environment Variables.
// See env.template for the full list of required variables.
const databaseUrl = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!databaseUrl) {
  throw new Error("TURSO_DATABASE_URL is not set. Add it to your environment secrets.");
}

// Only log DB target in development — never expose hostnames in production logs
if (process.env.NODE_ENV !== "production") {
  console.log("[db] connecting to:", databaseUrl.substring(0, 60));
}

export const client = createClient({ url: databaseUrl, authToken });

export const db = drizzle(client, { schema });

export async function runMigrations() {
  await client.execute(`
    CREATE TABLE IF NOT EXISTS path_progress (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT NOT NULL,
      path_id TEXT NOT NULL,
      phase_index INTEGER NOT NULL,
      completed_at INTEGER DEFAULT (strftime('%s', 'now'))
    )
  `);
  if (process.env.NODE_ENV !== "production") {
    console.log("[db] migrations complete");
  }
}
