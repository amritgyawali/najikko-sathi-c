/**
 * Language switching for the public website.
 *
 * The site is authored in English. Nepali is served by translating the
 * rendered page against the phrase book in ./dictionary, which keeps a single
 * source of copy for both languages instead of a duplicated page tree.
 */

export const LANGUAGES = ["en", "ne"] as const;

export type Language = (typeof LANGUAGES)[number];

export const DEFAULT_LANGUAGE: Language = "en";

/** Read on the server so the first paint already carries the right lang. */
export const LANGUAGE_COOKIE = "najikko-language";

/** Mirrored in the browser so the choice survives a cleared cookie. */
export const LANGUAGE_STORAGE_KEY = "najikko-language";

/** A year: the choice is a preference, not a session. */
export const LANGUAGE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

export const LANGUAGE_LABELS: Record<Language, { short: string; full: string; aria: string }> = {
  en: { short: "EN", full: "English", aria: "Switch the website to English" },
  ne: { short: "ने", full: "नेपाली", aria: "वेबसाइट नेपालीमा हेर्नुहोस्" },
};

export function isLanguage(value: unknown): value is Language {
  return typeof value === "string" && (LANGUAGES as readonly string[]).includes(value);
}

export function normalizeLanguage(value: unknown): Language {
  return isLanguage(value) ? value : DEFAULT_LANGUAGE;
}
