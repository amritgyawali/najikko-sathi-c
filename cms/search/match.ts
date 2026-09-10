/**
 * Keyword matching for the dashboard search bar.
 *
 * The behaviour an editor expects from a search box is SQL's `LIKE '%word%'`:
 * type part of a word and see every place it appears. That is done here rather
 * than in the database so the same rule applies to text buried inside blocks,
 * arrays and rich text, where a column-level query cannot reach.
 */

export type Range = { start: number; end: number };

/**
 * Lower-cases and strips accents while keeping the string the same length, so
 * an offset found in the folded text still points at the right character in the
 * original. A character that folds to something longer (a ligature, say) is
 * left alone rather than shifting everything after it.
 */
export const fold = (value: string): string => {
  let folded = "";
  for (const character of value) {
    // \p{Mn} is the combining accents NFKD splits off; dropping them makes
    // "Kathmandu" and "Kāthmāndu" the same search term.
    const stripped = character.normalize("NFKD").replace(/\p{Mn}/gu, "").toLowerCase();
    folded += stripped.length === character.length ? stripped : character.toLowerCase();
  }
  return folded;
};

export const tokenise = (query: string): string[] =>
  fold(query)
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

const isWordCharacter = (character: string | undefined): boolean =>
  character !== undefined && /[\p{L}\p{N}]/u.test(character);

/** Every occurrence of `needle` in the already-folded `haystack`. */
export const findAll = (haystack: string, needle: string, cap = 12): Range[] => {
  if (!needle) return [];
  const ranges: Range[] = [];
  let from = 0;
  while (ranges.length < cap) {
    const index = haystack.indexOf(needle, from);
    if (index === -1) break;
    ranges.push({ start: index, end: index + needle.length });
    from = index + needle.length;
  }
  return ranges;
};

/** True when the match begins at the start of a word rather than mid-word. */
export const atWordStart = (haystack: string, range: Range): boolean =>
  !isWordCharacter(haystack[range.start - 1]);

/** Merges overlapping or touching ranges so highlights never nest. */
export const mergeRanges = (ranges: Range[]): Range[] => {
  const sorted = [...ranges].sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Range[] = [];
  for (const range of sorted) {
    const last = merged[merged.length - 1];
    if (last && range.start <= last.end) last.end = Math.max(last.end, range.end);
    else merged.push({ ...range });
  }
  return merged;
};

/**
 * Levenshtein distance, abandoned as soon as it passes `limit`. Only used for
 * the typo-tolerant second pass, so the early exit keeps it cheap.
 */
const distanceWithin = (a: string, b: string, limit: number): number => {
  if (Math.abs(a.length - b.length) > limit) return limit + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, index) => index);
  for (let i = 1; i <= a.length; i += 1) {
    const current = [i];
    let best = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      current[j] = Math.min(current[j - 1] + 1, previous[j] + 1, previous[j - 1] + cost);
      if (current[j] < best) best = current[j];
    }
    if (best > limit) return limit + 1;
    previous = current;
  }
  return previous[b.length];
};

/** How much of a typo to forgive: none on short words, more as they grow. */
export const typoBudget = (token: string): number => (token.length >= 8 ? 2 : token.length >= 5 ? 1 : 0);

/**
 * Words in `haystack` that are within `budget` edits of `token`. Used only when
 * a strict `%like%` pass found nothing, so "diretor" still reaches "director".
 */
export const findFuzzy = (haystack: string, token: string, budget: number, cap = 6): Range[] => {
  if (budget < 1) return [];
  const ranges: Range[] = [];
  const words = haystack.matchAll(/[\p{L}\p{N}]+/gu);
  for (const word of words) {
    if (ranges.length >= cap) break;
    const text = word[0];
    if (Math.abs(text.length - token.length) > budget) continue;
    if (distanceWithin(text, token, budget) <= budget) {
      const start = word.index ?? 0;
      ranges.push({ start, end: start + text.length });
    }
  }
  return ranges;
};

export type Snippet = { text: string; ranges: Range[]; truncatedStart: boolean; truncatedEnd: boolean };

/**
 * A window of text around the first match, cut on word boundaries, with the
 * highlight offsets rebased onto the window.
 */
export const snippetAround = (text: string, ranges: Range[], width = 190, lead = 60): Snippet => {
  const merged = mergeRanges(ranges);
  if (text.length <= width || merged.length === 0) {
    return { text, ranges: merged, truncatedStart: false, truncatedEnd: false };
  }

  const first = merged[0];
  let start = Math.max(0, first.start - lead);
  let end = Math.min(text.length, start + width);
  // A long match should still show its beginning, so grow the window if needed.
  if (end < first.end) end = Math.min(text.length, first.end + 20);
  if (end === text.length) start = Math.max(0, end - width);

  if (start > 0) {
    const space = text.indexOf(" ", start);
    if (space !== -1 && space < first.start) start = space + 1;
  }
  if (end < text.length) {
    const space = text.lastIndexOf(" ", end);
    if (space > first.end) end = space;
  }

  return {
    text: text.slice(start, end),
    ranges: merged
      .map((range) => ({ start: range.start - start, end: range.end - start }))
      .filter((range) => range.start >= 0 && range.end <= end - start),
    truncatedStart: start > 0,
    truncatedEnd: end < text.length,
  };
};
