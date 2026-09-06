import { RoutePage, routeMetadata } from "../_components/route-page";
import { StructuredData } from "../_components/structured-data";
import { absoluteUrl, siteUrl } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";

/**
 * Everything on this page - the contact details band, the questions and the
 * photo showcase - is edited in the dashboard at Content → Website pages. The address,
 * phone numbers and email inside it come from Site → Site settings.
 */
export const generateMetadata = () => routeMetadata("/contact");

export default function ContactPage() {
  return <>
    <RoutePage path="/contact" />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "ContactPage", name: "Contact Najikko Sathi Media", url: absoluteUrl("/contact"), mainEntity: { "@id": `${siteUrl}/#organization` } }} />
  </>;
}
