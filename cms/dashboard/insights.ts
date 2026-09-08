import type { Payload } from "payload";

import { routePageContent } from "../../lib/page-defaults";

/**
 * Everything the dashboard knows about the website, gathered in one place.
 *
 * The panels on the dashboard home are presentation only: each one is handed a
 * finished object from here and draws it. Keeping the reading here rather than
 * in the components means a figure is computed once even when three panels show
 * it, the queries can be seen and reasoned about together, and every one of them
 * fails softly - a site whose database has not been migrated yet shows an empty
 * dashboard rather than a stack trace.
 *
 * Nothing here talks to a third party. Traffic comes from the site's own
 * pageviews table, health from the environment the server is running in, and
 * the audits from the content itself.
 */

export const DAY = 86_400_000;
const MINUTE = 60_000;

const isoSince = (ms: number) => new Date(Date.now() - ms).toISOString();
const dayKey = (value: number | string | Date) =>
  (value instanceof Date ? value : new Date(value)).toISOString().slice(0, 10);

/** A row in a ranked list: what it is, how often, and its share of the whole. */
export type Ranked = { label: string; count: number; share: number };

/** One day of the traffic series. */
export type Point = { date: string; count: number };

/** A figure with the same figure from the period before it, for comparison. */
export type Delta = { now: number; before: number; change: number | null };

const delta = (now: number, before: number): Delta => ({
  now,
  before,
  // A rise from nothing is not "infinity per cent", it is simply new traffic,
  // so the change is left undefined and the tile says so instead.
  change: before > 0 ? Math.round(((now - before) / before) * 100) : null,
});

const rank = (values: (string | null | undefined)[], top: number): Ranked[] => {
  const counts = new Map<string, number>();
  let total = 0;
  for (const value of values) {
    if (!value) continue;
    counts.set(value, (counts.get(value) ?? 0) + 1);
    total += 1;
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, top)
    .map(([label, count]) => ({
      label,
      count,
      share: total > 0 ? Math.round((count / total) * 100) : 0,
    }));
};

/* ------------------------------------------------------------------ traffic */

export type Traffic = {
  today: Delta;
  week: Delta;
  month: Delta;
  live: number;
  total: number;
  perDay: number;
  best: Point | null;
  /** Ninety days, oldest first, including the days nobody came. */
  series: Point[];
  topPages: Ranked[];
  topReferrers: Ranked[];
  devices: Ranked[];
  /** The hour of day, 0-23, that the site is busiest in. */
  byHour: number[];
  /** Visits per address over the last thirty days, for the page list. */
  viewsByPath: Record<string, number>;
};

const emptyTraffic: Traffic = {
  today: delta(0, 0),
  week: delta(0, 0),
  month: delta(0, 0),
  live: 0,
  total: 0,
  perDay: 0,
  best: null,
  series: [],
  topPages: [],
  topReferrers: [],
  devices: [],
  byHour: Array.from({ length: 24 }, () => 0),
  viewsByPath: {},
};

/**
 * Ninety days of traffic in a single read, then every figure the dashboard
 * shows is counted from it in memory.
 *
 * One query rather than a dozen `count` calls matters here: the overview is the
 * first thing loaded after signing in, and each round trip to a hosted database
 * is far more expensive than the arithmetic below.
 */
