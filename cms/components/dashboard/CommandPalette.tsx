"use client";

import { useConfig } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import React from "react";

/**
 * One box that reaches everything: ⌘K, or Ctrl+K.
 *
 * A dashboard grows a menu, and a menu with twenty entries in six groups is a
 * thing you learn rather than a thing you use. This is the way round that: start
 * typing the name of a page, a post, a photograph, a client who wrote in, or the
 * job you want done, and it is one Enter away. It sits in the header, so it is
 * on every screen of the dashboard rather than only on the home page.
 *
 * Two kinds of result are folded into one list. Destinations and jobs are known
 * up front and match locally, so the list responds to every keystroke with no
 * request at all. Content is searched on the server through /api/site-tools/search,
 * which looks in sixteen collections at once and returns only what the person
 * typing is allowed to open.
 */

type Entry = {
  id: string;
  title: string;
  detail?: string;
  kind: string;
  href?: string;
  /** A job rather than a place: run it instead of navigating. */
  run?: () => void | Promise<void>;
  keywords?: string;
};

const GROUP_ORDER = ["Jobs", "Create", "Content", "Manage", "Website"];

/** Everywhere in the dashboard, as somewhere to be typed at. */
const destinations: Entry[] = [
  ...[
    ["pages", "Website pages", "Home, About, Services and every other page"],
    ["posts", "Posts", "News, blogs, commentary and investigations"],
    ["services", "Services", "What the company offers"],
    ["service-categories", "Service categories", "How services are grouped"],
    ["offers", "Offers", "Promotions and packages"],
    ["reviews", "Reviews", "Client testimonials, and the approval queue"],
    ["faqs", "Questions", "Frequently asked questions"],
    ["social-responsibility", "Social responsibility", "Commitments and pledges"],
    ["social-work", "Social work", "Work in the community"],
    ["team-members", "Team", "The people on the website"],
    ["well-wishers", "Well-wishers", "Supporters and endorsements"],
    ["enquiries", "Enquiries", "Messages sent through the contact form"],
    ["media", "Files", "Every photograph, film and document"],
    ["media-slots", "Page media", "The picture on each page"],
    ["redirects", "Redirects", "Old addresses pointing at new ones"],
    ["users", "People", "Who can sign in to this dashboard"],
    ["pageviews", "Traffic log", "Every visit, as raw rows"],
    ["backups", "Backups", "Copies of the whole website"],
  ].map(([slug, title, detail]) => ({
    id: `collection-${slug}`,
    title,
    detail,
    kind: "Manage",
    href: `/admin/collections/${slug}`,
    keywords: slug,
  })),
  ...[
    ["homepage", "Homepage", "The front page, band by band"],
    ["navigation", "Navigation", "The menu across the top"],
    ["announcement", "Announcement bar", "The strip above the menu"],
    ["appearance", "Appearance", "Colours, typography and corners"],
    ["footer", "Footer", "The bottom of every page"],
    ["site-settings", "Site settings", "Company details, contacts and default SEO"],
  ].map(([slug, title, detail]) => ({
    id: `global-${slug}`,
    title,
    detail,
    kind: "Manage",
    href: `/admin/globals/${slug}`,
    keywords: slug,
  })),
  ...[
    ["pages", "Build a new page"],
    ["posts", "Write a post"],
    ["services", "Add a service"],
    ["offers", "Create an offer"],
    ["reviews", "Add a review"],
    ["faqs", "Add a question"],
    ["team-members", "Add a team member"],
    ["media", "Upload a photograph or film"],
    ["redirects", "Add a redirect"],
  ].map(([slug, title]) => ({
    id: `create-${slug}`,
    title,
    kind: "Create",
    href: `/admin/collections/${slug}/create`,
    keywords: `new create add ${slug}`,
  })),
  ...[
    ["/", "Open the website"],
    ["/contact", "Open the contact page"],
    ["/services", "Open the services page"],
    ["/posts", "Open the news page"],
    ["/search", "Open the site search"],
  ].map(([href, title]) => ({
    id: `site-${href}`,
    title,
    kind: "Website",
    href,
    detail: `Opens ${href} in a new tab`,
    keywords: "website public visitor view",
  })),
];

/** Does every word typed appear somewhere in this entry? */
const matches = (entry: Entry, words: string[]): boolean => {
  const haystack = `${entry.title} ${entry.detail ?? ""} ${entry.kind} ${entry.keywords ?? ""}`.toLowerCase();
  return words.every((word) => haystack.includes(word));
};

