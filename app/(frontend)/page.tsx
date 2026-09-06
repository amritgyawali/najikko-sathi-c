import { RoutePage, routeMetadata } from "./_components/route-page";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";

/**
 * The front page. Its bands - the hero, the media system wheel, the
 * introduction and the leadership messages - are listed in the dashboard at
 * Content → Pages → Home, and the words in them are written in
 * Site → Homepage & page copy.
 */
export const generateMetadata = () => routeMetadata("/");

export default function Home() {
  return <RoutePage path="/" />;
}
