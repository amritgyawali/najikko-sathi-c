/**
 * The organizations named in the "We worked with" band on the front page.
 *
 * They ship as names rather than artwork: no logo files were supplied, and a
 * logo is a trademark that belongs to its owner, so each one is drawn as its
 * name until someone uploads the real mark in Content → Website pages → Home →
 * Partner logos.
 *
 * Held here so the website, the seed and the migration that puts the band on an
 * existing front page all name the same four.
 */

export type PartnerContent = { name: string };

export const partners: PartnerContent[] = [
  { name: "CG Group" },
  { name: "KMC" },
  { name: "Swasthya Mantralaya" },
  { name: "Zoom Beauty Academy" },
];

export const PARTNER_HEADING = "We worked with";
