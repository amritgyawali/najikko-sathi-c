# Najikko Sathi Media Pvt. Ltd.

Website for Najikko Sathi Media Pvt. Ltd., built with Next.js 16, React 19 and
TypeScript, with a full admin dashboard powered by [Payload CMS 3](https://payloadcms.com)
running inside the same app.

- Public site: `/`
- Admin dashboard: `/admin`

## What the dashboard controls

| Area | Where in the dashboard |
| --- | --- |
| Traffic stats, top pages, content counts | Dashboard home |
| News, blogs, commentary, investigations | Content → Posts |
| Promotions and packages | Content → Offers |
| Client testimonials, with an approval queue | Content → Reviews |
| New website pages, built from layout blocks | Content → Pages |
| Photos and files | Content → Media |
| Homepage copy and imagery | Site → Homepage |
| Navbar links, order and header button | Site → Navigation |
| Website colours, corner radius, heading font | Site → Appearance |
| Footer columns and links | Site → Footer |
| Company name, address, phones, VAT, SEO | Site → Site Settings |
| Dashboard accounts and roles | Administration → Users |

### Roles

| Role | Can do |
| --- | --- |
| **Administrator** | Everything, including branding and user management |
| **Editor** | All content, plus navigation, footer, homepage and site settings |
| **Author** | Create posts, and edit only their own |

Access rules live in `cms/access.ts` and are enforced by Payload on every entry
point (admin panel, REST and GraphQL alike).

## Local setup

You need a Postgres database. [Neon](https://neon.tech), [Supabase](https://supabase.com)
and Vercel Postgres all have a free tier that comfortably fits this site.

```bash
npm install
cp .env.example .env      # then fill in PAYLOAD_SECRET and DATABASE_URI
npm run migrate           # create the database schema
SEED_ADMIN_PASSWORD='choose-a-strong-password' npm run seed
npm run dev
```

`npm run seed` loads the site's existing copy into the CMS and creates the first
administrator, so the dashboard opens pre-filled rather than blank. It is safe
to re-run; the administrator is only created when no user exists yet.

Open <http://localhost:3000/admin> and sign in with the seeded account.

## Deploying to Vercel

Set these environment variables in the Vercel project:

| Variable | Notes |
| --- | --- |
| `PAYLOAD_SECRET` | Any long random string (`openssl rand -base64 32`) |
| `DATABASE_URI` | Postgres connection string |
| `BLOB_READ_WRITE_TOKEN` | From Vercel → Storage → Blob. Required for uploads: Vercel's filesystem is read-only |
| `NEXT_PUBLIC_SERVER_URL` | The production URL |

`npm run build` runs pending migrations first, so a deploy applies schema
changes automatically. After changing anything in `cms/`, generate a migration
and commit it:

```bash
npm run migrate:create my_change
npm run generate:types
```

## Troubleshooting

**`npm run migrate` (or `npm run build`) appears to hang.**
Running `npm run dev` pushes the schema directly and records a marker row named
`dev` in the `payload_migrations` table. `payload migrate` does not terminate
while that row is present. Production databases never have it, since `next dev`
is not run against them. If you share one database between `npm run dev` and
`npm run build` locally, clear the marker first:

```sql
DELETE FROM payload_migrations WHERE name = 'dev';
```

**A page takes several seconds and shows the old, built-in content.**
The CMS is unreachable, so the site fell back to `app/(frontend)/_data/site.ts`
(see below). Check `DATABASE_URI` and that the database is reachable; the server
log will contain `[cms] could not connect, serving fallback content`.

## Content safety net

The site reads its content from Payload but falls back to the copy checked into
`app/(frontend)/_data/site.ts` whenever the CMS is unreachable or not yet
configured — see `lib/content.ts`. This means the website keeps rendering
exactly as it does today if the database is down or before it has been set up,
rather than showing an error page.

## Analytics

Page views are recorded by `app/(frontend)/track/route.ts` into the `pageviews`
collection: path, referring host and a coarse device class only. No cookies and
nothing that identifies a visitor, so no consent banner is required. The
dashboard summary is `cms/components/DashboardStats.tsx`.

## Reviews from visitors

The `reviews` collection accepts public submissions (`POST /api/reviews`), but
`approved` and `featured` are locked to staff, so nothing reaches the website
until someone approves it in the dashboard.

## Quality checks

```bash
npm run lint
npm run build
```

## Project structure

- `app/(frontend)/` - the public website
- `app/(payload)/` - the admin dashboard and Payload REST/GraphQL routes
- `cms/` - collections, globals, blocks and access control
- `lib/content.ts` - CMS reads, with the static fallback
- `migrations/` - database migrations (commit these)
- `payload.config.ts` - CMS configuration
- `Najik.docx` - source document for mission, services and Right Sanchar content

## Image credit

Hero photograph: [Lipot Repaszky on Pexels](https://www.pexels.com/photo/himalayas-at-dawn-23022578/), used under the [Pexels license](https://www.pexels.com/license/).
