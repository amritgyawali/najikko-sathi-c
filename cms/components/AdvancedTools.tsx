"use client";

import { useConfig } from "@payloadcms/ui";
import { useRouter } from "next/navigation";
import React from "react";

/**
 * The twelve jobs that act on the whole website at once.
 *
 * They live behind one address (cms/endpoints/advanced-tools.ts) and are drawn
 * here as one card each: what it does, the one or two things it needs to know,
 * a button, and the answer underneath it. The same component is the Advanced tab
 * of Site Settings and the bottom half of the dashboard's Tools tab, because a
 * job like "find this wording everywhere" is wanted from both places and is
 * worth writing once.
 *
 * The rules the cards follow:
 *
 * - **Say what will happen before it happens.** A card that rewrites documents
 *   says so in its own words, and offers to show what it would do before doing
 *   it.
 * - **Anything that writes says so in its button.** "Look" and "Change" are
 *   never the same colour and never the same word.
 * - **Nothing is lost.** Every job that writes is covered by the site's own
 *   copies, and the card that needs it says which one to take first.
 */

type Tone = "good" | "warn" | "bad" | "info" | "neutral";

type Row = { label: string; detail?: string; href?: string; tone?: Tone };

type Result = {
  title?: string;
  summary?: string;
  rows?: Row[];
  payload?: string;
  changed?: boolean;
  error?: string;
};

/** What one card needs from the person running it. */
type Input =
  | { kind: "text"; name: string; label: string; placeholder?: string; note?: string }
  | { kind: "area"; name: string; label: string; placeholder?: string; note?: string }
  | { kind: "number"; name: string; label: string; min: number; max: number; fallback: number }
  | { kind: "choice"; name: string; label: string; options: { label: string; value: string }[] }
  | { kind: "many"; name: string; label: string; options: { label: string; value: string }[] };

type Card = {
  tool: string;
  title: string;
  blurb: string;
  /** "look" reads the site; "change" writes to it. */
  act: "look" | "change";
  button: string;
  /** A second button that sends the same inputs with `apply: true`. */
  applyButton?: string;
  inputs?: Input[];
  /** Shown in bold above the buttons when the job rewrites content. */
  caution?: string;
};

const CONTENT_COLLECTIONS = [
  { label: "Website pages", value: "pages" },
  { label: "Posts", value: "posts" },
  { label: "Services", value: "services" },
  { label: "Service categories", value: "service-categories" },
  { label: "Offers", value: "offers" },
  { label: "Questions", value: "faqs" },
  { label: "Team", value: "team-members" },
  { label: "Well-wishers", value: "well-wishers" },
  { label: "Social work", value: "social-work" },
  { label: "Social responsibility", value: "social-responsibility" },
  { label: "Reviews", value: "reviews" },
];

