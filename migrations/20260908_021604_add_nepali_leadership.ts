import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_leadership_messages" ADD COLUMN "role_ne" varchar;
  ALTER TABLE "homepage_leadership_messages" ADD COLUMN "name_ne" varchar;
  ALTER TABLE "homepage_leadership_messages" ADD COLUMN "heading_ne" varchar;
  ALTER TABLE "homepage_leadership_messages" ADD COLUMN "message_ne" varchar;
  ALTER TABLE "homepage" ADD COLUMN "leadership_kicker_ne" varchar;
  ALTER TABLE "homepage" ADD COLUMN "leadership_heading_ne" varchar;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "homepage_leadership_messages" DROP COLUMN "role_ne";
  ALTER TABLE "homepage_leadership_messages" DROP COLUMN "name_ne";
  ALTER TABLE "homepage_leadership_messages" DROP COLUMN "heading_ne";
  ALTER TABLE "homepage_leadership_messages" DROP COLUMN "message_ne";
  ALTER TABLE "homepage" DROP COLUMN "leadership_kicker_ne";
  ALTER TABLE "homepage" DROP COLUMN "leadership_heading_ne";`)
}
