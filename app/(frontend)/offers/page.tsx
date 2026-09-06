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
  "Current Offers & Packages",
  "See the current offers and packages from Najikko Sathi Media in Kathmandu, Nepal, covering video production, social media handling, training, and research work.",
  "/offers",
);

const formatDate = (value?: string | null) =>
  value ? new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" }) : null;

export default async function OffersPage() {
  const offers = await getCollection("offers", { where: liveWhere(), limit: 40, sort: "-createdAt" });

  return <>
    <PageHero eyebrow="Offers" title="Current offers and packages." description="Time-limited packages and promotions from our team." path="/offers" label="Offers">
      <Link className="hero-cta" href="/contact">Ask about an offer <ArrowRight aria-hidden="true" /></Link>
    </PageHero>
    <section className="content-section">
      <div className="site-container">
        <SectionHeading kicker="Available now" title="What is running" />
        {offers.length === 0 ? (
          <p className="page-lead">There are no offers running at the moment. Please check back later.</p>
        ) : (
          <div className="cms-card-grid">
            {offers.map((offer) => {
              const image = mediaUrl(offer.image);
              const ends = formatDate(offer.endsAt);
              return (
                <div className="cms-card" key={offer.id}>
                  {image ? <Image src={image} alt={mediaAlt(offer.image, offer.title)} width={640} height={400} /> : null}
                  {offer.badge ? <span className="cms-badge">{offer.badge}</span> : null}
                  <strong>{offer.title}</strong>
                  <p>{offer.summary}</p>
                  {ends ? <p className="cms-meta">Available until {ends}</p> : null}
                  {offer.ctaHref ? (
                    <Link className="text-link" href={offer.ctaHref}>
                      {offer.ctaLabel || "Enquire now"} <ArrowRight aria-hidden="true" />
                    </Link>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
    <ContactCta title="Want something tailored instead?" />
  </>;
}
