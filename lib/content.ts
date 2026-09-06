import config from "@payload-config";
import { getPayload, type Where } from "payload";
import { cache } from "react";

import type {
  Announcement,
  Appearance,
  Footer,
  Homepage,
  Navigation,
  Faq,
  MediaSlot,
  Offer,
  Page,
  Post,
  Redirect,
  Review,
  Service,
  ServiceCategory,
  SiteSetting,
  SocialResponsibility,
  Team,
} from "@/payload-types";
import { mediaAlt, mediaUrl } from "@/lib/media";
import {
  business as fallbackBusiness,
  footerGroups as fallbackFooterGroups,
} from "@/app/(frontend)/_data/site";
import {
  defaultNavigation,
  navItemsFromPages,
  resolveNavItems,
  withSection,
  type NavItem,
} from "@/lib/site-map";

/**
 * Reads content from Payload, falling back to the checked-in copy in
 * app/(frontend)/_data/site.ts whenever the CMS is unavailable.
 *
 * The fallback is what makes this safe to deploy before a database exists:
 * the website renders exactly as it does today until the dashboard is
 * connected and someone saves a change.
 */

const isConfigured = Boolean(process.env.DATABASE_URI && process.env.PAYLOAD_SECRET);

/** Resolve the Payload instance once per request, or null if not set up yet. */
const client = cache(async () => {
  if (!isConfigured) return null;
  try {
    return await getPayload({ config });
  } catch (error) {
    console.error("[cms] could not connect, serving fallback content:", error);
    return null;
  }
});

async function readGlobal<T>(
  slug: "homepage" | "navigation" | "announcement" | "appearance" | "footer" | "site-settings",
) {
  const payload = await client();
  if (!payload) return null;
  try {
    return (await payload.findGlobal({ slug, depth: 2 })) as T;
  } catch (error) {
    console.error(`[cms] failed to read global "${slug}":`, error);
    return null;
  }
}

/** Drop empty strings so a blank CMS field falls through to the default. */
const or = <T,>(value: T | null | undefined, fallback: T): T => {
  if (value === null || value === undefined) return fallback;
  if (typeof value === "string" && value.trim() === "") return fallback;
  if (Array.isArray(value) && value.length === 0) return fallback;
  return value;
};

export type BusinessInfo = {
  legalName: string;
  shortName: string;
  initials: string;
  address: string;
  email: string;
  phones: string[];
  vat: string;
  website: string;
  websiteLabel: string;
  rightSanchar: string;
  rightSancharLabel: string;
  /** The logo uploaded in Site Settings, or null while none has been. */
  logoUrl: string | null;
  logoAlt: string;
};

export const getBusiness = cache(async (): Promise<BusinessInfo> => {
  const settings = await readGlobal<SiteSetting>("site-settings");
  const base: BusinessInfo = {
    ...fallbackBusiness,
    phones: [...fallbackBusiness.phones],
    logoUrl: null,
    logoAlt: fallbackBusiness.legalName,
  };
  if (!settings) return base;

  return {
    legalName: or(settings.legalName, base.legalName),
    shortName: or(settings.shortName, base.shortName),
    initials: or(settings.initials, base.initials),
    address: or(settings.address, base.address),
    email: or(settings.email, base.email),
    phones: or(
      settings.phones?.map((row) => row.number).filter(Boolean) as string[] | undefined,
      base.phones,
    ),
    vat: or(settings.vat, base.vat),
    website: or(settings.website, base.website),
    websiteLabel: or(settings.websiteLabel, base.websiteLabel),
    rightSanchar: or(settings.rightSanchar, base.rightSanchar),
    rightSancharLabel: or(settings.rightSancharLabel, base.rightSancharLabel),
    // A logo uploaded in the dashboard replaces the initials mark everywhere
    // it appears: the header, the media system wheel, and the footer.
    logoUrl: mediaUrl(settings.logo),
    logoAlt: mediaAlt(settings.logo, or(settings.legalName, base.legalName)),
  };
});

export type { NavItem };

export type NavConfig = {
  items: NavItem[];
  cta: { label: string; href: string; enabled: boolean };
  showUtilityBar: boolean;
};

export const getNavigation = cache(async (): Promise<NavConfig> => {
  const fallback: NavConfig = {
    items: defaultNavigation.map((item) => withSection({ label: item.label, href: item.href })),
    cta: { label: "Start a conversation", href: "/contact", enabled: true },
    showUtilityBar: true,
  };

  const nav = await readGlobal<Navigation>("navigation");
  if (!nav) return fallback;

  // Pages flagged "show in navigation" are appended automatically, so adding a
  // page to the menu does not also mean editing the Navigation global.
  const navPages = await getCollection("pages", {
    where: { and: [{ status: { equals: "published" } }, { showInNav: { equals: true } }] },
    limit: 20,
    depth: 0,
    sort: "title",
  });

  return {
    // resolveNavItems is shared with the dashboard's page panel, so the menu an
    // editor sees there is the menu a visitor gets.
    items: resolveNavItems(
      nav.items?.map((item) => ({ label: item.label, href: item.href, newTab: item.newTab ?? false })),
      navItemsFromPages(navPages),
    ),
    cta: {
      label: or(nav.cta?.label, fallback.cta.label),
      href: or(nav.cta?.href, fallback.cta.href),
      enabled: nav.cta?.enabled ?? true,
    },
    showUtilityBar: nav.showUtilityBar ?? true,
  };
});

