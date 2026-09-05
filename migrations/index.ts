import * as migration_20260905_071624_initial from './20260905_071624_initial';
import * as migration_20260905_081428_add_services_and_tools from './20260905_081428_add_services_and_tools';
import * as migration_20260905_110000_secure_cms_tables from './20260905_110000_secure_cms_tables';
import * as migration_20260905_140000_navbar_our_work from './20260905_140000_navbar_our_work';

export const migrations = [
  {
    up: migration_20260905_071624_initial.up,
    down: migration_20260905_071624_initial.down,
    name: '20260905_071624_initial',
  },
  {
    up: migration_20260905_081428_add_services_and_tools.up,
    down: migration_20260905_081428_add_services_and_tools.down,
    name: '20260905_081428_add_services_and_tools'
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
];
