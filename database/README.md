# database/

Plain SQL, one file per database change, for running by hand in the **Supabase
SQL editor**.

Everything here is a second copy of what `migrations/` already does. The site
applies its own schema changes on deploy — `npm run build` runs
`payload migrate` before it builds — so these files exist for the case where you
would rather see the statements, run them yourself, and know the database is
ready before anything ships.

## How to run one

1. Open the Supabase project → **SQL Editor** → **New query**.
2. Paste the whole file.
3. **Run**.

Run them in filename order. The names match the migration they mirror, so
`20260910_121000_social_work_pages.sql` is the SQL half of
`migrations/20260910_121000_social_work_pages.ts`.

## What every file guarantees

- **Safe to run twice.** Columns use `ADD COLUMN IF NOT EXISTS`, indexes use
  `CREATE INDEX IF NOT EXISTS`, and any backfill only touches rows that have not
  been filled in yet. Running a file a second time changes nothing.
- **All or nothing.** Each file is wrapped in `BEGIN` / `COMMIT`, so a statement
  that fails halfway leaves the database exactly as it was.
- **It records itself.** The last statement writes the migration's name into
  `payload_migrations`, which is how `payload migrate` knows it has already been
  applied. Without it the next deploy would run the same change again — harmless,
  because of the guards above, but the two would disagree about what has
  happened.

## Row level security

Every table in this database has row level security enabled and the Supabase
browser roles (`anon`, `authenticated`) revoked, so nothing can read or write
around Payload's own access rules. A file that **adds a table** must do the same
for it, following `migrations/20260905_110000_secure_cms_tables.ts`. A file that
only adds columns to tables that already exist needs nothing: the table's
existing rules cover them.

## Files

| File | What it does |
| --- | --- |
| `20260910_120000_add_nepali_page_copy.sql` | The optional Nepali half of every band in Site → Homepage & page copy |
| `20260910_121000_social_work_pages.sql` | An address and a short description for every social work entry, so each one gets a page of its own |
