import { type MigrateUpArgs, type MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * The Nepali half of every band in "Homepage & page copy".
 *
 * The leadership band already had one (20260908_021604_add_nepali_leadership).
 * This gives the same thing to the rest of the front page and to the three
 * pages that grew out of it: a hero, an introduction, a service grid, the
 * production band and the news portal band, each with an optional Nepali
 * counterpart of every line an editor writes.
 *
 * Every column is nullable and nothing is backfilled. An empty Nepali field
 * means exactly what it meant before this migration existed - show the English,
 * translated against the phrase book - so the website reads identically until
 * somebody types Nepali into one of them.
 */

/** The columns added to the single-row "homepage" table. */
const COLUMNS = [
  "hero_kicker_ne",
  "hero_heading_ne",
  "hero_body_ne",
  "hero_cta_label_ne",
  "about_eyebrow_ne",
  "about_heading_ne",
  "about_quote_ne",
  "about_body_ne",
  "about_body_secondary_ne",
  "services_kicker_ne",
  "services_heading_ne",
  "services_intro_ne",
  "production_chip_ne",
  "production_heading_ne",
  "production_body_ne",
  "production_cta_label_ne",
  "sanchar_heading_ne",
  "sanchar_intro_ne",
];

/** The keyword and paragraph lists, each row of which can be written twice. */
const ROWS: [table: string, column: string][] = [
  ["homepage_brand_pillars", "label_ne"],
  ["homepage_about_capabilities", "label_ne"],
  ["homepage_about_paragraphs", "text_ne"],
  ["homepage_services", "name_ne"],
  ["homepage_sanchar_topics", "label_ne"],
];

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const column of COLUMNS) {
    await db.execute(sql.raw(`ALTER TABLE "homepage" ADD COLUMN IF NOT EXISTS "${column}" varchar`));
  }
  for (const [table, column] of ROWS) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${column}" varchar`));
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const column of COLUMNS) {
    await db.execute(sql.raw(`ALTER TABLE "homepage" DROP COLUMN IF EXISTS "${column}"`));
  }
  for (const [table, column] of ROWS) {
    await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "${column}"`));
  }
}