export async function loadTraffic(payload: Payload): Promise<Traffic> {
  try {
    const found = await payload.find({
      collection: "pageviews",
      where: { createdAt: { greater_than: isoSince(90 * DAY) } },
      limit: 20_000,
      depth: 0,
      pagination: false,
      sort: "-createdAt",
      overrideAccess: true,
      // `select` is exclusive, so createdAt has to be named: every figure
      // below is worked out from when the visit happened.
      select: { path: true, referrer: true, device: true, createdAt: true },
    });

    const docs = found.docs as {
      path?: string | null;
      referrer?: string | null;
      device?: string | null;
      createdAt?: string | null;
    }[];

    const now = Date.now();
    const at = (doc: { createdAt?: string | null }) =>
      doc.createdAt ? Date.parse(doc.createdAt) : NaN;

    const within = (from: number, to: number) =>
      docs.filter((doc) => {
        const time = at(doc);
        return Number.isFinite(time) && time > now - from && time <= now - to;
      });

    const month = within(30 * DAY, 0);

    // Ninety buckets, so a day with no visitors is a gap in the line rather
    // than a day the chart forgets to draw.
    const byDay = new Map<string, number>();
    for (let index = 89; index >= 0; index -= 1) byDay.set(dayKey(now - index * DAY), 0);

    const byHour = Array.from({ length: 24 }, () => 0);
    for (const doc of docs) {
      const time = at(doc);
      if (!Number.isFinite(time)) continue;
      const key = dayKey(time);
      if (byDay.has(key)) byDay.set(key, (byDay.get(key) ?? 0) + 1);
      if (time > now - 30 * DAY) byHour[new Date(time).getHours()] += 1;
    }

    const series = [...byDay.entries()].map(([date, count]) => ({ date, count }));
    const best = series.reduce<Point | null>(
      (top, point) => (point.count > (top?.count ?? 0) ? point : top),
      null,
    );

    return {
      today: delta(within(DAY, 0).length, within(2 * DAY, DAY).length),
      week: delta(within(7 * DAY, 0).length, within(14 * DAY, 7 * DAY).length),
      month: delta(month.length, within(60 * DAY, 30 * DAY).length),
      live: within(30 * MINUTE, 0).length,
      total: docs.length,
      perDay: Math.round(month.length / 30),
      best,
      series,
      topPages: rank(month.map((doc) => doc.path), 8),
      topReferrers: rank(month.map((doc) => doc.referrer), 8),
      devices: rank(month.map((doc) => doc.device), 4),
      byHour,
      viewsByPath: month.reduce<Record<string, number>>((counts, doc) => {
        if (doc.path) counts[doc.path] = (counts[doc.path] ?? 0) + 1;
        return counts;
      }, {}),
    };
  } catch {
    return emptyTraffic;
  }
}

/* ------------------------------------------------------------------ counting */

/** A count that answers 0 rather than failing when the table is not there. */
async function count(payload: Payload, collection: string, where?: object): Promise<number> {
  try {
    const result = await payload.count({
      collection: collection as never,
      ...(where ? { where: where as never } : {}),
      overrideAccess: true,
    });
    return result.totalDocs;
  } catch {
    return 0;
  }
}

/** A `find` that answers an empty list rather than failing. */
async function list<T>(
  payload: Payload,
  collection: string,
  options: Record<string, unknown> = {},
): Promise<T[]> {
  try {
    const found = await payload.find({
      collection: collection as never,
      depth: 0,
      limit: 20,
      overrideAccess: true,
      ...options,
    } as never);
    return found.docs as T[];
  } catch {
    return [];
  }
}

/* --------------------------------------------------------------- the library */

export type Library = {
  pages: number;
  drafts: number;
  posts: number;
  services: number;
  offers: number;
  reviews: number;
  faqs: number;
  team: number;
  media: number;
  enquiries: number;
};

export async function loadLibrary(payload: Payload): Promise<Library> {
  const published = { status: { equals: "published" } };
  const [pages, drafts, posts, services, offers, reviews, faqs, team, media, enquiries] =
    await Promise.all([
      count(payload, "pages", published),
      count(payload, "pages", { status: { not_equals: "published" } }),
      count(payload, "posts", published),
      count(payload, "services", published),
      count(payload, "offers", published),
      count(payload, "reviews", { approved: { equals: true } }),
      count(payload, "faqs"),
      count(payload, "team-members"),
      count(payload, "media"),
      count(payload, "enquiries"),
    ]);

  return { pages, drafts, posts, services, offers, reviews, faqs, team, media, enquiries };
}

/* ------------------------------------------------------------ what is waiting */

/** One thing waiting on the reader, and where to go and deal with it. */
export type Waiting = {
  key: string;
  label: string;
  count: number;
  href: string;
  note: string;
  tone: "urgent" | "warn" | "calm";
};

export type Inbox = {
  items: Waiting[];
  /** The newest few enquiries, so the panel can show them without a second trip. */
  enquiries: { id: string | number; name: string; service?: string | null; createdAt?: string | null }[];
  reviews: { id: string | number; name: string; rating?: number | null; quote?: string | null }[];
  total: number;
};

