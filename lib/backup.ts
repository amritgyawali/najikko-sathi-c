import type { Payload, PayloadRequest } from "payload";

/**
 * Taking a copy of everything in the dashboard, and putting it back.
 *
 * A snapshot is one JSON object holding every document in every content
 * collection and every global, read at depth 0 so a relationship is stored as
 * the id it points at rather than as a copy of the thing it points to. It is
 * saved as a row in the `backups` collection - in the same database as the
 * content, so a snapshot needs no file store, no bucket and no credentials of
 * its own, and is taken and restored entirely from the dashboard.
 *
 * What restoring means, collection by collection, is decided by MODES below,
 * and it is not the same everywhere:
 *
 * - Editorial content is *reverted*: what changed goes back, what was deleted
 *   comes back, and what was added since is removed. That is what "revert to
 *   yesterday" means, and it is safe because a restore takes a snapshot of the
 *   present before it changes anything - so a restore is itself undoable.
 * - Enquiries are only ever added to. A visitor's message that arrived after
 *   the snapshot is real correspondence, and no restore may throw it away.
 * - Media rows are updated but never created or deleted. The file itself lives
 *   at Cloudinary or Vercel Blob, not in this database, so a row recreated here
 *   would point at nothing.
 * - Dashboard accounts are captured for the record and never written back.
 *   Restoring them could resurrect a removed account or lock out the person
 *   doing the restore.
 *
 * Page views are deliberately not captured at all: they are append-only
 * analytics that grow without bound, there is no sense in which they can be
 * "wrong yesterday", and copying them daily would bloat every snapshot.
 */

/** How a collection is treated when a snapshot is put back. */
export type RestoreMode =
  /** Update, recreate what was deleted, and remove what was added since. */
  | "revert"
  /** Update and recreate, but never delete: nothing that arrived is lost. */
  | "addOnly"
  /** Update what is still there. Never create, never delete. */
  | "updateOnly"
  /** Captured so the snapshot is complete, never written back. */
  | "record";

export const MODES = {
  pages: "revert",
  posts: "revert",
  services: "revert",
  "service-categories": "revert",
  offers: "revert",
  reviews: "revert",
  faqs: "revert",
  team: "revert",
  "well-wishers": "revert",
  "social-responsibility": "revert",
  "social-work": "revert",
  "media-slots": "revert",
  redirects: "revert",
  enquiries: "addOnly",
  media: "updateOnly",
  users: "record",
} as const satisfies Record<string, RestoreMode>;

export type BackedUpCollection = keyof typeof MODES;

export const COLLECTIONS = Object.keys(MODES) as BackedUpCollection[];

export const GLOBALS = [
  "homepage",
  "navigation",
  "announcement",
  "appearance",
  "footer",
  "site-settings",
] as const;

export type BackedUpGlobal = (typeof GLOBALS)[number];

/** The shape stored in a backup row. `version` guards against a future change. */
export type Snapshot = {
  version: 1;
  takenAt: string;
  collections: Partial<Record<BackedUpCollection, Record<string, unknown>[]>>;
  globals: Partial<Record<BackedUpGlobal, Record<string, unknown>>>;
  /** Anything that could not be read, so a partial snapshot is never silent. */
  problems: string[];
};

/** Fields Payload owns. Sending them back on a write is pointless or harmful. */
const MANAGED = ["id", "createdAt", "updatedAt", "collection", "_status"];

/**
 * A document as it should be written back.
 *
 * `sessions` is stripped from an account for the same reason a password would
 * be: it is live credential material, and a snapshot is read by anyone who can
 * download a backup.
 */
const writable = (doc: Record<string, unknown>): Record<string, unknown> => {
  const copy = { ...doc };
  for (const key of [...MANAGED, "sessions"]) delete copy[key];
  return copy;
};

const message = (error: unknown): string =>
  error instanceof Error ? error.message : String(error);

/** Reads everything, in one object. */
export async function takeSnapshot(payload: Payload, req?: PayloadRequest): Promise<Snapshot> {
  const snapshot: Snapshot = {
    version: 1,
    takenAt: new Date().toISOString(),
    collections: {},
    globals: {},
    problems: [],
  };

  for (const collection of COLLECTIONS) {
    try {
      const result = await payload.find({
        collection,
        // Depth 0 keeps a relationship as the id it points at. Any deeper and
        // restoring would write a copy of the related document into the field.
        depth: 0,
        limit: 0,
        pagination: false,
        overrideAccess: true,
        ...(req ? { req } : {}),
      });
      snapshot.collections[collection] = result.docs as unknown as Record<string, unknown>[];
    } catch (error) {
      snapshot.problems.push(`${collection}: ${message(error)}`);
    }
  }

  for (const slug of GLOBALS) {
    try {
      snapshot.globals[slug] = (await payload.findGlobal({
        slug,
        depth: 0,
        overrideAccess: true,
        ...(req ? { req } : {}),
      })) as unknown as Record<string, unknown>;
    } catch (error) {
      snapshot.problems.push(`${slug}: ${message(error)}`);
    }
  }

  return snapshot;
}

