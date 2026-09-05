import { common } from "./common";
import { misc, patterns } from "./misc";
import { pages } from "./pages";
import { services } from "./services";
import { steps } from "./steps";

/**
 * The English → Nepali phrase book. Keys are the exact copy that appears in the
 * markup; whitespace and typographic punctuation are normalised before a lookup
 * so a phrase still matches when JSX reflows it across lines.
 */
export const phrasebook: Record<string, string> = {
  ...common,
  ...pages,
  ...services,
  ...steps,
  ...misc,
};

/** Collapses whitespace and the quote and dash variants writers mix. */
export function normalize(value: string): string {
  return value
    .replace(/\s+/g, " ")
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ /g, " ")
    .trim();
}

const byNormalized = new Map<string, string>();
const byLowercase = new Map<string, string>();

for (const [english, nepali] of Object.entries(phrasebook)) {
  const key = normalize(english);
  if (!byNormalized.has(key)) byNormalized.set(key, nepali);
  const lower = key.toLowerCase();
  if (!byLowercase.has(lower)) byLowercase.set(lower, nepali);
}

/** Trailing punctuation a phrase may pick up in one place but not another. */
const TRAILING = /[.:!?,;·|/\s]+$/;

function direct(value: string): string | undefined {
  const key = normalize(value);
  if (!key) return undefined;
  return byNormalized.get(key) ?? byLowercase.get(key.toLowerCase());
}

function templated(value: string, depth = 0): string | undefined {
  if (depth > 3) return undefined;
  const key = normalize(value);
  for (const [pattern, build] of patterns) {
    const match = key.match(pattern);
    if (!match) continue;
    // Each captured part is translated on its own, so "Explore production"
    // reuses the entry for "Production", and a page title translates both the
    // page name and the site name that follows it.
    const parts = match.slice(1).map((part) => {
      if (!part) return part;
      return direct(part) ?? templated(part, depth + 1) ?? part;
    });
    const built = build(...parts);
    // A template that rebuilt the English unchanged has translated nothing.
    if (built !== key) return built;
  }
  return undefined;
}

/**
 * Translates one phrase. Falls back through: the exact phrase, the phrase with
 * its trailing punctuation removed, a template match, and finally a
 * sentence-by-sentence pass so a paragraph that only partly appears in the
 * phrase book still comes back mostly in Nepali. Returns undefined when nothing
 * matches, which leaves the English in place rather than mangling it.
 */
export function translatePhrase(value: string): string | undefined {
  const key = normalize(value);
  if (!key || !/[A-Za-z]/.test(key)) return undefined;

  const exact = direct(key);
  if (exact) return exact;

  const trimmed = key.replace(TRAILING, "");
  if (trimmed !== key) {
    const hit = direct(trimmed);
    if (hit) return hit + key.slice(trimmed.length);
  }

  const fromTemplate = templated(key);
  if (fromTemplate) return fromTemplate;

  return bySentence(key);
}

/** Splits on sentence boundaries and translates each sentence it recognises. */
function bySentence(value: string): string | undefined {
  const sentences = value.match(/[^.!?]+[.!?]*\s*/g);
  if (!sentences || sentences.length < 2) return undefined;

  let translatedAny = false;
  const rebuilt = sentences.map((sentence) => {
    const body = sentence.trim();
    if (!body) return sentence;
    const hit = direct(body) ?? direct(body.replace(TRAILING, ""));
    if (!hit) return sentence;
    translatedAny = true;
    return `${hit} `;
  });

  return translatedAny ? rebuilt.join("").trim() : undefined;
}

/** Devanagari digits, so numbers in translated copy read as Nepali too. */
const DEVANAGARI_DIGITS = ["०", "१", "२", "३", "४", "५", "६", "७", "८", "९"];

export function toNepaliDigits(value: string): string {
  return value.replace(/[0-9]/g, (digit) => DEVANAGARI_DIGITS[Number(digit)]);
}
