import type { MetadataRoute } from "next";
import { getBranding } from "@/lib/branding";
import { getBusiness, getTheme } from "@/lib/content";

/**
 * What a phone is handed when someone saves the site to their home screen.
 *
 * The icon is the logo uploaded in Site Settings, the same file as the browser
 * tab icon, so there is nothing separate to replace when the mark changes.
 */
// Read on request, like every page on the site, so replacing the logo in the
// dashboard is a save rather than a deploy.
export const dynamic = "force-dynamic";

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const [business, branding, theme] = await Promise.all([getBusiness(), getBranding(), getTheme()]);

  return {
    name: business.legalName,
    short_name: business.shortName,
    description: `${business.legalName}, ${business.address}, Nepal.`,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: theme["--primary"] ?? "#062b5c",
    icons: [
      // "any maskable" lets a phone both show the mark as it is and crop it into
      // whatever shape that phone uses for its home screen icons.
      { src: branding.url, type: branding.type, sizes: "any", purpose: "any" },
      { src: branding.url, type: branding.type, sizes: "any", purpose: "maskable" },
    ],
  };
}
