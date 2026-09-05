import type { Metadata } from "next";
import { RichText } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import { notFound } from "next/navigation";

import { getBySlug, getCollection } from "@/lib/content";
import { mediaAlt, mediaUrl } from "@/lib/media";

type Args = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const posts = await getCollection("posts", {
    where: { status: { equals: "published" } },
    limit: 100,
    depth: 0,
  });
  return posts.filter((post) => post.slug).map((post) => ({ slug: post.slug as string }));
}

export async function generateMetadata({ params }: Args): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBySlug("posts", slug);
  if (!post) return {};
  return {
    title: post.seo?.title || post.title,
    description: post.seo?.description || post.excerpt || undefined,
  };
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
