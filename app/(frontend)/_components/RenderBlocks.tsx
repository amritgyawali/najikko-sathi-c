import { RichText } from "@payloadcms/richtext-lexical/react";
import Image from "next/image";
import { ArrowRight, Star } from "lucide-react";

import type { Page } from "@/payload-types";
import { getCollection } from "@/lib/content";
import { mediaAlt, mediaUrl } from "@/lib/media";

type Block = NonNullable<Page["layout"]>[number];

function Hero({ block }: { block: Extract<Block, { blockType: "hero" }> }) {
  const src = mediaUrl(block.background);
  return (
    <section className="page-hero">
      {src ? (
        <Image className="page-hero-image" src={src} alt={mediaAlt(block.background)} fill sizes="100vw" priority />
      ) : null}
      <div className="page-hero-overlay" />
      <div className="site-container page-hero-content">
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
    <section className="page-section">
      <div className="site-container">
        {block.kicker ? <span className="section-kicker">{block.kicker}</span> : null}
        {block.heading ? <h2>{block.heading}</h2> : null}
        {block.intro ? <p className="page-lead">{block.intro}</p> : null}
        <div className="page-card-grid">
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
              <a className="page-card" href={cardItem.href} key={cardItem.title}>{inner}</a>
            ) : (
              <div className="page-card" key={cardItem.title}>{inner}</div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Gallery({ block }: { block: Extract<Block, { blockType: "gallery" }> }) {
  return (
    <section className="page-section">
      <div className="site-container">
        {block.heading ? <h2>{block.heading}</h2> : null}
        <div className="page-gallery">
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

async function Reviews({ block }: { block: Extract<Block, { blockType: "reviewsBlock" }> }) {
  const reviews = await getCollection("reviews", {
    where:
      block.source === "featured"
        ? { and: [{ approved: { equals: true } }, { featured: { equals: true } }] }
        : { approved: { equals: true } },
    limit: block.limit ?? 6,
  });
  if (reviews.length === 0) return null;

  return (
    <section className="page-section">
      <div className="site-container">
        {block.heading ? <h2>{block.heading}</h2> : null}
        <div className="page-card-grid">
          {reviews.map((review) => (
            <blockquote className="page-review" key={review.id}>
              <div className="page-review-stars" aria-label={`${review.rating} out of 5`}>
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

async function Posts({ block }: { block: Extract<Block, { blockType: "postsBlock" }> }) {
  const posts = await getCollection("posts", {
    where:
      block.type && block.type !== "any"
        ? { and: [{ status: { equals: "published" } }, { type: { equals: block.type } }] }
        : { status: { equals: "published" } },
    limit: block.limit ?? 3,
    sort: "-publishedAt",
  });
  if (posts.length === 0) return null;

  return (
    <section className="page-section">
      <div className="site-container">
        {block.heading ? <h2>{block.heading}</h2> : null}
        <div className="page-card-grid">
          {posts.map((post) => {
            const src = mediaUrl(post.coverImage);
            return (
              <a className="page-card" href={`/posts/${post.slug}`} key={post.id}>
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

async function Offers({ block }: { block: Extract<Block, { blockType: "offersBlock" }> }) {
  const offers = await getCollection("offers", {
    where: { status: { equals: "published" } },
    limit: block.limit ?? 3,
  });
  if (offers.length === 0) return null;

  return (
    <section className="page-section">
      <div className="site-container">
        {block.heading ? <h2>{block.heading}</h2> : null}
        <div className="page-card-grid">
          {offers.map((offer) => {
            const src = mediaUrl(offer.image);
            return (
              <div className="page-card" key={offer.id}>
                {src ? <Image src={src} alt={mediaAlt(offer.image)} width={640} height={400} /> : null}
                {offer.badge ? <span className="page-badge">{offer.badge}</span> : null}
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

export function RenderBlocks({ layout }: { layout: Page["layout"] }) {
  if (!layout?.length) return null;

  return (
    <>
      {layout.map((block, index) => {
        const key = `${block.blockType}-${index}`;
        switch (block.blockType) {
          case "hero":
            return <Hero block={block} key={key} />;
          case "richText":
            return (
              <section className="page-section" key={key}>
                <div className="site-container page-prose">
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
              <section className="page-cta" key={key}>
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
            return <Reviews block={block} key={key} />;
          case "postsBlock":
            return <Posts block={block} key={key} />;
          case "offersBlock":
            return <Offers block={block} key={key} />;
          default:
            return null;
        }
      })}
    </>
  );
}
