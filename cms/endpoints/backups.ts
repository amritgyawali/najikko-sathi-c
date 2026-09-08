import type { Endpoint, Payload, PayloadRequest } from "payload";

import {
  restoreSnapshot,
  summarize,
  takeSnapshot,
  totalIn,
  type Snapshot,
} from "../../lib/backup";

/**
 * Taking the daily copy, and putting one back.
 *
 * GET  /api/site-backup/run      - take a copy. This is what the schedule calls.
 * POST /api/site-backup/run      - the same, from the button in the dashboard.
 * POST /api/site-backup/restore  - put a copy back, named by `{ "id": 12 }`.
 *
 * The schedule in vercel.json calls the first of these once a day. Vercel signs
 * that call with CRON_SECRET, which is the only way in that is not a signed-in
 * administrator - so setting that variable is what stops anyone on the internet
 * filling the table with snapshots.
 *
 * The path is "site-backup" rather than "backups" on purpose. Payload gives a
 * collection the whole of /api/<slug>/..., so /api/backups/run would be read as
 * "the backup whose id is run" and never reach the handler below.
 */

/** How many days of copies to keep. A month unless the environment says otherwise. */
const retentionDays = (): number => {
  const configured = Number(process.env.BACKUP_RETENTION_DAYS);
  return Number.isFinite(configured) && configured > 0 ? Math.floor(configured) : 30;
};

/** Copies always kept, however old, so there is never nothing to go back to. */
const ALWAYS_KEEP = 7;

const isAdmin = (req: PayloadRequest): boolean =>
  (req.user as { role?: string } | null | undefined)?.role === "admin";

/**
 * The scheduler, proved by the secret Vercel sends.
 *
 * With no CRON_SECRET set there is nothing to check against, so an unsigned
 * call is refused rather than trusted - a missing variable must not be a way in.
 */
const isScheduler = (req: PayloadRequest): boolean => {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const header = req.headers.get("authorization") ?? "";
  return header === `Bearer ${secret}`;
};

const denied = () =>
  Response.json(
    { error: "Sign in to the dashboard as an administrator, or call this as the scheduler." },
    { status: 403 },
  );

/** Writes one snapshot, and says what it holds. */
export async function saveSnapshot(
  payload: Payload,
  reason: "daily" | "manual" | "beforeRestore",
  label: string,
  req?: PayloadRequest,
): Promise<{ id: string | number; summary: string; documents: number; problems: string[] }> {
  const snapshot = await takeSnapshot(payload, req);
  const doc = await payload.create({
    collection: "backups",
    overrideAccess: true,
    ...(req ? { req } : {}),
    data: {
      label,
      takenAt: snapshot.takenAt,
      reason,
      summary: summarize(snapshot),
      documents: totalIn(snapshot),
      problems: snapshot.problems.join("\n"),
      data: snapshot,
    },
  });

  return {
    id: doc.id,
    summary: summarize(snapshot),
    documents: totalIn(snapshot),
    problems: snapshot.problems,
  };
}

/**
 * Drops copies past the retention window, keeping the newest few whatever their
 * age - a site left alone for two months should still have something to go back
 * to. Never fails the run that called it: a copy taken and not pruned is a far
 * better outcome than the reverse.
 */
async function prune(payload: Payload, req?: PayloadRequest): Promise<number> {
  const scope = req ? { req } : {};
  try {
    const cutoff = new Date(Date.now() - retentionDays() * 24 * 60 * 60 * 1000).toISOString();
    const all = await payload.find({
      collection: "backups",
      sort: "-takenAt",
      limit: 0,
      depth: 0,
      pagination: false,
      overrideAccess: true,
      select: { takenAt: true },
      ...scope,
    });

    const old = all.docs
      .slice(ALWAYS_KEEP)
      .filter((doc) => typeof doc.takenAt === "string" && doc.takenAt < cutoff);

    for (const doc of old) {
      await payload.delete({ collection: "backups", id: doc.id, overrideAccess: true, ...scope });
    }
    return old.length;
  } catch (error) {
    payload.logger.error(`[backups] could not prune old copies: ${(error as Error).message}`);
    return 0;
  }
}

/** A label a person can read, in the site's own timezone rather than UTC. */
const stamp = (): string =>
  new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kathmandu",
  }).format(new Date());

async function run(req: PayloadRequest): Promise<Response> {
  const scheduled = isScheduler(req);
  if (!scheduled && !isAdmin(req)) return denied();

  const reason = scheduled ? "daily" : "manual";
  const label = scheduled ? `Daily backup - ${stamp()}` : `Backup - ${stamp()}`;

  try {
    const saved = await saveSnapshot(req.payload, reason, label);
    const pruned = await prune(req.payload);
    req.payload.logger.info(
      `[backups] ${reason} copy #${saved.id}: ${saved.summary}. ${pruned} old ${pruned === 1 ? "copy" : "copies"} removed.`,
    );
    return Response.json({ ok: true, ...saved, pruned });
  } catch (error) {
    req.payload.logger.error(`[backups] the copy failed: ${(error as Error).message}`);
    return Response.json({ error: (error as Error).message }, { status: 500 });
  }
}

export const backupRunEndpoints: Endpoint[] = [
  { path: "/site-backup/run", method: "get", handler: run },
  { path: "/site-backup/run", method: "post", handler: run },
];

export const backupRestoreEndpoint: Endpoint = {
  path: "/site-backup/restore",
  method: "post",
  handler: async (req) => {
    // Restoring rewrites the whole site. Only an administrator, never the
    // scheduler: nothing on a timer should ever be able to do this.
    if (!isAdmin(req)) return denied();

    let body: { id?: string | number } = {};
    try {
      body = ((await req.json?.()) ?? {}) as { id?: string | number };
    } catch {
      // Falls through to the missing-id message below.
    }
    if (body.id === undefined || body.id === null || body.id === "") {
      return Response.json({ error: "Name the backup to restore." }, { status: 400 });
    }

    let snapshot: Snapshot;
    try {
      const doc = await req.payload.findByID({
        collection: "backups",
        id: body.id,
        depth: 0,
        overrideAccess: true,
      });
      snapshot = doc.data as Snapshot;
    } catch {
      return Response.json({ error: "That backup no longer exists." }, { status: 404 });
    }

    if (!snapshot || snapshot.version !== 1) {
      return Response.json(
        { error: "That backup was written by a different version of the site and cannot be put back." },
        { status: 422 },
      );
    }

    try {
      // The safety net. Taken before anything changes, so a restore made by
      // mistake is undone by restoring the copy this line just wrote.
      const safety = await saveSnapshot(
        req.payload,
        "beforeRestore",
        `Before restore - ${stamp()}`,
      );

      const report = await restoreSnapshot(req.payload, snapshot);
      req.payload.logger.info(
        `[backups] restored #${body.id}: ${report.updated} updated, ${report.created} recreated, ` +
          `${report.deleted} removed, ${report.globals} settings. Undo with copy #${safety.id}.`,
      );

      return Response.json({ ok: true, report, undoWith: safety.id });
    } catch (error) {
      req.payload.logger.error(`[backups] the restore failed: ${(error as Error).message}`);
      return Response.json({ error: (error as Error).message }, { status: 500 });
    }
  },
};

export const backupEndpoints: Endpoint[] = [...backupRunEndpoints, backupRestoreEndpoint];
