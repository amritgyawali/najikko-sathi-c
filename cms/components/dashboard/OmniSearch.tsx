"use client";

import { useConfig } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import React from "react";

/**
 * One box that finds everything: ⌘K, Ctrl+K, or a bare "/".
 *
 * The dashboard used to carry two search boxes - a palette in the header that
 * found a document by its name, and a bar under it that found a sentence inside
 * one - and an owner had to know which of the two answered the question they
 * had. They never did. So there is one box now, and it answers both questions at
 * once: what you can do, where you can go, which document is called this, and
 * which page has this sentence written on it.
 *
 * Results are grouped under headings written the way a person would say them,
 * and the groups are ordered by how likely each one is to be what was meant:
 * a job you asked for by name, then a new thing, then a place, then a document,
 * then the words inside one. Everything is reachable with the arrow keys and
 * Enter alone.
 *
 * Two of the four sources answer locally and instantly (jobs and places); the
 * other two are one request each, held back a moment so a fast typist makes one
 * request rather than eight.
 */

/* ---------------------------------------------------------------- the shapes */

/**
 * The headings, in the order they are offered - which is the order the thing
 * typed is most likely to have meant. Somebody typing "services" wants the
 * services, not a new one; somebody who wants a new one types "add" or "new",
 * which only the second group answers to.
 */
const GROUPS = ["Do this", "Go to", "Make something new", "Your content", "Words on the website"] as const;

type Group = (typeof GROUPS)[number];

type Entry = {
  id: string;
  group: Group;
  title: string;
  detail?: string;
  /** A short state word drawn beside the title, e.g. "Draft". */
  badge?: string;
  href?: string;
  /** Opens in a new tab rather than inside the dashboard. */
  external?: boolean;
  /** The field to scroll to and flash once the document has opened. */
  anchor?: string | null;
  /** A job rather than a place: run it, and say what happened. */
  run?: () => void | Promise<void>;
  /** Extra words that should match this entry without being shown. */
  keywords?: string;
  /** A sentence from the content, with the matched characters marked. */
  snippet?: { text: string; ranges: [number, number][]; more: boolean };
};

/** A document found by its name. */
type NamedHit = {
  id: string;
  title: string;
  detail?: string;
  kind: string;
  status?: string | null;
  href: string;
};

/** A sentence found inside a document. */
type WordHit = {
  id: string;
  entity: string;
  title: string;
  field: string;
  snippet: string;
  ranges: [number, number][];
  truncatedStart: boolean;
  truncatedEnd: boolean;
  editUrl: string;
  status: string | null;
};

const DEBOUNCE_MS = 170;
const MIN_QUERY = 2;
const RECENTS_KEY = "najikko:dashboard-search:recent";
const MAX_RECENTS = 5;
const NO_RECENTS: string[] = [];

/* ------------------------------------------------------------------ recents */

/**
 * What was searched for lately, kept in this browser. Read as an external store
 * rather than in an effect, so the server renders none and the first client
 * render already has them, with the two never disagreeing.
 */
const recents = (() => {
  const listeners = new Set<() => void>();
  let cache: string[] | null = null;

  const read = (): string[] => {
    try {
      const parsed: unknown = JSON.parse(window.localStorage.getItem(RECENTS_KEY) ?? "[]");
      return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === "string") : [];
    } catch {
      // Private browsing, or storage switched off. Search still works.
      return NO_RECENTS;
    }
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    get: (): string[] => (cache ??= read()),
    getServer: (): string[] => NO_RECENTS,
    remember(value: string) {
      const trimmed = value.trim();
      if (trimmed.length < MIN_QUERY) return;
      cache = [trimmed, ...(cache ?? read()).filter((entry) => entry !== trimmed)].slice(0, MAX_RECENTS);
      try {
        window.localStorage.setItem(RECENTS_KEY, JSON.stringify(cache));
      } catch {
        // Not being able to remember a search is not a reason to refuse it.
      }
      for (const listener of listeners) listener();
    },
  };
})();

