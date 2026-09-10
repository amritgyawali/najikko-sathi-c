import type { Metadata } from "next";
import { business } from "../_data/site";

export const siteUrl = business.website;
export const absoluteUrl = (path: string) => new URL(path, `${siteUrl}/`).toString();

/**
 * A page's title, description and share card.
 *
 * The card is drawn from the title unless the page has a photograph of its own
 * worth showing instead - a social work entry's cover, say, which says far more
 * about the page than a generated card of its name would.
 */
export function pageMetadata(
  title: string,
  description: string,
  path: string,
  photo?: string,
): Metadata {
  const image = photo || `/social-preview?title=${encodeURIComponent(title)}`;
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { type: "website", locale: "en_NP", siteName: business.legalName, title, description, url: path, images: [{ url: image, width: 1200, height: 630, alt: `${title} | ${business.shortName}` }] },
    twitter: { card: "summary_large_image", title, description, images: [image] },
  };
}

export const organization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${siteUrl}/#organization`,
  name: business.legalName,
  url: siteUrl,
  logo: absoluteUrl("/brand-mark.svg"),
  email: business.email,
  telephone: `+977${business.phones[0]}`,
  address: { "@type": "PostalAddress", streetAddress: "Anamnagar", addressLocality: "Kathmandu", addressCountry: "NP" },
  contactPoint: business.phones.map((phone) => ({ "@type": "ContactPoint", telephone: `+977${phone}`, contactType: "customer service" })),
};
