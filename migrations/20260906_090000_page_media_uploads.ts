import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Lets a Page media entry hold an uploaded film, a YouTube link and an
 * uploaded still image, rather than only the address of a file hosted
 * somewhere else.
 *
 * It also creates the empty entries themselves: one for every placeholder the
 * website draws, and one for every service page. An owner opening the
 * dashboard then finds a row waiting for each blue placeholder they can see on
 * the site, and only has to upload into it.
 */

/**
 * The placeholders the site draws that are not a service page. Written out
 * rather than imported from lib/site-map.ts: a migration has to keep doing what
 * it did the day it ran, whatever the site map says later.
 */
const placeholderKeys = [
  "home",
  "home-about",
  "services",
  "our-work",
  "contact",
  "about",
  "production",
  "production-band",
  "social-media-handling",
  "training",
  "research",
  "it",
  "advertisement",
  "right-sanchar",
];

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "media_slots" ADD COLUMN "video_file_id" integer;
  ALTER TABLE "media_slots" ADD COLUMN "video_youtube_url" varchar;
  ALTER TABLE "media_slots" ADD COLUMN "video_poster_image_id" integer;
  ALTER TABLE "media_slots" ADD CONSTRAINT "media_slots_video_file_id_media_id_fk" FOREIGN KEY ("video_file_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_slots" ADD CONSTRAINT "media_slots_video_poster_image_id_media_id_fk" FOREIGN KEY ("video_poster_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "media_slots_video_video_file_idx" ON "media_slots" USING btree ("video_file_id");
  CREATE INDEX "media_slots_video_video_poster_image_idx" ON "media_slots" USING btree ("video_poster_image_id");`)

  // An entry per placeholder, and one per service page, left empty. The unique
  // key means re-running this cannot duplicate anything an editor already has.
  const values = placeholderKeys.map((key) => `('${key}', now(), now())`).join(", ");
  await db.execute(sql.raw(`
    INSERT INTO "public"."media_slots" ("key", "updated_at", "created_at")
    VALUES ${values}
    ON CONFLICT ("key") DO NOTHING;

    INSERT INTO "public"."media_slots" ("key", "updated_at", "created_at")
    SELECT "slug", now(), now() FROM "public"."services" WHERE "slug" IS NOT NULL
    ON CONFLICT ("key") DO NOTHING;
  `))
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // The entries themselves are left alone: dropping them would throw away the
  // photographs an editor has since attached to them.
  await db.execute(sql`
   ALTER TABLE "media_slots" DROP CONSTRAINT IF EXISTS "media_slots_video_file_id_media_id_fk";
  ALTER TABLE "media_slots" DROP CONSTRAINT IF EXISTS "media_slots_video_poster_image_id_media_id_fk";
  DROP INDEX IF EXISTS "media_slots_video_video_file_idx";
  DROP INDEX IF EXISTS "media_slots_video_video_poster_image_idx";
  ALTER TABLE "media_slots" DROP COLUMN "video_file_id";
  ALTER TABLE "media_slots" DROP COLUMN "video_youtube_url";
  ALTER TABLE "media_slots" DROP COLUMN "video_poster_image_id";`)
}
