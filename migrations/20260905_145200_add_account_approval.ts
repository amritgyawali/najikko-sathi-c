import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" ADD COLUMN "approved" boolean DEFAULT false;`)

  // Every account that already exists was created by an administrator, before
  // sign-up existed. Approve them, or the new login check would lock out the
  // very people who own the site.
  await db.execute(sql`
   UPDATE "users" SET "approved" = true WHERE "approved" IS NOT TRUE;`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "users" DROP COLUMN "approved";`)
}
