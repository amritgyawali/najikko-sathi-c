import { type MigrateUpArgs, type MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * A Nepali half for every line of copy in every section.
 *
 * The front page and the pages that grew out of it already had this
 * (20260910_120000_add_nepali_page_copy). This gives the same thing to the
 * sections a page is built from - every heading, kicker, paragraph, card,
 * step, question, button and caption in cms/sections.ts and cms/blocks.ts -
 * plus the reusable questions in Content -> FAQs.
 *
 * In the dashboard the two halves are drawn in one row, English on the left
 * and Nepali on the right, so a section is written once in two languages
 * rather than twice in two places.
 *
 * Every column is nullable and nothing is backfilled. An empty Nepali field
 * means exactly what it meant before this migration existed - show the
 * English, translated against the phrase book - so the website reads
 * identically until somebody types Nepali into one of them.
 */

/**
 * The section tables, named by their block. Each one exists twice: the live
 * table, and the "_pages_v_" copy holding a page's saved drafts.
 */
const BLOCKS: [block: string, columns: string[]][] = [
  ["page_hero", ["eyebrow_ne", "heading_ne", "description_ne", "cta_label_ne"]],
  ["prose", ["kicker_ne", "heading_ne", "description_ne", "lead_ne", "link_label_ne"]],
  ["prose_paragraphs", ["text_ne"]],
  ["identity_story", ["panel_quote_ne", "kicker_ne", "heading_ne", "description_ne", "lead_ne", "link_label_ne"]],
  ["identity_story_paragraphs", ["text_ne"]],
  ["feature_cards", ["kicker_ne", "heading_ne", "description_ne"]],
  ["feature_cards_cards", ["title_ne", "text_ne", "link_label_ne"]],
  ["feature_cards_cards_points", ["text_ne"]],
  ["feature_cards_chips", ["text_ne"]],
  ["process_steps", ["kicker_ne", "heading_ne", "description_ne"]],
  ["process_steps_steps", ["title_ne", "text_ne"]],
  ["faq_section", ["kicker_ne", "heading_ne", "description_ne"]],
  ["faq_section_items", ["question_ne", "answer_ne"]],
  ["service_cards", ["kicker_ne", "heading_ne", "description_ne"]],
  ["media_showcase", ["heading_ne", "kicker_ne", "description_ne"]],
  ["team_section", ["kicker_ne", "heading_ne", "description_ne"]],
  ["reviews_section", ["kicker_ne", "heading_ne", "description_ne"]],
  ["well_wishers_section", ["kicker_ne", "heading_ne", "description_ne"]],
  ["partner_marquee", ["heading_ne"]],
  ["partner_marquee_partners", ["name_ne"]],
  ["social_responsibility_section", ["kicker_ne", "heading_ne", "description_ne"]],
  ["social_work_section", ["kicker_ne", "heading_ne", "description_ne"]],
  ["contact_details", ["kicker_ne", "heading_ne", "description_ne", "note_ne", "link_label_ne"]],
  ["contact_cta", ["heading_ne", "description_ne"]],
  ["portal_links", ["kicker_ne", "heading_ne", "description_ne", "body_ne", "primary_label_ne", "secondary_label_ne"]],
  ["post_list", ["kicker_ne", "heading_ne", "description_ne", "empty_text_ne"]],
  ["offer_list", ["kicker_ne", "heading_ne", "description_ne", "empty_text_ne"]],
  ["home_hero", ["secondary_label_ne"]],
  ["home_about", ["link_label_ne", "caption_title_ne"]],
  ["search_section", ["kicker_ne", "heading_ne", "description_ne"]],
  ["signup_section", ["note_ne"]],
  ["hero", ["kicker_ne", "heading_ne", "subheading_ne"]],
  ["hero_actions", ["label_ne"]],
  ["rich_text", ["heading_ne"]],
  ["card_grid", ["kicker_ne", "heading_ne", "intro_ne"]],
  ["card_grid_cards", ["title_ne", "description_ne"]],
  ["gallery", ["heading_ne"]],
  ["gallery_images", ["caption_ne"]],
  ["cta", ["heading_ne", "body_ne", "button_label_ne"]],
  ["reviews_block", ["heading_ne"]],
  ["posts_block", ["heading_ne"]],
  ["offers_block", ["heading_ne"]],
];

/** Tables outside the page sections, named in full. */
const TABLES: [table: string, columns: string[]][] = [
  ["faqs", ["question_ne", "answer_ne"]],
];

/** Every table this migration touches, live and draft alike. */
const everyTable = (): [table: string, columns: string[]][] => [
  ...BLOCKS.flatMap(([block, columns]): [string, string[]][] => [
    [`pages_blocks_${block}`, columns],
    [`_pages_v_blocks_${block}`, columns],
  ]),
  ...TABLES,
];

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const [table, columns] of everyTable()) {
    for (const column of columns) {
      await db.execute(
        sql.raw(`ALTER TABLE "${table}" ADD COLUMN IF NOT EXISTS "${column}" varchar`),
      );
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const [table, columns] of everyTable()) {
    for (const column of columns) {
      await db.execute(sql.raw(`ALTER TABLE "${table}" DROP COLUMN IF EXISTS "${column}"`));
    }
  }
}
