import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";

import { getBusiness, getTheme } from "@/lib/content";
import { TrackPageView } from "./_components/TrackPageView";
import "./globals.css";

const hanken = Hanken_Grotesk({
  subsets: ["latin"],
  variable: "--font-hanken",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const business = await getBusiness();
  return {
    title: `${business.legalName} | Media, Production & Right Sanchar`,
    description:
      `${business.legalName} provides truthful digital media, documentary and video production, ` +
      `advertising, and media training from ${business.address}.`,
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Colours saved in the dashboard override the defaults declared in
  // globals.css. Injecting them here means a branding change takes effect on
  // the next request, with no rebuild.
  const theme = await getTheme();
  const overrides = Object.entries(theme)
    .map(([token, value]) => `${token}:${value};`)
    .join("");

  return (
    <html lang="en" className={`${hanken.variable} ${inter.variable}`}>
      <head>
        {overrides ? <style>{`:root{${overrides}}`}</style> : null}
      </head>
      <body>
        {children}
        <TrackPageView />
      </body>
    </html>
  );
}