export async function loadInbox(payload: Payload): Promise<Inbox> {
  const [newEnquiries, openEnquiries, pendingReviews, drafts, expiring, unapprovedUsers] =
    await Promise.all([
      count(payload, "enquiries", { state: { equals: "new" } }),
      count(payload, "enquiries", { state: { in: ["new", "in-progress"] } }),
      count(payload, "reviews", { approved: { equals: false } }),
      count(payload, "pages", { status: { not_equals: "published" } }),
      count(payload, "offers", {
        and: [
          { status: { equals: "published" } },
          { endsAt: { less_than: isoSince(-7 * DAY) } },
          { endsAt: { greater_than: new Date().toISOString() } },
        ],
      }),
      count(payload, "users", { approved: { equals: false } }),
    ]);

  const [enquiries, reviews] = await Promise.all([
    list<{ id: string | number; name: string; service?: string | null; createdAt?: string | null }>(
      payload,
      "enquiries",
      { where: { state: { equals: "new" } }, sort: "-createdAt", limit: 5 },
    ),
    list<{ id: string | number; name: string; rating?: number | null; quote?: string | null }>(
      payload,
      "reviews",
      { where: { approved: { equals: false } }, sort: "-createdAt", limit: 5 },
    ),
  ]);

  const items: Waiting[] = [
    {
      key: "enquiries",
      label: "New enquiries",
      count: newEnquiries,
      href: "/admin/collections/enquiries?where[state][equals]=new",
      note:
        newEnquiries > 0
          ? `${openEnquiries} conversation${openEnquiries === 1 ? "" : "s"} still open`
          : "Every message has been answered",
      tone: newEnquiries > 0 ? "urgent" : "calm",
    },
    {
      key: "reviews",
      label: "Reviews to approve",
      count: pendingReviews,
      href: "/admin/collections/reviews?where[approved][equals]=false",
      note: pendingReviews > 0 ? "Nothing reaches the website until you approve it" : "Nothing waiting",
      tone: pendingReviews > 0 ? "warn" : "calm",
    },
    {
      key: "drafts",
      label: "Pages in draft",
      count: drafts,
      href: "/admin/collections/pages?where[status][not_equals]=published",
      note: drafts > 0 ? "Written, but not on the website yet" : "Every page is live",
      tone: drafts > 0 ? "warn" : "calm",
    },
    {
      key: "offers",
      label: "Offers ending this week",
      count: expiring,
      href: "/admin/collections/offers",
      note: expiring > 0 ? "They come off the website by themselves" : "Nothing about to expire",
      tone: expiring > 0 ? "warn" : "calm",
    },
    {
      key: "users",
      label: "Sign-ups to approve",
      count: unapprovedUsers,
      href: "/admin/collections/users?where[approved][equals]=false",
      note: unapprovedUsers > 0 ? "They cannot sign in until you approve them" : "No one is waiting",
      tone: unapprovedUsers > 0 ? "urgent" : "calm",
    },
  ];

  return {
    items,
    enquiries,
    reviews,
    total: items.reduce((sum, item) => sum + item.count, 0),
  };
}

/* ------------------------------------------------------------------ activity */

export type Change = {
  title: string;
  collection: string;
  label: string;
  href: string;
  at: string;
  status?: string | null;
};

/** What changed on the website lately, newest first, across everything. */
export async function loadActivity(payload: Payload): Promise<Change[]> {
  const watched: [slug: string, label: string, titleField: string][] = [
    ["pages", "Website page", "title"],
    ["posts", "Post", "title"],
    ["services", "Service", "title"],
    ["offers", "Offer", "title"],
    ["reviews", "Review", "name"],
    ["media", "File", "filename"],
    ["media-slots", "Page media", "key"],
    ["team-members", "Team member", "name"],
    ["faqs", "Question", "question"],
    ["social-work", "Social work", "title"],
  ];

  const batches = await Promise.all(
    watched.map(async ([slug, label, titleField]) => {
      const docs = await list<Record<string, unknown>>(payload, slug, {
        sort: "-updatedAt",
        limit: 4,
      });
      return docs.map((doc): Change => {
        const title = doc[titleField];
        return {
          title: typeof title === "string" && title ? title : `Untitled ${label.toLowerCase()}`,
          collection: slug,
          label,
          href: `/admin/collections/${slug}/${doc.id as string}`,
          at: typeof doc.updatedAt === "string" ? doc.updatedAt : "",
          status: typeof doc.status === "string" ? doc.status : null,
        };
      });
    }),
  );

  return batches
    .flat()
    .filter((change) => change.at)
    .sort((a, b) => b.at.localeCompare(a.at))
    .slice(0, 12);
}

/* ---------------------------------------------------------------- the audits */

