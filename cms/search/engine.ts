import type { Payload, PayloadRequest, SanitizedCollectionConfig, SanitizedGlobalConfig } from "payload";

import { liveTargetFor } from "../live-urls";
import { extractText, type TextEntry } from "./extract";
import { atWordStart, findAll, findFuzzy, fold, mergeRanges, snippetAround, tokenise, typoBudget } from "./match";

/**
 * The dashboard's keyword search.
 *
 * Every document and global is read once, flattened into its individual pieces
 * of text, and kept in memory for a few seconds. Searching then happens over
 * that snapshot, which is what makes a `%like%` match across blocks, arrays and
 * rich text possible at all - none of that is reachable with a column query.
 *
 * The snapshot is built per signed-in user with their own access rules applied,
 * so search can never reveal a document its user could not open.
 */

/** How many documents of a single collection are indexed. */
const MAX_DOCS_PER_COLLECTION = 500;

/** A snapshot younger than this is used exactly as it is. */
const SNAPSHOT_FRESH_MS = 60_000;

/**
 * Older than this and a search waits for a rebuild. Between the two, the stale
 * snapshot answers immediately and a fresh one is built behind it - reading a
 * whole site from a hosted database takes seconds, which is far too long to
 * stand between a keystroke and its results.
 */
const SNAPSHOT_STALE_MS = 15 * 60_000;

/**
 * Collections that hold no editable copy. The traffic log and the backups are
 * the ones that matter: a backup is a copy of everything else, so indexing it
 * would return every result twice and point the second one at a file.
 */
const EXCLUDED_COLLECTIONS = new Set([
  "pageviews",
  "backups",
  "payload-locked-documents",
  "payload-preferences",
  "payload-migrations",
]);

export type SearchHit = {
  id: string;
  /** "Pages", "Homepage" - what the editor sees in the sidebar. */
  entity: string;
  entityKind: "collection" | "global";
  slug: string;
  docId: string | null;
  title: string;
  /** Breadcrumb of the field the keyword was found in. */
  field: string;
  fieldPath: string;
  snippet: string;
  /** Character ranges within `snippet` to highlight. */
  ranges: [number, number][];
  truncatedStart: boolean;
  truncatedEnd: boolean;
  /** Where to edit it, including the anchor of the field itself. */
  editUrl: string;
  /** Where it appears on the public website, when it has one place. */
  publicPath: string | null;
  /** That same place, said as a sentence: "The team band on the About page." */
  publicWhere: string;
  status: string | null;
  updatedAt: string | null;
  /** True when the keyword only matched after forgiving a typo. */
  approximate: boolean;
  score: number;
};

type IndexedEntry = TextEntry & { folded: string; isTitle: boolean };

type IndexedDoc = {
  key: string;
  entity: string;
  entityKind: "collection" | "global";
  slug: string;
  docId: string | null;
  title: string;
  status: string | null;
  updatedAt: string | null;
  publicPath: string | null;
  publicWhere: string;
  editUrl: string;
  entries: IndexedEntry[];
};

/* ------------------------------------------------------------ public paths */

/**
 * Where a document shows up on the website, and how to say so in a sentence.
 *
 * Editors think in pages, so a result that can name its page is far easier to
 * act on than one that cannot. cms/live-urls.ts already works this out for the
 * "On the website" link at the top of every document, and it is deliberately
 * free of React and Payload imports so this can use exactly the same answer.
 */
function publicPlaceFor(
  kind: "collection" | "global",
  slug: string,
  doc: Record<string, unknown>,
): { path: string | null; where: string } {
  try {
    const target = liveTargetFor(
      kind === "global" ? { globalSlug: slug, data: doc } : { collectionSlug: slug, data: doc },
    );

    // A page carries the address it actually answers at, which is not always
    // its slug - the front page is "/" but its slug is "home".
    const own = typeof doc.path === "string" && doc.path.startsWith("/") ? doc.path : null;

    return { path: own ?? target.path, where: target.where };
  } catch {
    return { path: null, where: "" };
  }
}

/* ------------------------------------------------------------------ labels */

const entityLabel = (label: unknown, fallback: string): string => {
  if (typeof label === "string") return label;
  if (label && typeof label === "object") {
    const translations = label as Record<string, unknown>;
    const preferred = translations.en ?? Object.values(translations).find((value) => typeof value === "string");
    if (typeof preferred === "string") return preferred;
  }
  return fallback;
};

