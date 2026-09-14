import { ImageResponse } from "next/og";
import { business } from "../_data/site";
import { getBranding } from "@/lib/branding";

/**
 * The picture a link to this site shows when it is shared.
 *
 * The mark in the corner is the logo uploaded in Site Settings - the same file
 * as the header, the footer and the browser tab icon. Until one has been
 * uploaded the initials are drawn instead, as they are everywhere else.
 */
export async function GET(request: Request) {
  const title = new URL(request.url).searchParams.get("title")?.slice(0, 120) || "Media that stays close to what matters.";
  const branding = await getBranding();
  // ImageResponse fetches the picture itself, so it needs a full address, and
  // it cannot draw an SVG from a URL - those fall back to the initials.
  const logo = branding.uploaded && branding.type !== "image/svg+xml" && branding.url.startsWith("http")
    ? branding.url
    : null;

  // ImageResponse draws the card itself and understands `img` and nothing else,
  // so next/image has no part to play here.
  // eslint-disable-next-line @next/next/no-img-element
  const mark = logo ? <img src={logo} alt="" width={72} height={72} style={{ width: 72, height: 72, objectFit: "contain" }} />
    : <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: "50% 50% 50% 14%", background: "#1268d3", fontSize: 30, fontWeight: 700 }}>{business.initials}</div>;

  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "65px 76px", background: "#062b5c", color: "white", fontFamily: "sans-serif" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}>{mark}<span style={{ fontSize: 27 }}>{business.legalName}</span></div>
    <div style={{ display: "flex", flexDirection: "column" }}><div style={{ width: 60, height: 5, background: "#f2553d", marginBottom: 26 }} /><div style={{ display: "flex", fontSize: title.length > 70 ? 48 : 62, letterSpacing: -2, lineHeight: 1.1, fontWeight: 700 }}>{title}</div></div>
    <div style={{ display: "flex", justifyContent: "space-between", color: "#b4c9e8", fontSize: 22 }}><span>Anamnagar, Kathmandu · Nepal</span><span>{business.websiteLabel}</span></div>
  </div>, { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } });
}
