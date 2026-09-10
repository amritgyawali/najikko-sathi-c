"use client";

import { useConfig } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import React from "react";

/**
 * The keyword search bar across the top of the dashboard.
 *
 * It answers one question an editor asks constantly: "where is the page that
 * says this?". Typing part of any word matches anywhere in the site's content -
 * headings, body copy, blocks, FAQs, navigation labels, footer text - and each
 * result opens the exact field that holds it, with the word highlighted and the
 * rest of the sentence faded so the match is obvious at a glance.
 *
 * This is the other half of the command palette in the header, not a second
 * copy of it. The palette finds a document by its name and takes you to it;
 * this finds a sentence inside a document and takes you to the field it is
 * written in. So the palette keeps Ctrl/⌘ + K, and this answers to "/".
 */

type Hit = {
  id: string;
  entity: string;
  entityKind: "collection" | "global";
  slug: string;
  docId: string | null;
  title: string;
  field: string;
  fieldPath: string;
  snippet: string;
  ranges: [number, number][];
  truncatedStart: boolean;
  truncatedEnd: boolean;
  editUrl: string;
  publicPath: string | null;
  publicWhere: string;
  status: string | null;
  approximate: boolean;
};

type Results = {
  query: string;
  hits: Hit[];
  documents: number;
  approximate: boolean;
  tookMs: number;
};

const MIN_QUERY = 2;
const DEBOUNCE_MS = 170;
const RECENTS_KEY = "najikko:dashboard-search:recent";
const MAX_RECENTS = 6;

const NO_RECENTS: string[] = [];

/**
 * Recent searches live in the browser, so they are read through an external
 * store rather than state: the server renders none, and the first client render
 * already has them.
 */
const recentsStore = (() => {
  let cache: string[] | null = null;
  const listeners = new Set<() => void>();

  const read = (): string[] => {
    try {
      const stored = window.localStorage.getItem(RECENTS_KEY);
      const parsed: unknown = stored ? JSON.parse(stored) : [];
      return Array.isArray(parsed) ? parsed.filter((entry): entry is string => typeof entry === "string") : [];
    } catch {
      return NO_RECENTS;
    }
  };

  return {
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    get(): string[] {
      if (!cache) cache = read();
      return cache;
    },
    getServer(): string[] {
      return NO_RECENTS;
    },
    remember(value: string) {
      if (!value) return;
      cache = [value, ...(cache ?? read()).filter((entry) => entry !== value)].slice(0, MAX_RECENTS);
      try {
        window.localStorage.setItem(RECENTS_KEY, JSON.stringify(cache));
      } catch {
        // Private browsing, or storage switched off - the search still works.
      }
      for (const listener of listeners) listener();
    },
  };
})();

