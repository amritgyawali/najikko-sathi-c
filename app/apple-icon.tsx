import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";
export default function Icon() {
  return new ImageResponse(<div style={{ display: "flex", width: "100%", height: "100%", alignItems: "center", justifyContent: "center", background: "#062b5c", color: "white", fontSize: 78, fontWeight: 700 }}>NS</div>, size);
}
