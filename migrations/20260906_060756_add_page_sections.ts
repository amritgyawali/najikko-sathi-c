import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-postgres'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
   CREATE TYPE "public"."enum_pages_blocks_prose_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum_pages_blocks_feature_cards_cards_icon" AS ENUM('camera', 'clapperboard', 'film', 'megaphone', 'newspaper', 'graduationCap', 'search', 'monitorSmartphone', 'speech', 'heartHandshake', 'bookOpen', 'users', 'userRoundPen', 'compass', 'calendarCheck', 'monitorPlay', 'radio', 'sparkles', 'layoutDashboard', 'smartphone', 'server', 'landmark', 'building2', 'globe2', 'mic2');
  CREATE TYPE "public"."enum_pages_blocks_feature_cards_style" AS ENUM('values', 'disciplines', 'topics', 'links');
  CREATE TYPE "public"."enum_pages_blocks_feature_cards_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum_pages_blocks_process_steps_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum_pages_blocks_faq_section_placement" AS ENUM('contact', 'services', 'training', 'production');
  CREATE TYPE "public"."enum_pages_blocks_faq_section_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum_pages_blocks_service_cards_source" AS ENUM('category', 'slugs', 'all');
  CREATE TYPE "public"."enum_pages_blocks_service_cards_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum_pages_kind" AS ENUM('route', 'custom');
  CREATE TYPE "public"."enum__pages_v_blocks_prose_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_cards_cards_icon" AS ENUM('camera', 'clapperboard', 'film', 'megaphone', 'newspaper', 'graduationCap', 'search', 'monitorSmartphone', 'speech', 'heartHandshake', 'bookOpen', 'users', 'userRoundPen', 'compass', 'calendarCheck', 'monitorPlay', 'radio', 'sparkles', 'layoutDashboard', 'smartphone', 'server', 'landmark', 'building2', 'globe2', 'mic2');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_cards_style" AS ENUM('values', 'disciplines', 'topics', 'links');
  CREATE TYPE "public"."enum__pages_v_blocks_feature_cards_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum__pages_v_blocks_process_steps_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_section_placement" AS ENUM('contact', 'services', 'training', 'production');
  CREATE TYPE "public"."enum__pages_v_blocks_faq_section_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum__pages_v_blocks_service_cards_source" AS ENUM('category', 'slugs', 'all');
  CREATE TYPE "public"."enum__pages_v_blocks_service_cards_tone" AS ENUM('plain', 'tinted');
  CREATE TYPE "public"."enum__pages_v_version_kind" AS ENUM('route', 'custom');
  CREATE TABLE "pages_blocks_page_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_external" boolean,
  	"category" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_prose_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_prose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"lead" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"tone" "enum_pages_blocks_prose_tone" DEFAULT 'plain',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_identity_story_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_identity_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"panel_quote" varchar,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"lead" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_cards_cards_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"icon" "enum_pages_blocks_feature_cards_cards_icon",
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_cards_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_feature_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"style" "enum_pages_blocks_feature_cards_style" DEFAULT 'values',
  	"tone" "enum_pages_blocks_feature_cards_tone" DEFAULT 'plain',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar
  );
  
  CREATE TABLE "pages_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"tone" "enum_pages_blocks_process_steps_tone" DEFAULT 'plain',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_section_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar
  );
  
  CREATE TABLE "pages_blocks_faq_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"placement" "enum_pages_blocks_faq_section_placement",
  	"tone" "enum_pages_blocks_faq_section_tone" DEFAULT 'plain',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_service_cards_slugs" (
  	"_order" integer NOT NULL,
  	"_parent_id" varchar NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"slug" varchar
  );
  
  CREATE TABLE "pages_blocks_service_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"source" "enum_pages_blocks_service_cards_source" DEFAULT 'category',
  	"category" varchar,
  	"tone" "enum_pages_blocks_service_cards_tone" DEFAULT 'plain',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_category_bar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"aria_label" varchar DEFAULT 'Service categories',
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_category_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_media_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"media_key" varchar,
  	"heading" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_team_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_social_responsibility_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"note" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"show_form" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_contact_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"service" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_portal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"body" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_post_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"limit" numeric DEFAULT 60,
  	"empty_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_offer_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"limit" numeric DEFAULT 40,
  	"empty_text" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_home_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"secondary_label" varchar,
  	"show_media_system" boolean DEFAULT true,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_home_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar,
  	"caption_title" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_leadership_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_production_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_sanchar_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_services_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_search_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "pages_blocks_signup_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" varchar PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_page_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"eyebrow" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"cta_label" varchar,
  	"cta_href" varchar,
  	"cta_external" boolean,
  	"category" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_prose_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_prose" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"lead" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"tone" "enum__pages_v_blocks_prose_tone" DEFAULT 'plain',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_identity_story_paragraphs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_identity_story" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"panel_quote" varchar,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"lead" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_cards_cards_points" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_cards_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"icon" "enum__pages_v_blocks_feature_cards_cards_icon",
  	"title" varchar,
  	"text" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_cards_chips" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_feature_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"style" "enum__pages_v_blocks_feature_cards_style" DEFAULT 'values',
  	"tone" "enum__pages_v_blocks_feature_cards_tone" DEFAULT 'plain',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"title" varchar,
  	"text" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_process_steps" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"tone" "enum__pages_v_blocks_process_steps_tone" DEFAULT 'plain',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_section_items" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"question" varchar,
  	"answer" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_faq_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"placement" "enum__pages_v_blocks_faq_section_placement",
  	"tone" "enum__pages_v_blocks_faq_section_tone" DEFAULT 'plain',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_cards_slugs" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"slug" varchar,
  	"_uuid" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_service_cards" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"source" "enum__pages_v_blocks_service_cards_source" DEFAULT 'category',
  	"category" varchar,
  	"tone" "enum__pages_v_blocks_service_cards_tone" DEFAULT 'plain',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_category_bar" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"aria_label" varchar DEFAULT 'Service categories',
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_category_groups" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_media_showcase" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"media_key" varchar,
  	"heading" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_team_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_social_responsibility_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_details" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"note" varchar,
  	"link_label" varchar,
  	"link_href" varchar,
  	"show_form" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_contact_cta" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"heading" varchar,
  	"description" varchar,
  	"service" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_portal_links" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"body" varchar,
  	"primary_label" varchar,
  	"primary_href" varchar,
  	"secondary_label" varchar,
  	"secondary_href" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_post_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"limit" numeric DEFAULT 60,
  	"empty_text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_offer_list" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"limit" numeric DEFAULT 40,
  	"empty_text" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_home_hero" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"secondary_label" varchar,
  	"show_media_system" boolean DEFAULT true,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_home_about" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"link_label" varchar,
  	"link_href" varchar,
  	"caption_title" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_leadership_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_production_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_sanchar_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_services_band" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_search_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"kicker" varchar,
  	"heading" varchar,
  	"description" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  CREATE TABLE "_pages_v_blocks_signup_section" (
  	"_order" integer NOT NULL,
  	"_parent_id" integer NOT NULL,
  	"_path" text NOT NULL,
  	"id" serial PRIMARY KEY NOT NULL,
  	"note" varchar,
  	"_uuid" varchar,
  	"block_name" varchar
  );
  
  ALTER TABLE "offers" ALTER COLUMN "cta_href" SET DEFAULT '/contact';
  ALTER TABLE "_offers_v" ALTER COLUMN "version_cta_href" SET DEFAULT '/contact';
  ALTER TABLE "homepage_services" ALTER COLUMN "href" SET DEFAULT '/production';
  ALTER TABLE "homepage" ALTER COLUMN "hero_cta_href" SET DEFAULT '/services';
  ALTER TABLE "navigation" ALTER COLUMN "cta_href" SET DEFAULT '/contact';
  ALTER TABLE "pages" ADD COLUMN "kind" "enum_pages_kind" DEFAULT 'custom';
  ALTER TABLE "pages" ADD COLUMN "path" varchar;
  ALTER TABLE "pages" ADD COLUMN "nav_order" numeric;
  ALTER TABLE "pages" ADD COLUMN "parent" varchar;
  ALTER TABLE "pages" ADD COLUMN "summary" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_kind" "enum__pages_v_version_kind" DEFAULT 'custom';
  ALTER TABLE "_pages_v" ADD COLUMN "version_path" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_nav_order" numeric;
  ALTER TABLE "_pages_v" ADD COLUMN "version_parent" varchar;
  ALTER TABLE "_pages_v" ADD COLUMN "version_summary" varchar;
  ALTER TABLE "pages_blocks_page_hero" ADD CONSTRAINT "pages_blocks_page_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_prose_paragraphs" ADD CONSTRAINT "pages_blocks_prose_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_prose"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_prose" ADD CONSTRAINT "pages_blocks_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_identity_story_paragraphs" ADD CONSTRAINT "pages_blocks_identity_story_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_identity_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_identity_story" ADD CONSTRAINT "pages_blocks_identity_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_cards_cards_points" ADD CONSTRAINT "pages_blocks_feature_cards_cards_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_cards_cards" ADD CONSTRAINT "pages_blocks_feature_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_cards_chips" ADD CONSTRAINT "pages_blocks_feature_cards_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_feature_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_feature_cards" ADD CONSTRAINT "pages_blocks_feature_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps_steps" ADD CONSTRAINT "pages_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_process_steps" ADD CONSTRAINT "pages_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_section_items" ADD CONSTRAINT "pages_blocks_faq_section_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_faq_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_faq_section" ADD CONSTRAINT "pages_blocks_faq_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_cards_slugs" ADD CONSTRAINT "pages_blocks_service_cards_slugs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages_blocks_service_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_service_cards" ADD CONSTRAINT "pages_blocks_service_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_category_bar" ADD CONSTRAINT "pages_blocks_category_bar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_category_groups" ADD CONSTRAINT "pages_blocks_category_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_media_showcase" ADD CONSTRAINT "pages_blocks_media_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_team_section" ADD CONSTRAINT "pages_blocks_team_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_social_responsibility_section" ADD CONSTRAINT "pages_blocks_social_responsibility_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_details" ADD CONSTRAINT "pages_blocks_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_contact_cta" ADD CONSTRAINT "pages_blocks_contact_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_portal_links" ADD CONSTRAINT "pages_blocks_portal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_post_list" ADD CONSTRAINT "pages_blocks_post_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_offer_list" ADD CONSTRAINT "pages_blocks_offer_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_hero" ADD CONSTRAINT "pages_blocks_home_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_home_about" ADD CONSTRAINT "pages_blocks_home_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_leadership_section" ADD CONSTRAINT "pages_blocks_leadership_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_production_band" ADD CONSTRAINT "pages_blocks_production_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_sanchar_band" ADD CONSTRAINT "pages_blocks_sanchar_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_services_band" ADD CONSTRAINT "pages_blocks_services_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_search_section" ADD CONSTRAINT "pages_blocks_search_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "pages_blocks_signup_section" ADD CONSTRAINT "pages_blocks_signup_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."pages"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_page_hero" ADD CONSTRAINT "_pages_v_blocks_page_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_prose_paragraphs" ADD CONSTRAINT "_pages_v_blocks_prose_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_prose"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_prose" ADD CONSTRAINT "_pages_v_blocks_prose_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_identity_story_paragraphs" ADD CONSTRAINT "_pages_v_blocks_identity_story_paragraphs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_identity_story"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_identity_story" ADD CONSTRAINT "_pages_v_blocks_identity_story_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_cards_cards_points" ADD CONSTRAINT "_pages_v_blocks_feature_cards_cards_points_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_cards_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_cards_cards" ADD CONSTRAINT "_pages_v_blocks_feature_cards_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_cards_chips" ADD CONSTRAINT "_pages_v_blocks_feature_cards_chips_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_feature_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_feature_cards" ADD CONSTRAINT "_pages_v_blocks_feature_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_process_steps"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_process_steps" ADD CONSTRAINT "_pages_v_blocks_process_steps_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_section_items" ADD CONSTRAINT "_pages_v_blocks_faq_section_items_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_faq_section"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_faq_section" ADD CONSTRAINT "_pages_v_blocks_faq_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_cards_slugs" ADD CONSTRAINT "_pages_v_blocks_service_cards_slugs_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v_blocks_service_cards"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_service_cards" ADD CONSTRAINT "_pages_v_blocks_service_cards_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_category_bar" ADD CONSTRAINT "_pages_v_blocks_category_bar_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_category_groups" ADD CONSTRAINT "_pages_v_blocks_category_groups_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_media_showcase" ADD CONSTRAINT "_pages_v_blocks_media_showcase_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_team_section" ADD CONSTRAINT "_pages_v_blocks_team_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_social_responsibility_section" ADD CONSTRAINT "_pages_v_blocks_social_responsibility_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_details" ADD CONSTRAINT "_pages_v_blocks_contact_details_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_contact_cta" ADD CONSTRAINT "_pages_v_blocks_contact_cta_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_portal_links" ADD CONSTRAINT "_pages_v_blocks_portal_links_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_post_list" ADD CONSTRAINT "_pages_v_blocks_post_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_offer_list" ADD CONSTRAINT "_pages_v_blocks_offer_list_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_hero" ADD CONSTRAINT "_pages_v_blocks_home_hero_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_home_about" ADD CONSTRAINT "_pages_v_blocks_home_about_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_leadership_section" ADD CONSTRAINT "_pages_v_blocks_leadership_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_production_band" ADD CONSTRAINT "_pages_v_blocks_production_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_sanchar_band" ADD CONSTRAINT "_pages_v_blocks_sanchar_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_services_band" ADD CONSTRAINT "_pages_v_blocks_services_band_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_search_section" ADD CONSTRAINT "_pages_v_blocks_search_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  ALTER TABLE "_pages_v_blocks_signup_section" ADD CONSTRAINT "_pages_v_blocks_signup_section_parent_id_fk" FOREIGN KEY ("_parent_id") REFERENCES "public"."_pages_v"("id") ON DELETE cascade ON UPDATE no action;
  CREATE INDEX "pages_blocks_page_hero_order_idx" ON "pages_blocks_page_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_page_hero_parent_id_idx" ON "pages_blocks_page_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_page_hero_path_idx" ON "pages_blocks_page_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_prose_paragraphs_order_idx" ON "pages_blocks_prose_paragraphs" USING btree ("_order");
  CREATE INDEX "pages_blocks_prose_paragraphs_parent_id_idx" ON "pages_blocks_prose_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_prose_order_idx" ON "pages_blocks_prose" USING btree ("_order");
  CREATE INDEX "pages_blocks_prose_parent_id_idx" ON "pages_blocks_prose" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_prose_path_idx" ON "pages_blocks_prose" USING btree ("_path");
  CREATE INDEX "pages_blocks_identity_story_paragraphs_order_idx" ON "pages_blocks_identity_story_paragraphs" USING btree ("_order");
  CREATE INDEX "pages_blocks_identity_story_paragraphs_parent_id_idx" ON "pages_blocks_identity_story_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_identity_story_order_idx" ON "pages_blocks_identity_story" USING btree ("_order");
  CREATE INDEX "pages_blocks_identity_story_parent_id_idx" ON "pages_blocks_identity_story" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_identity_story_path_idx" ON "pages_blocks_identity_story" USING btree ("_path");
  CREATE INDEX "pages_blocks_feature_cards_cards_points_order_idx" ON "pages_blocks_feature_cards_cards_points" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_cards_cards_points_parent_id_idx" ON "pages_blocks_feature_cards_cards_points" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_cards_cards_order_idx" ON "pages_blocks_feature_cards_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_cards_cards_parent_id_idx" ON "pages_blocks_feature_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_cards_chips_order_idx" ON "pages_blocks_feature_cards_chips" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_cards_chips_parent_id_idx" ON "pages_blocks_feature_cards_chips" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_cards_order_idx" ON "pages_blocks_feature_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_feature_cards_parent_id_idx" ON "pages_blocks_feature_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_feature_cards_path_idx" ON "pages_blocks_feature_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_process_steps_steps_order_idx" ON "pages_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_steps_parent_id_idx" ON "pages_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_steps_order_idx" ON "pages_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "pages_blocks_process_steps_parent_id_idx" ON "pages_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_process_steps_path_idx" ON "pages_blocks_process_steps" USING btree ("_path");
  CREATE INDEX "pages_blocks_faq_section_items_order_idx" ON "pages_blocks_faq_section_items" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_section_items_parent_id_idx" ON "pages_blocks_faq_section_items" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_section_order_idx" ON "pages_blocks_faq_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_faq_section_parent_id_idx" ON "pages_blocks_faq_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_faq_section_path_idx" ON "pages_blocks_faq_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_service_cards_slugs_order_idx" ON "pages_blocks_service_cards_slugs" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_cards_slugs_parent_id_idx" ON "pages_blocks_service_cards_slugs" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_cards_order_idx" ON "pages_blocks_service_cards" USING btree ("_order");
  CREATE INDEX "pages_blocks_service_cards_parent_id_idx" ON "pages_blocks_service_cards" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_service_cards_path_idx" ON "pages_blocks_service_cards" USING btree ("_path");
  CREATE INDEX "pages_blocks_category_bar_order_idx" ON "pages_blocks_category_bar" USING btree ("_order");
  CREATE INDEX "pages_blocks_category_bar_parent_id_idx" ON "pages_blocks_category_bar" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_category_bar_path_idx" ON "pages_blocks_category_bar" USING btree ("_path");
  CREATE INDEX "pages_blocks_category_groups_order_idx" ON "pages_blocks_category_groups" USING btree ("_order");
  CREATE INDEX "pages_blocks_category_groups_parent_id_idx" ON "pages_blocks_category_groups" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_category_groups_path_idx" ON "pages_blocks_category_groups" USING btree ("_path");
  CREATE INDEX "pages_blocks_media_showcase_order_idx" ON "pages_blocks_media_showcase" USING btree ("_order");
  CREATE INDEX "pages_blocks_media_showcase_parent_id_idx" ON "pages_blocks_media_showcase" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_media_showcase_path_idx" ON "pages_blocks_media_showcase" USING btree ("_path");
  CREATE INDEX "pages_blocks_team_section_order_idx" ON "pages_blocks_team_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_team_section_parent_id_idx" ON "pages_blocks_team_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_team_section_path_idx" ON "pages_blocks_team_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_social_responsibility_section_order_idx" ON "pages_blocks_social_responsibility_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_social_responsibility_section_parent_id_idx" ON "pages_blocks_social_responsibility_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_social_responsibility_section_path_idx" ON "pages_blocks_social_responsibility_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_details_order_idx" ON "pages_blocks_contact_details" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_details_parent_id_idx" ON "pages_blocks_contact_details" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_details_path_idx" ON "pages_blocks_contact_details" USING btree ("_path");
  CREATE INDEX "pages_blocks_contact_cta_order_idx" ON "pages_blocks_contact_cta" USING btree ("_order");
  CREATE INDEX "pages_blocks_contact_cta_parent_id_idx" ON "pages_blocks_contact_cta" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_contact_cta_path_idx" ON "pages_blocks_contact_cta" USING btree ("_path");
  CREATE INDEX "pages_blocks_portal_links_order_idx" ON "pages_blocks_portal_links" USING btree ("_order");
  CREATE INDEX "pages_blocks_portal_links_parent_id_idx" ON "pages_blocks_portal_links" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_portal_links_path_idx" ON "pages_blocks_portal_links" USING btree ("_path");
  CREATE INDEX "pages_blocks_post_list_order_idx" ON "pages_blocks_post_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_post_list_parent_id_idx" ON "pages_blocks_post_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_post_list_path_idx" ON "pages_blocks_post_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_offer_list_order_idx" ON "pages_blocks_offer_list" USING btree ("_order");
  CREATE INDEX "pages_blocks_offer_list_parent_id_idx" ON "pages_blocks_offer_list" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_offer_list_path_idx" ON "pages_blocks_offer_list" USING btree ("_path");
  CREATE INDEX "pages_blocks_home_hero_order_idx" ON "pages_blocks_home_hero" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_hero_parent_id_idx" ON "pages_blocks_home_hero" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_hero_path_idx" ON "pages_blocks_home_hero" USING btree ("_path");
  CREATE INDEX "pages_blocks_home_about_order_idx" ON "pages_blocks_home_about" USING btree ("_order");
  CREATE INDEX "pages_blocks_home_about_parent_id_idx" ON "pages_blocks_home_about" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_home_about_path_idx" ON "pages_blocks_home_about" USING btree ("_path");
  CREATE INDEX "pages_blocks_leadership_section_order_idx" ON "pages_blocks_leadership_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_leadership_section_parent_id_idx" ON "pages_blocks_leadership_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_leadership_section_path_idx" ON "pages_blocks_leadership_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_production_band_order_idx" ON "pages_blocks_production_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_production_band_parent_id_idx" ON "pages_blocks_production_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_production_band_path_idx" ON "pages_blocks_production_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_sanchar_band_order_idx" ON "pages_blocks_sanchar_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_sanchar_band_parent_id_idx" ON "pages_blocks_sanchar_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_sanchar_band_path_idx" ON "pages_blocks_sanchar_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_services_band_order_idx" ON "pages_blocks_services_band" USING btree ("_order");
  CREATE INDEX "pages_blocks_services_band_parent_id_idx" ON "pages_blocks_services_band" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_services_band_path_idx" ON "pages_blocks_services_band" USING btree ("_path");
  CREATE INDEX "pages_blocks_search_section_order_idx" ON "pages_blocks_search_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_search_section_parent_id_idx" ON "pages_blocks_search_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_search_section_path_idx" ON "pages_blocks_search_section" USING btree ("_path");
  CREATE INDEX "pages_blocks_signup_section_order_idx" ON "pages_blocks_signup_section" USING btree ("_order");
  CREATE INDEX "pages_blocks_signup_section_parent_id_idx" ON "pages_blocks_signup_section" USING btree ("_parent_id");
  CREATE INDEX "pages_blocks_signup_section_path_idx" ON "pages_blocks_signup_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_page_hero_order_idx" ON "_pages_v_blocks_page_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_page_hero_parent_id_idx" ON "_pages_v_blocks_page_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_page_hero_path_idx" ON "_pages_v_blocks_page_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_prose_paragraphs_order_idx" ON "_pages_v_blocks_prose_paragraphs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_prose_paragraphs_parent_id_idx" ON "_pages_v_blocks_prose_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_prose_order_idx" ON "_pages_v_blocks_prose" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_prose_parent_id_idx" ON "_pages_v_blocks_prose" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_prose_path_idx" ON "_pages_v_blocks_prose" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_identity_story_paragraphs_order_idx" ON "_pages_v_blocks_identity_story_paragraphs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_identity_story_paragraphs_parent_id_idx" ON "_pages_v_blocks_identity_story_paragraphs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_identity_story_order_idx" ON "_pages_v_blocks_identity_story" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_identity_story_parent_id_idx" ON "_pages_v_blocks_identity_story" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_identity_story_path_idx" ON "_pages_v_blocks_identity_story" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_feature_cards_cards_points_order_idx" ON "_pages_v_blocks_feature_cards_cards_points" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_cards_cards_points_parent_id_idx" ON "_pages_v_blocks_feature_cards_cards_points" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_cards_cards_order_idx" ON "_pages_v_blocks_feature_cards_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_cards_cards_parent_id_idx" ON "_pages_v_blocks_feature_cards_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_cards_chips_order_idx" ON "_pages_v_blocks_feature_cards_chips" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_cards_chips_parent_id_idx" ON "_pages_v_blocks_feature_cards_chips" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_cards_order_idx" ON "_pages_v_blocks_feature_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_feature_cards_parent_id_idx" ON "_pages_v_blocks_feature_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_feature_cards_path_idx" ON "_pages_v_blocks_feature_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_process_steps_steps_order_idx" ON "_pages_v_blocks_process_steps_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_steps_parent_id_idx" ON "_pages_v_blocks_process_steps_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_order_idx" ON "_pages_v_blocks_process_steps" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_process_steps_parent_id_idx" ON "_pages_v_blocks_process_steps" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_process_steps_path_idx" ON "_pages_v_blocks_process_steps" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_faq_section_items_order_idx" ON "_pages_v_blocks_faq_section_items" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_section_items_parent_id_idx" ON "_pages_v_blocks_faq_section_items" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_section_order_idx" ON "_pages_v_blocks_faq_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_faq_section_parent_id_idx" ON "_pages_v_blocks_faq_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_faq_section_path_idx" ON "_pages_v_blocks_faq_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_service_cards_slugs_order_idx" ON "_pages_v_blocks_service_cards_slugs" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_cards_slugs_parent_id_idx" ON "_pages_v_blocks_service_cards_slugs" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_cards_order_idx" ON "_pages_v_blocks_service_cards" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_service_cards_parent_id_idx" ON "_pages_v_blocks_service_cards" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_service_cards_path_idx" ON "_pages_v_blocks_service_cards" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_category_bar_order_idx" ON "_pages_v_blocks_category_bar" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_category_bar_parent_id_idx" ON "_pages_v_blocks_category_bar" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_category_bar_path_idx" ON "_pages_v_blocks_category_bar" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_category_groups_order_idx" ON "_pages_v_blocks_category_groups" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_category_groups_parent_id_idx" ON "_pages_v_blocks_category_groups" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_category_groups_path_idx" ON "_pages_v_blocks_category_groups" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_media_showcase_order_idx" ON "_pages_v_blocks_media_showcase" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_media_showcase_parent_id_idx" ON "_pages_v_blocks_media_showcase" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_media_showcase_path_idx" ON "_pages_v_blocks_media_showcase" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_team_section_order_idx" ON "_pages_v_blocks_team_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_team_section_parent_id_idx" ON "_pages_v_blocks_team_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_team_section_path_idx" ON "_pages_v_blocks_team_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_social_responsibility_section_order_idx" ON "_pages_v_blocks_social_responsibility_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_social_responsibility_section_parent_id_idx" ON "_pages_v_blocks_social_responsibility_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_social_responsibility_section_path_idx" ON "_pages_v_blocks_social_responsibility_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_details_order_idx" ON "_pages_v_blocks_contact_details" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_details_parent_id_idx" ON "_pages_v_blocks_contact_details" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_details_path_idx" ON "_pages_v_blocks_contact_details" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_contact_cta_order_idx" ON "_pages_v_blocks_contact_cta" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_contact_cta_parent_id_idx" ON "_pages_v_blocks_contact_cta" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_contact_cta_path_idx" ON "_pages_v_blocks_contact_cta" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_portal_links_order_idx" ON "_pages_v_blocks_portal_links" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_portal_links_parent_id_idx" ON "_pages_v_blocks_portal_links" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_portal_links_path_idx" ON "_pages_v_blocks_portal_links" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_post_list_order_idx" ON "_pages_v_blocks_post_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_post_list_parent_id_idx" ON "_pages_v_blocks_post_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_post_list_path_idx" ON "_pages_v_blocks_post_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_offer_list_order_idx" ON "_pages_v_blocks_offer_list" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_offer_list_parent_id_idx" ON "_pages_v_blocks_offer_list" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_offer_list_path_idx" ON "_pages_v_blocks_offer_list" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_home_hero_order_idx" ON "_pages_v_blocks_home_hero" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_home_hero_parent_id_idx" ON "_pages_v_blocks_home_hero" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_home_hero_path_idx" ON "_pages_v_blocks_home_hero" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_home_about_order_idx" ON "_pages_v_blocks_home_about" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_home_about_parent_id_idx" ON "_pages_v_blocks_home_about" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_home_about_path_idx" ON "_pages_v_blocks_home_about" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_leadership_section_order_idx" ON "_pages_v_blocks_leadership_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_leadership_section_parent_id_idx" ON "_pages_v_blocks_leadership_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_leadership_section_path_idx" ON "_pages_v_blocks_leadership_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_production_band_order_idx" ON "_pages_v_blocks_production_band" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_production_band_parent_id_idx" ON "_pages_v_blocks_production_band" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_production_band_path_idx" ON "_pages_v_blocks_production_band" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_sanchar_band_order_idx" ON "_pages_v_blocks_sanchar_band" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_sanchar_band_parent_id_idx" ON "_pages_v_blocks_sanchar_band" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_sanchar_band_path_idx" ON "_pages_v_blocks_sanchar_band" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_services_band_order_idx" ON "_pages_v_blocks_services_band" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_services_band_parent_id_idx" ON "_pages_v_blocks_services_band" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_services_band_path_idx" ON "_pages_v_blocks_services_band" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_search_section_order_idx" ON "_pages_v_blocks_search_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_search_section_parent_id_idx" ON "_pages_v_blocks_search_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_search_section_path_idx" ON "_pages_v_blocks_search_section" USING btree ("_path");
  CREATE INDEX "_pages_v_blocks_signup_section_order_idx" ON "_pages_v_blocks_signup_section" USING btree ("_order");
  CREATE INDEX "_pages_v_blocks_signup_section_parent_id_idx" ON "_pages_v_blocks_signup_section" USING btree ("_parent_id");
  CREATE INDEX "_pages_v_blocks_signup_section_path_idx" ON "_pages_v_blocks_signup_section" USING btree ("_path");
  CREATE INDEX "pages_kind_idx" ON "pages" USING btree ("kind");
  CREATE UNIQUE INDEX "pages_path_idx" ON "pages" USING btree ("path");
  CREATE INDEX "_pages_v_version_version_kind_idx" ON "_pages_v" USING btree ("version_kind");
  CREATE INDEX "_pages_v_version_version_path_idx" ON "_pages_v" USING btree ("version_path");`)
  // Pages built in the dashboard before this migration have no address stored.
  // The website now finds a page by its address, so fill it in from the slug.
  await db.execute(sql`
    UPDATE "pages" SET "path" = '/' || "slug" WHERE "path" IS NULL AND "slug" IS NOT NULL;
    UPDATE "_pages_v" SET "version_path" = '/' || "version_slug"
      WHERE "version_path" IS NULL AND "version_slug" IS NOT NULL;
  `)
}
export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.execute(sql`
   ALTER TABLE "pages_blocks_page_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_prose_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_prose" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_identity_story_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_identity_story" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_cards_cards_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_cards_chips" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_feature_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_process_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_section_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_faq_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_service_cards_slugs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_service_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_category_bar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_category_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_media_showcase" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_team_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_social_responsibility_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_contact_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_portal_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_post_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_offer_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_home_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_home_about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_leadership_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_production_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_sanchar_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_services_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_search_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "pages_blocks_signup_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_page_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_prose_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_prose" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_identity_story_paragraphs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_identity_story" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_cards_cards_points" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_cards_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_cards_chips" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_feature_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_process_steps_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_process_steps" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_section_items" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_faq_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_service_cards_slugs" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_service_cards" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_category_bar" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_category_groups" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_media_showcase" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_team_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_social_responsibility_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_details" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_contact_cta" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_portal_links" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_post_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_offer_list" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_home_hero" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_home_about" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_leadership_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_production_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_sanchar_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_services_band" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_search_section" DISABLE ROW LEVEL SECURITY;
  ALTER TABLE "_pages_v_blocks_signup_section" DISABLE ROW LEVEL SECURITY;
  DROP TABLE "pages_blocks_page_hero" CASCADE;
  DROP TABLE "pages_blocks_prose_paragraphs" CASCADE;
  DROP TABLE "pages_blocks_prose" CASCADE;
  DROP TABLE "pages_blocks_identity_story_paragraphs" CASCADE;
  DROP TABLE "pages_blocks_identity_story" CASCADE;
  DROP TABLE "pages_blocks_feature_cards_cards_points" CASCADE;
  DROP TABLE "pages_blocks_feature_cards_cards" CASCADE;
  DROP TABLE "pages_blocks_feature_cards_chips" CASCADE;
  DROP TABLE "pages_blocks_feature_cards" CASCADE;
  DROP TABLE "pages_blocks_process_steps_steps" CASCADE;
  DROP TABLE "pages_blocks_process_steps" CASCADE;
  DROP TABLE "pages_blocks_faq_section_items" CASCADE;
  DROP TABLE "pages_blocks_faq_section" CASCADE;
  DROP TABLE "pages_blocks_service_cards_slugs" CASCADE;
  DROP TABLE "pages_blocks_service_cards" CASCADE;
  DROP TABLE "pages_blocks_category_bar" CASCADE;
  DROP TABLE "pages_blocks_category_groups" CASCADE;
  DROP TABLE "pages_blocks_media_showcase" CASCADE;
  DROP TABLE "pages_blocks_team_section" CASCADE;
  DROP TABLE "pages_blocks_social_responsibility_section" CASCADE;
  DROP TABLE "pages_blocks_contact_details" CASCADE;
  DROP TABLE "pages_blocks_contact_cta" CASCADE;
  DROP TABLE "pages_blocks_portal_links" CASCADE;
  DROP TABLE "pages_blocks_post_list" CASCADE;
  DROP TABLE "pages_blocks_offer_list" CASCADE;
  DROP TABLE "pages_blocks_home_hero" CASCADE;
  DROP TABLE "pages_blocks_home_about" CASCADE;
  DROP TABLE "pages_blocks_leadership_section" CASCADE;
  DROP TABLE "pages_blocks_production_band" CASCADE;
  DROP TABLE "pages_blocks_sanchar_band" CASCADE;
  DROP TABLE "pages_blocks_services_band" CASCADE;
  DROP TABLE "pages_blocks_search_section" CASCADE;
  DROP TABLE "pages_blocks_signup_section" CASCADE;
  DROP TABLE "_pages_v_blocks_page_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_prose_paragraphs" CASCADE;
  DROP TABLE "_pages_v_blocks_prose" CASCADE;
  DROP TABLE "_pages_v_blocks_identity_story_paragraphs" CASCADE;
  DROP TABLE "_pages_v_blocks_identity_story" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_cards_cards_points" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_cards_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_cards_chips" CASCADE;
  DROP TABLE "_pages_v_blocks_feature_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_process_steps" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_section_items" CASCADE;
  DROP TABLE "_pages_v_blocks_faq_section" CASCADE;
  DROP TABLE "_pages_v_blocks_service_cards_slugs" CASCADE;
  DROP TABLE "_pages_v_blocks_service_cards" CASCADE;
  DROP TABLE "_pages_v_blocks_category_bar" CASCADE;
  DROP TABLE "_pages_v_blocks_category_groups" CASCADE;
  DROP TABLE "_pages_v_blocks_media_showcase" CASCADE;
  DROP TABLE "_pages_v_blocks_team_section" CASCADE;
  DROP TABLE "_pages_v_blocks_social_responsibility_section" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_details" CASCADE;
  DROP TABLE "_pages_v_blocks_contact_cta" CASCADE;
  DROP TABLE "_pages_v_blocks_portal_links" CASCADE;
  DROP TABLE "_pages_v_blocks_post_list" CASCADE;
  DROP TABLE "_pages_v_blocks_offer_list" CASCADE;
  DROP TABLE "_pages_v_blocks_home_hero" CASCADE;
  DROP TABLE "_pages_v_blocks_home_about" CASCADE;
  DROP TABLE "_pages_v_blocks_leadership_section" CASCADE;
  DROP TABLE "_pages_v_blocks_production_band" CASCADE;
  DROP TABLE "_pages_v_blocks_sanchar_band" CASCADE;
  DROP TABLE "_pages_v_blocks_services_band" CASCADE;
  DROP TABLE "_pages_v_blocks_search_section" CASCADE;
  DROP TABLE "_pages_v_blocks_signup_section" CASCADE;
  DROP INDEX "pages_kind_idx";
  DROP INDEX "pages_path_idx";
  DROP INDEX "_pages_v_version_version_kind_idx";
  DROP INDEX "_pages_v_version_version_path_idx";
  ALTER TABLE "offers" ALTER COLUMN "cta_href" SET DEFAULT '#contact';
  ALTER TABLE "_offers_v" ALTER COLUMN "version_cta_href" SET DEFAULT '#contact';
  ALTER TABLE "homepage_services" ALTER COLUMN "href" SET DEFAULT '#production';
  ALTER TABLE "homepage" ALTER COLUMN "hero_cta_href" SET DEFAULT '#services';
  ALTER TABLE "navigation" ALTER COLUMN "cta_href" SET DEFAULT '#contact';
  ALTER TABLE "pages" DROP COLUMN "kind";
  ALTER TABLE "pages" DROP COLUMN "path";
  ALTER TABLE "pages" DROP COLUMN "nav_order";
  ALTER TABLE "pages" DROP COLUMN "parent";
  ALTER TABLE "pages" DROP COLUMN "summary";
  ALTER TABLE "_pages_v" DROP COLUMN "version_kind";
  ALTER TABLE "_pages_v" DROP COLUMN "version_path";
  ALTER TABLE "_pages_v" DROP COLUMN "version_nav_order";
  ALTER TABLE "_pages_v" DROP COLUMN "version_parent";
  ALTER TABLE "_pages_v" DROP COLUMN "version_summary";
  DROP TYPE "public"."enum_pages_blocks_prose_tone";
  DROP TYPE "public"."enum_pages_blocks_feature_cards_cards_icon";
  DROP TYPE "public"."enum_pages_blocks_feature_cards_style";
  DROP TYPE "public"."enum_pages_blocks_feature_cards_tone";
  DROP TYPE "public"."enum_pages_blocks_process_steps_tone";
  DROP TYPE "public"."enum_pages_blocks_faq_section_placement";
  DROP TYPE "public"."enum_pages_blocks_faq_section_tone";
  DROP TYPE "public"."enum_pages_blocks_service_cards_source";
  DROP TYPE "public"."enum_pages_blocks_service_cards_tone";
  DROP TYPE "public"."enum_pages_kind";
  DROP TYPE "public"."enum__pages_v_blocks_prose_tone";
  DROP TYPE "public"."enum__pages_v_blocks_feature_cards_cards_icon";
  DROP TYPE "public"."enum__pages_v_blocks_feature_cards_style";
  DROP TYPE "public"."enum__pages_v_blocks_feature_cards_tone";
  DROP TYPE "public"."enum__pages_v_blocks_process_steps_tone";
  DROP TYPE "public"."enum__pages_v_blocks_faq_section_placement";
  DROP TYPE "public"."enum__pages_v_blocks_faq_section_tone";
  DROP TYPE "public"."enum__pages_v_blocks_service_cards_source";
  DROP TYPE "public"."enum__pages_v_blocks_service_cards_tone";
  DROP TYPE "public"."enum__pages_v_version_kind";`)
}
