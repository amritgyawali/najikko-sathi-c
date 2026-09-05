import type { Metadata } from "next";
import { business } from "../_data/site";

export const siteUrl = business.website;
export const absoluteUrl = (path: string) => new URL(path, `${siteUrl}/`).toString();

export function pageMetadata(title: string, description: string, path: string): Metadata {
  const image = `/social-preview?title=${encodeURIComponent(title)}`;
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
