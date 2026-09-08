import Link from "next/link";
import React from "react";

import type { Audit, Change, Check, Health, Inbox, Scheduled, Traffic } from "../../dashboard/insights";
import { RunButton } from "./Actions";
import { Bars, Empty, Icon, Panel, Ring, Tag, ago, nf, when } from "./ui";

/**
 * The panels that read a figure and draw it. One file, because each of them is
 * twenty lines and splitting them across seven would make the dashboard harder
 * to change, not easier.
 */

/* ------------------------------------------------------------------- waiting */

/** What is waiting on the person reading, and one click to deal with it. */
export function Waiting({ inbox }: { inbox: Inbox }) {
  const pressing = inbox.items.filter((item) => item.count > 0);

  return (
    <Panel
      title="Waiting on you"
      icon="inbox"
      accent={1}
      meta={inbox.total > 0 ? `${inbox.total} thing${inbox.total === 1 ? "" : "s"}` : "All clear"}
    >
      {pressing.length === 0 ? (
        <div className="ns-clear">
          <Icon name="check" />
          <div>
            <strong>Nothing is waiting.</strong>
            <span>Every message is answered, every review is decided and every page is live.</span>
          </div>
        </div>
      ) : (
        <ul className="ns-queue">
          {pressing.map((item) => (
            <li className={`ns-queue__item ns-queue__item--${item.tone}`} key={item.key}>
              <Link className="ns-queue__link" href={item.href}>
                <strong className="ns-queue__count">{item.count}</strong>
                <span className="ns-queue__label">{item.label}</span>
                <span className="ns-queue__note">{item.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}

      {inbox.enquiries.length > 0 ? (
        <>
          <h4 className="ns-studio__heading">Newest messages</h4>
          <ul className="ns-list">
            {inbox.enquiries.map((enquiry) => (
              <li key={enquiry.id}>
                <Link href={`/admin/collections/enquiries/${enquiry.id}`}>
                  <span className="ns-list__name">{enquiry.name}</span>
                  {enquiry.service ? <span className="ns-list__note">about {enquiry.service}</span> : null}
                </Link>
                <span className="ns-list__time">{ago(enquiry.createdAt)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {inbox.reviews.length > 0 ? (
        <>
          <h4 className="ns-studio__heading">Reviews awaiting approval</h4>
          <ul className="ns-list">
            {inbox.reviews.map((review) => (
              <li key={review.id}>
                <Link href={`/admin/collections/reviews/${review.id}`}>
                  <span className="ns-list__name">{review.name}</span>
                  {review.quote ? (
                    <span className="ns-list__note">“{review.quote.slice(0, 70)}…”</span>
                  ) : null}
                </Link>
                <span className="ns-list__time">{review.rating ? `${review.rating}/5` : ""}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Panel>
  );
}

/* ------------------------------------------------------------------ activity */

const STATUS_TONE: Record<string, "good" | "warn"> = { published: "good", draft: "warn" };

/** Everything that changed lately, newest first. */
export function Activity({ changes }: { changes: Change[] }) {
  return (
    <Panel title="Lately" icon="clock" accent={4} meta={`${changes.length} recent changes`}>
      {changes.length === 0 ? (
        <Empty>Nothing has been changed yet.</Empty>
      ) : (
        <ol className="ns-feed">
          {changes.map((change) => (
            <li className="ns-feed__item" key={`${change.collection}-${change.href}-${change.at}`}>
              <span className="ns-feed__dot" aria-hidden="true" />
              <Link className="ns-feed__title" href={change.href}>
                {change.title}
              </Link>
              <span className="ns-feed__kind">{change.label}</span>
              {change.status ? (
                <Tag tone={STATUS_TONE[change.status] ?? "neutral"}>
                  {change.status === "published" ? "live" : change.status}
                </Tag>
              ) : null}
              <span className="ns-feed__time">{ago(change.at)}</span>
            </li>
          ))}
        </ol>
      )}
    </Panel>
  );
}

/* ---------------------------------------------------------------- the audits */

/** A list of things wrong, worst first, each one a link to where it is fixed. */
export function Findings({
  audit,
  title,
  clean,
  icon,
  accent,
  ringLabel,
}: {
  audit: Audit;
  title: string;
  clean: string;
  icon: string;
  accent: 1 | 2 | 3 | 4 | 5 | 6;
  ringLabel: string;
}) {
  const worst = audit.findings.filter((finding) => finding.severity === "high").length;

  return (
    <Panel
      title={title}
      icon={icon}
      accent={accent}
      wide
      meta={
        audit.findings.length === 0
          ? "Nothing to fix"
          : `${audit.findings.length} to look at${worst > 0 ? ` · ${worst} important` : ""}`
      }
    >
      <div className="ns-scorerow">
        <Ring score={audit.score} label={ringLabel} />
        <p className="ns-scorerow__say">
          {audit.findings.length === 0
            ? clean
            : `${audit.checked} things were checked. Each one below is a change an editor can make in the dashboard in under a minute, and each links straight to where it is made.`}
        </p>
      </div>

      {audit.findings.length > 0 ? (
        <ul className="ns-findings">
          {audit.findings.map((finding) => (
            <li className={`ns-finding ns-finding--${finding.severity}`} key={`${finding.where}-${finding.title}`}>
              <Link className="ns-finding__title" href={finding.href}>
                {finding.title}
              </Link>
              <span className="ns-finding__where">{finding.where}</span>
              <span className="ns-finding__fix">{finding.fix}</span>
            </li>
          ))}
        </ul>
      ) : null}
    </Panel>
  );
}

/* -------------------------------------------------------------------- health */

const CHECK_TONE: Record<Check["state"], "good" | "warn" | "bad"> = {
  ok: "good",
  warn: "warn",
  bad: "bad",
};

export function SiteHealth({ health }: { health: Health }) {
  const bad = health.checks.filter((check) => check.state !== "ok").length;

  return (
    <Panel
      title="Is everything set up?"
      icon="shield"
      accent={6}
      meta={bad === 0 ? "Everything is in order" : `${bad} worth attending to`}
    >
      <div className="ns-scorerow">
        <Ring score={health.score} label="Set up" />
        <p className="ns-scorerow__say">
          Each of these reads something real - a setting on the server, the age of the newest backup,
          whether anything has been written to the traffic log this week.
        </p>
      </div>
      <ul className="ns-checks">
        {health.checks.map((check) => (
          <li className="ns-check" key={check.label}>
            <Tag tone={CHECK_TONE[check.state]}>
              {check.state === "ok" ? "Good" : check.state === "warn" ? "Look" : "Fix"}
            </Tag>
            <span className="ns-check__label">
              {check.href ? <Link href={check.href}>{check.label}</Link> : check.label}
            </span>
            <span className="ns-check__detail">{check.detail}</span>
          </li>
        ))}
      </ul>
    </Panel>
  );
}

/* ------------------------------------------------------------------ calendar */

const KIND_WORD: Record<Scheduled["kind"], string> = {
  publishes: "goes live",
  hides: "comes off the site",
  published: "was published",
};

const KIND_TONE: Record<Scheduled["kind"], "good" | "warn" | "neutral"> = {
  publishes: "good",
  hides: "warn",
  published: "neutral",
};

/** What the website will do on its own, and what it did lately. */
export function Calendar({ entries }: { entries: Scheduled[] }) {
  const now = new Date().toISOString();
  const ahead = entries.filter((entry) => entry.at > now);
  const behind = entries.filter((entry) => entry.at <= now).slice(-6).reverse();

  return (
    <Panel
      title="The schedule"
      icon="calendar"
      accent={2}
      meta={ahead.length > 0 ? `${ahead.length} coming up` : "Nothing scheduled"}
      intro="Posts and offers can be given a time to appear and a time to disappear. Anything set that way is listed here, so nothing goes live - or vanishes - unexpectedly."
    >
      {ahead.length === 0 ? (
        <Empty>
          Nothing is scheduled. Set &ldquo;publish at&rdquo; on a post or an offer and it will appear here.
        </Empty>
      ) : (
        <ul className="ns-feed">
          {ahead.map((entry) => (
            <li className="ns-feed__item" key={`${entry.href}-${entry.kind}-${entry.at}`}>
              <span className="ns-feed__dot" aria-hidden="true" />
              <Link className="ns-feed__title" href={entry.href}>
                {entry.title}
              </Link>
              <span className="ns-feed__kind">{entry.label}</span>
              <Tag tone={KIND_TONE[entry.kind]}>{KIND_WORD[entry.kind]}</Tag>
              <span className="ns-feed__time">{when(entry.at)}</span>
            </li>
          ))}
        </ul>
      )}

      {behind.length > 0 ? (
        <>
          <h4 className="ns-studio__heading">Recently published</h4>
          <ul className="ns-list">
            {behind.map((entry) => (
              <li key={`${entry.href}-${entry.at}`}>
                <Link href={entry.href}>
                  <span className="ns-list__name">{entry.title}</span>
                  <span className="ns-list__note">{entry.label}</span>
                </Link>
                <span className="ns-list__time">{ago(entry.at)}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </Panel>
  );
}

/* ------------------------------------------------------------------- traffic */

const HOURS = ["00", "03", "06", "09", "12", "15", "18", "21"];

/** Where visitors came from, what they read, and when they turn up. */
export function TrafficDetail({ traffic }: { traffic: Traffic }) {
  const busiest = traffic.byHour.indexOf(Math.max(...traffic.byHour));
  const peak = Math.max(1, ...traffic.byHour);

  return (
    <>
      <div className="ns-grid ns-grid--three">
        <Panel title="Most read pages" icon="page" accent={5} meta="Last 30 days">
          <Bars accent={5} rows={traffic.topPages} empty="No visits recorded yet." />
        </Panel>
        <Panel title="Where they came from" icon="compass" accent={6} meta="Last 30 days">
          <Bars accent={6} rows={traffic.topReferrers} empty="Nobody has arrived from another website yet." />
        </Panel>
        <Panel title="What they read on" icon="pulse" accent={2} meta="Last 30 days">
          <Bars accent={2} rows={traffic.devices} empty="No devices recorded yet." />
        </Panel>
      </div>

      <Panel
        title="When people visit"
        icon="clock"
        accent={3}
        wide
        meta={traffic.total > 0 ? `Busiest around ${String(busiest).padStart(2, "0")}:00` : undefined}
        intro="Hour by hour, over the last thirty days, in Nepal time. Useful for deciding when to publish."
      >
        {traffic.total === 0 ? (
          <Empty>Nothing has been recorded yet.</Empty>
        ) : (
          <>
            <div className="ns-hours">
              {traffic.byHour.map((count, hour) => (
                <span
                  className="ns-hours__col"
                  key={hour}
                  title={`${String(hour).padStart(2, "0")}:00 - ${nf(count)} visits`}
                >
                  <span className="ns-hours__bar" style={{ height: `${Math.max(2, (count / peak) * 100)}%` }} />
                </span>
              ))}
            </div>
            <div className="ns-hours__axis">
              {HOURS.map((hour) => (
                <span key={hour}>{hour}</span>
              ))}
            </div>
          </>
        )}
      </Panel>
    </>
  );
}

/* ------------------------------------------------------------------- toolbox */

const EXPORTS: [slug: string, label: string][] = [
  ["enquiries", "Enquiries"],
  ["reviews", "Reviews"],
  ["posts", "Posts"],
  ["pages", "Pages"],
  ["services", "Services"],
  ["offers", "Offers"],
  ["team-members", "Team"],
  ["media", "File library"],
  ["pageviews", "Traffic log"],
];

/** The jobs that are not editing anything: rebuild, back up, export, restore. */
export function Toolbox({ backupHint }: { backupHint: string }) {
  return (
    <div className="ns-grid ns-grid--two">
      <Panel
        title="Keep the website in step"
        icon="bolt"
        accent={5}
        intro="Every save already updates the website by itself. These are for the times you want to be certain: after a deploy, or when a page looks older than what is saved here."
      >
        <div className="ns-tools">
          <RunButton
            job="refresh"
            label="Rebuild the website"
            primary
            hint="Pushes everything saved in the dashboard out to every page a visitor sees."
          />
          <a className="ns-btn" href="/" target="_blank" rel="noreferrer">
            Open the website
          </a>
          <a className="ns-btn" href="/sitemap.xml" target="_blank" rel="noreferrer">
            View the sitemap
          </a>
          <a className="ns-btn" href="/robots.txt" target="_blank" rel="noreferrer">
            View robots.txt
          </a>
        </div>
        <p className="ns-note">
          The sitemap is what a search engine reads to find every page. It is written from the pages that
          are live, so publishing a page adds it and taking one off removes it.
        </p>
      </Panel>

      <Panel
        title="Copies of everything"
        icon="shield"
        accent={6}
        meta={backupHint}
        intro="A copy holds every word, setting, question, review and link on the site. Restoring one puts all of it back, and takes a copy of the present state first so a restore can itself be undone."
      >
        <div className="ns-tools">
          <RunButton job="backup" label="Back up now" primary hint="Takes a copy of the whole website." />
          <a className="ns-btn" href="/backup" download>
            Download a copy
          </a>
          <Link className="ns-btn" href="/admin/collections/backups">
            All copies, and restore
          </Link>
        </div>
      </Panel>

      <Panel
        title="Take the data out"
        icon="tools"
        accent={4}
        wide
        intro="Any of these opens as a spreadsheet. Useful for a mailing list, a report, or simply keeping a record somewhere other than this website."
      >
        <div className="ns-tools">
          {EXPORTS.map(([slug, label]) => (
            <a className="ns-btn" key={slug} href={`/api/site-tools/export?collection=${slug}`}>
              {label} <span aria-hidden="true">↓</span>
            </a>
          ))}
        </div>
        <p className="ns-note">
          Files are CSV, which Excel, Numbers and Google Sheets all open directly.
        </p>
      </Panel>

      <Panel title="Getting around quickly" icon="bolt" accent={3} wide>
        <ul className="ns-keys">
          <li>
            <kbd>⌘</kbd>
            <kbd>K</kbd>
            <span>Search everything, or type what you want to do. Works on every screen.</span>
          </li>
          <li>
            <kbd>Ctrl</kbd>
            <kbd>K</kbd>
            <span>The same, on Windows.</span>
          </li>
          <li>
            <kbd>↑</kbd>
            <kbd>↓</kbd>
            <span>Move through the results.</span>
          </li>
          <li>
            <kbd>↵</kbd>
            <span>Open what is selected, or run the job.</span>
          </li>
          <li>
            <kbd>esc</kbd>
            <span>Close the search.</span>
          </li>
          <li>
            <kbd>←</kbd>
            <kbd>→</kbd>
            <span>Move between the tabs above, once one of them has focus.</span>
          </li>
        </ul>
      </Panel>
    </div>
  );
}
