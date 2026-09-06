import Link from "next/link";
import type { Payload } from "payload";
import React from "react";

import {
  navItemsFromPages,
  resolveNavItems,
  sitePages,
  type AdminLink,
  type NavItem,
} from "@/lib/site-map";
import { routePageByPath, routePages } from "../site-pages";
import { ImportPagesButton } from "./ImportPagesButton";

/**
 * "Website pages" - the panel under the traffic overview on the dashboard home.
 *
 * It is the list of every page this website has, and what can be done to each
 * one: open it, edit it, add it to the dashboard, or build a new page beside it.
 *
 * Three sources are folded into one list, and none of them is a copy kept in
 * step by hand:
 *
 * - the pages the site ships with (cms/site-pages.ts), whose addresses are
 *   fixed by the routes that serve them;
 * - the pages created in Content → Pages, which go live at their own address;
 * - the menu, resolved on every load with `resolveNavItems` - the same function
 *   the public header calls, from the same two sources - so reordering the menu
 *   or publishing a page shows here on the next load.
 *
 * A built-in page that has been added to the dashboard is edited like any
 * other; one that has not shows an "Add" button, and until then renders the
 * copy it ships with.
 */

type Props = { payload?: Payload };

/** A page document, as much of it as this panel needs. */
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
};

/** Everything the panel needs to draw one row. */
type Row = {
  label: string;
  /** The public address, or null for a menu link with no page behind it. */
  href: string | null;
  summary: string;
  /** The document behind the page, once it is in the dashboard. */
  doc?: PageDoc;
  /** Is this one of the pages the site ships with? */
  builtIn: boolean;
  /** The other places this page's content is written. */
  edit: AdminLink[];
  /** Pages that sit under this one in the menu. */
  children: Row[];
  /** A menu link with nothing behind it: an editor needs to know. */
  unknown?: boolean;
  /** An anchor or an address on another website, not a page of ours. */
  external?: boolean;
};

const isExternal = (href: string) => !href.startsWith("/");

const shortDate = (value?: string | null): string =>
  value
    ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
    : "";

/** Build a row for one address, from whichever sources know about it. */
function rowFor(path: string, docs: Map<string, PageDoc>, label?: string): Row {
  const known = routePageByPath[path];
  const doc = docs.get(path);

  return {
    label: doc?.title || label || known?.label || path,
    href: path,
    summary:
      doc?.summary ||
      known?.summary ||
      (doc ? "Built from sections in the dashboard." : "No page answers this address."),
    doc,
    builtIn: Boolean(known),
    edit: known?.edit ?? [],
    children: [],
  };
}

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

/** Open, edit, or add - whichever apply to this row. */
function Actions({ row }: { row: Row }) {
  const removed = row.doc && row.doc.status !== "published";

  return (
    <span className="ns-page__actions">
      {row.doc ? (
        <Link className="ns-page__action ns-page__action--go" href={`/admin/collections/pages/${row.doc.id}`}>
          Edit this page
        </Link>
      ) : row.builtIn && row.href ? (
        <ImportPagesButton paths={[row.href]} label="Add to dashboard" busyLabel="Adding…" />
      ) : null}
      {row.href && !row.external ? (
        <a className="ns-page__action" href={row.href} target="_blank" rel="noreferrer">
          Open page
        </a>
      ) : null}
      {removed ? <span className="ns-page__flag">Taken off the website</span> : null}
      {row.doc?.updatedAt ? (
        <span className="ns-page__stamp">Changed {shortDate(row.doc.updatedAt)}</span>
      ) : row.builtIn && !row.doc ? (
        <span className="ns-page__stamp">Not in the dashboard yet</span>
      ) : null}
    </span>
  );
}

function PageRow({ row, depth = 0 }: { row: Row; depth?: number }) {
  return (
    <>
      <li
        className={`ns-page${depth > 0 ? " ns-page--child" : ""}${row.unknown ? " ns-page--broken" : ""}`}
      >
        <div className="ns-page__head">
          <span className="ns-page__name">{row.label}</span>
          {row.href ? (
            row.external ? (
              <span className="ns-page__path">{row.href}</span>
            ) : (
              <a className="ns-page__path" href={row.href} target="_blank" rel="noreferrer">
                {row.href}
              </a>
            )
          ) : null}
        </div>
        {row.summary ? <p className="ns-page__summary">{row.summary}</p> : null}
        <Actions row={row} />
        <EditLinks links={row.edit} />
      </li>
      {row.children.map((child) => (
        <PageRow depth={depth + 1} key={child.href ?? child.label} row={child} />
      ))}
    </>
  );
}

