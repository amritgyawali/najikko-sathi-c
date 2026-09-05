import { NextResponse, type NextRequest } from "next/server";

/**
 * Applies the redirects managed in the dashboard.
 *
 * Next 16 renamed this file convention from middleware to proxy.
 *
 * Proxy always runs on the Node.js runtime, so it can reach the database. The
 * matcher keeps it off the admin panel, the API, build output and files.
 */
export const config = {
  matcher: [
    {
      source:
        "/((?!admin|api|enquiry|track|backup|_next/static|_next/image|images|media|favicon.ico|robots.txt|sitemap.xml|apple-icon).*)",
      // Only real page loads. Running on React Server Component traffic makes
      // Next re-issue each prefetch under a fresh _rsc token, which loops
      // forever and breaks client-side navigation.
      missing: [
        { type: "header", key: "rsc" },
        { type: "header", key: "next-router-prefetch" },
        { type: "header", key: "next-action" },
        { type: "header", key: "purpose", value: "prefetch" },
      ],
    },
  ],
};

export default async function proxy(request: NextRequest) {
  if (!process.env.DATABASE_URI || !process.env.PAYLOAD_SECRET) {
    return NextResponse.next();
  }

  const path = request.nextUrl.pathname;

  try {
    const { default: config } = await import("@payload-config");
    const { getPayload } = await import("payload");
    const payload = await getPayload({ config });

    const found = await payload.find({
      collection: "redirects",
      where: { from: { equals: path } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    });

    const rule = found.docs[0];
    if (!rule?.to) return NextResponse.next();

    const destination = rule.to.startsWith("http")
      ? rule.to
      : new URL(rule.to, request.url).toString();

    return NextResponse.redirect(destination, rule.permanent ? 308 : 307);
  } catch (error) {
    // A redirect lookup must never take the site down.
    console.error("[redirects] lookup failed:", error);
    return NextResponse.next();
  }
}
