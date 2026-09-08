import config from "@payload-config";
import { getPayload } from "payload";

import { takeSnapshot, type Snapshot } from "@/lib/backup";

/**
 * Downloads a copy of the content as one JSON file.
 *
 * With no query it takes a fresh copy of everything right now. With
 * `?snapshot=12` it hands back the copy stored in that backup row instead,
 * which is how the "Download this copy" link on a backup works.
 *
 * Administrators only, either way: a copy holds every enquiry the site has ever
 * received. It is a portable backup and a way to take the content elsewhere -
 * the point of running an open-source CMS rather than renting one.
 *
 * The daily copies kept in the database are a separate thing, written by
 * cms/endpoints/backups.ts. This is the door out to a file on your own machine.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

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

  const stored = new URL(request.url).searchParams.get("snapshot");
  let snapshot: Snapshot;
  let stamp: string;

  if (stored) {
    try {
      const doc = await payload.findByID({
        collection: "backups",
        id: stored,
        depth: 0,
        overrideAccess: true,
      });
      snapshot = doc.data as Snapshot;
      stamp = String(doc.takenAt ?? "").slice(0, 10) || "backup";
    } catch {
      return Response.json({ error: "That backup no longer exists." }, { status: 404 });
    }
  } else {
    snapshot = await takeSnapshot(payload);
    stamp = snapshot.takenAt.slice(0, 10);
  }

  const body = JSON.stringify({ ...snapshot, exportedBy: user.email }, null, 2);

  return new Response(body, {
    headers: {
      "Content-Type": "application/json",
      "Content-Disposition": `attachment; filename="najikko-sathi-content-${stamp}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