const titleOf = (config: SanitizedCollectionConfig, doc: Record<string, unknown>): string => {
  const key = config.admin?.useAsTitle;
  const value = key ? doc[key] : undefined;
  if (typeof value === "string" && value.trim()) return value.trim();
  if (typeof value === "number") return String(value);
  return `Untitled ${doc.id ?? ""}`.trim();
};

/** Payload gives every field wrapper an id of `field-<path with __ separators>`. */
export const fieldAnchor = (path: string): string => `field-${path.replace(/\./g, "__")}`;

/* ----------------------------------------------------------------- indexing */

function indexEntries(entries: TextEntry[], titlePath: string | undefined): IndexedEntry[] {
  const seen = new Set<string>();
  const indexed: IndexedEntry[] = [];
  for (const entry of entries) {
    // The same words often repeat (a heading reused as an SEO title); one copy
    // per field path is enough to search, and keeps the snapshot small.
    const key = `${entry.path}::${entry.text}`;
    if (seen.has(key)) continue;
    seen.add(key);
    indexed.push({ ...entry, folded: fold(entry.text), isTitle: Boolean(titlePath) && entry.path === titlePath });
  }
  return indexed;
}

async function indexCollection(
  payload: Payload,
  config: SanitizedCollectionConfig,
  user: PayloadRequest["user"],
  adminRoute: string,
): Promise<IndexedDoc[]> {
  const result = await payload.find({
    collection: config.slug,
    depth: 0,
    limit: MAX_DOCS_PER_COLLECTION,
    sort: "-updatedAt",
    overrideAccess: false,
    user,
    // Search what the editor would see when opening the document, drafts and all.
    draft: Boolean(config.versions),
  });

  const label = entityLabel(config.labels?.plural, config.slug);

  return result.docs.map((raw) => {
    const doc = raw as unknown as Record<string, unknown>;
    const docId = doc.id === undefined || doc.id === null ? "" : String(doc.id);
    const entries = indexEntries(extractText(config.fields, doc), config.admin?.useAsTitle);
    const place = publicPlaceFor("collection", config.slug, doc);
    return {
      key: `collection:${config.slug}:${docId}`,
      entity: label,
      entityKind: "collection" as const,
      slug: config.slug,
      docId,
      title: titleOf(config, doc),
      status: typeof doc.status === "string" ? doc.status : typeof doc._status === "string" ? doc._status : null,
      updatedAt: typeof doc.updatedAt === "string" ? doc.updatedAt : null,
      publicPath: place.path,
      publicWhere: place.where,
      editUrl: `${adminRoute}/collections/${config.slug}/${docId}`,
      entries,
    };
  });
}

async function indexGlobal(
  payload: Payload,
  config: SanitizedGlobalConfig,
  user: PayloadRequest["user"],
  adminRoute: string,
): Promise<IndexedDoc | null> {
  const doc = (await payload.findGlobal({
    slug: config.slug,
    depth: 0,
    overrideAccess: false,
    user,
    draft: Boolean(config.versions),
  })) as unknown as Record<string, unknown>;

  if (!doc) return null;
  const label = entityLabel(config.label, config.slug);
  const place = publicPlaceFor("global", config.slug, doc);

  return {
    key: `global:${config.slug}`,
    entity: "Site",
    entityKind: "global",
    slug: config.slug,
    docId: null,
    title: label,
    status: null,
    updatedAt: typeof doc.updatedAt === "string" ? doc.updatedAt : null,
    publicPath: place.path,
    publicWhere: place.where,
    editUrl: `${adminRoute}/globals/${config.slug}`,
    entries: indexEntries(extractText(config.fields, doc), undefined),
  };
}

type Snapshot = { builtAt: number; docs: IndexedDoc[] };

const snapshots = new Map<string, Snapshot>();
const building = new Map<string, Promise<Snapshot>>();

