import { revalidatePath } from "next/cache";
import type { Endpoint, PayloadRequest } from "payload";

/**
 * The dashboard's own toolbox, behind three addresses.
 *
 * GET  /api/site-tools/search?q=   - one search across every collection at once.
 * POST /api/site-tools/refresh     - rebuild the public site from what is saved.
 * GET  /api/site-tools/export      - a spreadsheet of any collection.
 *
 * Payload already publishes a REST route per collection, so none of this is
 * about reaching the data. It is about doing in one call what would otherwise be
 * a dozen: the command palette cannot fire fourteen requests on every keystroke,
 * and "put the website back in step with the dashboard" is not a thing any
 * single collection's route can do.
 *
 * All three are staff-only. The rule is the same one the collections apply, read
 * from the signed-in user rather than from anything in the request.
 */

type Role = "admin" | "editor" | "author" | undefined;

const roleOf = (req: PayloadRequest): Role => (req.user as { role?: Role } | null)?.role;

const canRead = (req: PayloadRequest): boolean => Boolean(req.user);
const canEdit = (req: PayloadRequest): boolean => {
  const role = roleOf(req);
  return role === "admin" || role === "editor";
};

const denied = (what: string) =>
  Response.json({ error: `Sign in as ${what} to do this.` }, { status: 403 });

/* -------------------------------------------------------------------- search */

/**
 * Everything worth finding by name, and the field its name is kept in.
 *
 * A collection is listed here once; adding one to the site means adding a line.
 * The label is what the palette shows beside the result, so it reads as a
 * sentence: "About - Website page".
 */
const SEARCHABLE: { slug: string; label: string; field: string; extra?: string }[] = [
  { slug: "pages", label: "Website page", field: "title", extra: "path" },
  { slug: "posts", label: "Post", field: "title", extra: "excerpt" },
  { slug: "services", label: "Service", field: "title", extra: "shortTitle" },
  { slug: "offers", label: "Offer", field: "title", extra: "summary" },
  { slug: "reviews", label: "Review", field: "name", extra: "quote" },
  { slug: "faqs", label: "Question", field: "question" },
  { slug: "team-members", label: "Team member", field: "name", extra: "role" },
  { slug: "well-wishers", label: "Well-wisher", field: "name" },
  { slug: "social-work", label: "Social work", field: "title" },
  { slug: "social-responsibility", label: "Social responsibility", field: "title" },
  { slug: "service-categories", label: "Service category", field: "title" },
  { slug: "media", label: "File", field: "filename", extra: "alt" },
  { slug: "media-slots", label: "Page media", field: "key" },
  { slug: "enquiries", label: "Enquiry", field: "name", extra: "email" },
  { slug: "redirects", label: "Redirect", field: "from" },
  { slug: "users", label: "Person", field: "name", extra: "email" },
];

export const searchEndpoint: Endpoint = {
  path: "/site-tools/search",
  method: "get",
  handler: async (req) => {
    if (!canRead(req)) return denied("a member of staff");

    const term = (new URL(req.url ?? "", "http://localhost").searchParams.get("q") ?? "").trim();
    if (term.length < 2) return Response.json({ results: [] });

    const found = await Promise.all(
      SEARCHABLE.map(async (entry) => {
        try {
          const result = await req.payload.find({
            collection: entry.slug as never,
            where: {
              or: [
                { [entry.field]: { like: term } },
                ...(entry.extra ? [{ [entry.extra]: { like: term } }] : []),
              ],
            } as never,
            limit: 4,
            depth: 0,
            // Whoever is searching sees only what they are allowed to open, so
            // an author cannot find another author's drafts through the palette.
            overrideAccess: false,
            user: req.user,
            req,
          });

          return result.docs.map((doc) => {
            const row = doc as Record<string, unknown>;
            const title = row[entry.field];
            const detail = entry.extra ? row[entry.extra] : undefined;
            return {
              id: String(row.id),
              title: typeof title === "string" && title ? title : "Untitled",
              detail: typeof detail === "string" ? detail.slice(0, 90) : "",
              kind: entry.label,
              status: typeof row.status === "string" ? row.status : null,
              href: `/admin/collections/${entry.slug}/${row.id}`,
            };
          });
        } catch {
          // A collection the signed-in person cannot read, or a table that is
          // not migrated yet. Neither should empty the whole result list.
          return [];
        }
      }),
    );

    return Response.json({ results: found.flat().slice(0, 24) });
  },
};

/* ------------------------------------------------------------------- refresh */

/**
 * Rebuild the public site.
 *
 * Every save already purges what it touched, so this is the button for the case
 * that leaves no trace: a deploy that warmed the cache from an older database, a
 * hook that failed quietly, or simply an owner who wants to be certain that what
 * they are looking at is what a visitor gets.
 */
export const refreshEndpoint: Endpoint = {
  path: "/site-tools/refresh",
  method: "post",
  handler: async (req) => {
    if (!canEdit(req)) return denied("an editor or administrator");

    try {
      revalidatePath("/", "layout");
      req.payload.logger.info("[site-tools] the website was rebuilt from the dashboard.");
      return Response.json({
        ok: true,
        message: "The website has been rebuilt. Every page now shows what is saved here.",
      });
    } catch (error) {
      return Response.json({ error: (error as Error).message }, { status: 500 });
    }
  },
};

/* -------------------------------------------------------------------- export */

/** Anything that is not a plain value is left out; a spreadsheet cannot hold it. */
const cell = (value: unknown): string => {
  if (value === null || value === undefined) return "";
  if (typeof value === "object") {
    // A relationship or an upload: its id is the useful half.
    const id = (value as { id?: unknown }).id;
    return id === undefined ? "" : String(id);
  }
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

const EXPORTABLE = new Set([
  "enquiries",
  "reviews",
  "pageviews",
  "posts",
  "pages",
  "services",
  "offers",
  "faqs",
  "team-members",
  "media",
  "users",
]);

/**
 * A collection as a spreadsheet.
 *
 * Enquiries are the reason this exists - a year of them belongs in a
 * spreadsheet, not in a list view - but every collection is offered, because the
 * cost of doing so is a set of allowed names.
 */
export const exportEndpoint: Endpoint = {
  path: "/site-tools/export",
  method: "get",
  handler: async (req) => {
    if (!canEdit(req)) return denied("an editor or administrator");

    const params = new URL(req.url ?? "", "http://localhost").searchParams;
    const collection = params.get("collection") ?? "";
    if (!EXPORTABLE.has(collection)) {
      return Response.json({ error: "That collection cannot be exported." }, { status: 400 });
    }

    try {
      const found = await req.payload.find({
        collection: collection as never,
        limit: 5000,
        depth: 0,
        pagination: false,
        sort: "-createdAt",
        overrideAccess: false,
        user: req.user,
        req,
      });

      const docs = found.docs as Record<string, unknown>[];
      // Every column any row uses, in the order the rows introduce them.
      const columns = [...new Set(docs.flatMap((doc) => Object.keys(doc)))];
      const rows = [
        columns.join(","),
        ...docs.map((doc) => columns.map((column) => cell(doc[column])).join(",")),
      ];

      const stamp = new Date().toISOString().slice(0, 10);
      return new Response(`﻿${rows.join("\n")}`, {
        headers: {
          "content-type": "text/csv; charset=utf-8",
          "content-disposition": `attachment; filename="${collection}-${stamp}.csv"`,
        },
      });
    } catch (error) {
      return Response.json({ error: (error as Error).message }, { status: 500 });
    }
  },
};

export const siteToolEndpoints: Endpoint[] = [searchEndpoint, refreshEndpoint, exportEndpoint];
