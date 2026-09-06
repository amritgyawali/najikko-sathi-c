import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getPageAt } from "@/lib/page-content";
import { pageMetadata } from "../_lib/seo";
import { Breadcrumbs } from "../_components/page-content";
import { PageSections } from "../_components/PageSections";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";

type Args = { params: Promise<{ slug: string }> };

/**
 * Renders any page created in the dashboard at /<slug>. Pages are rendered on
 * demand, so a newly published page is live without a redeploy, and setting one
 * back to Draft takes its address off the website.
 */

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPageAt(`/${slug}`);
  if (!page || page.hidden) return {};

  const meta = pageMetadata(
    page.seo.title || page.title,
    page.seo.description ||
      `${page.title} - Najikko Sathi Media Pvt. Ltd., a media house in Anamnagar, Kathmandu, Nepal.`,
    page.path,
  );
  return page.noindex ? { ...meta, robots: { index: false, follow: false } } : meta;
}

export default async function CmsPage({ params }: Args) {
  const { slug } = await params;
  const page = await getPageAt(`/${slug}`);
  if (!page || page.hidden || !page.doc) notFound();

  // A page that opens with its own hero draws its own breadcrumb trail.
  const hasHero = page.sections.some((section) => section.blockType === "pageHero");

  return <>
    {hasHero ? null : (
      <div className="site-container cms-breadcrumbs">
        <Breadcrumbs items={[{ label: page.title, href: page.path }]} />
      </div>
    )}
    <PageSections sections={page.sections} page={{ path: page.path, label: page.title }} />
  </>;
}
