import type { Payload, PayloadRequest, RequiredDataFromCollectionSlug } from "payload";

import { routePageContent } from "../lib/page-defaults";
import { sitePages, type SitePage } from "../lib/site-map";

/**
 * Turning the website's own pages into documents an editor can change.
 *
 * The site ships with a set of pages whose addresses are fixed by the code that
 * serves them - Home, Services, Our Work, Contact, About, and the discipline
 * pages. Importing one here creates an ordinary Page document holding exactly
 * the copy that page already shows (lib/page-defaults.ts), after which every
 * word, every section and their order can be edited in the dashboard.
 *
 * Deleting that document again restores the copy the page shipped with, so an
 * import is never destructive and never one-way.
 *
 * The button on the dashboard (cms/endpoints/site-pages.ts), `npm run
 * sync:pages`, the seed, and the migration that put the pages there in the
 * first place all call this, so there is one definition of what importing a
 * page means.
 */

/** A built-in page: one with a fixed address and copy that ships with it. */
export type RoutePage = SitePage & { slug: string };

/** The address a built-in page is served at, as a slug for its document. */
const slugFor = (path: string): string => (path === "/" ? "home" : path.replace(/^\//, ""));

/**
 * Every built-in page, in menu order. Routes generated from other content
 * (/services/[slug] and the like) are not pages in their own right and are left
 * out.
 */
export const routePages: RoutePage[] = sitePages
  .filter((page) => !page.dynamic && page.path in routePageContent)
  .map((page) => ({ ...page, slug: slugFor(page.path) }));

export const routePageByPath: Record<string, RoutePage> = Object.fromEntries(
  routePages.map((page) => [page.path, page]),
);

/** The document a built-in page becomes when it is imported. */
export const documentFor = (page: RoutePage): RequiredDataFromCollectionSlug<"pages"> => {
  const content = routePageContent[page.path];
  return {
    title: page.label,
    summary: page.summary,
    kind: "route",
    path: page.path,
    slug: page.slug,
    status: "published",
    showInNav: typeof page.navOrder === "number",
    navOrder: page.navOrder ?? null,
    parent: page.parent ?? null,
    layout: content.sections,
    seo: {
      title: content.seo.title,
      description: content.seo.description,
      noindex: content.noindex ?? false,
    },
  };
};

export type SyncReport = {
  imported: string[];
  alreadyThere: string[];
  restored: string[];
  failed: { path: string; reason: string }[];
};

const emptyReport = (): SyncReport => ({ imported: [], alreadyThere: [], restored: [], failed: [] });

/**
 * The built-in pages that already have a document, by address.
 *
 * `req` carries the caller's database transaction when there is one. A
 * migration has to pass its own, or its reads and writes would queue behind the
 * transaction it is already inside.
 */
async function existingByPath(
  payload: Payload,
  req?: PayloadRequest,
): Promise<Map<string, string | number>> {
  const found = await payload.find({
    collection: "pages",
    where: { kind: { equals: "route" } },
    limit: 200,
    depth: 0,
    pagination: false,
    overrideAccess: true,
    ...(req ? { req } : {}),
  });

  return new Map(
    (found.docs as { id: string | number; path?: string | null }[])
      .filter((doc) => doc.path)
      .map((doc) => [doc.path as string, doc.id]),
  );
}

/**
 * Creates a document for every built-in page that does not have one yet.
 * Pass `paths` to import only some of them.
 */
export async function importRoutePages(
  payload: Payload,
  paths?: string[],
  req?: PayloadRequest,
): Promise<SyncReport> {
  const report = emptyReport();
  const existing = await existingByPath(payload, req);
  const wanted = paths?.length
    ? routePages.filter((page) => paths.includes(page.path))
    : routePages;

  for (const page of wanted) {
    if (existing.has(page.path)) {
      report.alreadyThere.push(page.path);
      continue;
    }
    try {
      await payload.create({
        collection: "pages",
        data: documentFor(page),
        overrideAccess: true,
        ...(req ? { req } : {}),
      });
      report.imported.push(page.path);
    } catch (error) {
      report.failed.push({ path: page.path, reason: error instanceof Error ? error.message : String(error) });
    }
  }

  return report;
}

/**
 * A read that failed because the database is younger than the config.
 *
 * A migration using the local API queries every table the *current* config
 * knows about - including the ones a later migration has yet to create - so on
 * an empty database, running the chain from the beginning, that read fails
 * until the schema has caught up.
 *
 * Every migration that reads a page through the local API has to allow for
 * this, not just the import below: adding one section to the page builder adds
 * a table to that query, and every earlier migration then reads a table that
 * does not exist yet. That is what `readPageBySchemaAware` is for.
 */
export const schemaBehindConfig = (error: unknown): boolean =>
  error instanceof Error && /relation "[^"]+" does not exist/i.test(`${error.message} ${String((error as { cause?: unknown }).cause ?? "")}`);

/**
 * Imports the built-in pages, and says nothing if the database is not ready for
 * it yet.
 *
 * Every migration that adds a section to a page must call this, because it is
 * the newest such migration that ends up doing the import on a database being
 * built from scratch - by which time every table its query touches exists. On a
 * database that is already up to date, this reports the pages are there and
 * changes nothing.
 */
export async function ensureRoutePagesImported(
  payload: Payload,
  req?: PayloadRequest,
): Promise<SyncReport | null> {
  try {
    return await importRoutePages(payload, undefined, req);
  } catch (error) {
    if (!schemaBehindConfig(error)) throw error;
    payload.logger.info(
      "[pages] the database has not caught up with the sections yet; a later migration adds them.",
    );
    return null;
  }
}

/**
 * Finds one page by its address, or null when the database is not ready to be
 * asked yet.
 *
 * A migration that edits a page has to survive being run on an empty database,
 * where the tables for sections added after it do not exist. There is nothing
 * for it to edit in that case - the page has not been imported yet - and the
 * migration that does the import ships the section with it, so answering null
 * is both correct and the only thing that can be done.
 */
export async function findPageByPath(
  payload: Payload,
  path: string,
  req?: PayloadRequest,
): Promise<{ id: string | number; layout: unknown } | null> {
  try {
    const found = await payload.find({
      collection: "pages",
      where: { path: { equals: path } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
      ...(req ? { req } : {}),
    });
    const doc = found.docs[0] as { id: string | number; layout?: unknown } | undefined;
    return doc ? { id: doc.id, layout: doc.layout } : null;
  } catch (error) {
    if (!schemaBehindConfig(error)) throw error;
    payload.logger.info(
      `[pages] ${path} cannot be read until the schema catches up; a later migration imports it.`,
    );
    return null;
  }
}

/**
 * Puts a built-in page back to the copy it ships with, by deleting the document
 * that overrides it. The page keeps working: it simply renders from
 * lib/page-defaults.ts again.
 */
export async function restoreRoutePages(
  payload: Payload,
  paths: string[],
  req?: PayloadRequest,
): Promise<SyncReport> {
  const report = emptyReport();

  // Rolling a migration back tears the section tables down in the reverse
  // order they were created, so by the time an early migration's `down` asks
  // for a page, the tables the current config expects may already be gone.
  // There is nothing left to restore in that case, and saying so beats
  // failing the rollback.
  let existing: Map<string, string | number>;
  try {
    existing = await existingByPath(payload, req);
  } catch (error) {
    if (!schemaBehindConfig(error)) throw error;
    payload.logger.info("[pages] the section tables are already gone; nothing left to restore.");
    return report;
  }

  for (const path of paths) {
    const id = existing.get(path);
    if (!id) {
      report.alreadyThere.push(path);
      continue;
    }
    try {
      await payload.delete({
        collection: "pages",
        id,
        overrideAccess: true,
        ...(req ? { req } : {}),
      });
      report.restored.push(path);
    } catch (error) {
      report.failed.push({ path, reason: error instanceof Error ? error.message : String(error) });
    }
  }

  return report;
}
