import Image from "next/image";
import {
  Aperture,
  ArrowRight,
  ArrowUpRight,
  Camera,
  Clapperboard,
  FileText,
  Film,
  GraduationCap,
  Megaphone,
  MessageSquareText,
  Mic2,
  Newspaper,
  Scissors,
  Search,
  Video,
} from "lucide-react";

import type { Homepage } from "@/payload-types";
import { getBusiness, getHomepage, homepageFallback, type BusinessInfo } from "@/lib/content";
import { mediaUrl } from "@/lib/media";
import { SiteFooter, SiteHeader } from "./_components/SiteChrome";

const iconByName = {
  newspaper: Newspaper,
  fileText: FileText,
  messageSquare: MessageSquareText,
  search: Search,
  camera: Camera,
  film: Film,
  megaphone: Megaphone,
  video: Video,
  aperture: Aperture,
  clapperboard: Clapperboard,
  scissors: Scissors,
  graduationCap: GraduationCap,
} as const;

/** Icon order used when the service list still comes from the static fallback. */
const defaultServiceIcons = [
  Newspaper, FileText, MessageSquareText, Search, Camera, Film,
  Megaphone, Video, Aperture, Clapperboard, Scissors, GraduationCap,
] as const;

type Service = { name: string; Icon: (typeof defaultServiceIcons)[number]; href: string };

function resolveServices(home: Homepage | null): Service[] {
  const fromCms = home?.services?.filter((row) => row.name);
  if (fromCms && fromCms.length > 0) {
    return fromCms.map((row) => ({
      name: row.name,
      Icon: iconByName[(row.icon ?? "newspaper") as keyof typeof iconByName] ?? Newspaper,
      href: row.href || "#production",
    }));
  }
  return homepageFallback.services.map((name, index) => ({
    name,
    Icon: defaultServiceIcons[index] ?? Newspaper,
    href: index < 4 ? "#right-sanchar" : "#production",
  }));
}

const labels = (rows: { label: string }[] | null | undefined, fallback: readonly string[]): string[] =>
  rows && rows.length > 0 ? rows.map((row) => row.label) : [...fallback];

function Hero({ business, home }: { business: BusinessInfo; home: Homepage | null }) {
  const heroImage = mediaUrl(home?.heroImage) ?? "/images/nepal-himalayas-dawn-4k.jpg";
  const heroAlt =
    typeof home?.heroImage === "object" && home?.heroImage?.alt
      ? home.heroImage.alt
      : "Sunrise behind snow-covered Himalayan peaks in Nepal";
  const pillars = labels(home?.brandPillars, homepageFallback.brandPillars);

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
            <a className="hero-cta" href={home?.heroCtaHref || "#services"}>
              {home?.heroCtaLabel || "Explore our services"} <ArrowRight aria-hidden="true" />
            </a>
            <a className="hero-secondary" href={business.rightSanchar} target="_blank" rel="noreferrer">
              Visit Right Sanchar <ArrowUpRight aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>
      <section className="stats-wrap" aria-label={`${business.shortName} media commitments`}>
        <div className="stats-card">
          <div className="brand-overview">
            <div className="overview-center">
              <small>Our media system</small>
              <strong>{business.initials}</strong>
              <span>Six disciplines.<br />One close companion.</span>
            </div>
            {pillars.map((pillar) => <span className="overview-pillar" key={pillar}>{pillar}</span>)}
          </div>
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
          <a className="text-link" href="#services">Explore Our Services <ArrowRight aria-hidden="true" /></a>
        </div>
      </div>
    </section>
  );
}

