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
import { PublishToggle } from "./Actions";
import { Empty, Icon, Panel, Tag, ago, nf } from "./ui";

/**
 * Page studio - every page of the website, and every change that can be made to
 * one, in a single place.
 *
 * The panel this replaces listed the pages and linked to them. That answered
 * "what pages are there"; it did not answer the question an owner actually
 * arrives with, which is "I want to change something on the About page, where do
 * I go". So each page is now a card carrying its whole state - is it live, how
 * many people read it last month, does it have a picture, will it look right
 * when it is shared - and beside that, one link per thing that can be changed on
 * it. Nothing about a page is more than one click from here.
 *
 * The list itself is not written down anywhere. It is folded together from the
 * pages the site ships with (cms/site-pages.ts), the pages invented in the
 * dashboard, and the menu resolved exactly the way the public header resolves
 * it - so publishing a page or reordering the menu shows here on the next load,
 * with nothing to keep in step by hand.
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

type Row = {
  label: string;
  href: string | null;
  summary: string;
  doc?: PageDoc;
  builtIn: boolean;
  edit: AdminLink[];
  children: Row[];
  /** A menu link with no page behind it. */
  unknown?: boolean;
  /** An address on another website. */
  external?: boolean;
  /** The Page media entry that fills this page's picture band. */
  mediaKey?: string;
  hasPhoto?: boolean;
  hasFilm?: boolean;
  views?: number;
};

const isExternal = (href: string) => !href.startsWith("/");

/** The address a built-in page's picture is uploaded against. */
const mediaKeyFor = (path: string): string | undefined =>
  sitePages.find((page) => page.path === path)?.mediaKey;

/* ------------------------------------------------------------------- a card */

/** Where this page's words are written, one link per place. */
function Changes({ row }: { row: Row }) {
  const links: AdminLink[] = [];

  if (row.doc) {
    links.push(
      { label: "Sections", href: `/admin/collections/pages/${row.doc.id}`, note: "every word, top to bottom" },
      { label: "Search listing", href: `/admin/collections/pages/${row.doc.id}#field-seo`, note: "title & description on Google" },
    );
  }
  if (row.mediaKey) {
    links.push({
      label: row.hasPhoto || row.hasFilm ? "Photo & film" : "Add a photo",
      href: "/admin/collections/media-slots",
      note: `the "${row.mediaKey}" entry`,
    });
  }
  if (row.href && !row.external) {
    links.push({ label: "Menu position", href: "/admin/globals/navigation", note: "where it sits across the top" });
  }
  links.push(...row.edit);

  // Two sources can name the same destination - the site map lists "Page media"
  // for a page that has already been given its picture link above - so the same
  // address is only offered once.
  const seen = new Set<string>();
  const unique = links.filter((link) => !seen.has(link.href) && seen.add(link.href));

  if (unique.length === 0) return null;

  return (
    <span className="ns-studio__changes">
      <span className="ns-studio__changelabel">Change:</span>
      {unique.map((link) => (
        <Link className="ns-studio__change" href={link.href} key={link.href}>
          {link.label}
          {link.note ? <em> {link.note}</em> : null}
        </Link>
      ))}
    </span>
  );
}

/** The three or four things worth knowing about a page before opening it. */
function Facts({ row }: { row: Row }) {
  const seo = row.doc?.seo;
  const described = Boolean(seo?.description || row.doc?.summary);
  const sections = Array.isArray(row.doc?.layout) ? row.doc.layout.length : null;

  return (
    <span className="ns-studio__facts">
      {row.views !== undefined ? (
        <span className="ns-studio__fact" title="Visits in the last thirty days">
          <Icon name="eye" />
          {nf(row.views)} view{row.views === 1 ? "" : "s"}
        </span>
      ) : null}
      {sections !== null ? (
        <span className="ns-studio__fact" title="How many sections this page is built from">
          <Icon name="page" />
          {sections} section{sections === 1 ? "" : "s"}
        </span>
      ) : null}
      {row.mediaKey ? (
        <span
          className={`ns-studio__fact${row.hasPhoto || row.hasFilm ? " is-on" : ""}`}
          title={
            row.hasPhoto || row.hasFilm
              ? "This page carries a picture"
              : "Nothing is drawn on this page until a picture is uploaded"
          }
        >
          <Icon name="image" />
          {row.hasFilm ? "Photo & film" : row.hasPhoto ? "Photo" : "No picture"}
        </span>
      ) : null}
      {row.doc ? (
        <span
          className={`ns-studio__fact${described ? " is-on" : ""}`}
          title="What a search engine shows under the blue link"
        >
          <Icon name="search" />
          {described ? "Described" : "No description"}
        </span>
      ) : null}
      {row.doc?.seo?.noindex ? <Tag tone="warn">Hidden from search</Tag> : null}
      {row.doc?.updatedAt ? (
        <span className="ns-studio__fact ns-studio__fact--quiet">
          <Icon name="clock" />
          {ago(row.doc.updatedAt)}
        </span>
      ) : null}
    </span>
  );
}

