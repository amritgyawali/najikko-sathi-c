-- Type, layout and search-engine details for the whole website, in Site
-- Settings - and a row per band for the parts that want their own.
--
-- Mirrors migrations/20260912_090000_site_settings_typography.ts.
--
-- What arrives:
--
--   * site_settings_section_styles - a row per part of the website that has been
--     given type of its own. A face, a size, a weight, a letter spacing, a
--     colour and a case for its headings, its reading matter and its small
--     labels, plus the band's own alignment, background and air. Thirty-four
--     parts can be addressed: every section a page is made of, the header, the
--     footer, the two strips above the page, and the whole site at once.
--   * Site-wide type and layout, as two groups of columns on site_settings: the
--     faces, the base size, one percentage that makes every word larger or
--     smaller, and the page width, spacing, rounding, shadow and motion.
--   * Search-engine details: keywords, an X handle, the Google and Bing
--     verification codes, a Google measurement id, and one switch that asks
--     search engines to leave the whole site alone until it is ready.
--
-- Every column is nullable with no default, because empty means "leave the
-- design alone". Nothing about the website changes until somebody sets one.
--
-- Safe to run twice: the enum types are created only if absent, the columns use
-- ADD COLUMN IF NOT EXISTS, and the table uses CREATE TABLE IF NOT EXISTS.

BEGIN;

-- ------------------------------------------------------------- the menus
-- CREATE TYPE has no IF NOT EXISTS, so each one is guarded.

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_section_styles_area') THEN
    CREATE TYPE "public"."enum_site_settings_section_styles_area" AS ENUM('global', 'header', 'utility', 'announcement', 'footer', 'pageHero', 'prose', 'identityStory', 'featureCards', 'processSteps', 'faqSection', 'serviceCards', 'categoryBar', 'categoryGroups', 'mediaShowcase', 'teamSection', 'reviewsSection', 'wellWishersSection', 'partnerMarquee', 'socialResponsibilitySection', 'socialWorkSection', 'contactDetails', 'contactCta', 'portalLinks', 'postList', 'offerList', 'homeHero', 'homeAbout', 'leadershipSection', 'productionBand', 'sancharBand', 'servicesBand', 'searchSection', 'signupSection');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_section_styles_heading_font') THEN
    CREATE TYPE "public"."enum_site_settings_section_styles_heading_font" AS ENUM('hanken', 'inter', 'heading', 'system', 'serif', 'mono', 'devanagari', 'custom', 'alt');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_section_styles_heading_weight') THEN
    CREATE TYPE "public"."enum_site_settings_section_styles_heading_weight" AS ENUM('300', '400', '500', '600', '700', '800');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_section_styles_heading_transform') THEN
    CREATE TYPE "public"."enum_site_settings_section_styles_heading_transform" AS ENUM('none', 'uppercase', 'lowercase', 'capitalize');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_section_styles_body_font') THEN
    CREATE TYPE "public"."enum_site_settings_section_styles_body_font" AS ENUM('hanken', 'inter', 'heading', 'system', 'serif', 'mono', 'devanagari', 'custom', 'alt');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_section_styles_body_weight') THEN
    CREATE TYPE "public"."enum_site_settings_section_styles_body_weight" AS ENUM('300', '400', '500', '600', '700', '800');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_section_styles_kicker_font') THEN
    CREATE TYPE "public"."enum_site_settings_section_styles_kicker_font" AS ENUM('hanken', 'inter', 'heading', 'system', 'serif', 'mono', 'devanagari', 'custom', 'alt');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_section_styles_kicker_transform') THEN
    CREATE TYPE "public"."enum_site_settings_section_styles_kicker_transform" AS ENUM('none', 'uppercase', 'lowercase', 'capitalize');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_section_styles_align') THEN
    CREATE TYPE "public"."enum_site_settings_section_styles_align" AS ENUM('left', 'center', 'right');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_typography_heading_font') THEN
    CREATE TYPE "public"."enum_site_settings_typography_heading_font" AS ENUM('hanken', 'inter', 'heading', 'system', 'serif', 'mono', 'devanagari', 'custom', 'alt');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_typography_body_font') THEN
    CREATE TYPE "public"."enum_site_settings_typography_body_font" AS ENUM('hanken', 'inter', 'heading', 'system', 'serif', 'mono', 'devanagari', 'custom', 'alt');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_typography_heading_weight') THEN
    CREATE TYPE "public"."enum_site_settings_typography_heading_weight" AS ENUM('300', '400', '500', '600', '700', '800');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_site_settings_typography_kicker_case') THEN
    CREATE TYPE "public"."enum_site_settings_typography_kicker_case" AS ENUM('none', 'uppercase', 'lowercase', 'capitalize');
  END IF;
END $$;

