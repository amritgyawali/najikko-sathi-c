import { revalidatePath } from "next/cache";
import type { Endpoint, PayloadRequest, Payload } from "payload";

import { sitePages } from "../../lib/site-map";

/**
 * The dashboard's advanced toolbox: twelve jobs that act on the whole website
 * at once, behind one address.
 *
 *   POST /api/site-tools/advanced   { "tool": "link-check", ... }
 *
 * One route rather than twelve, because every one of them takes the same shape -
 * check who is asking, do the work, hand back a heading, a sentence and a list
 * of rows - and a client that only has to learn one address can grow a new tool
 * without touching anything but its own table of buttons.
 *
 * Each tool declares whether it only looks (`read`) or also writes (`write`).
 * Looking needs an editor; writing needs an administrator, because a job here
 * can rewrite every page on the site in one call. The rule is read from the
 * signed-in user, never from the request.
 *
 * Everything that writes is undoable in the ordinary way: the site keeps whole
 * copies of itself (Site → Copies of everything), and the panel that drives
 * these says so before it runs one.
 */

/* ------------------------------------------------------------------- shapes */

/** A line in the result. `tone` decides the colour of the pill beside it. */
export type ToolRow = {
  label: string;
  detail?: string;
  href?: string;
  tone?: "good" | "warn" | "bad" | "info" | "neutral";
};

export type ToolResult = {
  title: string;
  summary: string;
  rows?: ToolRow[];
  /** Text the panel offers to copy or save - a snapshot, a report. */
  payload?: string;
  /** True when the job changed something, so the panel can refresh the screen. */
  changed?: boolean;
};

type Options = Record<string, unknown>;

type Tool = {
  /** Whether an editor may run it, or only an administrator. */
  level: "read" | "write";
  run: (payload: Payload, options: Options, req: PayloadRequest) => Promise<ToolResult>;
};

/* ------------------------------------------------------------------ helpers */

const str = (value: unknown, fallback = ""): string =>
  typeof value === "string" ? value.trim() : fallback;

const int = (value: unknown, fallback: number, min: number, max: number): number => {
  const parsed = typeof value === "number" ? value : Number.parseInt(String(value ?? ""), 10);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
};

const list = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === "string") : [];

/** Read a collection without pagination, and without letting one failure end the job. */
async function all(
  payload: Payload,
  collection: string,
  options: { limit?: number; depth?: number; where?: unknown } = {},
): Promise<Record<string, unknown>[]> {
  try {
    const found = await payload.find({
      collection: collection as never,
      limit: options.limit ?? 500,
      depth: options.depth ?? 0,
      pagination: false,
      where: options.where as never,
    });
    return found.docs as Record<string, unknown>[];
  } catch {
    return [];
  }
}

const globalSlugs = ["site-settings", "appearance", "navigation", "footer", "announcement", "homepage"] as const;

async function readGlobal(payload: Payload, slug: string): Promise<Record<string, unknown> | null> {
  try {
    return (await payload.findGlobal({ slug: slug as never, depth: 0 })) as Record<string, unknown>;
  } catch {
    return null;
  }
}

/** Every string in a document, whatever depth it is buried at. */
function walkStrings(
  value: unknown,
  visit: (key: string, text: string, set: (next: string) => void) => void,
  key = "",
): void {
  if (Array.isArray(value)) {
    value.forEach((entry, index) => {
      if (typeof entry === "string") {
        visit(key, entry, (next) => {
          value[index] = next;
        });
      } else {
        walkStrings(entry, visit, key);
      }
    });
    return;
  }
  if (!value || typeof value !== "object") return;
  const record = value as Record<string, unknown>;
  for (const field of Object.keys(record)) {
    const entry = record[field];
    if (typeof entry === "string") {
      visit(field, entry, (next) => {
        record[field] = next;
      });
    } else {
      walkStrings(entry, visit, field);
    }
  }
}

/** Fields Payload maintains itself, which must not be sent back to it. */
const MANAGED = new Set(["id", "createdAt", "updatedAt", "sizes", "filename", "url", "thumbnailURL"]);

const withoutManaged = (doc: Record<string, unknown>): Record<string, unknown> =>
  Object.fromEntries(Object.entries(doc).filter(([key]) => !MANAGED.has(key)));

const plural = (count: number, one: string, many = `${one}s`): string =>
  `${count} ${count === 1 ? one : many}`;

/* --------------------------------------------------------------- 1. links */

