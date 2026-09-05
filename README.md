# Najikko Sathi Media Pvt. Ltd.

A responsive Next.js 16, React 19, and TypeScript website for Najikko Sathi Media in
Anamnagar, Kathmandu. The original homepage palette, typography, and visual language are
shared across all pages.

Content is managed through a full admin dashboard powered by
[Payload CMS 3](https://payloadcms.com), which runs inside this same app.

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
npm ci
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

**`npm run check:site` fails on navigation assertions.**
It verifies the site against the default navigation, so run it with the CMS at its
seeded state. Editing Navigation in the dashboard, or publishing a page with
"show in navigation" enabled, changes the menu the script asserts against.

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

## Pages

All navbar items navigate to separate pages: `/`, `/about`, `/services`, `/production`, `/training`, `/right-sanchar`, and `/contact`. Each of the 16 services has a statically generated `/services/[slug]` page with its own scope, preparation guidance, workflow, FAQs, related services, and contact link.

The portfolio covers four production services, five social media services, five training programs, and two research and development services. The source is retained in `docs/Service_Portfolio_Overview.pdf`.

## Quality checks

```bash
npm run lint
npm run build
npx playwright install chromium
npm run check:site
```

The browser installation is only needed once per machine. `check:site` starts a production server on port 3100, checks all 23 pages at desktop and mobile widths, checks internal destinations and anchors, renders all social preview images, and exercises navigation history, the mobile menu, FAQs, and inquiry validation. Screenshots go to ignored `tmp/site-check/`. Set `CHECK_BASE_URL` to test an already running preview. No email is sent during checks.

## Owner-managed photos and videos

Media sections start with clearly labeled placeholders. Add approved files to `public/media/` and configure the corresponding page in `app/_data/media.ts`. Follow [the media setup guide](docs/MEDIA-SETUP.md) for photo captions, accessible videos, and publication metadata.

There is no public upload feature. Initial media setup and any future changes require repository write access and a deployment. Videos are not represented as published work or included in video structured data until actual media is configured.

## Contact behavior

The inquiry form opens an email draft in the visitor's configured email application. It does not send email itself or store submitted data. Service links preselect the relevant topic. Direct phone and email links remain available.

## SEO and publication

- Every page has a unique title, description, canonical URL, Open Graph metadata, Twitter card metadata, and generated social preview image.
- Structured data describes the organization, website, breadcrumbs, actual services, and configured videos. No reviews, ratings, clients, or results are invented.
- `/sitemap.xml` lists all 23 pages. `/robots.txt` allows public content to be crawled and identifies the sitemap.
- Main content is rendered in the initial HTML. Unknown service URLs return 404. Images use responsive sizing, and videos load only when needed.
- The canonical origin comes from `business.website` in `app/_data/site.ts`, currently `https://najikkosathi.com`. Update it before deployment if the production domain changes.

After deployment, verify the production domain serves the new pages, submit the sitemap in your own Google Search Console property, and monitor indexing and search performance. A Git push updates the repository; deployment depends on the hosting integration configured for this repository.

SEO improves crawlability and understanding; it does not guarantee indexing or a #1 ranking. Continue publishing useful original material and approved project media. See Google's [SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide).

## Project structure

The public website lives in the `app/(frontend)/` route group; the dashboard and its
API live in `app/(payload)/`.

- `app/(frontend)/_components/` - Shared navigation, footer, page sections, structured data, and inquiry form
- `app/(frontend)/_data/site.ts` - Business identity, contact information, navigation, and footer links
- `app/(frontend)/_data/services.ts` - The 16 service definitions and detail content
- `app/(frontend)/_data/media.ts` - Owner-managed photo and video slots
- `app/(frontend)/_lib/seo.ts` - Canonical URLs, metadata, and organization data
- `app/(frontend)/pages.css` - Interior page design and responsive styles
- `app/(frontend)/services/[slug]/page.tsx` - Generated service detail pages
- `app/(payload)/` - The admin dashboard and Payload REST/GraphQL routes
- `cms/` - Collections, globals, blocks, and access control
- `lib/content.ts` - CMS reads, with the static fallback
- `migrations/` - Database migrations (commit these)
- `payload.config.ts` - CMS configuration
- `scripts/check-site.mjs` - Production route and browser verification
- `Najik.docx` - Original business source document

## Image credit

Hero photograph: [Lipot Repaszky on Pexels](https://www.pexels.com/photo/himalayas-at-dawn-23022578/), used under the [Pexels license](https://www.pexels.com/license/). This landscape is illustrative and is not presented as company project photography.
