import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ArrowUpRight } from "lucide-react";

import type { Homepage } from "@/payload-types";
import type { PageSection } from "@/lib/page-defaults";
import { getMediaSlot, type BusinessInfo } from "@/lib/content";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { slotPhoto } from "@/lib/page-media";
import {
  leadershipMessages as defaultLeadershipMessages,
  LEADERSHIP_HEADING,
  LEADERSHIP_HEADING_NE,
  LEADERSHIP_KICKER,
  LEADERSHIP_KICKER_NE,
} from "@/lib/leadership";
import { missionParagraphs, missionQuote } from "@/lib/mission";
import { LeadershipCarousel, type LeadershipMessage } from "./leadership-carousel";
import { MediaSystem } from "./media-system";
import { Written } from "./written";

/**
 * The three bands that open the front page.
 *
 * Their words are written in Site → Homepage & page copy, and the page they sit
 * on decides whether they appear at all and in what order (Content → Website pages →
 * Home). Most of what they show has a fallback here, so the site reads correctly
 * before anyone has opened the dashboard - but a line an editor has emptied
 * stays empty, and is taken off the page rather than put back.
 */

type Block<T extends PageSection["blockType"]> = Extract<PageSection, { blockType: T }>;

/**
 * What an optional line of the front page says. A field nobody has written in
 * reads as null and gets the site's own wording; a field an editor cleared
 * reads as "" and stays empty, so the line is left out.
 */
const said = (value: string | null | undefined, fallback: string): string =>
  value == null ? fallback : value.trim();

/**
 * A keyword list, in both languages. A row an editor has not written in Nepali
 * carries an empty second half, which `Written` reads as "keep the English".
 */
type Label = { en: string; ne: string };

const labels = (
  rows: { label: string; labelNe?: string | null }[] | null | undefined,
  fallback: readonly string[],
): Label[] =>
  rows && rows.length > 0
    ? rows.map((row) => ({ en: row.label, ne: row.labelNe ?? "" }))
    : fallback.map((label) => ({ en: label, ne: "" }));

export function HomeHero({
  block,
  business,
  home,
}: {
  block: Block<"homeHero">;
  business: BusinessInfo;
  home: Homepage | null;
}) {
  const heroImage = mediaUrl(home?.heroImage) ?? "/images/nepal-himalayas-dawn-4k.jpg";
  const heroAlt =
    typeof home?.heroImage === "object" && home?.heroImage?.alt
      ? home.heroImage.alt
      : "Sunrise behind snow-covered Himalayan peaks in Nepal";
  // The kicker has no wording of its own to fall back on: it is shown only
  // while something is written for it.
  const kicker = home?.heroKicker?.trim() ?? "";
  const body = said(
    home?.heroBody,
    "Honest information, meaningful entertainment, and socially responsible media - created in Nepal for people, organizations, and communities.",
  );
  const ctaLabel = said(home?.heroCtaLabel, "Explore our services");

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
          {kicker ? (
            <span className="hero-kicker">
              <i /> <Written ne={home?.heroKickerNe}>{kicker}</Written>
            </span>
          ) : null}
          <Written as="h1" ne={home?.heroHeadingNe}>
            {home?.heroHeading || "Media that stays close to what matters."}
          </Written>
          {body ? (
            <Written as="p" ne={home?.heroBodyNe}>
              {body}
            </Written>
          ) : null}
          <div className="hero-actions">
            {ctaLabel ? (
              <Link className="hero-cta" href={home?.heroCtaHref || "/services"}>
                <Written ne={home?.heroCtaLabelNe}>{ctaLabel}</Written>{" "}
                <ArrowRight aria-hidden="true" />
              </Link>
            ) : null}
            {block.secondaryLabel ? (
              <a className="hero-secondary" href={business.rightSanchar} target="_blank" rel="noreferrer">
                <Written ne={block.secondaryLabelNe}>{block.secondaryLabel}</Written>{" "}
                <ArrowUpRight aria-hidden="true" />
              </a>
            ) : null}
          </div>
        </div>
      </section>
      {block.showMediaSystem === false ? null : (
        <section className="stats-wrap" aria-label={`${business.shortName} media system`}>
          <MediaSystem business={business} />
        </section>
      )}
    </>
  );
}

/**
 * The introduction, and the photograph beside it.
 *
 * The photograph is uploaded to the "home-about" Page media entry in the
 * dashboard. Until one is, there is no panel at all and the introduction takes
 * the full width - a visitor is never shown an empty blue rectangle standing in
 * for a picture nobody has added yet.
 */
