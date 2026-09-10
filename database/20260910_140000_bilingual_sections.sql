-- Every section written in two languages.
--
-- Mirrors migrations/20260910_140000_bilingual_sections.ts.
--
-- The front page and the pages that grew out of it already had a Nepali half
-- (20260910_120000_add_nepali_page_copy). This gives the same thing to the
-- sections a page is built from - every heading, kicker, paragraph, card, step,
-- question, button and caption - and to the reusable questions in
-- Content -> FAQs. In the dashboard the two halves are drawn in one row,
-- English on the left and Nepali on the right.
--
-- Each section is stored twice: the live table, and the "_pages_v_" copy
-- holding a page's saved drafts. Both get the columns.
--
-- Every column is nullable and nothing is backfilled. An empty Nepali field
-- means what it meant before this file existed - show the English, translated
-- against the phrase book - so the website reads identically until somebody
-- types Nepali into one of them.
--
-- Safe to run more than once.

BEGIN;

ALTER TABLE "pages_blocks_page_hero" ADD COLUMN IF NOT EXISTS "eyebrow_ne" varchar;
ALTER TABLE "pages_blocks_page_hero" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_page_hero" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "pages_blocks_page_hero" ADD COLUMN IF NOT EXISTS "cta_label_ne" varchar;
ALTER TABLE "_pages_v_blocks_page_hero" ADD COLUMN IF NOT EXISTS "eyebrow_ne" varchar;
ALTER TABLE "_pages_v_blocks_page_hero" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_page_hero" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_page_hero" ADD COLUMN IF NOT EXISTS "cta_label_ne" varchar;

ALTER TABLE "pages_blocks_prose" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_prose" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_prose" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "pages_blocks_prose" ADD COLUMN IF NOT EXISTS "lead_ne" varchar;
ALTER TABLE "pages_blocks_prose" ADD COLUMN IF NOT EXISTS "link_label_ne" varchar;
ALTER TABLE "_pages_v_blocks_prose" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_prose" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_prose" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_prose" ADD COLUMN IF NOT EXISTS "lead_ne" varchar;
ALTER TABLE "_pages_v_blocks_prose" ADD COLUMN IF NOT EXISTS "link_label_ne" varchar;

ALTER TABLE "pages_blocks_prose_paragraphs" ADD COLUMN IF NOT EXISTS "text_ne" varchar;
ALTER TABLE "_pages_v_blocks_prose_paragraphs" ADD COLUMN IF NOT EXISTS "text_ne" varchar;

ALTER TABLE "pages_blocks_identity_story" ADD COLUMN IF NOT EXISTS "panel_quote_ne" varchar;
ALTER TABLE "pages_blocks_identity_story" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_identity_story" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_identity_story" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "pages_blocks_identity_story" ADD COLUMN IF NOT EXISTS "lead_ne" varchar;
ALTER TABLE "pages_blocks_identity_story" ADD COLUMN IF NOT EXISTS "link_label_ne" varchar;
ALTER TABLE "_pages_v_blocks_identity_story" ADD COLUMN IF NOT EXISTS "panel_quote_ne" varchar;
ALTER TABLE "_pages_v_blocks_identity_story" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_identity_story" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_identity_story" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_identity_story" ADD COLUMN IF NOT EXISTS "lead_ne" varchar;
ALTER TABLE "_pages_v_blocks_identity_story" ADD COLUMN IF NOT EXISTS "link_label_ne" varchar;

ALTER TABLE "pages_blocks_identity_story_paragraphs" ADD COLUMN IF NOT EXISTS "text_ne" varchar;
ALTER TABLE "_pages_v_blocks_identity_story_paragraphs" ADD COLUMN IF NOT EXISTS "text_ne" varchar;

ALTER TABLE "pages_blocks_feature_cards" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_feature_cards" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_feature_cards" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_feature_cards" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_feature_cards" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_feature_cards" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_feature_cards_cards" ADD COLUMN IF NOT EXISTS "title_ne" varchar;
ALTER TABLE "pages_blocks_feature_cards_cards" ADD COLUMN IF NOT EXISTS "text_ne" varchar;
ALTER TABLE "pages_blocks_feature_cards_cards" ADD COLUMN IF NOT EXISTS "link_label_ne" varchar;
ALTER TABLE "_pages_v_blocks_feature_cards_cards" ADD COLUMN IF NOT EXISTS "title_ne" varchar;
ALTER TABLE "_pages_v_blocks_feature_cards_cards" ADD COLUMN IF NOT EXISTS "text_ne" varchar;
ALTER TABLE "_pages_v_blocks_feature_cards_cards" ADD COLUMN IF NOT EXISTS "link_label_ne" varchar;

ALTER TABLE "pages_blocks_feature_cards_cards_points" ADD COLUMN IF NOT EXISTS "text_ne" varchar;
ALTER TABLE "_pages_v_blocks_feature_cards_cards_points" ADD COLUMN IF NOT EXISTS "text_ne" varchar;

