import * as migration_20260905_071624_initial from './20260905_071624_initial';

export const migrations = [
  {
    up: migration_20260905_071624_initial.up,
    down: migration_20260905_071624_initial.down,
    name: '20260905_071624_initial'
  },
];
