import type { Metadata } from "next";
import { getBusiness, type BusinessInfo } from "@/lib/content";

/**
 * The company's mark, in one place.
 *
 * There is a single logo in the dashboard - **Site → Site Settings → Logo** -
 * and everything that shows a mark reads it from here, so uploading a new file
 * changes the site's header, the media system wheel, the footer, the about
 * page's identity panel, the browser tab icon, the icon a phone saves to its
 * home screen, the share card, the logo a search engine is told about, and the
 * dashboard's own sign-in screen and sidebar. Nothing has a second copy to
 * keep in step.
 *
 * Until a logo has been uploaded every one of those falls back to the drawing
 * checked in at public/brand-mark.svg, or to the initials where a mark is
 * drawn rather than loaded.
 */

/** The mark shipped with the site, used until one has been uploaded. */
export const FALLBACK_MARK = "/brand-mark.svg";
export const FALLBACK_MARK_TYPE = "image/svg+xml";

export type Branding = {
  /** The uploaded logo, or the checked-in mark when none has been uploaded. */
  url: string;
  alt: string;
  type: string;
  /** Whether that address is the owner's own file rather than the fallback. */
  uploaded: boolean;
  initials: string;
};

export const brandingOf = (business: BusinessInfo): Branding =>
  business.logoUrl
    ? {
        url: business.logoUrl,
        alt: business.logoAlt,
        type: business.logoType || "image/png",
        uploaded: true,
        initials: business.initials,
      }
    : {
        url: FALLBACK_MARK,
        alt: business.legalName,
        type: FALLBACK_MARK_TYPE,
        uploaded: false,
        initials: business.initials,
      };

/** The mark for whoever is asking, read from Site Settings. */
export const getBranding = async (): Promise<Branding> => brandingOf(await getBusiness());

/**
 * Every icon a browser or a phone asks for.
 *
 * The tab and bookmark icons point straight at the uploaded file. `sizes: "any"`
 * tells a browser it may scale that one image to whatever it needs, rather than
 * declaring sizes an upload has no reason to match.
 *
 * The home screen icon is the drawing at app/apple-icon.tsx instead, because a
 * phone needs an opaque square of a fixed size - it puts the same logo onto
 * one. It has to be named here: declaring `icons` at all replaces the icons
 * Next would otherwise work out from the files in app/, so a page that sets one
 * of them must set them all.
 */
export const APPLE_ICON = "/apple-icon";

export const iconsFor = (branding: Branding): Metadata["icons"] => ({
  icon: [{ url: branding.url, type: branding.type, sizes: "any" }],
  shortcut: [{ url: branding.url, type: branding.type }],
  apple: [{ url: APPLE_ICON, type: "image/png", sizes: "180x180" }],
});
