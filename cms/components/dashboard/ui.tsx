import React from "react";

/**
 * The pieces every dashboard panel is built from.
 *
 * All of them are plain server components: they take finished numbers and draw
 * them, hold no state and ship no JavaScript. Only the four things that genuinely
 * need to react to a click - the workspace tabs, the command palette, the chart's
 * range switch and the tool buttons - are client components, which is why the
 * dashboard stays fast however many panels are added to it.
 */

/** The six discipline colours the website uses, reused across the dashboard. */
export type Accent = 1 | 2 | 3 | 4 | 5 | 6;

const cx = (...values: (string | false | null | undefined)[]) => values.filter(Boolean).join(" ");

export const nf = (value: number): string => value.toLocaleString("en-GB");

/** Bytes as something a person reads, not as a number of bytes. */
export const size = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1_048_576) return `${Math.round(bytes / 1024)} KB`;
  if (bytes < 1_073_741_824) return `${Math.round(bytes / 104_857.6) / 10} MB`;
  return `${Math.round(bytes / 107_374_182.4) / 10} GB`;
};

/** "3 minutes ago", "yesterday", "12 Mar" - whichever is the most useful. */
export const ago = (iso?: string | null): string => {
  if (!iso) return "";
  const then = Date.parse(iso);
  if (!Number.isFinite(then)) return "";
  const seconds = Math.round((Date.now() - then) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const days = Math.round(hours / 24);
  if (days === 1) return "yesterday";
  if (days < 8) return `${days} days ago`;
  return new Date(then).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
};

/** A date and time in Nepal, where the people reading this dashboard are. */
export const when = (iso?: string | null): string => {
  if (!iso) return "";
  const time = Date.parse(iso);
  if (!Number.isFinite(time)) return "";
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Kathmandu",
  }).format(time);
};

/* --------------------------------------------------------------------- icons */

/**
 * A small, self-drawn icon set. Payload ships lucide-react, but an icon here is
 * used at one size in one weight, so a path costs less than a component and
 * never depends on the icon library keeping its name.
 */
const PATHS: Record<string, React.ReactNode> = {
  pulse: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  eye: (
    <>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  inbox: (
    <>
      <path d="M3 13h5l1.5 3h5L16 13h5" />
      <path d="M4.5 5h15l1.5 8v5a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-5Z" />
    </>
  ),
  star: <path d="m12 3.6 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.8l5.9-.8Z" />,
  page: (
    <>
      <path d="M6 3h8l4 4v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
      <path d="M14 3v5h4" />
    </>
  ),
  image: (
    <>
      <rect x="3" y="4.5" width="18" height="15" rx="2" />
      <circle cx="8.5" cy="10" r="1.6" />
      <path d="m4 17 5-4.5 4 3.5 3-2.5 4 3.5" />
    </>
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </>
  ),
  bolt: <path d="M13 2 4.5 13.5H11L10 22l9-11.5h-6.5L13 2Z" />,
  shield: <path d="M12 3 5 6v6c0 4.2 2.8 7.6 7 9 4.2-1.4 7-4.8 7-9V6Z" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="16" rx="2" />
      <path d="M3.5 10h17M8 3v4M16 3v4" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5Z" />
    </>
  ),
  tools: (
    <>
      <path d="M14.5 6.5a3.5 3.5 0 0 0 4.6 4.6l-8 8a2.3 2.3 0 0 1-3.2-3.2Z" />
      <path d="m5 5 3 3" />
    </>
  ),
  check: <path d="m5 12.5 4.5 4.5L19 7" />,
  alert: (
    <>
      <path d="M12 8v5" />
      <circle cx="12" cy="16.5" r="0.8" fill="currentColor" stroke="none" />
      <path d="M10.3 4.2 2.9 17.4A2 2 0 0 0 4.6 20.4h14.8a2 2 0 0 0 1.7-3l-7.4-13.2a2 2 0 0 0-3.4 0Z" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.3" />
      <path d="M2.8 20a6.2 6.2 0 0 1 12.4 0M16 5.6a3.3 3.3 0 0 1 0 6.4M17.5 20h3.7a5.6 5.6 0 0 0-3.3-5.1" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5.3l3.4 2" />
    </>
  ),
};

export function Icon({ name, className }: { name: keyof typeof PATHS | string; className?: string }) {
  const path = PATHS[name] ?? PATHS.pulse;
  return (
    <svg
      className={cx("ns-icon", className)}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
    >
      {path}
    </svg>
  );
}

/* -------------------------------------------------------------------- panels */

export function Panel({
  title,
  meta,
  icon,
  accent,
  actions,
  intro,
  wide,
  children,
}: {
  title: string;
  meta?: React.ReactNode;
  icon?: string;
  accent?: Accent;
  actions?: React.ReactNode;
  intro?: React.ReactNode;
  wide?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={cx("ns-card", accent && `ns-card--c${accent}`, wide && "ns-card--wide")}>
      <header className="ns-card__head">
        <h3 className="ns-card__title">
          {icon ? <Icon name={icon} className="ns-card__icon" /> : null}
          {title}
        </h3>
        {meta ? <span className="ns-card__meta">{meta}</span> : null}
        {actions ? <span className="ns-card__actions">{actions}</span> : null}
      </header>
      {intro ? <p className="ns-card__intro">{intro}</p> : null}
      {children}
    </section>
  );
}