/** One thing wrong, why it matters, and where it is fixed. */
export type Finding = {
  title: string;
  where: string;
  href: string;
  severity: "high" | "medium" | "low";
  fix: string;
};

export type Audit = {
  findings: Finding[];
  checked: number;
  /** 0-100. What share of the checks came back clean. */
  score: number;
};

const scored = (findings: Finding[], checked: number): Audit => {
  // The score counts the things checked, not the complaints made about them:
  // one page missing three details is one page to fix, and a scale that can be
  // driven below zero by a thorough check is no scale at all.
  const affected = new Set(findings.map((finding) => finding.where)).size;

  return {
    findings: findings
      .sort((a, b) => "high medium low".indexOf(a.severity) - "high medium low".indexOf(b.severity))
      .slice(0, 24),
    checked,
    score: checked === 0 ? 100 : Math.max(0, Math.round(((checked - affected) / checked) * 100)),
  };
};

type SeoDoc = {
  id: string | number;
  title?: string | null;
  slug?: string | null;
  path?: string | null;
  status?: string | null;
  summary?: string | null;
  excerpt?: string | null;
  coverImage?: unknown;
  metaDescription?: string | null;
  seo?: {
    title?: string | null;
    description?: string | null;
    image?: unknown;
    noindex?: boolean | null;
  } | null;
};

/**
 * What a search engine will make of the site.
 *
 * Everything checked here is something an editor can fix in the dashboard in
 * under a minute, which is the whole test for whether a check belongs: a report
 * nobody can act on is noise.
 */
export async function loadSeoAudit(payload: Payload): Promise<Audit> {
  const findings: Finding[] = [];
  let checked = 0;

  const inspect = (docs: SeoDoc[], collection: string, label: string) => {
    const slugs = new Map<string, number>();

    for (const doc of docs) {
      checked += 1;
      const where = `${label}: ${doc.title || "untitled"}`;
      const href = `/admin/collections/${collection}/${doc.id}`;
      const description = doc.seo?.description || doc.summary || doc.excerpt || doc.metaDescription || "";
      const title = doc.seo?.title || doc.title || "";

      if (!description) {
        findings.push({
          title: "No description for search results",
          where,
          href,
          severity: "high",
          fix: "Write one or two sentences under SEO. Google shows them under the blue link, and so does every website a link to this page is pasted into.",
        });
      } else if (description.length < 60) {
        findings.push({
          title: "Search description is very short",
          where,
          href,
          severity: "low",
          fix: "Around 120 to 160 characters reads best in a search result. This one is " + description.length + ".",
        });
      } else if (description.length > 175) {
        findings.push({
          title: "Search description will be cut off",
          where,
          href,
          severity: "low",
          fix: "Trim it to about 160 characters so the whole sentence is shown.",
        });
      }

      if (title.length > 62) {
        findings.push({
          title: "Title is too long for a search result",
          where,
          href,
          severity: "low",
          fix: "Keep the SEO title under about 60 characters, or the end of it is replaced with an ellipsis.",
        });
      }

      // Asked to be left out of search engines, while still being on the
      // website. Two pages ship that way on purpose - the search page and the
      // sign-up form - so only a page that was hidden by hand is worth raising.
      const hiddenByDesign = doc.path ? routePageContent[doc.path]?.noindex === true : false;
      if (doc.seo?.noindex && doc.status === "published" && !hiddenByDesign) {
        findings.push({
          title: "This page asks search engines to ignore it",
          where,
          href,
          severity: "medium",
          fix: 'It is on the website and works, but it is not in the sitemap and will not be found by searching. Untick "keep out of search engines" if that was not intended.',
        });
      }

      // A post with no cover photograph is a grey rectangle in every listing
      // it appears in, which is the one place a picture does real work.
      if (collection === "posts" && !doc.coverImage) {
        findings.push({
          title: "No cover photograph",
          where,
          href,
          severity: "medium",
          fix: "Add one. It is shown at the top of the post and in every list the post appears in.",
        });
      }

      const key = doc.slug || doc.path || "";
      if (key) slugs.set(key, (slugs.get(key) ?? 0) + 1);
    }

    for (const [slug, times] of slugs) {
      if (times > 1) {
        findings.push({
          title: `Two ${label.toLowerCase()}s share the address "${slug}"`,
          where: label,
          href: `/admin/collections/${collection}`,
          severity: "high",
          fix: "Give one of them a different slug. Only one of them can answer that address.",
        });
      }
    }
  };

  const [pages, posts, services] = await Promise.all([
    list<SeoDoc>(payload, "pages", { limit: 200, pagination: false }),
    list<SeoDoc>(payload, "posts", { limit: 200, pagination: false }),
    list<SeoDoc>(payload, "services", { limit: 200, pagination: false }),
  ]);

  inspect(pages, "pages", "Page");
  inspect(posts, "posts", "Post");
  inspect(services, "services", "Service");

  return scored(findings, Math.max(checked, 1));
}