/** Addresses the website answers to without anything having to be published. */
const builtInPaths = new Set<string>(["/", ...sitePages.map((page) => page.path)]);

/**
 * Every internal address written anywhere in the dashboard, checked against the
 * addresses the website actually answers to.
 *
 * A link in a page's own words is the one thing nothing else catches: the page
 * saves happily, the menu still works, and a visitor finds a 404 six months
 * later. The addresses come out of the documents themselves rather than from a
 * list of fields, so a new section with a new kind of link is covered the day
 * it is added.
 */
const linkCheck: Tool = {
  level: "read",
  run: async (payload) => {
    const [pages, posts, services, socialWork, redirects] = await Promise.all([
      all(payload, "pages"),
      all(payload, "posts"),
      all(payload, "services"),
      all(payload, "social-work"),
      all(payload, "redirects"),
    ]);

    const known = new Set(builtInPaths);
    for (const page of pages) {
      if (page.status === "published" && typeof page.path === "string") known.add(page.path);
    }
    for (const [prefix, docs] of [
      ["/posts", posts],
      ["/services", services],
      ["/social-work", socialWork],
    ] as const) {
      for (const doc of docs) {
        if (typeof doc.slug === "string" && doc.slug) known.add(`${prefix}/${doc.slug}`);
      }
    }
    for (const redirect of redirects) {
      if (typeof redirect.from === "string") known.add(redirect.from);
    }

    // Where a broken link was found matters as much as what it was, so the
    // documents are walked one at a time rather than all at once.
    const sources: { where: string; href: string; doc: Record<string, unknown> }[] = [];
    const collect = (doc: Record<string, unknown>, where: string) => {
      walkStrings(doc, (key, text) => {
        if (!/href|url|link/i.test(key)) return;
        if (!text.startsWith("/")) return;
        sources.push({ where, href: text, doc });
      });
    };

    for (const page of pages) collect(page, `Page: ${str(page.title, "untitled")}`);
    for (const slug of ["navigation", "footer", "announcement", "homepage"]) {
      const global = await readGlobal(payload, slug);
      if (global) collect(global, slug === "navigation" ? "The menu" : `Site → ${slug}`);
    }

    const broken: ToolRow[] = [];
    const seen = new Set<string>();
    for (const source of sources) {
      // An anchor or a query on a good address is still that address.
      const path = source.href.split(/[?#]/)[0].replace(/\/$/, "") || "/";
      if (known.has(path) || known.has(`${path}/`)) continue;
      // Things the website serves that are not pages.
      if (/^\/(api|admin|_next|sitemap|robots|backup|track|enquiry|social-preview)/.test(path)) continue;
      const fingerprint = `${source.where}|${source.href}`;
      if (seen.has(fingerprint)) continue;
      seen.add(fingerprint);
      broken.push({ label: source.href, detail: source.where, tone: "bad" });
    }

    return {
      title: "Links that go nowhere",
      summary:
        broken.length === 0
          ? `Every one of the ${plural(sources.length, "internal link")} written in the dashboard answers.`
          : `${plural(broken.length, "link")} out of ${sources.length} point at an address the website does not answer to.`,
      rows: broken.slice(0, 60),
    };
  },
};

/* --------------------------------------------------------- 2. content audit */

/** What is missing, duplicated or thin across everything that has a page. */
const contentAudit: Tool = {
  level: "read",
  run: async (payload) => {
    const [pages, posts, services] = await Promise.all([
      all(payload, "pages"),
      all(payload, "posts"),
      all(payload, "services"),
    ]);

    const rows: ToolRow[] = [];
    const titles = new Map<string, number>();

    for (const page of pages) {
      const title = str(page.title, "Untitled");
      titles.set(title.toLowerCase(), (titles.get(title.toLowerCase()) ?? 0) + 1);
      const href = `/admin/collections/pages/${page.id}`;
      if (!str(page.summary)) {
        rows.push({
          label: title,
          detail: "No description, so a search result shows whatever Google picks out of the page.",
          href,
          tone: "warn",
        });
      }
      const sections = Array.isArray(page.layout) ? page.layout.length : 0;
      if (sections === 0) {
        rows.push({ label: title, detail: "The page has no sections in it at all.", href, tone: "bad" });
      }
      if (page.noindex) {
        rows.push({ label: title, detail: "Hidden from search engines on purpose.", href, tone: "info" });
      }
      if (page.status !== "published") {
        rows.push({ label: title, detail: "Written but not on the website.", href, tone: "info" });
      }
    }

    for (const [title, count] of titles) {
      if (count > 1) {
        rows.push({
          label: title,
          detail: `${count} pages share this name, which makes the menu and the breadcrumbs ambiguous.`,
          tone: "warn",
        });
      }
    }

    for (const post of posts) {
      if (!str(post.excerpt)) {
        rows.push({
          label: str(post.title, "Untitled post"),
          detail: "No summary, so the writing list and the search result have nothing to show.",
          href: `/admin/collections/posts/${post.id}`,
          tone: "warn",
        });
      }
      if (!post.coverImage) {
        rows.push({
          label: str(post.title, "Untitled post"),
          detail: "No picture, so sharing it anywhere shows a bare link.",
          href: `/admin/collections/posts/${post.id}`,
          tone: "warn",
        });
      }
    }

    for (const service of services) {
      if (!str(service.description)) {
        rows.push({
          label: str(service.title, "Untitled service"),
          detail: "No description on the service card.",
          href: `/admin/collections/services/${service.id}`,
          tone: "warn",
        });
      }
    }

    const checked = pages.length + posts.length + services.length;
    return {
      title: "What is missing across the website",
      summary:
        rows.length === 0
          ? `Nothing missing in ${plural(checked, "thing")}.`
          : `${plural(rows.length, "thing")} worth filling in, across ${plural(checked, "page, post and service", "pages, posts and services")}.`,
      rows: rows.slice(0, 80),
    };
  },
};

/* ----------------------------------------------------------- 3. media audit */

/**
 * Files nobody is using, files nobody has described, and the ones big enough to
 * slow a page down.
 *
 * "Nobody is using" is judged by looking for the file's id anywhere in any
 * document or global, which is how Payload stores a picture on a page, so it is
 * as reliable as the relationships themselves. A file published to a page
 * through its own "Where this appears" counts as used whether or not anything
 * points at it.
 */
const mediaAudit: Tool = {
  level: "read",
  run: async (payload) => {
    const files = await all(payload, "media", { limit: 1000 });
    const referenced = new Set<number>();

    const noteIds = (doc: unknown) => {
      const walk = (value: unknown) => {
        if (Array.isArray(value)) {
          value.forEach(walk);
          return;
        }
        if (value && typeof value === "object") {
          for (const entry of Object.values(value as Record<string, unknown>)) walk(entry);
          return;
        }
        if (typeof value === "number" && Number.isInteger(value)) referenced.add(value);
      };
      walk(doc);
    };

    for (const collection of [
      "pages",
      "posts",
      "services",
      "service-categories",
      "offers",
      "team-members",
      "well-wishers",
      "social-work",
      "social-responsibility",
      "media-slots",
      "reviews",
    ]) {
      for (const doc of await all(payload, collection, { limit: 1000 })) noteIds(doc);
    }
    for (const slug of globalSlugs) noteIds(await readGlobal(payload, slug));

    const rows: ToolRow[] = [];
    let bytes = 0;
    let unused = 0;

    for (const file of files) {
      const id = Number(file.id);
      const name = str(file.filename, `File ${id}`);
      const href = `/admin/collections/media/${id}`;
      const filesize = typeof file.filesize === "number" ? file.filesize : 0;
      bytes += filesize;
      const placed = Array.isArray(file.placements) && file.placements.length > 0;

      if (!placed && !referenced.has(id)) {
        unused += 1;
        rows.push({ label: name, detail: "Nothing on the website points at this file.", href, tone: "info" });
      }
      if (!str(file.alt)) {
        rows.push({
          label: name,
          detail: "No description, so a reader using a screen reader is told nothing about it.",
          href,
          tone: "warn",
        });
      }
      if (filesize > 900_000) {
        rows.push({
          label: name,
          detail: `${Math.round(filesize / 1024)} KB - large enough to slow down the page it is on.`,
          href,
          tone: "warn",
        });
      }
    }

    return {
      title: "The file library, looked over",
      summary: `${plural(files.length, "file")}, ${Math.round(bytes / 104_857.6) / 10} MB in all. ${
        unused === 0 ? "Every one of them is in use." : `${plural(unused, "file")} appear${unused === 1 ? "s" : ""} to be unused.`
      }`,
      rows: rows.slice(0, 80),
    };
  },
};

/* ---------------------------------------------------------- 4. find/replace */

const REPLACEABLE = new Set([
  "pages",
  "posts",
  "services",
  "service-categories",
  "offers",
  "faqs",
  "team-members",
  "well-wishers",
  "social-work",
  "social-responsibility",
  "reviews",
]);

/**
 * One wording, changed everywhere it appears.
 *
 * A telephone number, a person's title, a company name written three ways: the
 * kind of change that is a morning's work by hand and a second here. It runs as
 * a dry run unless told otherwise, so the list of what would change can be read
 * before anything does.
 */
const findReplace: Tool = {
  level: "write",
  run: async (payload, options, req) => {
    const find = str(options.find);
    const replace = str(options.replace);
    const apply = options.apply === true;
    const collections = list(options.collections).filter((slug) => REPLACEABLE.has(slug));
    const targets = collections.length > 0 ? collections : [...REPLACEABLE];

    if (find.length < 3) {
      return {
        title: "Find and replace",
        summary: "Type at least three characters to look for. Anything shorter would match half the website.",
      };
    }

    const rows: ToolRow[] = [];
    let changedDocs = 0;
    let occurrences = 0;

    for (const collection of targets) {
      for (const doc of await all(payload, collection, { limit: 500 })) {
        const copy = JSON.parse(JSON.stringify(doc)) as Record<string, unknown>;
        let hits = 0;

        walkStrings(copy, (key, text, set) => {
          if (MANAGED.has(key) || key === "slug" || key === "path") return;
          if (!text.includes(find)) return;
          hits += text.split(find).length - 1;
          set(text.split(find).join(replace));
        });

        if (hits === 0) continue;
        occurrences += hits;
        changedDocs += 1;
        const name = str(copy.title) || str(copy.name) || str(copy.question) || `#${doc.id}`;
        rows.push({
          label: name,
          detail: `${plural(hits, "time")} in ${collection}`,
          href: `/admin/collections/${collection}/${doc.id}`,
          tone: apply ? "good" : "info",
        });

        if (!apply) continue;
        try {
          await payload.update({
            collection: collection as never,
            id: doc.id as never,
            data: {
              ...withoutManaged(copy),
              // Published documents stay published; drafts stay drafts.
              ...(doc.status === "published" ? { _status: "published" } : {}),
            } as never,
            req,
          });
        } catch (error) {
          rows.push({
            label: name,
            detail: `Could not be saved: ${(error as Error).message}`,
            tone: "bad",
          });
          changedDocs -= 1;
        }
      }
    }

    return {
      title: apply ? "Wording changed" : "What would change",
      summary:
        occurrences === 0
          ? `“${find}” does not appear anywhere in the collections searched.`
          : apply
            ? `“${find}” became “${replace}” ${plural(occurrences, "time")}, across ${plural(changedDocs, "document")}.`
            : `“${find}” appears ${plural(occurrences, "time")} in ${plural(changedDocs, "document")}. Nothing has been changed yet.`,
      rows: rows.slice(0, 80),
      changed: apply && changedDocs > 0,
    };
  },
};

/* ------------------------------------------------------------ 5. bulk status */

const STATUS_COLLECTIONS = new Set(["pages", "posts", "services", "offers", "social-work"]);

/** Publish or unpublish a whole collection's worth of documents at once. */
const bulkStatus: Tool = {
  level: "write",
  run: async (payload, options, req) => {
    const collection = str(options.collection);
    const to = str(options.to) === "published" ? "published" : "draft";
    if (!STATUS_COLLECTIONS.has(collection)) {
      return { title: "Publish in bulk", summary: "Choose one of the collections offered." };
    }

    const from = to === "published" ? "draft" : "published";
    const docs = await all(payload, collection, { where: { status: { equals: from } } });
    if (docs.length === 0) {
      return {
        title: "Publish in bulk",
        summary: `Nothing in ${collection} is currently ${from}, so there is nothing to change.`,
      };
    }

    const rows: ToolRow[] = [];
    let done = 0;
    for (const doc of docs) {
      try {
        await payload.update({
          collection: collection as never,
          id: doc.id as never,
          data: { status: to, _status: "published" } as never,
          req,
        });
        done += 1;
        rows.push({
          label: str(doc.title, `#${doc.id}`),
          detail: to === "published" ? "Now on the website" : "Taken off the website",
          href: `/admin/collections/${collection}/${doc.id}`,
          tone: "good",
        });
      } catch (error) {
        rows.push({ label: str(doc.title, `#${doc.id}`), detail: (error as Error).message, tone: "bad" });
      }
    }

    return {
      title: to === "published" ? "Put on the website" : "Taken off the website",
      summary: `${plural(done, "document")} in ${collection} ${done === 1 ? "was" : "were"} changed.`,
      rows,
      changed: done > 0,
    };
  },
};

/* -------------------------------------------------------- 6. redirect import */

/**
 * A pile of old addresses, turned into redirects in one paste.
 *
 * The shape is "old address, new address" a line at a time, which is what comes
 * out of a spreadsheet, out of Search Console, and out of whatever the site was
 * before this one.
 */
const redirectImport: Tool = {
  level: "write",
  run: async (payload, options, req) => {
    const text = str(options.text);
    const lines = text
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);

    if (lines.length === 0) {
      return { title: "Add redirects in bulk", summary: "Paste one redirect a line: old address, new address." };
    }

    const existing = new Set(
      (await all(payload, "redirects")).map((row) => str(row.from)).filter(Boolean),
    );

    const rows: ToolRow[] = [];
    let added = 0;

    for (const line of lines.slice(0, 200)) {
      const [rawFrom, rawTo] = line.split(/\s*(?:,|→|->|\t|\s{2,})\s*/);
      const from = str(rawFrom);
      const to = str(rawTo);
      if (!from || !to || !from.startsWith("/")) {
        rows.push({ label: line, detail: "Skipped - needs an old address starting with / and a new one.", tone: "warn" });
        continue;
      }
      if (existing.has(from)) {
        rows.push({ label: from, detail: "Skipped - a redirect for this address already exists.", tone: "info" });
        continue;
      }
      try {
        await payload.create({ collection: "redirects", data: { from, to } as never, req });
        existing.add(from);
        added += 1;
        rows.push({ label: from, detail: `now sends people to ${to}`, tone: "good" });
      } catch (error) {
        rows.push({ label: from, detail: (error as Error).message, tone: "bad" });
      }
    }

    return {
      title: "Redirects added",
      summary: `${plural(added, "redirect")} added out of ${plural(lines.length, "line")} pasted.`,
      rows: rows.slice(0, 80),
      changed: added > 0,
    };
  },
};

/* ---------------------------------------------------- 7. translation coverage */

/**
 * How much of the website has been written in Nepali.
 *
 * Every bilingual field on the site is a pair - `heading` and `headingNe`
 * (cms/bilingual.ts) - so counting the pairs where the English is written and
 * the Nepali is not gives the coverage exactly, without a list of fields to keep
 * up to date.
 */
const translationReport: Tool = {
  level: "read",
  run: async (payload) => {
    const pages = await all(payload, "pages");
    const rows: ToolRow[] = [];
    let written = 0;
    let missing = 0;

    const measure = (doc: unknown): { done: number; todo: number } => {
      let done = 0;
      let todo = 0;
      const walk = (value: unknown) => {
        if (Array.isArray(value)) {
          value.forEach(walk);
          return;
        }
        if (!value || typeof value !== "object") return;
        const record = value as Record<string, unknown>;
        for (const key of Object.keys(record)) {
          if (key.endsWith("Ne")) {
            const english = record[key.slice(0, -2)];
            if (typeof english === "string" && english.trim()) {
              if (typeof record[key] === "string" && (record[key] as string).trim()) done += 1;
              else todo += 1;
            }
          }
          walk(record[key]);
        }
      };
      walk(doc);
      return { done, todo };
    };

    for (const page of pages) {
      const { done, todo } = measure(page);
      written += done;
      missing += todo;
      if (todo > 0) {
        rows.push({
          label: str(page.title, "Untitled"),
          detail: `${todo} of ${done + todo} lines still only in English`,
          href: `/admin/collections/pages/${page.id}`,
          tone: todo > done ? "bad" : "warn",
        });
      }
    }

    for (const faq of await all(payload, "faqs")) {
      const { done, todo } = measure(faq);
      written += done;
      missing += todo;
      if (todo > 0) {
        rows.push({
          label: str(faq.question, "A question"),
          detail: `${todo} line${todo === 1 ? "" : "s"} still only in English`,
          href: `/admin/collections/faqs/${faq.id}`,
          tone: "warn",
        });
      }
    }

    const total = written + missing;
    const percent = total === 0 ? 100 : Math.round((written / total) * 100);
    return {
      title: "How much of the site reads in Nepali",
      summary:
        total === 0
          ? "Nothing on the site has a Nepali half yet."
          : `${percent}% written in both - ${written} of ${total} lines. ${missing === 0 ? "Nothing is left." : `${plural(missing, "line")} still only in English.`}`,
      rows: rows.slice(0, 60),
    };
  },
};

/* ----------------------------------------------------------- 8. style presets */

/**
 * A whole look, applied in one click.
 *
 * Each preset is only what an administrator could set by hand on the Typography
 * and Layout tabs; having them here is a way of trying four of them in a minute
 * rather than an afternoon. "As designed" is the important one: it clears
 * everything, which is the way back from any experiment.
 */
/**
 * Every field the two screens hold, emptied.
 *
 * A group saved as `{}` is a group left exactly as it was - Payload merges what
 * it is given into what is there rather than replacing it - so "clear
 * everything" has to name every field, and so does every other preset: without
 * this, applying Compact after Editorial would leave Editorial's serif headings
 * behind on a screen that says Compact.
 */
const blank = (fields: string[]): Options =>
  Object.fromEntries(fields.map((field) => [field, null]));

const BLANK_TYPOGRAPHY = blank([
  "headingFont",
  "bodyFont",
  "baseSize",
  "scale",
  "bodyLineHeight",
  "headingWeight",
  "headingLetterSpacing",
  "kickerCase",
  "customFontFamily",
  "customFontUrl",
  "altFontFamily",
  "altFontUrl",
]);

const BLANK_LAYOUT = blank([
  "containerWidth",
  "sectionSpacing",
  "cardGap",
  "radius",
  "imageRadius",
  "buttonRadius",
  "shadow",
  "stickyHeader",
  "smoothScroll",
  "reduceMotion",
  "underlineLinks",
]);

const PRESETS: Record<string, { label: string; typography: Options; layout: Options }> = {
  designed: { label: "As designed - clear everything", typography: {}, layout: {} },
  editorial: {
    label: "Editorial - serif headings, generous reading",
    typography: {
      headingFont: "serif",
      bodyFont: "hanken",
      baseSize: 17,
      scale: 104,
      bodyLineHeight: 1.8,
      headingWeight: "600",
      headingLetterSpacing: -0.02,
      kickerCase: "none",
    },
    layout: { containerWidth: 1120, sectionSpacing: 88, radius: 8, imageRadius: 8, shadow: 6 },
  },
  compact: {
    label: "Compact - more on the screen at once",
    typography: { baseSize: 15, scale: 92, bodyLineHeight: 1.6 },
    layout: { containerWidth: 1280, sectionSpacing: 48, cardGap: 16, radius: 12, shadow: 8 },
  },
  bold: {
    label: "Bold - large headings, strong contrast",
    typography: {
      headingFont: "hanken",
      bodyFont: "inter",
      baseSize: 17,
      scale: 112,
      headingWeight: "800",
      headingLetterSpacing: -0.04,
      kickerCase: "uppercase",
    },
    layout: { sectionSpacing: 96, radius: 24, imageRadius: 24, buttonRadius: 999, shadow: 16 },
  },
  calm: {
    label: "Calm - quiet type, no movement",
    typography: { headingFont: "system", bodyFont: "system", baseSize: 16, scale: 100, headingWeight: "500" },
    layout: { sectionSpacing: 72, radius: 14, shadow: 4, reduceMotion: true, underlineLinks: true },
  },
};

const stylePreset: Tool = {
  level: "write",
  run: async (payload, options, req) => {
    const key = str(options.preset);
    const preset = PRESETS[key];
    if (!preset) {
      return {
        title: "Apply a look",
        summary: "Choose one of the looks offered.",
        rows: Object.entries(PRESETS).map(([value, entry]) => ({ label: entry.label, detail: value })),
      };
    }

    const current = (await readGlobal(payload, "site-settings")) ?? {};
    await payload.updateGlobal({
      slug: "site-settings",
      data: {
        ...withoutManaged(current),
        // Emptied first, so what a preset does not set is cleared rather than
        // inherited from whatever was applied before it.
        typography: { ...BLANK_TYPOGRAPHY, ...preset.typography },
        layout: { ...BLANK_LAYOUT, ...preset.layout },
        // A preset is a starting point, not a straitjacket: the per-section rows
        // an administrator wrote themselves are left exactly as they are.
      } as never,
      req,
    });

    return {
      title: preset.label,
      summary:
        key === "designed"
          ? "Every typography and layout setting has been cleared. The website is back to the way it was drawn."
          : `The look has been applied. Site Settings → Typography and Layout now hold these values, and either can be changed by hand from here.`,
      rows: Object.entries({ ...preset.typography, ...preset.layout }).map(([field, value]) => ({
        label: field,
        detail: String(value),
        tone: "good" as const,
      })),
      changed: true,
    };
  },
};

/* --------------------------------------------------------- 9. duplicate page */

/** A page, copied whole - every section, every word - under a new address. */
const duplicatePage: Tool = {
  level: "write",
  run: async (payload, options, req) => {
    const id = str(options.pageId);
    const title = str(options.title);
    if (!id) {
      const pages = await all(payload, "pages", { limit: 200 });
      return {
        title: "Copy a page",
        summary: "Choose the page to copy.",
        rows: pages.map((page) => ({
          label: str(page.title, "Untitled"),
          detail: str(page.path),
          href: `/admin/collections/pages/${page.id}`,
        })),
      };
    }

    let source: Record<string, unknown> | null = null;
    try {
      source = (await payload.findByID({ collection: "pages", id, depth: 0 })) as unknown as Record<
        string,
        unknown
      >;
    } catch {
      return { title: "Copy a page", summary: "That page could not be found." };
    }

    const name = title || `${str(source.title, "Page")} copy`;
    const slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_-]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Block and array rows carry ids of their own; Payload gives the copy new
    // ones, and keeping the originals would tie the two pages together.
    const clean = JSON.parse(JSON.stringify(withoutManaged(source))) as Record<string, unknown>;
    const stripIds = (value: unknown): void => {
      if (Array.isArray(value)) {
        value.forEach(stripIds);
        return;
      }
      if (!value || typeof value !== "object") return;
      const record = value as Record<string, unknown>;
      delete record.id;
      for (const entry of Object.values(record)) stripIds(entry);
    };
    for (const entry of Object.values(clean)) stripIds(entry);

    try {
      const created = (await payload.create({
        collection: "pages",
        data: {
          ...clean,
          title: name,
          slug,
          path: `/${slug}`,
          // The copy is a page built in the dashboard, whatever the original
          // was. Copying a built-in page's "Website page" kind would leave a
          // page the site has no route file for, and its address would answer
          // with a 404 the moment it was published.
          kind: "custom",
          // A copy is never live by accident.
          status: "draft",
          showInNav: false,
          _status: "published",
        } as never,
        req,
      })) as unknown as Record<string, unknown>;

      return {
        title: "Page copied",
        summary: `“${name}” now exists as a draft at /${slug}, with every section of the original in it.`,
        rows: [
          {
            label: name,
            detail: "Open it to change the words, then publish it when it is ready.",
            href: `/admin/collections/pages/${created.id}`,
            tone: "good",
          },
        ],
        changed: true,
      };
    } catch (error) {
      return { title: "Copy a page", summary: `That did not work: ${(error as Error).message}` };
    }
  },
};

