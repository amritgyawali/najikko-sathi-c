import type { Media } from "@/payload-types";

/**
 * Uploads arrive either as a populated Media document or as a bare ID,
 * depending on the query depth. Only the populated form carries a URL.
 */
export const mediaUrl = (value: number | Media | null | undefined): string | null => {
  if (!value || typeof value === "number") return null;
  return value.url ?? null;
};

export const mediaAlt = (value: number | Media | null | undefined, fallback = ""): string => {
  if (!value || typeof value === "number") return fallback;
  return value.alt || fallback;
};
