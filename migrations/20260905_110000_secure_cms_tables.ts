import { type MigrateUpArgs, type MigrateDownArgs, sql } from "@payloadcms/db-postgres";

// Only tables owned by this CMS; other Supabase applications are unaffected.
const tables = [
  "_offers_v",
  "_pages_v",
  "_pages_v_blocks_card_grid",
  "_pages_v_blocks_card_grid_cards",
  "_pages_v_blocks_cta",
  "_pages_v_blocks_gallery",
  "_pages_v_blocks_gallery_images",
  "_pages_v_blocks_hero",
  "_pages_v_blocks_hero_actions",
  "_pages_v_blocks_offers_block",
  "_pages_v_blocks_posts_block",
  "_pages_v_blocks_reviews_block",
  "_pages_v_blocks_rich_text",
  "_posts_v",
  "_posts_v_version_tags",
  "_services_v",
  "_services_v_version_deliverables",
  "_services_v_version_faq",
  "_services_v_version_steps",
  "announcement",
  "appearance",
  "enquiries",
  "faqs",
  "footer",
  "footer_groups",
  "footer_groups_links",
  "homepage",
  "homepage_about_capabilities",
  "homepage_brand_pillars",
  "homepage_sanchar_topics",
  "homepage_services",
  "media",
  "media_slots",
  "navigation",
  "navigation_items",
  "offers",
  "pages",
  "pages_blocks_card_grid",
  "pages_blocks_card_grid_cards",
  "pages_blocks_cta",
  "pages_blocks_gallery",
  "pages_blocks_gallery_images",
  "pages_blocks_hero",
  "pages_blocks_hero_actions",
  "pages_blocks_offers_block",
  "pages_blocks_posts_block",
  "pages_blocks_reviews_block",
  "pages_blocks_rich_text",
  "pageviews",
  "payload_kv",
  "payload_locked_documents",
  "payload_locked_documents_rels",
  "payload_migrations",
  "payload_preferences",
  "payload_preferences_rels",
  "posts",
  "posts_tags",
  "redirects",
  "reviews",
  "service_categories",
  "services",
  "services_deliverables",
  "services_faq",
  "services_steps",
  "site_settings",
  "site_settings_phones",
  "site_settings_social_links",
  "team",
  "users",
  "users_sessions"
];

export async function up({ db }: MigrateUpArgs): Promise<void> {
  for (const table of tables) {
    await db.execute(sql.raw(`ALTER TABLE "public"."${table}" ENABLE ROW LEVEL SECURITY`));
    // Payload connects as the table owner and enforces its collection access
    // rules. Supabase's browser API roles must not bypass those rules.
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