function Services({ home }: { home: Homepage | null }) {
  const services = resolveServices(home);

  return (
    <section className="verticals-section" id="services">
      <Image
        className="verticals-texture"
        src="/images/verticals-texture.jpg"
        alt=""
        fill
        sizes="100vw"
      />
      <div className="site-container verticals-content">
        <div className="verticals-intro">
          <div>
            <span className="section-kicker">{home?.servicesKicker || "Our Services"}</span>
            {home?.servicesHeading ? (
              <h2>{home.servicesHeading}</h2>
            ) : (
              <h2>One Media House.<br />Many Ways to Communicate.</h2>
            )}
            <p>
              {home?.servicesIntro ||
                "From verified information to cinematic storytelling, every service is built around clarity, truth, and impact."}
            </p>
          </div>
          <a className="outline-button" href="#production">Explore Production <ArrowUpRight aria-hidden="true" /></a>
        </div>
        <div className="verticals-grid">
          {services.map(({ name, Icon, href }) => (
            <a className="vertical-card" href={href} key={name}>
              <Icon aria-hidden="true" />
              <strong>{name}</strong>
              <ArrowRight className="card-arrow" aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}

function Production({ business, home }: { business: BusinessInfo; home: Homepage | null }) {
  return (
    <section className="foundation-section" id="production">
      <div className="site-container foundation-grid">
        <div className="foundation-image-wrap">
          <div className="foundation-backplate" aria-hidden="true" />
          <div className="production-visual" aria-label="Production process: research, script, shoot, and edit">
            <Clapperboard className="production-camera" aria-hidden="true" />
            <div className="production-steps">
              <span><Search aria-hidden="true" /> Research</span>
              <span><FileText aria-hidden="true" /> Script</span>
              <span><Camera aria-hidden="true" /> Shoot</span>
              <span><Scissors aria-hidden="true" /> Edit</span>
            </div>
          </div>
          <div className="legacy-badge"><strong>4</strong><span>Complete Stages</span></div>
        </div>
        <div className="foundation-copy">
          <span className="foundation-chip">{home?.productionChip || "Production"}</span>
          {home?.productionHeading ? (
            <h2>{home.productionHeading}</h2>
          ) : (
            <h2>Stories Brought to Life<br /><em>With Cinematic Craft</em></h2>
          )}
          <p>
            {home?.productionBody ||
              "We turn ideas, lives, and real events into compelling visual experiences. Our team produces biography videos, documentaries, advertisements, and social or corporate films through research, scriptwriting, cinematography, and cinematic editing."}
          </p>
          <a className="primary-button" href={`mailto:${business.email}?subject=Production%20Inquiry`}>
            {home?.productionCtaLabel || "Start a Production"} <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

function RightSanchar({ business, home }: { business: BusinessInfo; home: Homepage | null }) {
  const topics = labels(home?.sancharTopics, homepageFallback.sancharTopics);

  return (
    <section className="value-section" id="right-sanchar">
      <div className="site-container value-content">
        <div className="value-heading">
          <h2>{home?.sancharHeading || "Right Information. Right Time. Right Perspective."}</h2>
          <p>
            {home?.sancharIntro ||
              "Right Sanchar delivers accurate, truthful, and unbiased information on issues that matter to the public."}
          </p>
        </div>
        <a className="logo-cloud-card" href={business.rightSanchar} target="_blank" rel="noreferrer" aria-label="Visit Right Sanchar">
          <div className="right-sanchar-card">
            <div className="right-sanchar-identity">
              <span className="portal-icon"><Newspaper aria-hidden="true" /></span>
              <span className="portal-label">Our digital news portal</span>
              <strong>RIGHT<br />SANCHAR</strong>
              <small>{business.rightSancharLabel}</small>
              <span className="portal-action">Visit the portal <ArrowUpRight aria-hidden="true" /></span>
            </div>
            <div className="topic-cloud">
              {topics.map((topic) => <span key={topic}>{topic}</span>)}
            </div>
          </div>
        </a>
        <div className="partners-title"><i /><span>Connect With Us</span><i /></div>
        <div className="partners" aria-label={`${business.shortName} contact links`}>
          <a className="connection-item" href={business.website} target="_blank" rel="noreferrer">
            <strong>{business.shortName}</strong><small>{business.websiteLabel}</small>
          </a>
          <a className="connection-item" href={business.rightSanchar} target="_blank" rel="noreferrer">
            <strong>Right Sanchar</strong><small>{business.rightSancharLabel}</small>
          </a>
          <a className="connection-item" href={`mailto:${business.email}`}>
            <strong>Email Us</strong><small>{business.email}</small>
          </a>
          <span className="connection-item">
            <strong>Call Us</strong>
            <small className="connection-phone-links">
              {business.phones.map((phone, index) => (
                <a href={`tel:${phone}`} key={phone}>{index > 0 ? " / " : ""}{phone}</a>
              ))}
            </small>
          </span>
          <span className="connection-item"><strong>VAT</strong><small>{business.vat}</small></span>
        </div>
      </div>
    </section>
  );
}

export default async function Home() {
  const [business, home] = await Promise.all([getBusiness(), getHomepage()]);

  return (
    <>
      <SiteHeader />
      <main>
        <Hero business={business} home={home} />
        <About business={business} home={home} />
        <Services home={home} />
        <Production business={business} home={home} />
        <RightSanchar business={business} home={home} />
      </main>
      <SiteFooter />
    </>
  );
}