-- ------------------------------------------------------- one row per band

CREATE TABLE IF NOT EXISTS "site_settings_section_styles" (
  "_order"                 integer NOT NULL,
  "_parent_id"             integer NOT NULL,
  "id"                     varchar PRIMARY KEY NOT NULL,
  "area"                   "enum_site_settings_section_styles_area" NOT NULL,
  "heading_font"           "enum_site_settings_section_styles_heading_font",
  "heading_size"           numeric,
  "heading_weight"         "enum_site_settings_section_styles_heading_weight",
  "heading_line_height"    numeric,
  "heading_letter_spacing" numeric,
  "heading_transform"      "enum_site_settings_section_styles_heading_transform",
  "heading_color"          varchar,
  "body_font"              "enum_site_settings_section_styles_body_font",
  "body_size"              numeric,
  "body_weight"            "enum_site_settings_section_styles_body_weight",
  "body_line_height"       numeric,
  "body_color"             varchar,
  "kicker_font"            "enum_site_settings_section_styles_kicker_font",
  "kicker_size"            numeric,
  "kicker_transform"       "enum_site_settings_section_styles_kicker_transform",
  "kicker_color"           varchar,
  "action_size"            numeric,
  "align"                  "enum_site_settings_section_styles_align",
  "background"             varchar,
  "padding_top"            numeric,
  "padding_bottom"         numeric,
  "hide"                   boolean
);

DO $$ BEGIN
  ALTER TABLE "site_settings_section_styles"
    ADD CONSTRAINT "site_settings_section_styles_parent_id_fk"
    FOREIGN KEY ("_parent_id") REFERENCES "public"."site_settings"("id")
    ON DELETE cascade ON UPDATE no action;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "site_settings_section_styles_order_idx"
  ON "site_settings_section_styles" USING btree ("_order");
CREATE INDEX IF NOT EXISTS "site_settings_section_styles_parent_id_idx"
  ON "site_settings_section_styles" USING btree ("_parent_id");

-- ------------------------------------------------ the site-wide settings

ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "seo_keywords"                     varchar;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "seo_twitter_handle"               varchar;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "seo_google_verification"          varchar;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "seo_bing_verification"            varchar;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "seo_analytics_id"                 varchar;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "seo_noindex"                      boolean;

ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "typography_heading_font"          "enum_site_settings_typography_heading_font";
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "typography_body_font"             "enum_site_settings_typography_body_font";
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "typography_base_size"             numeric;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "typography_scale"                 numeric;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "typography_body_line_height"      numeric;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "typography_heading_weight"        "enum_site_settings_typography_heading_weight";
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "typography_heading_letter_spacing" numeric;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "typography_kicker_case"           "enum_site_settings_typography_kicker_case";
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "typography_custom_font_family"    varchar;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "typography_custom_font_url"       varchar;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "typography_alt_font_family"       varchar;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "typography_alt_font_url"          varchar;

ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "layout_container_width"           numeric;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "layout_section_spacing"           numeric;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "layout_card_gap"                  numeric;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "layout_radius"                    numeric;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "layout_image_radius"              numeric;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "layout_button_radius"             numeric;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "layout_shadow"                    numeric;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "layout_sticky_header"             boolean;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "layout_smooth_scroll"             boolean DEFAULT true;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "layout_reduce_motion"             boolean;
ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "layout_underline_links"           boolean;

ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS "custom_css"                       varchar;

-- --------------------------------------------------- row level security
-- Every table in this database has row level security on and the Supabase
-- browser roles revoked, so nothing reads or writes around Payload's own access
-- rules. A new table has to do the same, or it would be the one way in.

ALTER TABLE "public"."site_settings_section_styles" ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'anon') THEN
    REVOKE ALL ON TABLE "public"."site_settings_section_styles" FROM "anon";
  END IF;
  IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'authenticated') THEN
    REVOKE ALL ON TABLE "public"."site_settings_section_styles" FROM "authenticated";
  END IF;
END $$;

-- Tell Payload this is done, so the next deploy does not repeat it.
INSERT INTO "payload_migrations" ("name", "batch")
SELECT '20260912_090000_site_settings_typography',
       (SELECT COALESCE(MAX("batch"), 0) + 1 FROM "payload_migrations")
WHERE NOT EXISTS (
  SELECT 1 FROM "payload_migrations"
  WHERE "name" = '20260912_090000_site_settings_typography'
);

COMMIT;

-- Check it worked: the new columns should all be listed, and the new table
-- should exist with row level security on.
-- SELECT column_name FROM information_schema.columns
--  WHERE table_name = 'site_settings' AND column_name LIKE 'typography%' ORDER BY column_name;
-- SELECT relname, relrowsecurity FROM pg_class WHERE relname = 'site_settings_section_styles';
