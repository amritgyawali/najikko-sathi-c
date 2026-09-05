import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { getBySlug, getCollection } from "@/lib/content";
import { RenderBlocks } from "../_components/RenderBlocks";

type Args = { params: Promise<{ slug: string }> };

/**
 * Renders any page created in the dashboard at /<slug>. Pages are rendered on
 * demand, so a newly published page is live without a redeploy.
 */
export async function generateStaticParams() {
  const pages = await getCollection("pages", {
    where: { status: { equals: "published" } },
    limit: 100,
    depth: 0,
  });
  return pages.filter((page) => page.slug).map((page) => ({ slug: page.slug as string }));
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const page = await getBySlug("pages", slug);
  if (!page) return {};
  return {
    title: page.seo?.title || page.title,
    description: page.seo?.description ?? undefined,
  };
}

export default async function CmsPage({ params }: Args) {
  const { slug } = await params;
  const page = await getBySlug("pages", slug);
  if (!page) notFound();

  return <RenderBlocks layout={page.layout} />;
}
