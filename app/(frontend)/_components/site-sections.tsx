import Image from "next/image";
import Link from "next/link";
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
  Newspaper,
  Scissors,
  Search,
  Video,
} from "lucide-react";

import type { Homepage } from "@/payload-types";
import { getMediaSlot, type BusinessInfo } from "@/lib/content";
import { slotPhoto } from "@/lib/page-media";
import type { ServiceView } from "@/lib/services";
import { rightSancharTopics } from "../_data/site";
import { Written } from "./written";

/**
 * Three bands that used to sit on the homepage and now open the page each one
 * is about: the service grid on /services, the production band on /production,
 * and the news portal band on /right-sanchar. They still read their copy from
 * Site → Homepage in the dashboard, so nothing an editor had written was lost
 * when they moved.
 */

const serviceIcons = [
  Camera, Film, Megaphone, Aperture, FileText, MessageSquareText, Megaphone, Video,
  Clapperboard, GraduationCap, Camera, Newspaper, Scissors, GraduationCap, Search,
  MessageSquareText,
] as const;

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

/** A keyword list in both languages; an unwritten Nepali half keeps the English. */
type Label = { en: string; ne: string };

const labels = (
  rows: { label: string; labelNe?: string | null }[] | null | undefined,
  fallback: readonly string[],
): Label[] =>
  rows && rows.length > 0
    ? rows.map((row) => ({ en: row.label, ne: row.labelNe ?? "" }))
    : fallback.map((label) => ({ en: label, ne: "" }));

export function ServicesGrid({ home, services }: { home: Homepage | null; services: ServiceView[] }) {
  // The service portfolio drives this grid by default, so each card links to a
  // real service page. Filling in Homepage → Services in the dashboard replaces
  // the grid with that custom list instead.
  const custom = home?.services?.filter((row) => row.name) ?? [];

  return (
    <section className="verticals-section" id="portfolio">
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
            <Written as="span" className="section-kicker" ne={home?.servicesKickerNe}>
              {home?.servicesKicker || "Our Services"}
            </Written>
            <Written as="h2" ne={home?.servicesHeadingNe}>
              {home?.servicesHeading || <>One Media House.<br />Many Ways to Communicate.</>}
            </Written>
            <Written as="p" ne={home?.servicesIntroNe}>
              {home?.servicesIntro ||
                "From verified information to cinematic storytelling, every service is built around clarity, truth, and impact."}
            </Written>
          </div>
          <Link className="outline-button" href="/production">Explore Production <ArrowUpRight aria-hidden="true" /></Link>
        </div>
        <div className="verticals-grid">
          {custom.length > 0
            ? custom.map((row) => {
                const Icon = iconByName[(row.icon ?? "newspaper") as keyof typeof iconByName] ?? Newspaper;
                return (
                  <Link className="vertical-card" href={row.href || "/services"} key={row.name}>
                    <Icon aria-hidden="true" />
                    <Written as="strong" ne={row.nameNe}>{row.name}</Written>
                    <ArrowRight className="card-arrow" aria-hidden="true" />
                  </Link>
                );
              })
            : services.map((service, index) => {
                const Icon = serviceIcons[index] ?? Camera;
                return (
                  <Link className="vertical-card" href={`/services/${service.slug}`} key={service.slug}>
                    <Icon aria-hidden="true" />
                    <strong>{service.shortTitle}</strong>
                    <ArrowRight className="card-arrow" aria-hidden="true" />
                  </Link>
                );
              })}
        </div>
      </div>
    </section>
  );
}

/**
 * The production band, and the photograph beside its words.
 *
 * The photograph is uploaded to the "production-band" Page media entry in the
 * dashboard. Until one is, the band is words alone: no panel, no badge and no
 * blue rectangle promising a picture later.
 */
export async function ProductionBand({ business, home }: { business: BusinessInfo; home: Homepage | null }) {
  const photo = slotPhoto(await getMediaSlot("production-band"), "Najikko Sathi on a production shoot");

  return (
    <section className="foundation-section" id="production-craft">
      <div className={`site-container foundation-grid${photo ? "" : " foundation-grid--copy-only"}`}>
        {photo ? (
          <div className="foundation-image-wrap">
            <div className="foundation-backplate" aria-hidden="true" />
            <div className="production-visual">
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 900px) 100vw, 520px" />
            </div>
            <div className="legacy-badge"><strong>4</strong><span>Complete Stages</span></div>
          </div>
        ) : null}
        <div className="foundation-copy">
          <Written as="span" className="foundation-chip" ne={home?.productionChipNe}>
            {home?.productionChip || "Production"}
          </Written>
          <Written as="h2" ne={home?.productionHeadingNe}>
            {home?.productionHeading || <>Stories Brought to Life<br /><em>With Cinematic Craft</em></>}
          </Written>
          <Written as="p" ne={home?.productionBodyNe}>
            {home?.productionBody ||
              "We turn ideas, lives, and real events into compelling visual experiences. Our team produces biography videos, documentaries, advertisements, and social or corporate films through research, scriptwriting, cinematography, and cinematic editing."}
          </Written>
          <a className="primary-button" href={`mailto:${business.email}?subject=Production%20Inquiry`}>
            <Written ne={home?.productionCtaLabelNe}>
              {home?.productionCtaLabel || "Start a Production"}
            </Written>{" "}
            <ArrowRight aria-hidden="true" />
          </a>
        </div>
      </div>
    </section>
  );
}

export function SancharBand({ business, home }: { business: BusinessInfo; home: Homepage | null }) {
  const topics = labels(home?.sancharTopics, rightSancharTopics);

  return (
    <section className="value-section" id="right-sanchar">
      <div className="site-container value-content">
        <div className="value-heading">
          <Written as="h2" ne={home?.sancharHeadingNe}>
            {home?.sancharHeading || "Right Information. Right Time. Right Perspective."}
          </Written>
          <Written as="p" ne={home?.sancharIntroNe}>
            {home?.sancharIntro ||
              "Right Sanchar delivers accurate, truthful, and unbiased information on issues that matter to the public."}
          </Written>
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
              {topics.map((topic) => (
                <Written ne={topic.ne} key={topic.en}>{topic.en}</Written>
              ))}
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
                <a href={`tel:+977${phone}`} key={phone}>{index > 0 ? " / " : ""}{phone}</a>
              ))}
            </small>
          </span>
          <span className="connection-item"><strong>VAT</strong><small>{business.vat}</small></span>
        </div>
      </div>
    </section>
  );
}
