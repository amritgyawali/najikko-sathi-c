import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * "Where this appears" on every kind of content.
 *
 * Posts, offers, reviews, questions, social responsibility entries, team
 * members and the file library each gain a list of the website's pages they are
 * published to, so an editor decides where a document goes from the same place
 * they write it. Each list is its own table, which is how Payload stores a
 * multiple-choice field.
 *
 * The questions collection already had a single placement. The next migration
 * (20260906_121500_move_faq_placements) copies those choices into the new list
 * and drops the old column, so nothing an editor has written moves.
 *
 * The questions band on a page could only point at four placements; it can now
 * point at any page, which is the widened enum below.
 */

/** The new tables, secured the same way every other table of this CMS is. */
const newTables = [
  "posts_placements",
  "_posts_v_version_placements",
  "offers_placements",
  "_offers_v_version_placements",
  "reviews_placements",
  "faqs_placements",
  "social_responsibility_placements",
  "team_placements",
  "media_placements",
];

/**
 * Row level security on, and Supabase's browser roles left without grants.
 * Payload connects as the owner and enforces the collection's own access rules;
 * nothing should be able to read or write around them.
 */
async function secure(db: MigrateUpArgs["db"]): Promise<void> {
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
}

export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_posts_placements" AS ENUM('home', 'services', 'our-work', 'contact', 'about', 'production', 'social-media-handling', 'training', 'research', 'it', 'advertisement', 'right-sanchar', 'posts', 'offers');
  CREATE TYPE "public"."enum__posts_v_version_placements" AS ENUM('home', 'services', 'our-work', 'contact', 'about', 'production', 'social-media-handling', 'training', 'research', 'it', 'advertisement', 'right-sanchar', 'posts', 'offers');
  CREATE TYPE "public"."enum_offers_placements" AS ENUM('home', 'services', 'our-work', 'contact', 'about', 'production', 'social-media-handling', 'training', 'research', 'it', 'advertisement', 'right-sanchar', 'posts', 'offers');
  CREATE TYPE "public"."enum__offers_v_version_placements" AS ENUM('home', 'services', 'our-work', 'contact', 'about', 'production', 'social-media-handling', 'training', 'research', 'it', 'advertisement', 'right-sanchar', 'posts', 'offers');
  CREATE TYPE "public"."enum_reviews_placements" AS ENUM('home', 'services', 'our-work', 'contact', 'about', 'production', 'social-media-handling', 'training', 'research', 'it', 'advertisement', 'right-sanchar', 'posts', 'offers');
  CREATE TYPE "public"."enum_faqs_placements" AS ENUM('home', 'services', 'our-work', 'contact', 'about', 'production', 'social-media-handling', 'training', 'research', 'it', 'advertisement', 'right-sanchar', 'posts', 'offers');
  CREATE TYPE "public"."enum_social_responsibility_placements" AS ENUM('home', 'services', 'our-work', 'contact', 'about', 'production', 'social-media-handling', 'training', 'research', 'it', 'advertisement', 'right-sanchar', 'posts', 'offers');
  CREATE TYPE "public"."enum_team_placements" AS ENUM('home', 'services', 'our-work', 'contact', 'about', 'production', 'social-media-handling', 'training', 'research', 'it', 'advertisement', 'right-sanchar', 'posts', 'offers');
  CREATE TYPE "public"."enum_media_placements" AS ENUM('home', 'services', 'our-work', 'contact', 'about', 'production', 'social-media-handling', 'training', 'research', 'it', 'advertisement', 'right-sanchar', 'posts', 'offers');
  CREATE TABLE "posts_placements" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_posts_placements",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_posts_v_version_placements" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__posts_v_version_placements",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "offers_placements" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_offers_placements",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "_offers_v_version_placements" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum__offers_v_version_placements",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "reviews_placements" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_reviews_placements",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "faqs_placements" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_faqs_placements",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "social_responsibility_placements" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_social_responsibility_placements",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "team_placements" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_team_placements",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "media_placements" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_media_placements",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  ALTER TABLE "pages_blocks_faq_section" ALTER COLUMN "placement" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_faq_section_placement";
  CREATE TYPE "public"."enum_pages_blocks_faq_section_placement" AS ENUM('home', 'services', 'our-work', 'contact', 'about', 'production', 'social-media-handling', 'training', 'research', 'it', 'advertisement', 'right-sanchar', 'posts', 'offers');
  ALTER TABLE "pages_blocks_faq_section" ALTER COLUMN "placement" SET DATA TYPE "public"."enum_pages_blocks_faq_section_placement" USING "placement"::"public"."enum_pages_blocks_faq_section_placement";
  ALTER TABLE "_pages_v_blocks_faq_section" ALTER COLUMN "placement" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_faq_section_placement";
  CREATE TYPE "public"."enum__pages_v_blocks_faq_section_placement" AS ENUM('home', 'services', 'our-work', 'contact', 'about', 'production', 'social-media-handling', 'training', 'research', 'it', 'advertisement', 'right-sanchar', 'posts', 'offers');
  ALTER TABLE "_pages_v_blocks_faq_section" ALTER COLUMN "placement" SET DATA TYPE "public"."enum__pages_v_blocks_faq_section_placement" USING "placement"::"public"."enum__pages_v_blocks_faq_section_placement";
  ALTER TABLE "posts_placements" ADD CONSTRAINT "posts_placements_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."posts"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_posts_v_version_placements" ADD CONSTRAINT "_posts_v_version_placements_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_posts_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "offers_placements" ADD CONSTRAINT "offers_placements_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."offers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_offers_v_version_placements" ADD CONSTRAINT "_offers_v_version_placements_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."_offers_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "reviews_placements" ADD CONSTRAINT "reviews_placements_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."reviews"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "faqs_placements" ADD CONSTRAINT "faqs_placements_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "social_responsibility_placements" ADD CONSTRAINT "social_responsibility_placements_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."social_responsibility"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "team_placements" ADD CONSTRAINT "team_placements_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "media_placements" ADD CONSTRAINT "media_placements_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."media"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "posts_placements_order_idx" ON "posts_placements" USING btree ("order");
  CREATE INDEX "posts_placements_parent_idx" ON "posts_placements" USING btree ("parent_id");
  CREATE INDEX "posts_placements_value_idx" ON "posts_placements" USING btree ("value");
  CREATE INDEX "_posts_v_version_placements_order_idx" ON "_posts_v_version_placements" USING btree ("order");
  CREATE INDEX "_posts_v_version_placements_parent_idx" ON "_posts_v_version_placements" USING btree ("parent_id");
  CREATE INDEX "_posts_v_version_placements_value_idx" ON "_posts_v_version_placements" USING btree ("value");
  CREATE INDEX "offers_placements_order_idx" ON "offers_placements" USING btree ("order");
  CREATE INDEX "offers_placements_parent_idx" ON "offers_placements" USING btree ("parent_id");
  CREATE INDEX "offers_placements_value_idx" ON "offers_placements" USING btree ("value");
  CREATE INDEX "_offers_v_version_placements_order_idx" ON "_offers_v_version_placements" USING btree ("order");
  CREATE INDEX "_offers_v_version_placements_parent_idx" ON "_offers_v_version_placements" USING btree ("parent_id");
  CREATE INDEX "_offers_v_version_placements_value_idx" ON "_offers_v_version_placements" USING btree ("value");
  CREATE INDEX "reviews_placements_order_idx" ON "reviews_placements" USING btree ("order");
  CREATE INDEX "reviews_placements_parent_idx" ON "reviews_placements" USING btree ("parent_id");
  CREATE INDEX "reviews_placements_value_idx" ON "reviews_placements" USING btree ("value");
  CREATE INDEX "faqs_placements_order_idx" ON "faqs_placements" USING btree ("order");
  CREATE INDEX "faqs_placements_parent_idx" ON "faqs_placements" USING btree ("parent_id");
  CREATE INDEX "faqs_placements_value_idx" ON "faqs_placements" USING btree ("value");
  CREATE INDEX "social_responsibility_placements_order_idx" ON "social_responsibility_placements" USING btree ("order");
  CREATE INDEX "social_responsibility_placements_parent_idx" ON "social_responsibility_placements" USING btree ("parent_id");
  CREATE INDEX "social_responsibility_placements_value_idx" ON "social_responsibility_placements" USING btree ("value");
  CREATE INDEX "team_placements_order_idx" ON "team_placements" USING btree ("order");
  CREATE INDEX "team_placements_parent_idx" ON "team_placements" USING btree ("parent_id");
  CREATE INDEX "team_placements_value_idx" ON "team_placements" USING btree ("value");
  CREATE INDEX "media_placements_order_idx" ON "media_placements" USING btree ("order");
  CREATE INDEX "media_placements_parent_idx" ON "media_placements" USING btree ("parent_id");
  CREATE INDEX "media_placements_value_idx" ON "media_placements" USING btree ("value");
