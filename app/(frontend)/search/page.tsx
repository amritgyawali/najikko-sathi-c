import { RoutePage, routeMetadata } from "../_components/route-page";

// Always rendered per request: the results depend on what was typed, and on
// what has been published since.
export const dynamic = "force-dynamic";

/**
 * The search page. Its heading and the wording around the box are edited in the
 * dashboard at Content → Website pages; the results are gathered as a visitor searches.
 */
export const generateMetadata = () => routeMetadata("/search");

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  return <RoutePage path="/search" query={q ?? ""} />;
}
