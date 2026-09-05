import { cache } from "react";

import {
  categories as fallbackCategories,
  servicePortfolio as fallbackServices,
  type ServiceCategory as FallbackCategoryId,
} from "@/app/(frontend)/_data/services";
import { getFaqs, getServiceCategories, getServices } from "@/lib/content";
import { mediaUrl } from "@/lib/media";

/**
 * One shape for a service, whether it came from the CMS or from the static
 * portfolio. The pages render this and never have to know which source won.
 */
export type ServiceView = {
  slug: string;
  title: string;
  shortTitle: string;
  description: string;
  metaDescription: string;
  intro: string;
  audience: string;
  preparation: string;
  deliverables: string[];
  steps: [string, string][];
  faq: [string, string][];
  imageUrl: string | null;
  category: CategoryView;
};

export type CategoryView = {
  id: string;
  label: string;
  title: string;
  description: string;
  href: string;
  icon: string;
};

const iconForFallback: Record<FallbackCategoryId, string> = {
  production: "clapperboard",
  "social-media": "megaphone",
  training: "graduationCap",
  research: "search",
};

const fallbackCategoryViews = (): CategoryView[] =>
  fallbackCategories.map((category) => ({
    id: category.id,
    label: category.label,
    title: category.title,
    description: category.description,
    href: category.href,
    icon: iconForFallback[category.id],
  }));

const fallbackServiceViews = (): ServiceView[] => {
  const byId = new Map(fallbackCategoryViews().map((category) => [category.id, category]));
  return fallbackServices.map((service) => ({
    slug: service.slug,
    title: service.title,
    shortTitle: service.shortTitle,
    description: service.description,
    metaDescription: service.metaDescription,
    intro: service.intro,
    audience: service.audience,
    preparation: service.preparation,
    deliverables: [...service.deliverables],
    steps: service.steps.map(([title, description]) => [title, description] as [string, string]),
    faq: service.faq.map(([question, answer]) => [question, answer] as [string, string]),
    imageUrl: null,
    category: byId.get(service.category)!,
  }));
};

export const getCategoryViews = cache(async (): Promise<CategoryView[]> => {
  const rows = await getServiceCategories();
  if (rows.length === 0) return fallbackCategoryViews();
  return rows.map((row) => ({
    id: row.slug || String(row.id),
    label: row.label,
    title: row.title,
    description: row.description ?? "",
    href: row.href || "/services",
    icon: row.icon ?? "clapperboard",
  }));
});

export const getServiceViews = cache(async (): Promise<ServiceView[]> => {
  const [rows, categoryViews] = await Promise.all([getServices(), getCategoryViews()]);
  if (rows.length === 0) return fallbackServiceViews();

  const byId = new Map(categoryViews.map((category) => [category.id, category]));
  const fallbackCategory = categoryViews[0];

  return rows.map((row) => {
    // With depth > 0 the relationship is populated; guard for the bare-id case.
    const category =
      typeof row.category === "object" && row.category
        ? byId.get(row.category.slug || String(row.category.id)) ?? fallbackCategory
        : fallbackCategory;

    return {
      slug: row.slug ?? String(row.id),
      title: row.title,
      shortTitle: row.shortTitle,
      description: row.description,
      metaDescription: row.metaDescription || row.description,
      intro: row.intro,
      audience: row.audience ?? "",
      preparation: row.preparation ?? "",
      deliverables: (row.deliverables ?? []).map((entry) => entry.item),
      steps: (row.steps ?? []).map((step) => [step.title, step.description] as [string, string]),
      faq: (row.faq ?? []).map((entry) => [entry.question, entry.answer] as [string, string]),
      imageUrl: mediaUrl(row.image),
      category,
    };
  });
});

export const getServiceView = cache(async (slug: string): Promise<ServiceView | null> => {
  const services = await getServiceViews();
  return services.find((service) => service.slug === slug) ?? null;
});

/**
 * Questions for a page. Anything entered in the dashboard replaces the copy
 * that ships with the page, so an editor can reword them without a deploy.
 */
export const getFaqPairs = cache(
  async (
    placement: "contact" | "services" | "training" | "production",
    fallback: [string, string][],
  ): Promise<[string, string][]> => {
    const rows = await getFaqs(placement);
    if (rows.length === 0) return fallback;
    return rows.map((row) => [row.question, row.answer] as [string, string]);
  },
);
