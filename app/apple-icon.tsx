import { ImageResponse } from "next/og";
import { getBranding } from "@/lib/branding";
import { getBusiness } from "@/lib/content";

/**
 * The icon a phone saves to its home screen.
 *
 * Drawn rather than linked, because a home screen icon has to be an opaque
 * square of a fixed size: a logo with a transparent background comes out black
 * on iOS, and one that is not square is stretched. So the logo uploaded in Site
 * Settings is placed on the company's own blue, with room around it.
 *
 * Until a logo has been uploaded, the initials - the same mark the site draws
 * everywhere else in that case.
 */

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
// Drawn on request, like every page on the site, so replacing the logo in the
// dashboard is a save rather than a deploy. A phone asks for this once, when
// somebody adds the site to their home screen.
export const dynamic = "force-dynamic";

export default async function Icon() {
  const [branding, business] = await Promise.all([getBranding(), getBusiness()]);
  // This is drawn on the server, which fetches the picture itself: it needs a
  // full address, and it cannot read an SVG from one.
  const logo = branding.uploaded && branding.type !== "image/svg+xml" && branding.url.startsWith("http")
    ? branding.url
    : null;

  // ImageResponse draws this itself and understands `img` and nothing else, so
  // next/image has no part to play here.
  const mark = logo ? <img src={logo} alt="" width={132} height={132} style={{ width: 132, height: 132, objectFit: "contain" }} /> : business.initials;

  return new ImageResponse(
    (
      <div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#062b5c", color: "white", fontSize: 78, fontWeight: 700 }}>
        {mark}
      </div>
    ),
    size,
  );
}
