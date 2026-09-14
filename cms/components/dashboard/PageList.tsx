"use client";

import Link from "next/link";
import React from "react";

import { ImportPagesButton } from "../ImportPagesButton";
import { PublishToggle } from "./Actions";
import { Icon, Tag, ago, nf } from "./ui";

/**
 * Every page of the website, as a list you can narrow.
 *
 * The panel this replaces drew all forty of them at once, each with its own
 * facts and its own shelf of "change this" links, and finding the About page in
 * it meant scrolling past thirty others. Nothing has been taken away - the same
 * rows, the same links - but three things changed:
 *
 * - A box at the top. Type "about", or "/services", and everything else goes.
 * - Four buttons beside it for the questions actually asked of this list: what
 *   is live, what is not, and what still needs something doing to it.
 * - The links for changing a page are folded away behind one line, so a page is
 *   two lines until you ask it to be more.
 *
 * The rows themselves are worked out on the server and handed here already
 * finished, so this holds no data of its own and asks for nothing.
 */

export type PageChange = { label: string; href: string; note?: string };

export type PageRow = {
  /** Unique within the list; the address where there is one. */
  key: string;
  label: string;
  href: string | null;
  summary: string;
  /** The page's document, when it has one that can be edited. */
  docId?: string | number;
  live?: boolean;
  builtIn: boolean;
  /** A menu link pointing at an address no page answers. */
  unknown?: boolean;
  /** An address on another website. */
  external?: boolean;
  views?: number;
  sections?: number | null;
  described?: boolean;
  hasPicture?: boolean;
  hasFilm?: boolean;
  /** Whether this page has a place for a picture at all. */
  takesPicture?: boolean;
  noindex?: boolean;
  updatedAt?: string | null;
  changes: PageChange[];
  children: PageRow[];
};

type Filter = "all" | "live" | "off" | "attention";

const FILTERS: { value: Filter; label: string; title: string }[] = [
  { value: "all", label: "Everything", title: "Every page on the website" },
  { value: "live", label: "Live", title: "Pages a visitor can reach right now" },
  { value: "off", label: "Not live", title: "Pages written but not on the website" },
  {
    value: "attention",
    label: "Needs something",
    title: "No description, no picture, or a link that goes nowhere",
  },
];

/** Is something on this page worth doing before anything else? */
const needsAttention = (row: PageRow): boolean =>
  Boolean(row.unknown || (row.docId && !row.described) || (row.takesPicture && !row.hasPicture && !row.hasFilm));

const passesFilter = (row: PageRow, filter: Filter): boolean => {
  switch (filter) {
    case "live":
      return row.live === true;
    case "off":
      return Boolean(row.docId) && row.live !== true;
    case "attention":
      return needsAttention(row);
    default:
      return true;
  }
};

const passesSearch = (row: PageRow, words: string[]): boolean => {
  if (words.length === 0) return true;
  const haystack = `${row.label} ${row.href ?? ""} ${row.summary}`.toLowerCase();
  return words.every((word) => haystack.includes(word));
};

/* --------------------------------------------------------------------- card */

/** The three or four things worth knowing about a page before opening it. */
function Facts({ row }: { row: PageRow }) {
  return (
    <span className="ns-studio__facts">
      {row.views !== undefined ? (
        <span className="ns-studio__fact" title="Visits in the last thirty days">
          <Icon name="eye" />
          {nf(row.views)} view{row.views === 1 ? "" : "s"}
        </span>
      ) : null}
      {row.sections != null ? (
        <span className="ns-studio__fact" title="How many sections this page is built from">
          <Icon name="page" />
          {row.sections} section{row.sections === 1 ? "" : "s"}
        </span>
      ) : null}
      {row.takesPicture ? (
        <span
          className={`ns-studio__fact${row.hasPicture || row.hasFilm ? " is-on" : ""}`}
          title={
            row.hasPicture || row.hasFilm
              ? "This page carries a picture"
              : "Nothing is drawn on this page until a picture is uploaded"
          }
        >
          <Icon name="image" />
          {row.hasFilm ? "Photo & film" : row.hasPicture ? "Photo" : "No picture"}
        </span>
      ) : null}
      {row.docId ? (
        <span
          className={`ns-studio__fact${row.described ? " is-on" : ""}`}
          title="What a search engine shows under the blue link"
        >
          <Icon name="search" />
          {row.described ? "Described" : "No description"}
        </span>
      ) : null}
      {row.noindex ? <Tag tone="warn">Hidden from search</Tag> : null}
      {row.updatedAt ? (
        <span className="ns-studio__fact ns-studio__fact--quiet">
          <Icon name="clock" />
          {ago(row.updatedAt)}
        </span>
      ) : null}
    </span>
  );
}