type MediaDoc = {
  id: string | number;
  filename?: string | null;
  alt?: string | null;
  filesize?: number | null;
  mimeType?: string | null;
  width?: number | null;
};

export type MediaReport = {
  audit: Audit;
  files: number;
  bytes: number;
  images: number;
  films: number;
  documents: number;
  missingAlt: number;
  heaviest: { name: string; bytes: number; href: string }[];
};

/**
 * The file library, and the two things that go wrong with it: a picture nobody
 * described, and a picture nobody compressed.
 */
export async function loadMediaReport(payload: Payload): Promise<MediaReport> {
  const files = await list<MediaDoc>(payload, "media", { limit: 500, pagination: false });
  const findings: Finding[] = [];

  let bytes = 0;
  let images = 0;
  let films = 0;
  let documents = 0;
  let missingAlt = 0;

  for (const file of files) {
    const size = file.filesize ?? 0;
    bytes += size;
    const type = file.mimeType ?? "";
    if (type.startsWith("video/")) films += 1;
    else if (type.startsWith("image/")) images += 1;
    else documents += 1;

    const href = `/admin/collections/media/${file.id}`;
    const name = file.filename || "untitled file";

    if (!file.alt || file.alt.trim().length < 3) {
      missingAlt += 1;
      findings.push({
        title: "No description on this file",
        where: name,
        href,
        severity: "medium",
        fix: "Describe what is in the picture. Screen readers read it aloud and search engines index it.",
      });
    }

    // Anything past a couple of megabytes is a photograph straight off a
    // camera, and it is the single most common reason a page feels slow.
    if (type.startsWith("image/") && size > 2_000_000) {
      findings.push({
        title: `Very large photograph (${Math.round(size / 100_000) / 10} MB)`,
        where: name,
        href,
        severity: "medium",
        fix: "Save it at around 2000px wide and re-upload. Pages carrying it will load noticeably faster.",
      });
    }
  }

  const heaviest = [...files]
    .sort((a, b) => (b.filesize ?? 0) - (a.filesize ?? 0))
    .slice(0, 5)
    .map((file) => ({
      name: file.filename || "untitled file",
      bytes: file.filesize ?? 0,
      href: `/admin/collections/media/${file.id}`,
    }));

  return {
    audit: scored(findings, Math.max(files.length, 1)),
    files: files.length,
    bytes,
    images,
    films,
    documents,
    missingAlt,
    heaviest,
  };
}

/* ------------------------------------------------------------------- health */

export type Check = {
  label: string;
  state: "ok" | "warn" | "bad";
  detail: string;
  href?: string;
};

export type Health = { checks: Check[]; score: number };

/**
 * Is the site actually set up properly? Each check reads something real - an
 * environment variable, the age of the newest backup, whether anything has been
 * written to the traffic log - rather than assuming.
 */