/** How many documents a snapshot holds, by collection. */
export const countsIn = (snapshot: Snapshot): Record<string, number> =>
  Object.fromEntries(
    Object.entries(snapshot.collections).map(([slug, docs]) => [slug, docs?.length ?? 0]),
  );

export const totalIn = (snapshot: Snapshot): number =>
  Object.values(countsIn(snapshot)).reduce((sum, count) => sum + count, 0);

/** One line an editor can read in a list, without opening anything. */
export function summarize(snapshot: Snapshot): string {
  const counts = countsIn(snapshot);
  const named = Object.entries(counts)
    .filter(([, count]) => count > 0)
    .map(([slug, count]) => `${count} ${slug}`)
    .join(", ");
  const globals = Object.keys(snapshot.globals).length;
  return [named || "no documents", `${globals} settings`].join(", ");
}

export type RestoreReport = {
  updated: number;
  created: number;
  deleted: number;
  globals: number;
  /** Documents that came back with a new id, which anything pointing at them
   *  by id will no longer find. Named so the report can say so plainly. */
  recreated: { collection: string; title: string; wasId: string | number; nowId: string | number }[];
  skipped: string[];
  problems: string[];
};

/** Whatever reads best as a name for one document, for the report. */
const titleOf = (doc: Record<string, unknown>): string => {
  for (const key of ["title", "question", "name", "label", "key", "subject", "email", "from"]) {
    const value = doc[key];
    if (typeof value === "string" && value.trim()) return value;
  }
  return String(doc.id ?? "untitled");
};

/**
 * Puts a snapshot back, following MODES.
 *
 * Ids are not preserved when a deleted document is recreated: Payload assigns
 * its own, and there is no supported way to ask for the old one. That matters
 * only for a document something else points at by id - a photograph, a service
 * category - so those are the collections that are never recreated, and
 * everything that is gets listed in `recreated` so nothing is discovered later.
 */
export async function restoreSnapshot(
  payload: Payload,
  snapshot: Snapshot,
  req?: PayloadRequest,
): Promise<RestoreReport> {
  const report: RestoreReport = {
    updated: 0,
    created: 0,
    deleted: 0,
    globals: 0,
    recreated: [],
    skipped: [],
    problems: [],
  };
  const scope = req ? { req } : {};

  for (const collection of COLLECTIONS) {
    const mode: RestoreMode = MODES[collection];
    const wanted = snapshot.collections[collection];

    if (mode === "record") {
      report.skipped.push(collection);
      continue;
    }
    // A collection missing from the snapshot is one this backup never held.
    // Deleting today's documents because of that would be wrong.
    if (!wanted) {
      report.problems.push(`${collection}: not in this backup, so it was left alone.`);
      continue;
    }

    let present: Map<string, Record<string, unknown>>;
    try {
      const found = await payload.find({
        collection,
        depth: 0,
        limit: 0,
        pagination: false,
        overrideAccess: true,
        ...scope,
      });
      present = new Map(
        (found.docs as unknown as Record<string, unknown>[]).map((doc) => [String(doc.id), doc]),
      );
    } catch (error) {
      report.problems.push(`${collection}: could not be read (${message(error)}).`);
      continue;
    }

    for (const doc of wanted) {
      const id = doc.id as string | number;
      try {
        if (present.has(String(id))) {
          await payload.update({
            collection,
            id,
            data: writable(doc) as never,
            overrideAccess: true,
            ...scope,
          });
          report.updated += 1;
          present.delete(String(id));
        } else if (mode === "revert" || mode === "addOnly") {
          const made = await payload.create({
            collection,
            data: writable(doc) as never,
            overrideAccess: true,
            ...scope,
          });
          report.created += 1;
          report.recreated.push({
            collection,
            title: titleOf(doc),
            wasId: id,
            nowId: made.id as string | number,
          });
        }
      } catch (error) {
        report.problems.push(`${collection} "${titleOf(doc)}": ${message(error)}`);
      }
    }

    // Whatever is left in `present` was created after the snapshot was taken.
    // Only a revert removes it; everything else keeps it.
    if (mode !== "revert") continue;
    for (const [id, doc] of present) {
      try {
        await payload.delete({ collection, id, overrideAccess: true, ...scope });
        report.deleted += 1;
      } catch (error) {
        report.problems.push(`${collection} "${titleOf(doc)}": could not be removed (${message(error)}).`);
      }
    }
  }

  for (const slug of GLOBALS) {
    const data = snapshot.globals[slug];
    if (!data) continue;
    try {
      await payload.updateGlobal({
        slug,
        data: writable(data) as never,
        overrideAccess: true,
        ...scope,
      });
      report.globals += 1;
    } catch (error) {
      report.problems.push(`${slug}: ${message(error)}`);
    }
  }

  return report;
}
