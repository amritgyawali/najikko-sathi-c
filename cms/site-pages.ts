import type { Payload, RequiredDataFromCollectionSlug } from "payload";

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
 * Both the button on the dashboard (cms/endpoints/site-pages.ts) and
 * `npm run sync:pages` call this.
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

/** The built-in pages that already have a document, by address. */
async function existingByPath(payload: Payload): Promise<Map<string, string | number>> {
  const found = await payload.find({
    collection: "pages",
    where: { kind: { equals: "route" } },
    limit: 200,
    depth: 0,
    pagination: false,
    overrideAccess: true,
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
export async function importRoutePages(payload: Payload, paths?: string[]): Promise<SyncReport> {
  const report = emptyReport();
  const existing = await existingByPath(payload);
  const wanted = paths?.length
    ? routePages.filter((page) => paths.includes(page.path))
    : routePages;

  for (const page of wanted) {
    if (existing.has(page.path)) {
      report.alreadyThere.push(page.path);
      continue;
    }
    try {
      await payload.create({ collection: "pages", data: documentFor(page), overrideAccess: true });
      report.imported.push(page.path);
    } catch (error) {
      report.failed.push({ path: page.path, reason: error instanceof Error ? error.message : String(error) });
    }
  }

  return report;
}

/**
 * Puts a built-in page back to the copy it ships with, by deleting the document
 * that overrides it. The page keeps working: it simply renders from
 * lib/page-defaults.ts again.
 */
export async function restoreRoutePages(payload: Payload, paths: string[]): Promise<SyncReport> {
  const report = emptyReport();
  const existing = await existingByPath(payload);

  for (const path of paths) {
    const id = existing.get(path);
    if (!id) {
      report.alreadyThere.push(path);
      continue;
    }
    try {
      await payload.delete({ collection: "pages", id, overrideAccess: true });
      report.restored.push(path);
    } catch (error) {
      report.failed.push({ path, reason: error instanceof Error ? error.message : String(error) });
    }
  }

  return report;
}
