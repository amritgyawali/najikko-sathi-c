import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, Camera, Film, Mic2 } from "lucide-react";

import type { Homepage } from "@/payload-types";
import { getBusiness, getHomepage, type BusinessInfo } from "@/lib/content";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { MediaShowcase } from "./_components/page-content";
import { LeadershipCarousel, type LeadershipMessage } from "./_components/leadership-carousel";
import { MediaSystem } from "./_components/media-system";
import { pageMetadata } from "./_lib/seo";

// Rendered per request so the page always reflects what is in the dashboard.
// A prerendered page cannot be regenerated reliably on demand here, and giving
// it a revalidate window makes Next loop on link prefetches, so this small
// site trades a cached render for content that is never stale.
export const dynamic = "force-dynamic";




export const metadata = pageMetadata(
  "Media House in Kathmandu, Nepal",
  "Najikko Sathi Media offers documentary and video production, social media management, media training, and research from Anamnagar, Kathmandu, Nepal.",
  "/",
);

const labels = (rows: { label: string }[] | null | undefined, fallback: readonly string[]): string[] =>
  rows && rows.length > 0 ? rows.map((row) => row.label) : [...fallback];

function Hero({ business, home }: { business: BusinessInfo; home: Homepage | null }) {
  const heroImage = mediaUrl(home?.heroImage) ?? "/images/nepal-himalayas-dawn-4k.jpg";
  const heroAlt =
    typeof home?.heroImage === "object" && home?.heroImage?.alt
      ? home.heroImage.alt
      : "Sunrise behind snow-covered Himalayan peaks in Nepal";

  return (
    <>
      <section className="hero" id="home">
        <Image
          className="hero-image"
          src={heroImage}
          alt={heroAlt}
          fill
          sizes="100vw"
          quality={88}
          priority
        />
        <div className="hero-overlay" />
        <div className="site-container hero-content">
          <span className="hero-kicker">
            <i /> {home?.heroKicker || "Kathmandu-based media house"}
          </span>
          <h1>{home?.heroHeading || "Media that stays close to what matters."}</h1>
          <p>
            {home?.heroBody ||
              "Honest information, meaningful entertainment, and socially responsible media - created in Nepal for people, organizations, and communities."}
          </p>
          <div className="hero-actions">
            <Link className="hero-cta" href={home?.heroCtaHref || "/services"}>
              {home?.heroCtaLabel || "Explore our services"} <ArrowRight aria-hidden="true" />
            </Link>
            <a className="hero-secondary" href={business.rightSanchar} target="_blank" rel="noreferrer">
              Visit Right Sanchar <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
      <section className="stats-wrap" aria-label={`${business.shortName} media system`}>
        <div className="stats-card">
          <MediaSystem business={business} />
        </div>
      </section>
    </>
  );
}

function About({ business, home }: { business: BusinessInfo; home: Homepage | null }) {
  const capabilities = labels(home?.aboutCapabilities, [
    "Truthful news",
    "Visual production",
    "Skill development",
  ]);

  return (
    <section className="chairman-section" id="about">
      <div className="chairman-shape" aria-hidden="true" />
      <div className="site-container chairman-grid">
        <div className="portrait-wrap">
          <div className="portrait-glow" aria-hidden="true" />
          <div className="media-visual" aria-hidden="true">
            <Camera className="media-visual-main" />
            <Mic2 className="media-visual-mic" />
            <Film className="media-visual-film" />
            <span>Information</span>
            <span>Entertainment</span>
            <span>Responsibility</span>
          </div>
          <div className="portrait-caption">
            <strong>Your Media Partner</strong>
            <span>{business.address}</span>
          </div>
        </div>
        <div className="chairman-copy">
          <div className="eyebrow"><i /> {home?.aboutEyebrow || "Who We Are"}</div>
          <h2>{home?.aboutHeading || business.legalName}</h2>
          <blockquote>
            {home?.aboutQuote ||
              "Information, entertainment, and social responsibility - advanced together through honest communication and purposeful media."}
          </blockquote>
          <p>
            {home?.aboutBody ||
              "We are a dynamic, multi-dimensional media house delivering truthful news through Right Sanchar, high-quality documentary and video production, impactful advertising, and training focused on media and skill development."}
          </p>
          <p>
            {home?.aboutBodySecondary ||
              "Beyond our core media services, we support social initiatives that help transform communities. True to our name, we aim to walk beside people and organizations as a trusted, close companion in communication."}
          </p>
          <div className="about-capabilities" aria-label="Core capabilities">
            {capabilities.map((item) => <span key={item}>{item}</span>)}
          </div>
          <Link className="text-link" href="/services">Explore Our Services <ArrowRight aria-hidden="true" /></Link>
        </div>
      </div>
    </section>
  );
}

/**
 * The chairman's and director's messages. Both are written in the dashboard,
 * so the section only appears once there is something to show.
 */
function Leadership({ home }: { home: Homepage | null }) {
  const messages: LeadershipMessage[] = (home?.leadershipMessages ?? [])
    .filter((row) => row.message && row.name)
    .map((row) => ({
      role: row.role,
      name: row.name,
      heading: row.heading ?? "",
      message: row.message,
      photoUrl: mediaUrl(row.photo),
      photoAlt: mediaAlt(row.photo, `${row.name}, ${row.role}`),
    }));

  if (messages.length === 0) return null;

  return (
    <section className="content-section leadership-section" id="leadership">
      <div className="site-container">
        <div className="section-heading">
          <span className="eyebrow"><i />{home?.leadershipKicker || "From our leadership"}</span>
          <h2>{home?.leadershipHeading || "Messages from the people who guide our work."}</h2>
        </div>
        <LeadershipCarousel messages={messages} />
      </div>
    </section>
  );
}

export default async function Home() {
  const [business, home] = await Promise.all([getBusiness(), getHomepage()]);

  return (
    <>
      <Hero business={business} home={home} />
      <About business={business} home={home} />
      <Leadership home={home} />
      <MediaShowcase mediaKey="home" title={business.shortName} />
    </>
  );
}
