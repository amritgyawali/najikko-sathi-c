-- An address and a short description for every social work entry, so each one
-- can have a page of its own.
--
-- Mirrors migrations/20260910_121000_social_work_pages.ts.
--
-- /social-work used to print every entry in full, one under another: a visitor
-- looking for the fourth album scrolled past three complete ones to reach it.
-- It now shows a card per entry, and the card opens /social-work/<address>.
--
-- Entries that already exist have no address, so one is derived here from the
-- title - the same shape the dashboard generates - and any collision is settled
-- by appending the entry's id, which is unique by definition. An entry whose
-- title yields nothing usable (a title written entirely in Devanagari, say)
-- falls back to "entry-<id>", so every row ends up reachable.
--
-- Safe to run more than once: the backfill only touches rows with no address,
-- so an address you have since edited by hand is never rewritten.

BEGIN;

ALTER TABLE "social_work" ADD COLUMN IF NOT EXISTS "slug"    varchar;
ALTER TABLE "social_work" ADD COLUMN IF NOT EXISTS "summary" varchar;

-- The dashboard's own rule: lower case, punctuation dropped, spaces and
-- underscores turned into single hyphens, no hyphen at either end.
UPDATE "social_work"
SET "slug" = NULLIF(
  trim(both '-' from regexp_replace(
    regexp_replace(lower(trim("title")), '[^a-z0-9_\s-]', '', 'g'),
    '[\s_-]+', '-', 'g'
  )),
  ''
)
WHERE "slug" IS NULL OR "slug" = '';

-- Two entries called the same thing, or a title with nothing left after the
-- punctuation was dropped, would both leave a page unreachable.
UPDATE "social_work" AS s
SET "slug" = COALESCE(s."slug", 'entry') || '-' || s."id"
WHERE s."slug" IS NULL
   OR EXISTS (
     SELECT 1 FROM "social_work" AS other
     WHERE other."slug" = s."slug" AND other."id" <> s."id"
   );

CREATE UNIQUE INDEX IF NOT EXISTS "social_work_slug_idx"
  ON "social_work" USING btree ("slug");

-- Tell Payload this is done, so the next deploy does not repeat it.
INSERT INTO "payload_migrations" ("name", "batch")
SELECT '20260910_121000_social_work_pages',
       (SELECT COALESCE(MAX("batch"), 0) + 1 FROM "payload_migrations")
WHERE NOT EXISTS (
  SELECT 1 FROM "payload_migrations"
  WHERE "name" = '20260910_121000_social_work_pages'
);

COMMIT;

-- Check it worked: every entry should have an address, and no two the same.
-- SELECT "id", "title", "slug" FROM "social_work" ORDER BY "order", "id";