/** Theme tokens, keyed by the CSS custom property they map to in globals.css. */
export const getTheme = cache(async (): Promise<Record<string, string>> => {
  const appearance = await readGlobal<Appearance>("appearance");
  if (!appearance) return {};

  const tokens: Record<string, string | null | undefined> = {
    "--primary": appearance.primary,
    "--primary-rich": appearance.primaryRich,
    "--secondary": appearance.secondary,
    "--signal": appearance.signal,
    "--surface": appearance.surface,
    "--surface-alt": appearance.surfaceAlt,
    "--ink": appearance.ink,
    "--muted": appearance.muted,
    "--line": appearance.line,
    "--warm": appearance.warm,
    "--radius": typeof appearance.radius === "number" ? `${appearance.radius}px` : null,
    "--font-heading":
      appearance.headingFont === "inter" ? "var(--font-inter)" : "var(--font-hanken)",
  };

  return Object.fromEntries(
    Object.entries(tokens).filter(([, value]) => typeof value === "string" && value.length > 0),
  ) as Record<string, string>;
});

export type FooterGroup = { title: string; links: { label: string; href: string }[] };

export type FooterConfig = { about: string | null; groups: FooterGroup[]; copyright: string | null };

export const getFooter = cache(async (): Promise<FooterConfig> => {
  const fallback: FooterConfig = {
    about: null,
    groups: fallbackFooterGroups.map((group) => ({
      title: group.title,
      links: group.links.map((link) => ({ label: link.label, href: link.href })),
    })),
    copyright: null,
  };

  const footer = await readGlobal<Footer>("footer");
  if (!footer) return fallback;

  const groups = footer.groups
    ?.filter((group) => group.title)
    .map((group) => ({
      title: group.title,
      links: (group.links ?? [])
        .filter((link) => link.label && link.href)
        .map((link) => ({ label: link.label, href: link.href })),
    }));

  return {
    about: footer.about ?? null,
    groups: or(groups, fallback.groups),
    copyright: footer.copyright ?? null,
  };
});

export const getHomepage = cache(async (): Promise<Homepage | null> => readGlobal<Homepage>("homepage"));

type CollectionMap = {
  posts: Post;
  pages: Page;
  offers: Offer;
  reviews: Review;
  services: Service;
  "service-categories": ServiceCategory;
  faqs: Faq;
  team: Team;
  "social-responsibility": SocialResponsibility;
  "media-slots": MediaSlot;
  redirects: Redirect;
};

/**
 * Reads published documents from a content collection. Returns an empty list
 * when the CMS is unreachable so a block simply renders nothing rather than
 * taking the page down.
 */
export async function getCollection<K extends keyof CollectionMap>(
  collection: K,
  options: { where?: Where; limit?: number; sort?: string; depth?: number } = {},
): Promise<CollectionMap[K][]> {
  const payload = await client();
  if (!payload) return [];
  try {
    const result = await payload.find({
      collection,
      where: options.where,
      limit: options.limit ?? 10,
      sort: options.sort ?? "-createdAt",
      depth: options.depth ?? 2,
    });
    return result.docs as CollectionMap[K][];
  } catch (error) {
    console.error(`[cms] failed to read "${collection}":`, error);
    return [];
  }
}

/** Look up a single published document by its slug. */
export async function getBySlug<K extends keyof CollectionMap>(
  collection: K,
  slug: string,
): Promise<CollectionMap[K] | null> {
  const docs = await getCollection(collection, {
    where: { and: [{ slug: { equals: slug } }, { status: { equals: "published" } }] },
    limit: 1,
  });
  return docs[0] ?? null;
}

/**
 * Matches content that is published *and* inside its scheduled window. A blank
 * publishAt means "already live"; a blank unpublishAt means "no end date".
 */
export function liveWhere(now = new Date()): Where {
  const stamp = now.toISOString();
  return {
    and: [
      { status: { equals: "published" } },
      { or: [{ publishAt: { exists: false } }, { publishAt: { less_than_equal: stamp } }] },
      { or: [{ unpublishAt: { exists: false } }, { unpublishAt: { greater_than: stamp } }] },
    ],
  };
}

/** Services in display order, with their category populated. */
export const getServices = cache(async (): Promise<Service[]> =>
  getCollection("services", {
    where: { status: { equals: "published" } },
    limit: 200,
    sort: "order",
  }),
);

export const getServiceCategories = cache(async (): Promise<ServiceCategory[]> =>
  getCollection("service-categories", { limit: 50, sort: "order", depth: 0 }),
);

export const getFaqs = cache(async (placement: Faq["placement"]): Promise<Faq[]> =>
  getCollection("faqs", { where: { placement: { equals: placement } }, limit: 50, sort: "order", depth: 0 }),
);

export const getTeam = cache(async (): Promise<Team[]> =>
  getCollection("team", { limit: 50, sort: "order" }),
);

/** The photo/video featured on a given page, keyed by page or service slug. */
/** Social responsibility films and photo albums, in the editor's order. */
export const getSocialResponsibility = cache(async (): Promise<SocialResponsibility[]> =>
  getCollection("social-responsibility", {
    where: { status: { equals: "published" } },
    limit: 50,
    sort: "order",
  }),
);

export const getMediaSlot = cache(async (key: string): Promise<MediaSlot | null> => {
  const rows = await getCollection("media-slots", { where: { key: { equals: key } }, limit: 1 });
  return rows[0] ?? null;
});

export const getAnnouncement = cache(async (): Promise<Announcement | null> => {
  const announcement = await readGlobal<Announcement>("announcement");
  if (!announcement?.enabled || !announcement.message) return null;
  // Respect the scheduling window before showing anything.
  const now = Date.now();
  if (announcement.startsAt && new Date(announcement.startsAt).getTime() > now) return null;
  if (announcement.endsAt && new Date(announcement.endsAt).getTime() < now) return null;
  return announcement;
});

export const getRedirects = cache(async (): Promise<Redirect[]> =>
  getCollection("redirects", { limit: 500, depth: 0 }),
);
