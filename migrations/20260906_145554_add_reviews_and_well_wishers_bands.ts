import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

/**
 * Two more bands a page can carry, and the collection behind one of them.
 *
 * A page can now hold a band of client testimonials, drawn from Content →
 * Reviews, and a band of well-wishers - the advisers, patrons and friends of
 * the house - who get a collection of their own. Both are sections like any
 * other, so any page can carry them and an editor can move or drop them.
 *
 * The next migration (20260906_150000_home_reviews_and_well_wishers) puts both
 * on the front page and takes the hero's second button off it.
 */

/** The new tables, secured the same way every other table of this CMS is. */
const newTables = [
  "pages_blocks_reviews_section",
  "pages_blocks_well_wishers_section",
  "_pages_v_blocks_reviews_section",
  "_pages_v_blocks_well_wishers_section",
  "well_wishers",
  "well_wishers_placements",
];

/**
 * Row level security on, and Supabase's browser roles left without grants.
 * Payload connects as the owner and enforces the collection's own access rules.
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
   CREATE TYPE "public"."enum_pages_blocks_reviews_section_source" AS ENUM('featured', 'all');
  CREATE TYPE "public"."enum_pages_blocks_reviews_section_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum_pages_blocks_well_wishers_section_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum__pages_v_blocks_reviews_section_source" AS ENUM('featured', 'all');
  CREATE TYPE "public"."enum__pages_v_blocks_reviews_section_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum__pages_v_blocks_well_wishers_section_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum_well_wishers_placements" AS ENUM('home', 'services', 'our-work', 'contact', 'about', 'production', 'social-media-handling', 'training', 'research', 'it', 'advertisement', 'right-sanchar', 'posts', 'offers');
  CREATE TABLE "pages_blocks_reviews_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"source" "enum_pages_blocks_reviews_section_source" DEFAULT 'featured',
  	"limit" numeric DEFAULT 6,
  	"tone" "enum_pages_blocks_reviews_section_tone" DEFAULT 'plain',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_well_wishers_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"tone" "enum_pages_blocks_well_wishers_section_tone" DEFAULT 'tinted',
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_reviews_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"source" "enum__pages_v_blocks_reviews_section_source" DEFAULT 'featured',
  	"limit" numeric DEFAULT 6,
  	"tone" "enum__pages_v_blocks_reviews_section_tone" DEFAULT 'plain',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_well_wishers_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"tone" "enum__pages_v_blocks_well_wishers_section_tone" DEFAULT 'tinted',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "well_wishers_placements" (
  	"order" integer NOT NULL,
  	"parent_id" integer NOT NULL,
  	"value" "enum_well_wishers_placements",
  	"id" serial PRIMARY KEY NOT NULL
  );
  
  CREATE TABLE "well_wishers" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar,
  	"message" varchar,
  	"photo_id" integer,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "well_wishers_id" integer;
  ALTER TABLE "pages_blocks_reviews_section" ADD CONSTRAINT "pages_blocks_reviews_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_well_wishers_section" ADD CONSTRAINT "pages_blocks_well_wishers_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_reviews_section" ADD CONSTRAINT "_pages_v_blocks_reviews_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_well_wishers_section" ADD CONSTRAINT "_pages_v_blocks_well_wishers_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "well_wishers_placements" ADD CONSTRAINT "well_wishers_placements_parent_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."well_wishers"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "well_wishers" ADD CONSTRAINT "well_wishers_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "pages_blocks_reviews_section_order_idx" ON "pages_blocks_reviews_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_reviews_section_parent_id_idx" ON "pages_blocks_reviews_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_reviews_section_path_idx" ON "pages_blocks_reviews_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_well_wishers_section_order_idx" ON "pages_blocks_well_wishers_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_well_wishers_section_parent_id_idx" ON "pages_blocks_well_wishers_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_well_wishers_section_path_idx" ON "pages_blocks_well_wishers_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_reviews_section_order_idx" ON "_pages_v_blocks_reviews_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_reviews_section_parent_id_idx" ON "_pages_v_blocks_reviews_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_reviews_section_path_idx" ON "_pages_v_blocks_reviews_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_well_wishers_section_order_idx" ON "_pages_v_blocks_well_wishers_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_well_wishers_section_parent_id_idx" ON "_pages_v_blocks_well_wishers_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_well_wishers_section_path_idx" ON "_pages_v_blocks_well_wishers_section" USING btree ("_path");
  CREATE INDEX "well_wishers_placements_order_idx" ON "well_wishers_placements" USING btree ("order");
  CREATE INDEX "well_wishers_placements_parent_idx" ON "well_wishers_placements" USING btree ("parent_id");
  CREATE INDEX "well_wishers_placements_value_idx" ON "well_wishers_placements" USING btree ("value");
  CREATE INDEX "well_wishers_photo_idx" ON "well_wishers" USING btree ("photo_id");
  CREATE INDEX "well_wishers_updated_at_idx" ON "well_wishers" USING btree ("updated_at");
  CREATE INDEX "well_wishers_created_at_idx" ON "well_wishers" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_well_wishers_fk" FOREIGN KEY ("well_wishers_id") REFERENCES "public"."well_wishers"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_well_wishers_id_idx" ON "payload_locked_documents_rels" USING btree ("well_wishers_id");`)

  await secure(db);
}

export async function down({ db }: MigrateDownArgs): Promise<void> {
  // Dropping the well-wishers table takes its foreign key and index with it, so
  // the two lines that clean up after it have to tolerate finding them gone.
  await db.execute(sql`
   ALTER TABLE "pages_blocks_reviews_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_well_wishers_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_reviews_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_well_wishers_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "well_wishers_placements" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "well_wishers" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_reviews_section" CASCADE;
  DROP TABLE "pages_blocks_well_wishers_section" CASCADE;
  DROP TABLE "_pages_v_blocks_reviews_section" CASCADE;
  DROP TABLE "_pages_v_blocks_well_wishers_section" CASCADE;
  DROP TABLE "well_wishers_placements" CASCADE;
  DROP TABLE "well_wishers" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT IF EXISTS "payload_locked_documents_rels_well_wishers_fk";
  DROP INDEX IF EXISTS "payload_locked_documents_rels_well_wishers_id_idx";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "well_wishers_id";
  DROP TYPE "public"."enum_pages_blocks_reviews_section_source";
  DROP TYPE "public"."enum_pages_blocks_reviews_section_tone";
  DROP TYPE "public"."enum_pages_blocks_well_wishers_section_tone";
  DROP TYPE "public"."enum__pages_v_blocks_reviews_section_source";
  DROP TYPE "public"."enum__pages_v_blocks_reviews_section_tone";
  DROP TYPE "public"."enum__pages_v_blocks_well_wishers_section_tone";
  DROP TYPE "public"."enum_well_wishers_placements";`)
}
