import { existsSync } from "fs";

import { getPayload } from "payload";

import { importRoutePages, restoreRoutePages, routePages } from "../cms/site-pages";

/**
 * Puts the website's own pages into the dashboard, so every one of them can be
 * edited there:
 *
 *   npm run sync:pages                 import every page that is not there yet
 *   npm run sync:pages -- /about /it   import only these
 *   npm run sync:pages -- --restore /about
 *                                      put a page back to the copy it ships with
 *
 * The same thing happens when an editor presses "Add them to the dashboard" on
 * the dashboard home, so this is only needed for a scripted setup.
 */

// The environment must be loaded before payload.config.ts is evaluated, since
// the config reads PAYLOAD_SECRET and DATABASE_URI at module scope. That is why
// the config below is imported dynamically rather than at the top of the file.
if (existsSync(".env")) process.loadEnvFile(".env");

for (const key of ["PAYLOAD_SECRET", "DATABASE_URI"]) {
  if (!process.env[key]) {
    console.error(`Missing ${key}. Copy .env.example to .env and fill it in first.`);
    process.exit(1);
  }
}

const args = process.argv.slice(2);
const restore = args.includes("--restore");
const paths = args.filter((arg) => arg.startsWith("/"));

const known = new Set(routePages.map((page) => page.path));
const unknown = paths.filter((path) => !known.has(path));
if (unknown.length > 0) {
  console.error(`Not a page of this website: ${unknown.join(", ")}`);
  console.error(`Known pages: ${[...known].join(", ")}`);
  process.exit(1);
}

if (restore && paths.length === 0) {
  console.error("Name the pages to restore, for example: npm run sync:pages -- --restore /about");
  process.exit(1);
}

const { default: config } = await import("@payload-config");
const payload = await getPayload({ config });

const report = restore
  ? await restoreRoutePages(payload, paths)
  : await importRoutePages(payload, paths.length > 0 ? paths : undefined);

if (report.imported.length > 0) console.log(`Imported: ${report.imported.join(", ")}`);
if (report.restored.length > 0) console.log(`Restored to the shipped copy: ${report.restored.join(", ")}`);
if (report.alreadyThere.length > 0) console.log(`Left alone: ${report.alreadyThere.join(", ")}`);
for (const failure of report.failed) console.error(`Failed ${failure.path}: ${failure.reason}`);

process.exit(report.failed.length > 0 ? 1 : 0);
