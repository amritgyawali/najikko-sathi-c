import config from "@payload-config";
import { getPayload } from "payload";

/**
 * Cookie-free page-view collector. It records the path, the referring host and
 * a coarse device class - nothing that identifies a visitor - which keeps the
 * dashboard statistics useful without a consent banner.
 */

export const runtime = "nodejs";

const deviceFrom = (userAgent: string): "desktop" | "mobile" | "tablet" => {
  if (/tablet|ipad/i.test(userAgent)) return "tablet";
  if (/mobi|android|iphone/i.test(userAgent)) return "mobile";
  return "desktop";
};

/** Keep only the host of the referrer, so we never store a full external URL. */
const referrerHost = (value: unknown): string | undefined => {
  if (typeof value !== "string" || value === "") return undefined;
  try {
    return new URL(value).hostname;
  } catch {
    return undefined;
  }
};

export async function POST(request: Request) {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
    return new Response(null, { status: 204 });
  }

  try {
    const body = (await request.json()) as { path?: unknown; referrer?: unknown };
    const path = typeof body.path === "string" ? body.path.slice(0, 512) : null;

    // Only record real site paths, and never the dashboard itself.
    if (!path || !path.startsWith("/") || path.startsWith("/admin")) {
      return new Response(null, { status: 204 });
    }

    const payload = await getPayload({ config });
    await payload.create({
      collection: "pageviews",
      data: {
        path,
        referrer: referrerHost(body.referrer),
        device: deviceFrom(request.headers.get("user-agent") ?? ""),
      },
      // The collection denies public writes; this endpoint is the only writer.
      overrideAccess: true,
    });
  } catch (error) {
    // Analytics must never break a page view.
    console.error("[track] failed to record view:", error);
  }

  return new Response(null, { status: 204 });
}
