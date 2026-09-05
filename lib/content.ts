import config from "@payload-config";
import { getPayload, type Where } from "payload";
import { cache } from "react";

import type {
  Appearance,
  Footer,
  Homepage,
  Navigation,
  Offer,
  Page,
  Post,
  Review,
  SiteSetting,
} from "@/payload-types";
import {
  business as fallbackBusiness,
  footerGroups as fallbackFooterGroups,
  navigation as fallbackNavigation,
} from "@/app/(frontend)/_data/site";

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

async function readGlobal<T>(slug: "homepage" | "navigation" | "appearance" | "footer" | "site-settings") {
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
};

export const getBusiness = cache(async (): Promise<BusinessInfo> => {
  const settings = await readGlobal<SiteSetting>("site-settings");
  const base: BusinessInfo = { ...fallbackBusiness, phones: [...fallbackBusiness.phones] };
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
  };
});

export type NavItem = { label: string; href: string; newTab?: boolean };

export type NavConfig = {
  items: NavItem[];
  cta: { label: string; href: string; enabled: boolean };
  showUtilityBar: boolean;
};

export const getNavigation = cache(async (): Promise<NavConfig> => {
  const fallback: NavConfig = {
    items: fallbackNavigation.map((item) => ({ label: item.label, href: item.href })),
    cta: { label: "Start a conversation", href: "#contact", enabled: true },
    showUtilityBar: true,
  };

  const nav = await readGlobal<Navigation>("navigation");
  if (!nav) return fallback;

  const items = nav.items
    ?.filter((item) => item.label && item.href)
    .map((item) => ({ label: item.label, href: item.href, newTab: item.newTab ?? false }));

  // Pages flagged "show in navigation" are appended automatically, so adding a
  // page to the menu does not also mean editing the Navigation global.
  const navPages = await getCollection("pages", {
    where: { and: [{ status: { equals: "published" } }, { showInNav: { equals: true } }] },
    limit: 20,
    depth: 0,
    sort: "title",
  });
  const pageItems: NavItem[] = navPages
    .filter((page) => page.slug)
    .map((page) => ({ label: page.title, href: `/${page.slug}` }));

  const merged = [...or(items, fallback.items), ...pageItems].filter(
    // A page already linked by hand should not appear twice.
    (item, index, all) => all.findIndex((other) => other.href === item.href) === index,
  );

  return {
    items: merged,
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
