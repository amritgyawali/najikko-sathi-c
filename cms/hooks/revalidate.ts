import { revalidatePath } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
  GlobalAfterChangeHook,
} from "payload";

import { placementPath } from "../../lib/placements";

/**
 * Keeps the public site in step with the dashboard.
 *
 * Pages are prerendered, so without this a saved change would sit in the
 * database and never reach a visitor until the next deploy. Payload's REST
 * routes are Next route handlers, so revalidatePath here purges the cached
 * render straight away and the next request rebuilds it.
 */

/**
 * revalidatePath only works inside a Next request. Scripts that use the local
 * API - the seed, a migration, a cron job - have no such context, and there is
 * nothing cached to purge there anyway, so those calls are skipped quietly.
 */
const outsideNextRequest = (error: unknown): boolean =>
  error instanceof Error && error.message.includes("static generation store");

const purge = (paths: string[]) => {
  // One service appears on the homepage, the services index, its own page and
  // the category pages, and a purge scoped to a single page does not clear the
  // fully prerendered routes. Purging the root layout clears everything under
  // it, which is the only way to guarantee an edit shows up everywhere. The
  // site is small, so rebuilding a page on next request costs little.
  const targets = ["/", ...paths];

  for (const path of targets) {
    try {
      revalidatePath(path, path === "/" ? "layout" : "page");
    } catch (error) {
      if (outsideNextRequest(error)) return;
      // A failed purge must never fail the editor's save.
      console.error(`[revalidate] could not purge ${path}:`, error);
    }
  }
};

/**
 * Globals - navigation, theme, footer, company details, announcements - appear
 * on every page, so the whole layout is purged.
 */
export const revalidateSite: GlobalAfterChangeHook = ({ doc }) => {
  purge([]);
  return doc;
};

/**
 * The pages a document has been published to, as addresses.
 *
 * Moving a post from one page to another has to clear both, so the version
 * before the save is read as well as the one after it.
 */
const placedPaths = (...docs: unknown[]): string[] => {
  const paths = new Set<string>();
  for (const doc of docs) {
    const chosen = (doc as { placements?: unknown } | null | undefined)?.placements;
    if (!Array.isArray(chosen)) continue;
    for (const key of chosen) {
      const path = typeof key === "string" ? placementPath[key] : undefined;
      if (path) paths.add(path);
    }
  }
  return [...paths];
};

/**
 * Collections purge their own URL plus the pages that list them. `prefix` is
 * the public route the collection renders under, e.g. "/posts"; pass "" for
 * documents that live at the site root.
 *
 * The pages named in "Where this appears" are purged too, so ticking a page
 * shows the content there on the next request.
 */
export const revalidateDoc = (
  prefix: string,
  extraPaths: string[] = [],
): CollectionAfterChangeHook => {
  return ({ doc, previousDoc }) => {
    const slugs = new Set<string>();
    // Renaming a slug has to clear the old URL as well as the new one.
    for (const candidate of [doc, previousDoc]) {
      const slug = (candidate as { slug?: unknown } | undefined)?.slug;
      if (typeof slug === "string" && slug) slugs.add(slug);
    }
    purge([
      ...[...slugs].map((slug) => `${prefix}/${slug}`),
      ...extraPaths,
      ...placedPaths(doc, previousDoc),
    ]);
    return doc;
  };
};

export const revalidateDocAfterDelete = (
  prefix: string,
  extraPaths: string[] = [],
): CollectionAfterDeleteHook => {
  return ({ doc }) => {
    const slug = (doc as { slug?: unknown } | undefined)?.slug;
    purge([
      ...(typeof slug === "string" && slug ? [`${prefix}/${slug}`] : []),
      ...extraPaths,
      ...placedPaths(doc),
    ]);
    return doc;
  };
};
