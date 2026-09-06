import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" ADD COLUMN "seo_noindex" boolean;
  ALTER TABLE "_pages_v" ADD COLUMN "version_seo_noindex" boolean;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages" DROP COLUMN "seo_noindex";
  ALTER TABLE "_pages_v" DROP COLUMN "version_seo_noindex";`)
}
