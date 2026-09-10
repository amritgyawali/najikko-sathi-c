import Image from "next/image";

import type { PageSection } from "@/lib/page-defaults";
import { mediaAlt, mediaUrl } from "@/lib/media";
import { PARTNER_HEADING, partners as defaultPartners } from "@/lib/partners";
import { Written } from "./written";

type Block = Extract<PageSection, { blockType: "partnerMarquee" }>;

type Partner = {
  name: string;
  /** The name in Nepali, for a partner whose name has been written twice. */
  nameNe?: string | null;
  logoUrl: string | null;
  logoAlt: string;
  href: string | null;
};

/**
 * The "We worked with" band: a row of client logos sliding across the page.
 *
 * The row is rendered twice and the track slid by exactly half its width, so
 * the second copy is under the pointer at the moment the first one runs out and
 * the loop has no seam. Only the first copy is read out; the second is a
 * duplicate and is hidden from screen readers.
 *
 * Motion is decoration, so the animation stops for anyone who has asked their
 * system for less of it, and pauses while a visitor points at the band - a
 * logo that will not hold still cannot be read.
 */
export function PartnerMarquee({ block }: { block: Block }) {
  const written: Partner[] = (block.partners ?? [])
    .filter((row) => row.name)
    .map((row) => ({
      name: row.name,
      nameNe: row.nameNe,
      logoUrl: mediaUrl(row.logo),
      logoAlt: mediaAlt(row.logo, row.name),
      href: row.href?.trim() || null,
    }));

  const partners: Partner[] =
    written.length > 0
      ? written
      : defaultPartners.map((partner) => ({
          name: partner.name,
          logoUrl: null,
          logoAlt: partner.name,
          href: null,
        }));

  if (partners.length === 0) return null;

  const heading = block.heading || PARTNER_HEADING;
  const tinted = block.tone !== "plain";

  return (
    <section
      className={`content-section partner-section${tinted ? " related-section" : ""}`}
      aria-labelledby="partner-marquee-heading"
    >
      <div className="site-container">
        <Written as="h2" className="partner-heading" id="partner-marquee-heading" ne={block.headingNe}>
          {heading}
        </Written>
      </div>
      <div className="partner-marquee">
        <div className="partner-track">
          {[0, 1].map((copy) => (
            <ul
              className="partner-row"
              key={copy}
              // The second row is the same logos again, so it is not announced.
              aria-hidden={copy === 1 ? true : undefined}
            >
              {partners.map((partner) => (
                <li key={`${copy}-${partner.name}`}>
                  <PartnerLogo partner={partner} />
                </li>
              ))}
            </ul>
          ))}
        </div>
      </div>
    </section>
  );
}

function PartnerLogo({ partner }: { partner: Partner }) {
  const mark = partner.logoUrl ? (
    <Image src={partner.logoUrl} alt={partner.logoAlt} width={220} height={90} />
  ) : (
    // No artwork uploaded yet: the name stands in for the logo.
    <Written className="partner-name" ne={partner.nameNe}>
      {partner.name}
    </Written>
  );

  return partner.href ? (
    <a className="partner-logo" href={partner.href} target="_blank" rel="noreferrer">
      {mark}
    </a>
  ) : (
    <span className="partner-logo">{mark}</span>
  );
}
