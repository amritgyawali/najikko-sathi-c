import * as migration_20260905_071624_initial from './20260905_071624_initial';
import * as migration_20260905_081428_add_services_and_tools from './20260905_081428_add_services_and_tools';

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
];
