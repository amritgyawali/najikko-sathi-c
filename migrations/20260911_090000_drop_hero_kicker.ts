import { type MigrateUpArgs, type MigrateDownArgs, sql } from "@payloadcms/db-postgres";

/**
 * The line above the homepage heading no longer has wording of its own.
 *
 * It used to read "Kathmandu-based media house" whenever the field was empty,
 * both in the database default and in the page itself, so clearing it in the
 * dashboard put it straight back. The default is dropped, and a kicker still
 * holding that original wording is emptied, so the line is gone until an
 * editor writes something new for it. Anything an editor wrote themselves is
 * left exactly as it is.
 */

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage" ALTER COLUMN "hero_kicker" DROP DEFAULT;
    UPDATE "homepage" SET "hero_kicker" = NULL WHERE "hero_kicker" = 'Kathmandu-based media house';
  `);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    ALTER TABLE "homepage" ALTER COLUMN "hero_kicker" SET DEFAULT 'Kathmandu-based media house';
  `);
}