ALTER TABLE "pages_blocks_feature_cards_chips" ADD COLUMN IF NOT EXISTS "text_ne" varchar;
ALTER TABLE "_pages_v_blocks_feature_cards_chips" ADD COLUMN IF NOT EXISTS "text_ne" varchar;

ALTER TABLE "pages_blocks_process_steps" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_process_steps" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_process_steps" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_process_steps" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_process_steps" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_process_steps" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_process_steps_steps" ADD COLUMN IF NOT EXISTS "title_ne" varchar;
ALTER TABLE "pages_blocks_process_steps_steps" ADD COLUMN IF NOT EXISTS "text_ne" varchar;
ALTER TABLE "_pages_v_blocks_process_steps_steps" ADD COLUMN IF NOT EXISTS "title_ne" varchar;
ALTER TABLE "_pages_v_blocks_process_steps_steps" ADD COLUMN IF NOT EXISTS "text_ne" varchar;

ALTER TABLE "pages_blocks_faq_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_faq_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_faq_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_faq_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_faq_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_faq_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_faq_section_items" ADD COLUMN IF NOT EXISTS "question_ne" varchar;
ALTER TABLE "pages_blocks_faq_section_items" ADD COLUMN IF NOT EXISTS "answer_ne" varchar;
ALTER TABLE "_pages_v_blocks_faq_section_items" ADD COLUMN IF NOT EXISTS "question_ne" varchar;
ALTER TABLE "_pages_v_blocks_faq_section_items" ADD COLUMN IF NOT EXISTS "answer_ne" varchar;

ALTER TABLE "pages_blocks_service_cards" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_service_cards" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_service_cards" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_service_cards" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_service_cards" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_service_cards" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_media_showcase" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_media_showcase" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_media_showcase" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_media_showcase" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_media_showcase" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_media_showcase" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_team_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_team_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_team_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_team_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_team_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_team_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_reviews_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_reviews_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_reviews_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_reviews_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_reviews_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_reviews_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_well_wishers_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_well_wishers_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_well_wishers_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_well_wishers_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_well_wishers_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_well_wishers_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_partner_marquee" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_partner_marquee" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;

ALTER TABLE "pages_blocks_partner_marquee_partners" ADD COLUMN IF NOT EXISTS "name_ne" varchar;
ALTER TABLE "_pages_v_blocks_partner_marquee_partners" ADD COLUMN IF NOT EXISTS "name_ne" varchar;

ALTER TABLE "pages_blocks_social_responsibility_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_social_responsibility_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_social_responsibility_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_social_responsibility_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_social_responsibility_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_social_responsibility_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_social_work_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_social_work_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_social_work_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_social_work_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_social_work_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_social_work_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_contact_details" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_contact_details" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_contact_details" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "pages_blocks_contact_details" ADD COLUMN IF NOT EXISTS "note_ne" varchar;
ALTER TABLE "pages_blocks_contact_details" ADD COLUMN IF NOT EXISTS "link_label_ne" varchar;
ALTER TABLE "_pages_v_blocks_contact_details" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_contact_details" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_contact_details" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_contact_details" ADD COLUMN IF NOT EXISTS "note_ne" varchar;
ALTER TABLE "_pages_v_blocks_contact_details" ADD COLUMN IF NOT EXISTS "link_label_ne" varchar;

ALTER TABLE "pages_blocks_contact_cta" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_contact_cta" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_contact_cta" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_contact_cta" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_portal_links" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_portal_links" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_portal_links" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "pages_blocks_portal_links" ADD COLUMN IF NOT EXISTS "body_ne" varchar;
ALTER TABLE "pages_blocks_portal_links" ADD COLUMN IF NOT EXISTS "primary_label_ne" varchar;
ALTER TABLE "pages_blocks_portal_links" ADD COLUMN IF NOT EXISTS "secondary_label_ne" varchar;
ALTER TABLE "_pages_v_blocks_portal_links" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_portal_links" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_portal_links" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_portal_links" ADD COLUMN IF NOT EXISTS "body_ne" varchar;
ALTER TABLE "_pages_v_blocks_portal_links" ADD COLUMN IF NOT EXISTS "primary_label_ne" varchar;
ALTER TABLE "_pages_v_blocks_portal_links" ADD COLUMN IF NOT EXISTS "secondary_label_ne" varchar;

ALTER TABLE "pages_blocks_post_list" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_post_list" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_post_list" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "pages_blocks_post_list" ADD COLUMN IF NOT EXISTS "empty_text_ne" varchar;
ALTER TABLE "_pages_v_blocks_post_list" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_post_list" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_post_list" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_post_list" ADD COLUMN IF NOT EXISTS "empty_text_ne" varchar;

ALTER TABLE "pages_blocks_offer_list" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_offer_list" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_offer_list" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "pages_blocks_offer_list" ADD COLUMN IF NOT EXISTS "empty_text_ne" varchar;
ALTER TABLE "_pages_v_blocks_offer_list" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_offer_list" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_offer_list" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_offer_list" ADD COLUMN IF NOT EXISTS "empty_text_ne" varchar;