function PageCard({ row, depth = 0 }: { row: Row; depth?: number }) {
  const live = row.doc?.status === "published";

  return (
    <>
      <li className={`ns-studio__page${depth > 0 ? " is-child" : ""}${row.unknown ? " is-broken" : ""}`}>
        <div className="ns-studio__top">
          <span className="ns-studio__name">{row.label}</span>
          {row.href ? (
            row.external ? (
              <span className="ns-studio__path">{row.href}</span>
            ) : (
              <a className="ns-studio__path" href={row.href} target="_blank" rel="noreferrer">
                {row.href}
              </a>
            )
          ) : null}
          {row.unknown ? (
            <Tag tone="bad">Broken link</Tag>
          ) : row.doc ? (
            <Tag tone={live ? "good" : "warn"}>{live ? "Live" : "Off the website"}</Tag>
          ) : row.builtIn ? (
            <Tag tone="info">Ships with the site</Tag>
          ) : null}
        </div>

        {row.summary ? <p className="ns-studio__summary">{row.summary}</p> : null}
        <Facts row={row} />

        <span className="ns-studio__actions">
          {row.doc ? (
            <>
              <Link className="ns-chip ns-chip--go" href={`/admin/collections/pages/${row.doc.id}`}>
                Edit this page
              </Link>
              <PublishToggle
                collection="pages"
                id={row.doc.id}
                status={live ? "published" : "draft"}
                title={row.label}
              />
            </>
          ) : row.builtIn && row.href ? (
            <ImportPagesButton paths={[row.href]} label="Make it editable" busyLabel="Adding…" />
          ) : null}
          {row.href && !row.external ? (
            <a className="ns-chip" href={row.href} target="_blank" rel="noreferrer">
              Open
            </a>
          ) : null}
        </span>

        <Changes row={row} />
      </li>
      {row.children.map((child) => (
        <PageCard depth={depth + 1} key={child.href ?? child.label} row={child} />
      ))}
    </>
  );
}

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

  const rowFor = (path: string, label?: string): Row => {
    const known = routePageByPath[path];
    const doc = byPath.get(path);
    const key = mediaKeyFor(path);
    const slot = key ? slots.get(key) : undefined;

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
      mediaKey: key,
      hasPhoto: Boolean(slotPhoto(slot, "")),
      hasFilm: Boolean(slotFilm(slot, "")),
      views: views[path] ?? 0,
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

    const row = rowFor(item.href, item.label);
    if (!row.doc && !row.builtIn) {
      return {
        ...row,
        unknown: true,
        summary: "No page answers this address. Fix the link, or publish a page here.",
        edit: [{ label: "Navigation", href: "/admin/globals/navigation" }],
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

  const otherRows: Row[] = [
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
          : "Every page is editable here. Changing one changes the website; deleting one puts back the copy it shipped with."
      }
    >
      <ul className="ns-studio">
        {menuRows.map((row) => (
          <PageCard key={row.href ?? row.label} row={row} />
        ))}
      </ul>

      {otherRows.length > 0 ? (
        <>
          <h4 className="ns-studio__heading">Not in the menu</h4>
          <ul className="ns-studio">
            {otherRows.map((row) => (
              <PageCard key={row.href ?? row.label} row={row} />
            ))}
          </ul>
        </>
      ) : null}

      <h4 className="ns-studio__heading">Made from dashboard content</h4>
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
                <span className="ns-studio__changelabel">Change:</span>
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

      <p className="ns-note">
        The menu itself is set in <Link href="/admin/globals/navigation">Site → Navigation</Link>. A page
        with &ldquo;show in navigation&rdquo; ticked adds itself to the menu, and taking a page off the
        website removes it from the menu and the sitemap as well.
      </p>
    </Panel>
  );
}

export default PageStudio;