/* ------------------------------------------------------- 10. settings snapshot */

/**
 * Every site-wide setting as one piece of text, and back again.
 *
 * Not a backup - the site has those, and they hold the content too. This is for
 * carrying a set of settings from one site to another, keeping a known-good
 * configuration in a file, or reading what is set without clicking through six
 * screens.
 */
const settingsSnapshot: Tool = {
  level: "read",
  run: async (payload) => {
    const snapshot: Record<string, unknown> = {};
    for (const slug of globalSlugs) {
      const global = await readGlobal(payload, slug);
      if (global) snapshot[slug] = withoutManaged(global);
    }
    return {
      title: "Settings, as text",
      summary: `${plural(Object.keys(snapshot).length, "screen")} of settings. Copy this somewhere safe, or paste it into another site's dashboard.`,
      payload: JSON.stringify(snapshot, null, 2),
    };
  },
};

const settingsRestore: Tool = {
  level: "write",
  run: async (payload, options, req) => {
    let parsed: Record<string, unknown>;
    try {
      parsed = JSON.parse(str(options.text)) as Record<string, unknown>;
    } catch {
      return { title: "Put settings back", summary: "That is not the text a snapshot produces." };
    }

    const rows: ToolRow[] = [];
    let applied = 0;
    for (const slug of globalSlugs) {
      const incoming = parsed[slug];
      if (!incoming || typeof incoming !== "object") continue;
      try {
        await payload.updateGlobal({
          slug: slug as never,
          data: withoutManaged(incoming as Record<string, unknown>) as never,
          req,
        });
        applied += 1;
        rows.push({ label: slug, detail: "restored", tone: "good" });
      } catch (error) {
        rows.push({ label: slug, detail: (error as Error).message, tone: "bad" });
      }
    }

    return {
      title: "Settings put back",
      summary: `${plural(applied, "screen")} of settings restored from the text pasted.`,
      rows,
      changed: applied > 0,
    };
  },
};