/* ------------------------------------------------------- the places to go to */

const collection = (slug: string, title: string, detail: string): Entry => ({
  id: `go-${slug}`,
  group: "Go to",
  title,
  detail,
  href: `/admin/collections/${slug}`,
  keywords: slug,
});

const settings = (slug: string, title: string, detail: string): Entry => ({
  id: `global-${slug}`,
  group: "Go to",
  title,
  detail,
  href: `/admin/globals/${slug}`,
  keywords: `${slug} setting settings`,
});

const create = (slug: string, title: string, keywords = ""): Entry => ({
  id: `new-${slug}`,
  group: "Make something new",
  title,
  href: `/admin/collections/${slug}/create`,
  keywords: `new create add ${slug} ${keywords}`,
});

/** Everywhere in the dashboard, as somewhere to be typed at. */
const PLACES: Entry[] = [
  collection("pages", "Website pages", "Home, About, Services and every other page"),
  collection("posts", "Posts", "News, blogs, commentary and investigations"),
  collection("services", "Services", "What the company offers"),
  collection("service-categories", "Service categories", "How services are grouped"),
  collection("offers", "Offers", "Promotions and packages"),
  collection("reviews", "Reviews", "Client testimonials, and the approval queue"),
  collection("faqs", "Questions", "Frequently asked questions"),
  collection("social-responsibility", "Social responsibility", "Commitments and pledges"),
  collection("social-work", "Social work", "Work in the community"),
  collection("team-members", "Team", "The people on the website"),
  collection("well-wishers", "Well-wishers", "Supporters and endorsements"),
  collection("enquiries", "Enquiries", "Messages sent through the contact form"),
  collection("media", "Files", "Every photograph, film and document"),
  collection("media-slots", "Page media", "The picture on each page"),
  collection("redirects", "Redirects", "Old addresses pointing at new ones"),
  collection("users", "People", "Who can sign in to this dashboard"),
  collection("pageviews", "Traffic log", "Every visit, as raw rows"),
  collection("backups", "Backups", "Copies of the whole website"),
  settings("homepage", "Homepage", "The front page, band by band"),
  settings("navigation", "Menu", "The links across the top of the website"),
  settings("announcement", "Announcement bar", "The strip above the menu"),
  settings("appearance", "Colours & type", "How the website looks"),
  settings("footer", "Footer", "The bottom of every page"),
  settings("site-settings", "Site settings", "Company details, contacts and default SEO"),
  create("posts", "Write a post", "news article blog"),
  create("pages", "Build a page"),
  create("services", "Add a service"),
  create("offers", "Create an offer", "promotion"),
  create("reviews", "Add a review", "testimonial"),
  create("faqs", "Add a question"),
  create("team-members", "Add someone to the team", "staff person"),
  create("media", "Upload a photo or film", "image video picture"),
  create("redirects", "Add a redirect"),
  {
    id: "site-home",
    group: "Go to",
    title: "Open the website",
    detail: "See the site the way a visitor does",
    href: "/",
    external: true,
    keywords: "public visitor view live preview",
  },
];

/**
 * What is offered before anything has been typed, in the order it is offered.
 * Not the six most powerful things here - the six most often wanted.
 */
const SUGGESTED = ["new-posts", "go-enquiries", "go-reviews", "new-media", "new-pages", "site-home"];

/* ------------------------------------------------------------------ matching */

/** Does every word typed appear somewhere in this entry? */
const matches = (entry: Entry, words: string[]): boolean => {
  const haystack = `${entry.title} ${entry.detail ?? ""} ${entry.group} ${entry.keywords ?? ""}`.toLowerCase();
  return words.every((word) => haystack.includes(word));
};

/**
 * How well an entry answers the query, lower being better. A title that starts
 * with what was typed is almost always the thing meant, and a title that merely
 * contains it comes next; everything else matched on a word nobody saw.
 */
