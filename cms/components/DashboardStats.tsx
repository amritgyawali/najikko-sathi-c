import type { Payload, Where } from "payload";
import React from "react";

/**
 * The overview panel on the dashboard home.
 *
 * It answers what an owner actually opens the dashboard for: how much traffic
 * came in and where from, what people read, and what is waiting on them. All of
 * it is computed from the site's own pageviews table - no third-party analytics.
 */

type Props = { payload?: Payload };

const DAY = 86_400_000;
const since = (days: number) => new Date(Date.now() - days * DAY).toISOString();

type Traffic = {
  topPages: [string, number][];
  topReferrers: [string, number][];
  devices: [string, number][];
  trend: { date: string; count: number }[];
};

/**
 * Summarises the last 30 days of pageviews. Kept out of the component because
 * it reads the clock, which a render is not allowed to do.
 */
async function loadTraffic(payload: Payload): Promise<Traffic> {
  const empty: Traffic = { topPages: [], topReferrers: [], devices: [], trend: [] };

  try {
    const recent = await payload.find({
      collection: "pageviews",
      where: { createdAt: { greater_than: since(30) } },
      limit: 5000,
      depth: 0,
      pagination: false,
      overrideAccess: true,
    });

    const tally = (values: (string | null | undefined)[]): [string, number][] => {
      const counts = new Map<string, number>();
      for (const value of values) {
        if (!value) continue;
        counts.set(value, (counts.get(value) ?? 0) + 1);
      }
      return [...counts.entries()].sort((a, b) => b[1] - a[1]);
    };

    const docs = recent.docs as { path?: string; referrer?: string; device?: string; createdAt?: string }[];

    // Bucket the last 14 days, including days with no traffic at all.
    const today = Date.now();
    const byDay = new Map<string, number>();
    for (let index = 13; index >= 0; index -= 1) {
      byDay.set(new Date(today - index * DAY).toISOString().slice(0, 10), 0);
    }
    for (const doc of docs) {
      if (!doc.createdAt) continue;
      const key = doc.createdAt.slice(0, 10);
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
    }

    return {
      topPages: tally(docs.map((doc) => doc.path)).slice(0, 6),
      topReferrers: tally(docs.map((doc) => doc.referrer)).slice(0, 6),
      devices: tally(docs.map((doc) => doc.device)),
      trend: [...byDay.entries()].map(([date, count]) => ({ date, count })),
    };
  } catch {
    // Show an empty panel rather than failing the dashboard.
    return empty;
  }
}

function Stat({
  title,
  value,
  hint,
  tone,
}: {
  title: string;
  value: React.ReactNode;
  hint?: string;
  tone?: "attention" | "calm";
}) {
  return (
    <div className={`ns-stat${tone === "attention" ? " ns-stat--attention" : ""}`}>
      <span className="ns-stat__label">{title}</span>
      <strong className="ns-stat__value">{value}</strong>
      {hint ? <span className="ns-stat__hint">{hint}</span> : null}
    </div>
  );
}