const CARDS: Card[] = [
  {
    tool: "link-check",
    title: "Links that go nowhere",
    blurb:
      "Reads every internal address written anywhere in the dashboard - in a page's own words, in the menu, in the footer - and reports the ones the website will answer with a 404.",
    act: "look",
    button: "Check every link",
  },
  {
    tool: "content-audit",
    title: "What is missing",
    blurb:
      "Pages with no description, posts with no picture, services with nothing written on the card, two pages sharing a name, and anything written but never published.",
    act: "look",
    button: "Look over the content",
  },
  {
    tool: "media-audit",
    title: "The file library, looked over",
    blurb:
      "Which files nothing points at, which have no description for a screen reader, and which are heavy enough to slow a page down.",
    act: "look",
    button: "Look over the files",
  },
  {
    tool: "translation-report",
    title: "How much reads in Nepali",
    blurb:
      "Every line on the site is written twice. This counts the pairs where the English is there and the Nepali is not, page by page.",
    act: "look",
    button: "Count what is left",
  },
  {
    tool: "find-replace",
    title: "Change a wording everywhere",
    blurb:
      "A telephone number, a person's title, a name written three ways - changed in every page, post, service and question at once.",
    act: "change",
    button: "Show what would change",
    applyButton: "Change it everywhere",
    caution:
      "This rewrites documents. Look at the list first, and take a copy of the website before changing anything (Tools → Copies of everything).",
    inputs: [
      { kind: "text", name: "find", label: "Find this", placeholder: "01-4444444" },
      { kind: "text", name: "replace", label: "Replace it with", placeholder: "01-5555555" },
      {
        kind: "many",
        name: "collections",
        label: "Where to look",
        options: CONTENT_COLLECTIONS,
      },
    ],
  },
  {
    tool: "style-preset",
    title: "Try a whole look",
    blurb:
      "Four sets of type and spacing, applied to the Typography and Layout tabs in one go. Every value can still be changed by hand afterwards, and “as designed” clears the lot.",
    act: "change",
    button: "Apply this look",
    inputs: [
      {
        kind: "choice",
        name: "preset",
        label: "Which look",
        options: [
          { label: "As designed - clear everything", value: "designed" },
          { label: "Editorial - serif headings, generous reading", value: "editorial" },
          { label: "Compact - more on the screen at once", value: "compact" },
          { label: "Bold - large headings, strong contrast", value: "bold" },
          { label: "Calm - quiet type, no movement", value: "calm" },
        ],
      },
    ],
  },
  {
    tool: "bulk-status",
    title: "Publish, or unpublish, in bulk",
    blurb:
      "Everything in one collection that is waiting, put on the website at once - or everything that is live, taken off it.",
    act: "change",
    button: "Change them all",
    caution: "This changes what visitors can see. The addresses of anything taken off stop answering.",
    inputs: [
      {
        kind: "choice",
        name: "collection",
        label: "Which collection",
        options: [
          { label: "Website pages", value: "pages" },
          { label: "Posts", value: "posts" },
          { label: "Services", value: "services" },
          { label: "Offers", value: "offers" },
          { label: "Social work", value: "social-work" },
        ],
      },
      {
        kind: "choice",
        name: "to",
        label: "Do what",
        options: [
          { label: "Put everything waiting on the website", value: "published" },
          { label: "Take everything off the website", value: "draft" },
        ],
      },
    ],
  },
  {
    tool: "redirect-import",
    title: "Add redirects in bulk",
    blurb:
      "Old addresses that should send people somewhere new, a line at a time. Anything already redirected is left alone.",
    act: "change",
    button: "Add these redirects",
    inputs: [
      {
        kind: "area",
        name: "text",
        label: "One a line: old address, new address",
        placeholder: "/old-services, /services\n/team → /about",
        note: "A comma, an arrow or a tab between the two. Up to two hundred at a time.",
      },
    ],
  },
  {
    tool: "duplicate-page",
    title: "Copy a page",
    blurb:
      "A page and every section in it, copied under a new name as a draft. The way to build a page that is almost like one you already have.",
    act: "change",
    button: "Make the copy",
    inputs: [
      { kind: "text", name: "pageId", label: "The page's id", note: "Run it with this empty to list every page and its id." },
      { kind: "text", name: "title", label: "Name for the copy", placeholder: "Training - short course" },
    ],
  },
  {
    tool: "settings-snapshot",
    title: "Settings, as text",
    blurb:
      "Every site-wide screen - identity, contact, typography, layout, menu, footer, announcement - as one piece of text to keep or to carry to another site.",
    act: "look",
    button: "Read the settings out",
  },
  {
    tool: "settings-restore",
    title: "Put settings back",
    blurb: "The text from above, applied. Only the screens named in it are touched.",
    act: "change",
    button: "Put these settings back",
    caution: "This overwrites the settings screens named in the text. It does not touch any content.",
    inputs: [{ kind: "area", name: "text", label: "Paste the settings text" }],
  },
  {
    tool: "purge-path",
    title: "Rebuild one page",
    blurb:
      "When a single page looks older than what is saved here. Cheaper than rebuilding the whole website, and the same effect for that one address.",
    act: "change",
    button: "Rebuild it",
    inputs: [{ kind: "text", name: "path", label: "The address", placeholder: "/services" }],
  },
  {
    tool: "prune-traffic",
    title: "Trim the traffic log",
    blurb:
      "The site records a row per visit and reads them back as totals. Anything older than the window below is of no further use.",
    act: "change",
    button: "Trim the log",
    caution: "Removed visits cannot be brought back, and the daily figures for those days go with them.",
    inputs: [{ kind: "number", name: "days", label: "Keep this many days", min: 30, max: 1095, fallback: 180 }],
  },
];

const toneClass = (tone?: Tone): string => `ns-tag ns-tag--${tone ?? "neutral"}`;

