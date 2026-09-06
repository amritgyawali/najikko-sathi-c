import { RichText } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";

import type { Page } from "@/payload-types";
import { getCollection } from "@/lib/content";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { onPage, placementKeyFor } from "@/lib/placements";

type Block = NonNullable<Page["layout"]>[number];

function Hero({ block }: { block: Extract<Block, { blockType: "hero" }> }) {
  const src = mediaUrl(block.background);
  return (
    <section className="cms-hero">
      {src ? (
        <Image className="cms-hero-image" src={src} alt={mediaAlt(block.background)} fill sizes="100vw" priority />
      ) : null}
      <div className="cms-hero-overlay" />
      <div className="site-container cms-hero-content">
        {block.kicker ? <span className="hero-kicker"><i /> {block.kicker}</span> : null}
        <h1>{block.heading}</h1>
        {block.subheading ? <p>{block.subheading}</p> : null}
        {block.actions?.length ? (
          <div className="hero-actions">
            {block.actions.map((action) => (
              <a
                key={`${action.label}-${action.href}`}
                className={action.style === "secondary" ? "hero-secondary" : "hero-cta"}
                href={action.href}
              >
                {action.label} <ArrowRight aria-hidden="true" />
              </a>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}

function CardGrid({ block }: { block: Extract<Block, { blockType: "cardGrid" }> }) {
  return (
    <section className="cms-section">
      <div className="site-container">
        {block.kicker ? <span className="section-kicker">{block.kicker}</span> : null}
        {block.heading ? <h2>{block.heading}</h2> : null}
        {block.intro ? <p className="cms-lead">{block.intro}</p> : null}
        <div className="cms-card-grid">
          {block.cards?.map((cardItem) => {
            const src = mediaUrl(cardItem.image);
            const inner = (
              <>
                {src ? (
                  <Image src={src} alt={mediaAlt(cardItem.image)} width={640} height={400} />
                ) : null}
                <strong>{cardItem.title}</strong>
                {cardItem.description ? <p>{cardItem.description}</p> : null}
              </>
            );
            return cardItem.href ? (
              <a className="cms-card" href={cardItem.href} key={cardItem.title}>{inner}</a>
            ) : (
              <div className="cms-card" key={cardItem.title}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Gallery({ block }: { block: Extract<Block, { blockType: "gallery" }> }) {
  return (
    <section className="cms-section">
      <div className="site-container">
        {block.heading ? <h2>{block.heading}</h2> : null}
        <div className="cms-gallery">
          {block.images?.map((row, index) => {
            const src = mediaUrl(row.image);
            if (!src) return null;
            return (
              <figure key={`${src}-${index}`}>
                <Image src={src} alt={mediaAlt(row.image)} width={800} height={600} />
                {row.caption ? <figcaption>{row.caption}</figcaption> : null}
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

async function Reviews({
  block,
  placement,
}: {
  block: Extract<Block, { blockType: "reviewsBlock" }>;
  placement: string | null;
}) {
  const reviews = onPage(
    await getCollection("reviews", {
      where:
        block.source === "featured"
          ? { and: [{ approved: { equals: true } }, { featured: { equals: true } }] }
          : { approved: { equals: true } },
      limit: block.limit ?? 6,
    }),
    placement,
  );
  if (reviews.length === 0) return null;

  return (
    <section className="cms-section">
      <div className="site-container">
        {block.heading ? <h2>{block.heading}</h2> : null}
        <div className="cms-card-grid">
          {reviews.map((review) => (
            <blockquote className="cms-review" key={review.id}>
              <div className="cms-review-stars" aria-label={`${review.rating} out of 5`}>
                {Array.from({ length: review.rating }, (_, index) => (
                  <Star key={index} aria-hidden="true" />
                ))}
              </div>
              <p>{review.quote}</p>
              <footer>
                <strong>{review.name}</strong>
                {review.role ? <small>{review.role}</small> : null}
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}

async function Posts({
  block,
  placement,
}: {
  block: Extract<Block, { blockType: "postsBlock" }>;
  placement: string | null;
}) {
  const posts = onPage(
    await getCollection("posts", {
      where:
        block.type && block.type !== "any"
          ? { and: [{ status: { equals: "published" } }, { type: { equals: block.type } }] }
          : { status: { equals: "published" } },
      limit: block.limit ?? 3,
      sort: "-publishedAt",
    }),
    placement,
  );
  if (posts.length === 0) return null;

  return (
    <section className="cms-section">
      <div className="site-container">
        {block.heading ? <h2>{block.heading}</h2> : null}
        <div className="cms-card-grid">
          {posts.map((post) => {
            const src = mediaUrl(post.coverImage);
            return (
              <a className="cms-card" href={`/posts/${post.slug}`} key={post.id}>
                {src ? <Image src={src} alt={mediaAlt(post.coverImage)} width={640} height={400} /> : null}
                <strong>{post.title}</strong>
                {post.excerpt ? <p>{post.excerpt}</p> : null}
              </a>
            );
          })}
        </div>
      </div>
    </section>
  );
}

async function Offers({
  block,
  placement,
}: {
  block: Extract<Block, { blockType: "offersBlock" }>;
  placement: string | null;
}) {
  const offers = onPage(
    await getCollection("offers", {
      where: { status: { equals: "published" } },
      limit: block.limit ?? 3,
    }),
    placement,
  );
  if (offers.length === 0) return null;

  return (
    <section className="cms-section">
      <div className="site-container">
        {block.heading ? <h2>{block.heading}</h2> : null}
        <div className="cms-card-grid">
          {offers.map((offer) => {
            const src = mediaUrl(offer.image);
            return (
              <div className="cms-card" key={offer.id}>
                {src ? <Image src={src} alt={mediaAlt(offer.image)} width={640} height={400} /> : null}
                {offer.badge ? <span className="cms-badge">{offer.badge}</span> : null}
                <strong>{offer.title}</strong>
                <p>{offer.summary}</p>
                {offer.ctaHref ? (
                  <a className="text-link" href={offer.ctaHref}>
                    {offer.ctaLabel || "Enquire now"} <ArrowRight aria-hidden="true" />
                  </a>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

/**
 * `path` is the address the blocks are being drawn at. The blocks that list
 * content use it to leave out anything an editor has published to other pages.
 */
export function RenderBlocks({ layout, path }: { layout: Page["layout"]; path?: string }) {
  if (!layout?.length) return null;

  const placement = placementKeyFor(path);

  return (
    <>
      {layout.map((block, index) => {
        const key = `${block.blockType}-${index}`;
        switch (block.blockType) {
          case "hero":
            return <Hero block={block} key={key} />;
          case "richText":
            return (
              <section className="cms-section" key={key}>
                <div className="site-container cms-prose">
                  {block.heading ? <h2>{block.heading}</h2> : null}
                  <RichText data={block.content} />
                </div>
              </section>
            );
          case "cardGrid":
            return <CardGrid block={block} key={key} />;
          case "gallery":
            return <Gallery block={block} key={key} />;
          case "cta":
            return (
              <section className="cms-cta" key={key}>
                <div className="site-container">
                  <h2>{block.heading}</h2>
                  {block.body ? <p>{block.body}</p> : null}
                  <a className="primary-button" href={block.buttonHref}>
                    {block.buttonLabel} <ArrowRight aria-hidden="true" />
                  </a>
                </div>
              </section>
            );
          case "reviewsBlock":
            return <Reviews block={block} key={key} placement={placement} />;
          case "postsBlock":
            return <Posts block={block} key={key} placement={placement} />;
          case "offersBlock":
            return <Offers block={block} key={key} placement={placement} />;
          default:
            return null;
        }
      })}
    </>
  );
}
