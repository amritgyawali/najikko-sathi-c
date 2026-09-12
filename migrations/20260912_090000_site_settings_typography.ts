import { type MigrateUpArgs, type MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * Type, layout and search-engine details for the whole website, in Site
 * Settings - and a row per band for the parts that want their own.
 *
 * Three things arrive here:
 *
 * 1. **`site_settings_section_styles`**, a row per part of the website that has
 *    been given type of its own: a face, a size, a weight, a letter spacing, a
 *    colour and a case for its headings, its reading matter and its small
 *    labels, plus the band's own alignment, background and air. Thirty-four
 *    parts can be addressed - every section a page is made of, the header, the
 *    footer, the two strips above the page, and the whole site at once - and a
 *    part with no row here is drawn exactly as it was designed.
 * 2. **Site-wide type and layout**, as two groups of columns on `site_settings`:
 *    the faces, the base size, one percentage that makes every word on the site
 *    larger or smaller, and the page width, spacing, rounding, shadow and motion.
 * 3. **Search-engine details**: keywords, an X handle, the Google and Bing
 *    verification codes, a Google measurement id, and one switch that asks
 *    search engines to leave the whole site alone until it is ready.
 *
 * Every column is nullable with no default, because empty means "leave the
 * design alone". A site that never opens the new tabs renders precisely as it
 * did before this ran.
 *
 * Safe to run twice: enum types are created only if absent, columns use ADD
 * COLUMN IF NOT EXISTS, and the new table uses CREATE TABLE IF NOT EXISTS.
 */

/** The faces offered everywhere a face can be chosen (lib/typography.ts). */
const FONTS = "'hanken', 'inter', 'heading', 'system', 'serif', 'mono', 'devanagari', 'custom', 'alt'";
const WEIGHTS = "'300', '400', '500', '600', '700', '800'";
const CASES = "'none', 'uppercase', 'lowercase', 'capitalize'";
const AREAS = [
  "global",
  "header",
  "utility",
  "announcement",
  "footer",
  "pageHero",
  "prose",
  "identityStory",
  "featureCards",
  "processSteps",
  "faqSection",
  "serviceCards",
  "categoryBar",
  "categoryGroups",
  "mediaShowcase",
  "teamSection",
  "reviewsSection",
  "wellWishersSection",
  "partnerMarquee",
  "socialResponsibilitySection",
  "socialWorkSection",
  "contactDetails",
  "contactCta",
  "portalLinks",
  "postList",
  "offerList",
  "homeHero",
  "homeAbout",
  "leadershipSection",
  "productionBand",
  "sancharBand",
  "servicesBand",
  "searchSection",
  "signupSection",
]
  .map((area) => `'${area}'`)
  .join(", ");

/** `CREATE TYPE` has no `IF NOT EXISTS`, so each one is guarded by hand. */
const enums: [string, string][] = [
  ["enum_site_settings_section_styles_area", AREAS],
  ["enum_site_settings_section_styles_heading_font", FONTS],
  ["enum_site_settings_section_styles_heading_weight", WEIGHTS],
  ["enum_site_settings_section_styles_heading_transform", CASES],
  ["enum_site_settings_section_styles_body_font", FONTS],
  ["enum_site_settings_section_styles_body_weight", WEIGHTS],
  ["enum_site_settings_section_styles_kicker_font", FONTS],
  ["enum_site_settings_section_styles_kicker_transform", CASES],
  ["enum_site_settings_section_styles_align", "'left', 'center', 'right'"],
  ["enum_site_settings_typography_heading_font", FONTS],
  ["enum_site_settings_typography_body_font", FONTS],
  ["enum_site_settings_typography_heading_weight", WEIGHTS],
  ["enum_site_settings_typography_kicker_case", CASES],
];

/** The site-wide columns, as `name type` pairs on `site_settings`. */
const columns: string[] = [
  `"seo_keywords" varchar`,
  `"seo_twitter_handle" varchar`,
  `"seo_google_verification" varchar`,
  `"seo_bing_verification" varchar`,
  `"seo_analytics_id" varchar`,
  `"seo_noindex" boolean`,
  `"typography_heading_font" "enum_site_settings_typography_heading_font"`,
  `"typography_body_font" "enum_site_settings_typography_body_font"`,
  `"typography_base_size" numeric`,
  `"typography_scale" numeric`,
  `"typography_body_line_height" numeric`,
  `"typography_heading_weight" "enum_site_settings_typography_heading_weight"`,
  `"typography_heading_letter_spacing" numeric`,
  `"typography_kicker_case" "enum_site_settings_typography_kicker_case"`,
  `"typography_custom_font_family" varchar`,
  `"typography_custom_font_url" varchar`,
  `"typography_alt_font_family" varchar`,
  `"typography_alt_font_url" varchar`,
  `"layout_container_width" numeric`,
  `"layout_section_spacing" numeric`,
  `"layout_card_gap" numeric`,
  `"layout_radius" numeric`,
  `"layout_image_radius" numeric`,
  `"layout_button_radius" numeric`,
  `"layout_shadow" numeric`,
  `"layout_sticky_header" boolean`,
  `"layout_smooth_scroll" boolean DEFAULT true`,
  `"layout_reduce_motion" boolean`,
  `"layout_underline_links" boolean`,
  `"custom_css" varchar`,
];

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [name, values] of enums) {
    await db.execute(
      sql.raw(`
        DO $$ BEGIN
          IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = '${name}') THEN
            CREATE TYPE "public"."${name}" AS ENUM(${values});
          END IF;
        END $$;
      `),
    );
  }

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS "site_settings_section_styles" (
      "_order" integer NOT NULL,
      "_parent_id" integer NOT NULL,
      "id" varchar PRIMARY KEY NOT NULL,
      "area" "enum_site_settings_section_styles_area" NOT NULL,
      "heading_font" "enum_site_settings_section_styles_heading_font",
      "heading_size" numeric,
      "heading_weight" "enum_site_settings_section_styles_heading_weight",
      "heading_line_height" numeric,
      "heading_letter_spacing" numeric,
      "heading_transform" "enum_site_settings_section_styles_heading_transform",
      "heading_color" varchar,
      "body_font" "enum_site_settings_section_styles_body_font",
      "body_size" numeric,
      "body_weight" "enum_site_settings_section_styles_body_weight",
      "body_line_height" numeric,
      "body_color" varchar,
      "kicker_font" "enum_site_settings_section_styles_kicker_font",
      "kicker_size" numeric,
      "kicker_transform" "enum_site_settings_section_styles_kicker_transform",
      "kicker_color" varchar,
      "action_size" numeric,
      "align" "enum_site_settings_section_styles_align",
      "background" varchar,
      "padding_top" numeric,
      "padding_bottom" numeric,
      "hide" boolean
    );
  `);

  await db.execute(sql`
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
  `);

  for (const column of columns) {
    await db.execute(sql.raw(`ALTER TABLE "site_settings" ADD COLUMN IF NOT EXISTS ${column};`));
  }

  // Every table in this database has row level security on and the Supabase
  // browser roles revoked, so nothing can read or write around Payload's own
  // access rules (20260905_110000_secure_cms_tables). A new table has to do the
  // same, or it would be the one way in.
  await db.execute(
    sql.raw(`ALTER TABLE "public"."site_settings_section_styles" ENABLE ROW LEVEL SECURITY`),
  );
  for (const role of ["anon", "authenticated"]) {
    await db.execute(
      sql.raw(`
        DO $$ BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${role}') THEN
            REVOKE ALL ON TABLE "public"."site_settings_section_styles" FROM "${role}";
          END IF;
        END $$;
      `),
    );
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`DROP TABLE IF EXISTS "site_settings_section_styles" CASCADE;`);

  for (const column of columns) {
    const name = column.split('"')[1];
    await db.execute(sql.raw(`ALTER TABLE "site_settings" DROP COLUMN IF EXISTS "${name}";`));
  }

  for (const [name] of enums) {
    await db.execute(sql.raw(`DROP TYPE IF EXISTS "public"."${name}";`));
  }
}