function Answer({ result }: { result: Result }) {
  if (result.error) {
    return (
      <p className="ns-run__said ns-run__said--bad" role="status">
        {result.error}
      </p>
    );
  }

  return (
    <div className="ns-answer" role="status">
      {result.title ? <strong className="ns-answer__title">{result.title}</strong> : null}
      {result.summary ? <p className="ns-answer__summary">{result.summary}</p> : null}
      {result.payload ? (
        <textarea className="ns-answer__text" readOnly rows={10} value={result.payload} />
      ) : null}
      {result.rows && result.rows.length > 0 ? (
        <ul className="ns-answer__rows">
          {result.rows.map((row, index) => (
            <li key={`${row.label}-${index}`}>
              <span className={toneClass(row.tone)}>{row.tone ?? "note"}</span>
              {row.href ? (
                <a href={row.href}>{row.label}</a>
              ) : (
                <span className="ns-answer__label">{row.label}</span>
              )}
              {row.detail ? <em>{row.detail}</em> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

function ToolCard({ card, api }: { card: Card; api: string }) {
  const router = useRouter();
  const [values, setValues] = React.useState<Record<string, unknown>>(() => {
    const initial: Record<string, unknown> = {};
    for (const input of card.inputs ?? []) {
      if (input.kind === "number") initial[input.name] = input.fallback;
      else if (input.kind === "choice") initial[input.name] = input.options[0]?.value ?? "";
      else if (input.kind === "many") initial[input.name] = [];
      else initial[input.name] = "";
    }
    return initial;
  });
  const [busy, setBusy] = React.useState(false);
  const [result, setResult] = React.useState<Result | null>(null);

  const set = (name: string, value: unknown) => setValues((previous) => ({ ...previous, [name]: value }));

  const run = async (apply: boolean) => {
    setBusy(true);
    setResult(null);
    try {
      const response = await fetch(`${api}/site-tools/advanced`, {
        method: "POST",
        credentials: "include",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ tool: card.tool, ...values, apply }),
      });
      const body = (await response.json()) as Result;
      setResult(response.ok ? body : { error: body.error ?? "That did not work. Try again in a moment." });
      // Figures and lists elsewhere on the screen may have just changed.
      if (response.ok && body.changed) router.refresh();
    } catch {
      setResult({ error: "The dashboard could not reach the server." });
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className={`ns-tool ns-tool--${card.act}`}>
      <header className="ns-tool__head">
        <h4 className="ns-tool__title">{card.title}</h4>
        <span className={`ns-tag ns-tag--${card.act === "look" ? "info" : "warn"}`}>
          {card.act === "look" ? "reads only" : "changes the site"}
        </span>
      </header>
      <p className="ns-tool__blurb">{card.blurb}</p>

      {card.inputs?.map((input) => (
        <label className="ns-tool__field" key={input.name}>
          <span>{input.label}</span>
          {input.kind === "area" ? (
            <textarea
              rows={4}
              placeholder={input.placeholder}
              value={String(values[input.name] ?? "")}
              onChange={(event) => set(input.name, event.target.value)}
            />
          ) : input.kind === "number" ? (
            <input
              type="number"
              min={input.min}
              max={input.max}
              value={Number(values[input.name] ?? input.fallback)}
              onChange={(event) => set(input.name, Number(event.target.value))}
            />
          ) : input.kind === "choice" ? (
            <select
              value={String(values[input.name] ?? "")}
              onChange={(event) => set(input.name, event.target.value)}
            >
              {input.options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          ) : input.kind === "many" ? (
            <span className="ns-tool__checks">
              {input.options.map((option) => {
                const chosen = Array.isArray(values[input.name])
                  ? (values[input.name] as string[])
                  : [];
                return (
                  <label key={option.value}>
                    <input
                      type="checkbox"
                      checked={chosen.includes(option.value)}
                      onChange={(event) =>
                        set(
                          input.name,
                          event.target.checked
                            ? [...chosen, option.value]
                            : chosen.filter((value) => value !== option.value),
                        )
                      }
                    />
                    {option.label}
                  </label>
                );
              })}
            </span>
          ) : (
            <input
              type="text"
              placeholder={input.placeholder}
              value={String(values[input.name] ?? "")}
              onChange={(event) => set(input.name, event.target.value)}
            />
          )}
          {"note" in input && input.note ? <em>{input.note}</em> : null}
        </label>
      ))}

      {card.caution ? <p className="ns-tool__caution">{card.caution}</p> : null}

      <div className="ns-tools">
        <button
          type="button"
          className={`ns-btn${card.act === "look" || card.applyButton ? "" : " ns-btn--primary"}`}
          disabled={busy}
          onClick={() => void run(false)}
        >
          {busy ? "Working…" : card.button}
        </button>
        {card.applyButton ? (
          <button
            type="button"
            className="ns-btn ns-btn--primary"
            disabled={busy}
            onClick={() => void run(true)}
          >
            {card.applyButton}
          </button>
        ) : null}
      </div>

      {result ? <Answer result={result} /> : null}
    </section>
  );
}

/** All twelve, in a grid. */
export function AdvancedTools() {
  const { config } = useConfig();
  const api = config?.routes?.api || "/api";

  return (
    <div className="ns-toolshelf">
      {CARDS.map((card) => (
        <ToolCard api={api} card={card} key={card.tool} />
      ))}
    </div>
  );
}

/**
 * The same shelf, as a field on the Advanced tab of Site Settings.
 *
 * It holds no value of its own - it is a `ui` field - so it needs no column and
 * no migration. It is here because the screen an owner opens to change the site
 * is also the screen they should be able to check it from.
 */
export function AdvancedToolsField() {
  return (
    <div className="ns-toolshelf-wrap field-type">
      <p className="ns-toolshelf__intro">
        Twelve jobs that read or change the whole website at once. The ones marked “reads only” are safe to
        run at any time; the others say what they will change before they do it.
      </p>
      <AdvancedTools />
    </div>
  );
}

export default AdvancedTools;
