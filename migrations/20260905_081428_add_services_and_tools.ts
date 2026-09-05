import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_services_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum__services_v_version_status" AS ENUM('draft', 'published');
  CREATE TYPE "public"."enum_service_categories_icon" AS ENUM('clapperboard', 'megaphone', 'graduationCap', 'search', 'camera', 'newspaper');
  CREATE TYPE "public"."enum_faqs_placement" AS ENUM('contact', 'services', 'training', 'production');
  CREATE TYPE "public"."enum_enquiries_state" AS ENUM('new', 'in-progress', 'replied', 'closed', 'spam');
  CREATE TYPE "public"."enum_announcement_tone" AS ENUM('info', 'highlight', 'urgent');
  CREATE TABLE "services_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"item" varchar
  );
  
  CREATE TABLE "services_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar
  );
  
  CREATE TABLE "services_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "services" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"short_title" varchar,
  	"description" varchar,
  	"image_id" integer,
  	"intro" varchar,
  	"audience" varchar,
  	"preparation" varchar,
  	"meta_description" varchar,
  	"seo_title" varchar,
  	"seo_description" varchar,
  	"seo_image_id" integer,
  	"slug" varchar,
  	"status" "enum_services_status" DEFAULT 'draft',
  	"category_id" integer,
  	"order" numeric DEFAULT 0,
  	"featured" boolean,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"_status" "enum_services_status" DEFAULT 'draft'
  );
  
  CREATE TABLE "_services_v_version_deliverables" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"item" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"description" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v_version_faq" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_services_v" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"parent_id" integer,
  	"version_title" varchar,
  	"version_short_title" varchar,
  	"version_description" varchar,
  	"version_image_id" integer,
  	"version_intro" varchar,
  	"version_audience" varchar,
  	"version_preparation" varchar,
  	"version_meta_description" varchar,
  	"version_seo_title" varchar,
  	"version_seo_description" varchar,
  	"version_seo_image_id" integer,
  	"version_slug" varchar,
  	"version_status" "enum__services_v_version_status" DEFAULT 'draft',
  	"version_category_id" integer,
  	"version_order" numeric DEFAULT 0,
  	"version_featured" boolean,
  	"version_updated_at" timestamp(3) with time zone,
  	"version_created_at" timestamp(3) with time zone,
  	"version__status" "enum__services_v_version_status" DEFAULT 'draft',
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"latest" boolean
  );
  
  CREATE TABLE "service_categories" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"label" varchar NOT NULL,
  	"slug" varchar,
  	"title" varchar NOT NULL,
  	"description" varchar,
  	"href" varchar,
  	"icon" "enum_service_categories_icon" DEFAULT 'clapperboard',
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "faqs" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar NOT NULL,
  	"answer" varchar NOT NULL,
  	"placement" "enum_faqs_placement" DEFAULT 'contact' NOT NULL,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "team" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"role" varchar NOT NULL,
  	"bio" varchar,
  	"photo_id" integer,
  	"email" varchar,
  	"order" numeric DEFAULT 0,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "enquiries" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"name" varchar NOT NULL,
  	"email" varchar NOT NULL,
  	"phone" varchar,
  	"service" varchar,
  	"message" varchar NOT NULL,
  	"state" "enum_enquiries_state" DEFAULT 'new',
  	"assigned_to_id" integer,
  	"notes" varchar,
  	"source_path" varchar,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "media_slots" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"key" varchar NOT NULL,
  	"image_id" integer,
  	"caption" varchar,
  	"video_src" varchar,
  	"video_poster" varchar,
  	"video_title" varchar,
  	"video_description" varchar,
  	"video_transcript" varchar,
  	"video_duration" varchar,
  	"video_upload_date" timestamp(3) with time zone,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "redirects" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"from" varchar NOT NULL,
  	"to" varchar NOT NULL,
  	"permanent" boolean DEFAULT true,
  	"updated_at" timestamp(3) with time zone DEFAULT now() NOT NULL,
  	"created_at" timestamp(3) with time zone DEFAULT now() NOT NULL
  );
  
  CREATE TABLE "announcement" (
  	"id" serial PRIMARY KEY NOT NULL,
  	"enabled" boolean DEFAULT false,
  	"message" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"starts_at" timestamp(3) with time zone,
  	"ends_at" timestamp(3) with time zone,
  	"tone" "enum_announcement_tone" DEFAULT 'info',
  	"updated_at" timestamp(3) with time zone,
  	"created_at" timestamp(3) with time zone
  );
  
  ALTER TABLE "posts" ADD COLUMN "publish_at" timestamp(3) with time zone;
  ALTER TABLE "posts" ADD COLUMN "unpublish_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_posts_v" ADD COLUMN "version_unpublish_at" timestamp(3) with time zone;
  ALTER TABLE "offers" ADD COLUMN "publish_at" timestamp(3) with time zone;
  ALTER TABLE "offers" ADD COLUMN "unpublish_at" timestamp(3) with time zone;
  ALTER TABLE "_offers_v" ADD COLUMN "version_publish_at" timestamp(3) with time zone;
  ALTER TABLE "_offers_v" ADD COLUMN "version_unpublish_at" timestamp(3) with time zone;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "services_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "service_categories_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "faqs_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "team_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "enquiries_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "media_slots_id" integer;
  ALTER TABLE "payload_locked_documents_rels" ADD COLUMN "redirects_id" integer;
  ALTER TABLE "services_deliverables" ADD CONSTRAINT "services_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_steps" ADD CONSTRAINT "services_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services_faq" ADD CONSTRAINT "services_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_seo_image_id_media_id_fk" FOREIGN KEY ("seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "services" ADD CONSTRAINT "services_category_id_service_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."service_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v_version_deliverables" ADD CONSTRAINT "_services_v_version_deliverables_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_steps" ADD CONSTRAINT "_services_v_version_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v_version_faq" ADD CONSTRAINT "_services_v_version_faq_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_services_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_parent_id_services_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."services"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_image_id_media_id_fk" FOREIGN KEY ("version_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_seo_image_id_media_id_fk" FOREIGN KEY ("version_seo_image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "_services_v" ADD CONSTRAINT "_services_v_version_category_id_service_categories_id_fk" FOREIGN KEY ("version_category_id") REFERENCES "public"."service_categories"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "team" ADD CONSTRAINT "team_photo_id_media_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "enquiries" ADD CONSTRAINT "enquiries_assigned_to_id_users_id_fk" FOREIGN KEY ("assigned_to_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
  ALTER TABLE "media_slots" ADD CONSTRAINT "media_slots_image_id_media_id_fk" FOREIGN KEY ("image_id") REFERENCES "public"."media"("id") ON DELETE set null ON UPDATE no action;
  CREATE INDEX "services_deliverables_order_idx" ON "services_deliverables" USING btree ("_order");
  CREATE INDEX "services_deliverables_parent_id_idx" ON "services_deliverables" USING btree ("_parent_id");
  CREATE INDEX "services_steps_order_idx" ON "services_steps" USING btree ("_order");
  CREATE INDEX "services_steps_parent_id_idx" ON "services_steps" USING btree ("_parent_id");
  CREATE INDEX "services_faq_order_idx" ON "services_faq" USING btree ("_order");
  CREATE INDEX "services_faq_parent_id_idx" ON "services_faq" USING btree ("_parent_id");
  CREATE INDEX "services_image_idx" ON "services" USING btree ("image_id");
  CREATE INDEX "services_seo_seo_image_idx" ON "services" USING btree ("seo_image_id");
  CREATE UNIQUE INDEX "services_slug_idx" ON "services" USING btree ("slug");
  CREATE INDEX "services_status_idx" ON "services" USING btree ("status");
  CREATE INDEX "services_category_idx" ON "services" USING btree ("category_id");
  CREATE INDEX "services_updated_at_idx" ON "services" USING btree ("updated_at");
  CREATE INDEX "services_created_at_idx" ON "services" USING btree ("created_at");
  CREATE INDEX "services__status_idx" ON "services" USING btree ("_status");
  CREATE INDEX "_services_v_version_deliverables_order_idx" ON "_services_v_version_deliverables" USING btree ("_order");
  CREATE INDEX "_services_v_version_deliverables_parent_id_idx" ON "_services_v_version_deliverables" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_steps_order_idx" ON "_services_v_version_steps" USING btree ("_order");
  CREATE INDEX "_services_v_version_steps_parent_id_idx" ON "_services_v_version_steps" USING btree ("_parent_id");
  CREATE INDEX "_services_v_version_faq_order_idx" ON "_services_v_version_faq" USING btree ("_order");
  CREATE INDEX "_services_v_version_faq_parent_id_idx" ON "_services_v_version_faq" USING btree ("_parent_id");
  CREATE INDEX "_services_v_parent_idx" ON "_services_v" USING btree ("parent_id");
  CREATE INDEX "_services_v_version_version_image_idx" ON "_services_v" USING btree ("version_image_id");
  CREATE INDEX "_services_v_version_seo_version_seo_image_idx" ON "_services_v" USING btree ("version_seo_image_id");
  CREATE INDEX "_services_v_version_version_slug_idx" ON "_services_v" USING btree ("version_slug");
  CREATE INDEX "_services_v_version_version_status_idx" ON "_services_v" USING btree ("version_status");
  CREATE INDEX "_services_v_version_version_category_idx" ON "_services_v" USING btree ("version_category_id");
  CREATE INDEX "_services_v_version_version_updated_at_idx" ON "_services_v" USING btree ("version_updated_at");
  CREATE INDEX "_services_v_version_version_created_at_idx" ON "_services_v" USING btree ("version_created_at");
  CREATE INDEX "_services_v_version_version__status_idx" ON "_services_v" USING btree ("version__status");
  CREATE INDEX "_services_v_created_at_idx" ON "_services_v" USING btree ("created_at");
  CREATE INDEX "_services_v_updated_at_idx" ON "_services_v" USING btree ("updated_at");
  CREATE INDEX "_services_v_latest_idx" ON "_services_v" USING btree ("latest");
  CREATE UNIQUE INDEX "service_categories_slug_idx" ON "service_categories" USING btree ("slug");
  CREATE INDEX "service_categories_updated_at_idx" ON "service_categories" USING btree ("updated_at");
  CREATE INDEX "service_categories_created_at_idx" ON "service_categories" USING btree ("created_at");
  CREATE INDEX "faqs_placement_idx" ON "faqs" USING btree ("placement");
  CREATE INDEX "faqs_updated_at_idx" ON "faqs" USING btree ("updated_at");
  CREATE INDEX "faqs_created_at_idx" ON "faqs" USING btree ("created_at");
  CREATE INDEX "team_photo_idx" ON "team" USING btree ("photo_id");
  CREATE INDEX "team_updated_at_idx" ON "team" USING btree ("updated_at");
  CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");
  CREATE INDEX "enquiries_assigned_to_idx" ON "enquiries" USING btree ("assigned_to_id");
  CREATE INDEX "enquiries_updated_at_idx" ON "enquiries" USING btree ("updated_at");
  CREATE INDEX "enquiries_created_at_idx" ON "enquiries" USING btree ("created_at");
  CREATE UNIQUE INDEX "media_slots_key_idx" ON "media_slots" USING btree ("key");
  CREATE INDEX "media_slots_image_idx" ON "media_slots" USING btree ("image_id");
  CREATE INDEX "media_slots_updated_at_idx" ON "media_slots" USING btree ("updated_at");
  CREATE INDEX "media_slots_created_at_idx" ON "media_slots" USING btree ("created_at");
  CREATE UNIQUE INDEX "redirects_from_idx" ON "redirects" USING btree ("from");
  CREATE INDEX "redirects_updated_at_idx" ON "redirects" USING btree ("updated_at");
  CREATE INDEX "redirects_created_at_idx" ON "redirects" USING btree ("created_at");
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_services_fk" FOREIGN KEY ("services_id") REFERENCES "public"."services"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_service_categories_fk" FOREIGN KEY ("service_categories_id") REFERENCES "public"."service_categories"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_faqs_fk" FOREIGN KEY ("faqs_id") REFERENCES "public"."faqs"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_team_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_enquiries_fk" FOREIGN KEY ("enquiries_id") REFERENCES "public"."enquiries"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_media_slots_fk" FOREIGN KEY ("media_slots_id") REFERENCES "public"."media_slots"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "payload_locked_documents_rels" ADD CONSTRAINT "payload_locked_documents_rels_redirects_fk" FOREIGN KEY ("redirects_id") REFERENCES "public"."redirects"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "payload_locked_documents_rels_services_id_idx" ON "payload_locked_documents_rels" USING btree ("services_id");
  CREATE INDEX "payload_locked_documents_rels_service_categories_id_idx" ON "payload_locked_documents_rels" USING btree ("service_categories_id");
  CREATE INDEX "payload_locked_documents_rels_faqs_id_idx" ON "payload_locked_documents_rels" USING btree ("faqs_id");
  CREATE INDEX "payload_locked_documents_rels_team_id_idx" ON "payload_locked_documents_rels" USING btree ("team_id");
  CREATE INDEX "payload_locked_documents_rels_enquiries_id_idx" ON "payload_locked_documents_rels" USING btree ("enquiries_id");
  CREATE INDEX "payload_locked_documents_rels_media_slots_id_idx" ON "payload_locked_documents_rels" USING btree ("media_slots_id");
  CREATE INDEX "payload_locked_documents_rels_redirects_id_idx" ON "payload_locked_documents_rels" USING btree ("redirects_id");`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "services_deliverables" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "services" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_deliverables" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v_version_faq" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_services_v" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "service_categories" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "faqs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "team" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "enquiries" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "media_slots" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "redirects" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "announcement" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "services_deliverables" CASCADE;
  DROP TABLE "services_steps" CASCADE;
  DROP TABLE "services_faq" CASCADE;
  DROP TABLE "services" CASCADE;
  DROP TABLE "_services_v_version_deliverables" CASCADE;
  DROP TABLE "_services_v_version_steps" CASCADE;
  DROP TABLE "_services_v_version_faq" CASCADE;
  DROP TABLE "_services_v" CASCADE;
  DROP TABLE "service_categories" CASCADE;
  DROP TABLE "faqs" CASCADE;
  DROP TABLE "team" CASCADE;
  DROP TABLE "enquiries" CASCADE;
  DROP TABLE "media_slots" CASCADE;
  DROP TABLE "redirects" CASCADE;
  DROP TABLE "announcement" CASCADE;
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_services_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_service_categories_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_faqs_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_team_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_enquiries_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_media_slots_fk";
  
  ALTER TABLE "payload_locked_documents_rels" DROP CONSTRAINT "payload_locked_documents_rels_redirects_fk";
  
  DROP INDEX "payload_locked_documents_rels_services_id_idx";
  DROP INDEX "payload_locked_documents_rels_service_categories_id_idx";
  DROP INDEX "payload_locked_documents_rels_faqs_id_idx";
  DROP INDEX "payload_locked_documents_rels_team_id_idx";
  DROP INDEX "payload_locked_documents_rels_enquiries_id_idx";
  DROP INDEX "payload_locked_documents_rels_media_slots_id_idx";
  DROP INDEX "payload_locked_documents_rels_redirects_id_idx";
  ALTER TABLE "posts" DROP COLUMN "publish_at";
  ALTER TABLE "posts" DROP COLUMN "unpublish_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_publish_at";
  ALTER TABLE "_posts_v" DROP COLUMN "version_unpublish_at";
  ALTER TABLE "offers" DROP COLUMN "publish_at";
  ALTER TABLE "offers" DROP COLUMN "unpublish_at";
  ALTER TABLE "_offers_v" DROP COLUMN "version_publish_at";
  ALTER TABLE "_offers_v" DROP COLUMN "version_unpublish_at";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "services_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "service_categories_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "faqs_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "team_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "enquiries_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "media_slots_id";
  ALTER TABLE "payload_locked_documents_rels" DROP COLUMN "redirects_id";
  DROP TYPE "public"."enum_services_status";
  DROP TYPE "public"."enum__services_v_version_status";
  DROP TYPE "public"."enum_service_categories_icon";
  DROP TYPE "public"."enum_faqs_placement";
  DROP TYPE "public"."enum_enquiries_state";
  DROP TYPE "public"."enum_announcement_tone";`)
}
