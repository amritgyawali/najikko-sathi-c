import type { Endpoint, PayloadRequest } from "payload";

import { importRoutePages, restoreRoutePages } from "../site-pages";

/**
 * The dashboard's "add the website's pages" button.
 *
 * POST /api/site-pages with `{ "action": "import" }` creates a document for
 * every built-in page that does not have one yet, so all of them can be edited
 * in Content → Pages. `{ "action": "restore", "paths": ["/about"] }` deletes
 * the document again, putting that page back to the copy it ships with.
 *
 * Only signed-in editors and administrators may do either, which is the same
 * rule the Pages collection itself applies.
 */

const canEdit = (req: PayloadRequest): boolean => {
  const role = (req.user as { role?: string } | null | undefined)?.role;
  return role === "admin" || role === "editor";
};

type Body = { action?: "import" | "restore"; paths?: string[] };

export const sitePagesEndpoint: Endpoint = {
  path: "/site-pages",
  method: "post",
  handler: async (req) => {
    if (!canEdit(req)) {
      return Response.json({ error: "Only an editor or administrator can change the website's pages." }, { status: 403 });
    }

    let body: Body = {};
    try {
      body = ((await req.json?.()) ?? {}) as Body;
    } catch {
      // An empty body means "import everything", which is the common case.
    }

    const paths = Array.isArray(body.paths)
      ? body.paths.filter((path): path is string => typeof path === "string")
      : undefined;

    if (body.action === "restore") {
      if (!paths?.length) {
        return Response.json({ error: "Name the pages to restore." }, { status: 400 });
      }
      return Response.json(await restoreRoutePages(req.payload, paths));
    }

    return Response.json(await importRoutePages(req.payload, paths));
  },
};