export async function loadHealth(payload: Payload): Promise<Health> {
  const checks: Check[] = [];

  const [latestBackup] = await list<{ takenAt?: string | null; id: string | number }>(
    payload,
    "backups",
    { sort: "-takenAt", limit: 1, select: { takenAt: true } },
  );

  const backupAge = latestBackup?.takenAt
    ? Math.floor((Date.now() - Date.parse(latestBackup.takenAt)) / DAY)
    : null;

  checks.push({
    label: "Daily backup",
    state: backupAge === null ? "bad" : backupAge <= 2 ? "ok" : "warn",
    detail:
      backupAge === null
        ? "No copy of the website has ever been taken."
        : backupAge === 0
          ? "A copy was taken today."
          : `The newest copy is ${backupAge} day${backupAge === 1 ? "" : "s"} old.`,
    href: "/admin/collections/backups",
  });

  const storage = process.env.CLOUDINARY_URL
    ? "Cloudinary"
    : process.env.BLOB_READ_WRITE_TOKEN
      ? "Vercel Blob"
      : null;
  checks.push({
    label: "File storage",
    state: storage ? "ok" : "warn",
    detail: storage
      ? `Photographs and films are stored on ${storage}.`
      : "Uploads are kept on the server's own disk, which a deploy wipes. Set CLOUDINARY_URL.",
  });

  checks.push({
    label: "Scheduled backups",
    state: process.env.CRON_SECRET ? "ok" : "warn",
    detail: process.env.CRON_SECRET
      ? "The nightly schedule is signed and running."
      : "CRON_SECRET is not set, so the nightly copy is refused. Backups can still be taken by hand.",
  });

  const views = await count(payload, "pageviews", { createdAt: { greater_than: isoSince(7 * DAY) } });
  checks.push({
    label: "Visitor counting",
    state: views > 0 ? "ok" : "warn",
    detail:
      views > 0
        ? `${views.toLocaleString()} visits recorded in the last seven days.`
        : "Nothing has been recorded this week. Either the site is quiet, or tracking is not reaching the server.",
    href: "/admin/collections/pageviews",
  });

  const admins = await count(payload, "users", { role: { equals: "admin" } });
  checks.push({
    label: "Administrators",
    state: admins > 1 ? "ok" : "warn",
    detail:
      admins > 1
        ? `${admins} people can administer this site.`
        : "Only one account can administer this site. Add a second so nobody is ever locked out.",
    href: "/admin/collections/users",
  });

  const redirects = await count(payload, "redirects");
  checks.push({
    label: "Redirects",
    state: "ok",
    detail:
      redirects > 0
        ? `${redirects} old address${redirects === 1 ? "" : "es"} forwarded to a new one.`
        : "No redirects set. Add one whenever a page moves so old links keep working.",
    href: "/admin/collections/redirects",
  });

  const weights = { ok: 1, warn: 0.5, bad: 0 };
  const score = Math.round(
    (checks.reduce((sum, check) => sum + weights[check.state], 0) / checks.length) * 100,
  );

  return { checks, score };
}

/* ----------------------------------------------------------------- calendar */

export type Scheduled = {
  title: string;
  href: string;
  at: string;
  kind: "publishes" | "hides" | "published";
  label: string;
};

/**
 * What the website is about to do on its own: posts and offers that appear or
 * disappear at a set time. Nobody remembers what they scheduled three weeks ago.
 */
export async function loadCalendar(payload: Payload): Promise<Scheduled[]> {
  const now = new Date().toISOString();
  const soon = new Date(Date.now() + 60 * DAY).toISOString();

  const gather = async (collection: string, label: string): Promise<Scheduled[]> => {
    const [appearing, hiding, recent] = await Promise.all([
      list<{ id: string | number; title?: string; publishAt?: string }>(payload, collection, {
        where: { and: [{ publishAt: { greater_than: now } }, { publishAt: { less_than: soon } }] },
        sort: "publishAt",
        limit: 6,
      }),
      list<{ id: string | number; title?: string; unpublishAt?: string }>(payload, collection, {
        where: { and: [{ unpublishAt: { greater_than: now } }, { unpublishAt: { less_than: soon } }] },
        sort: "unpublishAt",
        limit: 6,
      }),
      list<{ id: string | number; title?: string; publishedAt?: string; updatedAt?: string }>(
        payload,
        collection,
        { where: { status: { equals: "published" } }, sort: "-updatedAt", limit: 3 },
      ),
    ]);

    return [
      ...appearing.map((doc) => ({
        title: doc.title || "Untitled",
        href: `/admin/collections/${collection}/${doc.id}`,
        at: doc.publishAt ?? "",
        kind: "publishes" as const,
        label,
      })),
      ...hiding.map((doc) => ({
        title: doc.title || "Untitled",
        href: `/admin/collections/${collection}/${doc.id}`,
        at: doc.unpublishAt ?? "",
        kind: "hides" as const,
        label,
      })),
      ...recent.map((doc) => ({
        title: doc.title || "Untitled",
        href: `/admin/collections/${collection}/${doc.id}`,
        at: doc.publishedAt || doc.updatedAt || "",
        kind: "published" as const,
        label,
      })),
    ];
  };

  const found = await Promise.all([gather("posts", "Post"), gather("offers", "Offer")]);
  return found
    .flat()
    .filter((entry) => entry.at)
    .sort((a, b) => a.at.localeCompare(b.at));
}
