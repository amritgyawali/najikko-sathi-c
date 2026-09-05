import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Adds the leadership messages shown on the homepage and the social
 * responsibility entries shown on /our-work, and repoints the two service
 * categories whose anchors on the services page became pages of their own.
 */

// New tables get the same treatment as every other table this CMS owns:
// row-level security on, and no privileges for Supabase's browser API roles.
const newTables = [
  "social_responsibility",
  "social_responsibility_photos",
  "homepage_leadership_messages",
];

const secure = async (db: MigrateUpArgs["db"]) => {
  for (const table of newTables) {
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
};

// Social media handling and research used to be anchors on the services page.
const movedLinks: [string, string][] = [
  ["/services#social-media", "/social-media-handling"],
  ["/services#research", "/research"],
];

const repointLinks = async (db: MigrateUpArgs["db"], links: [string, string][]) => {
  for (const [from, to] of links) {
    await db.execute(sql.raw(`
      UPDATE "public"."service_categories" SET "href" = '${to}' WHERE "href" = '${from}';
      UPDATE "public"."footer_groups_links" SET "href" = '${to}' WHERE "href" = '${from}';
      UPDATE "public"."navigation_items" SET "href" = '${to}' WHERE "href" = '${from}';
    `));
  }
};

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_social_responsibility_status" AS ENUM('draft', 'published');
  CREATE TABLE "social_responsibility_photos" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"image_id" integer NOT NULL,
  	"caption" varchar
  );
  
  CREATE TABLE "social_responsibility" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar NOT NULL,
  	"summary" varchar,
  	"youtube_url" varchar,
  	"date" timestamp(3) with time zone,
  	"order" numeric DEFAULT 0,
  	"status" "enum_social_responsibility_status" DEFAULT 'draft' NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "homepage_leadership_messages" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"role" varchar NOT NULL,
  	"name" varchar NOT NULL,
  	"heading" varchar,
  	"message" varchar NOT NULL,
  	"photo_id" integer
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "social_responsibility_id" integer;
  ALTER TABLE "homepage" ADD COLUMN "leadership_kicker" varchar DEFAULT 'From our leadership';
  ALTER TABLE "homepage" ADD COLUMN "leadership_heading" varchar;
  ALTER TABLE "social_responsibility_photos" ADD CONSTRAINT "social_responsibility_photos_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "social_responsibility_photos" ADD CONSTRAINT "social_responsibility_photos_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."social_responsibility"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "homepage_leadership_messages" ADD CONSTRAINT "homepage_leadership_messages_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "homepage_leadership_messages" ADD CONSTRAINT "homepage_leadership_messages_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."homepage"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "social_responsibility_photos_order_idx" ON "social_responsibility_photos" USING btree ("_order");
  CREATE INDEX "social_responsibility_photos_parent_id_idx" ON "social_responsibility_photos" USING btree ("_parent_id");
  CREATE INDEX "social_responsibility_photos_image_idx" ON "social_responsibility_photos" USING btree ("image_id");
  CREATE INDEX "social_responsibility_status_idx" ON "social_responsibility" USING btree ("status");
  CREATE INDEX "social_responsibility_updated_at_idx" ON "social_responsibility" USING btree ("updated_at");
  CREATE INDEX "social_responsibility_created_at_idx" ON "social_responsibility" USING btree ("created_at");
  CREATE INDEX "homepage_leadership_messages_order_idx" ON "homepage_leadership_messages" USING btree ("_order");
  CREATE INDEX "homepage_leadership_messages_parent_id_idx" ON "homepage_leadership_messages" USING btree ("_parent_id");
  CREATE INDEX "homepage_leadership_messages_photo_idx" ON "homepage_leadership_messages" USING btree ("photo_id");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_social_responsibility_fk" FOREIGN KEY ("social_responsibility_id") REFERENCES "public"."social_responsibility"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_social_responsibility_id_idx" ON "payload_locked_documents_rels" USING btree ("social_responsibility_id");`)

  await secure(db);
  await repointLinks(db, movedLinks);
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await repointLinks(db, movedLinks.map(([from, to]) => [to, from] as [string, string]));

  await db.execute(sql`
   ALTER TABLE "social_responsibility_photos" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "social_responsibility" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "homepage_leadership_messages" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "social_responsibility_photos" CASCADE;
  DROP TABLE "social_responsibility" CASCADE;
  DROP TABLE "homepage_leadership_messages" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_social_responsibility_fk";
  
  DROP INDEX IF EXISTS "payload_locked_documents_rels_social_responsibility_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "social_responsibility_id";
  ALTER TABLE "homepage" DROP COLUMN "leadership_kicker";
  ALTER TABLE "homepage" DROP COLUMN "leadership_heading";
  DROP TYPE "public"."enum_social_responsibility_status";`)
}
