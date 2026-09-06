import { type MigrateUpArgs, type MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * The section tables added with the page sections, secured the same way every
 * other table of this CMS already is (20260905_110000_secure_cms_tables).
 *
 * Payload connects as the owner of these tables and enforces the access rules
 * written in the collection configs. Supabase's browser roles must not be able
 * to read or write around those rules, so row level security is on and their
 * grants are removed. No other application's tables are touched.
 */
const tables = [
  "_pages_v_blocks_category_bar",
  "_pages_v_blocks_category_groups",
  "_pages_v_blocks_contact_cta",
  "_pages_v_blocks_contact_details",
  "_pages_v_blocks_faq_section",
  "_pages_v_blocks_faq_section_items",
  "_pages_v_blocks_feature_cards",
  "_pages_v_blocks_feature_cards_cards",
  "_pages_v_blocks_feature_cards_cards_points",
  "_pages_v_blocks_feature_cards_chips",
  "_pages_v_blocks_home_about",
  "_pages_v_blocks_home_hero",
  "_pages_v_blocks_identity_story",
  "_pages_v_blocks_identity_story_paragraphs",
  "_pages_v_blocks_leadership_section",
  "_pages_v_blocks_media_showcase",
  "_pages_v_blocks_offer_list",
  "_pages_v_blocks_page_hero",
  "_pages_v_blocks_portal_links",
  "_pages_v_blocks_post_list",
  "_pages_v_blocks_process_steps",
  "_pages_v_blocks_process_steps_steps",
  "_pages_v_blocks_production_band",
  "_pages_v_blocks_prose",
  "_pages_v_blocks_prose_paragraphs",
  "_pages_v_blocks_sanchar_band",
  "_pages_v_blocks_search_section",
  "_pages_v_blocks_service_cards",
  "_pages_v_blocks_service_cards_slugs",
  "_pages_v_blocks_services_band",
  "_pages_v_blocks_signup_section",
  "_pages_v_blocks_social_responsibility_section",
  "_pages_v_blocks_team_section",
  "pages_blocks_category_bar",
  "pages_blocks_category_groups",
  "pages_blocks_contact_cta",
  "pages_blocks_contact_details",
  "pages_blocks_faq_section",
  "pages_blocks_faq_section_items",
  "pages_blocks_feature_cards",
  "pages_blocks_feature_cards_cards",
  "pages_blocks_feature_cards_cards_points",
  "pages_blocks_feature_cards_chips",
  "pages_blocks_home_about",
  "pages_blocks_home_hero",
  "pages_blocks_identity_story",
  "pages_blocks_identity_story_paragraphs",
  "pages_blocks_leadership_section",
  "pages_blocks_media_showcase",
  "pages_blocks_offer_list",
  "pages_blocks_page_hero",
  "pages_blocks_portal_links",
  "pages_blocks_post_list",
  "pages_blocks_process_steps",
  "pages_blocks_process_steps_steps",
  "pages_blocks_production_band",
  "pages_blocks_prose",
  "pages_blocks_prose_paragraphs",
  "pages_blocks_sanchar_band",
  "pages_blocks_search_section",
  "pages_blocks_service_cards",
  "pages_blocks_service_cards_slugs",
  "pages_blocks_services_band",
  "pages_blocks_signup_section",
  "pages_blocks_social_responsibility_section",
  "pages_blocks_team_section",
];

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of tables) {
    await db.execute(sql.raw(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY`));
    for (const role of ["anon", "authenticated"]) {
      await db.execute(sql.raw(`
        DO $$ BEGIN
          IF EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '${role}') THEN
            REVOKE ALL ON TABLE "public"."${table}" FROM "${role}";
          END IF;
        END $$;
      `));
    }
  }
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  for (const table of tables) {
    await db.execute(sql.raw(`ALTER TABLE "public"."${table}" DISABLE ROW LEVEL SECURITY`));
  }
  // Deliberately do not grant public API privileges during a rollback. Previous
  // grants vary by provider and cannot be safely reconstructed here.
}
