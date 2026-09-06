import type { MetadataRoute } from "next";

import { getCollection, getNavigation, liveWhere } from "@/lib/content";
import { getServiceViews } from "@/lib/services";
import { absoluteUrl } from "./_lib/seo";

// Generated per request so newly published content appears immediately.
export const dynamic = "force-dynamic";

/**
 * Built from what is actually published, so a page, post or service added in
 * the dashboard appears in the sitemap without a code change.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [nav, services, posts, pages, offers] = await Promise.all([
    getNavigation(),
    getServiceViews(),
    getCollection("posts", { where: liveWhere(), limit: 500, depth: 0 }),
    getCollection("pages", { where: { status: { equals: "published" } }, limit: 500, depth: 0 }),
    getCollection("offers", { where: liveWhere(), limit: 1, depth: 0 }),
  ]);

  const entries = new Map<string, MetadataRoute.Sitemap[number]>();
  const add = (path: string, lastModified?: string | null) => {
    const url = absoluteUrl(path);
    if (entries.has(url)) return;
    entries.set(url, { url, ...(lastModified ? { lastModified: new Date(lastModified) } : {}) });
  };

  // Always published. /search is deliberately absent: it is noindex, and a
  // sitemap should only advertise pages we want indexed.
  for (const path of ["/", "/services"]) add(path);
  // The listing pages only earn a place once they have something on them.
  if (posts.length > 0) add("/posts");
  if (offers.length > 0) add("/offers");

  // Menu items, plus the pages a menu item stands for without linking to them
  // directly, so shortening the navbar never drops a page from the sitemap.
  // The two listing pages are covered by a menu item so the header highlights
  // it while a visitor is reading one, but they earn their sitemap entry above
  // only once they have something on them - a cover must not override that.
  const listings = new Set(["/posts", "/offers"]);
  for (const item of nav.items) {
    for (const href of [item.href, ...(item.covers ?? [])]) {
      if (href.startsWith("/") && !listings.has(href)) add(href);
    }
  }
  for (const service of services) add(`/services/${service.slug}`);
  for (const post of posts) if (post.slug) add(`/posts/${post.slug}`, post.updatedAt);
  for (const page of pages) if (page.slug) add(`/${page.slug}`, page.updatedAt);

  return [...entries.values()];
}
