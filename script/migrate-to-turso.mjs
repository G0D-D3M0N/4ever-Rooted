import { createClient } from "@libsql/client";

const tursoUrl = process.env.TURSO_DATABASE_URL;
const tursoToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl || tursoUrl.startsWith("file:")) {
  console.error("TURSO_DATABASE_URL is not set or is still the local fallback");
  process.exit(1);
}

console.log("Source:      file:local.db");
console.log("Destination:", tursoUrl.substring(0, 60));

const local = createClient({ url: "file:local.db" });
const turso = createClient({ url: tursoUrl, authToken: tursoToken });

// ── Create all tables in Turso ───────────────────────────────────────────────
const DDL = [
  `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    email TEXT UNIQUE,
    first_name TEXT,
    last_name TEXT,
    profile_image_url TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now')),
    updated_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    sid TEXT PRIMARY KEY,
    sess TEXT NOT NULL,
    expire INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    subcategory TEXT,
    url TEXT NOT NULL,
    tags TEXT,
    warning TEXT,
    submitted_by TEXT,
    status TEXT NOT NULL DEFAULT 'approved',
    votes INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`,
  `CREATE TABLE IF NOT EXISTS resource_votes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_id INTEGER NOT NULL,
    user_id TEXT NOT NULL,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`,
  `CREATE TABLE IF NOT EXISTS roadmaps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    icon TEXT,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`,
  `CREATE TABLE IF NOT EXISTS roadmap_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    roadmap_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    resources TEXT,
    section TEXT NOT NULL,
    "order" INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS user_progress (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    step_id INTEGER NOT NULL,
    completed_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`,
  `CREATE TABLE IF NOT EXISTS notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT NOT NULL,
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    resource_id INTEGER,
    read INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (strftime('%s', 'now'))
  )`,
];

console.log("\n── Creating tables ──");
for (const sql of DDL) {
  const name = sql.match(/CREATE TABLE IF NOT EXISTS (\w+)/)[1];
  await turso.execute(sql);
  console.log(`  ✓ ${name}`);
}

// ── Migrate a table ──────────────────────────────────────────────────────────
async function migrateTable(tableName, batchSize = 100) {
  // Check dest count first
  const destCount = (await turso.execute(`SELECT COUNT(*) as c FROM ${tableName}`)).rows[0].c;
  if (Number(destCount) > 0) {
    console.log(`  ○ ${tableName}: already has ${destCount} rows — skipping`);
    return;
  }

  let rows;
  try {
    rows = (await local.execute(`SELECT * FROM ${tableName}`)).rows;
  } catch {
    console.log(`  - ${tableName}: not in local DB — skipping`);
    return;
  }

  if (rows.length === 0) {
    console.log(`  ○ ${tableName}: empty — skipping`);
    return;
  }

  const cols = Object.keys(rows[0]);
  const colList = cols.map(c => `"${c}"`).join(", ");
  const placeholders = cols.map(() => "?").join(", ");
  const insertSql = `INSERT OR IGNORE INTO ${tableName} (${colList}) VALUES (${placeholders})`;

  let inserted = 0;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    const statements = batch.map(row => ({
      sql: insertSql,
      args: cols.map(c => {
        const v = row[c];
        return v === undefined || v === null ? null : v;
      }),
    }));
    await turso.batch(statements, "write");
    inserted += batch.length;
    process.stdout.write(`\r  ↑ ${tableName}: ${inserted}/${rows.length}`);
  }
  console.log(`\r  ✓ ${tableName}: migrated ${inserted} rows`);
}

console.log("\n── Migrating data ──");
for (const t of ["users", "resources", "resource_votes", "roadmaps", "roadmap_steps", "user_progress", "notifications"]) {
  await migrateTable(t);
}

// Verify
console.log("\n── Verification ──");
for (const t of ["resources", "roadmaps", "roadmap_steps"]) {
  const n = (await turso.execute(`SELECT COUNT(*) as c FROM ${t}`)).rows[0].c;
  console.log(`  ${t}: ${n} rows`);
}

console.log("\n✅ Done! Turso is live with all data.");
