"use client";

import React from "react";

/**
 * The dashboard's tab strip.
 *
 * Everything an owner might want is now on the home screen - traffic, the pages,
 * the pictures, what is waiting, what search engines make of the site, whether
 * the backups are running - and all of it on one scroll would be a wall. So the
 * panels are grouped, and each group is a tab.
 *
 * Every panel is rendered on the server and handed here as a child, then simply
 * hidden or shown. Nothing is fetched when a tab is opened, so switching is
 * instant, and the browser's own Find still reaches text on the tabs that are
 * closed.
 */

export type Section = {
  key: string;
  label: string;
  icon: React.ReactNode;
  /** A number worth seeing before the tab is opened, e.g. how many are waiting. */
  badge?: number;
  panel: React.ReactNode;
};

const REMEMBERED = "ns-dashboard-tab";

/**
 * The remembered tab, read as an external store rather than in an effect.
 *
 * The server has no idea which tab this browser was last on, so it always
 * renders the first one. Reading local storage this way lets React swap to the
 * remembered tab immediately after hydration without the two renders ever
 * disagreeing - and keeps two dashboards open in two tabs in step.
 */
const subscribe = (changed: () => void) => {
  window.addEventListener("storage", changed);
  return () => window.removeEventListener("storage", changed);
};

const readRemembered = (): string | null => {
  try {
    return window.localStorage.getItem(REMEMBERED);
  } catch {
    // Private browsing, or storage turned off. The first tab is a fine default.
    return null;
  }
};

export function Workspace({ sections }: { sections: Section[] }) {
  const remembered = React.useSyncExternalStore(subscribe, readRemembered, () => null);
  const [chosen, setChosen] = React.useState<string | null>(null);
  const tabsRef = React.useRef<HTMLDivElement>(null);

  const wanted = chosen ?? remembered;
  const active = sections.some((section) => section.key === wanted)
    ? (wanted as string)
    : (sections[0]?.key ?? "");

  const go = (key: string) => {
    setChosen(key);
    try {
      window.localStorage.setItem(REMEMBERED, key);
    } catch {
      // Not being able to remember the choice is not a reason to refuse it.
    }
  };

  /* The arrow-key behaviour a tab strip is expected to have. */
  const onKey = (event: React.KeyboardEvent<HTMLDivElement>) => {
    const index = sections.findIndex((section) => section.key === active);
    if (index < 0) return;

    const step =
      event.key === "ArrowRight" ? 1 : event.key === "ArrowLeft" ? -1 : event.key === "Home" ? -index : event.key === "End" ? sections.length - 1 - index : 0;
    if (step === 0) return;

    event.preventDefault();
    const next = sections[(index + step + sections.length) % sections.length];
    go(next.key);
    const buttons = tabsRef.current?.querySelectorAll<HTMLButtonElement>("button[role='tab']");
    buttons?.[sections.indexOf(next)]?.focus();
  };

  return (
    <div className="ns-work">
      <div className="ns-work__tabs" role="tablist" aria-label="Dashboard sections" ref={tabsRef} onKeyDown={onKey}>
        {sections.map((section) => {
          const current = section.key === active;
          return (
            <button
              key={section.key}
              type="button"
              role="tab"
              id={`ns-tab-${section.key}`}
              aria-controls={`ns-panel-${section.key}`}
              aria-selected={current}
              tabIndex={current ? 0 : -1}
              className={`ns-work__tab${current ? " is-active" : ""}`}
              onClick={() => go(section.key)}
            >
              <span className="ns-work__tabicon">{section.icon}</span>
              {section.label}
              {section.badge ? <span className="ns-work__badge">{section.badge}</span> : null}
            </button>
          );
        })}
      </div>

      {sections.map((section) => (
        <div
          key={section.key}
          role="tabpanel"
          id={`ns-panel-${section.key}`}
          aria-labelledby={`ns-tab-${section.key}`}
          className="ns-work__panel"
          hidden={section.key !== active}
        >
          {section.panel}
        </div>
      ))}
    </div>
  );
}

export default Workspace;