ALTER TABLE "pages_blocks_home_hero" ADD COLUMN IF NOT EXISTS "secondary_label_ne" varchar;
ALTER TABLE "_pages_v_blocks_home_hero" ADD COLUMN IF NOT EXISTS "secondary_label_ne" varchar;

ALTER TABLE "pages_blocks_home_about" ADD COLUMN IF NOT EXISTS "link_label_ne" varchar;
ALTER TABLE "pages_blocks_home_about" ADD COLUMN IF NOT EXISTS "caption_title_ne" varchar;
ALTER TABLE "_pages_v_blocks_home_about" ADD COLUMN IF NOT EXISTS "link_label_ne" varchar;
ALTER TABLE "_pages_v_blocks_home_about" ADD COLUMN IF NOT EXISTS "caption_title_ne" varchar;

ALTER TABLE "pages_blocks_search_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_search_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_search_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_search_section" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_search_section" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_search_section" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_signup_section" ADD COLUMN IF NOT EXISTS "note_ne" varchar;
ALTER TABLE "_pages_v_blocks_signup_section" ADD COLUMN IF NOT EXISTS "note_ne" varchar;

ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_hero" ADD COLUMN IF NOT EXISTS "subheading_ne" varchar;
ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_hero" ADD COLUMN IF NOT EXISTS "subheading_ne" varchar;

ALTER TABLE "pages_blocks_hero_actions" ADD COLUMN IF NOT EXISTS "label_ne" varchar;
ALTER TABLE "_pages_v_blocks_hero_actions" ADD COLUMN IF NOT EXISTS "label_ne" varchar;

ALTER TABLE "pages_blocks_rich_text" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_rich_text" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;

ALTER TABLE "pages_blocks_card_grid" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "pages_blocks_card_grid" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_card_grid" ADD COLUMN IF NOT EXISTS "intro_ne" varchar;
ALTER TABLE "_pages_v_blocks_card_grid" ADD COLUMN IF NOT EXISTS "kicker_ne" varchar;
ALTER TABLE "_pages_v_blocks_card_grid" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_card_grid" ADD COLUMN IF NOT EXISTS "intro_ne" varchar;

ALTER TABLE "pages_blocks_card_grid_cards" ADD COLUMN IF NOT EXISTS "title_ne" varchar;
ALTER TABLE "pages_blocks_card_grid_cards" ADD COLUMN IF NOT EXISTS "description_ne" varchar;
ALTER TABLE "_pages_v_blocks_card_grid_cards" ADD COLUMN IF NOT EXISTS "title_ne" varchar;
ALTER TABLE "_pages_v_blocks_card_grid_cards" ADD COLUMN IF NOT EXISTS "description_ne" varchar;

ALTER TABLE "pages_blocks_gallery" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_gallery" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;

ALTER TABLE "pages_blocks_gallery_images" ADD COLUMN IF NOT EXISTS "caption_ne" varchar;
ALTER TABLE "_pages_v_blocks_gallery_images" ADD COLUMN IF NOT EXISTS "caption_ne" varchar;

ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "body_ne" varchar;
ALTER TABLE "pages_blocks_cta" ADD COLUMN IF NOT EXISTS "button_label_ne" varchar;
ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "body_ne" varchar;
ALTER TABLE "_pages_v_blocks_cta" ADD COLUMN IF NOT EXISTS "button_label_ne" varchar;

ALTER TABLE "pages_blocks_reviews_block" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_reviews_block" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;

ALTER TABLE "pages_blocks_posts_block" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_posts_block" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;

ALTER TABLE "pages_blocks_offers_block" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;
ALTER TABLE "_pages_v_blocks_offers_block" ADD COLUMN IF NOT EXISTS "heading_ne" varchar;

ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "question_ne" varchar;
ALTER TABLE "faqs" ADD COLUMN IF NOT EXISTS "answer_ne" varchar;

-- Record it, so the next deploy's `payload migrate` knows it has been applied.
INSERT INTO "payload_migrations" ("name", "batch")
SELECT '20260910_140000_bilingual_sections',
       (SELECT COALESCE(MAX("batch"), 0) + 1 FROM "payload_migrations")
WHERE NOT EXISTS (
  SELECT 1 FROM "payload_migrations"
  WHERE "name" = '20260910_140000_bilingual_sections'
);

COMMIT;

-- Check it worked: this lists every Nepali column on the section tables.
-- SELECT table_name, column_name
-- FROM information_schema.columns
-- WHERE table_schema = 'public'
--   AND (table_name LIKE 'pages_blocks_%' OR table_name LIKE '\_pages\_v\_blocks\_%' ESCAPE '\')
--   AND column_name LIKE '%\_ne' ESCAPE '\'
-- ORDER BY table_name, column_name;