`)

  await secure(db);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "posts_placements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_posts_v_version_placements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "offers_placements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_offers_v_version_placements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "reviews_placements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faqs_placements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "social_responsibility_placements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team_placements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_placements" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "posts_placements" CASCADE;
  DROP TABLE "_posts_v_version_placements" CASCADE;
  DROP TABLE "offers_placements" CASCADE;
  DROP TABLE "_offers_v_version_placements" CASCADE;
  DROP TABLE "reviews_placements" CASCADE;
  DROP TABLE "faqs_placements" CASCADE;
  DROP TABLE "social_responsibility_placements" CASCADE;
  DROP TABLE "team_placements" CASCADE;
  DROP TABLE "media_placements" CASCADE;
  ALTER TABLE "pages_blocks_faq_section" ALTER COLUMN "placement" SET DATA TYPE text;
  DROP TYPE "public"."enum_pages_blocks_faq_section_placement";
  CREATE TYPE "public"."enum_pages_blocks_faq_section_placement" AS ENUM('contact', 'services', 'training', 'production');
  ALTER TABLE "pages_blocks_faq_section" ALTER COLUMN "placement" SET DATA TYPE "public"."enum_pages_blocks_faq_section_placement" USING "placement"::"public"."enum_pages_blocks_faq_section_placement";
  ALTER TABLE "_pages_v_blocks_faq_section" ALTER COLUMN "placement" SET DATA TYPE text;
  DROP TYPE "public"."enum__pages_v_blocks_faq_section_placement";
  CREATE TYPE "public"."enum__pages_v_blocks_faq_section_placement" AS ENUM('contact', 'services', 'training', 'production');
  ALTER TABLE "_pages_v_blocks_faq_section" ALTER COLUMN "placement" SET DATA TYPE "public"."enum__pages_v_blocks_faq_section_placement" USING "placement"::"public"."enum__pages_v_blocks_faq_section_placement";
  DROP TYPE "public"."enum_posts_placements";
  DROP TYPE "public"."enum__posts_v_version_placements";
  DROP TYPE "public"."enum_offers_placements";
  DROP TYPE "public"."enum__offers_v_version_placements";
  DROP TYPE "public"."enum_reviews_placements";
  DROP TYPE "public"."enum_faqs_placements";
  DROP TYPE "public"."enum_social_responsibility_placements";
  DROP TYPE "public"."enum_team_placements";
  DROP TYPE "public"."enum_media_placements";`)
}
