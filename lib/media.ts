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

/**
 * The kind of file an upload is - "image/png", "image/svg+xml" and so on.
 *
 * Wanted by the browser tab icon, which is told what it is being handed rather
 * than being left to guess from a Cloudinary address that carries no
 * extension.
 */
export const mediaMimeType = (value: number | Media | null | undefined): string | null => {
  if (!value || typeof value === "number") return null;
  return value.mimeType ?? null;
};