export function CommandPalette() {
  const router = useRouter();
  const { config } = useConfig();
  const api = config?.routes?.api || "/api";

  const [open, setOpen] = React.useState(false);
  const [term, setTerm] = React.useState("");
  const [cursor, setCursor] = React.useState(0);
  /* Results are kept with the term they answered. Anything else and a result
     from two keystroke ago would sit under a query it does not match. */
  const [found, setFound] = React.useState<{ term: string; entries: Entry[] }>({ term: "", entries: [] });
  const [busy, setBusy] = React.useState(false);
  const [message, setMessage] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  const show = React.useCallback(() => {
    setTerm("");
    setCursor(0);
    setFound({ term: "", entries: [] });
    setMessage(null);
    setOpen(true);
  }, []);

  /** The jobs. They live here rather than in the list above because they close
      the palette and report back, which needs the palette's own state. */
  const jobs = React.useMemo<Entry[]>(
    () => [
      {
        id: "job-refresh",
        title: "Rebuild the website",
        detail: "Push everything saved here out to every page a visitor sees",
        kind: "Jobs",
        keywords: "cache purge refresh revalidate publish clear",
        run: async () => {
          setBusy(true);
          setMessage("Rebuilding the website…");
          try {
            const response = await fetch(`${api}/site-tools/refresh`, {
              method: "POST",
              credentials: "include",
            });
            const body = (await response.json()) as { message?: string; error?: string };
            setMessage(body.message ?? body.error ?? "Done.");
          } catch {
            setMessage("The website could not be rebuilt. Try again in a moment.");
          } finally {
            setBusy(false);
          }
        },
      },
      {
        id: "job-backup",
        title: "Back the website up now",
        detail: "Take a copy of every word, setting and picture",
        kind: "Jobs",
        keywords: "backup copy snapshot save export",
        run: async () => {
          setBusy(true);
          setMessage("Taking a copy…");
          try {
            const response = await fetch(`${api}/site-backup/run`, {
              method: "POST",
              credentials: "include",
            });
            const body = (await response.json()) as { summary?: string; error?: string };
            setMessage(body.summary ? `Copy taken: ${body.summary}` : (body.error ?? "Done."));
          } catch {
            setMessage("The copy could not be taken. Try again in a moment.");
          } finally {
            setBusy(false);
          }
        },
      },
      {
        id: "job-export-enquiries",
        title: "Export enquiries to a spreadsheet",
        detail: "Every message sent through the contact form, as a CSV file",
        kind: "Jobs",
        keywords: "csv download spreadsheet excel enquiries contact",
        href: `${api}/site-tools/export?collection=enquiries`,
      },
      {
        id: "job-export-reviews",
        title: "Export reviews to a spreadsheet",
        kind: "Jobs",
        keywords: "csv download spreadsheet excel reviews",
        href: `${api}/site-tools/export?collection=reviews`,
      },
      {
        id: "job-export-traffic",
        title: "Export the traffic log to a spreadsheet",
        kind: "Jobs",
        keywords: "csv download spreadsheet analytics traffic pageviews",
        href: `${api}/site-tools/export?collection=pageviews`,
      },
      {
        id: "job-download-backup",
        title: "Download a copy of the whole site",
        detail: "A single file holding everything, saved to this computer",
        kind: "Jobs",
        keywords: "backup download json archive",
        href: "/backup",
      },
    ],
    [api],
  );

  const local = React.useMemo(() => [...jobs, ...destinations], [jobs]);

  /* Open with ⌘K or Ctrl+K from anywhere in the dashboard, close with Escape. */
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        if (open) setOpen(false);
        else show();
        return;
      }
      if (key === "escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, show]);

  /* The field is mounted in the same commit as the panel, so focus waits a frame. */
  React.useEffect(() => {
    if (!open) return undefined;
    const id = window.requestAnimationFrame(() => inputRef.current?.focus());
    return () => window.cancelAnimationFrame(id);
  }, [open]);

  /* Content search. Held back a moment so a fast typist makes one request. */
  React.useEffect(() => {
    const query = term.trim();
    // Below two letters everything matches, which is no help to anyone, and the
    // results already on screen are hidden by the guard further down.
    if (query.length < 2) return undefined;

    const abort = new AbortController();
    const timer = window.setTimeout(async () => {
      try {
        const response = await fetch(
          `${api}/site-tools/search?q=${encodeURIComponent(query)}`,
          { credentials: "include", signal: abort.signal },
        );
        const body = (await response.json()) as { results?: Entry[] };
        setFound({
          term: query,
          entries: (body.results ?? []).map((result) => ({
            ...result,
            id: `found-${result.kind}-${result.id}`,
            kind: "Content",
          })),
        });
      } catch {
        // An aborted or failed search simply leaves the local matches showing.
      }
    }, 180);

    return () => {
      abort.abort();
      window.clearTimeout(timer);
    };
  }, [term, api]);

  const query = term.trim();

  const shown = React.useMemo(() => {
    const words = query.toLowerCase().split(/\s+/).filter(Boolean);
    const localMatches = words.length === 0 ? local : local.filter((entry) => matches(entry, words));
    // Results that answered an older query are not shown under this one.
    const content = query.length >= 2 && found.term === query ? found.entries : [];

    return [...localMatches.slice(0, 18), ...content].sort(
      (a, b) =>
        (GROUP_ORDER.indexOf(a.kind) + 1 || 99) - (GROUP_ORDER.indexOf(b.kind) + 1 || 99),
    );
  }, [local, found, query]);

  // Results arrive after the list has been drawn, so the highlight is clamped
  // rather than trusted.
  const at = Math.min(cursor, Math.max(0, shown.length - 1));

  const choose = async (entry?: Entry) => {
    if (!entry) return;
    if (entry.run) {
      await entry.run();
      return;
    }
    if (!entry.href) return;
    setOpen(false);
    if (entry.href.startsWith("/admin")) {
      router.push(entry.href);
    } else {
      window.open(entry.href, "_blank", "noopener");
    }
  };

  const onFieldKey = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setCursor(Math.min(at + 1, shown.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setCursor(Math.max(at - 1, 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      void choose(shown[at]);
    }
  };

  let lastGroup = "";

  return (
    <>
      <button className="ns-omni" type="button" onClick={show}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
          <circle cx="11" cy="11" r="6.5" />
          <path d="m16 16 4.5 4.5" />
        </svg>
        <span className="ns-omni__label">Search or jump to…</span>
        <kbd className="ns-omni__key">⌘K</kbd>
      </button>

      {open ? (
        <div className="ns-palette" role="dialog" aria-modal="true" aria-label="Search the dashboard">
          <button
            className="ns-palette__scrim"
            type="button"
            aria-label="Close search"
            onClick={() => setOpen(false)}
          />
          <div className="ns-palette__panel">
            <div className="ns-palette__field">
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
                placeholder="Search pages, posts, files, people - or type what you want to do"
                aria-label="Search the dashboard"
                autoComplete="off"
                spellCheck={false}
              />
              <kbd className="ns-omni__key">esc</kbd>
            </div>

            {message ? <p className="ns-palette__message">{message}</p> : null}

            <ul className="ns-palette__list">
              {shown.length === 0 ? (
                <li className="ns-palette__none">
                  Nothing matches “{term}”. Try part of a title, or a word like “backup”.
                </li>
              ) : (
                shown.map((entry, index) => {
                  const heading = entry.kind !== lastGroup ? entry.kind : null;
                  lastGroup = entry.kind;
                  return (
                    <React.Fragment key={entry.id}>
                      {heading ? <li className="ns-palette__group">{heading}</li> : null}
                      <li>
                        <button
                          className={`ns-palette__item${index === at ? " is-active" : ""}`}
                          type="button"
                          disabled={busy}
                          onMouseEnter={() => setCursor(index)}
                          onClick={() => void choose(entry)}
                        >
                          <span className="ns-palette__title">{entry.title}</span>
                          {entry.detail ? <span className="ns-palette__detail">{entry.detail}</span> : null}
                          <span className="ns-palette__kind">{entry.kind}</span>
                        </button>
                      </li>
                    </React.Fragment>
                  );
                })
              )}
            </ul>

            <footer className="ns-palette__foot">
              <span><kbd>↑</kbd><kbd>↓</kbd> to move</span>
              <span><kbd>↵</kbd> to open</span>
              <span><kbd>esc</kbd> to close</span>
            </footer>
          </div>
        </div>
      ) : null}
    </>
  );
}

export default CommandPalette;