function PageCard({ row, depth = 0 }: { row: PageRow; depth?: number }) {
  return (
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
        ) : row.docId ? (
          <Tag tone={row.live ? "good" : "warn"}>{row.live ? "Live" : "Off the website"}</Tag>
        ) : row.builtIn ? (
          <Tag tone="info">Ships with the site</Tag>
        ) : null}

        <span className="ns-studio__actions">
          {row.docId ? (
            <>
              <Link className="ns-chip ns-chip--go" href={`/admin/collections/pages/${row.docId}`}>
                Edit
              </Link>
              <PublishToggle
                collection="pages"
                id={row.docId}
                status={row.live ? "published" : "draft"}
                title={row.label}
              />
            </>
          ) : row.builtIn && row.href ? (
            <ImportPagesButton paths={[row.href]} label="Make it editable" busyLabel="Adding…" />
          ) : null}
          {row.href && !row.external ? (
            <a className="ns-chip" href={row.href} target="_blank" rel="noreferrer">
              View
            </a>
          ) : null}
        </span>
      </div>

      {row.summary ? <p className="ns-studio__summary">{row.summary}</p> : null}
      <Facts row={row} />

      {row.changes.length > 0 ? (
        <details className="ns-studio__more">
          <summary>
            What else can I change here?
            <span className="ns-studio__morecount">{row.changes.length}</span>
          </summary>
          <span className="ns-studio__changes">
            {row.changes.map((change) => (
              <Link className="ns-studio__change" href={change.href} key={change.href}>
                {change.label}
                {change.note ? <em> {change.note}</em> : null}
              </Link>
            ))}
          </span>
        </details>
      ) : null}
    </li>
  );
}

/* --------------------------------------------------------------------- list */

export function PageList({ rows, other }: { rows: PageRow[]; other: PageRow[] }) {
  const [term, setTerm] = React.useState("");
  const [filter, setFilter] = React.useState<Filter>("all");

  const words = React.useMemo(() => term.trim().toLowerCase().split(/\s+/).filter(Boolean), [term]);

  /**
   * A parent that matches keeps its children with it, because "Services and the
   * pages under it" is one answer. A child that matches on its own is promoted,
   * so nothing can be hidden behind a parent that does not match.
   */
  const narrow = React.useCallback(
    (list: PageRow[]): PageRow[] =>
      list.flatMap((row) => {
        const keeps = passesFilter(row, filter) && passesSearch(row, words);
        const children = row.children.filter(
          (child) => passesFilter(child, filter) && passesSearch(child, words),
        );
        if (keeps) return [{ ...row, children }];
        return children;
      }),
    [filter, words],
  );

  const menu = narrow(rows);
  const rest = narrow(other);
  const found = menu.length + menu.reduce((count, row) => count + row.children.length, 0) + rest.length;
  const narrowed = words.length > 0 || filter !== "all";

  return (
    <>
      <div className="ns-shelf__bar">
        <label className="ns-shelf__find">
          <span className="u-visually-hidden">Find a page</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
            <circle cx="11" cy="11" r="6.5" />
            <path d="m16 16 4.5 4.5" />
          </svg>
          <input
            type="search"
            value={term}
            placeholder="Find a page by name or address, e.g. about"
            onChange={(event) => setTerm(event.target.value)}
          />
        </label>

        <div className="ns-seg" role="group" aria-label="Which pages to show">
          {FILTERS.map((option) => (
            <button
              key={option.value}
              type="button"
              title={option.title}
              className={`ns-seg__item${filter === option.value ? " is-on" : ""}`}
              aria-pressed={filter === option.value}
              onClick={() => setFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {narrowed ? (
        <p className="ns-shelf__count" role="status">
          {found === 0 ? "No page matches." : `${found} page${found === 1 ? "" : "s"}`}
          {found > 0 ? (
            <button
              className="ns-shelf__clear"
              type="button"
              onClick={() => {
                setTerm("");
                setFilter("all");
              }}
            >
              Show all again
            </button>
          ) : null}
        </p>
      ) : null}

      {menu.length > 0 ? (
        <ul className="ns-studio">
          {menu.map((row) => (
            <React.Fragment key={row.key}>
              <PageCard row={row} />
              {row.children.map((child) => (
                <PageCard depth={1} key={child.key} row={child} />
              ))}
            </React.Fragment>
          ))}
        </ul>
      ) : null}

      {rest.length > 0 ? (
        <>
          <h4 className="ns-studio__heading">Not in the menu</h4>
          <ul className="ns-studio">
            {rest.map((row) => (
              <PageCard key={row.key} row={row} />
            ))}
          </ul>
        </>
      ) : null}

      {found === 0 ? (
        <p className="ns-empty">
          Nothing matches that. Clear the box, or choose “Everything” above.
        </p>
      ) : null}
    </>
  );
}

export default PageList;
