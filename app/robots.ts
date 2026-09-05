import type { MetadataRoute } from "next";
import { siteUrl } from "./(frontend)/_lib/seo";

// Next only picks up robots.ts at the root of app/, not inside a route group,
// so this stays here while the rest of the public site lives in (frontend).
export default function robots(): MetadataRoute.Robots {
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${siteUrl}/sitemap.xml`, host: siteUrl };
}
