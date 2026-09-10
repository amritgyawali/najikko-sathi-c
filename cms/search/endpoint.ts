import type { Endpoint } from "payload";

import { search, warmSearchIndex } from "./engine";

/**
 * Serves the dashboard search bar at GET /api/dashboard-search?q=...
 *
 * Signed in only: the index is built with the caller's own access rules, and an
 * anonymous caller has none.
 */
export const dashboardSearchEndpoint: Endpoint = {
  path: "/dashboard-search",
  method: "get",
  handler: async (req) => {
    if (!req.user) {
      return Response.json({ error: "Not authenticated." }, { status: 401 });
    }

    const url = new URL(req.url ?? "", "http://localhost");
    const query = (url.searchParams.get("q") ?? "").slice(0, 200);
    const limit = Number.parseInt(url.searchParams.get("limit") ?? "", 10);
    const refresh = url.searchParams.get("refresh") === "1";

    // The dashboard asks for this on load so the first search is not the one
    // that pays for reading the whole site.
    if (url.searchParams.get("warm") === "1") {
      try {
        return Response.json({ warmed: true, indexedDocuments: await warmSearchIndex(req) });
      } catch {
        return Response.json({ warmed: false, indexedDocuments: 0 });
      }
    }

    if (query.trim().length === 0) {
      return Response.json({ query, hits: [], documents: 0, approximate: false, indexedDocuments: 0, tookMs: 0 });
    }

    try {
      const results = await search(req, query, {
        limit: Number.isFinite(limit) ? limit : undefined,
        refresh,
      });
      return Response.json(results, {
        // The snapshot behind this already has its own short life; never let a
        // browser or proxy hold on to one editor's results.
        headers: { "Cache-Control": "private, no-store" },
      });
    } catch (error) {
      req.payload.logger.error({ err: error }, "[dashboard-search] failed");
      return Response.json({ error: "Search failed." }, { status: 500 });
    }
  },
};