/** The matched characters in full colour, everything around them faded back. */
function Snippet({ hit }: { hit: Hit }) {
  const parts: React.ReactNode[] = [];
  let cursor = 0;

  hit.ranges.forEach(([start, end], index) => {
    if (start > cursor) {
      parts.push(
        <span className="ns-dsearch__dim" key={`gap-${index}`}>
          {hit.snippet.slice(cursor, start)}
        </span>,
      );
    }
    parts.push(
      <mark className="ns-dsearch__mark" key={`hit-${index}`}>
        {hit.snippet.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });

  if (cursor < hit.snippet.length) {
    parts.push(
      <span className="ns-dsearch__dim" key="tail">
        {hit.snippet.slice(cursor)}
      </span>,
    );
  }

  return (
    <span className="ns-dsearch__snippet">
      {hit.truncatedStart ? <span className="ns-dsearch__dim">…</span> : null}
      {parts}
      {hit.truncatedEnd ? <span className="ns-dsearch__dim">…</span> : null}
    </span>
  );
}

export function GlobalSearch() {
  const router = useRouter();
  const { config } = useConfig();
  const apiBase = `${config.serverURL ?? ""}${config.routes?.api ?? "/api"}`;

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const listRef = React.useRef<HTMLUListElement | null>(null);

  const [query, setQuery] = React.useState("");
  // One piece of state for the answer and the question it answers, so a reply
  // for an older keystroke can never be shown against a newer query.
  const [response, setResponse] = React.useState<{ query: string; data: Results | null; error: string | null } | null>(
    null,
  );
  const [open, setOpen] = React.useState(false);
  const [active, setActive] = React.useState(0);
  const [pendingAnchor, setPendingAnchor] = React.useState<string | null>(null);

  const recents = React.useSyncExternalStore(recentsStore.subscribe, recentsStore.get, recentsStore.getServer);

  const trimmed = query.trim();
  const searchable = trimmed.length >= MIN_QUERY;
  const current = response && response.query === trimmed ? response : null;
  const results = current?.data ?? null;
  const error = current?.error ?? null;
  const loading = searchable && !current;
  const hits = results?.hits ?? [];
  const showRecents = !searchable && recents.length > 0;
  const rowCount = showRecents ? recents.length : hits.length;

  /* ------------------------------------------------------------- fetching */

  /**
   * Reading the whole site takes a moment on a hosted database, so ask for it
   * once when the dashboard loads rather than making the first search wait.
   */
  React.useEffect(() => {
    const controller = new AbortController();
    fetch(`${apiBase}/dashboard-search?warm=1`, { credentials: "include", signal: controller.signal }).catch(
      () => undefined,
    );
    return () => controller.abort();
  }, [apiBase]);

  React.useEffect(() => {
    if (trimmed.length < MIN_QUERY) return undefined;

    const controller = new AbortController();

    const timer = window.setTimeout(() => {
      fetch(`${apiBase}/dashboard-search?q=${encodeURIComponent(trimmed)}`, {
        credentials: "include",
        signal: controller.signal,
      })
        .then(async (response) => {
          if (!response.ok) throw new Error(`Search failed (${response.status})`);
          return (await response.json()) as Results;
        })
        .then((data) => {
          setResponse({ query: trimmed, data, error: null });
          setActive(0);
        })
        .catch((cause: unknown) => {
          if (controller.signal.aborted) return;
          setResponse({
            query: trimmed,
            data: null,
            error: cause instanceof Error ? cause.message : "Search failed",
          });
        });
    }, DEBOUNCE_MS);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [apiBase, trimmed]);

  /* ------------------------------------------------- opening a result field */

  /**
   * The document view renders after the route changes, so the field cannot be
   * scrolled to straight away. Watch for it, then bring it into view and flash
   * it, which is what turns a search result into "here is the thing to edit".
   */
  React.useEffect(() => {
    if (!pendingAnchor) return undefined;

    let cancelled = false;
    let timer = 0;
    const startedAt = Date.now();

    const look = () => {
      if (cancelled) return;
      const element = document.getElementById(pendingAnchor);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
        element.classList.add("ns-field-flash");
        window.setTimeout(() => element.classList.remove("ns-field-flash"), 2400);
        const editable = element.querySelector<HTMLElement>("input:not([readonly]), textarea:not([readonly])");
        editable?.focus({ preventScroll: true });
        setPendingAnchor(null);
        return;
      }
      if (Date.now() - startedAt > 6000) {
        setPendingAnchor(null);
        return;
      }
      timer = window.setTimeout(look, 120);
    };

    timer = window.setTimeout(look, 200);
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [pendingAnchor]);

  const openHit = React.useCallback(
    (hit: Hit) => {
      recentsStore.remember(trimmed);
      setOpen(false);
      inputRef.current?.blur();
      const anchor = hit.editUrl.split("#")[1];
      setPendingAnchor(anchor ?? null);
      router.push(hit.editUrl);
    },
    [router, trimmed],
  );

  /* ------------------------------------------------------------- keyboard */

  const focusSearch = React.useCallback(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
    inputRef.current?.focus();
    inputRef.current?.select();
    setOpen(true);
  }, []);

  React.useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing =
        target instanceof HTMLElement &&
        (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable);

      // A bare slash, and only when nothing is being typed. Ctrl/Cmd + K
      // belongs to the command palette in the header.
      if (event.key === "/" && !typing && !event.metaKey && !event.ctrlKey && !event.altKey) {
        event.preventDefault();
        focusSearch();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [focusSearch]);

  React.useEffect(() => {
    if (!open) return undefined;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // Keep the highlighted row inside the scrolling list.
  React.useEffect(() => {
    if (!open) return;
    listRef.current?.querySelector<HTMLElement>('[data-active="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      if (open) setOpen(false);
      else setQuery("");
      return;
    }
    if (event.key === "Enter") {
      if (showRecents && recents[active]) {
        event.preventDefault();
        setQuery(recents[active]);
        return;
      }
      const hit = hits[active];
      if (hit) {
        event.preventDefault();
        openHit(hit);
      }
      return;
    }
    if (rowCount === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (current + 1) % rowCount);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setOpen(true);
      setActive((current) => (current - 1 + rowCount) % rowCount);
    } else if (event.key === "Home") {
      event.preventDefault();
      setActive(0);
    } else if (event.key === "End") {
      event.preventDefault();
      setActive(rowCount - 1);
    }
  };

  /* -------------------------------------------------------------- rendering */

  const listboxId = "ns-dsearch-listbox";
  const showPanel = open && (trimmed.length >= MIN_QUERY || showRecents);

  return (
    <div className="ns-topbar">
      <div className="ns-topbar__inner" ref={rootRef}>
        <div className={`ns-dsearch${showPanel ? " ns-dsearch--open" : ""}`}>
          <div className="ns-dsearch__field">
            <svg className="ns-dsearch__icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
              <circle cx="9" cy="9" r="5.6" fill="none" stroke="currentColor" strokeWidth="1.7" />
              <path d="M13.2 13.2 17 17" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
            </svg>

            <input
              ref={inputRef}
              className="ns-dsearch__input"
              type="text"
              value={query}
              placeholder="Find any word on the website - a heading, a sentence, a name"
              aria-label="Search all website content"
              autoComplete="off"
              spellCheck={false}
              role="combobox"
              aria-expanded={showPanel}
              aria-controls={listboxId}
              aria-autocomplete="list"
              aria-activedescendant={showPanel && rowCount > 0 ? `ns-dsearch-row-${active}` : undefined}
              onChange={(event) => {
                setQuery(event.target.value);
                setOpen(true);
                setActive(0);
              }}
              onFocus={() => setOpen(true)}
              onKeyDown={onInputKeyDown}
            />

            {loading ? <span className="ns-dsearch__spinner" aria-hidden="true" /> : null}

            {query ? (
              <button
                className="ns-dsearch__clear"
                type="button"
                aria-label="Clear search"
                onClick={() => {
                  setQuery("");
                  inputRef.current?.focus();
                }}
              >
                ×
              </button>
            ) : (
              <kbd className="ns-dsearch__kbd" aria-hidden="true">
                /
              </kbd>
            )}
          </div>

          {showPanel ? (
            <div className="ns-dsearch__panel">
              <ul className="ns-dsearch__list" id={listboxId} role="listbox" ref={listRef}>
                {showRecents
                  ? recents.map((entry, index) => (
                      <li key={entry} role="presentation">
                        <button
                          className="ns-dsearch__row ns-dsearch__row--recent"
                          id={`ns-dsearch-row-${index}`}
                          role="option"
                          aria-selected={index === active}
                          data-active={index === active}
                          type="button"
                          onMouseEnter={() => setActive(index)}
                          onClick={() => {
                            setQuery(entry);
                            inputRef.current?.focus();
                          }}
                        >
                          <span className="ns-dsearch__recent-icon" aria-hidden="true">
                            ↺
                          </span>
                          <span className="ns-dsearch__recent-text">{entry}</span>
                        </button>
                      </li>
                    ))
                  : hits.map((hit, index) => (
                      <li className="ns-dsearch__item" key={hit.id} role="presentation">
                        <button
                          className="ns-dsearch__row"
                          id={`ns-dsearch-row-${index}`}
                          role="option"
                          aria-selected={index === active}
                          data-active={index === active}
                          type="button"
                          onMouseEnter={() => setActive(index)}
                          onClick={() => openHit(hit)}
                          title={hit.publicWhere || undefined}
                        >
                          <span className="ns-dsearch__meta">
                            <span className="ns-dsearch__entity">{hit.entity}</span>
                            <span className="ns-dsearch__title">{hit.title}</span>
                            {hit.publicPath?.startsWith("/") ? (
                              <span className="ns-dsearch__path">{hit.publicPath}</span>
                            ) : null}
                            {hit.status === "draft" ? <span className="ns-dsearch__badge">Draft</span> : null}
                          </span>
                          <Snippet hit={hit} />
                          <span className="ns-dsearch__field-label">{hit.field || "Content"}</span>
                        </button>

                        {hit.publicPath ? (
                          <a
                            className="ns-dsearch__external"
                            href={hit.publicPath}
                            target="_blank"
                            rel="noreferrer"
                            tabIndex={-1}
                            aria-label={`Open ${hit.publicPath} on the website`}
                            title="Open this page on the website"
                          >
                            ↗
                          </a>
                        ) : null}
                      </li>
                    ))}
              </ul>

              {!showRecents && hits.length === 0 && !loading && !error ? (
                <p className="ns-dsearch__empty">
                  Nothing contains <strong>{trimmed}</strong>. Try a shorter word, or part of one.
                </p>
              ) : null}

              {error ? <p className="ns-dsearch__error">{error}</p> : null}

              <div className="ns-dsearch__footer">
                <span>
                  {showRecents
                    ? "Recent searches"
                    : results
                      ? `${results.documents} ${results.documents === 1 ? "match" : "matches"}${
                          results.approximate ? " - closest spellings" : ""
                        }`
                      : "Searching…"}
                </span>
                <span className="ns-dsearch__hints">
                  <kbd>↑</kbd>
                  <kbd>↓</kbd> move <kbd>↵</kbd> edit <kbd>esc</kbd> close
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