const rank = (entry: Entry, query: string): number => {
  const title = entry.title.toLowerCase();
  if (title.startsWith(query)) return 0;
  if (title.includes(query)) return 1;
  return 2;
};

/** The matched characters in full colour, the rest of the sentence faded back. */
function Marked({ snippet }: { snippet: NonNullable<Entry["snippet"]> }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  snippet.ranges.forEach(([start, end], index) => {
    if (start > cursor) parts.push(<span key={`gap-${index}`}>{snippet.text.slice(cursor, start)}</span>);
    parts.push(<mark key={`hit-${index}`}>{snippet.text.slice(start, end)}</mark>);
    cursor = end;
  });
  if (cursor < snippet.text.length) parts.push(<span key="tail">{snippet.text.slice(cursor)}</span>);

  return (
    <span className="ns-find__snippet">
      {parts}
      {snippet.more ? "…" : null}
    </span>
  );
}

/* -------------------------------------------------------------------- search */

export function OmniSearch() {
  const router = useRouter();
  const { config } = useConfig();
  const api = `${config?.serverURL ?? ""}${config?.routes?.api ?? "/api"}`;

  const [open, setOpen] = React.useState(false);
  const [term, setTerm] = React.useState("");
  const [cursor, setCursor] = React.useState(0);
  const [busy, setBusy] = React.useState(false);
  const [said, setSaid] = React.useState<{ text: string; bad: boolean } | null>(null);
  /* Each answer is kept with the question it answered, so a reply to an older
     keystroke can never be shown under a newer query. */
  const [named, setNamed] = React.useState<{ query: string; hits: NamedHit[] }>({ query: "", hits: [] });
  const [words, setWords] = React.useState<{ query: string; hits: WordHit[] }>({ query: "", hits: [] });
  const [anchor, setAnchor] = React.useState<string | null>(null);

  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const remembered = React.useSyncExternalStore(recents.subscribe, recents.get, recents.getServer);

  const query = term.trim();
  const searchable = query.length >= MIN_QUERY;

  const show = React.useCallback(() => {
    setTerm("");
    setCursor(0);
    setSaid(null);
    setOpen(true);
  }, []);

  /* ------------------------------------------------------------------ jobs */

  /** The things that happen here rather than somewhere else. */
  const jobs = React.useMemo<Entry[]>(() => {
    const post = async (path: string, working: string, read: (body: Record<string, unknown>) => string) => {
      setBusy(true);
      setSaid({ text: working, bad: false });
      try {
        const response = await fetch(`${api}${path}`, { method: "POST", credentials: "include" });
        const body = (await response.json()) as Record<string, unknown>;
        const failed = !response.ok;
        setSaid({
          text: failed
            ? typeof body.error === "string"
              ? body.error
              : "That did not work. Try again in a moment."
            : read(body),
          bad: failed,
        });
        if (!failed) router.refresh();
      } catch {
        setSaid({ text: "The dashboard could not reach the server.", bad: true });
      } finally {
        setBusy(false);
      }
    };

    return [
      {
        id: "job-refresh",
        group: "Do this",
        title: "Rebuild the website",
        detail: "Push everything saved here out to every page a visitor sees",
        keywords: "cache purge refresh revalidate update publish clear",
        run: () =>
          post("/site-tools/refresh", "Rebuilding the website…", (body) =>
            typeof body.message === "string" ? body.message : "The website has been rebuilt.",
          ),
      },
      {
        id: "job-backup",
        group: "Do this",
        title: "Back the website up now",
        detail: "Take a copy of every word, setting and picture",
        keywords: "backup copy snapshot save",
        run: () =>
          post("/site-backup/run", "Taking a copy…", (body) =>
            typeof body.summary === "string" ? `Copy taken - ${body.summary}.` : "A copy has been saved.",
          ),
      },
      {
        id: "job-download-backup",
        group: "Do this",
        title: "Download a copy of the whole site",
        detail: "One file holding everything, saved to this computer",
        keywords: "backup download archive json",
        href: "/backup",
        external: true,
      },
      ...[
        ["enquiries", "Export the enquiries to a spreadsheet", "contact messages"],
        ["reviews", "Export the reviews to a spreadsheet", "testimonials"],
        ["posts", "Export the posts to a spreadsheet", "news"],
        ["pageviews", "Export the traffic log to a spreadsheet", "analytics visits"],
      ].map(([slug, title, extra]) => ({
        id: `job-export-${slug}`,
        group: "Do this" as const,
        title,
        detail: "Opens in Excel, Numbers or Google Sheets",
        keywords: `csv download spreadsheet excel export ${slug} ${extra}`,
        href: `${api}/site-tools/export?collection=${slug}`,
        external: true,
      })),
    ];
  }, [api, router]);

  const local = React.useMemo(() => [...jobs, ...PLACES], [jobs]);

  /* -------------------------------------------------------------- fetching */

  /**
   * Reading the whole site for the word search takes a moment on a hosted
   * database, so it is asked for once when the dashboard loads rather than
   * making the first search wait for it.
   */
  React.useEffect(() => {
    const abort = new AbortController();
    fetch(`${api}/dashboard-search?warm=1`, { credentials: "include", signal: abort.signal }).catch(
      () => undefined,
    );
    return () => abort.abort();
  }, [api]);

  React.useEffect(() => {
    if (!open || !searchable) return undefined;

    const abort = new AbortController();
    const timer = window.setTimeout(() => {
      const ask = <T,>(path: string): Promise<T | null> =>
        fetch(`${api}${path}${encodeURIComponent(query)}`, { credentials: "include", signal: abort.signal })
          .then((response) => (response.ok ? (response.json() as Promise<T>) : null))
          .catch(() => null);

      void ask<{ results?: NamedHit[] }>("/site-tools/search?q=").then((body) => {
        if (!abort.signal.aborted) setNamed({ query, hits: body?.results ?? [] });
      });
      void ask<{ hits?: WordHit[] }>("/dashboard-search?q=").then((body) => {
        if (!abort.signal.aborted) setWords({ query, hits: body?.hits ?? [] });
      });
    }, DEBOUNCE_MS);

    return () => {
      abort.abort();
      window.clearTimeout(timer);
    };
  }, [api, open, query, searchable]);

  /* ------------------------------------------------------------ the results */

  const shown = React.useMemo<Entry[]>(() => {
    if (!searchable) {
      return SUGGESTED.map((id) => local.find((entry) => entry.id === id)).filter(
        (entry): entry is Entry => Boolean(entry),
      );
    }

    const lower = query.toLowerCase();
    const typed = lower.split(/\s+/).filter(Boolean);

    const places = local
      .filter((entry) => matches(entry, typed))
      .sort((a, b) => rank(a, lower) - rank(b, lower))
      .slice(0, 12);

    // A document whose name matches, shown only under the query it answered.
    const documents: Entry[] =
      named.query === query
        ? named.hits.slice(0, 8).map((hit) => ({
            id: `doc-${hit.href}`,
            group: "Your content",
            title: hit.title,
            detail: hit.detail || hit.kind,
            badge: hit.status === "draft" ? "Draft" : undefined,
            href: hit.href,
            keywords: hit.kind,
          }))
        : [];

    // A sentence inside a document, opening the very field it is written in.
    const sentences: Entry[] =
      words.query === query
        ? words.hits.slice(0, 8).map((hit) => ({
            id: `word-${hit.id}`,
            group: "Words on the website",
            title: hit.title,
            detail: `${hit.entity} · ${hit.field || "Content"}`,
            badge: hit.status === "draft" ? "Draft" : undefined,
            href: hit.editUrl,
            anchor: hit.editUrl.split("#")[1] ?? null,
            snippet: {
              text: `${hit.truncatedStart ? "…" : ""}${hit.snippet}`,
              // The ellipsis is one character, so every mark shifts by one.
              ranges: hit.ranges.map(
                ([start, end]) =>
                  [start + (hit.truncatedStart ? 1 : 0), end + (hit.truncatedStart ? 1 : 0)] as [number, number],
              ),
              more: hit.truncatedEnd,
            },
          }))
        : [];

    const all = [...places, ...documents, ...sentences];
    return all.sort((a, b) => GROUPS.indexOf(a.group) - GROUPS.indexOf(b.group));
  }, [local, named, query, searchable, words]);

  const waiting = searchable && (named.query !== query || words.query !== query);
  // Results arrive after the list is drawn, so the highlight is clamped rather
  // than trusted.
  const at = Math.min(cursor, Math.max(0, shown.length - 1));

  /* --------------------------------------------------------------- opening */

  const choose = React.useCallback(
    async (entry?: Entry) => {
      if (!entry) return;
      if (entry.run) {
        await entry.run();
        return;
      }
      if (!entry.href) return;

      recents.remember(query);
      if (entry.external) {
        window.open(entry.href, "_blank", "noopener");
        return;
      }
      setOpen(false);
      setAnchor(entry.anchor ?? null);
      router.push(entry.href);
    },
    [query, router],
  );

  /**
   * A word result opens the document and then the field that holds the word.
   * The document renders after the route changes, so the field is watched for,
   * then brought into view and flashed - which is what turns a search result
   * into "here is the thing to edit".
   */
  React.useEffect(() => {
    if (!anchor) return undefined;

    let stopped = false;
    let timer = 0;
    const startedAt = Date.now();

    const look = () => {
      if (stopped) return;
      const field = document.getElementById(anchor);
      if (field) {
        field.scrollIntoView({ behavior: "smooth", block: "center" });
        field.classList.add("ns-field-flash");
        window.setTimeout(() => field.classList.remove("ns-field-flash"), 2400);
        field.querySelector<HTMLElement>("input:not([readonly]), textarea:not([readonly])")?.focus({
          preventScroll: true,
        });
        setAnchor(null);
        return;
      }
      // The document may simply be slow, but it may also never arrive.
      if (Date.now() - startedAt > 6000) {
        setAnchor(null);
        return;
      }
      timer = window.setTimeout(look, 120);
    };

    timer = window.setTimeout(look, 200);
    return () => {
      stopped = true;
      window.clearTimeout(timer);
    };
  }, [anchor]);

  /* -------------------------------------------------------------- keyboard */

  /* ⌘K, Ctrl+K, or a bare "/" when nothing is being typed into. */
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        if (open) setOpen(false);
        else show();
        return;
      }

      if (key === "escape" && open) {
        setOpen(false);
        return;
      }

      if (key === "/" && !open && !event.metaKey && !event.ctrlKey && !event.altKey) {
        const target = event.target as HTMLElement | null;
        const typing =
          target instanceof HTMLElement &&
          (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);
        if (typing) return;
        event.preventDefault();
        show();
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, show]);

  /* The field is mounted in the same commit as the panel, so focus waits a frame. */
  React.useEffect(() => {
    if (!open) return undefined;
    const frame = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  /* Keep the highlighted row inside the scrolling list. */
  React.useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>("[data-active='true']")?.scrollIntoView({ block: "nearest" });
  }, [at, open]);

  const onFieldKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor(shown.length === 0 ? 0 : (at + 1) % shown.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor(shown.length === 0 ? 0 : (at - 1 + shown.length) % shown.length);
    } else if (event.key === "Home") {
      event.preventDefault();
      setCursor(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setCursor(Math.max(0, shown.length - 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      void choose(shown[at]);
    }
  };

  /* -------------------------------------------------------------- rendering */

  let heading: Group | "" = "";

  return (
    <>
      <button className="ns-omni" type="button" onClick={show} aria-haspopup="dialog">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <span className="ns-omni__label">Search anything</span>
        <kbd className="ns-omni__key">⌘K</kbd>
      </button>

      {open ? (
        <div className="ns-find" role="dialog" aria-modal="true" aria-label="Search the dashboard">
          <button className="ns-find__scrim" type="button" aria-label="Close search" onClick={() => setOpen(false)} />

          <div className="ns-find__panel">
            <div className="ns-find__field">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" />
                <path d="m16 16 4.5 4.5" />
              </svg>
              <input
                ref={inputRef}
                value={term}
                onChange={(event) => {
                  setTerm(event.target.value);
                  setCursor(0);
                }}
                onKeyDown={onFieldKey}
                placeholder="Type a page, a name, a sentence - or what you want to do"
                aria-label="Search the dashboard"
                role="combobox"
                aria-expanded
                aria-controls="ns-find-list"
                aria-autocomplete="list"
                aria-activedescendant={shown.length > 0 ? `ns-find-row-${at}` : undefined}
                autoComplete="off"
                spellCheck={false}
              />
              {waiting ? <span className="ns-find__spinner" aria-hidden="true" /> : null}
              <kbd className="ns-omni__key">esc</kbd>
            </div>

            {said ? (
              <p className={`ns-find__said${said.bad ? " is-bad" : ""}`} role="status">
                {said.text}
              </p>
            ) : null}

            {!searchable && remembered.length > 0 ? (
              <div className="ns-find__recents">
                <span className="ns-find__recentlabel">Lately</span>
                {remembered.map((entry) => (
                  <button
                    className="ns-chip"
                    key={entry}
                    type="button"
                    onClick={() => {
                      setTerm(entry);
                      setCursor(0);
                      inputRef.current?.focus();
                    }}
                  >
                    {entry}
                  </button>
                ))}
              </div>
            ) : null}

            <div className="ns-find__list" id="ns-find-list" role="listbox" ref={listRef}>
              {shown.length === 0 ? (
                <p className="ns-find__none">
                  {waiting
                    ? "Looking…"
                    : `Nothing matches “${query}”. Try part of a word, or a name like “about”.`}
                </p>
              ) : (
                shown.map((entry, index) => {
                  // Before anything is typed the rows are a single offer, not
                  // five groups of one, so they take one heading between them.
                  const label = searchable
                    ? entry.group === heading
                      ? null
                      : entry.group
                    : index === 0
                      ? "Common things"
                      : null;
                  heading = entry.group;
                  return (
                    <React.Fragment key={entry.id}>
                      {label ? <p className="ns-find__group">{label}</p> : null}
                      <button
                        className="ns-find__row"
                        id={`ns-find-row-${index}`}
                        type="button"
                        role="option"
                        aria-selected={index === at}
                        data-active={index === at}
                        disabled={busy}
                        onMouseEnter={() => setCursor(index)}
                        onClick={() => void choose(entry)}
                      >
                        <span className="ns-find__top">
                          <span className="ns-find__title">{entry.title}</span>
                          {entry.badge ? <span className="ns-find__badge">{entry.badge}</span> : null}
                          {entry.external ? (
                            <span className="ns-find__out" aria-label="opens in a new tab">
                              ↗
                            </span>
                          ) : null}
                        </span>
                        {entry.detail ? <span className="ns-find__detail">{entry.detail}</span> : null}
                        {entry.snippet ? <Marked snippet={entry.snippet} /> : null}
                      </button>
                    </React.Fragment>
                  );
                })
              )}
            </div>

            <footer className="ns-find__foot">
              <span>
                <kbd>↑</kbd>
                <kbd>↓</kbd> move
              </span>
              <span>
                <kbd>↵</kbd> open
              </span>
              <span>
                <kbd>esc</kbd> close
              </span>
              <span className="ns-find__tip">Tip: press / anywhere to search</span>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default OmniSearch;
