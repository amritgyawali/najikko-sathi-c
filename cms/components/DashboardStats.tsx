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

const card: React.CSSProperties = {
  background: "var(--theme-elevation-0)",
  border: "1px solid var(--theme-elevation-100)",
  borderRadius: 8,
  padding: "16px 18px",
};

const label: React.CSSProperties = {
  fontSize: 12,
  textTransform: "uppercase",
  letterSpacing: ".06em",
  color: "var(--theme-elevation-500)",
};

function Stat({ title, value, hint }: { title: string; value: React.ReactNode; hint?: string }) {
  return (
    <div style={card}>
      <div style={label}>{title}</div>
      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2, marginTop: 6 }}>{value}</div>
      {hint ? <div style={{ fontSize: 12, color: "var(--theme-elevation-500)", marginTop: 2 }}>{hint}</div> : null}
    </div>
  );
}

/** Horizontal bars, used for the top-pages and referrer breakdowns. */
function Breakdown({ title, rows, empty }: { title: string; rows: [string, number][]; empty: string }) {
  const top = rows[0]?.[1] ?? 0;
  return (
    <div style={card}>
      <div style={{ ...label, marginBottom: 10 }}>{title}</div>
      {rows.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--theme-elevation-500)" }}>{empty}</div>
      ) : (
        rows.map(([name, count]) => (
          <div key={name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "5px 0" }}>
            <span style={{ flex: "0 0 45%", fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {name}
            </span>
            <span aria-hidden="true" style={{ flex: 1, height: 8, borderRadius: 4, background: "var(--theme-elevation-150)", overflow: "hidden" }}>
              <span style={{ display: "block", height: "100%", width: `${top ? Math.round((count / top) * 100) : 0}%`, background: "var(--theme-success-500)" }} />
            </span>
            <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 13 }}>{count}</span>
          </div>
        ))
      )}
    </div>
  );
}

/** Daily traffic for the last two weeks, drawn as a simple column chart. */
function Trend({ days }: { days: { date: string; count: number }[] }) {
  const peak = Math.max(1, ...days.map((day) => day.count));
  return (
    <div style={card}>
      <div style={{ ...label, marginBottom: 12 }}>Views per day - last 14 days</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 4, height: 90 }}>
        {days.map((day) => (
          <div key={day.date} style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", height: "100%" }} title={`${day.date}: ${day.count}`}>
            <span style={{ display: "block", height: `${Math.max(2, (day.count / peak) * 100)}%`, background: "var(--theme-success-500)", borderRadius: "3px 3px 0 0" }} />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--theme-elevation-500)", marginTop: 6 }}>
        <span>{days[0]?.date}</span>
        <span>{days[days.length - 1]?.date}</span>
      </div>
    </div>
  );
}

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

  const toolLink: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "7px 14px",
    borderRadius: 999,
    border: "1px solid var(--theme-elevation-150)",
    fontSize: 13,
    textDecoration: "none",
  };

  return (
    <div style={{ marginBottom: 32 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 12 }}>
        <h2 style={{ margin: 0 }}>Overview</h2>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <a style={toolLink} href="/" target="_blank" rel="noreferrer">View website</a>
          <a style={toolLink} href="/search" target="_blank" rel="noreferrer">Search page</a>
          {/* A real download, not a page navigation, so Link is not appropriate. */}
          <a style={toolLink} href="/backup" download>Download backup</a>
        </div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
        <Stat title="Views" value={views30.toLocaleString()} hint="Last 30 days" />
        <Stat title="Views" value={views7.toLocaleString()} hint="Last 7 days" />
        <Stat title="Views" value={views1.toLocaleString()} hint="Last 24 hours" />
        <Stat
          title="New enquiries"
          value={newEnquiries}
          hint={openEnquiries > 0 ? `${openEnquiries} still open` : "Nothing outstanding"}
        />
        <Stat
          title="Reviews to approve"
          value={pendingReviews}
          hint={pendingReviews > 0 ? "Needs your attention" : "All caught up"}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginTop: 12 }}>
        <Stat title="Published services" value={services} />
        <Stat title="Published posts" value={posts} />
        <Stat title="Live pages" value={pages} />
        <Stat title="Active offers" value={offers} />
      </div>

      {trend.length > 0 ? <div style={{ marginTop: 12 }}><Trend days={trend} /></div> : null}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginTop: 12 }}>
        <Breakdown title="Most visited - last 30 days" rows={topPages} empty="No visits recorded yet." />
        <Breakdown title="Where visitors came from" rows={topReferrers} empty="No referrers recorded yet." />
        <Breakdown title="Devices" rows={devices} empty="No devices recorded yet." />
      </div>
    </div>
  );
}
