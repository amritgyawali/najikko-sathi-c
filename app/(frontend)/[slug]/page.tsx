import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBySlug } from "@/lib/content";
import { pageMetadata } from "../_lib/seo";
import { Breadcrumbs } from "../_components/page-content";
import { RenderBlocks } from "../_components/RenderBlocks";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";




type Args = { params: Promise<{ slug: string }> };

/**
 * Renders any page created in the dashboard at /<slug>. Pages are rendered on
 * demand, so a newly published page is live without a redeploy.
 */

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const page = await getBySlug("pages", slug);
  if (!page) return {};
  return pageMetadata(
    page.seo?.title || page.title,
    page.seo?.description ||
      `${page.title} - Najikko Sathi Media Pvt. Ltd., a media house in Anamnagar, Kathmandu, Nepal.`,
    `/${page.slug}`,
  );
}

export default async function CmsPage({ params }: Args) {
  const { slug } = await params;
  const page = await getBySlug("pages", slug);
  if (!page) notFound();

  return <>
    <div className="site-container cms-breadcrumbs">
      <Breadcrumbs items={[{ label: page.title, href: `/${page.slug}` }]} />
    </div>
    <RenderBlocks layout={page.layout} />
  </>;
}
