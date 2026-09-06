/**
 * Where each piece of content ends up on the public website.
 *
 * The dashboard uses this to show, on every document and every global, the
 * address a visitor would use to see it - so saving a post no longer leaves
 * you hunting for the page it created.
 *
 * Kept free of React and of Payload imports so both the client component in
 * the admin panel and any server code can use it.
 */

import { placementLabel, placementPath } from "../lib/placements";

/**
 * The pages an editor has chosen in "Where this appears": the address of the
 * first one, and the rest of them named in a sentence. Null while nothing has
 * been chosen, so each collection falls back to describing where its content
 * usually goes.
 */
function placed(data: Record<string, unknown>): { path: string; named: string } | null {
  const chosen = Array.isArray(data.placements)
    ? data.placements.filter((key): key is string => typeof key === "string" && key in placementPath)
    : [];
  if (chosen.length === 0) return null;

  const names = chosen.map((key) => placementLabel[key]);
  const list =
    names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
  return { path: placementPath[chosen[0]], named: `the ${list} ${names.length === 1 ? "page" : "pages"}` };
}

export type LiveTarget = {
  /** The public path, or null when this content has no page of its own. */
  path: string | null;
  /** Plain sentence explaining where the content shows up. */
  where: string;
};

/** Page media slots are keyed by page name first, and by service slug otherwise. */
const pageForMediaSlot: Record<string, string> = {
  home: "/",
  // The decorative panels, which hold one photograph rather than a band.
  "home-about": "/",
  "production-band": "/production",
  about: "/about",
  services: "/services",
  "our-work": "/our-work",
  production: "/production",
  "social-media-handling": "/social-media-handling",
  training: "/training",
  research: "/research",
  it: "/it",
  advertisement: "/advertisement",
  "right-sanchar": "/right-sanchar",
  contact: "/contact",
};

const globalTargets: Record<string, LiveTarget> = {
  homepage: { path: "/", where: "The front page." },
  navigation: { path: "/", where: "The menu at the top of every page." },
  footer: { path: "/", where: "The footer at the bottom of every page." },
  announcement: { path: "/", where: "The notice bar above the header, on every page." },
  appearance: { path: "/", where: "Colours and type on every page." },
  "site-settings": { path: "/", where: "Company details, the logo and contact information, on every page." },
};

const text = (value: unknown): string => (typeof value === "string" ? value.trim() : "");

/**
 * Resolves the public address for the document currently open in the
 * dashboard. `data` is whatever the edit form holds, so this has to cope with
 * fields that are still empty.
 */
export function liveTargetFor({
  collectionSlug,
  globalSlug,
  data,
}: {
  collectionSlug?: string;
  globalSlug?: string;
  data: Record<string, unknown>;
}): LiveTarget {
  if (globalSlug) {
    return globalTargets[globalSlug] ?? { path: "/", where: "Applies across the website." };
  }

  const slug = text(data.slug);
  const chosen = placed(data);

  switch (collectionSlug) {
    case "posts":
      return {
        path: slug ? `/posts/${slug}` : null,
        where: chosen
          ? `Its own page, and ${chosen.named}.`
          : "Its own page, and the writing index at /posts.",
      };
    case "pages":
      return { path: slug ? `/${slug}` : null, where: "Its own page." };
    case "services":
      return { path: slug ? `/services/${slug}` : null, where: "Its own service page, and the services index." };
    case "offers":
      return chosen
        ? { path: chosen.path, where: `Listed on ${chosen.named}.` }
        : { path: "/offers", where: "The offers page, alongside the other live offers." };
    case "social-responsibility":
      return chosen
        ? { path: chosen.path, where: `The social responsibility band on ${chosen.named}.` }
        : {
            path: "/our-work#social-responsibility",
            where: "The social responsibility section of Our Work.",
          };
    case "team":
      return chosen
        ? { path: chosen.path, where: `The team band on ${chosen.named}.` }
        : { path: "/about", where: "The team section of the about page." };
    case "faqs":
      return chosen
        ? { path: chosen.path, where: `The questions band on ${chosen.named}.` }
        : { path: null, where: "Every page that carries a questions band, until you choose one." };
    case "media-slots": {
      const key = text(data.key);
      return {
        path: key ? pageForMediaSlot[key] ?? `/services/${key}` : null,
        where: "The photograph or film on the page this key names.",
      };
    }
    case "media": {
      const url = text(data.url);
      return chosen
        ? { path: chosen.path, where: `The photo and film band on ${chosen.named}.` }
        : { path: url || null, where: "The file itself. It appears wherever it has been used." };
    }
    case "redirects": {
      const from = text(data.from);
      return { path: from.startsWith("/") ? from : null, where: "Visiting the old address sends people to the new one." };
    }
    case "reviews":
      return chosen
        ? { path: chosen.path, where: `Review bands on ${chosen.named}. Approve it to make it public.` }
        : {
            path: null,
            where: "Review blocks on the pages you build. Approve it first to make it public.",
          };
    case "enquiries":
      return { path: null, where: "Private. Messages sent from the contact form are never published." };
    case "service-categories":
      return { path: "/services", where: "A grouping heading on the services page." };
    case "users":
      return { path: null, where: "Private. Dashboard accounts are never published." };
    default:
      return { path: null, where: "" };
  }
}
