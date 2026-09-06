import { getServiceViews } from "@/lib/services";
import { RoutePage, routeMetadata } from "../_components/route-page";
import { StructuredData } from "../_components/structured-data";
import { absoluteUrl } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";

/**
 * Everything on this page is edited in the dashboard at Content → Website pages. The
 * services it lists are the published ones in Content → Services, grouped by
 * the categories in Content → Service categories.
 */
export const generateMetadata = () => routeMetadata("/services");

export default async function ServicesPage() {
  const services = await getServiceViews();

  return <>
    <RoutePage path="/services" />
    <StructuredData data={{ "@context": "https://schema.org", "@type": "ItemList", name: "Najikko Sathi service portfolio", itemListElement: services.map((service, index) => ({ "@type": "ListItem", position: index + 1, name: service.title, url: absoluteUrl(`/services/${service.slug}`) })) }} />
  </>;
}
