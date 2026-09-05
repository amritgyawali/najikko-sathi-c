import type { Metadata } from "next";
import { Hanken_Grotesk, Inter } from "next/font/google";
import "./globals.css";
import "./pages.css";
import { Header, Footer } from "./_components/site-shell";
import { StructuredData } from "./_components/structured-data";
import { business } from "./_data/site";
import { organization, siteUrl } from "./_lib/seo";

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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: "Najikko Sathi Media | Kathmandu, Nepal", template: "%s | Najikko Sathi" },
  description:
    "Najikko Sathi Media Pvt. Ltd. provides truthful digital media, documentary and video production, advertising, and media training from Anamnagar, Kathmandu.",
  applicationName: business.legalName,
  creator: business.legalName,
  publisher: business.legalName,
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1, "max-video-preview": -1 } },
  icons: { icon: "/brand-mark.svg" },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${hanken.variable} ${inter.variable}`}>
      <body>
        <a className="skip-link" href="#main-content">Skip to content</a>
        <Header />
        <main id="main-content">{children}</main>
        <Footer />
        <StructuredData data={[organization, { "@context": "https://schema.org", "@type": "WebSite", "@id": `${siteUrl}/#website`, url: siteUrl, name: business.legalName, publisher: { "@id": `${siteUrl}/#organization` } }]} />
      </body>
    </html>
  );
}
