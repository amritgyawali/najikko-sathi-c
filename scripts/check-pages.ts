import assert from "node:assert/strict";
import { readdir } from "node:fs/promises";
import path from "node:path";

import { liveTargetFor } from "../cms/live-urls";
import { routePageContent } from "../lib/page-defaults";
import { mediaKeyToPath, sitePages } from "../lib/site-map";

/**
 * Keeps lib/site-map.ts honest.
 *
 * The dashboard's "Website pages" panel, the navbar's built-in menu, and the
 * grouping of pages under a menu item all read that one list. This check fails
 * when it stops describing the website: a route added with no entry, or an
 * entry left behind after a route was deleted.
 *
 * It also checks the site map against cms/live-urls.ts, which answers the
 * opposite question - given a document, which page does it come out on. The two
 * describe the same website from different ends, so a page media entry has to
 * lead back to the page the site map says it belongs to.
 *
 * Finally it checks lib/page-defaults.ts, the copy each page ships with and the
 * copy the dashboard imports. Every page needs an entry there, or it would
 * render blank; and every entry needs a page, or the dashboard would offer to
 * import something that does not exist.
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

// The dashboard shows editors a live address for each Page media entry. It has
// to be the page whose showcase band actually uses that entry.
for (const [key, pagePath] of Object.entries(mediaKeyToPath)) {
  const target = liveTargetFor({ collectionSlug: "media-slots", data: { key } });
  assert.equal(
    target.path,
    pagePath,
    `Page media "${key}" belongs to ${pagePath} in lib/site-map.ts, but cms/live-urls.ts ` +
      `sends an editor to ${target.path ?? "nowhere"}.`,
  );
}

// Every page needs the copy it ships with, and every piece of shipped copy
// needs a page. Routes generated from other content have no copy of their own.
const fixed = sitePages.filter((page) => !page.dynamic).map((page) => page.path);
const withoutContent = fixed.filter((path) => !(path in routePageContent));
const withoutPage = Object.keys(routePageContent).filter((path) => !fixed.includes(path));

assert.deepEqual(
  withoutContent,
  [],
  `These pages have no sections in lib/page-defaults.ts, so they would render blank:\n  ${withoutContent.join("\n  ")}`,
);
assert.deepEqual(
  withoutPage,
  [],
  `lib/page-defaults.ts holds copy for pages that do not exist:\n  ${withoutPage.join("\n  ")}`,
);

// The photo and film band is a section now. The key it names has to be the one
// the site map - and therefore the dashboard - says belongs to this page.
for (const [path, content] of Object.entries(routePageContent)) {
  const keys = content.sections
    .filter((section) => section.blockType === "mediaShowcase")
    .map((section) => (section as { mediaKey: string }).mediaKey);
  const expected = sitePages.find((page) => page.path === path)?.mediaKey;

  for (const key of keys) {
    assert.equal(
      key,
      expected,
      `${path} shows the "${key}" page media entry, but lib/site-map.ts says it owns ` +
        `${expected ? `"${expected}"` : "none"}.`,
    );
  }
  if (expected) {
    assert(
      keys.includes(expected),
      `lib/site-map.ts says ${path} owns the "${expected}" page media entry, but the page ` +
        "has no photo and film band to show it.",
    );
  }
}

// Every page ships with a search-engine title and description.
for (const [path, content] of Object.entries(routePageContent)) {
  assert(content.seo.title, `${path} has no title in lib/page-defaults.ts.`);
  assert(content.seo.description, `${path} has no description in lib/page-defaults.ts.`);
}

const inMenu = sitePages.filter((page) => typeof page.navOrder === "number");
console.log(
  `PASS ${routes.length} routes, all in lib/site-map.ts, ` +
    `${Object.keys(routePageContent).length} of them with the copy they ship with, ` +
    `${Object.keys(mediaKeyToPath).length} page media keys agreeing with cms/live-urls.ts. ` +
    `Menu: ${inMenu.map((page) => page.label).join(", ")}.`,
);