export function Empty({ children }: { children: React.ReactNode }) {
  return <p className="ns-empty">{children}</p>;
}

/* ---------------------------------------------------------------- statistics */

/**
 * The line drawn inside a figure tile. Deliberately abstract - no axis, no
 * labels - because its job is to say "rising" or "falling" at a glance, and the
 * exact numbers are one panel further down.
 */
export function Sparkline({ points, accent }: { points: number[]; accent?: Accent }) {
  if (points.length < 2) return null;
  const peak = Math.max(1, ...points);
  const step = 100 / (points.length - 1);
  const at = (value: number, index: number) => `${index * step},${28 - (value / peak) * 26}`;
  const line = points.map((value, index) => at(value, index)).join(" ");

  return (
    <svg
      className={cx("ns-spark", accent && `ns-spark--c${accent}`)}
      viewBox="0 0 100 30"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
    >
      <polygon className="ns-spark__area" points={`0,30 ${line} 100,30`} />
      <polyline className="ns-spark__line" points={line} />
    </svg>
  );
}

/** The rise or fall against the period before, as a pill. */
export function Change({ change }: { change: number | null }) {
  if (change === null) return <span className="ns-delta ns-delta--new">new</span>;
  if (change === 0) return <span className="ns-delta">level</span>;
  const up = change > 0;
  return (
    <span className={cx("ns-delta", up ? "ns-delta--up" : "ns-delta--down")}>
      <svg viewBox="0 0 12 12" aria-hidden="true" focusable="false">
        <path d={up ? "M6 2.5 10 8H2Z" : "M6 9.5 2 4h8Z"} fill="currentColor" />
      </svg>
      {Math.abs(change)}%
    </span>
  );
}

export function Stat({
  label,
  value,
  hint,
  change,
  spark,
  accent,
  tone,
  href,
}: {
  label: string;
  value: React.ReactNode;
  hint?: React.ReactNode;
  change?: number | null;
  spark?: number[];
  accent?: Accent;
  tone?: "attention" | "calm";
  href?: string;
}) {
  const body = (
    <>
      <span className="ns-tile__label">{label}</span>
      <span className="ns-tile__row">
        <strong className="ns-tile__value">{value}</strong>
        {change !== undefined ? <Change change={change} /> : null}
      </span>
      {hint ? <span className="ns-tile__hint">{hint}</span> : null}
      {spark ? <Sparkline points={spark} accent={accent} /> : null}
    </>
  );

  const className = cx(
    "ns-tile",
    accent && `ns-tile--c${accent}`,
    tone === "attention" && "ns-tile--attention",
    href && "ns-tile--link",
  );

  return href ? (
    <a className={className} href={href}>
      {body}
    </a>
  ) : (
    <div className={className}>{body}</div>
  );
}

/** A ranked magnitude list. One hue, share of the total at the end of each bar. */
export function Bars({
  rows,
  empty,
  accent,
}: {
  rows: { label: string; count: number; share: number }[];
  empty: string;
  accent?: Accent;
}) {
  if (rows.length === 0) return <Empty>{empty}</Empty>;
  const top = rows[0]?.count ?? 0;

  return (
    <ul className={cx("ns-bars", accent && `ns-bars--c${accent}`)}>
      {rows.map((row) => (
        <li className="ns-bars__row" key={row.label} title={`${row.label}: ${nf(row.count)} (${row.share}%)`}>
          <span className="ns-bars__name">{row.label}</span>
          <span className="ns-bars__track" aria-hidden="true">
            <span
              className="ns-bars__fill"
              style={{ width: `${top ? Math.max(3, Math.round((row.count / top) * 100)) : 0}%` }}
            />
          </span>
          <span className="ns-bars__value">
            {nf(row.count)}
            <em>{row.share}%</em>
          </span>
        </li>
      ))}
    </ul>
  );
}

/**
 * A score out of a hundred, drawn as a ring. Used for the SEO, media and health
 * panels so the three of them can be compared without reading a word.
 */
export function Ring({ score, label }: { score: number; label: string }) {
  const tone = score >= 90 ? "good" : score >= 65 ? "fair" : "poor";
  const circumference = 2 * Math.PI * 26;

  return (
    <div className={`ns-ring ns-ring--${tone}`}>
      <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
        <circle className="ns-ring__track" cx="32" cy="32" r="26" />
        <circle
          className="ns-ring__value"
          cx="32"
          cy="32"
          r="26"
          strokeDasharray={`${(score / 100) * circumference} ${circumference}`}
        />
      </svg>
      <span className="ns-ring__score">{score}</span>
      <span className="ns-ring__label">{label}</span>
    </div>
  );
}

/** A small status word: the state of a check, a document or a queue. */
export function Tag({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "good" | "warn" | "bad" | "neutral" | "info";
}) {
  return <span className={`ns-tag ns-tag--${tone}`}>{children}</span>;
}

/** A horizontal progress bar, for "9 of 14 places have a picture". */
export function Meter({ value, total, tone }: { value: number; total: number; tone?: "good" | "warn" }) {
  const percent = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div className={cx("ns-meter", tone && `ns-meter--${tone}`)}>
      <span className="ns-meter__fill" style={{ width: `${percent}%` }} />
    </div>
  );
}
