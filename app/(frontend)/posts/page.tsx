import { RoutePage, routeMetadata } from "../_components/route-page";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";

/**
 * Everything on this page - its heading, its sections and their order - is
 * edited in the dashboard at Content → Website pages. Until the page is imported there,
 * it renders the copy it ships with, in lib/page-defaults.ts.
 */
export const generateMetadata = () => routeMetadata("/posts");

export default function PostsPage() {
  return <RoutePage path="/posts" />;
}
