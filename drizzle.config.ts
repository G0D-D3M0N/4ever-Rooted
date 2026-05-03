import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.TURSO_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("TURSO_DATABASE_URL is not set");
}

export default defineConfig({
  out: "./migrations",
  schema: "./shared/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: databaseUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
