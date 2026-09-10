import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBySlug } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { Breadcrumbs } from "../../_components/page-content";
import { SocialWorkEntry } from "../../_components/social-work";
import { pageMetadata } from "../../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";

/**
 * One piece of social work, in full.
 *
 * /social-work lists the entries as cards; this is what a card opens. Everything
 * on it - the description, the photographs, the films - is uploaded in Content →
 * Social Work, and the address comes from the entry's own slug, so publishing an
 * entry is all it takes for this page to exist.
 */

type Args = { params: Promise<{ slug: string }> };

/** The first line or so of the description, for search results and shares. */
function describe(summary: string | null | undefined, description: string | null | undefined, title: string) {
  const written = summary?.trim() || description?.trim();
  if (!written) return `${title} - social work by Najikko Sathi Media in Kathmandu, Nepal.`;
  return written.length > 300 ? `${written.slice(0, 297).trimEnd()}…` : written;
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const entry = await getBySlug("social-work", slug);
  if (!entry) return {};

  const cover = mediaUrl(entry.coverImage);
  return pageMetadata(
    entry.title,
    describe(entry.summary, entry.description, entry.title),
    `/social-work/${entry.slug}`,
    cover ?? undefined,
  );
}

export default async function SocialWorkEntryPage({ params }: Args) {
  const { slug } = await params;
  const entry = await getBySlug("social-work", slug);
  if (!entry) notFound();

  return (
    <section className="content-section social-section">
      <div className="site-container">
        <Breadcrumbs
          items={[
            { label: "Social work", href: "/social-work" },
            { label: entry.title, href: `/social-work/${entry.slug}` },
          ]}
        />
        <SocialWorkEntry entry={entry} />
      </div>
    </section>
  );
}
