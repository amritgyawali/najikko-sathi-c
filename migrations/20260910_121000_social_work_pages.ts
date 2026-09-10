import { type MigrateUpArgs, type MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * An address and a short description for every social work entry, so each one
 * can have a page of its own.
 *
 * /social-work used to print every entry in full, one under another: a visitor
 * looking for the fourth album scrolled past three complete ones to reach it.
 * It now shows a card per entry, and the card opens /social-work/<address>.
 *
 * Entries that already exist have no address, so one is derived here from the
 * title - the same shape the dashboard generates - and any collision is settled
 * by appending the entry's id, which is unique by definition. An entry whose
 * title yields nothing usable (a title written entirely in Devanagari, say)
 * falls back to "entry-<id>", so every row ends up reachable.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "social_work" ADD COLUMN IF NOT EXISTS "slug" varchar;
    ALTER TABLE "social_work" ADD COLUMN IF NOT EXISTS "summary" varchar;
  `);

  // The dashboard's own rule: lower case, punctuation dropped, spaces and
  // underscores turned into single hyphens, no hyphen at either end.
  await db.execute(sql`
    UPDATE "social_work"
    SET "slug" = NULLIF(
      trim(both '-' from regexp_replace(
        regexp_replace(lower(trim("title")), '[^a-z0-9_\\s-]', '', 'g'),
        '[\\s_-]+', '-', 'g'
      )),
      ''
    )
    WHERE "slug" IS NULL OR "slug" = '';
  `);

  // Two entries called the same thing, or a title with nothing left after the
  // punctuation was dropped, would both leave the page unreachable.
  await db.execute(sql`
    UPDATE "social_work" AS s
    SET "slug" = COALESCE(s."slug", 'entry') || '-' || s."id"
    WHERE s."slug" IS NULL
       OR EXISTS (
         SELECT 1 FROM "social_work" AS other
         WHERE other."slug" = s."slug" AND other."id" <> s."id"
       );
  `);

  await db.execute(sql`
    CREATE UNIQUE INDEX IF NOT EXISTS "social_work_slug_idx" ON "social_work" USING btree ("slug");
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    DROP INDEX IF EXISTS "social_work_slug_idx";
    ALTER TABLE "social_work" DROP COLUMN IF EXISTS "slug";
    ALTER TABLE "social_work" DROP COLUMN IF EXISTS "summary";
  `);
}
