import Link from "next/link";
import type { Payload } from "payload";
import React from "react";

import { slotFilm, slotPhoto } from "@/lib/page-media";
import {
  navItemsFromPages,
  resolveNavItems,
  sitePages,
  type AdminLink,
  type NavItem,
} from "@/lib/site-map";
import type { MediaSlot } from "@/payload-types";
import { routePageByPath, routePages } from "../../site-pages";
import { ImportPagesButton } from "../ImportPagesButton";
import { PageList, type PageChange, type PageRow } from "./PageList";
import { Empty, Panel } from "./ui";

/**
 * Page studio - every page of the website, and every change that can be made to
 * one, in a single place.
 *
 * An owner does not arrive asking "what pages are there". They arrive saying "I
 * want to change something on the About page". So each page carries its whole
 * state - is it live, how many people read it last month, does it have a
 * picture, will it look right when it is shared - and every place that page's
 * words are written is one click away, folded behind a single line until asked
 * for.
 *
 * This half is the reading: the list is folded together from the pages the site
 * ships with (cms/site-pages.ts), the pages invented in the dashboard, and the
 * menu resolved exactly the way the public header resolves it - so publishing a
 * page or reordering the menu shows here on the next load, with nothing to keep
 * in step by hand. The drawing, the search box and the filters are PageList,
 * which is the only part of this that runs in the browser.
 */

type Props = {
  payload?: Payload;
  /** Visits per address over the last thirty days. */
  views?: Record<string, number>;
};

type PageDoc = {
  id: string | number;
  title: string;
  slug?: string | null;
  path?: string | null;
  kind?: "route" | "custom" | null;
  status?: "draft" | "published" | null;
  summary?: string | null;
  showInNav?: boolean | null;
  navOrder?: number | null;
  updatedAt?: string | null;
  layout?: unknown[] | null;
  seo?: { title?: string | null; description?: string | null; image?: unknown; noindex?: boolean | null } | null;
};

const isExternal = (href: string) => !href.startsWith("/");

/** The address a built-in page's picture is uploaded against. */
const mediaKeyFor = (path: string): string | undefined =>
  sitePages.find((page) => page.path === path)?.mediaKey;

/**
 * Where this page's words are written, one link per place.
 *
 * Two sources can name the same destination - the site map lists "Page media"
 * for a page that has already been given its picture link - so the same address
 * is only offered once.
 */
const changesFor = (
  row: { docId?: string | number; mediaKey?: string; filled: boolean; href: string | null; external?: boolean },
  extra: AdminLink[],
): PageChange[] => {
  const links: AdminLink[] = [];

  if (row.docId) {
    links.push(
      { label: "All the words", href: `/admin/collections/pages/${row.docId}`, note: "section by section" },
      {
        label: "Search listing",
        href: `/admin/collections/pages/${row.docId}#field-seo`,
        note: "title & description on Google",
      },
    );
  }
  if (row.mediaKey) {
    links.push({
      label: row.filled ? "Photo & film" : "Add a photo",
      href: "/admin/collections/media-slots",
      note: `the "${row.mediaKey}" entry`,
    });
  }
  if (row.href && !row.external) {
    links.push({ label: "Menu position", href: "/admin/globals/navigation", note: "where it sits across the top" });
  }
  links.push(...extra);

  const seen = new Set<string>();
  return links
    .filter((link) => !seen.has(link.href) && seen.add(link.href))
    .map((link) => ({ label: link.label, href: link.href, note: link.note }));
};

/* --------------------------------------------------------------------- panel */

/** Routes built from dashboard content rather than from a page of their own. */
const generated = sitePages.filter((page) => page.dynamic);

