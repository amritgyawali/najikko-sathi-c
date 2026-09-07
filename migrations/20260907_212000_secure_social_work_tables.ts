import { type MigrateUpArgs, type MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * The tables added with Social Work, the partner logo band and the mission
 * paragraphs, secured the same way every other table of this CMS already is
 * (20260905_110000_secure_cms_tables, 20260906_060900_secure_page_section_tables).
 *
 * Payload connects as the owner of these tables and enforces the access rules
 * written in the collection configs. Supabase's browser roles must not be able
 * to read or write around those rules, so row level security is on and their
 * grants are removed. No other application's tables are touched.
 */
const tables = [
  "_pages_v_blocks_partner_marquee",
  "_pages_v_blocks_partner_marquee_partners",
  "_pages_v_blocks_social_work_section",
  "homepage_about_paragraphs",
  "pages_blocks_partner_marquee",
  "pages_blocks_partner_marquee_partners",
  "pages_blocks_social_work_section",
  "social_work",
  "social_work_photos",
  "social_work_placements",
  "social_work_videos",
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
