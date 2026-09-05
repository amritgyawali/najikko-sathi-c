import { ImageResponse } from "next/og";
import { business } from "../_data/site";

export async function GET(request: Request) {
  const title = new URL(request.url).searchParams.get("title")?.slice(0, 120) || "Media that stays close to what matters.";
  return new ImageResponse(<div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: "65px 76px", background: "#062b5c", color: "white", fontFamily: "sans-serif" }}>
    <div style={{ display: "flex", alignItems: "center", gap: 22 }}><div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 72, height: 72, borderRadius: "50% 50% 50% 14%", background: "#1268d3", fontSize: 30, fontWeight: 700 }}>NS</div><span style={{ fontSize: 27 }}>{business.legalName}</span></div>
    <div style={{ display: "flex", flexDirection: "column" }}><div style={{ width: 60, height: 5, background: "#f2553d", marginBottom: 26 }} /><div style={{ display: "flex", fontSize: title.length > 70 ? 48 : 62, letterSpacing: -2, lineHeight: 1.1, fontWeight: 700 }}>{title}</div></div>
    <div style={{ display: "flex", justifyContent: "space-between", color: "#b4c9e8", fontSize: 22 }}><span>Anamnagar, Kathmandu · Nepal</span><span>{business.websiteLabel}</span></div>
  </div>, { width: 1200, height: 630, headers: { "Cache-Control": "public, max-age=86400, s-maxage=604800" } });
}
