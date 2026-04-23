// Utilitário: apaga dev.db e recria do zero (re-seed).
// Uso: npx tsx scripts/reset_db.ts
import fs from "node:fs";
import path from "node:path";
import { execSync } from "node:child_process";

const dbPath = path.join(process.cwd(), "prisma", "dev.db");

if (fs.existsSync(dbPath)) {
  fs.unlinkSync(dbPath);
  console.log("✓ dev.db removido");
}

console.log("→ prisma db push");
execSync("npx prisma db push --skip-generate", { stdio: "inherit" });

console.log("→ seed");
execSync("npx tsx prisma/seed.ts", { stdio: "inherit" });

console.log("✓ DB resetado");
