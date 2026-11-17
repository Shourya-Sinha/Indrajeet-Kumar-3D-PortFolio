import { ensureDatabaseSeeded } from "./seed";

async function main() {
  await ensureDatabaseSeeded();
  console.log("Database seed completed successfully.");
  process.exit(0);
}

main().catch((err) => {
  console.error("Database seed failed:", err);
  process.exit(1);
});
