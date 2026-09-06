import Link from "next/link";
import type { Payload } from "payload";
import React from "react";

import {
  navItemsFromPages,
  resolveNavItems,
  sitePageByPath,
  sitePages,
  type AdminLink,
  type NavItem,
} from "@/lib/site-map";

/**
 * "Website pages" - the panel under the traffic overview on the dashboard home.
 *
 * It answers the question an editor actually has when they open the dashboard:
 * *the site has these pages, so where do I change this one?*
 *
 * The menu it lists is not a copy. It is resolved on every load with
 * `resolveNavItems`, the same function the public header calls, from the same
 * two sources: the links saved in Site → Navigation and the pages published
 * with "show in navigation" ticked. Reorder the menu, rename a link, or publish
 * a new page, and this panel shows it on the next dashboard load - there is
 * nothing here to keep in step by hand.
 *
 * The "where to edit it" links come from lib/site-map.ts, the one list of the
 * site's pages, which `npm run check:pages` verifies against the routes on disk.
 */

type Props = { payload?: Payload };

/** A page in the menu, with everything the panel needs to draw its row. */
type Row = {
  label: string;
  href: string;
  /** Prose describing the page, when we know which page it is. */
  summary?: string;
  /** Where in the dashboard the page's content is written. */
  edit: AdminLink[];
  /** Pages that sit under this menu item without a link of their own. */
  children: Row[];
  /** A menu link with nothing behind it: an editor needs to know. */
  unknown?: boolean;
  /** An anchor or an address on another website, not a page of ours. */
  external?: boolean;
};

const isExternal = (href: string) => !href.startsWith("/");

/** Build the row for one path, from the registry or from a dashboard page. */
function rowFor(item: NavItem, cmsPages: Map<string, { id: string | number; title: string }>): Row {
  const base = { label: item.label, href: item.href, children: [] as Row[] };

  if (isExternal(item.href)) {
    return { ...base, edit: [], external: true, summary: "Links away from the page structure." };
  }

  const known = sitePageByPath[item.href];
  if (known) {
    return {
      ...base,
      summary: known.summary,
      edit: known.edit,
      children: sitePages
        .filter((page) => page.parent === known.path)
        .map((page) => ({
          label: page.label,
          href: page.path,
          summary: page.summary,
          edit: page.edit,
          children: [],
        })),
    };
  }

  // A page built in Content → Pages: it is edited in its own document.
  const doc = cmsPages.get(item.href);
  if (doc) {
    return {
      ...base,
      summary: "Built from layout blocks in the dashboard.",
      edit: [{ label: "Pages", href: `/admin/collections/pages/${doc.id}`, note: doc.title }],
    };
  }

  return {
    ...base,
    unknown: true,
    summary: "No page answers this address. Fix the link, or publish a page at this address.",
    edit: [{ label: "Navigation", href: "/admin/globals/navigation" }],
  };
}

/** The pages that are not in the menu and do not sit under a menu item. */
const unlisted = sitePages.filter((page) => !page.dynamic && !page.navOrder && !page.parent);

/** Routes generated from CMS content rather than from a page of their own. */
const generated = sitePages.filter((page) => page.dynamic);

function EditLinks({ links }: { links: AdminLink[] }) {
  if (links.length === 0) return null;
  return (
    <span className="ns-page__edits">
      {links.map((link) => (
        <Link className="ns-page__edit" href={link.href} key={`${link.label}-${link.href}`}>
          {link.label}
          {link.note ? <span className="ns-page__note"> · {link.note}</span> : null}
        </Link>
      ))}
    </span>
  );
}

