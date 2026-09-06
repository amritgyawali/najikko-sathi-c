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

const labels = (rows: { label: string }[] | null | undefined, fallback: readonly string[]): string[] =>
  rows && rows.length > 0 ? rows.map((row) => row.label) : [...fallback];

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
          <Link className="outline-button" href="/production">Explore Production <ArrowUpRight aria-hidden="true" /></Link>
        </div>
        <div className="verticals-grid">
          {custom.length > 0
            ? custom.map((row) => {
                const Icon = iconByName[(row.icon ?? "newspaper") as keyof typeof iconByName] ?? Newspaper;
                return (
                  <Link className="vertical-card" href={row.href || "/services"} key={row.name}>
                    <Icon aria-hidden="true" />
                    <strong>{row.name}</strong>
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
 * The production band. Its panel is drawn from icons until someone uploads a
 * photograph to the "production-band" Page media entry in the dashboard.
 */
export async function ProductionBand({ business, home }: { business: BusinessInfo; home: Homepage | null }) {
  const photo = slotPhoto(await getMediaSlot("production-band"), "Najikko Sathi on a production shoot");

  return (
    <section className="foundation-section" id="production-craft">
      <div className="site-container foundation-grid">
        <div className="foundation-image-wrap">
          <div className="foundation-backplate" aria-hidden="true" />
          {photo ? (
            <div className="production-visual production-visual--photo">
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 900px) 100vw, 520px" />
            </div>
          ) : (
            <div className="production-visual" aria-label="Production process: research, script, shoot, and edit">
              <Clapperboard className="production-camera" aria-hidden="true" />
              <div className="production-steps">
                <span><Search aria-hidden="true" /> Research</span>
                <span><FileText aria-hidden="true" /> Script</span>
                <span><Camera aria-hidden="true" /> Shoot</span>
                <span><Scissors aria-hidden="true" /> Edit</span>
              </div>
            </div>
          )}
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

export function SancharBand({ business, home }: { business: BusinessInfo; home: Homepage | null }) {
  const topics = labels(home?.sancharTopics, rightSancharTopics);

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
