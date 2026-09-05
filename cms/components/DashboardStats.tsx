import type { Payload, Where } from "payload";
import React from "react";

/**
 * Rendered above the default dashboard. It answers the questions an owner
 * actually opens the dashboard for: how much traffic came in, what people read,
 * and what is waiting on me.
 */

type Props = { payload?: Payload };

const since = (days: number) => new Date(Date.now() - days * 86_400_000).toISOString();

const card: React.CSSProperties = {
  background: "var(--theme-elevation-0)",
  border: "1px solid var(--theme-elevation-100)",
  borderRadius: 8,
  padding: "16px 18px",
};

function Stat({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return (
    <div style={card}>
      <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--theme-elevation-500)" }}>
        {label}
      </div>
      <div style={{ fontSize: 30, fontWeight: 700, lineHeight: 1.2, marginTop: 6 }}>{value}</div>
      {hint ? <div style={{ fontSize: 12, color: "var(--theme-elevation-500)", marginTop: 2 }}>{hint}</div> : null}
    </div>
  );
}

export async function DashboardStats({ payload }: Props) {
  if (!payload) return null;

  const countOf = async (
    collection: "pageviews" | "posts" | "pages" | "offers" | "reviews",
    where?: Where,
  ) => {
    try {
      const result = await payload.count({ collection, where, overrideAccess: true });
      return result.totalDocs;
    } catch {
      // The database may not be migrated yet on a first run; an empty
      // dashboard is far better than a crashed one.
      return 0;
    }
  };

  const [views30, views7, posts, pages, offers, pendingReviews] = await Promise.all([
    countOf("pageviews", { createdAt: { greater_than: since(30) } }),
    countOf("pageviews", { createdAt: { greater_than: since(7) } }),
    countOf("posts", { status: { equals: "published" } }),
    countOf("pages", { status: { equals: "published" } }),
    countOf("offers", { status: { equals: "published" } }),
    countOf("reviews", { approved: { equals: false } }),
  ]);

  let topPages: { path: string; count: number }[] = [];
  try {
    const recent = await payload.find({
      collection: "pageviews",
      where: { createdAt: { greater_than: since(30) } },
      limit: 1000,
      depth: 0,
      pagination: false,
      overrideAccess: true,
    });
    const tally = new Map<string, number>();
    for (const doc of recent.docs as { path?: string }[]) {
      if (!doc.path) continue;
      tally.set(doc.path, (tally.get(doc.path) ?? 0) + 1);
    }
    topPages = [...tally.entries()]
      .map(([path, count]) => ({ path, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  } catch {
    topPages = [];
  }

  return (
    <div style={{ marginBottom: 32 }}>
      <h2 style={{ marginBottom: 12 }}>Overview</h2>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))",
          gap: 12,
        }}
      >
        <Stat label="Views" value={views30.toLocaleString()} hint="Last 30 days" />
        <Stat label="Views" value={views7.toLocaleString()} hint="Last 7 days" />
        <Stat label="Published posts" value={posts} />
        <Stat label="Live pages" value={pages} />
        <Stat label="Active offers" value={offers} />
        <Stat
          label="Reviews to approve"
          value={pendingReviews}
          hint={pendingReviews > 0 ? "Needs your attention" : "All caught up"}
        />
      </div>

      {topPages.length > 0 ? (
        <div style={{ ...card, marginTop: 12 }}>
          <div style={{ fontSize: 12, textTransform: "uppercase", letterSpacing: ".06em", color: "var(--theme-elevation-500)", marginBottom: 10 }}>
            Most visited - last 30 days
          </div>
          {topPages.map(({ path, count }) => (
            <div key={path} style={{ display: "flex", alignItems: "center", gap: 12, padding: "5px 0" }}>
              <span style={{ flex: "0 0 40%", fontFamily: "monospace", fontSize: 13 }}>{path}</span>
              <span
                aria-hidden="true"
                style={{
                  flex: 1,
                  height: 8,
                  borderRadius: 4,
                  background: "var(--theme-elevation-150)",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    display: "block",
                    height: "100%",
                    width: `${Math.round((count / topPages[0].count) * 100)}%`,
                    background: "var(--theme-success-500)",
                  }}
                />
              </span>
              <span style={{ fontVariantNumeric: "tabular-nums", fontSize: 13 }}>{count}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