async function buildSnapshot(req: PayloadRequest): Promise<Snapshot> {
  const { payload } = req;
  const adminRoute = payload.config.routes?.admin ?? "/admin";
  const docs: IndexedDoc[] = [];

  const collections = payload.config.collections.filter(
    (config) => !EXCLUDED_COLLECTIONS.has(config.slug) && config.admin?.hidden !== true,
  );

  const collected = await Promise.all(
    collections.map(async (config) => {
      try {
        return await indexCollection(payload, config, req.user, adminRoute);
      } catch {
        // A collection the user cannot read, or one whose table is not migrated
        // yet, should narrow the search - never break it.
        return [];
      }
    }),
  );
  for (const group of collected) docs.push(...group);

  const globals = await Promise.all(
    payload.config.globals.map(async (config) => {
      try {
        return await indexGlobal(payload, config, req.user, adminRoute);
      } catch {
        return null;
      }
    }),
  );
  for (const global of globals) if (global) docs.push(global);

  return { builtAt: Date.now(), docs };
}

function rebuild(req: PayloadRequest, key: string): Promise<Snapshot> {
  // Several keystrokes can land while the first build is still running; they
  // all wait on the same promise rather than each hammering the database.
  const inFlight = building.get(key);
  if (inFlight) return inFlight;

  const promise = buildSnapshot(req)
    .then((snapshot) => {
      snapshots.set(key, snapshot);
      // Only a handful of people ever sign in; this keeps that bounded anyway.
      if (snapshots.size > 12) {
        const oldest = [...snapshots.entries()].sort((a, b) => a[1].builtAt - b[1].builtAt)[0];
        if (oldest) snapshots.delete(oldest[0]);
      }
      return snapshot;
    })
    .finally(() => {
      building.delete(key);
    });

  building.set(key, promise);
  return promise;
}

async function getSnapshot(req: PayloadRequest, force: boolean): Promise<Snapshot> {
  const key = String(req.user?.id ?? "anonymous");
  const cached = snapshots.get(key);
  const age = cached ? Date.now() - cached.builtAt : Number.POSITIVE_INFINITY;

  if (!force && cached && age < SNAPSHOT_FRESH_MS) return cached;

  if (!force && cached && age < SNAPSHOT_STALE_MS) {
    // Answer from the snapshot in hand and refresh it for the next keystroke.
    void rebuild(req, key).catch(() => undefined);
    return cached;
  }

  return rebuild(req, key);
}

/**
 * Builds the snapshot ahead of the first keystroke. The dashboard calls this
 * once when it loads, so the search bar is instant by the time it is used.
 */
export async function warmSearchIndex(req: PayloadRequest): Promise<number> {
  const snapshot = await getSnapshot(req, false);
  return snapshot.docs.length;
}

/* ---------------------------------------------------------------- searching */

type EntryMatch = { entry: IndexedEntry; ranges: { start: number; end: number }[]; tokens: Set<string>; score: number };

const RECENT_MS = 7 * 24 * 60 * 60 * 1000;

function scoreEntry(
  entry: IndexedEntry,
  ranges: { start: number; end: number }[],
  matchedTokens: number,
  totalTokens: number,
  phraseMatched: boolean,
  phrase: string,
  approximate: boolean,
): number {
  if (ranges.length === 0) return 0;

  let score = phraseMatched ? 100 : 55 * (matchedTokens / totalTokens);
  if (ranges.some((range) => atWordStart(entry.folded, range))) score += 20;
  if (entry.folded === phrase) score += 45;
  if (entry.isTitle) score += 25;

  score *= entry.weight;

  // A hit in a short line is more likely to be the thing being looked for than
  // one buried in a long paragraph.
  score += 10 * (1 - Math.min(entry.text.length, 300) / 300);
  if (approximate) score *= 0.45;

  return score;
}

function matchEntry(entry: IndexedEntry, tokens: string[], phrase: string, approximate: boolean): EntryMatch | null {
  const ranges: { start: number; end: number }[] = [];
  const found = new Set<string>();

  const phraseRanges = tokens.length > 1 ? findAll(entry.folded, phrase) : [];
  if (phraseRanges.length > 0) {
    ranges.push(...phraseRanges);
    for (const token of tokens) found.add(token);
  }

  for (const token of tokens) {
    const exact = findAll(entry.folded, token);
    if (exact.length > 0) {
      ranges.push(...exact);
      found.add(token);
      continue;
    }
    if (!approximate) continue;
    const fuzzy = findFuzzy(entry.folded, token, typoBudget(token));
    if (fuzzy.length > 0) {
      ranges.push(...fuzzy);
      found.add(token);
    }
  }

  if (ranges.length === 0) return null;

  const merged = mergeRanges(ranges);
  return {
    entry,
    ranges: merged,
    tokens: found,
    score: scoreEntry(entry, merged, found.size, tokens.length, phraseRanges.length > 0, phrase, approximate),
  };
}

