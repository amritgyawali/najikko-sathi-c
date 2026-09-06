import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Moves the questions collection onto the shared "Where this appears" list.
 *
 * A question used to carry a single placement chosen from four pages. The
 * previous migration gave it the same list every other kind of content now has,
 * so the choice already made on each question is copied across before the old
 * column goes. Nothing an editor has written moves: the four keys - "contact",
 * "services", "training", "production" - mean the same pages in the new list,
 * and the questions bands that ask for them keep finding them.
 *
 * Rolling back takes the first page off each question's list and puts it back
 * in the old column, which is as much as one column can hold.
 */
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "faqs_placements" ("order", "parent_id", "value")
    SELECT 0, "id", "placement"::text::"public"."enum_faqs_placements"
    FROM "faqs"
    WHERE "placement" IS NOT NULL
      -- A question that already names its pages keeps them: rolling this
      -- migration back and forward again must not list a page twice.
      AND NOT EXISTS (SELECT 1 FROM "faqs_placements" WHERE "parent_id" = "faqs"."id");`)

  await db.execute(sql`
   DROP INDEX "faqs_placement_idx";
  ALTER TABLE "faqs" DROP COLUMN "placement";
  DROP TYPE "public"."enum_faqs_placement";`)
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_faqs_placement" AS ENUM('contact', 'services', 'training', 'production');
  ALTER TABLE "faqs" ADD COLUMN "placement" "enum_faqs_placement" DEFAULT 'contact' NOT NULL;
  CREATE INDEX "faqs_placement_idx" ON "faqs" USING btree ("placement");`)

  // The first page a question names, when the old column can still hold it.
  await db.execute(sql`
    UPDATE "faqs"
    SET "placement" = first."value"::text::"public"."enum_faqs_placement"
    FROM (
      SELECT DISTINCT ON ("parent_id") "parent_id", "value"
      FROM "faqs_placements"
      WHERE "value"::text IN ('contact', 'services', 'training', 'production')
      ORDER BY "parent_id", "order"
    ) AS first
    WHERE "faqs"."id" = first."parent_id";`)
}
