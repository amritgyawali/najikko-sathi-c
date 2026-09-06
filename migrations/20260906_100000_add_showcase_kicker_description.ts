import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_media_showcase" ADD COLUMN "kicker" varchar;
  ALTER TABLE "pages_blocks_media_showcase" ADD COLUMN "description" varchar;
  ALTER TABLE "_pages_v_blocks_media_showcase" ADD COLUMN "kicker" varchar;
  ALTER TABLE "_pages_v_blocks_media_showcase" ADD COLUMN "description" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_media_showcase" DROP COLUMN "kicker";
  ALTER TABLE "pages_blocks_media_showcase" DROP COLUMN "description";
  ALTER TABLE "_pages_v_blocks_media_showcase" DROP COLUMN "kicker";
  ALTER TABLE "_pages_v_blocks_media_showcase" DROP COLUMN "description";`)
}