/* --------------------------------------------------------------- 11. purge */

/** One page rebuilt, rather than the whole website. */
const purgePath: Tool = {
  level: "write",
  run: async (_payload, options) => {
    const path = str(options.path, "/");
    if (!path.startsWith("/")) {
      return { title: "Rebuild one page", summary: "An address has to start with a /." };
    }
    try {
      revalidatePath(path, "page");
      return {
        title: "Page rebuilt",
        summary: `${path} will be built again from what is saved here the next time somebody opens it.`,
        changed: true,
      };
    } catch (error) {
      return { title: "Rebuild one page", summary: `That did not work: ${(error as Error).message}` };
    }
  },
};

/* -------------------------------------------------------- 12. prune traffic */

/**
 * Old visit records, thrown away.
 *
 * The traffic log grows by a row a visit and is only ever read as a total, so a
 * site a few years old is carrying a table it has no use for. The dashboard's
 * figures cover the last month; anything older than the window chosen here is
 * removed.
 */
const pruneTraffic: Tool = {
  level: "write",
  run: async (payload, options, req) => {
    const days = int(options.days, 180, 30, 1095);
    const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
    try {
      const result = await payload.delete({
        collection: "pageviews",
        where: { createdAt: { less_than: cutoff } },
        req,
      });
      const removed = Array.isArray(result?.docs) ? result.docs.length : 0;
      return {
        title: "Traffic log trimmed",
        summary:
          removed === 0
            ? `Nothing in the traffic log is older than ${days} days.`
            : `${plural(removed, "visit")} older than ${days} days ${removed === 1 ? "was" : "were"} removed. The dashboard's figures are unaffected.`,
        changed: removed > 0,
      };
    } catch (error) {
      return { title: "Traffic log trimmed", summary: `That did not work: ${(error as Error).message}` };
    }
  },
};

