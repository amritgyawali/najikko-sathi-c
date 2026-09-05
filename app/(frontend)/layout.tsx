import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import "./pages.css";
import { Footer, Header } from "./_components/site-shell";
import { StructuredData } from "./_components/structured-data";
import { TrackPageView } from "./_components/TrackPageView";
import { organization, siteUrl } from "./_lib/seo";
import { getBusiness, getTheme } from "@/lib/content";

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
    metadataBase: new URL(siteUrl),
    title: {
      default: `${business.shortName} Media | Kathmandu, Nepal`,
      template: `%s | ${business.shortName}`,
    },
    description:
      `${business.legalName} provides truthful digital media, documentary and video ` +
      `production, advertising, and media training from ${business.address}.`,
    applicationName: business.legalName,
    creator: business.legalName,
    publisher: business.legalName,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    icons: { icon: "/brand-mark.svg" },
  };
}

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  // Colours saved in the dashboard override the defaults declared in
  // globals.css. Injecting them here means a branding change takes effect on
  // the next request, with no rebuild.
  const [business, theme] = await Promise.all([getBusiness(), getTheme()]);
  const overrides = Object.entries(theme)
    .map(([token, value]) => `${token}:${value};`)
    .join("");

  return (
    <html lang="en" className={`${hanken.variable} ${inter.variable}`}>
      <head>{overrides ? <style>{`:root{${overrides}}`}</style> : null}</head>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <StructuredData
          data={[
            organization,
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              "@id": `${siteUrl}/#website`,
              url: siteUrl,
              name: business.legalName,
              publisher: { "@id": `${siteUrl}/#organization` },
            },
          ]}
        />
        <TrackPageView />
      </body>
    </html>
  );
}