/** A ranked magnitude list: one hue, value shown at the end of each bar. */
function Breakdown({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  const top = rows[0]?.[1] ?? 0;
  return (
    <section className="ns-panel">
      <h3 className="ns-panel__title">{title}</h3>
      {rows.length === 0 ? (
        <p className="ns-panel__empty">{empty}</p>
      ) : (
        <ul className="ns-bars">
          {rows.map(([name, count]) => (
            <li className="ns-bars__row" key={name} title={`${name}: ${count.toLocaleString()}`}>
              <span className="ns-bars__name">{name}</span>
              <span className="ns-bars__track" aria-hidden="true">
                <span
                  className="ns-bars__fill"
                  style={{ width: `${top ? Math.max(2, Math.round((count / top) * 100)) : 0}%` }}
                />
              </span>
              <span className="ns-bars__value">{count.toLocaleString()}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

/** Daily traffic. One series, so no legend - the panel title names it. */
function Trend({ days }: { days: { date: string; count: number }[] }) {
  const peak = Math.max(1, ...days.map((day) => day.count));
  const total = days.reduce((sum, day) => sum + day.count, 0);
  const format = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

  return (
    <section className="ns-panel">
      <div className="ns-panel__head">
        <h3 className="ns-panel__title">Views per day</h3>
        <span className="ns-panel__meta">{total.toLocaleString()} in the last 14 days</span>
      </div>
      <div className="ns-chart">
        {days.map((day) => (
          <div
            className="ns-chart__col"
            key={day.date}
            title={`${format(day.date)}: ${day.count.toLocaleString()} ${day.count === 1 ? "view" : "views"}`}
          >
            <span
              className="ns-chart__bar"
              style={{ height: `${Math.max(2, (day.count / peak) * 100)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="ns-chart__axis">
        <span>{format(days[0]?.date ?? "")}</span>
        <span>{format(days[days.length - 1]?.date ?? "")}</span>
      </div>
    </section>
  );
}

export async function DashboardStats({ payload }: Props) {
  if (!payload) return null;

  const countOf = async (collection: string, where?: Where) => {
    try {
      const result = await payload.count({ collection: collection as never, where, overrideAccess: true });
      return result.totalDocs;
    } catch {
      // The database may not be migrated yet on a first run; an empty panel
      // is far better than a crashed dashboard.
      return 0;
    }
  };

  const [views30, views7, views1, posts, pages, services, offers, pendingReviews, newEnquiries, openEnquiries] =
    await Promise.all([
      countOf("pageviews", { createdAt: { greater_than: since(30) } }),
      countOf("pageviews", { createdAt: { greater_than: since(7) } }),
      countOf("pageviews", { createdAt: { greater_than: since(1) } }),
      countOf("posts", { status: { equals: "published" } }),
      countOf("pages", { status: { equals: "published" } }),
      countOf("services", { status: { equals: "published" } }),
      countOf("offers", { status: { equals: "published" } }),
      countOf("reviews", { approved: { equals: false } }),
      countOf("enquiries", { state: { equals: "new" } }),
      countOf("enquiries", { state: { in: ["new", "in-progress"] } }),
    ]);

  const { topPages, topReferrers, devices, trend } = await loadTraffic(payload);

  return (
    <div className="ns-overview">
      <header className="ns-overview__head">
        <div>
          <h2 className="ns-overview__title">Overview</h2>
          <p className="ns-overview__sub">Traffic and content across najikkosathi.com</p>
        </div>
        <div className="ns-overview__actions">
          <a className="ns-action" href="/" target="_blank" rel="noreferrer">View website</a>
          <a className="ns-action" href="/search" target="_blank" rel="noreferrer">Search page</a>
          <a className="ns-action ns-action--primary" href="/backup" download>Download backup</a>
        </div>
      </header>

      <div className="ns-grid ns-grid--stats">
        <Stat title="Views today" value={views1.toLocaleString()} hint="Last 24 hours" />
        <Stat title="Views this week" value={views7.toLocaleString()} hint="Last 7 days" />
        <Stat title="Views this month" value={views30.toLocaleString()} hint="Last 30 days" />
        <Stat
          title="New enquiries"
          value={newEnquiries}
          hint={openEnquiries > 0 ? `${openEnquiries} still open` : "Nothing outstanding"}
          tone={newEnquiries > 0 ? "attention" : "calm"}
        />
        <Stat
          title="Reviews to approve"
          value={pendingReviews}
          hint={pendingReviews > 0 ? "Waiting on you" : "All caught up"}
          tone={pendingReviews > 0 ? "attention" : "calm"}
        />
      </div>

      {trend.length > 0 ? <Trend days={trend} /> : null}

      <div className="ns-grid ns-grid--panels">
        <Breakdown title="Most visited pages" rows={topPages} empty="No visits recorded yet." />
        <Breakdown title="Where visitors came from" rows={topReferrers} empty="No referrers recorded yet." />
        <Breakdown title="Devices" rows={devices} empty="No devices recorded yet." />
      </div>

      <div className="ns-grid ns-grid--counts">
        <Stat title="Published services" value={services} />
        <Stat title="Published posts" value={posts} />
        <Stat title="Live pages" value={pages} />
        <Stat title="Active offers" value={offers} />
      </div>
    </div>
  );
}
