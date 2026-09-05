import type { MetadataRoute } from "next";
import { navigation } from "./_data/site";
import { servicePortfolio } from "./_data/services";
import { absoluteUrl } from "./_lib/seo";

export default function sitemap(): MetadataRoute.Sitemap {
  return [...navigation.map((item) => item.href), ...servicePortfolio.map((service) => `/services/${service.slug}`)].map((path) => ({ url: absoluteUrl(path) }));
}
