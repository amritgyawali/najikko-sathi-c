import type { Metadata } from "next";
import { cookies } from "next/headers";
import { Hanken_Grotesk, Inter, Noto_Sans_Devanagari } from "next/font/google";
import "./globals.css";
import "./pages.css";
import { AnnouncementBar } from "./_components/announcement-bar";
import { Footer, Header } from "./_components/site-shell";
import { LanguageProvider } from "./_components/language-provider";
import { StructuredData } from "./_components/structured-data";
import { TrackPageView } from "./_components/TrackPageView";
import { organization, siteUrl } from "./_lib/seo";
import { getBusiness, getTheme } from "@/lib/content";
import { LANGUAGE_COOKIE, normalizeLanguage } from "@/lib/i18n/config";

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

// Every face on the site switches to this one while the site is read in
// Nepali; globals.css points the heading and body variables at it.
const devanagari = Noto_Sans_Devanagari({
  subsets: ["devanagari", "latin"],
  variable: "--font-devanagari",
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
  const [business, theme, cookieStore] = await Promise.all([getBusiness(), getTheme(), cookies()]);
  // Reading the choice here means the document is already marked with the
  // right language, and the right font, on the first paint.
  const language = normalizeLanguage(cookieStore.get(LANGUAGE_COOKIE)?.value);
  const overrides = Object.entries(theme)
    .map(([token, value]) => `${token}:${value};`)
    .join("");

  return (
    <html lang={language} data-language={language} className={`${hanken.variable} ${inter.variable} ${devanagari.variable}`}>
      <head>{overrides ? <style>{`:root{${overrides}}`}</style> : null}</head>
      <body>
        <LanguageProvider initialLanguage={language}>
          <a className="skip-link" href="#main-content">Skip to content</a>
          <AnnouncementBar />
          <Header />
          <main id="main-content">{children}</main>
          <Footer />
        </LanguageProvider>
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
