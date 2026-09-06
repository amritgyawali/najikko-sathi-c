import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";

import { sitePages } from "../lib/site-map";

/**
 * Keeps lib/site-map.ts honest.
 *
 * The dashboard's "Website pages" panel, the navbar's built-in menu, and the
 * grouping of pages under a menu item all read that one list. This check fails
 * when it stops describing the website: a route added with no entry, or an
 * entry left behind after a route was deleted.
 *
 * Needs no database, no build and no browser, so it can run on its own:
 *   npm run check:pages
 */

const root = path.join(process.cwd(), "app", "(frontend)");

/** Every route directory that renders a page, as the public path it serves. */
async function routePaths(dir = root, prefix = ""): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const found: string[] = [];

  if (entries.some((entry) => entry.isFile() && /^page\.(tsx|ts|jsx|js)$/.test(entry.name))) {
    found.push(prefix === "" ? "/" : prefix);
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue;
    // Private folders (_components, _data, _lib) hold no routes, and a route
    // group's name is not part of the address.
    if (entry.name.startsWith("_")) continue;
    const segment = entry.name.startsWith("(") ? "" : `/${entry.name}`;
    found.push(...(await routePaths(path.join(dir, entry.name), `${prefix}${segment}`)));
  }

  return found;
}

const routes = (await routePaths()).sort();
const listed = sitePages.map((page) => page.path).sort();

const missing = routes.filter((route) => !listed.includes(route));
const stale = listed.filter((entry) => !routes.includes(entry));

assert.deepEqual(
  missing,
  [],
  `These pages exist but are not in lib/site-map.ts, so the dashboard does not know about them:\n  ${missing.join("\n  ")}`,
);
assert.deepEqual(
  stale,
  [],
  `lib/site-map.ts lists pages that no longer exist:\n  ${stale.join("\n  ")}`,
);

// A page can sit under a menu item, but only under one that is in the menu.
for (const page of sitePages) {
  if (!page.parent) continue;
  const parent = sitePages.find((other) => other.path === page.parent);
  assert(parent, `${page.path} sits under ${page.parent}, which is not a page.`);
  assert(
    typeof parent.navOrder === "number",
    `${page.path} sits under ${page.parent}, which is not in the menu, so nothing links to it.`,
  );
}

// Duplicate paths would give the dashboard panel two rows for one page.
assert.equal(new Set(listed).size, listed.length, "lib/site-map.ts lists a page twice.");

// Every dashboard link has to point somewhere real.
for (const page of sitePages) {
  for (const link of page.edit) {
    assert.match(
      link.href,
      /^\/admin\/(globals|collections)\/[a-z-]+(\/[\w-]+)?$/,
      `${page.path}: "${link.label}" does not point into the dashboard (${link.href}).`,
    );
  }
}

const inMenu = sitePages.filter((page) => typeof page.navOrder === "number");
console.log(
  `PASS ${routes.length} routes, all in lib/site-map.ts. ` +
    `Menu: ${inMenu.map((page) => page.label).join(", ")}.`,
);
