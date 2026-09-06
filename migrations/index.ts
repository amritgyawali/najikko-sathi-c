import * as migration_20260905_071624_initial from './20260905_071624_initial';
import * as migration_20260905_081428_add_services_and_tools from './20260905_081428_add_services_and_tools';
import * as migration_20260905_110000_secure_cms_tables from './20260905_110000_secure_cms_tables';
import * as migration_20260905_140000_navbar_our_work from './20260905_140000_navbar_our_work';
import * as migration_20260905_145200_add_account_approval from './20260905_145200_add_account_approval';
import * as migration_20260905_184631_add_leadership_and_social_responsibility from './20260905_184631_add_leadership_and_social_responsibility';
import * as migration_20260906_060756_add_page_sections from './20260906_060756_add_page_sections';
import * as migration_20260906_060900_secure_page_section_tables from './20260906_060900_secure_page_section_tables';
import * as migration_20260906_062914_add_page_noindex from './20260906_062914_add_page_noindex';
import * as migration_20260906_090000_page_media_uploads from './20260906_090000_page_media_uploads';
import * as migration_20260906_110000_import_website_pages from './20260906_110000_import_website_pages';
import * as migration_20260906_120908_add_content_placements from './20260906_120908_add_content_placements';
import * as migration_20260906_121056_move_faq_placements from './20260906_121056_move_faq_placements';

export const migrations = [
  {
    up: migration_20260905_071624_initial.up,
    down: migration_20260905_071624_initial.down,
    name: '20260905_071624_initial',
  },
  {
    up: migration_20260905_081428_add_services_and_tools.up,
    down: migration_20260905_081428_add_services_and_tools.down,
    name: '20260905_081428_add_services_and_tools',
  },
  {
    up: migration_20260905_110000_secure_cms_tables.up,
    down: migration_20260905_110000_secure_cms_tables.down,
    name: '20260905_110000_secure_cms_tables',
  },
  {
    up: migration_20260905_140000_navbar_our_work.up,
    down: migration_20260905_140000_navbar_our_work.down,
    name: '20260905_140000_navbar_our_work',
  },
  {
    up: migration_20260905_145200_add_account_approval.up,
    down: migration_20260905_145200_add_account_approval.down,
    name: '20260905_145200_add_account_approval',
  },
  {
    up: migration_20260905_184631_add_leadership_and_social_responsibility.up,
    down: migration_20260905_184631_add_leadership_and_social_responsibility.down,
    name: '20260905_184631_add_leadership_and_social_responsibility',
  },
  {
    up: migration_20260906_060756_add_page_sections.up,
    down: migration_20260906_060756_add_page_sections.down,
    name: '20260906_060756_add_page_sections',
  },
  {
    up: migration_20260906_060900_secure_page_section_tables.up,
    down: migration_20260906_060900_secure_page_section_tables.down,
    name: '20260906_060900_secure_page_section_tables',
  },
  {
    up: migration_20260906_062914_add_page_noindex.up,
    down: migration_20260906_062914_add_page_noindex.down,
    name: '20260906_062914_add_page_noindex',
  },
  {
    up: migration_20260906_090000_page_media_uploads.up,
    down: migration_20260906_090000_page_media_uploads.down,
    name: '20260906_090000_page_media_uploads',
  },
  {
    up: migration_20260906_110000_import_website_pages.up,
    down: migration_20260906_110000_import_website_pages.down,
    name: '20260906_110000_import_website_pages',
  },
  {
    up: migration_20260906_120908_add_content_placements.up,
    down: migration_20260906_120908_add_content_placements.down,
    name: '20260906_120908_add_content_placements',
  },
  {
    up: migration_20260906_121056_move_faq_placements.up,
    down: migration_20260906_121056_move_faq_placements.down,
    name: '20260906_121056_move_faq_placements'
  },
];