function PageRow({ row, depth = 0 }: { row: Row; depth?: number }) {
  return (
    <>
      <li className={`ns-page${depth > 0 ? " ns-page--child" : ""}${row.unknown ? " ns-page--broken" : ""}`}>
        <div className="ns-page__head">
          <span className="ns-page__name">{row.label}</span>
          {row.external ? (
            <span className="ns-page__path">{row.href}</span>
          ) : (
            <a className="ns-page__path" href={row.href} target="_blank" rel="noreferrer">
              {row.href}
            </a>
          )}
        </div>
        {row.summary ? <p className="ns-page__summary">{row.summary}</p> : null}
        <EditLinks links={row.edit} />
      </li>
      {row.children.map((child) => (
        <PageRow depth={depth + 1} key={child.href} row={child} />
      ))}
    </>
  );
}

export async function SitePages({ payload }: Props) {
  if (!payload) return null;

  // Exactly what the public header reads, resolved the same way.
  let saved: NavItem[] | undefined;
  // Every published page, so a menu link that points at one can offer a link
  // straight to that document.
  let cmsPages = new Map<string, { id: string | number; title: string }>();
  // Only the pages the header itself appends: published, and ticked for the menu.
  let navPages: NavItem[] = [];

  try {
    const nav = (await payload.findGlobal({ slug: "navigation", depth: 0, overrideAccess: true })) as {
      items?: { label?: string | null; href?: string | null; newTab?: boolean | null }[] | null;
    };
    saved = (nav.items ?? [])
      .filter((item): item is { label: string; href: string; newTab?: boolean | null } =>
        Boolean(item.label && item.href),
      )
      .map((item) => ({ label: item.label, href: item.href, newTab: item.newTab ?? false }));

    const published = await payload.find({
      collection: "pages",
      where: { status: { equals: "published" } },
      limit: 200,
      depth: 0,
      sort: "title",
      overrideAccess: true,
    });
    const docs = (
      published.docs as {
        id: string | number;
        title: string;
        slug?: string | null;
        showInNav?: boolean | null;
      }[]
    ).filter((page) => page.slug);

    cmsPages = new Map(docs.map((page) => [`/${page.slug}`, { id: page.id, title: page.title }]));
    // The same rule the header applies, from the same place.
    navPages = navItemsFromPages(docs);
  } catch {
    // Before the database is migrated there is no menu to read. Fall through
    // with nothing saved, which resolves to the site's built-in menu.
  }

  const items = resolveNavItems(saved, navPages);
  const rows = items.map((item) => rowFor(item, cmsPages));
  const broken = rows.filter((row) => row.unknown).length;

  return (
    <section className="ns-pages">
      <div className="ns-panel__head">
        <h3 className="ns-panel__title">Website pages</h3>
        <span className="ns-panel__meta">
          {broken > 0
            ? `${broken} menu ${broken === 1 ? "link has" : "links have"} no page behind ${broken === 1 ? "it" : "them"}`
            : "In navbar order, as visitors see them"}
        </span>
      </div>

      <ul className="ns-pages__list">
        {rows.map((row) => (
          <PageRow key={row.href} row={row} />
        ))}
      </ul>

      <div className="ns-pages__foot">
        <div>
          <h4 className="ns-pages__subtitle">Not in the menu</h4>
          <ul className="ns-pages__minor">
            {unlisted.map((page) => (
              <li key={page.path}>
                <a href={page.path} target="_blank" rel="noreferrer">
                  {page.label}
                </a>{" "}
                <span className="ns-page__path">{page.path}</span>
                <EditLinks links={page.edit} />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="ns-pages__subtitle">Made from dashboard content</h4>
          <ul className="ns-pages__minor">
            {generated.map((page) => (
              <li key={page.path}>
                <span className="ns-page__name">{page.label}</span>{" "}
                <span className="ns-page__path">{page.path}</span>
                <EditLinks links={page.edit} />
              </li>
            ))}
          </ul>
        </div>
      </div>

      <p className="ns-pages__hint">
        The menu itself is set in <Link href="/admin/globals/navigation">Site → Navigation</Link>. Tick
        &ldquo;show in navigation&rdquo; on a published page to add it here without editing the menu.
      </p>
    </section>
  );
}
