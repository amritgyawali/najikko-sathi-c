import type { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getBySlug } from "@/lib/content";
import { Breadcrumbs } from "../../_components/page-content";
import { pageMetadata } from "../../_lib/seo";
import { mediaAlt, mediaUrl } from "@/lib/media";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";




type Args = { params: Promise<{ slug: string }> };


export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBySlug("posts", slug);
  if (!post) return {};
  return pageMetadata(
    post.seo?.title || post.title,
    post.seo?.description ||
      post.excerpt ||
      `${post.title} - published by Najikko Sathi Media in Kathmandu, Nepal.`,
    `/posts/${post.slug}`,
  );
}

export default async function PostPage({ params }: Args) {
  const { slug } = await params;
  const post = await getBySlug("posts", slug);
  if (!post) notFound();

  const cover = mediaUrl(post.coverImage);
  const published = post.publishedAt ? new Date(post.publishedAt) : null;

  return (
    <article className="cms-section">
          <div className="site-container cms-prose">
            <Breadcrumbs items={[{ label: "Writing", href: "/posts" }, { label: post.title, href: `/posts/${post.slug}` }]} />
            <span className="section-kicker">{post.type}</span>
            <h1>{post.title}</h1>
            {published ? (
              <time dateTime={published.toISOString()} className="cms-post-date">
                {published.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
              </time>
            ) : null}
            {cover ? (
              <Image
                className="cms-post-cover"
                src={cover}
                alt={mediaAlt(post.coverImage, post.title)}
                width={1200}
                height={675}
                priority
              />
            ) : null}
            {post.content ? <RichText data={post.content} /> : null}
          </div>
    </article>
  );
}
