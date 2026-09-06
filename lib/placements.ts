import { sitePages } from "./site-map";

/**
 * Where a piece of content is published.
 *
 * Every content collection - posts, offers, reviews, questions, social
 * responsibility, the team, and the file library - carries a "Where this
 * appears" list in the dashboard. An editor ticks the pages a document belongs
 * on, and the website only shows it there.
 *
 * The list of pages an editor may tick is the site map itself
 * (lib/site-map.ts), so adding a page to the website adds it to every one of
 * those dropdowns with nothing else to update. A page is named by its key: the
 * address without its slash, and "home" for the front page. Those keys are the
 * four the questions collection has always used - "contact", "services",
 * "training", "production" - so nothing already written has to move.
 *
 * Two rules keep the choice from ever hiding content by accident:
 *
 * 1. A document that names no page appears wherever its section is placed,
 *    which is how everything behaved before this existed.
 * 2. An address that is not one of the pages below - a post, a service, a page
 *    invented in the dashboard - shows everything, because no editor could
 *    have ticked it.
 */

/** Pages a visitor reaches that hold no editorial content of their own. */
const notPublishTargets = new Set(["/search", "/signup"]);

/** The key naming a page: "/" is "home", "/our-work" is "our-work". */
export const placementKey = (path: string): string =>
  path === "/" ? "home" : path.replace(/^\//, "");

export type PlacementOption = { label: string; value: string };

/** The pages a document can be published on, in menu order. */
export const placementOptions: PlacementOption[] = sitePages
  .filter((page) => !page.dynamic && !notPublishTargets.has(page.path))
  .map((page) => ({ label: page.label, value: placementKey(page.path) }));

/** Every key an editor can choose, for telling a real choice from an unknown one. */
const knownKeys = new Set(placementOptions.map((option) => option.value));

/** A placement key back to the address it names. */
export const placementPath: Record<string, string> = Object.fromEntries(
  sitePages
    .filter((page) => !page.dynamic && !notPublishTargets.has(page.path))
    .map((page) => [placementKey(page.path), page.path]),
);

/** A placement key back to the page's name, for sentences in the dashboard. */
export const placementLabel: Record<string, string> = Object.fromEntries(
  placementOptions.map((option) => [option.value, option.label]),
);

/**
 * The page an address is, as far as publishing is concerned, or null when it is
 * not a page anything can be published to - a post, a service, or a page
 * invented in the dashboard.
 */
export const placementKeyFor = (path: string | null | undefined): string | null => {
  if (!path) return null;
  const key = placementKey(path);
  return knownKeys.has(key) ? key : null;
};

/** What a document has been published to. Tolerates the shapes Payload returns. */
const chosenPlacements = (doc: unknown): string[] => {
  const value = (doc as { placements?: unknown } | null | undefined)?.placements;
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string" && entry.length > 0);
};

/** Should this document be shown on the page named by `key`? */
export function appliesTo(doc: unknown, key: string | null | undefined): boolean {
  const chosen = chosenPlacements(doc);
  // Nothing chosen: published wherever its section is placed.
  if (chosen.length === 0) return true;
  // An address nobody could have ticked shows everything.
  if (!key || !knownKeys.has(key)) return true;
  return chosen.includes(key);
}

/** The documents published to the page named by `key`. */
export const onPage = <T,>(docs: T[], key: string | null | undefined): T[] =>
  docs.filter((doc) => appliesTo(doc, key));

/** The documents published to the page at `path`. */
export const onPath = <T,>(docs: T[], path: string | null | undefined): T[] =>
  onPage(docs, placementKeyFor(path));
