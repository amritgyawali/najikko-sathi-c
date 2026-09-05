/**
 * Runs pending database migrations before the Next.js build.
 *
 * Skipped when no database is configured, so the site still builds (and serves
 * its built-in fallback content) before the CMS has been connected.
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";

// Vercel injects real environment variables, but a local `npm run build` needs
// .env loaded here too - otherwise migrations would be silently skipped.
if (existsSync(".env")) process.loadEnvFile(".env");

// Supabase transaction pooling is for application requests. Migrations can
// use its session pooler (or a direct connection) through a separate variable.
if (process.env.DATABASE_MIGRATION_URI) {
  process.env.DATABASE_URI = process.env.DATABASE_MIGRATION_URI;
}

if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
  console.log("[predeploy] DATABASE_URI/PAYLOAD_SECRET not set - skipping migrations.");
  process.exit(0);
}

const result = spawnSync("payload", ["migrate"], { stdio: "inherit", shell: true });
process.exit(result.status ?? 1);
