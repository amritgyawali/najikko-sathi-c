import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Takes the photo & film band off the contact and services pages.
 *
 * The band ran on twelve pages and every service page, introducing itself with
 * the same label and the same sentence every time. Two of those pages had no
 * pictures to introduce:
 *
 * - /contact is a form, an address and a phone number. A gallery under them is
 *   filler.
 * - /services is a directory, and every service it lists carries its own band
 *   on its own page, so a band here showed the same kind of thing twice.
 *
 * lib/page-defaults.ts already drops both, which covers a fresh install and any
 * page whose document has been deleted. This is for the databases where the
 * pages were imported before that change and still carry the block.
 *
 * The band is deleted from the published pages and from their draft versions,
 * so a later "publish" cannot bring it back. The Page media rows behind the two
 * keys are removed only when nothing was ever uploaded into them - a row
 * holding someone's photograph is left alone rather than quietly destroyed, and
 * it is reachable in Content → Page media if they want it back.
 */

const FILLER_KEYS = ['contact', 'services']

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
    DELETE FROM "pages_blocks_media_showcase"
    WHERE "media_key" IN ('contact', 'services');
  `)
  await db.execute(sql`
    DELETE FROM "_pages_v_blocks_media_showcase"
    WHERE "media_key" IN ('contact', 'services');
  `)
  await db.execute(sql`
    DELETE FROM "media_slots"
    WHERE "key" IN ('contact', 'services')
      AND "image_id" IS NULL
      AND "video_file_id" IS NULL
      AND ("video_youtube_url" IS NULL OR "video_youtube_url" = '')
      AND ("video_src" IS NULL OR "video_src" = '');
  `)
}

/**
 * Reversing this puts the two bands back exactly as the pages shipped with
 * them. The Page media rows are recreated empty, which is the state a deleted
 * one was in.
 */
export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
    INSERT INTO "media_slots" ("key")
    SELECT unnest(ARRAY['contact', 'services'])
    ON CONFLICT DO NOTHING;
  `)
  await db.execute(sql`
    INSERT INTO "pages_blocks_media_showcase" ("_order", "_parent_id", "_path", "id", "media_key", "heading")
    SELECT
      COALESCE((SELECT MAX(b."_order") FROM "pages_blocks_media_showcase" b WHERE b."_parent_id" = p."id"), 0) + 1,
      p."id",
      'layout',
      gen_random_uuid()::text,
      CASE p."path" WHEN '/contact' THEN 'contact' ELSE 'services' END,
      CASE p."path" WHEN '/contact' THEN 'Visit Najikko Sathi' ELSE 'Our services' END
    FROM "pages" p
    WHERE p."path" IN ('/contact', '/services');
  `)
}

export { FILLER_KEYS }
