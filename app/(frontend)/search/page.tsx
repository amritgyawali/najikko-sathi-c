import Link from "next/link";
import { ArrowRight, Search as SearchIcon } from "lucide-react";

import { getCollection, liveWhere } from "@/lib/content";
import { getServiceViews } from "@/lib/services";
import { PageHero, SectionHeading } from "../_components/page-content";
import { pageMetadata } from "../_lib/seo";

export const metadata = { ...pageMetadata("Search", "Search the Najikko Sathi website.", "/search"), robots: { index: false } };

type Hit = { title: string; description: string; href: string; kind: string };

const matches = (query: string, ...fields: (string | null | undefined)[]) =>
  fields.some((field) => (field ?? "").toLowerCase().includes(query));

/**
 * Site-wide search across services, writing, offers and any page built in the
 * dashboard. It filters in the server rather than calling a search service, so
 * new content is searchable the moment it is published.
 */
export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const query = ((await searchParams).q ?? "").trim();
  const needle = query.toLowerCase();
  let hits: Hit[] = [];

  if (needle.length >= 2) {
    const [services, posts, pages, offers] = await Promise.all([
      getServiceViews(),
      getCollection("posts", { where: liveWhere(), limit: 200, depth: 0 }),
      getCollection("pages", { where: { status: { equals: "published" } }, limit: 200, depth: 0 }),
      getCollection("offers", { where: liveWhere(), limit: 200, depth: 0 }),
    ]);

    hits = [
      ...services
        .filter((service) => matches(needle, service.title, service.shortTitle, service.description, service.intro))
        .map((service) => ({ title: service.title, description: service.description, href: `/services/${service.slug}`, kind: "Service" })),
      ...posts
        .filter((post) => matches(needle, post.title, post.excerpt))
        .map((post) => ({ title: post.title, description: post.excerpt ?? "", href: `/posts/${post.slug}`, kind: "Writing" })),
      ...pages
        .filter((page) => matches(needle, page.title))
        .map((page) => ({ title: page.title, description: "", href: `/${page.slug}`, kind: "Page" })),
      ...offers
        .filter((offer) => matches(needle, offer.title, offer.summary))
        .map((offer) => ({ title: offer.title, description: offer.summary, href: "/offers", kind: "Offer" })),
    ];
  }

  return <>
    <PageHero eyebrow="Search" title="Find what you need." description="Search services, writing, offers, and pages across this website." path="/search" label="Search" />
    <section className="content-section">
      <div className="site-container">
        <form className="search-form" action="/search" role="search">
          <label htmlFor="q">Search this website</label>
          <div className="search-field">
            <SearchIcon aria-hidden="true" />
            <input id="q" name="q" type="search" defaultValue={query} placeholder="Try “documentary” or “training”" autoComplete="off" />
            <button className="primary-button" type="submit">Search</button>
          </div>
        </form>

        {query.length === 0 ? null : needle.length < 2 ? (
          <p className="page-lead">Please enter at least two characters.</p>
        ) : hits.length === 0 ? (
          <p className="page-lead">Nothing matched “{query}”. Try a different word.</p>
        ) : (
          <>
            <SectionHeading kicker="Results" title={`${hits.length} ${hits.length === 1 ? "result" : "results"} for “${query}”`} />
            <div className="search-results">
              {hits.map((hit) => (
                <Link className="search-result" href={hit.href} key={`${hit.kind}-${hit.href}-${hit.title}`}>
                  <span className="cms-badge">{hit.kind}</span>
                  <strong>{hit.title}</strong>
                  {hit.description ? <p>{hit.description}</p> : null}
                  <span className="search-result-go">Open <ArrowRight aria-hidden="true" /></span>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  </>;
}
