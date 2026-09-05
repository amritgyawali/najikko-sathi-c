import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Downloads every piece of content as one JSON file.
 *
 * Administrators only. It is a portable backup and a way to take the content
 * elsewhere - the point of running an open-source CMS rather than renting one.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const COLLECTIONS = [
  "pages",
  "posts",
  "services",
  "service-categories",
  "offers",
  "reviews",
  "faqs",
  "team",
  "media-slots",
  "redirects",
  "enquiries",
] as const;

const GLOBALS = ["homepage", "navigation", "announcement", "appearance", "footer", "site-settings"] as const;

export async function GET(request: Request) {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
    return Response.json({ error: "The CMS is not configured." }, { status: 503 });
  }

  const payload = await getPayload({ config });

  // Reuse the dashboard session; only an administrator may export everything.
  const { user } = await payload.auth({ headers: request.headers });
  if (!user || (user as { role?: string }).role !== "admin") {
    return Response.json(
      { error: "Sign in to the dashboard as an administrator to download a backup." },
      { status: 403 },
    );
  }

  const backup: Record<string, unknown> = {
    exportedAt: new Date().toISOString(),
    exportedBy: user.email,
  };

  for (const collection of COLLECTIONS) {
    try {
      const result = await payload.find({
        collection,
        limit: 0,
        depth: 0,
        pagination: false,
        overrideAccess: true,
      });
      backup[collection] = result.docs;
    } catch (error) {
      backup[collection] = { error: `Could not export: ${(error as Error).message}` };
    }
  }

  for (const slug of GLOBALS) {
    try {
      backup[slug] = await payload.findGlobal({ slug, depth: 0, overrideAccess: true });
    } catch (error) {
      backup[slug] = { error: `Could not export: ${(error as Error).message}` };
    }
  }

  const stamp = new Date().toISOString().slice(0, 10);
  return new Response(JSON.stringify(backup, null, 2), {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="najikko-sathi-content-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