/* ------------------------------------------------------------------- routing */

export const TOOLS: Record<string, Tool> = {
  "link-check": linkCheck,
  "content-audit": contentAudit,
  "media-audit": mediaAudit,
  "find-replace": findReplace,
  "bulk-status": bulkStatus,
  "redirect-import": redirectImport,
  "translation-report": translationReport,
  "style-preset": stylePreset,
  "duplicate-page": duplicatePage,
  "settings-snapshot": settingsSnapshot,
  "settings-restore": settingsRestore,
  "purge-path": purgePath,
  "prune-traffic": pruneTraffic,
};

type Role = "admin" | "editor" | "author" | undefined;

const roleOf = (req: PayloadRequest): Role => (req.user as { role?: Role } | null)?.role;

export const advancedToolsEndpoint: Endpoint = {
  path: "/site-tools/advanced",
  method: "post",
  handler: async (req) => {
    const role = roleOf(req);
    if (!role) return Response.json({ error: "Sign in to use these." }, { status: 403 });

    const body = ((await req.json?.()) ?? {}) as { tool?: unknown } & Options;
    const name = typeof body.tool === "string" ? body.tool : "";
    const tool = TOOLS[name];
    if (!tool) return Response.json({ error: "There is no such tool." }, { status: 400 });

    const allowed = tool.level === "read" ? role === "admin" || role === "editor" : role === "admin";
    if (!allowed) {
      return Response.json(
        {
          error:
            tool.level === "read"
              ? "Sign in as an editor or administrator to run this."
              : "This one changes the website everywhere at once, so it is for administrators.",
        },
        { status: 403 },
      );
    }

    try {
      const result = await tool.run(req.payload, body, req);
      // A job that changed something has to reach the website as well as the
      // database, or the dashboard and the pages disagree until the next save.
      if (result.changed) {
        try {
          revalidatePath("/", "layout");
        } catch {
          // Outside a Next request there is nothing cached to purge.
        }
      }
      return Response.json(result);
    } catch (error) {
      req.payload.logger.error(`[advanced-tools] ${name} failed: ${(error as Error).message}`);
      return Response.json({ error: (error as Error).message }, { status: 500 });
    }
  },
};