export async function HomeAbout({
  block,
  business,
  home,
}: {
  block: Block<"homeAbout">;
  business: BusinessInfo;
  home: Homepage | null;
}) {
  const capabilities = labels(home?.aboutCapabilities, [
    "Truthful news",
    "Visual production",
    "Skill development",
  ]);
  const photo = slotPhoto(await getMediaSlot("home-about"), `${business.shortName} at work`);
  // The first two paragraphs have fields of their own and the rest are an
  // array, so an editor can write a mission of any length. Nothing saved in the
  // dashboard yet means the whole statement comes from lib/mission.ts.
  // Each paragraph carries its own Nepali, so an editor can translate the
  // opening and leave the rest, or translate the whole statement, and either
  // reads correctly. A missing Nepali paragraph falls back to its own English.
  const written: Label[] = [
    { en: home?.aboutBody, ne: home?.aboutBodyNe },
    { en: home?.aboutBodySecondary, ne: home?.aboutBodySecondaryNe },
    ...(home?.aboutParagraphs ?? []).map((row) => ({ en: row.text, ne: row.textNe })),
  ]
    .filter((row) => Boolean(row.en?.trim()))
    .map((row) => ({ en: row.en as string, ne: row.ne ?? "" }));
  const paragraphs: Label[] =
    written.length > 0 ? written : missionParagraphs.map((text) => ({ en: text, ne: "" }));
  const eyebrow = said(home?.aboutEyebrow, "Who We Are");
  const heading = said(home?.aboutHeading, business.legalName);
  const quote = said(home?.aboutQuote, missionQuote);

  return (
    <section className="chairman-section" id="about">
      <div className="chairman-shape" aria-hidden="true" />
      <div className={`site-container chairman-grid${photo ? "" : " chairman-grid--copy-only"}`}>
        {photo ? (
          <div className="portrait-wrap">
            <div className="portrait-glow" aria-hidden="true" />
            <div className="media-visual">
              <Image src={photo.src} alt={photo.alt} fill sizes="(max-width: 900px) 100vw, 400px" />
            </div>
            <div className="portrait-caption">
              <Written as="strong" ne={block.captionTitleNe}>
                {block.captionTitle || "Your Media Partner"}
              </Written>
              <span>{business.address}</span>
            </div>
          </div>
        ) : null}
        <div className="chairman-copy">
          {eyebrow ? (
            <div className="eyebrow">
              <i /> <Written ne={home?.aboutEyebrowNe}>{eyebrow}</Written>
            </div>
          ) : null}
          {heading ? (
            <Written as="h2" ne={home?.aboutHeadingNe}>
              {heading}
            </Written>
          ) : null}
          {quote ? (
            <Written as="blockquote" ne={home?.aboutQuoteNe}>
              {quote}
            </Written>
          ) : null}
          {paragraphs.map((paragraph, index) => (
            <Written as="p" ne={paragraph.ne} key={index}>
              {paragraph.en}
            </Written>
          ))}
          <div className="about-capabilities" aria-label="Core capabilities">
            {capabilities.map((item) => (
              <Written ne={item.ne} key={item.en}>
                {item.en}
              </Written>
            ))}
          </div>
          {block.linkLabel && block.linkHref ? (
            <Link className="text-link" href={block.linkHref}>
              <Written ne={block.linkLabelNe}>{block.linkLabel}</Written>{" "}
              <ArrowRight aria-hidden="true" />
            </Link>
          ) : null}
        </div>
      </div>
    </section>
  );
}

/**
 * The chairman's and director's messages.
 *
 * The heading sits inside the carousel rather than above it, so it moves on
 * with the message it belongs to. Both are written in the dashboard, and the
 * band falls back to the messages below until they are - so the front page
 * reads correctly before anyone has opened it.
 */
export function Leadership({ home }: { home: Homepage | null }) {
  const written: LeadershipMessage[] = (home?.leadershipMessages ?? [])
    .filter((row) => row.message && row.name)
    .map((row) => ({
      role: row.role,
      name: row.name,
      heading: row.heading ?? "",
      message: row.message,
      // The Nepali half. Empty is meaningful: the carousel shows the English
      // rather than translating it, so a blank field is never guessed at.
      roleNe: row.roleNe ?? "",
      nameNe: row.nameNe ?? "",
      headingNe: row.headingNe ?? "",
      messageNe: row.messageNe ?? "",
      photoUrl: mediaUrl(row.photo),
      photoAlt: mediaAlt(row.photo, `${row.name}, ${row.role}`),
    }));

  const messages = written.length > 0 ? written : defaultLeadershipMessages;
  if (messages.length === 0) return null;

  return (
    <section className="content-section leadership-section" id="leadership">
      <div className="site-container">
        <LeadershipCarousel
          messages={messages}
          kicker={home?.leadershipKicker || LEADERSHIP_KICKER}
          heading={home?.leadershipHeading || LEADERSHIP_HEADING}
          kickerNe={home?.leadershipKickerNe || LEADERSHIP_KICKER_NE}
          headingNe={home?.leadershipHeadingNe || LEADERSHIP_HEADING_NE}
        />
      </div>
    </section>
  );
}