function searchSnapshot(
  snapshot: Snapshot,
  tokens: string[],
  phrase: string,
  approximate: boolean,
): { doc: IndexedDoc; matches: EntryMatch[]; score: number }[] {
  const results: { doc: IndexedDoc; matches: EntryMatch[]; score: number }[] = [];

  for (const doc of snapshot.docs) {
    const matches: EntryMatch[] = [];
    const tokensInDoc = new Set<string>();

    for (const entry of doc.entries) {
      const match = matchEntry(entry, tokens, phrase, approximate);
      if (!match) continue;
      matches.push(match);
      for (const token of match.tokens) tokensInDoc.add(token);
    }

    // Every word typed has to appear somewhere in the document, even if in
    // different fields - that is what makes a two-word search narrow things down.
    if (matches.length === 0 || tokensInDoc.size < tokens.length) continue;

    matches.sort((a, b) => b.score - a.score);
    let score = matches[0].score + Math.min(matches.length - 1, 4) * 1.5;
    if (doc.status === "published") score += 4;
    if (doc.updatedAt && Date.now() - Date.parse(doc.updatedAt) < RECENT_MS) score += 3;

    results.push({ doc, matches, score });
  }

  return results.sort((a, b) => b.score - a.score);
}

export type SearchResponse = {
  query: string;
  hits: SearchHit[];
  /** Documents that matched, which can exceed the number of rows returned. */
  documents: number;
  approximate: boolean;
  indexedDocuments: number;
  tookMs: number;
};

export async function search(
  req: PayloadRequest,
  query: string,
  options: { limit?: number; perDocument?: number; refresh?: boolean } = {},
): Promise<SearchResponse> {
  const startedAt = Date.now();
  const limit = Math.min(Math.max(options.limit ?? 12, 1), 30);
  const perDocument = Math.min(Math.max(options.perDocument ?? 2, 1), 5);

  const tokens = tokenise(query);
  const snapshot = await getSnapshot(req, options.refresh === true);

  if (tokens.length === 0) {
    return {
      query,
      hits: [],
      documents: 0,
      approximate: false,
      indexedDocuments: snapshot.docs.length,
      tookMs: Date.now() - startedAt,
    };
  }

  const phrase = tokens.join(" ");
  let approximate = false;
  let documents = searchSnapshot(snapshot, tokens, phrase, false);

  // Only forgive typos when nothing matched outright, so a real match is never
  // pushed down the list by a near-miss.
  if (documents.length === 0 && tokens.some((token) => typoBudget(token) > 0)) {
    approximate = true;
    documents = searchSnapshot(snapshot, tokens, phrase, true);
  }

  const hits: SearchHit[] = [];
  for (const { doc, matches, score } of documents) {
    if (hits.length >= limit) break;
    const seen = new Set<string>();
    let taken = 0;

    for (const match of matches) {
      if (taken >= perDocument || hits.length >= limit) break;
      const snippet = snippetAround(match.entry.text, match.ranges);
      const key = snippet.text.toLowerCase();
      if (seen.has(key)) continue;
      seen.add(key);
      taken += 1;

      hits.push({
        id: `${doc.key}:${match.entry.path}:${taken}`,
        entity: doc.entity,
        entityKind: doc.entityKind,
        slug: doc.slug,
        docId: doc.docId,
        title: doc.title,
        field: match.entry.label,
        fieldPath: match.entry.path,
        snippet: snippet.text,
        ranges: snippet.ranges.map((range) => [range.start, range.end] as [number, number]),
        truncatedStart: snippet.truncatedStart,
        truncatedEnd: snippet.truncatedEnd,
        editUrl: `${doc.editUrl}#${fieldAnchor(match.entry.path)}`,
        publicPath: doc.publicPath,
        publicWhere: doc.publicWhere,
        status: doc.status,
        updatedAt: doc.updatedAt,
        approximate,
        score: Math.round(score),
      });
    }
  }

  return {
    query,
    hits,
    documents: documents.length,
    approximate,
    indexedDocuments: snapshot.docs.length,
    tookMs: Date.now() - startedAt,
  };
}

/** Drops every cached snapshot, so the next search re-reads the database. */
export function invalidateSearchIndex() {
  snapshots.clear();
}
