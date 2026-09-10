-- The Nepali half of every band in "Homepage & page copy".
--
-- Mirrors migrations/20260910_120000_add_nepali_page_copy.ts.
--
-- The leadership band already had one. This gives the same thing to the rest of
-- the front page and to the three pages that grew out of it: a hero, an
-- introduction, a service grid, the production band and the news portal band,
-- each with an optional Nepali counterpart of every line an editor writes.
--
-- Every column is nullable and nothing is backfilled. An empty Nepali field
-- means what it meant before this file existed - show the English, translated
-- against the phrase book - so the website reads identically until somebody
-- types Nepali into one of them.
--
-- Safe to run more than once.

BEGIN;

-- The single-row "homepage" table: one column per written line.
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "hero_kicker_ne"           varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "hero_heading_ne"          varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "hero_body_ne"             varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "hero_cta_label_ne"        varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "about_eyebrow_ne"         varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "about_heading_ne"         varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "about_quote_ne"           varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "about_body_ne"            varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "about_body_secondary_ne"  varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "services_kicker_ne"       varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "services_heading_ne"      varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "services_intro_ne"        varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "production_chip_ne"       varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "production_heading_ne"    varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "production_body_ne"       varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "production_cta_label_ne"  varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "sanchar_heading_ne"       varchar;
ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "sanchar_intro_ne"         varchar;

-- The keyword and paragraph lists, each row of which can be written twice.
ALTER TABLE "homepage_brand_pillars"      ADD COLUMN IF NOT EXISTS "label_ne" varchar;
ALTER TABLE "homepage_about_capabilities" ADD COLUMN IF NOT EXISTS "label_ne" varchar;
ALTER TABLE "homepage_about_paragraphs"   ADD COLUMN IF NOT EXISTS "text_ne"  varchar;
ALTER TABLE "homepage_services"           ADD COLUMN IF NOT EXISTS "name_ne"  varchar;
ALTER TABLE "homepage_sanchar_topics"     ADD COLUMN IF NOT EXISTS "label_ne" varchar;

-- Tell Payload this is done, so the next deploy does not repeat it.
INSERT INTO "payload_migrations" ("name", "batch")
SELECT '20260910_120000_add_nepali_page_copy',
       (SELECT COALESCE(MAX("batch"), 0) + 1 FROM "payload_migrations")
WHERE NOT EXISTS (
  SELECT 1 FROM "payload_migrations"
  WHERE "name" = '20260910_120000_add_nepali_page_copy'
);

COMMIT;

-- Check it worked: this lists every Nepali column on the homepage tables,
-- the leadership ones added earlier included.
-- SELECT table_name, column_name
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND table_name LIKE 'homepage%'
--   AND column_name LIKE '%\_ne' ESCAPE '\'
-- ORDER BY table_name, column_name;
