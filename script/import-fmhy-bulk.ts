import "dotenv/config";
import { storage } from "../server/storage";
import { buildFmhySeedItems } from "../shared/fmhy-ingest";

const argv = process.argv.slice(2);
const dryRun = argv.includes("--dry-run");
const numArg = argv.find((a) => /^\d+$/.test(a));
const maxLinks = Math.min(Math.max(1, Number(numArg ?? "8500")), 20_000);

async function main() {
  console.log(
    dryRun
      ? `FMHY dry-run parse: maxLinks=${maxLinks} (no database writes)`
      : `FMHY import: maxLinks=${maxLinks} (requires TURSO_DATABASE_URL + TURSO_AUTH_TOKEN)`,
  );
  const items = await buildFmhySeedItems({ maxLinks });
  console.log(`Parsed ${items.length} unique https links from api.fmhy.net/single-page`);

  const byCat: Record<string, number> = {};
  for (const it of items) {
    byCat[it.category] = (byCat[it.category] ?? 0) + 1;
  }
  console.log("Category breakdown:", byCat);

  if (dryRun) {
    console.log("Dry run finished.");
    return;
  }

  const inserted = await storage.bulkCreateResources(items as any);
  console.log(`Inserted ${inserted} new rows; ${items.length - inserted} were already in the database (skipped).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
