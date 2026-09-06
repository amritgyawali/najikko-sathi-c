import { cache } from "react";

import type { Page } from "@/payload-types";
import { getCollection } from "@/lib/content";
import { routePageContent, type PageSection } from "@/lib/page-defaults";
import { sitePageByPath } from "@/lib/site-map";

/**
 * What the website should show at a given address.
 *
 * One page can come from either of two places, and this is where they meet:
 *
 * - the document in Content → Pages, once the page has been imported into the
 *   dashboard or created there, which is what an editor changes;
 * - the copy the page ships with, in lib/page-defaults.ts, for a built-in page
 *   nobody has imported yet.
 *
 * A built-in page whose document has been set back to Draft is treated as taken
 * off the website: the address stops answering, and the menu and sitemap drop
 * it. Deleting the document instead brings back the copy the page shipped with.
 */

export type ResolvedPage = {
  path: string;
  /** The page's name, used in breadcrumbs and in the menu. */
  title: string;
  summary: string;
  sections: PageSection[];
  seo: { title: string; description: string };
  noindex: boolean;
  /** True once an editor has taken the page off the website. */
  hidden: boolean;
  /** The document behind the page, when there is one. */
  doc: Page | null;
  /** Is this one of the pages the website ships with? */
  builtIn: boolean;
};

/**
 * The page document saved at an address, published or not.
 *
 * A page saved before addresses were stored has only its slug, so the slug is
 * tried as well; saving that page once fills the address in.
 */
const findPageDoc = cache(async (path: string): Promise<Page | null> => {
  const docs = await getCollection("pages", {
    where: {
      or: [{ path: { equals: path } }, { and: [{ path: { exists: false } }, { slug: { equals: path.replace(/^\//, "") } }] }],
    },
    limit: 1,
  });
  return docs[0] ?? null;
});

const cleanSeo = (seo: Page["seo"]): { title?: string; description?: string } => ({
  title: typeof seo?.title === "string" && seo.title.trim() ? seo.title : undefined,
  description:
    typeof seo?.description === "string" && seo.description.trim() ? seo.description : undefined,
});

/**
 * Resolves one address. Returns null when nothing answers there, so the caller
 * can show its 404 page.
 */
export const getPageAt = cache(async (path: string): Promise<ResolvedPage | null> => {
  const builtIn = routePageContent[path];
  const known = sitePageByPath[path];
  const doc = await findPageDoc(path);

  if (!doc && !builtIn) return null;

  const seoDefaults = builtIn?.seo ?? { title: doc?.title ?? "", description: doc?.summary ?? "" };
  const overrides = cleanSeo(doc?.seo);

  return {
    path,
    title: doc?.title || known?.label || path,
    summary: doc?.summary || known?.summary || "",
    // An imported page carries its own sections; a page that has never been
    // imported still has the ones it shipped with.
    sections: (doc?.layout as PageSection[] | undefined) ?? builtIn?.sections ?? [],
    seo: {
      title: overrides.title ?? seoDefaults.title,
      description: overrides.description ?? seoDefaults.description,
    },
    // Once a page is in the dashboard its own tick decides, and the import
    // copies the shipped answer across so nothing changes by being imported.
    // A page saved before the tick existed has nothing stored and keeps the
    // answer it shipped with.
    noindex: doc?.seo?.noindex ?? builtIn?.noindex ?? false,
    hidden: Boolean(doc && doc.status !== "published"),
    doc: doc ?? null,
    builtIn: Boolean(builtIn),
  };
});

/**
 * Pages that ask search engines to leave them alone. The sitemap reads this so
 * it never advertises a page whose own setting says not to.
 */
export const getNoIndexPaths = cache(async (): Promise<string[]> => {
  const docs = await getCollection("pages", { limit: 200, depth: 0 });
  const byPath = new Map(docs.filter((doc) => doc.path).map((doc) => [doc.path as string, doc]));
  const paths = new Set<string>();

  for (const [path, content] of Object.entries(routePageContent)) {
    const doc = byPath.get(path);
    if (doc?.seo?.noindex ?? content.noindex) paths.add(path);
  }
  for (const [path, doc] of byPath) if (doc.seo?.noindex) paths.add(path);

  return [...paths];
});
