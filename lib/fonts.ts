/**
 * The Nepali face.
 *
 * Reading the site in Nepali swaps every Latin face for a Devanagari one
 * (globals.css). That face is Akriti, fetched from the internet rather than
 * bundled, so the stylesheet address and the family name both live here - and
 * both can be overridden in Site → Appearance without a deploy.
 *
 * Two things are worth knowing before changing either value:
 *
 * 1. Akriti is a Nepali display face, and the widely circulated cuts of it are
 *    legacy ones: they draw Devanagari on to Latin code points rather than on
 *    to the Devanagari block. A legacy cut therefore carries no glyph for the
 *    Unicode Nepali this site is written in.
 * 2. That is why `NEPALI_FONT_STACK` keeps Noto Sans Devanagari behind Akriti.
 *    Akriti is used for every character it actually carries; anything it does
 *    not is drawn by Noto instead of coming out as empty boxes. Swapping in a
 *    Unicode cut of Akriti later needs no code change - only the address below,
 *    or the field in Appearance.
 */

/** The family the stylesheet below defines. */
export const NEPALI_FONT_FAMILY = "Akriti";

/** Where that family is fetched from. */
export const NEPALI_FONT_URL = "https://fonts.cdnfonts.com/css/akriti";

/**
 * The Devanagari stack, with the requested face first.
 *
 * `--font-devanagari-fallback` is Noto Sans Devanagari, bundled by next/font in
 * the root layout, so the fallback needs no second network request.
 */
export const NEPALI_FONT_STACK =
  'var(--font-nepali), var(--font-devanagari-fallback), "Noto Sans Devanagari", sans-serif';

/**
 * A stylesheet address safe to put in a `<link>`.
 *
 * Appearance is admin-only, but an address typed into a form still ends up in
 * the document's head, so anything that is not plain https is dropped rather
 * than rendered.
 */
export function safeFontUrl(value: string | null | undefined): string | null {
  const url = typeof value === "string" ? value.trim() : "";
  if (!url) return null;
  try {
    return new URL(url).protocol === "https:" ? url : null;
  } catch {
    return null;
  }
}

/**
 * A family name safe to put in a CSS declaration - quoted, and with the
 * characters that would end the declaration or open another removed.
 */
export function cssFontFamily(value: string | null | undefined): string {
  const family = (typeof value === "string" ? value : "").replace(/["'`;{}()\\<>]/g, "").trim();
  return family ? `"${family}"` : `"${NEPALI_FONT_FAMILY}"`;
}
