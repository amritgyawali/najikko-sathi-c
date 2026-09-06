import { RoutePage, routeMetadata } from "../_components/route-page";
import { StructuredData } from "../_components/structured-data";
import { absoluteUrl, siteUrl } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";

/**
 * Everything on this page is edited in the dashboard at Content → Website pages.
 * Delete that document and it renders the copy it ships with, in
 * lib/page-defaults.ts, instead.
 */
export const generateMetadata = () => routeMetadata("/about");

export default function AboutPage() {
  return <>
    <RoutePage path="/about" />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "AboutPage", name: "About Najikko Sathi Media", url: absoluteUrl("/about"), about: { "@id": `${siteUrl}/#organization` } }} />
  </>;
}