export async function PageStudio({ payload, views = {} }: Props) {
  if (!payload) return null;

  let docs: PageDoc[] = [];
  let saved: NavItem[] | undefined;
  let slots = new Map<string, MediaSlot>();

  try {
    const found = await payload.find({
      collection: "pages",
      limit: 200,
      depth: 0,
      sort: "title",
      pagination: false,
      overrideAccess: true,
    });
    docs = found.docs as PageDoc[];

    const nav = (await payload.findGlobal({ slug: "navigation", depth: 0, overrideAccess: true })) as {
      items?: { label?: string | null; href?: string | null; newTab?: boolean | null }[] | null;
    };
    saved = (nav.items ?? [])
      .filter((item): item is { label: string; href: string; newTab?: boolean | null } =>
        Boolean(item.label && item.href),
      )
      .map((item) => ({ label: item.label, href: item.href, newTab: item.newTab ?? false }));

    // Read the same way the website reads it, so "has a photo" here and a photo
    // actually appearing on the page can never disagree.
    const media = await payload.find({
      collection: "media-slots",
      limit: 500,
      depth: 1,
      pagination: false,
      overrideAccess: true,
    });
    slots = new Map((media.docs as MediaSlot[]).filter((slot) => slot.key).map((slot) => [slot.key, slot]));
  } catch {
    // Before the database is migrated there is nothing to read. The pages the
    // site ships with are still worth listing, so carry on with those.
  }

  const byPath = new Map<string, PageDoc>();
  for (const doc of docs) {
    const path = doc.path || (doc.slug ? `/${doc.slug}` : null);
    if (path) byPath.set(path, doc);
  }

  const rowFor = (path: string, label?: string): PageRow => {
    const known = routePageByPath[path];
    const doc = byPath.get(path);
    const mediaKey = mediaKeyFor(path);
    const slot = mediaKey ? slots.get(mediaKey) : undefined;
    const hasPicture = Boolean(slotPhoto(slot, ""));
    const hasFilm = Boolean(slotFilm(slot, ""));

    return {
      key: path,
      label: doc?.title || label || known?.label || path,
      href: path,
      summary:
        doc?.summary ||
        known?.summary ||
        (doc ? "Built from sections in the dashboard." : "No page answers this address."),
      docId: doc?.id,
      live: doc?.status === "published",
      builtIn: Boolean(known),
      views: views[path] ?? 0,
      sections: Array.isArray(doc?.layout) ? doc.layout.length : null,
      described: Boolean(doc?.seo?.description || doc?.summary),
      takesPicture: Boolean(mediaKey),
      hasPicture,
      hasFilm,
      noindex: Boolean(doc?.seo?.noindex),
      updatedAt: doc?.updatedAt ?? null,
      changes: changesFor(
        { docId: doc?.id, mediaKey, filled: hasPicture || hasFilm, href: path },
        known?.edit ?? [],
      ),
      children: [],
    };
  };

  const published = docs.filter((doc) => doc.status === "published");
  const hidden = docs
    .filter((doc) => doc.status !== "published")
    .map((doc) => doc.path)
    .filter((path): path is string => Boolean(path));

  const menu = resolveNavItems(
    saved,
    navItemsFromPages(
      published.map((doc) => ({
        title: doc.title,
        slug: doc.slug,
        path: doc.path,
        navOrder: doc.navOrder,
        showInNav: doc.showInNav,
      })),
    ),
    hidden,
  );

  const inMenu = new Set(menu.map((item) => item.href));

  const menuRows: PageRow[] = menu.map((item) => {
    if (isExternal(item.href)) {
      return {
        key: item.href,
        label: item.label,
        href: item.href,
        summary: "Links away from this website.",
        builtIn: false,
        external: true,
        changes: [],
        children: [],
      };
    }

    const row = rowFor(item.href, item.label);
    if (!row.docId && !row.builtIn) {
      return {
        ...row,
        unknown: true,
        summary: "No page answers this address. Fix the link, or publish a page here.",
        changes: [{ label: "The menu", href: "/admin/globals/navigation", note: "fix or remove this link" }],
      };
    }

    row.children = routePages
      .filter((page) => page.parent === item.href && !inMenu.has(page.path))
      .map((page) => rowFor(page.path));
    return row;
  });

  const covered = new Set([
    ...menuRows.map((row) => row.href),
    ...menuRows.flatMap((row) => row.children.map((child) => child.href)),
  ]);

  const otherRows: PageRow[] = [
    ...routePages.filter((page) => !covered.has(page.path)).map((page) => rowFor(page.path)),
    ...[...byPath.entries()]
      .filter(([path, doc]) => doc.kind !== "route" && !covered.has(path))
      .map(([path]) => rowFor(path)),
  ];

  const missing = routePages.filter((page) => !byPath.has(page.path));
  const broken = menuRows.filter((row) => row.unknown).length;
  const total = routePages.length + docs.filter((doc) => doc.kind !== "route").length;

  return (
    <Panel
      title="Every page on the website"
      icon="page"
      accent={5}
      wide
      meta={
        <>
          {total} pages
          {hidden.length > 0 ? ` · ${hidden.length} off the website` : ""}
          {missing.length > 0 ? ` · ${missing.length} not editable yet` : ""}
          {broken > 0 ? ` · ${broken} broken link${broken === 1 ? "" : "s"}` : ""}
        </>
      }
      actions={
        <>
          <Link className="ns-chip ns-chip--go" href="/admin/collections/pages/create">
            Build a new page
          </Link>
          <Link className="ns-chip" href="/admin/collections/pages">
            All pages
          </Link>
          {missing.length > 0 ? <ImportPagesButton /> : null}
        </>
      }
      intro={
        missing.length > 0
          ? "Making a page editable copies what it already says into the dashboard, where every word of it can be changed. The website looks exactly the same until you change something."
          : "Find a page, see how it is doing, and open the exact place its words are written."
      }
    >
      <PageList other={otherRows} rows={menuRows} />

      <details className="ns-studio__fold">
        <summary>
          Pages built from dashboard content
          <span className="ns-studio__morecount">{generated.length}</span>
        </summary>
        {generated.length === 0 ? (
          <Empty>Nothing on this website is generated from a collection.</Empty>
        ) : (
          <ul className="ns-studio ns-studio--minor">
            {generated.map((page) => (
              <li className="ns-studio__page" key={page.path}>
                <div className="ns-studio__top">
                  <span className="ns-studio__name">{page.label}</span>
                  <span className="ns-studio__path">{page.path}</span>
                </div>
                <span className="ns-studio__changes">
                  {page.edit.map((link, index) => (
                    <Link className="ns-studio__change" href={link.href} key={`${link.href}-${index}`}>
                      {link.label}
                      {link.note ? <em> {link.note}</em> : null}
                    </Link>
                  ))}
                </span>
              </li>
            ))}
          </ul>
        )}
      </details>

      <p className="ns-note">
        The menu itself is set in <Link href="/admin/globals/navigation">Site → Navigation</Link>. A page
        with &ldquo;show in navigation&rdquo; ticked adds itself to the menu, and taking a page off the
        website removes it from the menu and the sitemap as well.
      </p>
    </Panel>
  );
}

export default PageStudio;