/** Routes generated from CMS content rather than from a page of their own. */
const generated = sitePages.filter((page) => page.dynamic);

export async function SitePages({ payload }: Props) {
  if (!payload) return null;

  let docs: PageDoc[] = [];
  let saved: NavItem[] | undefined;

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
  } catch {
    // Before the database is migrated there is nothing to read. Fall through
    // with the pages the site ships with, and the menu it ships with.
  }

  const byPath = new Map<string, PageDoc>();
  for (const doc of docs) {
    const path = doc.path || (doc.slug ? `/${doc.slug}` : null);
    if (path) byPath.set(path, doc);
  }

  // Exactly what the public header shows, resolved the same way.
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

  const menuRows: Row[] = menu.map((item) => {
    if (isExternal(item.href)) {
      return {
        label: item.label,
        href: item.href,
        summary: "Links away from this website.",
        builtIn: false,
        edit: [],
        children: [],
        external: true,
      };
    }

    const row = rowFor(item.href, byPath, item.label);
    if (!row.doc && !row.builtIn) {
      return {
        ...row,
        unknown: true,
        summary: "No page answers this address. Fix the link, or publish a page at this address.",
        edit: [{ label: "Navigation", href: "/admin/globals/navigation" }],
      };
    }

    // The pages that sit under this menu item without a link of their own.
    row.children = routePages
      .filter((page) => page.parent === item.href && !inMenu.has(page.path))
      .map((page) => rowFor(page.path, byPath));
    return row;
  });

  const covered = new Set([
    ...menuRows.map((row) => row.href),
    ...menuRows.flatMap((row) => row.children.map((child) => child.href)),
  ]);

  // Everything else: built-in pages that are not in the menu, and pages created
  // in the dashboard that nobody has linked yet.
  const otherRows: Row[] = [
    ...routePages.filter((page) => !covered.has(page.path)).map((page) => rowFor(page.path, byPath)),
    ...[...byPath.entries()]
      .filter(([path, doc]) => doc.kind !== "route" && !covered.has(path))
      .map(([path]) => rowFor(path, byPath)),
  ];

  const missing = routePages.filter((page) => !byPath.has(page.path));
  const removed = hidden.length;

  return (
    <section className="ns-pages">
      <div className="ns-panel__head">
        <h3 className="ns-panel__title">Website pages</h3>
        <span className="ns-panel__meta">
          {`${routePages.length + docs.filter((doc) => doc.kind !== "route").length} pages`}
          {removed > 0 ? ` · ${removed} taken off the website` : ""}
          {missing.length > 0 ? ` · ${missing.length} not in the dashboard yet` : ""}
        </span>
      </div>

      <div className="ns-pages__bar">
        <Link className="ns-page__action ns-page__action--go" href="/admin/collections/pages/create">
          Build a new page
        </Link>
        <Link className="ns-page__action" href="/admin/collections/pages">
          All pages
        </Link>
        {missing.length > 0 ? <ImportPagesButton /> : null}
        <span className="ns-pages__barnote">
          {missing.length > 0
            ? "Adding a page copies what it already says into the dashboard, where every word of it can be changed. The website looks the same until you change something."
            : "Every page is in the dashboard. Editing one changes the website; deleting one puts it back to the copy it shipped with."}
        </span>
      </div>

      <ul className="ns-pages__list">
        {menuRows.map((row) => (
          <PageRow key={row.href ?? row.label} row={row} />
        ))}
      </ul>

      {otherRows.length > 0 ? (
        <>
          <h4 className="ns-pages__subtitle">Not in the menu</h4>
          <ul className="ns-pages__list">
            {otherRows.map((row) => (
              <PageRow key={row.href ?? row.label} row={row} />
            ))}
          </ul>
        </>
      ) : null}

      <div className="ns-pages__foot">
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
        The menu itself is set in <Link href="/admin/globals/navigation">Site → Navigation</Link>. A page
        with &ldquo;show in navigation&rdquo; ticked adds itself to the menu, and setting a page back to
        Draft takes it off the website altogether.
      </p>
    </section>
  );
}
