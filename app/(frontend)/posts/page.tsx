import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

import { getCollection, liveWhere } from "@/lib/content";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { ContactCta, PageHero, SectionHeading } from "../_components/page-content";
import { pageMetadata } from "../_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";




export const metadata = pageMetadata(
  "News, Blogs & Commentary",
  "Read news, blogs, commentary, and investigative writing published by Najikko Sathi Media in Kathmandu, Nepal.",
  "/posts",
);

const typeLabels: Record<string, string> = {
  news: "News",
  blog: "Blog",
  commentary: "Commentary",
  investigation: "Investigation",
};

export default async function PostsPage() {
  const posts = await getCollection("posts", {
    where: liveWhere(),
    limit: 60,
    sort: "-publishedAt",
  });

  return <>
    <PageHero eyebrow="Writing" title="News, blogs and commentary." description="Reporting, analysis, and writing published by our newsroom." path="/posts" label="Writing">
      <Link className="hero-cta" href="/contact">Share a story <ArrowRight aria-hidden="true" /></Link>
    </PageHero>
    <section className="content-section">
      <div className="site-container">
        <SectionHeading kicker="Latest" title="Recently published" />
        {posts.length === 0 ? (
          <p className="page-lead">Nothing has been published yet. New writing will appear here.</p>
        ) : (
          <div className="cms-card-grid">
            {posts.map((post) => {
              const cover = mediaUrl(post.coverImage);
              return (
                <Link className="cms-card" href={`/posts/${post.slug}`} key={post.id}>
                  {cover ? <Image src={cover} alt={mediaAlt(post.coverImage, post.title)} width={640} height={400} /> : null}
                  <span className="cms-badge">{typeLabels[post.type] ?? post.type}</span>
                  <strong>{post.title}</strong>
                  {post.excerpt ? <p>{post.excerpt}</p> : null}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
    <ContactCta title="Have something we should cover?" />
  </>;
}
